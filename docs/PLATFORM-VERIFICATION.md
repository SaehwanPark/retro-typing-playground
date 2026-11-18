# 데스크톱 브라우저와 한글 입력기 확인

정식 지원 여부는 실제 운영체제와 한국어 입력기 조합별로 기록한다. 엔진 자동화는 화면과 브라우저 이벤트 회귀를 확인하는 데 사용한다.

| 환경 | 확인 범위 | 남은 확인 |
| --- | --- | --- |
| Windows 11 Pro 26300 · Edge 157.0.4341.60 | Edge 확장으로 고정 루프백 주소의 배포물과 한글 낱말 입력창을 열고 포커스를 확인했다. 확장 탭의 `Alt_R` 뒤 `d` 키 전송은 영문 `d`를 입력해 실제 OS IME 조합을 증명하지 못했다. `Ctrl+=` 입력 뒤 페이지 DPR은 1로 유지되어 200% 확대도 확인되지 않았다. 같은 Windows의 Chrome 157에서 확정된 한글 텍스트로 제출, 재시도, Esc 복귀를 확인했다. | Edge 네이티브 창 제어는 현재 URL 허용 여부를 검증하지 못해 중단됐다. Microsoft 한국어 IME의 실제 조합과 200% 확대, 새 프로필 오프라인 완주를 확인한다. |
| Ubuntu 24.04.5 · Firefox 159 · IBus 1.5.29 / ibus-hangul 1.5.5 | 격리된 X11 데스크톱에서 실제 두벌식 조합, Backspace, Enter 확정과 이후 Enter 제출, Esc 메뉴 초점 복원을 확인했다. 루프백만 연결된 새 프로필에서 시작했고 브라우저 200% 확대와 새로고침한 뒤 기록 보존을 확인했다. | Linux 검증 완료. |
| macOS · Safari | 사용자 제공 로그에서 `npm ci`는 패키지 설치를 마쳤지만 `fsevents@2.3.3`의 설치 스크립트를 건너뛰었다. 저장소는 lockfile에 있는 해당 버전만 승인한다. Linux npm 12.2.2에서 엄격한 스크립트 정책으로 설치와 빌드를 확인했다. | 실제 macOS에서 깨끗한 체크아웃의 `npm ci`와 빌드를 확인하고, Safari와 한국어 두벌식에서 아래 절차를 확인한다. |

첨부 로그의 `npm audit fix --force`는 선언된 범위 밖의 SemVer 주요 버전 변경을 시도했고 취약점 보고도 남겼다. 감사 경고와 설치 스크립트 승인은 별개이므로 이를 설치 문제 해결에 사용하지 않는다. [npm audit 문서](https://docs.npmjs.com/cli/audit/)

Chromium과 Firefox는 Fedora WSL에서, WebKit은 격리된 Ubuntu에서 배포물 브라우저 테스트를 각각 10개씩 통과했다. Firefox에서 실제 IBus가 조합 종료 뒤 같은 Enter를 다시 전달하는 동작을 발견하고 키를 뗄 때까지 해당 단축키를 보류하도록 수정했다. [수정 PR](https://github.com/SaehwanPark/retro-typing-playground/pull/8)

## 환경별 재현 절차

1. Node.js LTS 22.12.0 이상으로 `npm ci`와 `npm run build`를 실행한다. 새로운 브라우저 프로필을 준비한다.
2. 외부 연결을 끊고 `node serve.mjs`로 앱을 연다. 브라우저에서 `http://127.0.0.1:41793/`의 시작 메뉴가 표시되는지 확인한다.
3. 운영체제의 한국어 두벌식을 활성화하고 한글 낱말을 연다. 영문 키 위치로 `d`, `u`, `s`를 눌러 첫 글자 ‘연’을 조합한다. 조합 중에는 글자 수와 오타 표시가 바뀌지 않는지, Backspace로 ‘여’가 되는지 확인한다. `s`, `v`, `l`, `f`를 눌러 ‘연필’을 완성한다.
4. 조합을 끝내는 Enter는 현재 글자만 확정하고 다음 Enter는 연습을 제출하는지 확인한다. 결과에서 Enter로 재시도하고 Esc로 직전에 선택한 메뉴로 돌아간다.
5. 브라우저를 200% 확대해 제시문, 입력창, 주요 버튼을 사용해 본다. 새로고침 뒤 완료 기록이 보존되는지 확인한다.
6. OS, 브라우저 버전, 입력기 종류, 통과한 단계와 재현 가능한 문제를 A06 PR에 기록한다.

Windows에서는 운영체제의 Microsoft 한국어 IME를 선택하고 오른쪽 Alt로 입력 모드를 확인한다. [Microsoft 한국어 IME](https://learn.microsoft.com/en-us/globalization/input/korean-ime)
