import React from 'react';
import SearchInput from "@/components/layout/search/SearchInput";
import FoodList from "@/components/store/FoodList";

async function Page() {
    return (
        <>
            <div className="fixed top-0 lg:top-10 w-full h-[12vh] bg-white z-10">
                <SearchInput/>
            </div>
            <div className="mt-[12vh]">

            </div>
        </>
    );
}

export default Page;