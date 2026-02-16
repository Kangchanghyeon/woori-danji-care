/**
 * 날씨 기반 영업 독려 문구 (친근한 문구, **볼드** 구간 지원)
 */

export function getLocationLabel(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "위치 정보를 불러오는 중이에요.";
  return "지금 계신 곳 주변 단지를 살펴보고 있어요.";
}

type WeatherKind = "맑음" | "비" | "흐림";

/** 랜덤 날씨 (실제 API 없이 데모용) */
function getRandomWeather(): WeatherKind {
  const r = Math.random();
  if (r < 0.4) return "맑음";
  if (r < 0.7) return "흐림";
  return "비";
}

/** 날씨별 문구. **텍스트** 는 볼드로 렌더링 */
const WEATHER_MESSAGES: Record<WeatherKind, string> = {
  맑음:
    "☀️ 날씨가 정말 화창해요! **소장님들께 커피 한 잔** 들고 **방문하기 딱 좋은 날씨**입니다.",
  비: "☔ 비 오는 날엔 **소장님들도 사무실에 계실 확률이 높죠?** **안부 전화**로 점수를 따보세요!",
  흐림:
    "☁️ 흐린 날씨지만 **사장님의 영업 열정은 오늘도 맑음!** 주변 단지들을 **꼼꼼히 챙겨드릴게요.**",
};

/**
 * 오늘 날씨(랜덤)에 맞는 영업 독려 문구 1개 반환. **...** 구간은 볼드용
 */
export function getWeatherEncouragementMessage(): string {
  const weather = getRandomWeather();
  return WEATHER_MESSAGES[weather];
}
