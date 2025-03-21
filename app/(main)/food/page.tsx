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
        <div>
            <SearchInput/>
            <FoodList storeList={data || []} user={user|| null}/>
        </div>
    );
}

export default Page;