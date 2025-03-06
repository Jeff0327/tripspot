import React from 'react';
import Carousel from "@/components/main/Carousel";
import RandomAria from "@/components/main/Random";
import {randomHotel, randomPlace} from "@/app/(main)/main/actions";
import Footer from "@/components/layout/footer/Footer";

async function Page() {
    const randomData = await randomPlace()
    const randomHotelData = await randomHotel()
    return (
        <div>
            <Carousel/>
            <RandomAria randomData={randomData} randomHotelData={randomHotelData}/>
            <Footer/>
        </div>
    );
}

export default Page;