import React from 'react';
import FoodList from "@/components/store/FoodList";
import {getRestaurant} from "@/app/(main)/food/actions";
import SearchInput from "@/components/layout/search/SearchInput";
import {createClient} from "@/utils/supabase/server";
import SearchFood from "@/utils/address/search/SearchFood";

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ searchTerm?: string }>
}) {
    const {searchTerm} = await searchParams
    const data = await getRestaurant(searchTerm);
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    return (
        <>
            <div className="fixed top-0 lg:top-10 w-full h-[12vh] bg-white z-10">
                <SearchInput/>
            </div>
            <div className="mt-[12vh]">
                <FoodList storeList={data || []} user={user || null}/>
            </div>
        </>
    );
}

export default Page;