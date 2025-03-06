import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 py-8 lg:py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between mb-8">
                    {/* 회사 정보 */}
                    <div className="mb-6 md:mb-0">
                        <h3 className="font-bold text-lg mb-3">TripSpot</h3>
                        <span className="text-gray-500 text-sm">
                            주소: 서울특별시 지구 어딘가로 123<br />
                            대표: 우주
                        </span>
                    </div>

                    {/* 링크 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-3">서비스</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">서비스 소개</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">이용 요금</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">자주 묻는 질문</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">고객지원</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">고객센터</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">이용약관</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900">개인정보처리방침</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <h4 className="font-bold mb-2">고객센터</h4>
                            <p className="text-gray-600">E-mail:cocacola158500@gmail.com</p>
                            <p className="text-gray-600">연락처:1588-1234</p>
                        </div>
                    </div>
                </div>

                {/* 소셜 미디어 및 저작권 */}
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        © {currentYear} TripSpot. All rights reserved.
                    </p>

                    <div className="flex space-x-4">
                        <Link href="#" className="text-gray-500 hover:text-gray-800">
                            <FaFacebook size={20} />
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-800">
                            <FaTwitter size={20} />
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-800">
                            <FaInstagram size={20} />
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-800">
                            <FaYoutube size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;