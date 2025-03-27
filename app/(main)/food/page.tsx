import React from 'react';
import StoreList from "@/components/store/StoreList";
import {getRestaurant} from "@/app/(main)/food/actions";
import SearchInput from "@/components/layout/search/SearchInput";
import {createClient} from "@/utils/supabase/server";
import YoutubeSearch from "@/utils/address/search/YoutubeSearch";

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ searchTerm?: string }>
}) {
    const {searchTerm} = await searchParams
    const data = await getRestaurant(searchTerm);
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    const baseUrl='food'
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