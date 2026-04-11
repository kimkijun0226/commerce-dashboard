-- 추가정보 탭용 키-값 스펙(JSON) + 상세 이미지(세로형 크롭 URL) 백필

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS additional_info_specs jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.products.additional_info_specs IS '추가정보 탭 표시용 키-값 스펙(JSON 객체)';

DO $$
DECLARE
  r RECORD;
  pics text[] := ARRAY[
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=640&h=1200&fit=crop&crop=center&q=80&auto=format',
    'https://images.unsplash.com/photo-1617043786394-f977fa162edc?w=640&h=1200&fit=crop&crop=center&q=80&auto=format'
  ];
  pic_n int;
  origin text;
  cat text[];
  brand text;
BEGIN
  FOR r IN SELECT id, name, categories FROM public.products LOOP
    pic_n := abs(hashtext(r.id::text));
    cat := coalesce(r.categories, ARRAY[]::text[]);
    brand := coalesce(nullif(trim(split_part(r.name, ' ', 1)), ''), '공급사');

    IF cat IS NOT NULL AND '의류' = ANY (cat) THEN
      origin := '베트남';
    ELSIF cat IS NOT NULL AND '전자제품' = ANY (cat) THEN
      origin := '중국';
    ELSIF cat IS NOT NULL AND '운동용품' = ANY (cat) THEN
      origin := '대한민국';
    ELSE
      origin := '대한민국';
    END IF;

    UPDATE public.products
    SET
      additional_info_specs = jsonb_build_object(
        '제조사', brand || ' 공급사',
        '원산지', origin,
        '수입·판매원', 'Cursor Commerce',
        'KC 인증', '전기·전자 해당 시 본체 표기 참조',
        '사용연령', '만 14세 이상 권장',
        '품질보증', '구매일 기준 1년(소비자 과실 제외)',
        '소재·성분', '제품 라벨 및 동봉 안내서 참조',
        '구성품', '본체 및 패키지 구성은 모델별 상이',
        'A/S', '고객센터 평일 10:00–18:00',
        '유의사항', '직사광선·고온 다습 보관을 피해 주세요.'
      ),
      detail_image_urls = ARRAY[
        pics[1 + (pic_n % array_length(pics, 1))],
        pics[1 + ((pic_n + 2) % array_length(pics, 1))],
        pics[1 + ((pic_n + 4) % array_length(pics, 1))]
      ]
    WHERE id = r.id;
  END LOOP;
END $$;
