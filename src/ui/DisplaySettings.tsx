import {
  colorThemes,
  defaultColorTheme,
  defaultSize,
  isColorTheme,
  isTextSize,
  textSizes,
} from "../storage/settingsStorage";
import type { ColorTheme, TextSize } from "../storage/settingsStorage";

type DisplaySettingsProps = {
  size: TextSize;
  onSizeChange: (size: TextSize, reset?: boolean) => Promise<void>;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme, reset?: boolean) => Promise<void>;
  notice: string;
};

export function DisplaySettings({
  size,
  onSizeChange,
  theme,
  onThemeChange,
  notice,
}: DisplaySettingsProps) {
  return (
    <details className="display-settings">
      <summary>표시 설정</summary>
      <div className="settings-panel">
        <label>연습 글자 크기
          <select value={size} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isTextSize(value)) void onSizeChange(value);
          }}>
            {Object.entries(textSizes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onSizeChange(defaultSize, true)}>
          기본 크기로 되돌리기
        </button>
        <label>색상 테마
          <select value={theme} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isColorTheme(value)) void onThemeChange(value);
          }}>
            {Object.entries(colorThemes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onThemeChange(defaultColorTheme, true)}>
          기본 색상으로 되돌리기
        </button>
        {notice && <p className="notice" role="status">{notice}</p>}
      </div>
    </details>
  );
}
