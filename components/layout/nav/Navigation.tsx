'use client'
import React from 'react';
import {navItems} from "@/lib/menu";
import Link from "next/link";
import {usePathname} from "next/navigation";

function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 lg:top-0 w-full bg-white shadow-lg">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="relative flex items-center h-16">

                    <div className="flex items-center justify-center w-full">
                        {navItems.map((item, index) => (
                            <Link href={item.link}
                                  key={index}
                                  className="flex flex-col items-center w-1/3 p-2"
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