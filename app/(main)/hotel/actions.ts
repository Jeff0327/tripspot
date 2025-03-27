'use server'

import {StoreWithReviews, UserData} from "@/lib/types";
import {createClient} from "@/utils/supabase/server";

export async function getService(searchTerm?: string): Promise<StoreWithReviews[]> {
    const supabase = await createClient();

    try {
        // 1. 가게 데이터 가져오기
        let query = supabase
            .from('store')
            .select('*')
            .eq('tag', 'hotel');

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