'use client'
import React from 'react';
import {SearchIcon} from "@/lib/icons";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Form from "next/form";
import {HiMiniXMark} from "react-icons/hi2";

function SearchInput() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('searchTerm');

    const handleSearch = (formData: FormData) => {
        const searchValue = formData.get('searchTerm')?.toString();
        if (!searchValue) {
            return;
        }

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('searchTerm', searchValue);

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`${pathname}${query}`);
    }

    const handleClear = () => {
        // 현재 URL의 검색 파라미터를 모두 가져옴
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        // searchTerm 파라미터만 제거
        current.delete('searchTerm');

        // 다른 검색 파라미터가 있는 경우를 위한 처리
        const remainingParams = current.toString();
        const query = remainingParams ? `?${remainingParams}` : '';

        // 현재 경로에 남은 파라미터를 붙여서 이동
        router.push(`${pathname}${query}`);
    }

    return (
        <div className={'flex p-2 justify-between flex-row items-center w-full h-[5vh] mt-[6vh]'}>
            <Form action={handleSearch} className={'w-full'}>
                <div className={'flex px-2 flex-row items-center rounded-lg border w-full'}>
                    <input
                        name={'searchTerm'}
                        className={'p-2 w-full items-center text-start justify-center rounded-lg'}
                        placeholder={'검색어를 입력해주세요.'}
                    />
                    <button type="submit">
                        <SearchIcon/>
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={'bg-sky-400 rounded-full text-white text-sm mx-1 p-1'}
                        >
                            <HiMiniXMark className={'w-5 h-5'}/>
                        </button>
                    )}
                </div>
            </Form>

        </div>
    );
}

export default SearchInput;