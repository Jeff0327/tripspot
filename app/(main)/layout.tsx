import React, {Suspense} from 'react';
import Navigation from "@/components/layout/nav/Navigation";
import Header from "@/components/layout/header/Header";

interface RootLayoutProps {
    children: React.ReactNode;
}

function RootLayout({children}: RootLayoutProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div>
                <div className={'mb-[5vh]'}>
                    <Header/>
                </div>
                <div className="lg:flex">
                    <div className="lg:w-[110px] bg-red-500 hidden lg:block">
                        {/* 이 영역은 네비게이션과 동일한 너비의 공간을 확보합니다 */}
                    </div>
                    <Navigation />
                    <main className="w-full lg:flex-1 pb-16 lg:pb-0">
                        {children}
                    </main>
                </div>
            </div>
        </Suspense>
    );
}

export default RootLayout;