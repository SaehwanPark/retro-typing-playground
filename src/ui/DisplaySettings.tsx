import { defaultSize, isTextSize, textSizes } from "../storage/settingsStorage";
import type { TextSize } from "../storage/settingsStorage";

type DisplaySettingsProps = {
  size: TextSize;
  onChange: (size: TextSize, reset?: boolean) => Promise<void>;
  notice: string;
};

export function DisplaySettings({ size, onChange, notice }: DisplaySettingsProps) {
  return (
    <details className="display-settings">
      <summary>표시 설정</summary>
      <div className="settings-panel">
        <label>연습 글자 크기
          <select value={size} onChange={(event) => {
            const value = event.currentTarget.value;
            if (isTextSize(value)) void onChange(value);
          }}>
            {Object.entries(textSizes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => void onChange(defaultSize, true)}>
          기본 크기로 되돌리기
        </button>
        {notice && <p className="notice" role="status">{notice}</p>}
      </div>
    </details>
  );
}
