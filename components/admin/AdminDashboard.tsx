'use client'

import React from 'react';
import {User} from '@supabase/auth-js';
import Menu from "@/components/layout/header/Menu";
import {useRouter} from "next/navigation";
import { FaHome } from "react-icons/fa";
interface AdminCardProps {
    title: string;
    icon: React.ReactNode;
    description: string;
    onClick?: () => void;
}

function AdminCard({title, icon, description, onClick}: AdminCardProps) {
    return (
        <div
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="text-lg font-jalnan mb-2">{title}</h3>
            <p className="text-gray-600 font-jmt">{description}</p>
        </div>
    );
}

interface AdminDashboardProps {
    user: User;
}

export default function AdminDashboard({user}: AdminDashboardProps) {
    const router = useRouter()
    return (
        <div className="container mx-auto p-2">
            <div className={'flex justify-between items-center'}>
                <div className={'flex flex-row items-center gap-1'}>
                    <button onClick={()=>router.push('/')}><FaHome className={'w-6 h-6'} /></button>
                <h1 className="text-xl font-jalnan">관리자 페이지</h1>
                </div>
                <Menu user={user}/></div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <span className="text-lg">👤</span>
                    </div>
                    <div>
                        <p className="font-jmt text-sm text-gray-500">관리자</p>
                        <p className="font-jmt">{user.email}</p>
                    </div>
                </div>

                <h2 className="text-xl font-jmt mb-4">관리자 기능</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AdminCard
                        title="사용자 관리"
                        icon={<span>👥</span>}
                        description="사용자 계정 관리 및 권한 설정"
                        onClick={() => window.location.href = '/admin/users'}
                    />
                    <AdminCard
                        title="콘텐츠 관리"
                        icon={<span>📝</span>}
                        description="포스트 및 콘텐츠 관리"
                        onClick={() => window.location.href = '/admin/content'}
                    />
                    <AdminCard
                        title="통계 및 분석"
                        icon={<span>📊</span>}
                        description="사이트 사용 통계 및 분석"
                        onClick={() => window.location.href = '/admin/analytics'}
                    />
                    <AdminCard
                        title="설정"
                        icon={<span>⚙️</span>}
                        description="사이트 설정 및 환경 구성"
                        onClick={() => window.location.href = '/admin/settings'}
                    />
                </div>
            </div>
        </div>
    );
}