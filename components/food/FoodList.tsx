'use client'
import React from 'react';
import {FaStar} from "react-icons/fa";
import CountUp from "react-countup";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {Store} from "@/lib/types";
import Image from "next/image";

function FoodList({storeList}: { storeList: Store[] }) {

    if (!storeList) return null;

    return (
        <div className={'flex flex-col gap-2 p-2'}>
            <Accordion type="single" collapsible>
                {storeList.map((food) => (
                        <AccordionItem className={'border-none'} key={food.id} value={food.name}>
                            <AccordionTrigger className={'border rounded-lg gap-1 border-gray-700 py-2 mb-1'}>
                                <div className={'flex justify-between p-2 items-center rounded-lg w-full'}>
                                    <div className={'flex flex-row items-center gap-2 w-1/2'}>
                                        {food.images && food.images.length > 0 ? (
                                            <Image
                                                width={150}
                                                height={150}
                                                src={food.images[0]}
                                                alt={food.name}
                                                unoptimized={true}
                                                className={'w-[50px] h-[50px] rounded-lg'}
                                            />
                                        ) : (
                                            <div className="w-[50px] h-[50px] bg-gray-200 rounded-lg"></div>
                                        )}
                                        <div className={'font-jalnan'}>{food.name}</div>
                                    </div>
                                    <div className={'w-1/2 mx-auto font-jmt'}>{food.desc || ''}</div>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <FaStar className={'w-4 h-4 text-yellow-300'}/>
                                        <CountUp className={'font-study'} end={food.star || 0} duration={3} decimals={1} decimal="."/>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {food.detail ? <div dangerouslySetInnerHTML={{ __html: food.detail }} /> : <div className={'flex justify-center font-jalnan items-center min-h-[10vh] border rounded-lg'}>가게 정보가 없어요</div>}
                            </AccordionContent>
                        </AccordionItem>
                    ))
                }
            </Accordion>
        </div>
    );
}

export default FoodList;