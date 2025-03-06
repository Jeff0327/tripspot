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
                        <h3 className="font-bold text-lg mb-3">서비스 이름</h3>
                        <p className="text-gray-600 mb-2">더 나은 서비스를 위해 항상 노력합니다.</p>
                        <p className="text-gray-500 text-sm">
                            주소: 서울특별시 강남구 테헤란로 123<br />
                            사업자등록번호: 123-45-67890<br />
                            대표: 홍길동
                        </p>
                    </div>

                    {/* 링크 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-3">서비스</h4>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">서비스 소개</Link></li>
                                <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900">이용 요금</Link></li>
                                <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">자주 묻는 질문</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">고객지원</h4>
                            <ul className="space-y-2">
                                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">고객센터</Link></li>
                                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">이용약관</Link></li>
                                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">개인정보처리방침</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <h4 className="font-bold mb-3">고객센터</h4>
                            <p className="text-gray-600 mb-2">평일 10:00 - 18:00</p>
                            <p className="text-lg font-semibold mb-3">1588-1234</p>
                            <p className="text-gray-600 text-sm">
                                점심시간: 12:30 - 13:30<br />
                                토/일/공휴일 휴무
                            </p>
                        </div>
                    </div>
                </div>

                {/* 소셜 미디어 및 저작권 */}
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        © {currentYear} 서비스 이름. All rights reserved.
                    </p>

                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-500 hover:text-gray-800">
                            <FaFacebook size={20} />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-800">
                            <FaTwitter size={20} />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-800">
                            <FaInstagram size={20} />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-800">
                            <FaYoutube size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;