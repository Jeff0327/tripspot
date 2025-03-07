import React from 'react';
import {Store} from "@/lib/types";
import Image from "next/image";

function RandomAria({randomData,randomHotelData}: { randomData: Store[] | null; randomHotelData:Store[] | null}) {

    return (
        <div className={'flex flex-col lg:flex-row lg:flex-wrap mb-[7vh]'}>
            <div className={'p-2 h-full min-h-[12vh] animate-fade-in w-full lg:w-1/3'}>
                <h1 className={'font-jmt text-xl'}>이런 맛집은 어떤가요?</h1>
                {randomData && randomData.map((item, i) => (
                    <div key={item.id} className={'rounded flex flex-col gap-1'}>
                        {item.images && item.images.length > 0 && (
                            <Image
                                width={500}
                                height={500}
                                src={item.images[0]}
                                alt={item.name}
                                unoptimized={true}
                                className={'w-full h-full rounded-lg max-h-[20vh] lg:max-h-[30vh]'}
                            />
                        )}
                        <div className={'flex flex-col font-jmt text-md rounded bg-yellow-600 text-white px-2'}>
                            <span>가게명:{item.name}</span>
                            <span>주소: {item.address}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={'p-2 h-full min-h-[12vh] animate-fade-in w-full lg:w-1/3'}>
                <h1 className={'font-jmt text-xl'}>오늘의 숙박시설</h1>
                {randomHotelData && randomHotelData.map((item, i) => (
                    <div key={item.id} className={'rounded flex flex-col gap-1'}>
                        {item.images && item.images.length > 0 && (
                            <Image
                                width={500}
                                height={500}
                                src={item.images[0]}
                                alt={item.name}
                                unoptimized={true}
                                className={'w-full h-full rounded-lg'}
                            />
                        )}
                        <div className={'flex flex-col font-jmt text-md rounded bg-black/90 text-white px-2'}>
                            <span>{item.name}</span>
                            <span>주소: {item.address}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={'p-2 h-full min-h-[12vh] animate-fade-in w-full lg:w-1/3'}>
                <h1 className={'font-jmt text-xl'}>오늘의 숙박시설</h1>
                {randomHotelData && randomHotelData.map((item, i) => (
                    <div key={item.id} className={'rounded flex flex-col gap-1'}>
                        {item.images && item.images.length > 0 && (
                            <Image
                                width={500}
                                height={500}
                                src={item.images[0]}
                                alt={item.name}
                                unoptimized={true}
                                className={'w-full h-full rounded-lg'}
                            />
                        )}
                        <div className={'flex flex-col font-jmt text-md rounded bg-black/90 text-white px-2'}>
                            <span>{item.name}</span>
                            <span>주소: {item.address}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RandomAria;