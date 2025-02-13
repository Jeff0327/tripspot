import React from 'react';
import Link from "next/link";
import Auth from "@/components/auth/Auth";

function Header() {
    return (
        <div
            className={'fixed flex justify-between items-center top-0 left-0 right-0 h-[5vh] bg-white shadow-md px-4 z-50'}>
            <Link href={'/main'}>
                <h1 className="text-lg font-jalnan"><span className={'text-blue-500'}>T</span>rip <span
                    className={'text-sky-500'}>S</span>p<span className={'text-red-500'}>o</span>t</h1>
            </Link>
            <Auth/>
        </div>
    );
}

export default Header;