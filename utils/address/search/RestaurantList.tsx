// RestaurantList.tsx
import React from 'react';
import Image from 'next/image';
import {Restaurant} from "@/lib/types";

interface RestaurantListProps {
    restaurants: Restaurant[];
    selectedRestaurants: Record<number, boolean>;
    editingIndex: number | null;
    editForm: { name: string; address: string; desc: string };
    setEditForm: (form: { name: string; address: string; desc: string }) => void;
    loading: boolean;
    verifyAddressAutomatically: boolean;
    handleManualImport: () => void;
    toggleSelectAll: () => void;
    handleCheckboxChange: (index: number) => void;
    startEdit: (index: number) => void;
    saveEdit: () => void;
    cancelEdit: () => void;
    searchRestaurantAddress: (index: number) => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
                                                                  restaurants,
                                                                  selectedRestaurants,
                                                                  editingIndex,
                                                                  editForm,
                                                                  setEditForm,
                                                                  loading,
                                                                  verifyAddressAutomatically,
                                                                  handleManualImport,
                                                                  toggleSelectAll,
                                                                  handleCheckboxChange,
                                                                  startEdit,
                                                                  saveEdit,
                                                                  cancelEdit,
                                                                  searchRestaurantAddress
                                                              }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">검색 결과 ({restaurants.length}개)</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleSelectAll}
                        className="text-sm text-sky-600 hover:text-sky-800"
                    >
                        {restaurants.every((_, index) => selectedRestaurants[index])
                            ? '전체 해제'
                            : '전체 선택'}
                    </button>
                    <button
                        onClick={handleManualImport}
                        disabled={loading || Object.values(selectedRestaurants).every(v => !v)}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50"
                    >
                        {loading ? '등록 중...' : '선택한 맛집 등록하기'}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-100">
                        <th className="p-2 border text-left w-16">선택</th>
                        <th className="p-2 border text-left w-32">이미지</th>
                        <th className="p-2 border text-left">가게 정보</th>
                        <th className="p-2 border text-left w-24">작업</th>
                    </tr>
                    </thead>
                    <tbody>
                    {restaurants.map((restaurant, index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-50 ${
                                verifyAddressAutomatically && restaurant.addressVerified
                                    ? 'bg-green-50'
                                    : (verifyAddressAutomatically ? 'bg-red-50' : '')
                            }`}
                        >
                            <td className="p-2 border text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedRestaurants[index] || false}
                                    onChange={() => handleCheckboxChange(index)}
                                    className="w-5 h-5"
                                    disabled={verifyAddressAutomatically && !restaurant.addressVerified}
                                />
                            </td>
                            <td className="p-2 border">
                                {restaurant.mainImage ? (
                                    <div className="relative w-24 h-24">
                                        <Image
                                            src={restaurant.mainImage}
                                            alt={restaurant.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                            </td>
                            <td className="p-2 border">
                                {editingIndex === index ? (
                                    // 수정 모드
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">가게 이름</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">주소 <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">설명</label>
                                            <input
                                                type="text"
                                                value={editForm.desc}
                                                onChange={(e) => setEditForm({...editForm, desc: e.target.value})}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={saveEdit}
                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
                                            >
                                                저장
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-md"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // 일반 모드
                                    <>
                                        <h3 className="font-bold">{restaurant.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{restaurant.desc}</p>
                                        <p className="text-sm mt-1">
                                            <span className="font-medium">주소:</span>
                                            {restaurant.address ? (
                                                <span className={restaurant.addressVerified ? "text-green-600" : "text-gray-600"}>
                            {" " + restaurant.address}
                                                    {restaurant.addressVerified && (
                                                        <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">검증됨</span>
                                                    )}
                          </span>
                                            ) : (
                                                <span className="text-red-500 italic ml-1">주소 정보 없음</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-blue-500 mt-2">
                                            <a href={restaurant.videoUrl} target="_blank" rel="noopener noreferrer">
                                                YouTube 영상 보기
                                            </a>
                                        </p>
                                    </>
                                )}
                            </td>
                            <td className="p-2 border text-center">
                                {editingIndex === index ? (
                                    // 수정 중에는 버튼 표시 안함
                                    null
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => startEdit(index)}
                                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => searchRestaurantAddress(index)}
                                            className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-md"
                                            disabled={loading}
                                        >
                                            주소검색
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};