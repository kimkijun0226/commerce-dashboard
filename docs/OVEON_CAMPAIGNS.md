# 오브온 캠페인 이미지

내장 `image_gen`으로 생성한 브랜드 무드 화보입니다. 실제 판매 상품이나 실존 모델의 촬영 사진으로 표시하지 않으며, 광고는 매장 상품 목록으로 연결합니다.

저장 위치: `public/campaigns/editorial/{fashion|beauty|home}-{1..10}.webp`. 원본 PNG는 생성 도구 저장소에 보관하고 사이트에는 압축한 WebP만 사용합니다.

공통 생성 프롬프트:
> Use case: ads-marketing. Create one full bleed professional photorealistic OVEON campaign photograph, landscape 1536x1024. Premium Korean multi-brand ecommerce magazine aesthetic, contemporary confident art direction, exquisite real materials, natural photographic lighting, restrained film grain. Main subject on right two thirds, left third calm dark or shadowed negative space suitable for live white website headline. No text, lettering, logos, watermark, collage, borders or UI. Conceptual brand mood campaign, not a depiction of a specific catalog SKU.

장면별 프롬프트:

- **beauty-1**: Unbranded translucent amber serum bottle on travertine with dramatic water ripples and a branch shadow, warm peach light, beauty still life
- **beauty-2**: Closeup of an adult Korean woman's face with natural luminous skin, no makeup look, soft peach background, fine real skin texture, graceful hand near cheek
- **beauty-3**: Unbranded frosted glass cream jar and white cream texture on blush pink stone, hard diagonal morning sunlight, tactile luxurious skincare still life
- **beauty-4**: Unbranded pale yellow sunscreen tube on pale sand with pool water caustics, summer sunlight, premium Korean beauty campaign
- **beauty-5**: Clear glass skincare bottle with tiny water droplets on pale blue glass and soft hydrangea shadows, quiet minimal beauty advertising
- **beauty-6**: Adult Korean woman in profile with natural dewy skin and dark wet hair tucked back, serene rose background, high end beauty editorial
- **beauty-7**: Unbranded neutral lip balm tubes with a subtle burgundy cosmetic smear on pink marble, sculptural editorial beauty product shot
- **beauty-8**: Unbranded skincare bottle resting beside folded ivory towel and a wet smooth river stone, morning bathroom atmosphere, sage green and cream
- **beauty-9**: Macro clear gel texture and one unbranded pale green glass cosmetic bottle on luminous frosted glass, vibrant organic light, tactile beauty still life
- **beauty-10**: Unbranded cream jar on cream stone beside a single white flower and floating fabric, muted warm blush, poetic luxury skincare campaign
- **fashion-1**: A stylish adult Korean woman in an oversized charcoal blazer, ivory tee and relaxed black trousers walking past sunlit Seoul concrete architecture; real fashion photography with a charcoal and warm ivory palette.
- **fashion-2**: Adult Korean man in ecru knitwear and tailored navy wide-leg trousers standing at a Brutalist Seoul gallery, quiet afternoon shadows, cool stone palette
- **fashion-3**: Adult Korean woman in a boxy olive jacket and washed indigo jeans, cinematic urban crosswalk at golden hour, candid movement
- **fashion-4**: Two adult Korean models wearing relaxed ivory and dark brown knitwear in a minimalist studio, warm daylight, sophisticated everyday styling
- **fashion-5**: Adult Korean woman wearing a long taupe trench coat in a modern covered Seoul passage, architectural lines, directional spring light
- **fashion-6**: Adult Korean man wearing a crisp blue oversized cotton shirt and charcoal trousers by a pale concrete wall, unforced clean styling
- **fashion-7**: Adult Korean woman in layered gray sweatshirt and black wide leg trousers at an urban rooftop, dusky blue light, understated streetwear
- **fashion-8**: Adult Korean woman wearing a black wool jacket and cream scarf on a quiet Seoul street, editorial winter look, strong dark shadows
- **fashion-9**: Adult Korean man and woman wearing tonal cream cotton casual outfits at a modern stone staircase, airy natural light
- **fashion-10**: Adult Korean woman in a navy relaxed blazer and ivory pants sitting at an outdoor cafe in Seoul, candid weekend mood
- **home-1**: Sculptural ivory boucle lounge chair beside a walnut side table in a serene Seoul apartment, big window afternoon sun, olive wall, architectural interior photography
- **home-2**: Low warm oak coffee table with a ceramic vase and a book in a softly lit minimal living room, linen sofa in background, Korean premium interior editorial
- **home-3**: Dark walnut curved dining chair beside a pale travertine dining table, cream curtains and golden window light, tactile modern interior
- **home-4**: Minimal sculptural pale sage storage cabinet against a warm plaster wall, ceramic bowl and dried branch, afternoon shadows, premium interior photography
- **home-5**: Rust toned upholstered lounge chair beside an architectural floor lamp in a minimal concrete apartment, cinematic warm tones
- **home-6**: Sculptural wooden stool near sheer linen curtains and a potted olive tree in a quiet apartment corner, soft diffused light
- **home-7**: Modern modular ivory sofa and walnut side table in a sophisticated living room, large Korean city window view, morning light
- **home-8**: Small oak writing desk with a curved wooden chair by a sunny window, soft cream and pale green palette, intimate quiet workspace
- **home-9**: Round marble side table with sculptural ceramic vase next to a deep green accent chair, shadowed moody designer apartment
- **home-10**: Sculptural pale ash wood dining table with minimal curved chairs in an airy Korean home, warm sunlight and linen curtains



## 자연스러운 인물 표현 최종 보정

피부결·잔머리·옷 주름을 살리고 과한 광택과 정형적인 포즈를 줄인 컷을 추가 생성하여 교체했습니다. 의류 첫 광고에는 아래 fashion-4 생성 컷을 배치하고, 기존 fashion-1은 fashion-4로 이동했습니다.

### beauty-2 생성 프롬프트

Use case: ads-marketing. Wide landscape 1536x1024 photograph for OVEON Korean ecommerce campaign. Candid close-up portrait of an adult Korean woman with an ordinary relatable face, understated natural beauty, no foundation, visible skin pores, small freckles, fine facial hair, slight under-eye shadows, matte skin, gently asymmetric relaxed expression, looking away from camera. She wears a simple ivory cotton shirt in a softly lit real bathroom, face on right two thirds, left third calm shadowed wall. Photograph should look convincingly like a real unretouched location shoot captured on a full-frame camera with a 50mm lens, mild real film grain, realistic microtexture and incidental detail, soft natural window or overcast daylight. Subtle premium editorial color grading, restrained highlights. Preserve genuine human irregularity, imperfect hair and fabric, NOT glossy AI beauty aesthetic, NOT waxy skin, NOT airbrushed, NOT beauty-filtered, NOT doll-like face, NOT over-sharpened, no dramatic fake haze. No text, logos, borders, UI, collage, or watermark. Full bleed composition with copy space on left.

### beauty-6 생성 프롬프트

Use case: ads-marketing. Wide landscape 1536x1024 photograph for OVEON Korean ecommerce campaign. An adult Korean woman in a simple cream cotton top photographed from behind and side while tying her hair at a real bathroom mirror, hands anatomically normal and partly concealed by hair, relaxed everyday personal care moment, small face in profile with natural matte skin, human imperfections, muted rose and ivory interior, person on right two thirds, left third shadowed wall. Photograph should look convincingly like a real unretouched location shoot captured on a full-frame camera with a 50mm lens, mild real film grain, realistic microtexture and incidental detail, soft natural window or overcast daylight. Subtle premium editorial color grading, restrained highlights. Preserve genuine human irregularity, imperfect hair and fabric, NOT glossy AI beauty aesthetic, NOT waxy skin, NOT airbrushed, NOT beauty-filtered, NOT doll-like face, NOT over-sharpened, no dramatic fake haze. No text, logos, borders, UI, collage, or watermark. Full bleed composition with copy space on left.

### fashion-4 생성 프롬프트

Use case: ads-marketing. Wide landscape 1536x1024 photograph for OVEON Korean ecommerce campaign. One adult Korean woman with a relatable non-celebrity face in an oversized textured oatmeal cardigan and dark relaxed jeans sitting casually on a low concrete step outside a Seoul studio, slightly hunched relaxed pose, gazing downward so face is not prominent, natural hair flyaways, candid fashion documentary, subject on right two thirds, calm shadowed stone wall on left. Photograph should look convincingly like a real unretouched location shoot captured on a full-frame camera with a 50mm lens, mild real film grain, realistic microtexture and incidental detail, soft natural window or overcast daylight. Subtle premium editorial color grading, restrained highlights. Preserve genuine human irregularity, imperfect hair and fabric, NOT glossy AI beauty aesthetic, NOT waxy skin, NOT airbrushed, NOT beauty-filtered, NOT doll-like face, NOT over-sharpened, no dramatic fake haze. No text, logos, borders, UI, collage, or watermark. Full bleed composition with copy space on left.

### fashion-9 생성 프롬프트

Use case: ads-marketing. Wide landscape 1536x1024 photograph for OVEON Korean ecommerce campaign. Two adult Korean friends in cream casual cotton clothes walking away from camera along a quiet Seoul concrete gallery staircase, mostly rear three-quarter view, relaxed unposed movement, no visible faces front-on, one person holding a plain canvas tote, believable ordinary bodies, clothing creases, natural hair flyaways, subjects on right two thirds, large calm shadowed architecture on left. Photograph should look convincingly like a real unretouched location shoot captured on a full-frame camera with a 50mm lens, mild real film grain, realistic microtexture and incidental detail, soft natural window or overcast daylight. Subtle premium editorial color grading, restrained highlights. Preserve genuine human irregularity, imperfect hair and fabric, NOT glossy AI beauty aesthetic, NOT waxy skin, NOT airbrushed, NOT beauty-filtered, NOT doll-like face, NOT over-sharpened, no dramatic fake haze. No text, logos, borders, UI, collage, or watermark. Full bleed composition with copy space on left.
