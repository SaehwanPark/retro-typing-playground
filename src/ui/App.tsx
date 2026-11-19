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
import { activities } from "../content/library";
import type { Activity, Language } from "../content/lessons";
import { longPassageEntry, passagesFor, shortPassageEntry } from "../content/passages";
import type { PassageActivity } from "../content/passages";
import { interfaceText } from "../content/interfaceText";
import { hasReachedEnd } from "../domain/typing";
import type { PositionKey } from "../domain/positions";
import { comparableRecord } from "../domain/history";
import { defaultColorTheme, defaultSize } from "../storage/settingsStorage";
import { ActivityMenu } from "./ActivityMenu";
import { PassageView } from "./PassageView";
import { ChallengeView } from "./ChallengeView";
import { DisplaySettings } from "./DisplaySettings";
import { HistoryView } from "./HistoryView";
import { FreePracticeView } from "./FreePracticeView";
import { PositionView } from "./PositionView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";
import { ScreenCaptureControl } from "./ScreenCaptureControl";
import { playCompletionTone } from "./completionSound";

function shouldPlayForCurrentSubmission(state: ReturnType<typeof usePracticeState>["state"], input?: string): boolean {
  if (state.screen === "practice") return hasReachedEnd(state.lesson.text, input ?? state.session.input);
  if (state.screen === "passage") {
    const target = state.activity.lines[state.session.lineIndex];
    return target !== undefined && hasReachedEnd(target, input ?? state.session.line.input);
  }
  return false;
}

function contentState(state: PracticeState) {
  return state.screen === "settings" ? state.returnState : state;
}

function activityLanguage(activity: Activity | PassageActivity): Language {
  if (activity.kind === "passage") return activity.language;
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
  } else if (visible.screen === "practice" || visible.screen === "passage") {
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
  target?.focus({ preventScroll: true });
}

function canRestoreFocus(root: HTMLElement | null, target: HTMLElement): boolean {
  return root !== null && root.contains(target) &&
    target.closest("[hidden]") === null && !target.matches(":disabled");
}

function restoreScreenFocus(root: HTMLElement | null, screenContent: HTMLDivElement | null, state: PracticeState): void {
  if (state.screen === "settings" && root) {
    const selected = root.querySelector<HTMLButtonElement>(".settings-menu [data-setting-row]:not(:disabled)");
    const heading = root.querySelector<HTMLElement>(".settings-screen h1[tabindex='-1']");
    (selected ?? heading)?.focus({ preventScroll: true });
    return;
  }
  restoreContentFocus(screenContent, state);
}

export function App() {
  const shell = useRef<HTMLElement>(null);
  const screenContent = useRef<HTMLDivElement>(null);
  const focusBeforeSettings = useRef<HTMLElement | null>(null);
  const lastAppFocus = useRef<HTMLElement | null>(null);
  const focusWasLost = useRef(false);
  const settingsWereOpen = useRef(false);
  const practice = usePracticeState();
  const { state, pending, latest, dispatch, acknowledge } = practice;
  const stateForFocus = useRef(state);
  stateForFocus.current = state;
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
  const practiceLanguageLocked = settingsReturnScreen === "practice" || settingsReturnScreen === "passage" ||
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
  const onSubmit = (at: number, input?: string) => {
    if (completionSound && shouldPlayForCurrentSubmission(currentScreen, input)) playCompletionTone();
    dispatch({ type: "submit", ...(input === undefined ? {} : { input }), ...completionTime(at) });
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
    let restoreFrame: number | null = null;

    function rememberFocus(event: FocusEvent) {
      if (event.target instanceof HTMLElement && canRestoreFocus(shell.current, event.target)) {
        lastAppFocus.current = event.target;
      }
    }

    function markFocusLost() {
      const active = document.activeElement;
      if (active instanceof HTMLElement && canRestoreFocus(shell.current, active)) {
        lastAppFocus.current = active;
      }
      focusWasLost.current = true;
    }

    function restoreFocus() {
      if (!focusWasLost.current || document.visibilityState === "hidden") return;
      const previous = lastAppFocus.current;
      if (previous && canRestoreFocus(shell.current, previous)) {
        previous.focus({ preventScroll: true });
      } else {
        restoreScreenFocus(shell.current, screenContent.current, stateForFocus.current);
      }
      const active = document.activeElement;
      if (active instanceof HTMLElement && canRestoreFocus(shell.current, active)) {
        lastAppFocus.current = active;
        focusWasLost.current = false;
      }
    }

    function scheduleFocusRestore() {
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
      restoreFrame = window.requestAnimationFrame(() => {
        restoreFrame = null;
        restoreFocus();
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") markFocusLost();
      else scheduleFocusRestore();
    }

    document.addEventListener("focusin", rememberFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", markFocusLost);
    window.addEventListener("focus", scheduleFocusRestore);
    window.addEventListener("pageshow", scheduleFocusRestore);
    return () => {
      document.removeEventListener("focusin", rememberFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", markFocusLost);
      window.removeEventListener("focus", scheduleFocusRestore);
      window.removeEventListener("pageshow", scheduleFocusRestore);
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
    };
  }, []);

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
  const shortPassages = passagesFor(practiceLanguage, "short");
  const longPassages = passagesFor(practiceLanguage, "long");
  const mainActivities = [
    ...languageActivities,
    ...(shortPassages.length ? [{ ...shortPassageEntry }] : []),
    ...(longPassages.length ? [{ ...longPassageEntry }] : []),
    ...(practiceLanguage === "ko" ? [challengeEntry] : []),
    freePracticeEntry,
    historyEntry,
    settingsEntry,
  ].map((activity) => ({
    ...activity,
    label: copy.activityLabel(activity.id, activity.label),
  }));
  const libraryPassages = currentScreen.screen === "library"
    ? passagesFor(practiceLanguage, currentScreen.length)
    : [];
  const passageList = libraryPassages.map((passage) => ({
    ...passage,
    label: copy.activityLabel(passage.id, passage.label),
    detail: `${copy.genreLabel(passage.genre)} · ${passage.characterCount}${copy.charactersSuffix}`,
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
            if (activity.kind === "short-library") dispatch({ type: "open-library", length: "short" });
            else if (activity.kind === "long-library") dispatch({ type: "open-library", length: "long" });
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
          title={currentScreen.length === "short" ? copy.chooseShortPassage : copy.chooseLongPassage}
          activities={passageList}
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

      {currentScreen.screen === "passage" && (
        <PassageView
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
          title={currentScreen.activity.kind === "line" ? copy.previousSentence : copy.activityLabel(currentScreen.activity.id, currentScreen.activity.label)}
          score={currentScreen.score}
          showSpeed={currentScreen.activity.kind !== "position"}
          language={activityLanguage(currentScreen.activity)}
          speedUnit={typingSpeedUnits[activityLanguage(currentScreen.activity)]}
          comparison={latest ? comparableRecord(latest, history.records)?.score : undefined}
          backLabel={currentScreen.activity.kind === "passage"
            ? currentScreen.activity.length === "short" ? copy.shortPassage : copy.longPassage
            : copy.menu}
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
