import React from 'react';
import Link from "next/link";

function NotFound() {
    return (
        <>
            <div>NOT FOUND 404</div>
            <Link href={"/"}>돌아가기</Link>
        </>
    );
}

export default NotFound;