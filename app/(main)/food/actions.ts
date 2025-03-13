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
            .eq('tag', 'res')
            .order('like', { ascending: false })


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
export async function addStore(formData: FormData): Promise<FormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인 후 이용해주세요.'
        }
    }

    try {
        // 폼 데이터에서 필드 추출
        const name = formData.get('name') as string;
        const desc = formData.get('desc') as string;
        const address = formData.get('address') as string;
        const addressDetail = formData.get('addressDetail') as string;
        const contents = formData.get('contents') as string;
        const mainImage = formData.get('mainImage') as string;
        const imagesStr = formData.get('images') as string;
        const rating = parseFloat(formData.get('rating') as string) || 0;

        // 필수 필드 유효성 검사
        if (!name || !address || !desc) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '맛집 이름과 주소는 필수 입력사항입니다.'
            }
        }

        // 전체 주소 구성 (기본 주소 + 상세 주소)
        const fullAddress = addressDetail ? `${address}, ${addressDetail}` : address;

        // 이미지 URL 배열 처리
        let imageUrls: string[] = [];
        try {
            if (imagesStr && imagesStr !== '[]') {
                // JSON 문자열을 파싱하여 URL 배열 가져오기
                imageUrls = JSON.parse(imagesStr);
            }
        } catch (err) {
            console.error("이미지 URL 파싱 오류:", err);
            // 파싱 오류가 있더라도 계속 진행
        }

        // store 테이블에 데이터 삽입
        const { data, error } = await supabase
            .from('store')
            .insert({
                name: name,
                address: fullAddress,
                desc:desc,
                tag: 'res',
                detail: contents,
                images: JSON.stringify(imageUrls), // URL 배열을 JSON 문자열로 저장
                mainimage: mainImage || null,
                star: rating,
                user_id: user.id
            })
            .select('id')
            .single();

        if (error) {
            console.error("DB 저장 오류:", error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '맛집 등록중 오류가 발생했습니다'
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '맛집이 등록되었습니다.',
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다';

        console.error("서버 오류:", errorMessage);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        }
    }
}

export async function addToLikes(storeId: string) {
    const supabase = await createClient();

    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            error: '로그인이 필요합니다.'
        };
    }

    try {
        // 현재 사용자의 likes 배열 가져오기
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('likes')
            .eq('id', user.id)
            .single();

        if (fetchError) {
            console.error('사용자 데이터 조회 오류:', fetchError);
            return {
                success: false,
                error: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
            };
        }

        // 현재 likes 배열
        const currentLikes = userData.likes || [];

        // 이미 찜한 가게인지 확인
        if (currentLikes.includes(storeId)) {
            return {
                success: true,
                message: '이미 찜한 가게입니다.'
            };
        }

        // 찜 목록에 가게 ID 추가
        const { error: updateError } = await supabase
            .from('users')
            .update({
                likes: [...currentLikes, storeId],
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('찜 목록 업데이트 오류:', updateError);
            return {
                success: false,
                error: '찜 목록 업데이트 중 오류가 발생했습니다.'
            };
        }

        // 가게의 like 카운트 증가
        const { error: incrementError } = await supabase.rpc('increment_store_like', {
            store_id: storeId
        });

        if (incrementError) {
            console.error('좋아요 증가 오류:', incrementError);
            // 좋아요 증가 실패해도 찜 목록 추가는 성공으로 처리
        }

        return {
            success: true,
            message: '찜 목록에 추가되었습니다.'
        };
    } catch (error) {
        console.error('찜 추가 중 오류:', error);
        return {
            success: false,
            error: '서버 오류가 발생했습니다.'
        };
    }
}

/**
 * 사용자의 찜 목록에서 가게를 제거하는 함수
 */
export async function removeFromLikes(storeId: string) {
    const supabase = await createClient();

    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            error: '로그인이 필요합니다.'
        };
    }

    try {
        // 현재 사용자의 likes 배열 가져오기
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('likes')
            .eq('id', user.id)
            .single();

        if (fetchError) {
            console.error('사용자 데이터 조회 오류:', fetchError);
            return {
                success: false,
                error: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
            };
        }

        // 현재 likes 배열
        const currentLikes = userData.likes || [];

        // 이미 찜한 가게가 아닌지 확인
        if (!currentLikes.includes(storeId)) {
            return {
                success: true,
                message: '찜 목록에 없는 가게입니다.'
            };
        }

        // 찜 목록에서 가게 ID 제거
        const { error: updateError } = await supabase
            .from('users')
            .update({
                likes: currentLikes.filter(id => id !== storeId),
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('찜 목록 업데이트 오류:', updateError);
            return {
                success: false,
                error: '찜 목록 업데이트 중 오류가 발생했습니다.'
            };
        }

        // 가게의 like 카운트 감소
        const { error: decrementError } = await supabase.rpc('decrement_store_like', {
            store_id: storeId
        });

        if (decrementError) {
            console.error('좋아요 감소 오류:', decrementError);
            // 좋아요 감소 실패해도 찜 목록 제거는 성공으로 처리
        }

        return {
            success: true,
            message: '찜 목록에서 제거되었습니다.'
        };
    } catch (error) {
        console.error('찜 제거 중 오류:', error);
        return {
            success: false,
            error: '서버 오류가 발생했습니다.'
        };
    }
}