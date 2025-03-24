import React from 'react';
import SearchInput from "@/components/layout/search/SearchInput";
import {getService} from "@/app/(main)/service/actions";
import ServiceList from "@/components/service/ServiceList";

async function Page({searchParams}:{searchParams:Promise<{searchTerms?:string}>}) {
    const {searchTerms} = await searchParams;
    const data = await getService(searchTerms)
    return (
        <>
            <div className="fixed top-0 lg:top-10 w-full h-[12vh] bg-white z-10">
                <SearchInput/>
            </div>
            <div className="mt-[12vh]">
                <ServiceList serviceList={data || []}/>
            </div>
        </>
    );
}

export default Page;