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
        <div className={'flex p-2 justify-between'}>
            <Form action={handleSearch}>
                <div className={'rounded-lg border w-full'}>
                    <input
                        name={'searchTerm'}
                        className={'flex p-2 items-center text-center justify-center'}
                        placeholder={'검색어를 입력해주세요.'}
                    />
                </div>
            </Form>
            <SearchIcon/>
        </div>
    );
}

export default SearchInput;