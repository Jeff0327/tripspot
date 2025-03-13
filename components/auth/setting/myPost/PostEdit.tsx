'use client'
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAlert from '@/lib/notiflix/useAlert';
import Image from 'next/image';
import FormContainer, { FormState } from '@/components/ui/form';
import { CustomInput } from '@/components/ui/CustomInput';
import StarRating from '@/utils/review/StarRating';
import Editor from '@/lib/editor/Editor';
import { updatePost, deletePost } from '@/app/(main)/auth/setting/myPost/[id]/actions';
import { ERROR_CODES } from '@/utils/errorMessage';
import { Store } from "@/lib/types";
import AddressSearch from "@/utils/address/AddressSearch";

function EditPostForm({ post }: { post: Store }) {
    const router = useRouter();
    const { notify } = useAlert();
    const [rating, setRating] = useState(post.star || 3);
    const [mainImage, setMainImage] = useState(post.mainimage || '');
    const [previewImage, setPreviewImage] = useState(post.mainimage || '');
    const [isDeleting, setIsDeleting] = useState(false);
    const [address, setAddress] = useState(post.address || '');
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
                if (event.target?.result) {
                    setPreviewImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);

            // 이미지 업로드 API 호출
            const formData = new FormData();
            formData.append('files[0]', file);

            const response = await fetch('/api/upload/?action=fileUpload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setMainImage(result.data);
                notify.success('대표 이미지가 업로드되었습니다.');
            } else {
                console.error("업로드 실패:", result.error);
                notify.failure('이미지 업로드 실패: ' + (result.error || "알 수 없는 오류"));
            }
        } catch (error) {
            console.error("업로드 에러:", error);
            notify.failure('이미지 업로드 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async () => {
        if (isDeleting) return;

        const confirmed = window.confirm('정말로 이 포스트를 삭제하시겠습니까?');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const result = await deletePost(post.id);
            if (result.success) {
                notify.success('포스트가 삭제되었습니다.');
                router.push('/auth/setting/myPost');
                router.refresh(); // 목록 페이지 갱신
            } else {
                notify.failure(result.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            notify.failure('삭제 처리 중 오류가 발생했습니다.');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success('포스트가 성공적으로 수정되었습니다.');
            router.push('/auth/setting/myPost');
            router.refresh(); // 목록 페이지 새로고침
        } else {
            notify.failure(formState.message);
        }
    };

    return (
        <FormContainer
            action={updatePost}
            onResult={handleResult}
        >
            {/* 포스트 ID (hidden) */}
            <input type="hidden" name="id" value={post.id} />

            {/* 주소 Hidden 필드 */}
            <input type="hidden" name="address" value={address} />

            <div className="space-y-6 bg-white rounded-lg">
                {/* 가게 이름 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        가게 이름 <span className="text-red-500">*</span>
                    </label>
                    <CustomInput
                        name="name"
                        type="text"
                        defaultValue={post.name}
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
                        defaultValue={post.name}
                        placeholder="가게 특징을 입력해주세요"
                        required
                        className="w-full"
                    />
                </div>
                {/* 주소 검색 컴포넌트 */}
                <AddressSearch
                    defaultAddress={post.address}
                    onAddressChange={handleAddressChange}
                />

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

                {/* 태그 - hidden */}
                <CustomInput
                    name="tag"
                    type="hidden"
                    value={post.tag || 'res'}
                />

                {/* 평점 */}
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

                {/* 상세 내용 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        상세 내용
                    </label>
                    <Editor
                        name="contents"
                        defaultValue={post.detail || ''}
                    />
                </div>

                {/* 버튼 영역 */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`px-4 py-2 bg-black text-white rounded-md hover:bg-red-600 transition-colors ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isDeleting ? '삭제 중...' : '삭제하기'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/auth/setting/myPost')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        수정 완료
                    </button>
                </div>
            </div>
        </FormContainer>
    );
}

export default EditPostForm;