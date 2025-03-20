// ResultPanel.tsx
import React from 'react';
import {ImportResult} from "@/lib/types";


interface ResultPanelProps {
    importResults: ImportResult;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
                                                            importResults
                                                        }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">등록 결과</h2>
            <p className="mb-4">{importResults.message}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {importResults.details?.success && importResults.details.success.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-md">
                        <h3 className="font-medium text-green-700 mb-2">성공 ({importResults.details.success.length})</h3>
                        <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                            {importResults.details.success.map((item, i) => (
                                <li key={`success-${i}`} className="text-sm ml-2 text-green-800">{item.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {importResults.details?.failed && importResults.details.failed.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-md">
                        <h3 className="font-medium text-red-700 mb-2">실패 ({importResults.details.failed.length})</h3>
                        <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                            {importResults.details.failed.map((item, i) => (
                                <li key={`failed-${i}`} className="text-sm ml-2 text-red-800">
                                    {item.name} - {item.error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};