import React, {Suspense} from 'react';
import Navigation from "@/components/layout/nav/Navigation";
import SearchInput from "@/components/layout/search/SearchInput";
import Header from "@/components/layout/header/Header";

interface RootLayoutProps {
    children: React.ReactNode;
}

function RootLayout({children}: RootLayoutProps) {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen">
                <Header/>
                <Navigation/>
                <main>
                    {children}
                </main>
            </div>
        </Suspense>
    );
}

export default RootLayout;