'use client'
import React, {useState} from 'react';
import FormContainer, {FormState} from "@/components/ui/form";
import {checkId, signupAction} from "@/app/(main)/(modal)/signup/actions";
import {ERROR_CODES} from "@/utils/errorMessage";
import {CustomInput} from "@/components/ui/CustomInput";
import {Button} from "@/components/ui/button";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";

function UserSignupForm() {
    const {notify} = useAlert()
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [userId, setUserId] = useState('');
    const router = useRouter()
    const signupResult=(formState:FormState)=>{
        if(formState.code===ERROR_CODES.SUCCESS){
            notify.success(formState.message)
            router.push('/main')
        }else{
            notify.failure(formState.message)
        }
    }
    const handleIdCheck = async () => {
        const formData = new FormData();
        formData.append('userId', userId);

        const result = await checkId(formData);

        if (result.code === ERROR_CODES.SUCCESS) {
            setIsIdChecked(true);
            notify.success('사용할 수 있는 아이디입니다.')
        } else {
            setIsIdChecked(false);
            notify.failure('사용할 수 없는 아이디입니다.')
        }
    }

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(e.target.value);
        setIsIdChecked(false);
    }
    const handleSubmit = (e: React.FormEvent) => {
        if (!isIdChecked) {
            e.preventDefault();
            notify.failure('아이디 확인을 해주세요.')
        }
    }
    return (
        <FormContainer action={signupAction} onResult={signupResult}>
            <div className={'flex flex-col min-h-[85vh] mt-[5vh] lg:mt-[10vh] gap-3 p-4 justify-between'}>
                <CustomInput type={'hidden'} name={'typeUser'} value={'user'}/>
                <div className={'flex flex-col gap-2'}>
                    <div className={'flex flex-col gap-2'}>
                        <CustomInput name={'userId'} value={userId} onChange={handleIdChange} placeholder={'사용하실 아이디(이메일형식)'}/>
                        <Button disabled={!userId} onClick={handleIdCheck} type={'button'}>아이디 확인</Button>
                    </div>
                    <div className={'flex flex-col gap-2'}>
                        <CustomInput name={'userPassword'} type={'password'} placeholder={'비밀번호 입력'}/>
                        <CustomInput name={'userPasswordCheck'} type={'password'} placeholder={'비밀번호 확인'}/>
                    </div>
                    <div className={'flex flex-col gap-1'}>
                        <CustomInput name={'nickname'} placeholder={'나의 닉네임'}/>
                        <span className={'flex items-center text-xs tracking-tighter justify-end'}>📎 닉네임은 이후에 수정하실 수 있습니다.</span>
                    </div>
                </div>
                <Button disabled={!isIdChecked} onClick={handleSubmit} type={'submit'}>회원가입</Button>
            </div>
        </FormContainer>
    );
}

export default UserSignupForm;