import React from 'react';
import Link from "next/link";

function Header() {
    return (
        <Link href={'/main'} className="fixed top-0 left-0 right-0 h-[5vh] bg-white shadow-md flex items-center px-4 z-50">
            <h1 className="text-lg font-jalnan"><span className={'text-blue-500'}>T</span>rip <span className={'text-sky-500'}>S</span>p<span className={'text-red-500'}>o</span>t</h1>
        </Link>
    );
}

export default Header;