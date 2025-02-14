import React from 'react';
import Carousel from "@/components/main/Carousel";
import RandomAria from "@/components/main/Random";
import {randomPlace} from "@/app/(main)/main/actions";

async function Page() {
    const randomData = await randomPlace()
    return (
        <div className={'my-2'}>
            <Carousel/>
            <RandomAria randomData={randomData}/>
        </div>
    );
}

export default Page;