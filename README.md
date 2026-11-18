# Retro Typing Playground

한메타자교실에서 느꼈던 타자 연습의 재미를 오늘날 브라우저로 옮기는 프로젝트입니다. 키보드로 연습을 고르고, 한글 제시문을 입력한 뒤 결과를 보고 다시 도전하는 흐름을 만듭니다.

현재 개발 기준 환경은 Windows 11 + Chrome입니다. Windows Edge와 macOS의 호환성 확인은 후속 범위이며, Linux Firefox와 IBus 한글 두벌식은 보조 환경으로 확인했습니다. 브라우저와 운영체제의 한글 입력기를 사용하고, 배포물을 받아 로컬에서 실행하면 인터넷 연결 없이 연습할 수 있도록 설계했습니다.

## 현재 상태

`v0.0.7`에서 두벌식 자리 연습, 한글·영문 낱말 및 연속 단문, 한글 장문, 30초 낱말 도전, 제시문 없는 연습장을 사용할 수 있습니다. 연습장은 여러 줄 자유 입력을 지원하며 나가면 입력 내용을 저장하지 않습니다. 점수와 연습 기록도 만들지 않습니다. 같은 브라우저에서 최근 100회 결과를 관리하고 화면 위의 표시 설정으로 연습 글자 크기를 정할 수 있습니다.

Windows 11 호스트에서 Node 26.13.0/npm 12.2.0으로 설치·빌드와 루프백 서버 응답을 확인했습니다. Windows Chrome에서 문장 연습·제출·점수·메뉴 복귀도 확인했지만, 브라우저 제어 도구의 텍스트 입력은 실제 Windows IME 검증을 대신하지 않습니다. 남은 Windows Chrome 확인과 보조 환경 근거는 [플랫폼 검증표](docs/PLATFORM-VERIFICATION.md)에 기록합니다. [기준 환경 검증 PR](https://github.com/SaehwanPark/retro-typing-playground/pull/6)

## 실행하기

Node.js LTS 22.12.0 이상이 필요합니다. 저장소에서 빌드한 뒤 실행합니다.

```sh
npm ci
npm run build
node serve.mjs
```

브라우저에서 [로컬 타자 연습](http://127.0.0.1:41793/)을 엽니다. 빌드한 앱을 옮길 때는 `dist/`와 `serve.mjs`를 같은 디렉터리에 두고 `node serve.mjs`를 실행하세요. Node.js와 두 파일 경로만 준비되면 오프라인에서 연습할 수 있습니다.

개발 중에는 `npm run dev`를 사용합니다. 전체 검증은 `npx playwright install chromium`을 실행한 뒤 `npm run verify`로 진행합니다.

## 프로젝트 문서

- [프로젝트 명세](docs/PROJECT-SPEC.md)에서 제품 범위, 화면 흐름, 기술 스택과 구현 구조를 볼 수 있습니다.
- [실행 체크리스트](docs/SPEC.md)에서 완료된 작업과 다음에 구현할 기능을 확인할 수 있습니다.
- [저장소 작업 지침](AGENTS.md)에 코딩 정책과 기능 단위 PR 작업 흐름이 있습니다.

화면과 연습 흐름은 다음 자료를 참고했습니다. [온라인 타자교실](https://typing.zidell.me/) · [에듀베이지 소개](https://www.edubeige.com/post/typing-zidell)
