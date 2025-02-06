'use client'
import React from 'react';
import {SearchIcon} from "@/lib/icons";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Form from "next/form";

function SearchInput() {

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSearch = (formData: FormData) => {
        const searchValue = formData.get('searchTerm')?.toString();
        if (!searchValue) {
            return;
        }

        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('search', searchValue);

        const search = current.toString();
        const query = search ? `?${search}` : '';

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
                </div>
            </Form>
        </div>
    );
}

export default SearchInput;