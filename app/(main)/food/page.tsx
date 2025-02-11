import React from 'react';
import FoodList from "@/components/food/FoodList";
import {getRestaurant} from "@/app/(main)/food/actions";
import SearchInput from "@/components/layout/search/SearchInput";

async function Page({
                        searchParams
                    }: {
    searchParams: { searchTerm?: string }
}) {
    const data = await getRestaurant(searchParams.searchTerm);

    return (
        <div>
            <SearchInput/>
            <FoodList storeList={data || []} />
        </div>
    );
}

export default Page;