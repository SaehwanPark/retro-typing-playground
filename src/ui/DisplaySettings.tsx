import {
  colorThemes,
  defaultColorTheme,
  defaultPracticeFont,
  defaultSize,
  isColorTheme,
  isPracticeFont,
  isTextSize,
  practiceFonts,
  textSizes,
} from "../storage/settingsStorage";
import type { ColorTheme, PracticeFont, TextSize } from "../storage/settingsStorage";
import type { AppPreferences } from "../storage/appPreferences";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import { useFocus } from "./useFocus";

type DisplaySettingsProps = {
  interfaceLanguage: Language;
  practiceLanguage: Language;
  onInterfaceLanguageChange: (language: Language) => void;
  onPracticeLanguageChange: (language: Language) => void;
  size: TextSize;
  onSizeChange: (size: TextSize, reset?: boolean) => Promise<void>;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme, reset?: boolean) => Promise<void>;
  font: PracticeFont;
  onFontChange: (font: PracticeFont, reset?: boolean) => Promise<void>;
  completionSound: AppPreferences["completionSound"];
  onCompletionSoundChange: (enabled: boolean) => void;
  onReset: () => void;
  onBack: () => void;
  backLabel: string;
  practiceLanguageLocked: boolean;
  notice: string;
  copy: InterfaceText;
};

function optionLabels(copy: InterfaceText, setting: "size" | "theme" | "font") {
  if (setting === "size") return {
    standard: copy.standardSize,
    large: copy.largeSize,
    largest: copy.largestSize,
  };
  if (setting === "theme") return {
    terminal: copy.terminalTheme,
    paper: copy.paperTheme,
  };
  return { gothic: copy.gothicFont, serif: copy.serifFont };
}

export function DisplaySettings({
  interfaceLanguage,
  practiceLanguage,
  onInterfaceLanguageChange,
  onPracticeLanguageChange,
  size,
  onSizeChange,
  theme,
  onThemeChange,
  font,
  onFontChange,
  completionSound,
  onCompletionSoundChange,
  onReset,
  onBack,
  backLabel,
  practiceLanguageLocked,
  notice,
  copy,
}: DisplaySettingsProps) {
  const heading = useFocus<HTMLHeadingElement>();
  const labels = Array.from(new Set(notice.split(" ").filter(Boolean))).map((code) =>
    code === "invalid" ? copy.invalidSettings : code === "save-failed" ? copy.saveFailed : ""
  ).filter(Boolean);
  const sizeLabels = optionLabels(copy, "size");
  const themeLabels = optionLabels(copy, "theme");
  const fontLabels = optionLabels(copy, "font");

  return (
    <section className="screen settings-screen" onKeyDown={(event) => {
      if (event.key === "Escape" && !event.nativeEvent.isComposing &&
          !(event.target instanceof HTMLSelectElement)) onBack();
    }}>
      <button className="back" type="button" onClick={onBack}>{backLabel}</button>
      <h1 ref={heading} tabIndex={-1}>{copy.settings}</h1>
      <p className="lede">{copy.settingsHelp}</p>
      <div className="settings-panel settings-page">
        <label>{copy.interfaceLanguage}
          <select value={interfaceLanguage} onChange={(event) => {
            const value = event.currentTarget.value;
            if (value === "ko" || value === "en") onInterfaceLanguageChange(value);
          }}>
            <option value="ko">{copy.korean}</option>
            <option value="en">{copy.english}</option>
          </select>
        </label>
        <label>{copy.practiceLanguage}
          <select value={practiceLanguage} disabled={practiceLanguageLocked} onChange={(event) => {
            const value = event.currentTarget.value;
            if (value === "ko" || value === "en") onPracticeLanguageChange(value);
          }}>
            <option value="ko">{copy.korean}</option>
            <option value="en">{copy.english}</option>
          </select>
          {practiceLanguageLocked && <small>{copy.practiceLanguageAfterMenu}</small>}
        </label>
        <label>{copy.practiceSize}
          <select value={size} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isTextSize(value)) void onSizeChange(value);
          }}>
            {Object.keys(textSizes).map((value) => (
              <option key={value} value={value}>{sizeLabels[value as TextSize]}</option>
            ))}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onSizeChange(defaultSize, true)}>
          {copy.resetSize}
        </button>
        <label>{copy.colorTheme}
          <select value={theme} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isColorTheme(value)) void onThemeChange(value);
          }}>
            {Object.keys(colorThemes).map((value) => (
              <option key={value} value={value}>{themeLabels[value as ColorTheme]}</option>
            ))}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onThemeChange(defaultColorTheme, true)}>
          {copy.resetTheme}
        </button>
        <label>{copy.practiceFont} · {practiceLanguage === "ko" ? copy.korean : copy.english}
          <select value={font} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isPracticeFont(value)) void onFontChange(value);
          }}>
            {Object.keys(practiceFonts).map((value) => (
              <option key={value} value={value}>{fontLabels[value as PracticeFont]}</option>
            ))}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onFontChange(defaultPracticeFont, true)}>
          {copy.resetFont}
        </button>
        <label>{copy.completionSound}
          <select value={completionSound ? "on" : "off"} onChange={(event) => {
            onCompletionSoundChange(event.currentTarget.value === "on");
          }}>
            <option value="off">{copy.soundOff}</option>
            <option value="on">{copy.soundOn}</option>
          </select>
          <small>{copy.completionSoundHelp}</small>
        </label>
        <button type="button" className="button secondary" onClick={onReset}>{copy.resetSettings}</button>
      </div>
      {labels.map((message) => <p key={message} className="notice" role="status">{message}</p>)}
    </section>
  );
}
