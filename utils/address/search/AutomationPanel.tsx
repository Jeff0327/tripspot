// AutomationPanel.tsx
import React from 'react';
import {AutomationConfig} from "@/lib/types";

interface AutomationPanelProps {
    automation: AutomationConfig;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    toggleAutomation: () => void;
    handleAutomationChange: (field: keyof AutomationConfig, value: any) => void;
    handleAddSearchTerm: () => void;
    handleRemoveSearchTerm: (index: number) => void;
}

export const AutomationPanel: React.FC<AutomationPanelProps> = ({
                                                                    automation,
                                                                    searchTerm,
                                                                    setSearchTerm,
                                                                    toggleAutomation,
                                                                    handleAutomationChange,
                                                                    handleAddSearchTerm,
                                                                    handleRemoveSearchTerm
                                                                }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">자동화 설정</h2>

            <div className="flex items-center justify-between mb-4">
                <span className="font-medium">자동화 상태</span>
                <button
                    onClick={toggleAutomation}
                    className={`px-4 py-2 rounded-md ${automation.enabled
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                    {automation.enabled ? '중지' : '시작'}
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    실행 간격 (분)
                </label>
                <input
                    type="number"
                    value={automation.interval}
                    onChange={(e) => handleAutomationChange('interval', parseInt(e.target.value) || 10)}
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    검색 결과 수
                </label>
                <input
                    type="number"
                    value={automation.maxResults}
                    onChange={(e) => handleAutomationChange('maxResults', parseInt(e.target.value) || 5)}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    자동 등록 대기 시간 (초)
                </label>
                <input
                    type="number"
                    value={automation.importDelay}
                    onChange={(e) => handleAutomationChange('importDelay', parseInt(e.target.value) || 5)}
                    min="1"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="verifyAddressAuto"
                    checked={automation.verifyAddressAutomatically}
                    onChange={(e) => handleAutomationChange('verifyAddressAutomatically', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verifyAddressAuto" className="ml-2 block text-sm text-gray-700">
                    주소 검증된 맛집만 등록하기
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    검색어 관리
                </label>
                <div className="flex mb-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="검색어 입력"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                    />
                    <button
                        onClick={handleAddSearchTerm}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
                    >
                        추가
                    </button>
                </div>

                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    {automation.searchTerms.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {automation.searchTerms.map((term, index) => (
                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
                  <span className={index === automation.currentTermIndex ? 'font-bold text-blue-600' : ''}>
                    {term}
                  </span>
                                    <button
                                        onClick={() => handleRemoveSearchTerm(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-2 text-center text-gray-500">검색어가 없습니다</p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">현재 상태</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                    <p>
                        <span className="font-medium">상태:</span> {automation.enabled ? '실행 중' : '중지됨'}
                    </p>
                    <p>
                        <span className="font-medium">다음 검색어:</span> {automation.searchTerms[automation.currentTermIndex] || '없음'}
                    </p>
                    <p>
                        <span className="font-medium">실행 간격:</span> {automation.interval}분
                    </p>
                    <p>
                        <span className="font-medium">주소 검증:</span> {automation.verifyAddressAutomatically ? '활성화' : '비활성화'}
                    </p>
                </div>
            </div>
        </div>
    );
};