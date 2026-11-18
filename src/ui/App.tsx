import { useEffect, useRef } from "react";
import {
  challengeEntry,
  completionTime,
  freePracticeEntry,
  historyEntry,
  settingsEntry,
  usePracticeState,
} from "../app/usePractice";
import type { PracticeState } from "../app/usePractice";
import { useAppPreferences } from "../app/useAppPreferences";
import { useHistory } from "../app/useHistory";
import { useTextSize } from "../app/useTextSize";
import { useColorTheme } from "../app/useColorTheme";
import { usePracticeFont } from "../app/usePracticeFont";
import { useScreenCapture } from "../app/useScreenCapture";
import { activities } from "../content/lessons";
import type { Activity, Language } from "../content/lessons";
import { articles, libraryEntry } from "../content/articles";
import type { ArticleActivity } from "../content/articles";
import { interfaceText } from "../content/interfaceText";
import { splitCharacters, hasReachedEnd } from "../domain/typing";
import type { PositionKey } from "../domain/positions";
import { comparableRecord } from "../domain/history";
import { defaultColorTheme, defaultSize } from "../storage/settingsStorage";
import { ActivityMenu } from "./ActivityMenu";
import { ArticleView } from "./ArticleView";
import { ChallengeView } from "./ChallengeView";
import { DisplaySettings } from "./DisplaySettings";
import { HistoryView } from "./HistoryView";
import { FreePracticeView } from "./FreePracticeView";
import { PositionView } from "./PositionView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";
import { ScreenCaptureControl } from "./ScreenCaptureControl";
import { playCompletionTone } from "./completionSound";

function shouldPlayForCurrentSubmission(state: ReturnType<typeof usePracticeState>["state"]): boolean {
  if (state.screen === "practice") return hasReachedEnd(state.lesson.text, state.session.input);
  if (state.screen === "article") {
    const target = state.activity.lines[state.session.lineIndex];
    return target !== undefined && hasReachedEnd(target, state.session.line.input);
  }
  return false;
}

function contentState(state: PracticeState) {
  return state.screen === "settings" ? state.returnState : state;
}

function activityLanguage(activity: Activity | ArticleActivity): Language {
  if (activity.kind === "article") return activity.language;
  if (activity.kind === "position") return "ko";
  return activity.lessons[0]?.language ?? "ko";
}

function restoreContentFocus(root: HTMLDivElement | null, state: PracticeState): void {
  if (!root) return;
  const visible = contentState(state);
  let target: HTMLElement | null = null;
  if (visible.screen === "menu" || visible.screen === "library") {
    target = Array.from(root.querySelectorAll<HTMLElement>("button[data-activity]"))
      .find((button) => button.dataset.activity === visible.selected) ?? null;
  } else if (visible.screen === "practice" || visible.screen === "article") {
    target = root.querySelector("#typing-input");
  } else if (visible.screen === "free-practice") {
    target = root.querySelector("#free-practice-input");
  } else if (visible.screen === "positions") {
    target = root.querySelector(".keyboard");
  } else if (visible.screen === "result" || visible.screen === "history") {
    target = root.querySelector("h1[tabindex='-1']");
  } else if (visible.screen === "challenge") {
    target = root.querySelector("#typing-input") ?? root.querySelector("button:not(.back)");
  }
  target?.focus();
}

export function App() {
  const shell = useRef<HTMLElement>(null);
  const screenContent = useRef<HTMLDivElement>(null);
  const focusBeforeSettings = useRef<HTMLElement | null>(null);
  const settingsWereOpen = useRef(false);
  const practice = usePracticeState();
  const { state, pending, latest, dispatch, acknowledge } = practice;
  const currentScreen = contentState(state);
  const appPreferences = useAppPreferences();
  const { interfaceLanguage, practiceLanguage, completionSound, typingSpeedUnits } = appPreferences.preferences;
  const copy = interfaceText(interfaceLanguage);
  const history = useHistory(pending, acknowledge);
  const textSize = useTextSize();
  const colorTheme = useColorTheme();
  const practiceFont = usePracticeFont(practiceLanguage);
  const screenCapture = useScreenCapture(shell);
  const settingsReturnScreen = state.screen === "settings" ? state.returnState.screen : null;
  const practiceLanguageLocked = settingsReturnScreen === "practice" || settingsReturnScreen === "article" ||
    settingsReturnScreen === "positions" || settingsReturnScreen === "challenge" || settingsReturnScreen === "result";
  const settingsNotice = [appPreferences.notice, textSize.notice, colorTheme.notice, practiceFont.notice]
    .filter(Boolean).join(" ");
  const back = () => dispatch({ type: "return-to-menu" });
  const openSettings = () => {
    focusBeforeSettings.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dispatch({ type: "open-settings" });
  };
  const closeSettings = () => dispatch({ type: "close-settings" });
  const onInput = (input: string, at: number) => dispatch({ type: "input-changed", input, at });
  const onSubmit = (at: number) => {
    if (completionSound && shouldPlayForCurrentSubmission(currentScreen)) playCompletionTone();
    dispatch({ type: "submit", ...completionTime(at) });
  };
  const onPositionKey = (key: PositionKey, at: number) => {
    if (completionSound && currentScreen.screen === "positions" &&
        currentScreen.session.correct === currentScreen.activity.keys.length - 1 &&
        currentScreen.activity.keys[currentScreen.session.correct] === key) {
      playCompletionTone();
    }
    dispatch({ type: "position-key", key, ...completionTime(at) });
  };
  const notifyCompletion = () => { if (completionSound) playCompletionTone(); };

  useEffect(() => {
    document.documentElement.lang = interfaceLanguage;
    document.documentElement.dataset.practiceLanguage = practiceLanguage;
  }, [interfaceLanguage, practiceLanguage]);

  useEffect(() => {
    if (settingsWereOpen.current && state.screen !== "settings") {
      const previousFocus = focusBeforeSettings.current;
      if (previousFocus?.isConnected) previousFocus.focus();
      else restoreContentFocus(screenContent.current, state);
      focusBeforeSettings.current = null;
    }
    settingsWereOpen.current = state.screen === "settings";
  }, [state.screen]);

  const languageActivities = activities.filter((activity) => {
    if (activity.kind === "position") return practiceLanguage === "ko";
    return activity.lessons.some((lesson) => lesson.language === practiceLanguage);
  });
  const matchingArticles = articles.filter((article) => article.language === practiceLanguage);
  const mainActivities = [
    ...languageActivities,
    ...(matchingArticles.length ? [{ ...libraryEntry, kind: "library" as const }] : []),
    ...(practiceLanguage === "ko" ? [challengeEntry] : []),
    freePracticeEntry,
    historyEntry,
    settingsEntry,
  ].map((activity) => ({
    ...activity,
    label: copy.activityLabel(activity.id, activity.label),
  }));
  const articleList = matchingArticles.map((article) => ({
    ...article,
    label: copy.activityLabel(article.id, article.label),
    detail: interfaceLanguage === "ko"
      ? `${article.lines.reduce((total, line) => total + splitCharacters(line).length, 0)}자`
      : `${article.lines.reduce((total, line) => total + splitCharacters(line).length, 0)} characters`,
  }));

  const historyMessage = history.notice === "history-save-failed" ? copy.historySaveFailed :
    history.notice === "history-clear-failed" ? copy.historyClearFailed :
      history.notice === "history-cleared" ? copy.historyCleared :
        history.notice === "history-read-failed" ? copy.historyReadFailed : "";

  return (
    <main ref={shell} className="shell" data-text-size={textSize.size}>
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> Retro Typing Playground</span>
        <div className="masthead-actions">
          {currentScreen.screen !== "menu" && state.screen !== "settings" && (
            <button
              type="button"
              className="button secondary settings-shortcut"
              onClick={openSettings}
            >
              {copy.settings}
            </button>
          )}
          <ScreenCaptureControl
            isSaving={screenCapture.isSaving}
            status={screenCapture.status}
            copy={copy}
            onSave={() => { void screenCapture.save(); }}
          />
        </div>
      </header>

      <div ref={screenContent} className="screen-underlay" hidden={state.screen === "settings"}>
      {currentScreen.screen === "menu" && (
        <ActivityMenu
          title={copy.typingPractice}
          activities={mainActivities}
          selected={currentScreen.selected}
          copy={copy}
          onStart={(activity) => {
            if (activity.kind === "library") dispatch({ type: "open-library" });
            else if (activity.kind === "challenge") dispatch({ type: "open-challenge" });
            else if (activity.kind === "free-practice") dispatch({ type: "open-free-practice" });
            else if (activity.kind === "history") dispatch({ type: "open-history" });
            else if (activity.kind === "settings") openSettings();
            else dispatch({ type: "start", activity });
          }}
        />
      )}

      {currentScreen.screen === "challenge" && <ChallengeView onBack={back} copy={copy} onWordComplete={notifyCompletion} />}
      {currentScreen.screen === "free-practice" && <FreePracticeView onBack={back} copy={copy} />}

      {currentScreen.screen === "history" && (
        <HistoryView
          records={history.records}
          onClear={history.reset}
          onBack={back}
          copy={copy}
          interfaceLanguage={interfaceLanguage}
          typingSpeedUnits={typingSpeedUnits}
        />
      )}

      {currentScreen.screen === "library" && (
        <ActivityMenu
          title={copy.chooseArticle}
          activities={articleList}
          selected={currentScreen.selected}
          copy={copy}
          onStart={(activity) => dispatch({ type: "start", activity })}
          onBack={back}
        />
      )}

      {currentScreen.screen === "practice" && (
        <PracticeView
          key={currentScreen.round}
          title={currentScreen.lesson.title}
          prompt={currentScreen.lesson.text}
          language={currentScreen.lesson.language}
          session={currentScreen.session}
          previous={currentScreen.previous}
          speedUnit={typingSpeedUnits[currentScreen.lesson.language]}
          copy={copy}
          onInput={onInput}
          onSubmit={onSubmit}
          onFinish={() => dispatch({ type: "finish" })}
          onBack={back}
        />
      )}

      {currentScreen.screen === "article" && (
        <ArticleView
          activity={currentScreen.activity}
          session={currentScreen.session}
          onInput={onInput}
          onSubmit={onSubmit}
          onBack={back}
          copy={copy}
          speedUnit={typingSpeedUnits[currentScreen.activity.language]}
        />
      )}

      {currentScreen.screen === "positions" && (
        <PositionView
          activity={currentScreen.activity}
          session={currentScreen.session}
          onKey={onPositionKey}
          onBack={back}
          copy={copy}
        />
      )}

      {currentScreen.screen === "result" && (
        <ResultView
          title={currentScreen.activity.kind === "sentence" ? copy.previousSentence : copy.activityLabel(currentScreen.activity.id, currentScreen.activity.label)}
          score={currentScreen.score}
          showSpeed={currentScreen.activity.kind !== "position"}
          speedUnit={typingSpeedUnits[activityLanguage(currentScreen.activity)]}
          comparison={latest ? comparableRecord(latest, history.records)?.score : undefined}
          backLabel={currentScreen.activity.kind === "article" ? copy.chooseArticle : copy.menu}
          onRetry={() => dispatch({ type: "retry" })}
          onBack={back}
          copy={copy}
        />
      )}

      {historyMessage && <p className="storage-notice" role="status">{historyMessage}</p>}
      </div>

      {state.screen === "settings" && (
        <DisplaySettings
          interfaceLanguage={interfaceLanguage}
          practiceLanguage={practiceLanguage}
          onInterfaceLanguageChange={(language) => { void appPreferences.change({ interfaceLanguage: language }); }}
          onPracticeLanguageChange={(language) => { void appPreferences.change({ practiceLanguage: language }); }}
          typingSpeedUnits={typingSpeedUnits}
          onTypingSpeedUnitChange={(language, unit) => {
            void appPreferences.change({
              typingSpeedUnits: { ...appPreferences.preferences.typingSpeedUnits, [language]: unit },
            });
          }}
          size={textSize.size}
          onSizeChange={textSize.change}
          theme={colorTheme.theme}
          onThemeChange={colorTheme.change}
          font={practiceFont.font}
          onFontChange={practiceFont.change}
          completionSound={completionSound}
          onCompletionSoundChange={(enabled) => { void appPreferences.change({ completionSound: enabled }); }}
          onReset={() => {
            void Promise.all([
              appPreferences.reset(),
              textSize.change(defaultSize, true),
              colorTheme.change(defaultColorTheme, true),
              practiceFont.resetAll(),
            ]);
          }}
          onBack={closeSettings}
          backLabel={state.returnState.screen === "menu" ? copy.backToMenu : copy.back}
          practiceLanguageLocked={practiceLanguageLocked}
          notice={settingsNotice}
          copy={copy}
        />
      )}

    </main>
  );
}
