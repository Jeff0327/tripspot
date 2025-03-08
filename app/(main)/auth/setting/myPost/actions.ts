// getMyStore 서버 액션 함수
'use server'
import { createClient } from "@/utils/supabase/server";

export async function getMyStore() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    try {
        const { data, error } = await supabase
            .from('store')
            .select('*')
            .eq('user_id', user.id)
            .order('like', { ascending: false }) // 좋아요 많은 순 정렬
            .order('created_at', { ascending: false }); // 2차 정렬 기준

        if (error) {
            console.error('내 가게 목록 조회 오류:', error);
            return { success: false, error: "데이터를 불러오는 중 오류가 발생했습니다." };
        }

        // 이미지 필드 처리 (안전하게 처리)
        const processedData = data.map(store => {
            let parsedImages = [];
            try {
                if (store.images && typeof store.images === 'string' && store.images !== '[]') {
                    parsedImages = JSON.parse(store.images);
                }
            } catch (e) {
                console.error(`이미지 파싱 오류 (store ID: ${store.id}):`, e);
            }

            return {
                ...store,
                images: parsedImages
            };
        });

        return { success: true, data: processedData };
    } catch (error) {
        console.error('내 가게 목록 처리 오류:', error);
        return { success: false, error: "데이터 처리 중 오류가 발생했습니다." };
    }
}