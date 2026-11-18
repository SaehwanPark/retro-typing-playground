# 플랫폼 검증표

현재 개발 기준은 **Windows 11 + Chrome**이다. 이 환경에서 설치·빌드·실행 또는 기본 한글 연습을 막는 치명적 문제가 재현된 경우에만 현재 개발을 멈춘다. 검증 도구의 한계나 확인되지 않은 항목은 실패가 아닌 증거 공백으로 기록한다.

| 환경 | 확인한 내용 | 남은 확인 |
| --- | --- | --- |
| **Windows 11 · Chrome (현재 기준)** | Windows 호스트 Node 26.13.0 / npm 12.2.0에서 엄격한 `npm ci`, `npm run build`, `node serve.mjs`와 루프백 HTTP 200을 확인했다. Chrome에서는 한글 단문 입력, 100% 점수, Enter 제출, 다음 문장, 직전 점수와 Esc 메뉴 복귀를 확인했다. A08의 메뉴 진입, 여러 줄 입력, Esc 복귀·초점 복원, 빈 상태 재진입도 확인했다. A09는 버튼과 `Ctrl+S`가 PNG를 내려받고, 저장된 PNG에 연습장 두 줄 입력이 보이는 것을 확인했다. 입력은 브라우저 제어 도구로 수행했다. A10의 두 테마는 WSL Chromium Playwright에서 자동 확인했으며 Windows Chrome 수동 확인은 남아 있다. | 실제 Microsoft 한국어 IME 조합과 Backspace, 조합 확정용·제출용 Enter 구분, 오프라인 새 프로필, 200% 확대, Windows Chrome에서 A10 테마 수동 확인. 브라우저 자동화와 확장 입력은 실제 OS IME를 검증할 수 없다. |
| Windows 11 · Edge (후속) | 확장 탭에서 로컬 배포물과 연습 입력창을 열었다. | Edge 호환성은 현재 기준이 아니다. |
| macOS · Safari (후속) | 실제 macOS 런타임 검증 전. 사용자 로그에서 npm 12.2.0 `npm ci`는 완료됐지만 잠금 파일의 macOS 전용 선택 의존성 `fsevents@2.3.3` 설치 스크립트가 차단됐다는 경고가 있었다. 프로젝트는 이 잠긴 버전만 `allowScripts`에서 승인한다. | macOS 설치·빌드와 Safari·한국어 IME 호환성. 승인 설정은 경고 원인을 다루며 macOS 앱 검증을 뜻하지 않는다. |
| Ubuntu · Firefox · IBus 한글 두벌식 (보조) | 실제 조합, Backspace, 조합 확정과 제출용 Enter, Esc 메뉴 복귀, 브라우저 200% 확대를 확인했다. Chromium·Firefox·WebKit 배포물 자동 확인도 마쳤다. | 보조 환경 증거로 유지한다. |

Playwright의 `CompositionEvent` 테스트는 앱이 합성 IME 이벤트 순서를 처리하는지 확인한다. 운영체제의 실제 입력기를 구동하는 검증으로 간주하지 않는다.

미확인 항목의 재현 절차는 [A06 기준 환경 확인 PR](https://github.com/SaehwanPark/retro-typing-playground/pull/6)에 기록한다. 자유 입력 연습(A08)은 점수나 앱 저장 데이터를 만들지 않으므로 플랫폼 검증 여부와 독립적으로 진행한다. A09는 사용자가 직접 저장을 요청했을 때만 입력이 이미지 파일에 포함된다.
