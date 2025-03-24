'use server';

import {ERROR_CODES} from "@/utils/errorMessage";
import {FormState} from "@/components/ui/form";
import {createClient} from "@/utils/supabase/server";
import {AdminClient} from "@/utils/supabase/admin";
import {isValidEmail} from "@/lib/utils";


export async function signupAction(formData:FormData):Promise<FormState>{
    const userId = formData.get('userId') as string;
    const userPassword = formData.get('userPassword') as string;
    const userPasswordCheck = formData.get('userPasswordCheck') as string;
    const typeUser = formData.get('typeUser') as string;
    const nickname = formData.get('nickname') as string;
    const supabase = await createClient();

    if(!typeUser){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'잘못된 접근입니다.'
        }
    }

    if(!userId || !userPassword || !userPasswordCheck || !nickname){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'아이디 비밀번호 닉네임을 입력해주세요.'
        }
    }
    if(userPassword!==userPasswordCheck){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'비밀번호가 일치하지 않습니다.'
        }
    }

    try{
        // Supabase Auth로 사용자 생성
        const { data, error } = await supabase.auth.signUp({
            email: userId,
            password: userPassword,
            options:{
                data:{
                    role: 'user',
                    nickname: nickname  // Auth 메타데이터에도 닉네임 저장
                }
            }
        });

        if(error){
            return {
                code:ERROR_CODES.AUTH_ERROR,
                message:'회원가입 중 오류가 발생했습니다: ' + error.message
            }
        }

        // Auth 사용자 ID 가져오기
        const authUserId = data.user?.id;

        if(!authUserId) {
            return {
                code:ERROR_CODES.AUTH_ERROR,
                message:'사용자 ID를 가져올 수 없습니다.'
            }
        }

        const admin = AdminClient();
        const { error: insertError } = await admin.from('users').insert({
            id: authUserId,
            email: userId,
            nickname: nickname,
            loginType: typeUser || '',
        });

        if(insertError){
            // 프로필 정보 저장 실패 시 생성된 Auth 사용자도 삭제하는 것이 좋음
            await admin.auth.admin.deleteUser(authUserId);

            return {
                code:ERROR_CODES.DB_ERROR,
                message:'사용자 정보 저장 중 오류가 발생했습니다.'
            }
        }

        return {
            code:ERROR_CODES.SUCCESS,
            message:'회원가입이 완료되었습니다.',
            redirect:'/main'
        }
    } catch(error) {
        console.error('회원가입 오류:', error);
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:'서버 오류가 발생했습니다.'
        }
    }
}
export async function checkId(formData:FormData){
    const userId=formData.get('userId') as string;
    if(!userId){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'아이디를 입력해주세요.'
        }
    }
    try{

        if(!isValidEmail(userId)) {
            return {
                code:ERROR_CODES.VALIDATION_ERROR,
                message:'올바른 이메일 형식이 아닙니다.'
            }
        }

        return {
            code:ERROR_CODES.SUCCESS,
            message:'사용할 수 있는 아이디 입니다.'
        }
    }catch(error){
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:'서버 에러가 발생하였습니다.'
        }
    }
}