'use client'
import React, { useState, useEffect } from 'react';
import { CardCustom } from "@/components/ui/CustomCard";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Carousel() {
    const images = [
        '/main/main_1.webp',
        '/main/main_2.webp',
        '/main/main_3.webp',
    ];

    const bgSlides = [
        {
            image: '/main/mainBg_1.jpg',
            title: '나만의 핫플레이스를 공유해보세요!',
            description: '공간을 공유하고 함께즐겨요.'
        },
        {
            image: '/main/mainBg_2.jpg',
            title: '숨은 맛집을 소개해주세요!',
            description: '이런 맛집이?'
        },
        {
            image: '/main/mainBg_3.jpg',
            title: '최고의 숙박은 어디?',
            description: '여행자에게 숙박은 또 다른 즐거움!'
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [bgCurrentIndex, setBgCurrentIndex] = useState(0);

    // 첫 번째 캐러셀 자동 슬라이드
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    // 두 번째 캐러셀 자동 슬라이드
    useEffect(() => {
        const timer = setInterval(() => {
            setBgCurrentIndex((prevIndex) =>
                prevIndex === bgSlides.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setBgCurrentIndex((prevIndex) =>
            prevIndex === bgSlides.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setBgCurrentIndex((prevIndex) =>
            prevIndex === 0 ? bgSlides.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="flex flex-col gap-0.5">
            {/* 첫 번째 캐러셀 */}
            <CardCustom>
                <div className="relative w-full h-48">
                    <div className="relative h-full w-full">
                        <Image
                            width={500}
                            height={500}
                            src={images[currentIndex]}
                            alt={`Slide ${currentIndex + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </CardCustom>

            {/* 두 번째 캐러셀 */}
            <div className="flex justify-center w-full">
                <CardCustom className="w-full relative">
                    <div className="relative w-full h-[8vh]">
                        {/* 배경 이미지 */}
                        <div className="relative h-full w-full">
                            <Image
                                width={1200}
                                height={800}
                                src={bgSlides[bgCurrentIndex].image}
                                alt={`Background ${bgCurrentIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* 텍스트 오버레이 */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="text-center">
                                    <h3 className="text-white text-sm font-semibold">
                                        {bgSlides[bgCurrentIndex].title}
                                    </h3>
                                    <p className="text-white/80 text-xs">
                                        {bgSlides[bgCurrentIndex].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardCustom>
            </div>
        </div>
    );
}

export default Carousel;