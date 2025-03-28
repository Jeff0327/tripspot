// 제목에서 가게 이름 추출 (개선된 버전)
export function extractRestaurantName(title: string): string {
    // 괄호 안 내용 제거 (예: [부산맛집])
    const cleanTitle = title.replace(/\[[^\]]*\]|\([^\)]*\)/g, '').trim();

    // 특수 문자, 구분자로 흔히 사용되는 문자들을 기준으로 분리
    const parts = cleanTitle.split(/[\|\-_\/\\:;"'!@#$%^&*+=<>?~]/);

    // 가게 이름 후보들
    const candidates: string[] = [];

    // 각 파트에서 가게 이름 추출 시도
    for (const part of parts) {
        const cleaned = part.trim()
            // "맛집", "먹방", "리뷰", "투어" 등의 단어 제거
            .replace(/맛집|먹방|리뷰|투어|vlog|브이로그|맛도리|맛도사|쯔양|먹터뷰|강추|착한가격/gi, '')
            .trim();

        // 지역명 + 맛집 패턴 처리 (예: "서울 맛집" -> "")
        const locationMatch = cleaned.match(/(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*맛집/);
        if (locationMatch) {
            // 지역명만 남길 경우 이름이 너무 짧아지므로 패턴 자체를 제거
            const withoutLocation = cleaned.replace(locationMatch[0], '').trim();
            if (withoutLocation.length >= 2) {
                candidates.push(withoutLocation);
            }
        } else if (cleaned.length >= 2) {
            candidates.push(cleaned);
        }
    }

    // 좋은 후보 찾기 (길이가 적당하고 유효한 이름)
    let bestCandidate = '';

    // 가장 긴 후보 사용 (단, 너무 길지 않게)
    for (const candidate of candidates) {
        if (candidate.length >= 2 &&
            (bestCandidate.length < 2 ||
                (candidate.length > bestCandidate.length && candidate.length <= 20))) {
            bestCandidate = candidate;
        }
    }

    // 최종 이름 정제
    if (bestCandidate.length > 20) {
        bestCandidate = bestCandidate.substring(0, 20).trim();
    }

    return bestCandidate;
}

// 개선된 주소 추출 함수 (괄호 안의 주소도 추출)
export function extractAddressImproved(title: string, description: string): string | null {
    // 1. 설명에서 주소 패턴 검색
    const addressPatterns = [
        /주소\s*[:,：]\s*([^,\n]+)/i,
        /위치\s*[:,：]\s*([^,\n]+)/i,
        /찾아오시는[ ]*길\s*[:,：]\s*([^,\n]+)/i,
        /장소\s*[:,：]\s*([^,\n]+)/i,
        /가게[ ]*위치\s*[:,：]\s*([^,\n]+)/i,
        /위치 정보\s*[:,：]\s*([^,\n]+)/i,
        /맛집 주소\s*[:,：]\s*([^,\n]+)/i
    ];

    for (const pattern of addressPatterns) {
        const match = description.match(pattern);
        if (match && match[1] && match[1].trim().length > 5) { // 최소 5자 이상의 주소
            return match[1].trim();
        }
    }

    // 2. 괄호 안에 있는 주소 형태 추출
    const bracketPatterns = [
        /\(([^()]*(?:동|읍|면|로|길|번지|가|리)[^()]*)\)/g, // 일반 괄호
        /\[([^[\]]*(?:동|읍|면|로|길|번지|가|리)[^[\]]*)\]/g, // 대괄호
        /「([^「」]*(?:동|읍|면|로|길|번지|가|리)[^「」]*)」/g, // 「」 괄호
    ];

    for (const pattern of bracketPatterns) {
        // 설명에서 찾기
        let matches;
        while ((matches = pattern.exec(description)) !== null) {
            const addressCandidate = matches[1].trim();
            if (addressCandidate.length > 5 && isValidAddress(addressCandidate)) {
                return addressCandidate;
            }
        }

        // 제목에서도 찾기
        pattern.lastIndex = 0; // 정규식 인덱스 초기화
        while ((matches = pattern.exec(title)) !== null) {
            const addressCandidate = matches[1].trim();
            if (addressCandidate.length > 5 && isValidAddress(addressCandidate)) {
                return addressCandidate;
            }
        }
    }

    // 3. 주소처럼 보이는 패턴 (도로명, 지번 주소 패턴)
    const addressLikePatterns = [
        // 도로명 주소 패턴
        /((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:[가-힣]+구)?(?:[가-힣]+시)?(?:[가-힣]+군)?(?:[가-힣]+[동|읍|면])?\s*(?:[가-힣]+(?:로|길))\s*(?:\d+(?:-\d+)?))/g,
        // 지번 주소 패턴
        /((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:[가-힣]+구)?(?:[가-힣]+시)?(?:[가-힣]+군)?(?:[가-힣]+[동|읍|면])?\s*(?:\d+(?:-\d+)?)(?:번지)?)/g
    ];

    for (const pattern of addressLikePatterns) {
        // 설명에서 찾기
        let matches;
        while ((matches = pattern.exec(description)) !== null) {
            const addressCandidate = matches[1].trim();
            if (addressCandidate.length > 5 && isValidAddress(addressCandidate)) {
                return addressCandidate;
            }
        }
    }

    // 주소를 찾지 못한 경우
    return null;
}

// 주소 유효성 검사
export function isValidAddress(address: string): boolean {
    // 기본적인 유효성 검사
    if (address.length < 5) return false;

    // 숫자가 하나 이상 포함되어 있는지 (대부분의 주소에는 번지수나 번호가 있음)
    const hasNumber = /\d/.test(address);

    // 주소에 일반적으로 포함되는 키워드
    const hasAddressKeyword = /(?:시|군|구|동|읍|면|로|길|가|리|번지)/.test(address);

    // 주소인지 확인할 수 있는 지역명으로 시작하는지
    const startsWithRegion = /^(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/.test(address);

    // 일반적인 전화번호 패턴은 아닌지 확인 (전화번호를 주소로 오인하지 않도록)
    const isNotPhoneNumber = !/^\d{2,3}-\d{3,4}-\d{4}$/.test(address);

    // 영업시간 패턴은 아닌지 확인
    const isNotBusinessHours = !/^\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2}$/.test(address);

    // 최종 판단: 숫자가 있거나 주소 키워드가 있고, 지역명으로 시작하는 경우 (그리고 전화번호나 영업시간이 아닌 경우)
    return ((hasNumber || hasAddressKeyword) && isNotPhoneNumber && isNotBusinessHours) || startsWithRegion;
}

// 연락처 추출
export function extractContact(description: string): string | null {
    const contactPatterns = [
        /전화\s*[:,：]\s*([0-9\-]+)/i,
        /연락처\s*[:,：]\s*([0-9\-]+)/i,
        /문의\s*[:,：]\s*([0-9\-]+)/i,
        /(?:전화|연락처|문의)(?:\s*[:,：])?\s*(01[0-9]-[0-9]{3,4}-[0-9]{4}|0[2-9]{1,2}-[0-9]{3,4}-[0-9]{4})/i,
        // 일반적인 전화번호 패턴 추가
        /(0\d{1,2}-\d{3,4}-\d{4})/i,
        /(01\d-\d{3,4}-\d{4})/i
    ];

    for (const pattern of contactPatterns) {
        const match = description.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

// 영업시간 추출
export function extractBusinessHours(description: string): string | null {
    const hoursPatterns = [
        /영업시간\s*[:,：]\s*([^\n]+)/i,
        /운영시간\s*[:,：]\s*([^\n]+)/i,
        /오픈시간\s*[:,：]\s*([^\n]+)/i,
        /(?:월|화|수|목|금|토|일|평일|주말)(?:\s*~\s*(?:월|화|수|목|금|토|일))?\s*(?:[0-9]{1,2}:[0-9]{2}\s*~\s*[0-9]{1,2}:[0-9]{2})/i,
        /(\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2})/i
    ];

    for (const pattern of hoursPatterns) {
        const match = description.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

// 설명 추출
export function extractDescription(description: string, title: string): string {
    // 설명의 첫 줄 또는 첫 문장을 사용
    let desc = '';

    // 설명의 첫 줄 추출
    const firstLine = description.split('\n')[0].trim();
    if (firstLine && firstLine.length > 10 && firstLine !== title) {
        desc = firstLine;
    } else {
        // 첫 줄이 너무 짧거나 제목과 같으면 첫 문단 찾기
        const paragraphs = description.split('\n\n');
        for (const paragraph of paragraphs) {
            const cleanParagraph = paragraph.trim();
            if (cleanParagraph.length > 20 && cleanParagraph !== title) {
                desc = cleanParagraph;
                break;
            }
        }
    }

    // 설명이 없거나 너무 짧으면 제목 사용
    if (!desc || desc.length < 15) {
        desc = title;
    }

    // 설명이 너무 길면 축약
    if (desc.length > 200) {
        desc = desc.substring(0, 197) + '...';
    }

    return desc;
}