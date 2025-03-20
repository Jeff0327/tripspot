// LogPanel.tsx
import React from 'react';

interface LogPanelProps {
    logs: string[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">활동 로그</h2>
            <div className="bg-gray-100 rounded-md p-2 h-96 overflow-y-auto font-mono text-sm">
                {logs.length > 0 ? (
                    logs.map((log, index) => (
                        <div key={index} className="mb-1 border-b border-gray-200 pb-1">
                            {log}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center pt-4">로그가 없습니다</p>
                )}
            </div>
        </div>
    );
};