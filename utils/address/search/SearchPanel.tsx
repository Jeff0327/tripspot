// SearchPanel.tsx
import React from 'react';
import {AutomationConfig} from "@/lib/types";

interface SearchPanelProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    maxResults: number;
    setMaxResults: (value: number) => void;
    loading: boolean;
    addressVerifying: boolean;
    verifyAddressAutomatically: boolean;
    handleManualSearch: () => void;
    verifyAllAddresses: () => void;
    handleAutomationChange: (field: keyof AutomationConfig, value: any) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
                                                            searchTerm,
                                                            setSearchTerm,
                                                            maxResults,
                                                            setMaxResults,
                                                            loading,
                                                            addressVerifying,
                                                            verifyAddressAutomatically,
                                                            handleManualSearch,
                                                            verifyAllAddresses,
                                                            handleAutomationChange
                                                        }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">맛집 검색</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        검색어
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="예: 서울 맛집 추천, 부산 맛집 브이로그..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        검색 결과 수
                    </label>
                    <input
                        type="number"
                        value={maxResults}
                        onChange={(e) => setMaxResults(parseInt(e.target.value) || 5)}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="verifyAddressAutomatically"
                    checked={verifyAddressAutomatically}
                    onChange={(e) => handleAutomationChange('verifyAddressAutomatically', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verifyAddressAutomatically" className="ml-2 block text-sm text-gray-700">
                    카카오맵 API로 주소 자동 검증
                </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleManualSearch}
                    disabled={loading || addressVerifying}
                    className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                    {loading ? '검색 중...' : '검색'}
                </button>

                <button
                    onClick={verifyAllAddresses}
                    disabled={loading || addressVerifying}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                    {addressVerifying ? '주소 검증 중...' : '주소 일괄검증'}
                </button>
            </div>
        </div>
    );
};