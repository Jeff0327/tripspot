'use server';

import {ERROR_CODES} from "@/utils/errorMessage";
import {FormState} from "@/components/ui/form";
import {createClient} from "@/utils/supabase/server";
import {AdminClient} from "@/utils/supabase/admin";
import {isValidEmail} from "@/lib/utils";

export async function signupAction(formData:FormData):Promise<FormState>{
    const userId=formData.get('userId') as string;
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
        const { data , error } = await supabase.auth.signUp({
            email:userId,
            password:userPassword,
            options:{
                data:{
                    role:'user',
                }
            }
        });
        if(error){
            return {
                code:ERROR_CODES.AUTH_ERROR,
                message:'아이디 비밀번호를 확인해주세요.'
            }
        }else{
            const admin = AdminClient();

            const {error} = await admin.from('users').insert({
                loginType:typeUser||'',user_id:userId,password:userPassword,nickname
            })
            if(error){
                return {
                    code:ERROR_CODES.DB_ERROR,
                    message:'DB에러가 발생하였습니다.'
                }
            }

            return {
                code:ERROR_CODES.SUCCESS,
                message:'회원가입이 되었습니다.',
                redirect:'/main'
            }
        }


    }catch(error){
        console.log(error)
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:'서버에러가 발생하였습니다.'
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