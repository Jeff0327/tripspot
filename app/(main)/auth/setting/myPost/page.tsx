import React from 'react';
import { getMyStore } from './actions'; // 액션 경로 조정 필요
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { FaHeart } from 'react-icons/fa'; // 좋아요 아이콘

async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?isOpen=true');
    }

    const result = await getMyStore();

    // 데이터 가져오기 실패
    if (!result.success || !result.data) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-xl font-bold mb-4">내 포스트</h1>
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {result.error || "데이터를 불러오는데 실패했습니다."}
                </div>
            </div>
        );
    }

    const data = result.data;

    return (
        <div className="py-8 px-4">
            <h1 className="text-xl font-bold mb-6">내 포스트</h1>

            {!data || data.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">등록된 가게가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((store) => (
                        <Link key={store.id} href={`/auth/setting/myPost/${store.id}`}>
                            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                                <div className="relative h-48 w-full bg-gray-100">
                                    {store.mainimage ? (
                                        <Image
                                            src={store.mainimage}
                                            alt={store.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : store.images && store.images.length > 0 ? (
                                        <Image
                                            src={store.images[0]}
                                            alt={store.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            이미지 없음
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h2 className="font-bold text-lg mb-1">{store.name}</h2>
                                    <p className="text-gray-600 text-sm mb-2">{store.address}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-yellow-500 mr-1">★</span>
                                            <span>{typeof store.star === 'number' ? store.star.toFixed(1) : "0.0"}</span>
                                        </div>

                                        {/* 좋아요 표시 추가 */}
                                        <div className="flex items-center">
                                            <FaHeart className="text-red-500 mr-1" />
                                            <span>{store.like || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Page;