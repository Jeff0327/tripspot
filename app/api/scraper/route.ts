import { NextRequest, NextResponse } from 'next/server';
import { addStore } from "@/app/(main)/food/actions";
import { createClient } from "@/utils/supabase/server";
import { ERROR_CODES } from "@/utils/errorMessage";
import {StoreWithVideoInfo, YouTubeSearchResponse, YouTubeVideoResponse} from "@/lib/types";
import {
    extractAddressImproved,
    extractBusinessHours,
    extractContact,
    extractDescription,
    extractRestaurantName
} from "@/utils/utils";

// YouTube API 키 (환경 변수로 관리)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface SearchResult {
    success: boolean;
    message?: string;
    data?: StoreWithVideoInfo[];
}

interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        success: Array<{ name: string; message: string }>;
        failed: Array<{ name: string; error: string }>;
    };
}

async function searchYoutubeRestaurants(searchQuery: string, maxResults: number = 10): Promise<SearchResult> {
    if (!YOUTUBE_API_KEY) {
        throw new Error('YouTube API 키가 설정되지 않았습니다.');
    }

    try {
        // YouTube 검색 API 호출
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json() as YouTubeSearchResponse;

        if (!searchData.items || searchData.items.length === 0) {
            return { success: false, message: '검색 결과가 없습니다.' };
        }

        // 검색된 영상의 세부 정보 가져오기
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;

        const videoResponse = await fetch(videoUrl);
        const videoData = await videoResponse.json() as YouTubeVideoResponse;

        if (!videoData.items || videoData.items.length === 0) {
            return { success: false, message: '영상 정보를 가져올 수 없습니다.' };
        }

        // 맛집 정보 추출 (기본적인 정보 추출 방식 사용)
        const restaurants = await processYoutubeVideos(videoData.items);
        return { success: true, data: restaurants };
    } catch (error) {
        console.error('YouTube API 호출 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        };
    }
}

// 기본적인 정보 추출 로직
async function processYoutubeVideos(videos: YouTubeVideoResponse['items']): Promise<StoreWithVideoInfo[]> {
    const stores: StoreWithVideoInfo[] = [];

    // supabase에서 user_id 가져오기
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id || '';

    if (!user_id) {
        console.error('사용자 인증 정보가 없습니다.');
        return [];
    }

    for (const video of videos) {
        try {
            const snippet = video.snippet;
            const title = snippet.title;
            const description = snippet.description;
            const thumbnailUrl = snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || '';
            const viewCount = parseInt(video.statistics.viewCount) || 0;
            const likeCount = parseInt(video.statistics.likeCount) || 0;

            // 1. 제목에서 가게 이름 추출 시도
            const name = extractRestaurantName(title);

            // 2. 설명에서 주소 추출 시도 (개선된 방식)
            const address = extractAddressImproved(title, description);

            // 주소가 없는 경우는 건너뛰기 (필수값)
            if (!address) {
                console.log(`주소 정보 없음, 건너뜀: ${name}`);
                continue;
            }

            // 3. 설명 추출
            const desc = extractDescription(description, title);

            // 4. 별점 계산 (조회수와 좋아요 수를 기반으로 한 간단한 알고리즘)
            const likeRatio = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;
            const star = Math.min(5, Math.max(3, 3 + (likeRatio > 1 ? 2 : likeRatio > 0.5 ? 1 : 0)));

            // YouTube iframe 포맷을 적용한 상세 설명 생성
            const youtubeEmbed = `<div data-youtube-video=""><iframe class="w-full aspect-video rounded-lg" width="640" height="480" allowfullscreen="true" autoplay="false" disablekbcontrols="false" enableiframeapi="false" endtime="0" ivloadpolicy="0" loop="false" modestbranding="false" origin="" playlist="" src="https://www.youtube.com/embed/${video.id}" start="0"></iframe></div>`;

            // 향상된 detail 정보 구성
            let detail = `<h2>${title}</h2>\n\n`;

            // 기본 정보 섹션
            detail += `<div class="store-info">\n`;
            detail += `<p><strong>가게명:</strong> ${name || '정보 없음'}</p>\n`;
            detail += `<p><strong>주소:</strong> ${address}</p>\n`;

            // 추가 정보 섹션
            const contact = extractContact(description);
            const businessHours = extractBusinessHours(description);

            detail += `<p><strong>연락처:</strong> ${contact || '정보 없음'}</p>\n`;
            detail += `<p><strong>영업시간:</strong> ${businessHours || '정보 없음'}</p>\n`;

            // 유튜브 통계 추가
            detail += `<p><strong>조회수:</strong> ${viewCount.toLocaleString()}회</p>\n`;
            detail += `<p><strong>좋아요:</strong> ${likeCount.toLocaleString()}개</p>\n`;
            detail += `</div>\n\n`;

            // 설명 섹션
            detail += `<div class="store-description">\n`;
            detail += `<h3>설명</h3>\n<p>${desc}</p>\n`;
            detail += `</div>\n\n`;

            // 원본 설명 섹션 (축약)
            if (description && description.length > 0) {
                const shortDesc = description.length > 500
                    ? description.substring(0, 500) + '...'
                    : description;

                detail += `<div class="youtube-description">\n`;
                detail += `<h3>유튜브 원본 설명</h3>\n`;
                detail += `<pre style="white-space: pre-wrap;">${shortDesc}</pre>\n`;
                detail += `</div>\n\n`;
            }

            // 유튜브 영상 섹션
            detail += `<div class="youtube-video">\n`;
            detail += `<h3>유튜브 영상</h3>\n${youtubeEmbed}\n`;
            detail += `<p><a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">유튜브에서 보기</a></p>\n`;
            detail += `</div>\n`;

            // 맛집으로 볼 수 있는 충분한 정보가 있는 경우만 추가
            if (name) {
                stores.push({
                    name,
                    address,
                    desc,
                    mainimage: thumbnailUrl,
                    images: JSON.stringify([thumbnailUrl]), // 문자열로 변환
                    videoId: video.id,
                    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                    detail,
                    star: Number(star),
                    tag: 'food',
                    user_id,
                    like: 0
                });
            }
        } catch (error) {
            console.error('영상 처리 오류:', error);
            // 오류가 있더라도 다음 영상 처리 계속
            continue;
        }
    }

    return stores;
}

async function importYoutubeRestaurantsToDatabase(stores: StoreWithVideoInfo[]): Promise<ImportResult> {
    interface ResultItem {
        name: string;
        message?: string;
        error?: string;
    }

    const results = {
        success: [] as ResultItem[],
        failed: [] as ResultItem[]
    };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            message: '로그인 상태가 아닙니다. 로그인 후 다시 시도해주세요.',
        };
    }

    for (const store of stores) {
        try {
            // 유효성 검사 - 필수 필드 확인
            if (!store.name || !store.address) {
                results.failed.push({
                    name: store.name || '이름 없음',
                    error: '필수 정보(이름 또는 주소)가 누락되었습니다.'
                });
                continue;
            }

            // 이미 존재하는 가게인지 확인 (이름과 주소로 중복 체크)
            const { data: existingStore } = await supabase
                .from('store')
                .select('id')
                .eq('name', store.name)
                .eq('address', store.address)
                .maybeSingle();

            if (existingStore) {
                results.failed.push({
                    name: store.name,
                    error: '이미 등록된 가게입니다.'
                });
                continue;
            }

            // FormData 객체 생성
            const formData = new FormData();
            formData.append('name', store.name);
            formData.append('desc', store.desc || '');
            formData.append('address', store.address);
            // POST 요청에서는 detail 필드를 필요로 하지 않으므로 제외
            formData.append('tag', store.tag || 'food');


            // 썸네일 이미지 처리
            if (store.mainimage) {
                formData.append('mainImage', store.mainimage);
            }

            // 이미지 배열 처리
            if (store.images) {
                formData.append('images', store.images); // 이미 JSON 문자열
            }

            // 저장 함수 호출
            const result = await addStore(formData);

            if (result.code === ERROR_CODES.SUCCESS) {
                results.success.push({
                    name: store.name,
                    message: result.message
                });
            } else {
                results.failed.push({
                    name: store.name,
                    error: result.message
                });
            }
        } catch (error) {
            results.failed.push({
                name: store.name || '알 수 없는 가게',
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }

    return {
        success: results.success.length > 0,
        message: `총 ${stores.length}개 중 ${results.success.length}개 등록 성공, ${results.failed.length}개 실패`,
    };
}

// API 라우트 핸들러
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query) {
        return NextResponse.json(
            { success: false, message: '검색어가 필요합니다.' },
            { status: 400 }
        );
    }

    try {
        const results = await searchYoutubeRestaurants(query, limit);
        return NextResponse.json(results);
    } catch (error) {
        console.error('검색 오류:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.restaurants || !Array.isArray(data.restaurants) || data.restaurants.length === 0) {
            return NextResponse.json(
                { success: false, message: '등록할 맛집 데이터가 없습니다.' },
                { status: 400 }
            );
        }

        // 클라이언트에서 보낸 데이터를 StoreWithVideoInfo 타입으로 변환
        const stores: StoreWithVideoInfo[] = data.restaurants
            .filter((restaurant: StoreWithVideoInfo) => restaurant && restaurant.address) // 주소가 없는 경우 필터링
            .map((restaurant: StoreWithVideoInfo) => ({
                name: restaurant.name,
                address: restaurant.address,
                desc: restaurant.desc || '',
                mainimage: restaurant.mainimage || '',
                images: JSON.stringify(restaurant.mainimage ? [restaurant.mainimage] : []),
                videoId: restaurant.videoId || '',
                videoUrl: restaurant.videoUrl || '',
                tag: 'food',
                star: 0,
                user_id: restaurant.user_id || '',
                like: 0
            }));

        const results = await importYoutubeRestaurantsToDatabase(stores);
        return NextResponse.json(results);
    } catch (error) {
        console.error('등록 오류:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
}