'use client'
import React from 'react';
import {FaStar} from "react-icons/fa";
import CountUp from "react-countup";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import Script from "next/script";
import {User} from "@supabase/auth-js";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import {Review, StoreWithReviews} from "@/lib/types";


function FoodList({storeList, user}: { storeList: StoreWithReviews[]; user: User | null }) {
    const {notify} = useAlert();
    const router = useRouter();

    const handleReview = (id: string) => {
        if (!user) {
            return notify.info('로그인 후 이용해주세요.');
        }
        router.push(`/food/write/${id}`);
    };

    // 리뷰 렌더링 함수
    const renderReviews = (storeId: string, reviews: Review[]) => {
        if (!reviews || reviews.length === 0) {
            return (
                <div className="flex flex-col justify-center font-jalnan items-center min-h-[10vh] border rounded-lg">
                    아직 리뷰가 없어요
                    <button onClick={() => handleReview(storeId)} className={'underline font-jmt'}>작성하기</button>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-jalnan text-lg">리뷰 ({reviews.length})</h3>
                    <button onClick={() => handleReview(storeId)} className="text-blue-500 underline font-jmt">
                        리뷰 작성하기
                    </button>
                </div>

                {reviews.map(review => (
                    <div key={review.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {review.user?.user_metadata?.avatar_url ? (
                                    <Image
                                        width={32}
                                        height={32}
                                        src={review.user.user_metadata.avatar_url}
                                        alt="프로필"
                                        className="rounded-full w-8 h-8"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                )}
                                <span className="font-medium">{review.user?.user_metadata?.name || '사용자'}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(review.created_at), {
                                    addSuffix: true,
                                    locale: ko
                                })}
                            </div>
                        </div>

                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                            <span className="ml-1 text-sm">({review.rating})</span>
                        </div>

                        <div className="review-content prose max-w-none" dangerouslySetInnerHTML={{__html: review.content}}/>

                        {review.images && review.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {review.images.map((img, idx) => (
                                    <Image
                                        key={idx}
                                        width={100}
                                        height={100}
                                        src={img}
                                        alt={`리뷰 이미지 ${idx + 1}`}
                                        className="rounded-lg w-24 h-24 object-cover"
                                        unoptimized={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (!storeList) return null;

    return (
        <>
            <Script
                id="naver-map-script"
                src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=1_qUipzSMalpHd4IJD0W&submodules=geocoder"
                strategy="afterInteractive"
            />

            <div className="flex flex-col gap-2 p-2">
                <Accordion type="single" collapsible>
                    {storeList.map((food) => (
                        <AccordionItem className="border-none" key={food.id} value={food.name}>
                            <AccordionTrigger className="border rounded-lg gap-1 border-gray-700 py-2 mb-1">
                                <div className="flex justify-between p-2 items-center rounded-lg w-full">
                                    <div className="flex flex-row items-center gap-2 w-1/2">
                                        {food.images && food.images.length > 0 ? (
                                            <Image
                                                width={150}
                                                height={150}
                                                src={food.images[0]}
                                                alt={food.name}
                                                unoptimized={true}
                                                className="w-[50px] h-[50px] rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-[50px] h-[50px] bg-gray-200 rounded-lg"></div>
                                        )}
                                        <div className="font-jalnan">{food.name}</div>
                                    </div>
                                    <div className="w-1/2 mx-auto font-jmt">{food.desc || ''}</div>
                                    <div className="flex flex-row items-center gap-1">
                                        <FaStar className="w-4 h-4 text-yellow-300"/>
                                        <CountUp className="font-study" end={food.star || 0} duration={3} decimals={1}
                                                 decimal="."/>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {food.detail ? (
                                    <div dangerouslySetInnerHTML={{__html: food.detail}} className="prose max-w-none mb-4"/>
                                ) : (
                                    <div className={'mb-4'}>
                                        <div
                                            className="flex justify-center font-jalnan items-center min-h-[10vh] border rounded-lg">
                                            가게 정보가 없어요
                                        </div>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <div className="flex flex-col rounded-lg border overflow-hidden">
                                        <div className="p-2 text-sm bg-gray-50">주소: {food.address}</div>
                                    </div>
                                </div>

                                {/* 리뷰 섹션 */}
                                <div className="mt-4 border-t pt-4">
                                    {renderReviews(food.id, food.reviews || [])}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </>
    );
}

export default FoodList;