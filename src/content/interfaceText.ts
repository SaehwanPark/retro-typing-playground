import type { Language } from "./lessons";

export type InterfaceText = Readonly<{
  typingPractice: string;
  menu: string;
  back: string;
  settings: string;
  backToMenu: string;
  backToSettings: string;
  start: string;
  navigationHint: string;
  screenCapture: string;
  saving: string;
  captureDisclosure: string;
  interfaceLanguage: string;
  practiceLanguage: string;
  practiceLanguageAfterMenu: string;
  korean: string;
  english: string;
  practiceSize: string;
  standardSize: string;
  largeSize: string;
  largestSize: string;
  resetSize: string;
  colorTheme: string;
  terminalTheme: string;
  paperTheme: string;
  resetTheme: string;
  practiceFont: string;
  gothicFont: string;
  serifFont: string;
  resetFont: string;
  completionSound: string;
  completionSoundHelp: string;
  soundOn: string;
  soundOff: string;
  resetSettings: string;
  settingsHelp: string;
  saveFailed: string;
  invalidSettings: string;
  chooseArticle: string;
  choosePractice: string;
  select: string;
  currentPrompt: string;
  followAlong: string;
  submit: string;
  finishPractice: string;
  currentScore: string;
  previousSentence: string;
  previousScore: string;
  accuracy: string;
  speedCpm: string;
  elapsedTime: string;
  result: string;
  practiceComplete: string;
  thisResult: string;
  sameModePrevious: string;
  previousResult: string;
  practiceAgain: string;
  returnTo: (destination: string) => string;
  openPractice: string;
  blockedPracticeInput: string;
  remainingCharacters: (count: number) => string;
  noRecords: string;
  practiceKind: string;
  all: string;
  clearHistory: string;
  confirmClearHistory: string;
  clearAllHistory: string;
  cancel: string;
  historySaveFailed: string;
  historyClearFailed: string;
  historyCleared: string;
  historyReadFailed: string;
  accuracyValue: (value: number) => string;
  charactersPerMinute: (value: number) => string;
  challengeTitle: string;
  challengeInstruction: string;
  challengeStart: string;
  challengeResult: string;
  timeEnded: string;
  challengeStopped: string;
  solvedWords: string;
  solvedWordCount: (count: number) => string;
  elapsedTimeValue: (seconds: string) => string;
  retryChallenge: string;
  remainingTime: (seconds: number) => string;
  enterWord: string;
  stopChallenge: string;
  blockedWordInput: string;
  retryWord: string;
  freePractice: string;
  freePracticeLabel: string;
  freePracticeHint: string;
  newline: string;
  positionPractice: string;
  positionInstruction: string;
  tryAgain: string;
  nextKey: string;
  articleCurrentLine: string;
  articleCompletedLine: string;
  articleNextLine: string;
  screenCaptureError: string;
  screenCaptureSuccess: string;
  screenCaptureUnsupported: string;
  activityLabel: (id: string, fallback: string) => string;
  modeLabel: (mode: string) => string;
}>;

const ko: InterfaceText = {
  typingPractice: "타자 연습",
  menu: "메뉴",
  back: "← 뒤로",
  settings: "환경설정",
  backToMenu: "← 메뉴",
  backToSettings: "← 환경설정",
  start: "시작",
  navigationHint: "선택 · 시작",
  screenCapture: "화면 저장",
  saving: "저장 중…",
  captureDisclosure: "화면 저장을 선택하면 입력 내용도 PNG에 포함됩니다.",
  interfaceLanguage: "인터페이스 언어",
  practiceLanguage: "연습 언어",
  practiceLanguageAfterMenu: "연습 중에는 현재 내용을 유지합니다. 언어 변경은 메뉴로 돌아간 뒤 적용하세요.",
  korean: "한국어",
  english: "영어",
  practiceSize: "연습 글자 크기",
  standardSize: "기본",
  largeSize: "크게",
  largestSize: "아주 크게",
  resetSize: "기본 크기로 되돌리기",
  colorTheme: "색상 테마",
  terminalTheme: "터미널 야간",
  paperTheme: "종이 밝음",
  resetTheme: "기본 색상으로 되돌리기",
  practiceFont: "연습 글꼴",
  gothicFont: "고딕",
  serifFont: "명조",
  resetFont: "기본 글꼴로 되돌리기",
  completionSound: "완료 효과음",
  completionSoundHelp: "한 연습을 마칠 때 한 번 재생합니다. 입력 중에는 소리가 나지 않습니다.",
  soundOn: "켬",
  soundOff: "끔",
  resetSettings: "환경설정을 기본값으로 되돌리기",
  settingsHelp: "변경 사항은 이 브라우저에 저장됩니다. Esc를 누르면 이전 화면으로 돌아갑니다.",
  saveFailed: "설정을 저장하지 못했습니다. 현재 탭에서만 적용됩니다.",
  invalidSettings: "저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.",
  chooseArticle: "장문 고르기",
  choosePractice: "연습 종류 고르기",
  select: "선택",
  currentPrompt: "제시문",
  followAlong: "따라 입력하기",
  submit: "제출",
  finishPractice: "연습 마치기",
  currentScore: "현재 점수",
  previousSentence: "직전 문장",
  previousScore: "직전 점수",
  accuracy: "정확도",
  speedCpm: "타수/분",
  elapsedTime: "경과 시간",
  result: "결과",
  practiceComplete: "연습 완료",
  thisResult: "이번 결과",
  sameModePrevious: "같은 모드의 이전 기록",
  previousResult: "이전 결과",
  practiceAgain: "다시 연습",
  returnTo: (destination) => destination === "메뉴" ? "메뉴로 돌아가기" : "장문 목록으로 돌아가기",
  openPractice: "연습으로 돌아가기",
  blockedPracticeInput: "연습 문장은 키보드로 직접 입력하세요.",
  remainingCharacters: (count) => `제시문이 ${count}자 남았습니다.`,
  noRecords: "표시할 연습 기록이 없습니다.",
  practiceKind: "연습 종류",
  all: "전체",
  clearHistory: "기록 지우기",
  confirmClearHistory: "이 브라우저에 저장한 연습 기록을 지울까요?",
  clearAllHistory: "전체 기록 지우기",
  cancel: "취소",
  historySaveFailed: "이번 기록은 저장하지 못했습니다. 앱을 닫기 전까지 볼 수 있습니다.",
  historyClearFailed: "기록을 지우지 못했습니다. 브라우저의 저장 설정을 확인하세요.",
  historyCleared: "최근 연습 기록을 지웠습니다.",
  historyReadFailed: "저장된 기록을 읽을 수 없습니다. 현재 연습은 계속할 수 있습니다.",
  accuracyValue: (value) => `정확도 ${value}%`,
  charactersPerMinute: (value) => `${value} 타수/분`,
  challengeTitle: "30초 낱말 도전",
  challengeInstruction: "한글 낱말을 그대로 입력하고 Enter를 누르세요. 30초 동안 맞힌 낱말 수를 셉니다.",
  challengeStart: "도전 시작",
  challengeResult: "도전 결과",
  timeEnded: "시간이 끝났습니다.",
  challengeStopped: "도전을 중단했습니다.",
  solvedWords: "맞힌 낱말",
  solvedWordCount: (count) => `${count}개`,
  elapsedTimeValue: (seconds) => `${seconds}초`,
  retryChallenge: "다시 도전",
  remainingTime: (seconds) => `남은 시간 ${seconds}초`,
  enterWord: "낱말은 키보드로 직접 입력하세요.",
  stopChallenge: "중단",
  blockedWordInput: "제시된 낱말과 같은지 확인하세요.",
  retryWord: "낱말 연습",
  freePractice: "연습장",
  freePracticeLabel: "원하는 내용을 자유롭게 입력하세요",
  freePracticeHint: "Enter 줄바꿈 · Esc 메뉴",
  newline: "줄바꿈",
  positionPractice: "물리 키 위치 연습",
  positionInstruction: "강조된 위치의 키를 누르세요.",
  tryAgain: "다시 시도하세요.",
  nextKey: "다음 키",
  articleCurrentLine: "현재 줄",
  articleCompletedLine: "완료한 줄",
  articleNextLine: "다음 줄",
  screenCaptureError: "화면을 저장하지 못했습니다. 다시 시도하세요.",
  screenCaptureSuccess: "화면을 PNG로 저장했습니다.",
  screenCaptureUnsupported: "이 브라우저에서는 화면 저장을 지원하지 않습니다.",
  activityLabel: (id, fallback) => ({
    "ko-sentence": "한글 단문",
    "ko-word": "한글 낱말",
    "en-sentence": "영문 단문",
    "en-word": "영문 낱말",
    "ko-positions": "두벌식 자리 연습",
    "article-library": "장문 고르기",
    challenge: "30초 낱말 도전",
    "free-practice": "연습장",
    history: "최근 연습 기록",
    settings: "환경설정",
    "dawn-river": "새벽 강변",
    "small-library": "작은 도서관",
  }[id] ?? fallback),
  modeLabel: (mode) => ({ word: "낱말", sentence: "단문", article: "장문", position: "자리" }[mode] ?? mode),
};

const en: InterfaceText = {
  typingPractice: "Typing practice",
  menu: "Menu",
  back: "← Back",
  settings: "Settings",
  backToMenu: "← Menu",
  backToSettings: "← Settings",
  start: "Start",
  navigationHint: "Select · Start",
  screenCapture: "Save screen",
  saving: "Saving…",
  captureDisclosure: "Saving the screen includes the visible text in the PNG.",
  interfaceLanguage: "Interface language",
  practiceLanguage: "Practice language",
  practiceLanguageAfterMenu: "The current practice stays open. Return to the menu to change the practice language.",
  korean: "Korean",
  english: "English",
  practiceSize: "Practice text size",
  standardSize: "Standard",
  largeSize: "Large",
  largestSize: "Largest",
  resetSize: "Reset text size",
  colorTheme: "Color theme",
  terminalTheme: "Terminal night",
  paperTheme: "Paper light",
  resetTheme: "Reset color theme",
  practiceFont: "Practice font",
  gothicFont: "Sans-serif",
  serifFont: "Serif",
  resetFont: "Reset practice font",
  completionSound: "Completion sound",
  completionSoundHelp: "Plays once when a practice item is submitted, never while typing.",
  soundOn: "On",
  soundOff: "Off",
  resetSettings: "Reset settings to defaults",
  settingsHelp: "Changes are saved in this browser. Press Escape to return to the previous screen.",
  saveFailed: "Settings could not be saved. Changes apply only in this tab.",
  invalidSettings: "Saved settings could not be read. Defaults are in use; the stored value was preserved.",
  chooseArticle: "Choose a passage",
  choosePractice: "Choose practice",
  select: "Select",
  currentPrompt: "Prompt",
  followAlong: "Type the prompt",
  submit: "Submit",
  finishPractice: "Finish practice",
  currentScore: "Current score",
  previousSentence: "Previous sentence",
  previousScore: "Previous score",
  accuracy: "Accuracy",
  speedCpm: "Characters/min",
  elapsedTime: "Elapsed time",
  result: "Result",
  practiceComplete: "Practice complete",
  thisResult: "This result",
  sameModePrevious: "Previous result in this mode",
  previousResult: "Previous result",
  practiceAgain: "Practice again",
  returnTo: (destination) => `Return to ${destination}`,
  openPractice: "Return to practice",
  blockedPracticeInput: "Type the prompt with your keyboard.",
  remainingCharacters: (count) => `${count} characters remain in the prompt.`,
  noRecords: "There are no practice records to show.",
  practiceKind: "Practice type",
  all: "All",
  clearHistory: "Clear history",
  confirmClearHistory: "Clear the practice records saved in this browser?",
  clearAllHistory: "Clear all records",
  cancel: "Cancel",
  historySaveFailed: "This result could not be saved. It remains available until you close the app.",
  historyClearFailed: "Could not clear records. Check this browser's storage settings.",
  historyCleared: "Recent practice records were cleared.",
  historyReadFailed: "Saved records could not be read. You can continue practicing.",
  accuracyValue: (value) => `Accuracy ${value}%`,
  charactersPerMinute: (value) => `${value} characters/min`,
  challengeTitle: "30-second word challenge",
  challengeInstruction: "Type each Korean word and press Enter. Count how many you solve in 30 seconds.",
  challengeStart: "Start challenge",
  challengeResult: "Challenge result",
  timeEnded: "Time is up.",
  challengeStopped: "The challenge was stopped.",
  solvedWords: "Words solved",
  solvedWordCount: (count) => `${count} words`,
  elapsedTimeValue: (seconds) => `${seconds} sec`,
  retryChallenge: "Try again",
  remainingTime: (seconds) => `${seconds} sec remaining`,
  enterWord: "Type the word with your keyboard.",
  stopChallenge: "Stop",
  blockedWordInput: "Check that the prompt and your input match.",
  retryWord: "Word practice",
  freePractice: "Free typing",
  freePracticeLabel: "Type anything you like",
  freePracticeHint: "Enter for a new line · Esc for menu",
  newline: "New line",
  positionPractice: "Physical key position practice",
  positionInstruction: "Press the highlighted key.",
  tryAgain: "Try again.",
  nextKey: "Next key",
  articleCurrentLine: "Current line",
  articleCompletedLine: "Completed line",
  articleNextLine: "Next line",
  screenCaptureError: "Could not save the screen. Try again.",
  screenCaptureSuccess: "Saved the screen as a PNG.",
  screenCaptureUnsupported: "Screen capture is not supported in this browser.",
  activityLabel: (id, fallback) => ({
    "ko-sentence": "Korean sentences",
    "ko-word": "Korean words",
    "en-sentence": "English sentences",
    "en-word": "English words",
    "ko-positions": "Korean keyboard positions",
    "article-library": "Choose a passage",
    challenge: "30-second word challenge",
    "free-practice": "Free typing",
    history: "Recent practice",
    settings: "Settings",
    "dawn-river": "Dawn by the river",
    "small-library": "The little library",
  }[id] ?? fallback),
  modeLabel: (mode) => ({ word: "Words", sentence: "Sentences", article: "Passage", position: "Positions" }[mode] ?? mode),
};

export function interfaceText(language: Language): InterfaceText {
  return language === "en" ? en : ko;
}
