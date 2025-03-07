import crypto from "crypto";
import {AdminClient} from "@/utils/supabase/admin";
import {createClient} from "@/utils/supabase/server";
import {States} from "@/lib/types";
import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'fileUpload') {
        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    }

    const formData = await request.formData();
    const file = formData.get('files[0]') as File | null;
    if (!file) {
        return NextResponse.json(
            { success: false, error: 'No file uploaded' },
            { status: 400 }
        );
    }

    try {
        const result = await uploadImage(file);
        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred'
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
async function uploadImage(file: File): Promise<States>  {
    const supabase = AdminClient();
    const supabaseClient = await createClient()
    const { data : { user }} = await supabaseClient.auth.getUser()
    try{
        if (!user) {
            return { success: false, data: '', error: '사용자 인증 실패: 사용자 정보를 찾을 수 없습니다.' };
        }

        const fileName = `${Date.now()}_${crypto.randomUUID()}`;
        const { error: uploadError } = await supabase.storage
            .from('store')
            .upload(fileName, file)

        if (uploadError) {
            return { success: false, data: '', error: '이미지 업로드 실패: ' + uploadError.message };
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
            .from('store')
            .getPublicUrl(fileName);


        return { success: true, data: publicUrl, error: '' };
    } catch(error: unknown) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred';
        return { success: false, data: '', error: errorMessage };
    }
}