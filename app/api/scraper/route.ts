import { NextRequest, NextResponse } from 'next/server';
import { addStore } from "@/app/(main)/food/actions";
import { createClient } from "@/utils/supabase/server";
import { ERROR_CODES } from "@/utils/errorMessage";
import OpenAI from 'openai';

// YouTube API 키 (환경 변수로 관리)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
// OpenAI API 키 (환경 변수로 관리)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

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

// Store 타입 정의 (Supabase 테이블 기반)
interface Store {
    id?: string; // UUID
    created_at?: string;
    name: string;
    desc?: string;
    like?: number;
    star?: number;
    images?: string; // JSON 문자열 형태의 이미지 배열
    options?: JSON; // jsonb 타입
    detail?: string;
    tag?: string;
    address: string;
    review_ids?: string[]; // UUID 배열
    user_id: string; // UUID
    mainimage?: string;
    addressVerified?: boolean;
    // 추가 필드 (API 처리용)
    videoId?: string;
    videoUrl?: string;
    contents?: string;
    rating?: string;
}

interface SearchResult {
    success: boolean;
    message?: string;
    data?: Store[];
}

interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        success: Array<{ name: string; message: string }>;
        failed: Array<{ name: string; error: string }>;
    };
}

interface GPTAnalysisResult {
    restaurantName: string | null;
    address: string | null;
    description: string | null;
    contact: string | null;
    businessHours: string | null;
    rating: number | null;
    specialties: string | null;
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

        // 맛집 정보 추출 (GPT 분석 적용)
        const restaurants = await processYoutubeVideosWithGPT(videoData.items);
        return { success: true, data: restaurants };
    } catch (error) {
        console.error('YouTube API 호출 오류:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        };
    }
}

async function analyzeWithGPT(title: string, description: string): Promise<GPTAnalysisResult> {
    try {
        // 입력 텍스트 준비 (토큰 수 제한을 위해 설명 앞부분만 사용)
        const maxDescLength = 3000; // 약 750-1000 토큰 정도
        const trimmedDesc = description.length > maxDescLength
            ? description.substring(0, maxDescLength)
            : description;

        const inputText = `제목: ${title}\n\n설명: ${trimmedDesc}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `당신은 유튜브 맛집 리뷰 영상의 설명에서 가게 정보를 추출하는 전문가입니다. 
                    다음 유튜브 영상 제목과 설명에서 식당 관련 정보를 추출해주세요.
                    다음 형식의 JSON으로 응답해주세요:
                    {
                        "restaurantName": "식당 이름",
                        "address": "주소",
                        "description": "가게 특징이나 음식 설명",
                        "contact": "연락처",
                        "businessHours": "영업시간",
                        "rating": 평점 (정수 또는 소수, 1-5 사이),
                        "specialties": "대표 메뉴"
                    }
                    
                    정보가 명확하지 않거나 없는 경우 해당 필드는 null로 설정해주세요.
                    가게 이름은 해시태그가 아닌 실제 식당 이름을 찾아주세요.
                    특히 '가게명:', '주소:', '전화:' 같은 키워드 다음에 오는 정보에 주목하세요.`
                },
                {
                    role: "user",
                    content: inputText
                }
            ],
            temperature: 0.1, // 정확한 추출을 위해 낮은 temperature 사용
            response_format: { type: "json_object" } // JSON 응답 강제
        });

        // 응답 파싱 및 반환
        const content = completion.choices[0].message.content;
        if(content) {
            return JSON.parse(content)
        }

    } catch (error) {
        console.error('GPT 분석 오류:', error);
        // 오류 발생 시 기본값 반환
        return {
            restaurantName: null,
            address: null,
            description: null,
            contact: null,
            businessHours: null,
            rating: null,
            specialties: null
        };
    }
}

async function processYoutubeVideosWithGPT(videos: YouTubeVideoResponse['items']): Promise<Store[]> {
    const stores: Store[] = [];

    // supabase에서 user_id 가져오기 (API 라우트에서 별도로 처리할 수도 있음)
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

            // GPT API를 사용하여 정보 추출
            const gptResult = await analyzeWithGPT(title, description);

            // 결과에서 유용한 정보 추출
            let name = gptResult.restaurantName || '';
            let address = gptResult.address || '';
            let desc = gptResult.description || '';
            const rating = gptResult.rating ? gptResult.rating.toString() : '3';
            const star = gptResult.rating || 3; // 평점을 star 필드에 맞게 변환

            // GPT가 식당 이름을 찾지 못한 경우 기본 방법으로 보완
            if (!name) {
                // 영상 제목에서 기본 정보 추출
                name = title.split('|')[0].split('-')[0].split('_')[0].trim();
                name = name.length > 20 ? name.substring(0, 20) : name;
            }

            // 설명이 없거나 짧은 경우 보완
            if (!desc || desc.length < 10) {
                desc = description.split('\n')[0];
                desc = desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
            }

            // 영상 내용을 설명으로 사용
            let detail = `${title}\n\n`;

            // GPT가 찾은 정보 추가
            if (gptResult.restaurantName) detail += `가게명: ${gptResult.restaurantName}\n`;
            if (gptResult.address) detail += `주소: ${gptResult.address}\n`;
            if (gptResult.contact) detail += `연락처: ${gptResult.contact}\n`;
            if (gptResult.businessHours) detail += `영업시간: ${gptResult.businessHours}\n`;
            if (gptResult.specialties) detail += `대표 메뉴: ${gptResult.specialties}\n\n`;

            // 원본 설명 추가
            detail += `${description}\n\n`;

            // 출처 표시
            detail += `출처: YouTube - https://www.youtube.com/watch?v=${video.id}`;

            // 맛집으로 볼 수 있는 충분한 정보가 있는 경우만 추가
            if (name && (address || (desc && desc.length > 10))) {
                stores.push({
                    name,
                    address,
                    desc,
                    mainimage: thumbnailUrl,
                    images: JSON.stringify([thumbnailUrl]), // 문자열로 변환
                    videoId: video.id,
                    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                    detail,  // detail 필드 사용
                    star: Number(star),
                    tag: 'food',
                    user_id,
                    like: 0,
                    addressVerified: false
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

async function importYoutubeRestaurantsToDatabase(stores: Store[]): Promise<ImportResult> {
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

    for (const store of stores) {
        try {
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
            formData.append('address', store.address || '주소 정보가 없습니다.');
            formData.append('detail', store.detail || '');
            formData.append('tag', store.tag || 'food');

            // star 값이 있으면 문자열로 변환하여 추가
            if (store.star !== undefined) {
                formData.append('star', store.star.toString());
            }

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
                name: store.name,
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

        // 클라이언트에서 보낸 데이터를 Store 타입으로 변환
        const stores: Store[] = data.restaurants.map((restaurant: any) => ({
            name: restaurant.name,
            address: restaurant.address,
            desc: restaurant.desc,
            mainimage: restaurant.mainImage || restaurant.mainimage,
            images: JSON.stringify(restaurant.images || []),
            videoId: restaurant.videoId,
            videoUrl: restaurant.videoUrl,
            detail: restaurant.contents || restaurant.detail || '',
            tag: 'food',
            star: Number(restaurant.rating) || 3,
            user_id: restaurant.user_id || '',
            like: 0,
            addressVerified: false
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