'use client'
import React from 'react';
import {FaStar} from "react-icons/fa";
import CountUp from "react-countup";

function FoodList() {

    const foods = [
        {id: 0, name: "소문난 김치찌게", url: "sample1", title: "1년 전통김치찌게맛집", rank: 4.5},
        {id: 1, name: "맵돈가스", url: "sample1", title: "'셋이 먹다 셋다 죽음'의 돈가스", rank: 3.8},
        {id: 2, name: "돼지삼형제", url: "sample1", title: "3인분 같은 1인분이요의 원조", rank: 3.2}
    ]
    return (
        <div className={'flex flex-col gap-2 p-2'}>
            {foods.map((food) => (
                <div key={food.id}
                     className={'flex justify-between p-2 items-center border border-gray-700 rounded-lg'}>
                    <div className={'flex flex-row items-center gap-2 w-1/2'}>
                        <div className={'border w-[50px] h-[50px] rounded-lg'}>이미지</div>
                        <div className={'font-jalnan'}>{food.name}</div>
                    </div>
                    <div className={'w-1/2 mx-auto font-jmt'}>{food.title}</div>
                    <div className={'flex flex-row items-center gap-1'}>
                        <FaStar className={'w-4 h-4 text-yellow-300'}/>
                        <CountUp className={'font-study'} end={food.rank} duration={3} decimals={1}  // 소수점 한자리까지 표시
                                 decimal="."/></div>
                </div>
            ))}
        </div>
    );
}

export default FoodList;