'use server'
import {createClient} from "@/utils/supabase/server";
import {StoreWithReviews, UserData} from "@/lib/types";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/errorMessage";

export async function getRestaurant(searchTerm?: string): Promise<StoreWithReviews[]> {
    const supabase = await createClient();

    try {
        // 1. 가게 데이터 가져오기
        let query = supabase
            .from('store')
            .select('*')
            .eq('tag', 'res');

        // 검색어가 있는 경우 name 또는 desc에서 검색
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,desc.ilike.%${searchTerm}%`);
        }

        const { data: stores, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Supabase Error: ${error.message}`);
        }

        if (!stores || stores.length === 0) {
            return [];
        }

        // 2. 모든 가게 ID 목록을 수집
        const storeIds = stores.map(store => store.id);

        // 리뷰 데이터 가져오기
        const { data: reviews, error: reviewsError } = await supabase
            .from('review')
            .select(`
            id, 
            created_at, 
            store_id, 
            user_id, 
            content, 
            rating, 
            images
        `)
            .in('store_id', storeIds)
            .order('created_at', { ascending: false });

        // 사용자 정보 가져오기
        let usersMap: Record<string, UserData> = {};
        if (reviews && reviews.length > 0) {
            const userIds = [...new Set(reviews.map(review => review.user_id))];

            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, email, nickname, image_url')
                .in('id', userIds);

            if (!usersError && users) {
                usersMap = users.reduce<Record<string, UserData>>((acc, user) => {
                    acc[user.id] = {
                        email: user.email,            // 이미 email로 수정됨
                        name: user.nickname,
                        avatar_url: user.image_url
                    };
                    return acc;
                }, {});
            }
        }

        // 가게별로 리뷰 할당
        return (stores || []).map(store => {
            const storeReviews = reviews
                ? reviews.filter(review => review.store_id === store.id)
                    .map(review => {
                        const userData = usersMap[review.user_id] || {};

                        return {
                            ...review,
                            user: {
                                id: review.user_id,
                                email: userData.email || '',  // email 필드 추가
                                user_metadata: {
                                    name: userData.name || '사용자',
                                    avatar_url: userData.avatar_url ||''
                                }
                            },
                            images: review.images && typeof review.images === 'string'
                                ? JSON.parse(review.images)
                                : (Array.isArray(review.images) ? review.images : [])
                        };
                    }):[]

            return {
                ...store,
                images: store.images && store.images.length > 0 ? JSON.parse(store.images) : [],
                reviews: storeReviews || []
            };
        });
    } catch (error) {
        // 에러 로깅
        if (error instanceof Error) {
            console.error(`Fetching store error: ${error.message}`);
        }
        return [];
    }
}

export async function getOne(id:string){
    const supabase = await createClient()

    if(!id) return;
    const {data, error} = await supabase.from('store').select("*").eq('id',id).single()
    if(error) throw error;
    return data;
}
export async function writeReview(formData: FormData): Promise<FormState> {
    const supabase = await createClient();

    // 폼 데이터 추출
    const content = formData.get('content') as string;
    const images = formData.get('images') as string;
    const storeId = formData.get('storeId') as string;
    const rating = parseFloat(formData.get('rating') as string) || 0;

    // Supabase Auth에서 사용자 정보 확인
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
        return {
            code: ERROR_CODES.DB_ERROR,
            message: '로그인 후 이용해주세요.'
        }
    }

    const email = user.email;
    if (!email) {
        console.error('User email is missing');
        return {
            code: ERROR_CODES.DB_ERROR,
            message: '사용자 정보가 올바르지 않습니다.'
        }
    }

    const { data: userRecord, error: userQueryError } = await supabase
        .from('users')
        .select('id, email, nickname')
        .eq('email', email)  // email이 확실히 존재함
        .maybeSingle();

    if (!userRecord) {
        console.error('User not found in users table:', userQueryError);
        return {
            code: ERROR_CODES.DB_ERROR,
            message: '사용자 정보를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.'
        }
    }

    // 유효성 검사
    if (!content) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '리뷰를 작성해주세요.'
        }
    }

    if (!storeId) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '가게 정보가 없습니다.'
        }
    }

    // 이미지 URL 파싱
    let imageUrls: string[] = [];
    try {
        imageUrls = JSON.parse(images || '[]');
    } catch (error) {
        console.error('Failed to parse image URLs:', error);
        imageUrls = [];
    }

    // 리뷰 데이터 구성 - users 테이블의 ID 사용
    const reviewData = {
        store_id: storeId,
        user_id: userRecord.id,  // users 테이블의 ID
        content: content,
        rating: rating,
        images: imageUrls
    }

    try {
        // 리뷰 데이터 삽입
        const { error: reviewError } = await supabase
            .from('review')
            .insert(reviewData)
            .select('id')
            .single();

        if (reviewError) {
            console.error('Error inserting review:', reviewError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '리뷰 작성 중 오류가 발생했습니다.'
            }
        }

        // 가게의 평균 별점 업데이트
        const { data: reviews, error: starsError } = await supabase
            .from('review')
            .select('rating')
            .eq('store_id', storeId);

        if (!starsError && reviews) {
            const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

            const { error: updateError } = await supabase
                .from('store')
                .update({ star: avgRating })
                .eq('id', storeId);

            if (updateError) {
                console.error('Error updating store rating:', updateError);
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '리뷰가 작성되었습니다.'
        }
    } catch (error) {
        console.error('Server error during review submission:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '에러가 발생하였습니다.'
        }
    }
}
export async function addStore(formData:FormData):Promise<FormState>{
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    const content = formData.get('content') as string;
    const images = formData.get('images') as string;
    const mainImg = formData.get('mainImg') as string;
    try{

        if (!user) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '로그인 후 이용해주세요.'
            }
        }
        return {
            code:ERROR_CODES.SUCCESS,
            message:'등록되었습니다.'
        }
    }catch(error){
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:'에러가 발생하였습니다.'
        }
    }
}