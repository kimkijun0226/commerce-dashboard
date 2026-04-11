import { config } from "dotenv";
import { join } from "path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/commons/config/env";
import { parseAdditionalInfoImageUrls } from "@/commons/utils/productDetailParse";
import {
  defaultAdditionalInfoSpecs,
  pickPortraitDetailUrls,
} from "@/commons/utils/productSpecs";

config({ path: join(process.cwd(), ".env.local") });

/**
 * 0001_init_schema.sql 기반 최소 Database 타입(Seed 용)
 * - Supabase JS가 기대하는 형태에 맞게 Relationships/CompositeTypes 포함
 * - products seed에 필요한 public 스키마만 정의
 */
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProductStatus = "registered" | "hidden" | "sold_out";

type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          image_url: string | null;
          status: ProductStatus;
          additional_info: string | null;
          additional_info_specs: Json;
          detail_image_urls: string[];
          measurements: string | null;
          categories: string[] | null;
          rating_average: number | null;
          review_summary: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: string | null;
          additional_info_specs?: Json;
          detail_image_urls?: string[];
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: ProductStatus;
          additional_info?: string | null;
          additional_info_specs?: Json;
          detail_image_urls?: string[];
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          content?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export function createSupabaseClient(): SupabaseClient<Database, "public"> {
  const { supabase } = getServerEnv();
  return createClient<Database, "public">(supabase.url, supabase.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  });
}

type ProductsInsert = Database["public"]["Tables"]["products"]["Insert"];

function toPortraitDetailUrl(unsplashSrc: string): string {
  const base = unsplashSrc.trim().split("?")[0];
  return `${base}?w=640&h=1200&fit=crop&crop=center&q=80&auto=format`;
}

function specsForSeedProduct(p: ProductsInsert): Json {
  const base = defaultAdditionalInfoSpecs(String(p.name));
  const c = p.categories ?? [];
  if (c.includes("의류")) {
    return {
      ...base,
      원산지: "베트남",
      "소재·성분": "라벨의 면·폴리 혼방 비율 참조",
    };
  }
  if (c.includes("전자제품")) {
    return {
      ...base,
      원산지: "중국",
      "KC 인증": "전파인증·안전확인 본체 표기",
    };
  }
  if (c.includes("운동용품")) {
    return { ...base, 원산지: "대한민국" };
  }
  if (c.includes("가방")) {
    return {
      ...base,
      원산지: "이탈리아",
      구성품: "본체, 태그, 더스트백(모델별 상이)",
    };
  }
  return base;
}

function enrichProductForInsert(
  p: ProductsInsert,
): ProductsInsert & { detail_image_urls: string[]; additional_info_specs: Json } {
  const parsed = p.additional_info
    ? parseAdditionalInfoImageUrls(String(p.additional_info))
    : [];
  const portraitLegacy = parsed.map(toPortraitDetailUrl);
  const picked = pickPortraitDetailUrls(`${p.name}-${String(p.image_url)}`, 3);
  const detail_image_urls = [...new Set([...portraitLegacy, ...picked])].slice(
    0,
    4,
  );

  const additional_info = [
    `A/S: 구매일 기준 제조사·유통사 정책을 따릅니다(영업일 기준).`,
    `개봉·사용 후에는 소비자 귀책에 따른 교환이 제한될 수 있습니다.`,
    `${p.name} 관련 문의는 고객센터 운영 시간(평일 10:00–18:00)에 접수해 주세요.`,
  ].join("\n\n");

  const additional_info_specs = specsForSeedProduct(p);

  return { ...p, detail_image_urls, additional_info, additional_info_specs };
}

const SMARTWATCH_PRODUCT_NAME = "스마트워치 울트라";

/** Supabase `products.additional_info` — 상세 탭용 이미지 URL(줄바꿈 구분) */
const SMARTWATCH_ADDITIONAL_INFO = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
  "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&q=80",
  "https://images.unsplash.com/photo-1617043786394-f977fa162edc?w=1200&q=80",
].join("\n");

const SMARTWATCH_REVIEW_RATINGS = [5, 4, 5, 4, 5, 3, 5, 4] as const;

const SMARTWATCH_REVIEW_CONTENTS = [
  "GPS가 생각보다 정확해서 러닝 코스 기록이 깔끔해요. 심박 알림도 잘 맞춰줍니다.",
  "디스플레이가 밝아서 햇빛 아래에서도 잘 보여요. 배터리는 이틀 정도 버텼습니다.",
  "울트라라서 무게는 좀 있지만 착용감은 괜찮아요. 등산할 때 믿고 씁니다.",
  "앱 연동은 처음에만 설정하면 이후엔 편해요. 수면 리포트가 꽤 디테일합니다.",
  "충전 속도 만족. 밤새 착용하고 아침에 20분 충전하면 하루는 충분했어요.",
  "가격 대비 기대가 컸는데 알림이 가끔 늦게 와요. 펌웨어 업데이트 후 나아졌습니다.",
  "워치 페이스 선택지가 많아서 좋고, 항상 켜진 화면이 예쁩니다.",
  "가족 선물로 샀는데 만족한다고 하네요. 포장 상태도 깔끔했습니다.",
] as const;

const SEED_REVIEWER_NAMES = [
  "Minji K.",
  "Alex R.",
  "Sora T.",
  "Chris L.",
  "Taylor M.",
  "Jordan P.",
  "Casey W.",
  "Riley H.",
] as const;

function isDuplicateKeyError(err: unknown): err is { code: string } {
  if (!err || typeof err !== "object") return false;
  return "code" in err && (err as { code?: unknown }).code === "23505";
}

function getSeedProducts(): ProductsInsert[] {
  // 요구사항 분포
  // - 총 40개
  // - 전자제품 15 / 의류 10 / 가방·액세서리 8 / 운동용품 7
  // - status: registered 35 / sold_out 3 / hidden 2
  // - 가격대: 저가(10) / 중가(20) / 고가(10)
  return [
    // 전자제품 (15)
    {
      name: "무선 이어폰 프로",
      description: "프리미엄 노이즈 캔슬링 무선 이어폰, 30시간 배터리 수명",
      price: 149900,
      sale_price: 119900,
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      status: "registered",
      categories: ["전자제품", "오디오", "이어폰"],
      rating_average: 4.6,
      review_summary: { highlight: "착용감과 저음이 좋아요", count: 128 },
      additional_info: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=80",
      ].join("\n"),
      measurements:
        "이어폰(단일): 약 5.2g\n케이스: 약 48g\n케이스 크기: 약 60×48×25mm",
    },
    {
      name: SMARTWATCH_PRODUCT_NAME,
      description: "심박수 모니터와 GPS가 있는 고급 피트니스 트래커",
      price: 329000,
      sale_price: 279000,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      status: "registered",
      categories: ["전자제품", "웨어러블", "스마트워치"],
      rating_average: 4.7,
      review_summary: { highlight: "GPS 정확도가 좋아요", count: 92 },
      additional_info: SMARTWATCH_ADDITIONAL_INFO,
    },
    {
      name: "블루투스 스피커 컴팩트",
      description: "작지만 선명한 사운드, IPX7 방수 지원",
      price: 89000,
      image_url:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
      status: "registered",
      categories: ["전자제품", "오디오", "스피커"],
      rating_average: 4.4,
      review_summary: { highlight: "휴대성이 좋아요", count: 63 },
    },
    {
      name: "기계식 키보드 클래식",
      description: "키감이 또렷한 텐키리스 기계식 키보드, 저소음 스위치",
      price: 129000,
      sale_price: 109000,
      image_url:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
      status: "registered",
      categories: ["전자제품", "PC주변기기", "키보드"],
      rating_average: 4.5,
      review_summary: { highlight: "타건감이 만족스러워요", count: 41 },
    },
    {
      name: "무선 마우스 에어",
      description: "손목 부담을 줄이는 인체공학 설계, 저지연 2.4GHz",
      price: 59000,
      sale_price: 39900,
      image_url:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
      status: "registered",
      categories: ["전자제품", "PC주변기기", "마우스"],
      rating_average: 4.3,
      review_summary: { highlight: "그립감이 좋아요", count: 58 },
    },
    {
      name: "노이즈 캔슬링 헤드폰 맥스",
      description: "공간감 있는 사운드와 강력한 ANC, 장시간 착용 최적화",
      price: 399000,
      image_url:
        "https://images.unsplash.com/photo-1518441902117-f0a0eab0fbb6?w=800",
      status: "registered",
      categories: ["전자제품", "오디오", "헤드폰"],
      rating_average: 4.8,
      review_summary: { highlight: "노캔 성능이 압도적", count: 77 },
    },
    {
      name: "휴대용 보조배터리 20000mAh",
      description: "PD 고속충전 지원, 동시에 3대 충전 가능",
      price: 59000,
      image_url:
        "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=800",
      status: "registered",
      categories: ["전자제품", "모바일액세서리", "보조배터리"],
      rating_average: 4.2,
      review_summary: { highlight: "용량이 넉넉해요", count: 31 },
    },
    {
      name: "4K 웹캠 스트림",
      description: "선명한 화질과 자동초점, 노트북/데스크탑 호환",
      price: 99000,
      sale_price: 84900,
      image_url:
        "https://images.unsplash.com/photo-1587825140400-9a202f6f86bb?w=800",
      status: "registered",
      categories: ["전자제품", "PC주변기기", "웹캠"],
      rating_average: 4.1,
      review_summary: { highlight: "회의용으로 충분해요", count: 24 },
    },
    {
      name: "모니터 라이트 바",
      description: "눈부심을 줄이는 비대칭 광학, 밝기/색온도 조절",
      price: 59000,
      image_url:
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800",
      status: "registered",
      categories: ["전자제품", "데스크셋업", "조명"],
      rating_average: 4.0,
      review_summary: { highlight: "책상이 깔끔해져요", count: 19 },
    },
    {
      name: "무선 충전 패드 듀오",
      description: "스마트폰과 이어폰을 동시에 충전, 과열 보호 기능",
      price: 39000,
      sale_price: 31900,
      image_url:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      status: "registered",
      categories: ["전자제품", "모바일액세서리", "충전기"],
      rating_average: 4.2,
      review_summary: { highlight: "동시 충전이 편해요", count: 27 },
    },
    {
      name: "스마트 스피커 미니",
      description: "음성 비서 지원, 집안 어디서나 간편 제어",
      price: 69000,
      image_url:
        "https://images.unsplash.com/photo-1512446733611-9099a758e9f2?w=800",
      status: "registered",
      categories: ["전자제품", "오디오", "스마트홈"],
      rating_average: 4.1,
      review_summary: { highlight: "집이 똑똑해져요", count: 33 },
    },
    {
      name: "게이밍 모니터 27인치 165Hz",
      description: "부드러운 165Hz 주사율, 빠른 응답속도, 게임용 최적",
      price: 289000,
      image_url:
        "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800",
      status: "registered",
      categories: ["전자제품", "데스크셋업", "모니터"],
      rating_average: 4.4,
      review_summary: { highlight: "화면이 부드러워요", count: 18 },
    },
    {
      name: "USB-C 허브 8포트",
      description: "HDMI, USB-A, SD 카드 리더, PD 충전까지 한 번에",
      price: 79000,
      sale_price: 64900,
      image_url:
        "https://images.unsplash.com/photo-1587825140400-9a202f6f86bb?w=800",
      status: "registered",
      categories: ["전자제품", "노트북액세서리", "허브"],
      rating_average: 4.2,
      review_summary: { highlight: "포트가 많아 좋아요", count: 22 },
    },
    {
      name: "커브드 모니터 32인치 QHD",
      description: "몰입감 높은 커브드 화면, QHD 해상도, 눈부심 최소화",
      price: 319000,
      image_url:
        "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800",
      status: "registered",
      categories: ["전자제품", "데스크셋업", "모니터"],
      rating_average: 4.5,
      review_summary: { highlight: "몰입감이 좋아요", count: 12 },
    },
    {
      name: "프리미엄 노트북 스탠드",
      description: "각도 조절, 알루미늄 바디, 통풍 설계",
      price: 69000,
      image_url:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
      status: "sold_out",
      categories: ["전자제품", "데스크셋업", "스탠드"],
      rating_average: 4.5,
      review_summary: { highlight: "자세가 좋아졌어요", count: 29 },
    },

    // 의류 (10)
    {
      name: "클래식 화이트 티셔츠",
      description: "100% 유기농 면, 편안한 핏",
      price: 19000,
      image_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      status: "registered",
      categories: ["의류", "상의", "티셔츠"],
      rating_average: 4.4,
      review_summary: { highlight: "소재가 좋아요", count: 54 },
    },
    {
      name: "데님 재킷 레트로",
      description: "사계절 활용 가능한 레귤러 핏 데님 재킷",
      price: 99000,
      sale_price: 79900,
      image_url:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
      status: "registered",
      categories: ["의류", "아우터", "재킷"],
      rating_average: 4.3,
      review_summary: { highlight: "핏이 예뻐요", count: 37 },
    },
    {
      name: "캐주얼 스니커즈 베이직",
      description: "가볍고 편안한 착화감, 데일리 코디에 최적",
      price: 79000,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      status: "registered",
      categories: ["의류", "신발", "스니커즈"],
      rating_average: 4.2,
      review_summary: { highlight: "착화감이 편해요", count: 46 },
    },
    {
      name: "야구 모자 클래식",
      description: "자외선 차단, 사이즈 조절 스트랩",
      price: 23000,
      sale_price: 19900,
      image_url:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
      status: "registered",
      categories: ["의류", "액세서리", "모자"],
      rating_average: 4.1,
      review_summary: { highlight: "색감이 좋아요", count: 21 },
    },
    {
      name: "니트 가디건 소프트",
      description: "부드러운 촉감, 레이어드에 좋은 기본 가디건",
      price: 69000,
      image_url:
        "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=800",
      status: "registered",
      categories: ["의류", "상의", "가디건"],
      rating_average: 4.3,
      review_summary: { highlight: "촉감이 부드러워요", count: 15 },
    },
    {
      name: "슬림 핏 슬랙스",
      description: "구김이 적고 활동성이 좋은 데일리 슬랙스",
      price: 59000,
      image_url:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      status: "registered",
      categories: ["의류", "하의", "슬랙스"],
      rating_average: 4.2,
      review_summary: { highlight: "핏이 깔끔해요", count: 28 },
    },
    {
      name: "후드 집업 데일리",
      description: "가볍고 따뜻한 기모 안감, 실내외 활용",
      price: 55000,
      sale_price: 45900,
      image_url:
        "https://images.unsplash.com/photo-1520975958225-625d8f3f2b2e?w=800",
      status: "registered",
      categories: ["의류", "아우터", "후드"],
      rating_average: 4.1,
      review_summary: { highlight: "보온성이 좋아요", count: 17 },
    },
    {
      name: "롱 코트 울 블렌드",
      description: "깔끔한 실루엣, 울 혼방 소재로 따뜻함 강화",
      price: 219000,
      sale_price: 179000,
      image_url:
        "https://images.unsplash.com/photo-1520975867597-0d5d66a7b6b5?w=800",
      status: "registered",
      categories: ["의류", "아우터", "코트"],
      rating_average: 4.5,
      review_summary: { highlight: "퀄리티가 좋아요", count: 11 },
    },
    {
      name: "러닝 쇼츠 라이트",
      description: "통기성 좋은 경량 소재, 땀 배출 최적화",
      price: 29000,
      image_url:
        "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=800",
      status: "hidden",
      categories: ["의류", "스포츠웨어", "쇼츠"],
      rating_average: 4.0,
      review_summary: { highlight: "가볍고 편해요", count: 9 },
    },
    {
      name: "플리스 맨투맨",
      description: "포근한 플리스 소재, 겨울 데일리 아이템",
      price: 49000,
      image_url:
        "https://images.unsplash.com/photo-1520975958225-625d8f3f2b2e?w=800",
      status: "registered",
      categories: ["의류", "상의", "맨투맨"],
      rating_average: 4.2,
      review_summary: { highlight: "따뜻해요", count: 14 },
    },

    // 가방/액세서리 (8)
    {
      name: "가죽 백팩 프리미엄",
      description: "수제 진짜 가죽 백팩, 노트북 수납 공간 포함",
      price: 189000,
      sale_price: 159000,
      image_url:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      status: "registered",
      categories: ["가방", "백팩", "가죽"],
      rating_average: 4.6,
      review_summary: { highlight: "수납이 좋아요", count: 26 },
    },
    {
      name: "미니멀 지갑 슬림",
      description: "카드 중심 설계, 가벼운 무게",
      price: 39000,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      status: "registered",
      categories: ["액세서리", "지갑", "가죽"],
      rating_average: 4.2,
      review_summary: { highlight: "얇아서 좋아요", count: 17 },
    },
    {
      name: "클래식 선글라스",
      description: "UV400 차단, 데일리로 어울리는 클래식 프레임",
      price: 59000,
      sale_price: 49900,
      image_url:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
      status: "registered",
      categories: ["액세서리", "선글라스"],
      rating_average: 4.1,
      review_summary: { highlight: "디자인이 예뻐요", count: 13 },
    },
    {
      name: "캔버스 토트백",
      description: "가볍고 튼튼한 캔버스 소재, 데일리 수납",
      price: 25000,
      image_url:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
      status: "registered",
      categories: ["가방", "토트백", "캔버스"],
      rating_average: 4.0,
      review_summary: { highlight: "가성비 좋아요", count: 20 },
    },
    {
      name: "크로스백 미니",
      description: "핸드폰과 소지품을 간편하게, 길이 조절 스트랩",
      price: 49000,
      image_url:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
      status: "registered",
      categories: ["가방", "크로스백"],
      rating_average: 4.1,
      review_summary: { highlight: "사이즈가 딱 좋아요", count: 16 },
    },
    {
      name: "가죽 벨트 클래식",
      description: "튼튼한 버클, 어디에나 어울리는 기본 벨트",
      price: 59000,
      image_url:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
      status: "registered",
      categories: ["액세서리", "벨트"],
      rating_average: 4.2,
      review_summary: { highlight: "퀄리티 좋아요", count: 10 },
    },
    {
      name: "프리미엄 가죽 서류가방",
      description: "노트북 수납과 정갈한 실루엣, 출퇴근용으로 좋은 가죽 가방",
      price: 259000,
      image_url:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      status: "registered",
      categories: ["가방", "서류가방", "가죽"],
      rating_average: 4.4,
      review_summary: { highlight: "출근용으로 좋아요", count: 8 },
    },
    {
      name: "여행용 캐리어 24인치",
      description: "내구성 강화 바디, 조용한 더블 휠",
      price: 159000,
      image_url:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
      status: "sold_out",
      categories: ["가방", "여행", "캐리어"],
      rating_average: 4.4,
      review_summary: { highlight: "바퀴가 부드러워요", count: 12 },
    },

    // 운동용품 (7)
    {
      name: "요가 매트 프로",
      description: "미끄럼 방지, 관절 보호 두께, 냄새 최소화 소재",
      price: 59000,
      image_url:
        "https://images.unsplash.com/photo-1518611012118-f0c5b5a3f1c4?w=800",
      status: "registered",
      categories: ["운동용품", "요가", "매트"],
      rating_average: 4.5,
      review_summary: { highlight: "미끄럽지 않아요", count: 34 },
    },
    {
      name: "조정 가능한 덤벨 세트",
      description: "무게 조절로 공간 절약, 집에서 하는 근력 운동",
      price: 279000,
      sale_price: 229000,
      image_url:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800",
      status: "registered",
      categories: ["운동용품", "근력", "덤벨"],
      rating_average: 4.7,
      review_summary: { highlight: "집에서 운동하기 좋아요", count: 18 },
    },
    {
      name: "러닝화 퍼포먼스",
      description: "충격 흡수 쿠션, 통기성 메쉬, 장거리 러닝 최적",
      price: 139000,
      sale_price: 109000,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      status: "registered",
      categories: ["운동용품", "러닝", "신발"],
      rating_average: 4.4,
      review_summary: { highlight: "쿠션감이 좋아요", count: 25 },
    },
    {
      name: "폼롤러 릴렉스",
      description: "근육 이완과 마사지에 좋은 고밀도 폼롤러",
      price: 19000,
      image_url:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800",
      status: "registered",
      categories: ["운동용품", "리커버리", "폼롤러"],
      rating_average: 4.1,
      review_summary: { highlight: "풀리는 느낌이 좋아요", count: 11 },
    },
    {
      name: "스핀 바이크 홈트",
      description: "집에서 하는 유산소 운동, 강도 조절 다이얼과 안정적인 프레임",
      price: 299000,
      image_url:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800",
      status: "registered",
      categories: ["운동용품", "유산소", "사이클"],
      rating_average: 4.3,
      review_summary: { highlight: "집에서 타기 좋아요", count: 14 },
    },
    {
      name: "스마트 줄넘기",
      description: "운동 기록을 앱으로 확인, 베어링 회전으로 부드러운 스킵",
      price: 35000,
      sale_price: 29900,
      image_url:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800",
      status: "hidden",
      categories: ["운동용품", "유산소", "줄넘기"],
      rating_average: 4.0,
      review_summary: { highlight: "기록 보는 재미가 있어요", count: 6 },
    },
    {
      name: "케틀벨 16kg",
      description: "그립이 편한 코팅, 스윙/스쿼트 등 전신 운동",
      price: 79000,
      image_url:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800",
      status: "sold_out",
      categories: ["운동용품", "근력", "케틀벨"],
      rating_average: 4.3,
      review_summary: { highlight: "마감이 좋습니다", count: 7 },
    },
  ];
}

export async function insertProducts(
  supabase: ReturnType<typeof createSupabaseClient>,
): Promise<void> {
  console.log("상품 시드 시작: public.products");

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  const currentCount = count ?? 0;
  console.log(`현재 products 개수: ${currentCount}`);

  if (currentCount >= 40) {
    console.log("이미 40개 이상 존재하여 시드를 건너뜁니다.");
    return;
  }

  const rawProducts = getSeedProducts();
  if (rawProducts.length < 40) {
    throw new Error(
      `시드 상품 개수가 40개 미만입니다. 현재: ${rawProducts.length}`,
    );
  }

  const products = rawProducts.map((p) => enrichProductForInsert(p));

  console.log(`삽입 시도: ${products.length}개`);
  const { error } = await supabase.from("products").insert(products);
  if (error) {
    if (isDuplicateKeyError(error)) {
      console.log("중복 키(23505) 에러는 무시합니다.");
      return;
    }
    throw error;
  }

  const { count: afterCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  console.log(`삽입 완료. products 개수: ${afterCount ?? "unknown"}`);
}

const TARGET_SMARTWATCH_REVIEW_COUNT = 8;

/**
 * 스마트워치 상품의 `additional_info`(이미지 URL) 동기화 + 시드 리뷰어·리뷰 삽입.
 * 서비스 롤 키 사용 시 RLS를 우회합니다.
 */
export async function seedSmartwatchReviewsAndDetail(
  supabase: ReturnType<typeof createSupabaseClient>,
): Promise<void> {
  console.log(`「${SMARTWATCH_PRODUCT_NAME}」 additional_info · 리뷰 시드…`);

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("name", SMARTWATCH_PRODUCT_NAME)
    .maybeSingle();

  if (productError) {
    console.warn("스마트워치 상품 조회 실패:", productError.message);
    return;
  }
  if (!product) {
    console.log("스마트워치 상품이 없어 시드를 건너뜁니다.");
    return;
  }

  const smartwatchDetailUrls = parseAdditionalInfoImageUrls(
    SMARTWATCH_ADDITIONAL_INFO,
  ).map(toPortraitDetailUrl);

  const smartwatchSpecs: Json = {
    ...defaultAdditionalInfoSpecs(SMARTWATCH_PRODUCT_NAME),
    제조사: "스마트 디바이스 OEM",
    원산지: "중국",
    "KC 인증": "전파인증·전기용품 안전확인 본체 표기",
    "소재·성분": "알루미늄 케이스, 실리콘 밴드(모델별 상이)",
    구성품: "본체, 충전 케이블, 빠른 시작 가이드",
  };

  const { error: infoError } = await supabase
    .from("products")
    .update({
      detail_image_urls: smartwatchDetailUrls,
      additional_info_specs: smartwatchSpecs,
      additional_info:
        "배터리·방수 사용 안내는 동봉 매뉴얼을 참고해 주세요. 밴드 교체 시 정품 액세서리 사용을 권장합니다. 직사광선·고온 다습 환경은 피해 주세요.",
    })
    .eq("id", product.id);

  if (infoError) {
    console.warn("스마트워치 상세 이미지·추가정보 업데이트 실패:", infoError.message);
  } else {
    console.log("스마트워치 detail_image_urls · additional_info 반영 완료");
  }

  const userIds: string[] = [];
  for (let i = 0; i < SEED_REVIEWER_NAMES.length; i++) {
    const email = `seed-reviewer-${i}@seed.cursor-commerce.local`;
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        email,
        display_name: SEED_REVIEWER_NAMES[i],
        role: "user",
      },
      { onConflict: "email" },
    );
    if (upsertError) {
      console.warn(`사용자 upsert 실패 (${email}):`, upsertError.message);
    }
    const { data: row, error: selError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (selError) {
      console.warn(`사용자 조회 실패 (${email}):`, selError.message);
      continue;
    }
    if (row?.id) userIds.push(row.id);
  }

  if (userIds.length < TARGET_SMARTWATCH_REVIEW_COUNT) {
    console.warn(
      `시드 리뷰어 사용자가 ${TARGET_SMARTWATCH_REVIEW_COUNT}명 미만입니다. (현재 ${userIds.length}명)`,
    );
    return;
  }

  const { count: reviewCount, error: countError } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("product_id", product.id);

  if (countError) {
    console.warn("리뷰 개수 조회 실패:", countError.message);
    return;
  }

  const existingCount = reviewCount ?? 0;
  const toInsert = Math.max(0, TARGET_SMARTWATCH_REVIEW_COUNT - existingCount);

  if (toInsert === 0) {
    console.log(
      `스마트워치 리뷰가 이미 ${existingCount}개 이상이어서 삽입을 건너뜁니다.`,
    );
  } else {
    const baseOffset = existingCount;
    for (let j = 0; j < toInsert; j++) {
      const i = baseOffset + j;
      if (i >= SMARTWATCH_REVIEW_RATINGS.length || i >= userIds.length) break;
      const { error: insError } = await supabase.from("reviews").insert({
        user_id: userIds[i],
        product_id: product.id,
        rating: SMARTWATCH_REVIEW_RATINGS[i],
        content: SMARTWATCH_REVIEW_CONTENTS[i],
        created_at: new Date(
          Date.now() - i * 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
      if (insError) {
        if (isDuplicateKeyError(insError)) continue;
        console.warn("리뷰 삽입 실패:", insError);
      }
    }
    console.log(`스마트워치 리뷰 ${toInsert}건 삽입 시도 완료`);
  }

  const { data: ratingRows, error: ratingsError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", product.id);

  if (ratingsError || !ratingRows?.length) {
    return;
  }

  const sum = ratingRows.reduce((acc, row) => acc + row.rating, 0);
  const avg = Math.round((sum / ratingRows.length) * 10) / 10;

  await supabase
    .from("products")
    .update({
      rating_average: avg,
      review_summary: {
        count: ratingRows.length,
        highlight: "GPS and battery life stand out.",
      },
    })
    .eq("id", product.id);
}

async function main() {
  const supabase = createSupabaseClient();
  await insertProducts(supabase);
  await seedSmartwatchReviewsAndDetail(supabase);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("상품 시드 오류:", err);
    process.exit(1);
  });

