'use client'
import React, { useRef } from 'react';
import { checkId, signupAction, verifyBusinessNumber } from "@/app/(main)/(modal)/signup/actions";
import { CustomInput } from "@/components/ui/CustomInput";
import { Button } from "@/components/ui/button";
import FormContainer, { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/errorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";

function BossSignupForm() {
    const { notify } = useAlert();
    const router = useRouter();

    // 필수 확인 상태만 useState로 관리
    const [isIdChecked, setIsIdChecked] = React.useState(false);
    const [isBusinessInfoChecked, setIsBusinessInfoChecked] = React.useState(false);

    // ref를 사용하여 폼 요소에 접근
    const formRef = useRef(null);

    const signupResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success(formState.message);
            router.push('/main');
        } else {
            notify.failure(formState.message);
        }
    }

    const handleIdCheck = async () => {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const userId = formData.get('userId') as string;

        if (!userId) {
            notify.failure('아이디를 입력해주세요.');
            return;
        }

        const idCheckData = new FormData();
        idCheckData.append('userId', userId);

        const result = await checkId(idCheckData);

        if (result.code === ERROR_CODES.SUCCESS) {
            setIsIdChecked(true);
            notify.success('사용할 수 있는 아이디입니다.');
        } else {
            setIsIdChecked(false);
            notify.failure('사용할 수 없는 아이디입니다.');
        }
    }

    const handleBusinessInfoCheck = async () => {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const businessNumber = formData.get('businessNumber') as string;
        const startDate = formData.get('startDate') as string;
        const ownerName = formData.get('ownerName') as string;

        // 필수 입력값 검증
        if (!businessNumber || businessNumber.length !== 10) {
            notify.failure('사업자 번호는 10자리 숫자여야 합니다.');
            return;
        }

        if (!startDate || startDate.length !== 8) {
            notify.failure('개업일자는 YYYYMMDD 형식으로 입력해주세요.');
            return;
        }

        if (!ownerName || ownerName.trim() === '') {
            notify.failure('대표자 성명을 입력해주세요.');
            return;
        }

        const businessInfoData = new FormData();
        businessInfoData.append('businessNumber', businessNumber);
        businessInfoData.append('startDate', startDate);
        businessInfoData.append('ownerName', ownerName);

        const result = await verifyBusinessNumber(businessInfoData);

        if (result.code === ERROR_CODES.SUCCESS) {
            setIsBusinessInfoChecked(true);

            notify.success('유효한 사업자 정보입니다.');
        } else {
            setIsBusinessInfoChecked(false);
            notify.failure(result.message);
        }
    }

    const handleIdInputChange = () => {
        setIsIdChecked(false);
    }

    const handleBusinessInfoChange = () => {
        setIsBusinessInfoChecked(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        if (!isIdChecked) {
            e.preventDefault();
            notify.failure('아이디 확인을 해주세요.');
            return;
        }

        if (!isBusinessInfoChecked) {
            e.preventDefault();
            notify.failure('사업자 정보 확인을 해주세요.');
            return;
        }
    }

    return (
        <FormContainer action={signupAction} onResult={signupResult} ref={formRef}>
            <div className={'flex flex-col min-h-[85vh] mt-[5vh] lg:mt-[10vh] gap-3 p-4 justify-between'}>
                <CustomInput type={'hidden'} name={'typeUser'} value={'boss'}/>
                <CustomInput type={'hidden'} name={'verifiedBusinessNumber'} defaultValue={''}/>
                <CustomInput type={'hidden'} name={'verifiedStartDate'} defaultValue={''}/>
                <CustomInput type={'hidden'} name={'verifiedOwnerName'} defaultValue={''}/>

                <div className={'flex flex-col gap-2'}>
                    <div className={'flex flex-col gap-2'}>
                        <CustomInput
                            name={'userId'}
                            onChange={handleIdInputChange}
                            placeholder={'사용하실 아이디(이메일형식)'}
                        />
                        <Button
                            onClick={handleIdCheck}
                            type={'button'}
                        >아이디 확인</Button>
                    </div>

                    <div className={'flex flex-col gap-2'}>
                        <CustomInput
                            name={'businessNumber'}
                            onChange={handleBusinessInfoChange}
                            placeholder={'사업자 등록 번호 (10자리)'}
                            maxLength={10}
                        />
                        <CustomInput
                            name={'startDate'}
                            onChange={handleBusinessInfoChange}
                            placeholder={'개업일자 (YYYYMMDD)'}
                            maxLength={8}
                        />
                        <CustomInput
                            name={'ownerName'}
                            onChange={handleBusinessInfoChange}
                            placeholder={'대표자 성명'}
                        />
                        <Button
                            onClick={handleBusinessInfoCheck}
                            type={'button'}
                        >사업자 정보 확인</Button>
                    </div>

                    <div className={'flex flex-col gap-2'}>
                        <CustomInput name={'userPassword'} type={'password'} placeholder={'비밀번호 입력'}/>
                        <CustomInput name={'userPasswordCheck'} type={'password'} placeholder={'비밀번호 확인'}/>
                    </div>

                    <div className={'flex flex-col gap-1'}>
                        <CustomInput name={'nickname'} placeholder={'가게명'}/>
                        <span className={'flex items-center text-xs tracking-tighter justify-end'}>📎 가게명은 이후에 수정하실 수 있습니다.</span>
                    </div>
                </div>

                <Button
                    disabled={!isIdChecked || !isBusinessInfoChecked}
                    onClick={handleSubmit}
                    type={'submit'}
                >회원가입</Button>
            </div>
        </FormContainer>
    );
}

export default BossSignupForm;