'use client'

import React, { useState, useEffect, useRef } from 'react';
import useAlert from "@/lib/notiflix/useAlert";
import { AutomationPanel } from './AutomationPanel';
import { SearchPanel } from './SearchPanel';
import { LogPanel } from './LogPanel';
import { ResultPanel } from './ResultPanel';
import {AutomationConfig, ImportResult, KakaoMapResult, Store, SearchResult} from "@/lib/types";

export default function SearchFood() {
    const { notify } = useAlert();
    const [searchTerm, setSearchTerm] = useState<string>('서울 맛집 추천');
    const [maxResults, setMaxResults] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [addressVerifying, setAddressVerifying] = useState<boolean>(false);
    const [restaurants, setRestaurants] = useState<Store[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<Record<number, boolean>>({});
    const [importResults, setImportResults] = useState<ImportResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // 수정 모드를 위한 상태
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{name: string; address: string; desc: string}>({
        name: '',
        address: '',
        desc: ''
    });

    // 자동화 설정
    const [automation, setAutomation] = useState<AutomationConfig>({
        enabled: false,
        interval: 60, // 기본 60분
        searchTerms: ['서울 맛집 추천', '부산 맛집 브이로그', '제주 카페 추천'],
        maxResults: 5,
        currentTermIndex: 0,
        importDelay: 5, // 검색 후 5초 후 자동 등록
        verifyAddressAutomatically: true // 기본적으로 주소 자동 검증 활성화
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const importTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 로그 추가 함수
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
    };

    // 자동화 설정 변경
    const handleAutomationChange = <T extends keyof AutomationConfig>(
        field: T,
        value: AutomationConfig[T]
    ) => {
        setAutomation(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 검색어 추가
    const handleAddSearchTerm = () => {
        if (!searchTerm.trim()) return;

        setAutomation(prev => ({
            ...prev,
            searchTerms: [...prev.searchTerms, searchTerm.trim()]
        }));
        setSearchTerm('');
    };

    // 검색어 삭제
    const handleRemoveSearchTerm = (index: number) => {
        setAutomation(prev => ({
            ...prev,
            searchTerms: prev.searchTerms.filter((_, i) => i !== index)
        }));
    };

    // 주소가 있는 레스토랑만 필터링하는 함수
    const filterRestaurantsWithAddress = (restaurants: Store[]): Store[] => {
        const filtered = restaurants.filter(restaurant => restaurant.address && restaurant.address.trim() !== '');

        if (restaurants.length !== filtered.length) {
            addLog(`주소 없는 ${restaurants.length - filtered.length}개 항목 제외됨`);
        }

        return filtered;
    };

    // 카카오맵 API로 주소 검증 함수
    const verifyRestaurantAddress = async (restaurant: Store): Promise<Store> => {
        if (!restaurant.name) {
            return { ...restaurant, addressVerified: false };
        }

        try {
            // 카카오맵 검색 API 호출
            const response = await fetch(`/api/map_search?query=${encodeURIComponent(restaurant.name)}`);
            const result = await response.json() as KakaoMapResult;

            if (result.success && result.data && result.data.address) {
                // 검색된 주소로 업데이트
                return {
                    ...restaurant,
                    address: result.data.address,
                    addressVerified: true
                };
            } else {
                return { ...restaurant, addressVerified: false };
            }
        } catch (error) {
            console.error('주소 검증 오류:', error);
            return { ...restaurant, addressVerified: false };
        }
    };

    // 모든 맛집의 주소 검증
    const verifyAllAddresses = async () => {
        if (restaurants.length === 0) {
            notify.failure('검증할 맛집이 없습니다.');
            return;
        }

        setAddressVerifying(true);
        addLog(`${restaurants.length}개 맛집 주소 검증 시작...`);

        const verifiedRestaurants: Store[] = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            addLog(`'${restaurant.name}' 주소 검증 중...`);

            const verifiedRestaurant = await verifyRestaurantAddress(restaurant);

            if (verifiedRestaurant.addressVerified) {
                successCount++;
                addLog(`'${restaurant.name}' 주소 검증 성공: ${verifiedRestaurant.address}`);
            } else {
                failCount++;
                addLog(`'${restaurant.name}' 주소 검증 실패`);
            }

            verifiedRestaurants.push(verifiedRestaurant);
        }

        setRestaurants(verifiedRestaurants);

        // 검증된 주소가 있는 맛집만 선택 상태로 변경
        const newSelection: Record<number, boolean> = {};
        verifiedRestaurants.forEach((restaurant, index) => {
            newSelection[index] = !!restaurant.addressVerified;
        });
        setSelectedRestaurants(newSelection);

        setAddressVerifying(false);
        addLog(`주소 검증 완료: 성공 ${successCount}개, 실패 ${failCount}개`);

        if (successCount > 0) {
            notify.success(`주소 검증 완료: ${successCount}개 성공`);
        } else {
            notify.failure('주소 검증에 실패했습니다.');
        }
    };

    // YouTube에서 맛집 검색
    const handleSearch = async (term: string, limit: number) => {
        if (!term) {
            addLog('검색어가 비어있습니다.');
            return false;
        }

        setLoading(true);
        addLog(`"${term}" 검색 시작 (최대 ${limit}개)`);

        try {
            const response = await fetch(`/api/scraper?query=${encodeURIComponent(term)}&limit=${limit}`);
            const result = await response.json() as SearchResult;

            if (result.success && result.data && result.data.length > 0) {
                // 주소가 있는 맛집만 필터링
                let filteredData = filterRestaurantsWithAddress(result.data);

                if (filteredData.length > 0) {
                    // 자동 주소 검증이 활성화된 경우
                    if (automation.verifyAddressAutomatically) {
                        addLog('주소 자동 검증 시작...');
                        setAddressVerifying(true);

                        const verifiedRestaurants: Store[] = [];
                        let successCount = 0;

                        for (const restaurant of filteredData) {
                            const verifiedRestaurant = await verifyRestaurantAddress(restaurant);
                            if (verifiedRestaurant.addressVerified) successCount++;
                            verifiedRestaurants.push(verifiedRestaurant);
                        }

                        setAddressVerifying(false);
                        addLog(`주소 검증 완료: ${successCount}/${filteredData.length}개 검증됨`);

                        // 검증된 맛집이 있는 경우에만 설정
                        if (successCount > 0) {
                            filteredData = verifiedRestaurants;

                            // 검증된 주소가 있는 맛집만 선택 상태로 변경
                            const initialSelected: Record<number, boolean> = {};
                            filteredData.forEach((restaurant, index) => {
                                initialSelected[index] = !!restaurant.addressVerified;
                            });
                            setSelectedRestaurants(initialSelected);

                            setRestaurants(filteredData);
                            addLog(`검색 완료: ${filteredData.length}개 중 ${successCount}개의 맛집 정보 검증됨`);
                            return true;
                        } else {
                            // 검증된 맛집이 없는 경우
                            setRestaurants([]);
                            addLog('검증된 주소가 있는 맛집 정보가 없습니다.');
                            return false;
                        }
                    } else {
                        // 자동 주소 검증이 비활성화된 경우
                        setRestaurants(filteredData);

                        // 기본적으로 모든 항목 선택
                        const initialSelected: Record<number, boolean> = {};
                        filteredData.forEach((_, index) => {
                            initialSelected[index] = true;
                        });
                        setSelectedRestaurants(initialSelected);

                        addLog(`검색 완료: ${filteredData.length}개의 맛집 정보 발견`);
                        return true;
                    }
                } else {
                    setRestaurants([]);
                    addLog('주소가 포함된 맛집 정보가 없습니다.');
                    return false;
                }
            } else {
                addLog(`검색 실패: ${result.message || '맛집 정보를 찾을 수 없습니다.'}`);
                return false;
            }
        } catch (error) {
            console.error('검색 오류:', error);
            addLog(`검색 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 맛집 등록
    const handleImport = async (selectedItems: Store[]) => {
        if (selectedItems.length === 0) {
            addLog('등록할 맛집이 없습니다.');
            return false;
        }

        // 주소 검증이 된 맛집만 필터링
        if (automation.verifyAddressAutomatically) {
            const verifiedItems = selectedItems.filter(item => item.addressVerified);
            if (verifiedItems.length === 0) {
                addLog('검증된 주소가 있는 맛집이 없습니다.');
                notify.failure('검증된 주소가 있는 맛집이 없어 등록할 수 없습니다.');
                return false;
            }
            selectedItems = verifiedItems;
        }

        setLoading(true);
        addLog(`${selectedItems.length}개 맛집 등록 시작`);

        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ restaurants: selectedItems }),
            });

            const result = await response.json() as ImportResult;
            setImportResults(result);

            if (result.success) {
                addLog(`등록 성공: ${result.message}`);
                return true;
            } else {
                addLog(`등록 실패: ${result.message || '등록 중 오류가 발생했습니다.'}`);
                return false;
            }
        } catch (error) {
            console.error('등록 오류:', error);
            addLog(`등록 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 자동화 실행 (단일 주기)
    const runAutomationCycle = async () => {
        if (!automation.enabled || automation.searchTerms.length === 0) return;

        // 현재 검색어 선택
        const currentTerm = automation.searchTerms[automation.currentTermIndex];
        addLog(`자동화 주기 시작: "${currentTerm}" 검색 중...`);

        // 검색 실행
        const searchSuccess = await handleSearch(currentTerm, automation.maxResults);

        if (searchSuccess) {
            // 검색 성공 시 일정 시간 후 자동 등록
            addLog(`${automation.importDelay}초 후 자동 등록 예정...`);

            if (importTimerRef.current) {
                clearTimeout(importTimerRef.current);
            }

            importTimerRef.current = setTimeout(async () => {
                // 주소가 검증된 맛집만 필터링
                const selectedItems = automation.verifyAddressAutomatically
                    ? restaurants.filter((r, index) => selectedRestaurants[index] && r.addressVerified)
                    : restaurants.filter((_, index) => selectedRestaurants[index]);

                await handleImport(selectedItems);

                // 다음 검색어로 인덱스 이동
                setAutomation(prev => ({
                    ...prev,
                    currentTermIndex: (prev.currentTermIndex + 1) % prev.searchTerms.length
                }));

                addLog(`다음 주기는 ${automation.interval}분 후 실행 예정`);
            }, automation.importDelay * 1000);
        } else {
            // 검색 실패 시 바로 다음 검색어로 이동
            setAutomation(prev => ({
                ...prev,
                currentTermIndex: (prev.currentTermIndex + 1) % prev.searchTerms.length
            }));

            addLog(`검색 실패로 다음 검색어로 넘어갑니다. 다음 주기는 ${automation.interval}분 후 실행 예정`);
        }
    };

    // 수정 모드 시작
    const startEdit = (index: number) => {
        const restaurant = restaurants[index];
        setEditingIndex(index);
        setEditForm({
            name: restaurant.name,
            address: restaurant.address,
            desc: restaurant.desc ?? ''
        });
    };

    // 수정 내용 저장
    const saveEdit = async () => {
        if (editingIndex === null) return;

        // 주소 필드 검증
        if (!editForm.address || editForm.address.trim() === '') {
            notify.failure('주소는 필수 입력사항입니다.');
            return;
        }

        // 수정된 맛집 정보
        let updatedRestaurant: Store = {
            ...restaurants[editingIndex],
            name: editForm.name,
            address: editForm.address,
            desc: editForm.desc,
            addressVerified: false // 수정 후에는 검증 상태 초기화
        };

        // 주소 검증이 활성화되어 있다면 자동으로 검증
        if (automation.verifyAddressAutomatically) {
            addLog(`'${updatedRestaurant.name}' 주소 검증 중...`);
            updatedRestaurant = await verifyRestaurantAddress(updatedRestaurant);

            if (updatedRestaurant.addressVerified) {
                addLog(`'${updatedRestaurant.name}' 주소 검증 성공`);
            } else {
                addLog(`'${updatedRestaurant.name}' 주소 검증 실패`);
            }
        }

        // 수정된 맛집 정보 업데이트
        const updatedRestaurants = [...restaurants];
        updatedRestaurants[editingIndex] = updatedRestaurant;
        setRestaurants(updatedRestaurants);

        // 검증 상태에 따라 선택 상태 업데이트
        if (automation.verifyAddressAutomatically && editingIndex !== null) { // null 체크 추가
            setSelectedRestaurants(prev => ({
                ...prev,
                [editingIndex]: Boolean(updatedRestaurant.addressVerified) // undefined가 될 수 없도록 Boolean으로 변환
            }));
        }

        setEditingIndex(null);
        addLog(`'${editForm.name}' 정보가 수정되었습니다.`);
    };

    // 수정 취소
    const cancelEdit = () => {
        setEditingIndex(null);
    };

    // 맛집 주소 검색
    const searchRestaurantAddress = async (index: number) => {
        const restaurant = restaurants[index];

        if (!restaurant.name) {
            notify.failure('가게 이름이 없어 주소를 검색할 수 없습니다.');
            return;
        }

        addLog(`'${restaurant.name}' 주소 검색 중...`);
        setLoading(true);

        try {
            // 카카오맵 검색 API 호출
            const response = await fetch(`/api/map-search?query=${encodeURIComponent(restaurant.name)}`);
            const result = await response.json() as KakaoMapResult;

            if (result.success && result.data && result.data.address) {
                // 검색된 주소로 업데이트
                const updatedRestaurants = [...restaurants];
                updatedRestaurants[index] = {
                    ...updatedRestaurants[index],
                    address: result.data.address,
                    addressVerified: true
                };

                setRestaurants(updatedRestaurants);

                // 주소 검증이 활성화된 경우 선택 상태 업데이트
                if (automation.verifyAddressAutomatically) {
                    setSelectedRestaurants(prev => ({
                        ...prev,
                        [index]: true
                    }));
                }

                addLog(`'${restaurant.name}' 주소 검색 완료: ${result.data.address}`);
                notify.success('주소 검색 성공!');
            } else {
                addLog(`'${restaurant.name}' 주소 검색 실패: ${result.message || '주소를 찾을 수 없습니다.'}`);
                notify.failure('주소 검색에 실패했습니다.');
            }
        } catch (error) {
            console.error('주소 검색 오류:', error);
            addLog(`주소 검색 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            notify.failure('주소 검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 자동화 토글
    const toggleAutomation = () => {
        setAutomation(prev => ({
            ...prev,
            enabled: !prev.enabled
        }));
    };

    // 자동화 설정 변경 시 타이머 재설정
    useEffect(() => {
        // 타이머 정리
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // 자동화가 활성화되어 있고 검색어가 있는 경우에만 타이머 설정
        if (automation.enabled && automation.searchTerms.length > 0) {
            addLog(`자동화 시작: ${automation.interval}분 간격으로 실행`);

            // 즉시 첫 번째 주기 실행
            runAutomationCycle();

            // 주기적으로 실행할 타이머 설정
            timerRef.current = setInterval(() => {
                runAutomationCycle();
            }, automation.interval * 60 * 1000);
        } else if (!automation.enabled) {
            addLog('자동화 중지됨');

            // 임포트 타이머도 정리
            if (importTimerRef.current) {
                clearTimeout(importTimerRef.current);
                importTimerRef.current = null;
            }
        }

        // 컴포넌트 언마운트 시 타이머 정리
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (importTimerRef.current) {
                clearTimeout(importTimerRef.current);
            }
        };
    }, [automation.enabled, automation.interval, automation.searchTerms]);

    // 체크박스 상태 변경
    const handleCheckboxChange = (index: number) => {
        setSelectedRestaurants(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // 전체 선택/해제
    const toggleSelectAll = () => {
        if (restaurants.length === 0) return;

        const allSelected = restaurants.every((_, index) => selectedRestaurants[index]);

        const newSelection: Record<number, boolean> = {};
        restaurants.forEach((_, index) => {
            newSelection[index] = !allSelected;
        });

        setSelectedRestaurants(newSelection);
    };

    // 수동 검색
    const handleManualSearch = () => {
        handleSearch(searchTerm, maxResults);
    };

    // 수동 등록
    const handleManualImport = () => {
        const selectedItems = restaurants.filter((_, index) => selectedRestaurants[index]);
        handleImport(selectedItems);
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">YouTube 맛집 자동 등록 시스템</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 왼쪽 패널: 자동화 설정 */}
                <div className="lg:col-span-1">
                    <AutomationPanel
                        automation={automation}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        toggleAutomation={toggleAutomation}
                        handleAutomationChange={handleAutomationChange}
                        handleAddSearchTerm={handleAddSearchTerm}
                        handleRemoveSearchTerm={handleRemoveSearchTerm}
                    />

                    {/* 활동 로그 */}
                    <LogPanel logs={logs} />
                </div>

                {/* 오른쪽 패널: 검색 결과 및 수동 조작 */}
                <div className="lg:col-span-2">
                    {/* 수동 검색 패널 */}
                    <SearchPanel
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        maxResults={maxResults}
                        setMaxResults={setMaxResults}
                        loading={loading}
                        handleManualSearch={handleManualSearch}
                        verifyAllAddresses={verifyAllAddresses}
                        addressVerifying={addressVerifying}
                        verifyAddressAutomatically={automation.verifyAddressAutomatically}
                        handleAutomationChange={handleAutomationChange}
                    />

                    {/* 등록 결과 */}
                    {importResults && (
                        <ResultPanel importResults={importResults} />
                    )}
                </div>
            </div>
        </div>
    );
}