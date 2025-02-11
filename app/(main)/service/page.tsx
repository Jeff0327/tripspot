import React from 'react';
import SearchInput from "@/components/layout/search/SearchInput";
import {getService} from "@/app/(main)/service/actions";
import ServiceList from "@/components/service/ServiceList";

async function Page({searchParams}:{searchParams:Promise<{searchTerms?:string}>}) {
    const {searchTerms} = await searchParams;
    const data = await getService(searchTerms)
    return (
        <div>
            <SearchInput/>
            <ServiceList serviceList={data || []}/>
        </div>
    );
}

export default Page;