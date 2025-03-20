import { NextRequest, NextResponse } from 'next/server';
import { addStore } from "@/app/(main)/food/actions";
import { createClient } from "@/utils/supabase/server";
import { ERROR_CODES } from "@/utils/errorMessage";

// YouTube API 키 (환경 변수로 관리)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 타입 정의
interface YouTubeSearchResponse {
    items: {
        id: {
            videoId: string;
        };
        snippet: {
            title: string;
            description: string;
            thumbnails: {
                default?: { url: string; width: number; height: number };
                medium?: { url: string; width: number; height: number };
                high?: { url: string; width: number; height: number };
            };
        };
    }[];
}

interface YouTubeVideoResponse {
    items: {
        id: string;
        snippet: {
            title: string;
            description: string;
            thumbnails: {
                default?: { url: string; width: number; height: number };
                medium?: { url: string; width: number; height: number };
                high?: { url: string; width: number; height: number };
            };
        };
        contentDetails: {
            duration: string;
        };
        statistics: {
            viewCount: string;
            likeCount: string;
            commentCount: string;
        };
    }[];
}

interface Restaurant {
    name: string;
    address: string;
    desc: string;
    mainImage: string;
    images: string[];
    videoId: string;
    videoUrl: string;
    contents: string;
}

interface SearchResult {
    success: boolean;
    message?: string;
    data?: Restaurant[];
}

interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        success: Array<{ name: string; message: string }>;
        failed: Array<{ name: string; error: string }>;
    };
}

/**
 * YouTube에서 맛집 관련 영상을 검색하여 데이터를 가져오는 함수
 */
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

        // 맛집 정보 추출
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

/**
 * YouTube 영상 정보에서 맛집 데이터를 추출하는 함수
 */
async function processYoutubeVideos(videos: YouTubeVideoResponse['items']): Promise<Restaurant[]> {
    // 주소 인식 정규식 패턴
    const addressPattern = /(?:서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[시도]?\s+(?:[가-힣]+(?:시|군|구))?\s+(?:[가-힣]+(?:읍|면|동|가|리))?\s+(?:[0-9-]+)?/g;

    // 식당 이름 인식 패턴 (OO식당, OO맛집, OO레스토랑 등)
    const restaurantNamePattern = /([가-힣a-zA-Z0-9]+)\s*(?:식당|맛집|레스토랑|가게|카페|분식|양식|일식|중식|한식|음식점)/g;

    const restaurants: Restaurant[] = [];

    for (const video of videos) {
        try {
            const snippet = video.snippet;
            const title = snippet.title;
            const description = snippet.description;
            const thumbnailUrl = snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || '';

            // 영상 제목이나 설명에서 가게 이름 추출
            let name = '';
            const nameMatches = [...title.matchAll(restaurantNamePattern), ...description.matchAll(restaurantNamePattern)];

            if (nameMatches && nameMatches.length > 0) {
                name = nameMatches[0][1];
            } else {
                // 이름 패턴을 찾지 못한 경우, 제목의 처음 부분 사용
                name = title.split('|')[0].split('-')[0].split('_')[0].trim();
                // 너무 긴 경우 자르기
                name = name.length > 20 ? name.substring(0, 20) : name;
            }

            // 주소 추출
            let address = '';
            const addressMatches = [...description.matchAll(addressPattern)];
            if (addressMatches && addressMatches.length > 0) {
                address = addressMatches[0][0];
            }

            // 설명 추출 (설명의 처음 부분)
            let desc = description.split('\n')[0];
            desc = desc.length > 150 ? desc.substring(0, 150) + '...' : desc;

            // 영상 내용을 설명으로 사용
            const contents = `${title}\n\n${description}\n\n출처: YouTube - https://www.youtube.com/watch?v=${video.id}`;

            // 맛집으로 볼 수 있는 충분한 정보가 있는 경우만 추가
            if (name && (address || (desc && desc.length > 10))) {
                restaurants.push({
                    name,
                    address,
                    desc: desc || title,
                    mainImage: thumbnailUrl,
                    images: [thumbnailUrl],
                    videoId: video.id,
                    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                    contents
                });
            }
        } catch (error) {
            console.error('영상 처리 오류:', error);
            // 오류가 있더라도 다음 영상 처리 계속
            continue;
        }
    }

    return restaurants;
}

/**
 * 추출된 맛집 정보를 데이터베이스에 등록하는 함수
 */
async function importYoutubeRestaurantsToDatabase(restaurants: Restaurant[]): Promise<ImportResult> {
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
            message: '로그인 상태가 아닙니다. 로그인 후 다시 시도해주세요.'
        };
    }

    for (const restaurant of restaurants) {
        try {
            // 이미 존재하는 가게인지 확인 (이름과 주소로 중복 체크)
            const { data: existingStore } = await supabase
                .from('store')
                .select('id')
                .eq('name', restaurant.name)
                .eq('address', restaurant.address)
                .maybeSingle();

            if (existingStore) {
                results.failed.push({
                    name: restaurant.name,
                    error: '이미 등록된 가게입니다.'
                });
                continue;
            }

            // FormData 객체 생성
            const formData = new FormData();
            formData.append('name', restaurant.name);
            formData.append('desc', restaurant.desc);
            formData.append('address', restaurant.address || '주소 정보가 없습니다.');
            formData.append('contents', restaurant.contents || '');
            formData.append('rating', '3');  // 기본 평점
            formData.append('tag', 'res');

            // 썸네일 이미지 처리
            if (restaurant.mainImage) {
                formData.append('mainImage', restaurant.mainImage);

                if (restaurant.images && restaurant.images.length > 0) {
                    formData.append('images', JSON.stringify(restaurant.images));
                }
            }

            // 저장 함수 호출
            const result = await addStore(formData);

            if (result.code === ERROR_CODES.SUCCESS) {
                results.success.push({
                    name: restaurant.name,
                    message: result.message
                });
            } else {
                results.failed.push({
                    name: restaurant.name,
                    error: result.message
                });
            }
        } catch (error) {
            results.failed.push({
                name: restaurant.name,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    }

    return {
        success: results.success.length > 0,
        message: `총 ${restaurants.length}개 중 ${results.success.length}개 등록 성공, ${results.failed.length}개 실패`,
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

        const results = await importYoutubeRestaurantsToDatabase(data.restaurants);
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