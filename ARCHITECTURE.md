# ARCHITECTURE

Retro Typing Playground의 구조와 설계 결정을 정리한 문서입니다. 처음 코드를 보는 개발자가 "어디를 고쳐야 하는지" 빨리 찾을 수 있도록 계층, 데이터 흐름, 불변식, 검증 방법을 다룹니다. 제품 요구사항은 [docs/PROJECT-SPEC.md](docs/PROJECT-SPEC.md)를 따릅니다.

- 스택: TypeScript(strict) + React 19 + CSS, Vite 빌드, Vitest + Playwright 검증
- 배포: 정적 `dist/` + Node.js 내장 모듈만 쓰는 `serve.mjs`
- 상태: 도메인은 순수 함수, 브라우저 입출력은 경계로 격리

## 한눈에 보는 구조

```
키보드·IME → 확정된 입력과 시각 → 순수 상태 전이 → 화면 갱신 → 기록 저장 / 완료 효과음
             (ui/TypingInput)      (domain/*)         (app/usePractice)   (storage/*, ui/completionSound)
```

| 위치 | 책임 | 브라우저·React 의존 |
| --- | --- | --- |
| `src/domain/` | 세션 타입, 상태 전이, 입력 비교, 점수 계산, 줄바꿈, 기록 정렬 | 없음 (순수) |
| `src/content/` | 애셋 JSON 읽기·검증, 화면 문구, 연습 자료 구성 | 없음 (모듈 로드 시 검증) |
| `src/storage/` | localStorage 읽기·검증·마이그레이션·저장 | `localStorage`, `navigator.locks` |
| `src/app/` | 화면 전환 reducer, 저장·설정 훅, 결과 기록 큐 | React 훅 |
| `src/ui/` | React 화면, IME 입력 어댑터, 초점, PNG 저장, 효과음 | DOM, React |

의존 방향은 대체로 `ui → app → storage → domain`이고, `content/`는 `domain/` 위에 놓입니다. 지켜야 할 규칙은 **`domain/`이 브라우저·React·저장소에 의존하지 않는다**는 점입니다. `domain/`은 `content/`에서 `Language`·`NonEmpty` 같은 **타입만** 가져오고, `content/`는 `domain/`의 순수 함수(`splitCharacters`, `wrapText`)를 값으로 씁니다. 이 경계가 깨지면 순수 함수 테스트가 브라우저 환경을 요구하게 되므로 리뷰에서 우선 확인합니다.

## 디렉터리 지도

```
src/
├── domain/                 # 순수 규칙
│   ├── typing.ts           # 세션·채점·한글 타수·문자소 분할·실시간 정확도
│   ├── typingSpeed.ts      # cpm/wpm 단위 변환
│   ├── textLayout.ts       # 5줄 묶음, 폭 기준 줄바꿈
│   ├── passagePractice.ts  # 글 연습 진행, 묶음/글 전체 누적, 묶음 종료 판정
│   ├── positions.ts        # 두벌식 자리 연습 세션
│   ├── challenge.ts        # 30초 도전 상태 기계
│   └── history.ts          # 기록 모드·정렬·중복 제거·직전 기록 비교
├── content/
│   ├── interfaceText.ts    # 한국어/영어 UI 문구 (InterfaceText 타입)
│   ├── lessons.ts          # 낱말·한 줄 자료 타입과 검증, 한글 문장부호 정리
│   ├── library.ts          # 애셋 JSON → 활동 목록, 도전 낱말
│   ├── passages.ts         # 글 애셋 검증(라이선스·출처)과 줄바꿈
│   ├── textLicenseInventory.ts # 연습문 출처·라이선스 문서 생성
│   └── assets/*.json       # 연습 자료 원본
├── storage/
│   ├── appPreferences.ts   # 언어·완료 효과음·속도 단위 (v2)
│   ├── settingsStorage.ts  # 글자 크기 / 테마 / 언어별 글꼴
│   └── historyStorage.ts   # 최근 기록 (v3, 구버전 마이그레이션)
├── app/
│   ├── usePractice.ts      # 화면 전환 reducer + 완료 기록 큐
│   ├── useHistory.ts       # 기록 저장·동기화·초기화
│   ├── useAppPreferences.ts
│   ├── useTextSize.ts
│   ├── useColorTheme.ts
│   ├── usePracticeFont.ts
│   └── useScreenCapture.ts # Ctrl+S 경계, IME 조합 중 차단
└── ui/
    ├── App.tsx             # 화면 조립, 초점 복구, 효과음 트리거
    ├── TypingInput.tsx     # IME 이벤트 어댑터 (가장 민감한 경계)
    ├── PracticeView.tsx    # 낱말·한 줄·글 한 줄 공통 화면
    ├── PassageView.tsx     # 5줄 묶음 문맥
    ├── ChallengeView.tsx / PositionView.tsx / FreePracticeView.tsx
    ├── ResultView.tsx / HistoryView.tsx / DisplaySettings.tsx
    ├── Scoreboard.tsx / ActivityMenu.tsx / ScreenCaptureControl.tsx
    ├── useFocus.ts         # 마운트 시 초점
    ├── completionSound.ts  # Web Audio 1회 재생
    ├── screenCapture.ts    # html-to-image → PNG 다운로드
    └── styles.css          # CSS 사용자 정의 속성 기반 테마·글꼴
```

## 핵심 도메인 모델

### 세션과 점수

`PracticeSession`(낱말·한 줄·글의 한 줄)은 `input`, `startedAt`, `completedAt`만 가집니다. 시간은 항상 인자로 전달되어 같은 입력에서 같은 결과를 냅니다.

`TypingScore`는 정확도·글자 수·경과 시간과 언어별 속도 값을 담습니다.

- 한국어: `keystrokeCount`, `keystrokesPerMinute` (두벌식 타수 기준)
- 영어: `charactersPerMinute`

표시 단위(cpm/wpm)는 점수에 저장하지 않고 `typingSpeed.ts`에서 변환합니다. 기록에는 원시 값이 남으므로 단위를 바꿔도 과거 기록을 다시 계산할 수 있습니다.

### 실시간 정확도 vs 제출 시점 속도

화면이 연습 중에 보여주는 값은 `calculateLiveAccuracy`(또는 `passageAccuracy`)로, 속도를 의도적으로 `null`로 둡니다. 속도는 연습 단위가 끝날 때만 산출합니다. 이 분리가 없으면 "입력 중 속도 미표시" 규칙이 화면마다 흩어집니다. `PracticeView`는 250ms 타이머 없이 `liveScore()` 콜백만 받습니다.

### 글 연습의 두 스코프

`PassageSession`은 진행을 두 겹으로 누적합니다.

| 필드 | 범위 | 쓰임 |
| --- | --- | --- |
| `passage` | 완료한 줄들의 입력 시간 합 + 현재 줄 | 연습 완료 결과의 글 전체 속도 |
| `bundle` | 현재 5줄 묶음에서 완료한 줄들의 입력 시간 합 + 현재 줄 | 묶음이 끝날 때의 묶음 속도 |
| `lastBundle` | 마지막으로 끝난 묶음 | 다음 줄 화면에 "완료한 묶음" 점수로 표시 |

각 줄은 첫 확정 입력부터 제출까지 시간을 재고, 글 전체·묶음 진행은 그 시간을 누적합니다. 줄을 제출한 뒤 다음 줄의 첫 입력 전까지의 전환·적응 시간은 어느 범위에도 넣지 않습니다. 이 규칙이 없으면 같은 텍스트를 한 줄 연습으로 칠 때보다 글 연습의 타수가 낮게 나옵니다.

`endsBundle(nextLineIndex, lineCount)`가 묶음 경계를 단일 규칙으로 정의합니다. 페이지 경계(`5의 배수`)이거나 마지막 줄이면 묶음이 닫힙니다. 완료 효과음도 같은 함수(`submissionEndsBundle`)를 쓰므로 "소리 시점"과 "속도 보고 시점"이 어긋날 수 없습니다.

### 두벌식 타수 계산

`countKoreanKeystrokes`는 문자열을 문자소로 나눈 뒤, 각 글자를 NFD로 분해해 자모 수를 셉니다. 기본 자음·단모음은 1타, 이중모음·겹받침·겹자음은 2타, 쌍자음은 1타입니다. 한글 음절이 아닌 문자소(공백·문장부호·영문)는 1타입니다.

## IME 입력 경계 (`ui/TypingInput.tsx`)

이 파일이 이 앱에서 가장 까다로운 부분입니다. 브라우저·OS마다 `compositionstart`/`compositionend`/`beforeinput`/`input`/`keydown` 순서가 다르기 때문입니다.

지켜야 할 동작:

1. 조합 중인 텍스트는 편집기에 남기고, 확정된 값만 `onInput`으로 한 번 반영합니다(`confirmed` ref로 중복 차단).
2. 조합을 끝내는 `Enter`/`Space`는 제출로 이어지지 않습니다. 조합에 쓰인 물리 키는 **키를 뗄 때까지** `imeShortcuts`에 등록해 전달된 중복 이벤트를 막습니다.
3. 조합을 `Space`로 끝냈을 때: 남은 제시문이 있으면 공백 하나를 삽입하고, 입력이 끝났으면 `onSpaceSubmit`으로 제출합니다. `pendingCompositionSpace`가 조합 종료 직후 도착하는 중복 `input`을 되돌립니다.
4. macOS는 조합 확정 `Space`를 `compositionend` 이전에 텍스트로 넣기도 합니다. `spaceAlreadyInserted` 판정으로 이 경우를 처리합니다.
5. 붙여넣기·끌어놓기는 막고 `onBlockedEdit`으로 안내합니다.

여기 동작을 바꾸면 `e2e/practice.spec.ts`의 IME 시나리오와 실제 OS 입력기 수동 확인이 함께 필요합니다. [docs/PLATFORM-VERIFICATION.md](docs/PLATFORM-VERIFICATION.md)에 환경별 확인 범위를 기록합니다.

## 상태 흐름 (`app/usePractice.ts`)

`usePracticeState`는 `useReducer` 하나로 화면을 전환합니다.

- 화면 상태: `menu` · `library` · `history` · `challenge` · `free-practice` · `practice` · `positions` · `passage` · `result` (+ `settings`는 `returnState`를 감싼 래퍼)
- 이벤트: `start`, `input-changed`, `submit`, `position-key`, `retry`, `back`, 설정 열기/닫기 등
- 부수 효과는 reducer 밖에서 처리합니다. `reduceSessions`가 완료 기록을 큐(`pending`)에 넣고, `useHistory`가 저장한 뒤 `acknowledge`로 큐에서 빼냅니다. 저장에 실패하면 세션 메모리에 남겨 현재 탭에서 결과를 계속 볼 수 있게 합니다.

`reduceTextPractice`는 낱말이면 결과 화면으로, 한 줄이면 다음 문장으로 넘어갑니다. `reducePassagePractice`는 `submitPassageLine`의 결과(`waiting` / `next-line` / `completed`)를 화면 상태로 옮기기만 합니다.

## 저장 계층

모든 키는 `retro-typing-playground:` 접두사와 스키마 `version`을 가집니다. 읽기는 항상 "검증 → 마이그레이션 → 기본값" 순서이며, 손상된 값을 만나면 **원본을 덮어쓰지 않고** 기본값으로 동작한 뒤 사용자에게 알립니다.

| 키 | 내용 | 버전 / 마이그레이션 |
| --- | --- | --- |
| `:preferences` | 인터페이스·연습 언어, 완료 효과음, 언어별 속도 단위 | v2, v1은 속도 단위 기본값을 채워 읽음 |
| `:display` | 글자 크기 | v1 |
| `:color-theme` | 색상 테마 | v1 |
| `:practice-font` | 한국어/영어별 글꼴 | v2, v1(공통 글꼴)을 두 언어에 복사 |
| `:history` | 최근 기록(최대 100) | v3, v1·v2 읽기 지원, `sentence`→`line`, `article`→`long` 변환 |

쓰기는 `navigator.locks.request`로 직렬화합니다. 여러 탭이 동시에 완료해도 기록이 유실되지 않습니다. 잠금을 쓸 수 없으면 저장 실패로 처리하고 연습은 계속됩니다. 탭 간 동기화는 `storage` 이벤트로 읽기 상태만 갱신합니다.

A16 이전 한국어 기록은 두벌식 타수를 복원할 수 없으므로 정확도·시간은 남기고 CPM만 `null`로 감춥니다(`decodeRecord`).

## 표시 설정과 테마

글자 크기·테마·글꼴은 문서 루트의 `data-*` 속성으로 내려가고, `styles.css`의 CSS 사용자 정의 속성이 실제 색과 글꼴을 결정합니다.

```
html[data-color-theme="paper"] { --page: …; --ink: …; }
html[data-practice-font="serif"] { --practice-font: …; }
html[data-practice-language="en"][data-practice-font="serif"] { … }
```

- 초기값은 `main.tsx`가 첫 렌더 전에 설정해 깜빡임을 막습니다.
- `--practice-font`는 제시문·입력창·글 문맥·연습장·도전 낱말에만 적용하고, 메뉴·자판 도식·점수는 기본 글꼴을 유지합니다.
- 외부 글꼴·CDN을 쓰지 않습니다(오프라인 유지).

## 초점 관리 (`ui/App.tsx`, `ui/useFocus.ts`)

키보드만으로 전체 흐름을 쓸 수 있어야 하므로 초점은 명시적으로 관리합니다.

- 화면 전환 시 `restoreContentFocus`가 화면별 대상(입력창, 첫 메뉴 항목, 결과 제목 등)을 찾아 초점을 둡니다.
- 환경설정은 열기 직전 요소를 기억했다가 닫을 때 복원합니다.
- `visibilitychange`/`blur`/`focus`/`pageshow`로 탭 복귀 시 마지막 유효 컨트롤에 초점을 되돌립니다(없으면 화면 기본 대상).
- 설정 메뉴는 roving tabindex로 탭 정지점을 하나만 둡니다.

## 화면 저장과 효과음

- **PNG 저장**: `ui/screenCapture.ts`가 `html-to-image`로 앱 루트를 2배 해상도 PNG로 만듭니다. `data-capture-ignore="true"` 노드(저장 버튼)는 이미지에서 제외합니다. `useScreenCapture`는 `Ctrl+S`를 앱 화면 안에서만 처리하고 IME 조합 중에는 가로채지 않습니다.
- **완료 효과음**: `completionSound.ts`가 Web Audio로 짧은 톤을 1회 재생합니다. 트리거는 `App.tsx`에서 `submissionEndsBundle`(글)과 `hasReachedEnd`(낱말·한 줄·자리)로 판단하며, 오디오 실패는 연습을 막지 않습니다.

## 콘텐츠 애셋

연습 자료는 코드가 아니라 JSON에 있습니다. 경계에서 검증하고, 잘못된 항목은 조용히 버립니다.

- `one-line.{ko,en}.json`, `words.{ko,en}.json`, `challenge-words.json` — `lessons.ts`, `library.ts`가 읽습니다. 빈 문자열과 줄바꿈 포함 항목은 제외합니다.
- `passages.{ko,en}.json` — `passages.ts`가 읽습니다. `license`가 `original`이 아니면 `credit`(저자·출처·HTTPS URL)이 반드시 있어야 하고, 없으면 그 글을 싣지 않습니다. 이는 CC BY-SA·공공누리 출처 표기 의무를 지키기 위한 코드 수준의 가드입니다.
- 줄바꿈은 언어별 고정 폭(한국어 24자, 영어 44자)으로 미리 계산해 5줄 묶음 경계가 새로고침·화면 너비에 흔들리지 않게 합니다(`textLayout.ts`).
- `TEXT-LICENSES.md`는 `textLicenseInventory.ts`가 `activities`·`challengeWords`·`passageActivities`에서 생성합니다. 앱이 실제로 읽는 자료와 출처 표기가 같으므로, 새 자료를 추가하면 `npm run text-licenses:update`로 문서를 갱신합니다. `textLicenseInventory.test.ts`가 문서와 애셋 메타데이터의 일치를 검사합니다.

새 연습 자료를 추가할 때는 애셋만 늘리면 메뉴·기록·글자 수 표시가 따라옵니다. 테스트(`lessons.test.ts` 등)가 길이 기준과 출처 규칙을 검사하고, 라이선스 문서 테스트가 출처 표기 누락과 문서 지연을 막습니다.

## 테스트 전략

| 계층 | 도구 | 확인 내용 |
| --- | --- | --- |
| `domain/`, `content/`, `storage/` | Vitest (`src/**/*.test.ts`) | 채점·타수·묶음 경계·문자소·줄바꿈·마이그레이션·손상 데이터 |
| 브라우저 흐름 | Playwright (`e2e/*.spec.ts`) | 메뉴/설정 키보드 조작, 제출, IME 합성 이벤트, 초점 복귀, PNG, 기록, 효과음 재생 횟수 |
| 실제 입력기 | 수동 확인 | OS 한국어 IME 조합, Alt+Tab 복귀, 확대 |

Playwright의 `CompositionEvent`는 앱의 이벤트 순서 처리를 검증할 뿐, 실제 OS 입력기를 대신하지 않습니다. 이 구분을 [docs/PLATFORM-VERIFICATION.md](docs/PLATFORM-VERIFICATION.md)에 유지합니다.

`npm run verify`가 `test → build → test:e2e`를 순서대로 실행합니다. 코드나 런타임 동작이 바뀌지 않는 문서 변경에는 테스트·CI를 돌리지 않습니다.

## 빌드와 실행

- `npm run build` = `tsc -b`(프로젝트 참조 타입 검사) + `vite build`
- `serve.mjs`는 `127.0.0.1:41793`에만 바인딩하고 `dist/` 안의 파일만 제공합니다. `Host` 헤더 검사, 경로 탈출 방지(`realpath` 기준), 허용 MIME 목록, `X-Content-Type-Options: nosniff`를 적용합니다. 포트가 사용 중이면 원인을 안내하고 종료합니다.
- 포트를 Vite 개발·미리보기 기본 포트와 분리해 다른 앱의 Service Worker나 저장소가 겹치지 않게 합니다.
- `serve.mjs`는 npm 패키지에 의존하지 않습니다. Node.js 내장 모듈만 씁니다.

## 확장할 때 체크리스트

1. 새 연습 모드: `domain/`에 순수 상태 기계 → `app/usePractice.ts`의 화면 상태·이벤트 → `ui/` 화면 → `interfaceText.ts` 문구(ko/en) → `history.ts` 모드 레이블 → 단위 테스트와 E2E.
2. 새 설정: `storage/`에 버전형 키와 읽기/쓰기 → `app/use*.ts` 훅 → `DisplaySettings.tsx` 행 → `interfaceText.ts`.
3. 저장 스키마 변경: 기존 버전을 **읽기**로 남기고 새 버전을 추가합니다. 손상 값은 덮어쓰지 않습니다.
4. IME 관련 변경: `TypingInput.tsx`의 5가지 규칙을 유지하고, 합성 이벤트 E2E와 수동 확인 계획을 PR에 함께 적습니다.
