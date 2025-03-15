'use client'
import React, {useState} from 'react';
import {FaHeart, FaStar, FaRegBookmark, FaBookmark, FaRegUserCircle, FaPlus} from "react-icons/fa";
import CountUp from "react-countup";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import {User} from "@supabase/auth-js";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import {Review, StoreWithReviews} from "@/lib/types";
import {addToLikes, removeFromLikes} from "@/app/(main)/food/actions";
import KakaoMap from "@/utils/address/map/Kakaomap";

function FoodList({storeList, user, userLikes = []}: {
    storeList: StoreWithReviews[];
    user: User | null;
    userLikes?: string[];
}) {
    const {notify} = useAlert();
    const router = useRouter();
    const [likedStores, setLikedStores] = useState<Set<string>>(new Set(userLikes));
    const [loadingLikes, setLoadingLikes] = useState<Record<string, boolean>>({});

    // 좋아요 토글 함수
    const toggleLike = async (e: React.MouseEvent, storeId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            return notify.info('로그인 후 이용해주세요.');
        }

        setLoadingLikes(prev => ({...prev, [storeId]: true}));

        try {
            // 현재 좋아요 상태에 따라 추가 또는 제거
            if (likedStores.has(storeId)) {
                const result = await removeFromLikes(storeId);
                if (result.success) {
                    setLikedStores(prev => {
                        const next = new Set(prev);
                        next.delete(storeId);
                        return next;
                    });
                    notify.success('찜 목록에서 제거했습니다');
                } else {
                    notify.failure(result.error || '오류가 발생했습니다');
                }
            } else {
                const result = await addToLikes(storeId);
                if (result.success) {
                    setLikedStores(prev => {
                        const next = new Set(prev);
                        next.add(storeId);
                        return next;
                    });
                    notify.success('찜 목록에 추가했습니다');
                } else {
                    notify.failure(result.error || '오류가 발생했습니다');
                }
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            notify.failure('처리 중 오류가 발생했습니다');
        } finally {
            setLoadingLikes(prev => ({...prev, [storeId]: false}));
        }
    };

    const handleReview = (id: string) => {
        if (!user) {
            return notify.info('로그인 후 이용해주세요.');
        }
        router.push(`/food/write/${id}`);
    };

    const handleCreateStore = () => {
        if (!user) {
            return notify.info('로그인 후 이용해주세요.');
        }
        router.push(`/food/write`);
    }

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
                                    <div className="w-8 h-8 bg-white rounded-full"><FaRegUserCircle
                                        className={'w-full h-full'}/></div>
                                )}
                                <span className="font-medium">{review.user?.user_metadata?.name || '익명'}</span>
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

                        <div className="review-content prose max-w-none"
                             dangerouslySetInnerHTML={{__html: review.content}}/>

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
            <div className="flex flex-col gap-2 p-2">
                <Accordion type="single" collapsible>
                    {storeList.map((food) => (
                        <AccordionItem className="border-none" key={food.id} value={food.name}>
                            <AccordionTrigger className="relative border rounded-lg gap-1 border-gray-700 py-2 mb-1 shadow-lg">
                                <div className="flex justify-between p-2 items-center rounded-lg w-full">
                                    <div className="flex flex-row items-center gap-2 w-full mr-2">
                                        {food.mainimage ? (
                                            <Image
                                                width={150}
                                                height={150}
                                                src={food.mainimage}
                                                alt={food.name}
                                                unoptimized={true}
                                                className="w-[50px] h-[50px] rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-[50px] h-[50px] bg-gray-200 rounded-lg min-w-[50px]"></div>
                                        )}
                                        <div className={'flex flex-col w-full'}>
                                            <div
                                                className="font-jalnan">{food.name && food.name.length > 16 ? `${food.name.slice(0, 16)}...` : food.name}</div>
                                            <div
                                                className="font-jmt w-full">{food.desc && food.desc.length > 30 ? `${food.desc.slice(0, 30)}...` : food.desc || ''}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-1">
                                        <FaHeart className="text-red-500"/>
                                        <CountUp end={food.like ?? 0} className={'font-study'}/>
                                        <FaStar className="w-4 h-4 text-yellow-300"/>
                                        <CountUp className="font-study" end={food.star || 0} duration={3}
                                                 decimals={1}
                                                 decimal="."/>
                                    </div>
                                    {/*<div*/}
                                    {/*    role="button"*/}
                                    {/*    onClick={(e) => toggleLike(e, food.id)}*/}
                                    {/*    aria-label={likedStores.has(food.id) ? "찜취소" : "찜하기"}*/}
                                    {/*    className="absolute top-2 right-2 z-10 cursor-pointer flex items-center"*/}
                                    {/*>*/}
                                    {/*    {likedStores.has(food.id) ? (*/}
                                    {/*        <FaBookmark className="text-red-500 text-lg"/>*/}
                                    {/*    ) : (*/}
                                    {/*        <FaRegBookmark className="text-red-500 text-lg"/>*/}
                                    {/*    )}*/}
                                    {/*</div>*/}
                                </div>

                            </AccordionTrigger>
                            <AccordionContent>
                                {food.detail ? (
                                    <div dangerouslySetInnerHTML={{__html: food.detail}}
                                         className="prose max-w-none mb-2 border rounded-lg p-2"/>
                                ) : (
                                    <div className={'mb-2'}>
                                        <div
                                            className="flex justify-center font-jalnan items-center min-h-[10vh] border rounded-lg">
                                            가게 정보가 없어요
                                        </div>
                                    </div>
                                )}
                                <div className="mb-2">
                                    <div className="flex flex-col rounded-lg border overflow-hidden">
                                        <div className="p-2 text-sm bg-gray-50">주소: {food.address}</div>
                                    </div>
                                </div>
                                {/*지도 섹션 */}
                                {food.address && (
                                    <KakaoMap address={food.address} />
                                )}
                                {/* 리뷰 섹션 */}
                                <div>
                                    {renderReviews(food.id, food.reviews || [])}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <button
                onClick={() => handleCreateStore()}
                className={'flex flex-row items-center gap-1 fixed bottom-20 right-2 bg-sky-300 rounded-full px-7 py-3 text-white text-sm'}
            >
                등록하기<FaPlus/>
            </button>
        </>
    );
}

export default FoodList;