'use client'
import React, {useState} from 'react';
import FormContainer, {FormState} from "@/components/ui/form";
import {CustomInput} from "@/components/ui/CustomInput";
import {addStore} from "@/app/(main)/food/actions";
import {ERROR_CODES} from "@/utils/errorMessage";
import {useRouter} from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";
import StarRating from "@/utils/review/StarRating";
import Editor from "@/lib/editor/Editor";

function CreateStore() {
    const { notify } = useAlert();
    const router = useRouter();
    const [rating, setRating] = useState(3);
    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
    };

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success('가게가 성공적으로 등록되었습니다.');
            router.push('/stores'); // 가게 목록 페이지로 이동
        } else {
            notify.failure(formState.message);
        }
    };
    return (
        <FormContainer
            action={addStore}
            onResult={handleResult}
        >
            <div className="space-y-4 mb-6">
                {/* 가게 이름 - 필수 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        가게 이름 <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                        name="name"
                        type="text"
                        placeholder="가게 이름을 입력해주세요"
                        required
                        className="w-full"
                    />
                </div>

                {/* 주소 - 필수 */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        주소 <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                        name="address"
                        type="text"
                        placeholder="주소를 입력해주세요"
                        required
                        className="w-full"
                    />
                </div>

                {/* 태그 - 선택 */}
                <div>
                    <CustomInput
                        name="tag"
                        type="hidden"
                        value={'res'}
                        className="w-full"
                    />
                </div>

                {/* 평점 제목 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        평점
                    </label>
                    <StarRating
                        initialRating={rating}
                        onRatingChange={handleRatingChange}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    맛집 내용
                </label>
                <Editor name={'contents'}/>
            </div>
            <button className={'flex w-full justify-center items-center py-3 bg-sky-300 my-2 text-white'} type={'submit'}>등록하기</button>
        </FormContainer>
    );
}

export default CreateStore;