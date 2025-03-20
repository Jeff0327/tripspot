import { NextRequest, NextResponse } from 'next/server';

// 카카오맵 API 키 (환경 변수로 관리)
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json(
            { success: false, message: '검색어가 필요합니다.' },
            { status: 400 }
        );
    }

    if (!KAKAO_REST_API_KEY) {
        return NextResponse.json(
            { success: false, message: 'API 키가 설정되지 않았습니다.' },
            { status: 500 }
        );
    }

    try {
        // 카카오 로컬 API 호출 (키워드 검색)
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { success: false, message: `카카오맵 API 오류: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // 검색 결과가 있는 경우 첫 번째 결과 반환
        if (data.documents && data.documents.length > 0) {
            const firstResult = data.documents[0];

            return NextResponse.json({
                success: true,
                data: {
                    address: firstResult.address_name || firstResult.road_address_name,
                    roadAddress: firstResult.road_address_name,
                    placeName: firstResult.place_name,
                    placeId: firstResult.id
                }
            });
        } else {
            return NextResponse.json(
                { success: false, message: '검색 결과가 없습니다.' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('카카오맵 API 검색 오류:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
}