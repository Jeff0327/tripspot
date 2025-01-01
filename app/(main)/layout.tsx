import React from 'react';
import Navigation from "@/components/nav/Navigation";
import SearchInput from "@/components/search/SearchInput";


function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <SearchInput/>
            <Navigation/>
            <main>
                {children}
            </main>
        </div>
    );
}

export default RootLayout;