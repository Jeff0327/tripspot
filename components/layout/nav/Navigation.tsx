'use client'
import React from 'react';
import {navItems} from "@/lib/menu";
import Link from "next/link";
import {usePathname} from "next/navigation";

function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 lg:left-0 lg:top-0 lg:h-full w-full lg:w-auto bg-white shadow-lg z-30 lg:mt-[10vh]">
            <div className="max-w-screen-xl lg:max-w-none mx-auto px-4 lg:h-full">
                <div className="relative flex items-center h-full">
                    <div className="fixed bottom-0 lg:static lg:flex lg:flex-col lg:h-full lg:justify-start left-0 right-0 flex items-center justify-center w-full border-t lg:border-t-0 lg:py-8 bg-white">
                        {navItems.map((item, index) => (
                            <Link href={item.link}
                                  key={index}
                                  className="flex flex-col items-center w-1/3 lg:w-full lg:mb-8 p-2"
                                  style={{
                                      color: pathname.includes(item.link) ? item.activeColor : '#9CA3AF'
                                  }}
                            >
                                <item.icon className="h-6 w-6"/>
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;