'use client'
import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
    address: string;
}

// LatLng 타입 정의
interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
}

// Kakao Maps API에 대한 타입 정의
declare global {
    interface Window {
        kakao: {
            maps: {
                load: (callback: () => void) => void;
                LatLng: new (lat: number, lng: number) => KakaoLatLng;
                Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
                Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
                InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow;
                services: {
                    Geocoder: new () => KakaoGeocoder;
                    Status: {
                        OK: string;
                        ERROR: string;
                        ZERO_RESULT: string;
                    }
                }
            }
        }
    }
}

// Kakao Maps API 타입 정의
interface KakaoMapOptions {
    center: KakaoLatLng;
    level: number;
}

interface KakaoMap {
    setCenter: (latLng: KakaoLatLng) => void;
}

interface KakaoMarkerOptions {
    map: KakaoMap;
    position: KakaoLatLng;
}

interface KakaoMarker {
    setMap: (map: KakaoMap | null) => void;
    getPosition: () => KakaoLatLng;
}

interface KakaoInfoWindowOptions {
    content: string;
}

interface KakaoInfoWindow {
    open: (map: KakaoMap, marker: KakaoMarker) => void;
    close: () => void;
}

// Geocoder 결과 타입 정의
interface KakaoGeocoderResult {
    address_name: string;
    y: string; // 위도 (latitude)
    x: string; // 경도 (longitude)
    address: {
        address_name: string;
        region_1depth_name: string;
        region_2depth_name: string;
        region_3depth_name: string;
    };
    road_address: {
        address_name: string;
        building_name: string;
        road_name: string;
    } | null;
}

interface KakaoGeocoder {
    addressSearch: (
        address: string,
        callback: (
            result: KakaoGeocoderResult[],
            status: string
        ) => void
    ) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ address }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 카카오맵 로딩 함수
        const loadKakaoMap = () => {
            // 이미 kakao maps 객체가 있는지 확인
            if (window.kakao && window.kakao.maps) {
                return initMap();
            }

            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_JS_KEY!}&libraries=services&autoload=false`;
            script.async = true;

            script.onload = () => {
                // 스크립트 로드 후 maps 객체 초기화
                window.kakao.maps.load(() => {
                    console.log('카카오맵 로드 완료');
                    initMap();
                });
            };

            script.onerror = () => {
                console.error('카카오맵 스크립트 로드 실패');
                setError('카카오맵을 불러오는 중 오류가 발생했습니다');
                setIsLoading(false);
            };

            document.head.appendChild(script);
        };

        // 지도 초기화 함수
        const initMap = () => {
            if (!mapRef.current || !address) return;

            try {
                console.log('지도 초기화 시작');

                // 지도 생성
                const options = {
                    center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
                    level: 3
                };

                const map = new window.kakao.maps.Map(mapRef.current, options);
                console.log('지도 생성 완료');

                // 주소-좌표 변환 객체 생성
                const geocoder = new window.kakao.maps.services.Geocoder();

                // 주소로 좌표 검색
                geocoder.addressSearch(address, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                        const coords = new window.kakao.maps.LatLng(+result[0].y, +result[0].x);

                        // 결과값으로 받은 위치를 마커로 표시
                        const marker = new window.kakao.maps.Marker({
                            map: map,
                            position: coords
                        });

                        // 인포윈도우로 장소에 대한 설명 표시
                        const infowindow = new window.kakao.maps.InfoWindow({
                            content: '<div style="width:150px;text-align:center;padding:6px 0;">위치</div>'
                        });
                        infowindow.open(map, marker);

                        // 지도 중심을 결과값으로 받은 위치로 이동
                        map.setCenter(coords);
                        console.log('지도 위치 설정 완료');
                    } else {
                        setError('주소를 찾을 수 없습니다');
                    }

                    setIsLoading(false);
                });
            } catch (error) {
                console.error('지도 초기화 중 오류 발생:', error);
                setError('지도를 초기화하는 중 오류가 발생했습니다');
                setIsLoading(false);
            }
        };

        // 실행
        loadKakaoMap();

        // 컴포넌트가 언마운트될 때 정리
        return () => {
            // 추가적인 정리 작업이 필요하면 여기에 추가
        };
    }, [address]);

    return (
        <div className="w-full h-64 rounded-lg my-2 relative">
            <div
                ref={mapRef}
                className="w-full h-full rounded-lg"
                style={{
                    display: 'block',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            ></div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
                    지도를 불러오는 중...
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};

export default KakaoMap;