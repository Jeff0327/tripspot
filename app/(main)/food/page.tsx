import React from 'react';
import FoodList from "@/components/food/FoodList";
import {getStore} from "@/app/(main)/food/actions";

async function Page() {
    const data = await getStore();

    return (
        <div>
            <FoodList storeList={data || []} />
        </div>
    );
}

export default Page;