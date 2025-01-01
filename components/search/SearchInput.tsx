import React from 'react';

function SearchInput() {
    return (
        <div className={'flex items-center border rounded-lg w-full p-2 h-16 border-gray-300'}>
            <div className={'p-2'}>
                <input className={'flex items-center justify-center'} placeholder={'검색어를 입력해주세요.'}/>
            </div>

        </div>
    );
}

export default SearchInput;