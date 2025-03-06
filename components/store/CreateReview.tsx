'use client'
import React, { useState } from 'react';
import { writeReview } from "@/app/(main)/food/actions";
import Editor from "@/lib/editor/Editor";
import FormContainer, { FormState } from "@/components/ui/form";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";
import { ERROR_CODES } from "@/utils/errorMessage";
import StarRating from "@/utils/review/StarRating";

function CreateReview({ storeId }: { storeId?: string }) {
    const { notify } = useAlert();
    const router = useRouter();
    const [rating, setRating] = useState(5);

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success(formState.message);
            router.push('/food')
        } else {
            notify.failure(formState.message);
        }
    };

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
    };

    return (
        <FormContainer action={writeReview} onResult={handleResult}>
            <input type="hidden" name="storeId" value={storeId} />
            <input type="hidden" name="rating" value={rating} />

            <div className="w-full mb-3">
                <StarRating
                    initialRating={rating}
                    onRatingChange={handleRatingChange}
                />
            </div>

            <div className="w-full overflow-hidden">
                <div className="rounded relative border border-gray-300 min-h-[50vh] overflow-hidden">
                    <Editor name="content" required/>
                </div>
            </div>

            <div className="w-full mt-3">
                <button type="submit"
                        className="flex w-full justify-center items-center border rounded px-4 h-12 bg-blue-500 text-white">
                    등록하기
                </button>
            </div>
        </FormContainer>
    );
}

export default CreateReview;