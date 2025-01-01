import React from 'react';
import {SearchIcon} from "@/lib/icons";

function SearchInput() {
    return (
        <div className={'flex p-2 justify-between'}>
            <div className={'rounded-lg border w-full'}>
                <input className={'flex p-2 items-center text-center justify-center'} placeholder={'검색어를 입력해주세요.'}/>
            </div>
            <SearchIcon/>
        </div>
    );
}

export default SearchInput;