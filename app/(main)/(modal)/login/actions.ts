'use server'
import {ERROR_CODES} from "@/utils/errorMessage";
import {FormState} from "@/components/ui/form";
import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";

export async function signin(formData:FormData):Promise<FormState>{
    const userId = formData.get('userId') as string;
    const userPassword = formData.get('userPassword') as string;
    const supabase = await createClient();
    if(!userId || !userPassword){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'아이디와 비밀번호를 입력해주세요.'
        }
    }
    try{

        const { error } = await supabase.auth.signInWithPassword({
            email:userId,
            password:userPassword,
        });
        if(error){
            return {
                code:ERROR_CODES.VALIDATION_ERROR,
                message:"아이디 비밀번호를 확인하세요."
            }
        }
        return {
            code:ERROR_CODES.SUCCESS,
            message:'',
            redirect:'/main'
        }
    }catch(error){
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:"서버 에러가 발생하였습니다."
        }
    }
}
export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
};