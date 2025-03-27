'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import useAlert from '@/lib/notiflix/useAlert';
import {useRouter} from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
interface Store {
    name: string;
    address: string;
    desc?: string;
    mainimage?: string;
    mainImage?: string; // 클라이언트 호환성을 위한 필드
    videoId?: string;
    videoUrl?: string;
    detail?: string;
    tag?: string;
    star?: number;
    images?: string; // JSON 문자열
}

interface SearchResult {
    success: boolean;
    message?: string;
    data?: Store[];
}

interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        success: Array<{ name: string; message: string }>;
        failed: Array<{ name: string; error: string }>;
    };
}

const YouTubeScraper = () => {
    const { notify } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Store[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<Store[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const router = useRouter()
    // 검색 결과 중 선택한 맛집 토글
    const toggleRestaurantSelection = (store: Store) => {
        if (selectedRestaurants.some(r => r.videoId === store.videoId)) {
            setSelectedRestaurants(selectedRestaurants.filter(r => r.videoId !== store.videoId));
        } else {
            setSelectedRestaurants([...selectedRestaurants, store]);
        }
    };

    // 검색 수행
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            notify.failure('검색어를 입력해주세요.');
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        setSelectedRestaurants([]);
        setImportResult(null);

        try {
            const response = await fetch(`/api/scraper?query=${encodeURIComponent(searchQuery)}&limit=10`);
            const result: SearchResult = await response.json();

            if (!result.success || !result.data) {
                notify.failure(result.message || '검색 결과가 없습니다.');
                return;
            }

            setSearchResults(result.data);
            notify.success(`${result.data.length}개의 맛집 정보를 찾았습니다.`);
        } catch (error) {
            console.error('검색 오류:', error);
            notify.failure('검색 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };

    // 선택한 맛집 정보 가져오기
    const handleImport = async () => {
        if (selectedRestaurants.length === 0) {
            notify.failure('가져올 맛집을 선택해주세요.');
            return;
        }

        setIsImporting(true);

        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ restaurants: selectedRestaurants }),
            });

            const result: ImportResult = await response.json();
            setImportResult(result);

            if (result.success) {
                notify.success(result.message);
            } else {
                notify.failure(result.message);
            }
        } catch (error) {
            console.error('가져오기 오류:', error);
            notify.failure('맛집 정보 가져오기 중 오류가 발생했습니다.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="mx-auto p-4">
            <button className={'flex flex-row items-center gap-1'} onClick={()=>router.back()}><IoIosArrowBack />뒤로가기</button>
            <h1 className="text-center mt-2 text-2xl font-bold mb-6">유튜브 맛집 검색 및 자동 등록</h1>

            {/* 검색 폼 */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="지역명 + 맛집 (예: 대구 맛집, 서울 강남 맛집)"
                    className="flex-1 p-2 border rounded"
                />
                <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-sky-500 text-black"
                >
                    {isSearching ? '검색 중...' : '유튜브 검색'}
                </Button>
            </div>

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-col justify-between items-center mb-4 text-black">
                        <h2 className="text-xl font-semibold mb-4">검색 결과 ({searchResults.length}개)</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setSelectedRestaurants(searchResults)}
                                className="bg-gray-200 text-gray-800"
                            >
                                전체 선택
                            </Button>
                            <Button
                                onClick={() => setSelectedRestaurants([])}
                                className="bg-gray-200 text-gray-800"
                            >
                                선택 해제
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={selectedRestaurants.length === 0 || isImporting}
                                className="bg-green-500 text-gray-800"
                            >
                                {isImporting ? '등록 중...' : `선택한 ${selectedRestaurants.length}개 맛집 등록`}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((restaurant) => {
                            const isSelected = selectedRestaurants.some(r => r.videoId === restaurant.videoId);

                            return (
                                <div
                                    key={restaurant.videoId}
                                    className={`border rounded-lg overflow-hidden cursor-pointer ${isSelected ? 'border-green-500 border-2' : ''}`}
                                    onClick={() => toggleRestaurantSelection(restaurant)}
                                >
                                    {(restaurant.mainImage || restaurant.mainimage) && (
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={restaurant.mainImage || restaurant.mainimage}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-green-500 p-1 rounded-full">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1 truncate">{restaurant.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2 truncate">{restaurant.address}</p>
                                        <p className="text-sm line-clamp-2">{restaurant.desc}</p>
                                        <a
                                            href={restaurant.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 text-sm mt-2 inline-block"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            유튜브 영상 보기
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 가져오기 결과 */}
            {importResult && (
                <div className="mt-8 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">등록 결과</h2>
                    <p className="mb-4">{importResult.message}</p>

                    {importResult.details && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 성공 목록 */}
                            <div>
                                <h3 className="font-semibold text-green-600 mb-2">성공 ({importResult.details.success.length}개)</h3>
                                {importResult.details.success.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {importResult.details.success.map((item, index) => (
                                            <li key={index} className="mb-1">
                                                {item.name}: {item.message}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">성공적으로 등록된 맛집이 없습니다.</p>
                                )}
                            </div>

                            {/* 실패 목록 */}
                            <div>
                                <h3 className="font-semibold text-red-600 mb-2">실패 ({importResult.details.failed.length}개)</h3>
                                {importResult.details.failed.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {importResult.details.failed.map((item, index) => (
                                            <li key={index} className="mb-1">
                                                {item.name}: {item.error}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">실패한 등록이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default YouTubeScraper;