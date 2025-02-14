'use server';

import {ERROR_CODES} from "@/utils/errorMessage";

export async function signupAction(formData:FormData){
    const userId=formData.get('userId') as string;
    const userPassword = formData.get('userPassword') as string;
    if(!userId || !userPassword){
        return {
            code:ERROR_CODES.VALIDATION_ERROR,
            message:'아이디 비밀번호를 입력해주세요.'
        }
    }
    try{

    }catch(error){

    }
}