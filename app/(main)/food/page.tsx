import React from 'react';
import FoodList from "@/components/food/FoodList";
import {getRestaurant} from "@/app/(main)/food/actions";
import SearchInput from "@/components/layout/search/SearchInput";

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ searchTerm?: string }>
}) {
    const {searchTerm} = await searchParams
    const data = await getRestaurant(searchTerm);

    return (
        <div>
            <SearchInput/>
            <FoodList storeList={data || []} />
        </div>
    );
}

export default Page;