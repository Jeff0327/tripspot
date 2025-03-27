import React from 'react';
import SearchInput from "@/components/layout/search/SearchInput";
import {getService} from "@/app/(main)/service/actions";
import StoreList from "@/components/store/StoreList";
import {createClient} from "@/utils/supabase/server";

async function Page({searchParams}:{searchParams:Promise<{searchTerms?:string}>}) {
    const {searchTerms} = await searchParams;
    const data = await getService(searchTerms)
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    const baseUrl='service'
    return (
        <>
            <div className="fixed top-0 lg:top-10 w-full h-[12vh] bg-white z-10">
                <SearchInput/>
            </div>
            <div className="mt-[12vh]">
                <StoreList storeList={data || []} user={user || null} baseUrl={baseUrl}/>
            </div>
        </>
    );
}

export default Page;