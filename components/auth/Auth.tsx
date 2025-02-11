import React from 'react';
import Menu from "@/components/layout/header/Menu";
import SelectAuthType from "@/components/auth/SelectAuthType";

function Auth() {

    return (
        <div>
            <div className={'flex flex-row items-center gap-2 font-jmt text-sm'}>
                <SelectAuthType/>
                <Menu/>
            </div>
        </div>
    );
}

export default Auth;