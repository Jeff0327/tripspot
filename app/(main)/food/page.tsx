import React from 'react';
import FoodList from "@/components/food/FoodList";
import {getStore} from "@/app/(main)/food/actions";

async function Page({searchParams}:{searchParams:Promise<{searchTerms?:string}>}) {

    const {searchTerms} = await searchParams;
    const data = await getStore(searchTerms);

    return (
        <div>
            <FoodList storeList={data || []} />
        </div>
    );
}

export default Page;