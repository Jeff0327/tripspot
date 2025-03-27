'use client'
import React, { useRef, useState } from 'react';
import FormContainer, { FormState } from "@/components/ui/form";
import { CustomInput } from "@/components/ui/CustomInput";
import { ERROR_CODES } from "@/utils/errorMessage";
import { useRouter } from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";
import StarRating from "@/utils/review/StarRating";
import Editor from "@/lib/editor/Editor";
import Image from "next/image";
import AddressSearch from "@/utils/address/AddressSearch";

// addStore 액션을 props로 받도록 타입 정의
interface CreateStoreProps {
    baseUrl: string;
    addStoreAction: (formData: FormData) => Promise<FormState>;
}

function CreateStore({ baseUrl, addStoreAction }: CreateStoreProps) {
    const { notify } = useAlert();
    const router = useRouter();
    const [rating, setRating] = useState(3);
    const [mainImage, setMainImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [address, setAddress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
    };

    const handleAddressChange = (newAddress: string) => {
        setAddress(newAddress);
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 미리보기 이미지 설정
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // 이미지 업로드 요청
            const formData = new FormData();
            formData.append('files[0]', file);

            const response = await fetch('/api/upload/?action=fileUpload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data) {
                setMainImage(result.data);
                notify.success('대표 이미지가 업로드되었습니다.');
            } else {
                console.error("업로드 실패:", result.error || "알 수 없는 오류");
                notify.failure('이미지 업로드 실패: ' + (result.error || "알 수 없는 오류"));
            }
        } catch (error) {
            console.error("업로드 에러:", error);
            notify.failure('이미지 업로드 중 오류가 발생했습니다.');
        }
    };

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success('가게가 성공적으로 등록되었습니다.');
            router.push(`/${baseUrl}`); // 가게 목록 페이지로 이동
        } else {
            notify.failure(formState.message);
        }
    };

    return (
        <FormContainer
            action={addStoreAction} // 이제 props로 받은 액션을 사용합니다
            onResult={handleResult}
        >
            <div className="space-y-4 mb-6">
                <input name='tag' value={baseUrl} type={'hidden'}/>
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
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        가게 특징 <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                        name="desc"
                        type="text"
                        placeholder="가게 특징을 입력해주세요"
                        required
                        className="w-full"
                    />
                </div>
                {/* 주소 컴포넌트 */}
                <AddressSearch
                    onAddressChange={handleAddressChange}
                />

                {/* 숨겨진 주소 필드 */}
                <input type="hidden" name="address" value={address}/>

                {/* 대표 이미지 업로드 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        대표 이미지
                    </label>
                    <input
                        type="hidden"
                        name="mainImage"
                        value={mainImage}
                    />
                    <div className="mt-1 flex items-center">
                        {previewImage ? (
                            <div className="relative w-32 h-32 mb-2">
                                <Image
                                    src={previewImage}
                                    alt="대표 이미지 미리보기"
                                    fill
                                    className="object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImage('');
                                        setMainImage('');
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex justify-center items-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-md"
                            >
                                <span className="text-gray-500">이미지 추가</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMainImageUpload}
                        />
                    </div>
                </div>

                {/* 태그 - 선택 */}
                <div>
                    <CustomInput
                        name="tag"
                        type="hidden"
                        value={'food'}
                        className="w-full"
                    />
                </div>

                {/* 평점 제목 */}
                <div>
                    <input type="hidden" name="rating" value={rating}/>
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
            <button className={'flex w-full justify-center items-center py-3 bg-sky-300 my-2 text-white'}
                    type={'submit'}>등록하기
            </button>
        </FormContainer>
    );
}

export default CreateStore;