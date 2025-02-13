import React from 'react';
import Menu from "@/components/layout/header/Menu";
import Link from "next/link";

function Auth() {

    return (
        <div className={'flex flex-row items-center gap-2 font-jmt text-sm'}>
            <Link href={'/login?isOpen=true'}>로그인</Link>
            <Menu/>
        </div>
    );
}

export default Auth;