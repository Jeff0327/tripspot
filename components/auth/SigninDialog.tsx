'use client'
import React from 'react';
import {
    CustomDialogContent,
    CustomDialogHeader,
    Dialog,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/CustomDialog";
import Link from "next/link";
import {CustomInput} from "@/components/ui/CustomInput";
import FormContainer, {FormState} from "@/components/ui/form";
import {signin} from "@/app/(main)/(modal)/login/actions";
import {ERROR_CODES} from "@/utils/errorMessage";
import {useRouter} from "next/navigation";


export default function SigninDialog({
                                         isOpen
                                     }: {
    isOpen: boolean
}) {
    const router= useRouter()
    const handleResult=(formState:FormState)=>{
        if(formState.code===ERROR_CODES.SUCCESS){
            router.push(formState.redirect || '/main')
        }else{

        }
    }
    return (
        <Dialog open={isOpen}>
            <CustomDialogContent className={'rounded-md'}>
                <CustomDialogHeader>
                    <DialogTitle>로그인</DialogTitle>
                    <FormContainer action={signin} onResult={handleResult}>
                    <DialogDescription className={'flex flex-col gap-2 justify-center items-center py-8'}>
                        <CustomInput name={'userId'} type={'text'} placeholder={'아이디를 입력해주세요.'}/>
                        <CustomInput name={'userPassword'} type={'password'} placeholder={'비밀번호를 입력해주세요.'}/>
                        <button type={'submit'} className={'bg-black text-white w-full rounded-sm py-2'}>로그인</button>
                    </DialogDescription>
                    </FormContainer>
                </CustomDialogHeader>
                <Link href={'/signup?isOpen=true'}
                      className={'flex font-semibold justify-center items-center text-xs underline'}>
                    계정이 없으신가요?
                </Link>
            </CustomDialogContent>
        </Dialog>
    );
}