'use client';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";
import Editor from "@/lib/editor/Editor";
import FormContainer, { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/errorMessage";
import { writeReview } from "@/app/(main)/food/actions";
import { FaStar } from "react-icons/fa";

function BoardForm({ storeId }: { storeId: string }) {
    const { notify } = useAlert();
    const router = useRouter();
    const [rating, setRating] = useState(5); // 기본값 5점
    const [hover, setHover] = useState(0); // 마우스 오버 상태를 위한 상태

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success(formState.message);
            router.push('/food')
        } else {
            notify.failure(formState.message);
        }
    };

    return (
        <FormContainer action={writeReview} onResult={handleResult}>
            <input type="hidden" name="storeId" value={storeId} />
            <input type="hidden" name="rating" value={rating} />

            <div className="w-full mb-4">
                <div className="flex">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="rating-radio"
                                    value={ratingValue}
                                    className="hidden"
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="w-8 h-8 mr-1"
                                    color={ratingValue <= (hover || rating) ? "#FFD700" : "#e4e5e9"}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="w-full overflow-hidden">
                <div className="rounded relative border border-gray-300 min-h-[50vh] overflow-hidden">
                    <Editor name="content" required/>
                </div>
            </div>

            <div className="w-full mt-3">
                <button type="submit"
                        className="flex w-full justify-center items-center border rounded px-4 h-12 bg-blue-500 text-white">
                    작성하기
                </button>
            </div>
        </FormContainer>
    );
}

export default BoardForm;