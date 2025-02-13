'use server'
import {ERROR_CODES} from "@/utils/errorMessage";
import {FormState} from "@/components/ui/form";

export async function signin(formData:FormData):Promise<FormState>{
    const userId = formData.get('userId') as string;
    const userPassword = formData.get('userPassword') as string;
    if(!userId || !userPassword){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'아이디와 비밀번호를 입력해주세요.'
        }
    }
    try{

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