# 연습문 출처와 라이선스

이 문서는 앱이 실제로 읽는 연습문의 출처와 사용 조건을 한곳에 모은 것이다. 화면에 표시되는 연습문과 글 고르기 목록의 출처 표기가 같은 애셋에서 나오도록, 이 파일은 `src/content`의 콘텐츠 모듈에서 자동 생성한다.

> 이 파일은 직접 고치지 않는다. 애셋을 바꾼 뒤 `npm run text-licenses:update`로 다시 생성하고, `npm run test`로 애셋 메타데이터와의 일치를 확인한다.

## 요약

| 자료 묶음 | 개수 | 라이선스 | 애셋 |
| --- | --- | --- | --- |
| 한국어 한 줄 | 12 | 직접 작성 | `src/content/assets/one-line.ko.json` |
| 영어 한 줄 | 6 | 직접 작성 | `src/content/assets/one-line.en.json` |
| 한국어 낱말 | 8 | 직접 작성 | `src/content/assets/words.ko.json` |
| 영어 낱말 | 8 | 직접 작성 | `src/content/assets/words.en.json` |
| 30초 낱말 도전 | 28 | 직접 작성 | `src/content/assets/challenge-words.json` |
| 한국어 짧은 글 | 36 | 직접 작성 14 · CC BY-SA 4.0 21 · 퍼블릭 도메인 1 | `src/content/assets/passages.ko.json` |
| 한국어 긴 글 | 9 | 직접 작성 2 · CC BY-SA 4.0 7 · 퍼블릭 도메인 0 | `src/content/assets/passages.ko.json` |
| 영어 짧은 글 | 16 | 직접 작성 5 · CC BY-SA 4.0 11 | `src/content/assets/passages.en.json` |
| 영어 긴 글 | 7 | 직접 작성 1 · CC BY-SA 4.0 6 | `src/content/assets/passages.en.json` |
| **글 전체** | **68** | 직접 작성 22 · 복제 46 | `src/content/assets/passages.*.json` |

## 라이선스 표기

- **직접 작성**: 이 프로젝트에서 새로 쓴 원문이다. 별도 출처 표기가 필요 없으며 애셋의 `license`는 `original`이다.
- **CC BY-SA 4.0**: 위키문헌·위키백과에서 가져온 발췌문이다. 저자·출처·원문 URL을 애셋의 `credit`에 남기고 글 고르기 목록에 표시한다. 배포 시 같은 라이선스 조건과 출처 표기를 유지한다.
- **퍼블릭 도메인**: 저작권 보호 기간이 끝났거나 법령에 따라 보호받지 않는 자료다. 현재는 대한민국헌법 전문을 사용하며, 애셋에는 출처를 함께 남긴다.

## 한 줄 연습

### 한국어 (12)

| ID | 연습문 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| `first-steps` | 손끝에 다시 익숙해지기 | 직접 작성 | 자체 제작 |
| `ko-window` | 창가의 아침 | 직접 작성 | 자체 제작 |
| `ko-tea` | 따뜻한 차 한 잔 | 직접 작성 | 자체 제작 |
| `ko-lamp` | 늦은 귀가 | 직접 작성 | 자체 제작 |
| `ko-letter` | 오래된 편지 | 직접 작성 | 자체 제작 |
| `ko-morning` | 아침 시장 | 직접 작성 | 자체 제작 |
| `ko-stars` | 별을 세는 시간 | 직접 작성 | 자체 제작 |
| `ko-rain` | 비 오는 오후 | 직접 작성 | 자체 제작 |
| `ko-bicycle` | 자전거 길 | 직접 작성 | 자체 제작 |
| `ko-cat` | 창가의 고양이 | 직접 작성 | 자체 제작 |
| `ko-library` | 도서관의 오후 | 직접 작성 | 자체 제작 |
| `ko-night-train` | 밤기차 | 직접 작성 | 자체 제작 |

### 영어 (6)

| ID | 연습문 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| `en-window` | Morning at the window | 직접 작성 | 자체 제작 |
| `en-tea` | A quiet morning | 직접 작성 | 자체 제작 |
| `en-lamp` | The last lamp | 직접 작성 | 자체 제작 |
| `en-letter` | An old letter | 직접 작성 | 자체 제작 |
| `en-train` | The night train | 직접 작성 | 자체 제작 |
| `en-stars` | Counting stars | 직접 작성 | 자체 제작 |

## 낱말 연습

### 한국어 (8)

| ID | 연습문 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| `ko-pencil` | 연필 | 직접 작성 | 자체 제작 |
| `ko-window-word` | 창문 | 직접 작성 | 자체 제작 |
| `ko-river` | 강물 | 직접 작성 | 자체 제작 |
| `ko-breath` | 숨결 | 직접 작성 | 자체 제작 |
| `ko-morning-word` | 아침 | 직접 작성 | 자체 제작 |
| `ko-starlight` | 별빛 | 직접 작성 | 자체 제작 |
| `ko-footstep` | 발걸음 | 직접 작성 | 자체 제작 |
| `ko-notebook` | 공책 | 직접 작성 | 자체 제작 |

### 영어 (8)

| ID | 연습문 | 라이선스 | 출처 |
| --- | --- | --- | --- |
| `en-orchard` | orchard | 직접 작성 | 자체 제작 |
| `en-lantern` | lantern | 직접 작성 | 자체 제작 |
| `en-harbor` | harbor | 직접 작성 | 자체 제작 |
| `en-meadow` | meadow | 직접 작성 | 자체 제작 |
| `en-compass` | compass | 직접 작성 | 자체 제작 |
| `en-thunder` | thunder | 직접 작성 | 자체 제작 |
| `en-library` | library | 직접 작성 | 자체 제작 |
| `en-summer` | summer | 직접 작성 | 자체 제작 |

## 30초 낱말 도전

모든 도전 낱말은 직접 작성한 원문이다.

총 28개: 바람, 새벽, 연못, 우산, 모래, 햇살, 노을, 고래, 구름, 별빛, 산책, 물결, 종이, 나무, 달빛, 여행, 편지, 창가, 정원, 계절, 바다, 숲길, 노래, 기억, 마음, 하늘, 빗소리, 등불

## 짧은 글

### 한국어 (36)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `dawn-river` | 새벽 강변 | life | 직접 작성 | — | 자체 제작 | — |
| `small-library` | 작은 도서관 | life | 직접 작성 | — | 자체 제작 | — |
| `bakery-alley` | 골목의 빵집 | life | 직접 작성 | — | 자체 제작 | — |
| `autumn-walk` | 가을 산책 | literature | 직접 작성 | — | 자체 제작 | — |
| `city-stars` | 도시에서 별을 보는 법 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `first-computer` | 첫 컴퓨터 | technology | 직접 작성 | — | 자체 제작 | — |
| `radio-repair` | 오래된 라디오 | technology | 직접 작성 | — | 자체 제작 | — |
| `night-market` | 밤 시장 | life | 직접 작성 | — | 자체 제작 | — |
| `sea-time` | 바다의 시간 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `cat-window` | 고양이와 창가 | literature | 직접 작성 | — | 자체 제작 | — |
| `station-morning` | 정거장의 아침 | subculture | 직접 작성 | — | 자체 제작 | — |
| `robot-gardener` | 로봇 정원사 | subculture | 직접 작성 | — | 자체 제작 | — |
| `fantasy-inn` | 여행자의 여관 | subculture | 직접 작성 | — | 자체 제작 | — |
| `moon-poem` | 달빛 아래 | literature | 직접 작성 | — | 자체 제작 | — |
| `unsworn-morning` | 운수 좋은 날 (발췌) | literature | CC BY-SA 4.0 | 현진건 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/운수_좋은_날) |
| `typewriter-history` | 타자기의 역사 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/타자기) |
| `constitution-preamble` | 대한민국헌법 전문 | nonfiction | 퍼블릭 도메인 | 대한민국 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/대한민국헌법_(제10호)) |
| `hancom-typing-web` | 웹 기반 한컴 타자연습 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/한컴_타자연습) |
| `angbuilgu` | 앙부일구 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%95%99%EB%B6%80%EC%9D%BC%EA%B5%AC) |
| `baettaragi` | 배따라기 (발췌) | literature | CC BY-SA 4.0 | 김동인 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/배따라기) |
| `buckwheat` | 메밀꽃 필 무렵 (발췌) | literature | CC BY-SA 4.0 | 이효석 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/메밀꽃_필_무렵) |
| `camellia` | 동백꽃 (발췌) | literature | CC BY-SA 4.0 | 김유정 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/동백꽃) |
| `hangul-day` | 한글날 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B8%80%EB%82%A0) |
| `hanok` | 한옥 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EC%98%A5) |
| `hunminjeongeum` | 훈민정음 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%9B%88%EB%AF%BC%EC%A0%95%EC%9D%8C) |
| `jikji` | 직지심체요절 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%A7%81%EC%A7%80%EC%8B%AC%EC%B2%B4%EC%9A%94%EC%A0%88) |
| `kimchi` | 김치 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EA%B9%80%EC%B9%98) |
| `ondol` | 온돌 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%98%A8%EB%8F%8C) |
| `pansori` | 판소리 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%8C%90%EC%86%8C%EB%A6%AC) |
| `rain-gauge` | 측우기 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%B8%A1%EC%9A%B0%EA%B8%B0) |
| `rhythm-game` | 리듬 게임 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EB%A6%AC%EB%93%AC_%EA%B2%8C%EC%9E%84) |
| `spring-spring` | 봄봄 (발췌) | literature | CC BY-SA 4.0 | 김유정 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/봄봄) |
| `talchum` | 탈춤 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%83%88%EC%B6%A4) |
| `turtle-ship` | 거북선 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EA%B1%B0%EB%B6%81%EC%84%A0) |
| `webtoon` | 웹툰 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%9B%B9%ED%88%B0) |
| `yi-sun-sin` | 이순신 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%9D%B4%EC%88%9C%EC%8B%A0) |

### 영어 (16)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `rain-window` | The rain window | literature | 직접 작성 | — | 자체 제작 | — |
| `small-library-en` | The small library | life | 직접 작성 | — | 자체 제작 | — |
| `night-train-en` | The night train | literature | 직접 작성 | — | 자체 제작 | — |
| `signal-stars` | Signals from the night sky | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `last-arcade` | The last arcade | subculture | 직접 작성 | — | 자체 제작 | — |
| `hangul-english` | Hangul | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Hangul) |
| `bicycle` | Bicycle | life | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Bicycle) |
| `coffee` | Coffee | life | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Coffee) |
| `jazz` | Jazz | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Jazz) |
| `joseon-en` | Joseon | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Joseon) |
| `qwerty` | QWERTY | technology | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/QWERTY) |
| `retrocomputing` | Retrocomputing | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Retrocomputing) |
| `seoul` | Seoul | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Seoul) |
| `steampunk` | Steampunk | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Steampunk) |
| `typewriter-en` | Typewriter | technology | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Typewriter) |
| `video-game` | Video game | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Video_game) |

## 긴 글

### 한국어 (9)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `river-city` | 강과 도시 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `star-road` | 별길 여행자 | subculture | 직접 작성 | — | 자체 제작 | — |
| `wings-room` | 날개 (발췌) | literature | CC BY-SA 4.0 | 이상 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/날개) |
| `hangul-story` | 한글의 이름과 창제 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/한글) |
| `flame-sonata` | 광염 소나타 (발췌) | literature | CC BY-SA 4.0 | 김동인 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/광염_소나타) |
| `joseon` | 조선 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%A1%B0%EC%84%A0) |
| `provisional-government` | 대한민국 임시정부 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD_%EC%9E%84%EC%8B%9C%EC%A0%95%EB%B6%80) |
| `ready-made-life` | 레디메이드 인생 (발췌) | literature | CC BY-SA 4.0 | 채만식 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/레디메이드_인생) |
| `water-mill` | 물레방아 (발췌) | literature | CC BY-SA 4.0 | 나도향 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/물레방아) |

### 영어 (7)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `long-way-home` | The long way home | literature | 직접 작성 | — | 자체 제작 | — |
| `gift-of-the-magi` | The Gift of the Magi (excerpt) | literature | CC BY-SA 4.0 | O. Henry | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Four_Million/The_Gift_of_the_Magi) |
| `monkeys-paw` | The Monkey's Paw (excerpt) | literature | CC BY-SA 4.0 | W. W. Jacobs | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Lady_of_the_Barge/The_Monkey%27s_Paw) |
| `open-boat` | The Open Boat (excerpt) | literature | CC BY-SA 4.0 | Stephen Crane | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Open_Boat) |
| `scandal-bohemia` | A Scandal in Bohemia (excerpt) | literature | CC BY-SA 4.0 | Arthur Conan Doyle | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_(1892,_US)/A_Scandal_in_Bohemia) |
| `tell-tale-heart` | The Tell-Tale Heart (excerpt) | literature | CC BY-SA 4.0 | Edgar Allan Poe | English Wikisource | [열기](https://en.wikisource.org/wiki/Mystery_Tales_of_Edgar_Allan_Poe/The_Tell-Tale_Heart) |
| `yellow-wallpaper` | The Yellow Wall Paper (excerpt) | literature | CC BY-SA 4.0 | Charlotte Perkins Gilman | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Yellow_Wall_Paper) |

## 새 연습문을 추가할 때

1. 알맞은 애셋에 항목을 추가한다. 한 줄·낱말·도전 낱말은 `src/content/assets/`의 JSON에 넣는다.
2. 글(짧은 글·긴 글)에는 `license`와 `credit`을 함께 적는다. 직접 쓴 글이면 `license: "original"`과 `credit: null`을 쓰고, 복제한 글은 저자·출처·HTTPS 원문 URL을 `credit`에 채운다. `credit`이 없거나 URL이 HTTPS가 아닌 복제 글은 앱이 읽지 않는다.
3. 발췌문은 제목에 `(발췌)`를 붙이고, 그림 캡션·각주·목록 기호·HTML 엔티티 같은 추출 잔여물을 제거한다. 복제 글은 완결된 문장으로 끝낸다.
4. `npm run text-licenses:update`로 이 문서를 다시 생성한다.
5. `npm run test`와 `npm run build`를 실행한다. `src/content/textLicenseInventory.test.ts`가 이 문서와 애셋의 개수·제목·라이선스·저자·출처·URL이 일치하는지 검사하고, 기존 콘텐츠 테스트가 길이·문장 종료·출처 필수 규칙을 확인한다.

## 검증과 수정

- 검증: `npm run test`에 포함된 `src/content/textLicenseInventory.test.ts`가 `TEXT-LICENSES.md`를 현재 애셋에서 다시 만든 내용과 비교한다. 문서가 오래되면 테스트가 실패한다.
- 수정: `npm run text-licenses:update`가 같은 모듈로 문서를 다시 쓴다. 손으로 표를 고치지 않는다.
- 연습 화면과 글 고르기 목록에 보이는 출처 표기는 `passageActivities`의 `license`·`credit`을 그대로 사용하므로, 애셋이 이 문서의 원본이다.
