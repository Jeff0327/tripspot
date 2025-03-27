import React from 'react';
import SearchInput from "@/components/layout/search/SearchInput";
import StoreList from "@/components/store/StoreList";
import {createClient} from "@/utils/supabase/server";
import {getService} from "@/app/(main)/hotel/actions";

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ searchTerm?: string }>
}) {
    const {searchTerm} = await searchParams
    const data = await getService(searchTerm);
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    const baseUrl='hotel'
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