'use server'
import { createClient } from "@/utils/supabase/server";
import { ERROR_CODES } from "@/utils/errorMessage";
import { FormState } from "@/components/ui/form";

// 특정 포스트 상세 정보 가져오기
export async function getPostDetail(id: string) {
    if (!id) {
        return { success: false, error: "포스트 ID가 필요합니다." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    try {
        const { data, error } = await supabase
            .from('store')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('포스트 상세 조회 오류:', error);
            return { success: false, error: "포스트를 불러오는 중 오류가 발생했습니다." };
        }

        if (!data) {
            return { success: false, error: "해당 포스트를 찾을 수 없습니다." };
        }

        // 이미지 파싱
        let parsedImages = [];
        try {
            if (data.images && typeof data.images === 'string' && data.images !== '[]') {
                parsedImages = JSON.parse(data.images);
            }
        } catch (e) {
            console.error(`이미지 파싱 오류 (store ID: ${id}):`, e);
        }

        return {
            success: true,
            data: {
                ...data,
                images: parsedImages
            }
        };
    } catch (error) {
        console.error('포스트 상세 처리 오류:', error);
        return { success: false, error: "데이터 처리 중 오류가 발생했습니다." };
    }
}

// 포스트 수정하기
export async function updatePost(formData: FormData): Promise<FormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인 후 이용해주세요.'
        };
    }

    try {
        // 폼 데이터에서 필드 추출
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const desc = formData.get('desc') as string;
        const address = formData.get('address') as string;
        const contents = formData.get('contents') as string;
        const mainImage = formData.get('mainImage') as string;
        const imagesStr = formData.get('images') as string;
        const rating = parseFloat(formData.get('rating') as string) || 0;

        // 필수 필드 유효성 검사
        if (!id || !name || !address || !desc) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '필수 정보가 누락되었습니다.'
            };
        }

        // 포스트 소유권 확인
        const { data: post, error: getError } = await supabase
            .from('store')
            .select('user_id')
            .eq('id', id)
            .single();

        if (getError || !post) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '포스트를 찾을 수 없습니다.'
            };
        }

        if (post.user_id !== user.id) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '해당 포스트를 수정할 권한이 없습니다.'
            };
        }

        // 이미지 URL 배열 처리
        let imageUrls: string[] = [];
        try {
            if (imagesStr && imagesStr !== '[]') {
                imageUrls = JSON.parse(imagesStr);
            }
        } catch (err) {
            console.error("이미지 URL 파싱 오류:", err);
        }

        // 포스트 업데이트
        const { error: updateError } = await supabase
            .from('store')
            .update({
                name: name,
                desc:desc,
                address: address,
                detail: contents,
                mainimage: mainImage || null,
                images: JSON.stringify(imageUrls),
                star: rating
            })
            .eq('id', id);

        if (updateError) {
            console.error("포스트 업데이트 오류:", updateError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '포스트 수정 중 오류가 발생했습니다.'
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '포스트가 성공적으로 수정되었습니다.',
        };
    } catch (error) {
        console.error("서버 오류:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        };
    }
}

// 포스트 삭제하기
export async function deletePost(id: string) {
    if (!id) {
        return { success: false, error: "포스트 ID가 필요합니다." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    try {
        // 포스트 소유권 확인
        const { data: post, error: getError } = await supabase
            .from('store')
            .select('user_id')
            .eq('id', id)
            .single();

        if (getError || !post) {
            return { success: false, error: "포스트를 찾을 수 없습니다." };
        }

        if (post.user_id !== user.id) {
            return { success: false, error: "해당 포스트를 삭제할 권한이 없습니다." };
        }

        // 포스트 삭제
        const { error: deleteError } = await supabase
            .from('store')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error("포스트 삭제 오류:", deleteError);
            return { success: false, error: "포스트 삭제 중 오류가 발생했습니다." };
        }

        return { success: true };
    } catch (error) {
        console.error("포스트 삭제 처리 오류:", error);
        return { success: false, error: "데이터 처리 중 오류가 발생했습니다." };
    }
}