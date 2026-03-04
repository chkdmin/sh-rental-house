export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!apiKey) {
      reject(
        new Error(
          'NEXT_PUBLIC_KAKAO_MAP_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
        )
      );
      return;
    }

    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=clusterer`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };

    script.onerror = () => {
      reject(
        new Error(
          '카카오맵 스크립트 로드에 실패했습니다. API 키와 도메인 설정을 확인해주세요.'
        )
      );
    };

    document.head.appendChild(script);
  });
}
