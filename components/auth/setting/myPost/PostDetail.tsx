import React from 'react';
import Image from 'next/image';
import { FaHeart, FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import {Store, StoreWithReviews} from "@/lib/types";

const PostDetail = ({ post }:{post:Store}) => {
    // 이미지 URL 처리
    const mainImage = post.mainimage || (post.images && post.images.length > 0 ? post.images[0] : null);

    // 날짜 포맷팅
    const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 메인 이미지 */}
            {mainImage && (
                <div className="relative w-full h-64 md:h-96">
                    <Image
                        src={mainImage}
                        alt={post.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* 포스트 정보 */}
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{post.name}</h2>

                <div className="flex items-center text-gray-600 mb-4">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{post.address}</span>
                </div>

                <div className="flex justify-between mb-6">
                    <div className="flex items-center">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="mr-4">{typeof post.star === 'number' ? post.star.toFixed(1) : "0.0"}</span>

                        <FaHeart className="text-red-500 mr-1" />
                        <span>{post.like || 0}</span>
                    </div>

                    <div className="flex items-center text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {/* 상세 내용 */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">상세 정보</h3>
                    {post.detail ? (
                        <div dangerouslySetInnerHTML={{ __html: post.detail }} className="prose max-w-none" />
                    ) : (
                        <p className="text-gray-500 italic">상세 정보가 없습니다.</p>
                    )}
                </div>

                {/* 추가 이미지 갤러리 */}
                {/*{post.mainimage && (*/}
                {/*    <div className="mt-6 border-t pt-4">*/}
                {/*        <h3 className="text-lg font-semibold mb-3">갤러리</h3>*/}
                {/*        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">*/}
                {/*            {post.mainimage &&(*/}
                {/*                    <Image*/}
                {/*                        src={post.mainimage}*/}
                {/*                        alt={`${post.name}`}*/}
                {/*                        fill*/}
                {/*                        className="object-cover"*/}
                {/*                    />*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </div>
    );
};

export default PostDetail;