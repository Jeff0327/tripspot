import React, {Suspense} from 'react';
import Navigation from "@/components/nav/Navigation";
import SearchInput from "@/components/search/SearchInput";

interface RootLayoutProps {
    children: React.ReactNode;
}

function RootLayout({children}: RootLayoutProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen">
                <SearchInput/>
                <Navigation/>
                <main>
                    {children}
                </main>
            </div>
        </Suspense>
    );
}

export default RootLayout;