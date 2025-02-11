'use server'
import {createClient} from "@/utils/supabase/server";
import {ERROR_CODES} from "@/utils/errorMessage";

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const supabase = await createClient();


    if (!email || !password) {
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'이메일과 패스워드가 필요합니다.'
        }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options:{
            data:{
                role:'user',
            }
        }
    });

    if(error){
        return{
            code:ERROR_CODES.DB_ERROR,
            message:'회원가입중 에러가 발생하였습니다.'
        }
    }
    return {
        code:ERROR_CODES.SUCCESS,
        message:'회원가입 되었습니다.'
    }
};