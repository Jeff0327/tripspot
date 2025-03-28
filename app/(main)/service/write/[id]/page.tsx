import React from 'react';
import {getOne} from "@/app/(main)/food/actions";
import CreateReview from "@/components/store/CreateReview";

async function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    if (!id) {
        return (
            <div>가게를 찾을 수 없습니다.</div>
        )
    }

    const data = await getOne(id)
    if(!data) return (
        <div>가게 데이터를 불러오지 못했습니다.</div>
    )
    return (
        <>
            <div className={'flex flex-row gap-2 p-2 lg:mt-[10vh]'}>
                <h2 className={'text-xl font-jalnan'}>{data.name} 리뷰작성</h2>
            </div>
            <CreateReview storeId={id}/>
        </>
    )
}

export default Page;