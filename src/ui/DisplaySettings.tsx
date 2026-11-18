import {
  defaultColorTheme,
  defaultPracticeFont,
  defaultSize,
} from "../storage/settingsStorage";
import type { ColorTheme, PracticeFont, TextSize } from "../storage/settingsStorage";
import type { AppPreferences } from "../storage/appPreferences";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import type { TypingSpeedUnit, TypingSpeedUnits } from "../domain/typingSpeed";
import { useFocus } from "./useFocus";

type DisplaySettingsProps = {
  interfaceLanguage: Language;
  practiceLanguage: Language;
  onInterfaceLanguageChange: (language: Language) => void;
  onPracticeLanguageChange: (language: Language) => void;
  typingSpeedUnits: TypingSpeedUnits;
  onTypingSpeedUnitChange: (language: Language, unit: TypingSpeedUnit) => void;
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

type ChoiceGroupProps<Value extends string> = {
  name: string;
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
  help?: string;
};

function ChoiceGroup<Value extends string>({
  name, label, value, options, onChange, disabled = false, help,
}: ChoiceGroupProps<Value>) {
  const helpId = help ? `${name}-help` : undefined;
  return (
    <fieldset className="setting-choice" disabled={disabled} aria-describedby={helpId}>
      <legend>{label}</legend>
      <div className="setting-choice-options">
        {options.map((option) => (
          <label key={option.value} className="setting-choice-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {help && <small id={helpId}>{help}</small>}
    </fieldset>
  );
}

export function DisplaySettings({
  interfaceLanguage,
  practiceLanguage,
  onInterfaceLanguageChange,
  onPracticeLanguageChange,
  typingSpeedUnits,
  onTypingSpeedUnitChange,
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
  return (
    <section className="screen settings-screen" onKeyDown={(event) => {
      if (event.key === "Escape" && !event.nativeEvent.isComposing &&
          !(event.target instanceof HTMLSelectElement)) onBack();
    }}>
      <button className="back" type="button" onClick={onBack}>{backLabel}</button>
      <h1 ref={heading} tabIndex={-1}>{copy.settings}</h1>
      <p className="lede">{copy.settingsHelp}</p>
      <div className="settings-panel settings-page">
        <ChoiceGroup<Language>
          name="interface-language"
          label={copy.interfaceLanguage}
          value={interfaceLanguage}
          options={[
            { value: "ko", label: copy.korean },
            { value: "en", label: copy.english },
          ]}
          onChange={onInterfaceLanguageChange}
        />
        <ChoiceGroup<Language>
          name="practice-language"
          label={copy.practiceLanguage}
          value={practiceLanguage}
          options={[
            { value: "ko", label: copy.korean },
            { value: "en", label: copy.english },
          ]}
          onChange={onPracticeLanguageChange}
          disabled={practiceLanguageLocked}
          {...(practiceLanguageLocked ? { help: copy.practiceLanguageAfterMenu } : {})}
        />
        <ChoiceGroup<TypingSpeedUnit>
          name="korean-speed-unit"
          label={copy.koreanSpeedUnit}
          value={typingSpeedUnits.ko}
          options={[
            { value: "cpm", label: copy.speedUnitCpm("ko") },
            { value: "wpm", label: copy.speedUnitWpm },
          ]}
          onChange={(value) => onTypingSpeedUnitChange("ko", value)}
        />
        <ChoiceGroup<TypingSpeedUnit>
          name="english-speed-unit"
          label={copy.englishSpeedUnit}
          value={typingSpeedUnits.en}
          options={[
            { value: "cpm", label: copy.speedUnitCpm("en") },
            { value: "wpm", label: copy.speedUnitWpm },
          ]}
          onChange={(value) => onTypingSpeedUnitChange("en", value)}
          help={copy.speedUnitHelp}
        />
        <ChoiceGroup<TextSize>
          name="practice-size"
          label={copy.practiceSize}
          value={size}
          options={[
            { value: "standard", label: copy.standardSize },
            { value: "large", label: copy.largeSize },
            { value: "largest", label: copy.largestSize },
          ]}
          onChange={(value) => { void onSizeChange(value); }}
        />
        <button type="button" className="button secondary" onClick={() => void onSizeChange(defaultSize, true)}>
          {copy.resetSize}
        </button>
        <ChoiceGroup<ColorTheme>
          name="color-theme"
          label={copy.colorTheme}
          value={theme}
          options={[
            { value: "terminal", label: copy.terminalTheme },
            { value: "paper", label: copy.paperTheme },
          ]}
          onChange={(value) => { void onThemeChange(value); }}
        />
        <button type="button" className="button secondary" onClick={() => void onThemeChange(defaultColorTheme, true)}>
          {copy.resetTheme}
        </button>
        <ChoiceGroup<PracticeFont>
          name="practice-font"
          label={`${copy.practiceFont} · ${practiceLanguage === "ko" ? copy.korean : copy.english}`}
          value={font}
          options={[
            { value: "gothic", label: copy.gothicFont },
            { value: "serif", label: copy.serifFont },
          ]}
          onChange={(value) => { void onFontChange(value); }}
        />
        <button type="button" className="button secondary" onClick={() => void onFontChange(defaultPracticeFont, true)}>
          {copy.resetFont}
        </button>
        <ChoiceGroup<"on" | "off">
          name="completion-sound"
          label={copy.completionSound}
          value={completionSound ? "on" : "off"}
          options={[
            { value: "off", label: copy.soundOff },
            { value: "on", label: copy.soundOn },
          ]}
          onChange={(value) => onCompletionSoundChange(value === "on")}
          help={copy.completionSoundHelp}
        />
        <button type="button" className="button secondary" onClick={onReset}>{copy.resetSettings}</button>
      </div>
      {labels.map((message) => <p key={message} className="notice" role="status">{message}</p>)}
    </section>
  );
}
