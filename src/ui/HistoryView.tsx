import { useState } from "react";
import { modeLabels } from "../domain/history";
import type { PracticeRecord, RecordedMode } from "../domain/history";
import { useFocus } from "./useFocus";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import { toDisplayedTypingSpeed } from "../domain/typingSpeed";
import type { TypingSpeedUnits } from "../domain/typingSpeed";

type HistoryViewProps = {
  records: readonly PracticeRecord[];
  onClear: () => Promise<boolean>;
  onBack: () => void;
  copy: InterfaceText;
  interfaceLanguage: Language;
  typingSpeedUnits: TypingSpeedUnits;
};

export function HistoryView({ records, onClear, onBack, copy, interfaceLanguage, typingSpeedUnits }: HistoryViewProps) {
  const title = useFocus<HTMLHeadingElement>();
  const dateFormat = new Intl.DateTimeFormat(interfaceLanguage === "ko" ? "ko" : "en", {
    dateStyle: "medium", timeStyle: "short",
  });
  const [filter, setFilter] = useState<RecordedMode | "all">("all");
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const visible = records.filter((record) => filter === "all" || record.mode === filter);

  async function clear() {
    setClearing(true);
    if (await onClear()) setConfirming(false);
    setClearing(false);
  }

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.key !== "Escape" || event.nativeEvent.isComposing ||
          event.target instanceof HTMLSelectElement) return;
      if (confirming) {
        setConfirming(false);
        title.current?.focus();
      } else {
        onBack();
      }
    }}>
      <button type="button" className="back" onClick={onBack}>{copy.backToMenu}</button>
      <h1 ref={title} tabIndex={-1}>{copy.activityLabel("history", "Recent practice")}</h1>
      <div className="history-toolbar">
        <label>{copy.practiceKind}{" "}
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
            <option value="all">{copy.all}</option>
            {Object.keys(modeLabels).map((mode) => <option value={mode} key={mode}>{copy.modeLabel(mode)}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => setConfirming(true)}>{copy.clearHistory}</button>
      </div>
      {confirming && (
        <div className="target" aria-label={copy.clearHistory}>
          <p>{copy.confirmClearHistory}</p>
          <div className="result-actions">
            <button type="button" className="button" disabled={clearing} onClick={() => void clear()}>{copy.clearAllHistory}</button>
            <button type="button" className="button secondary" disabled={clearing} onClick={() => setConfirming(false)}>{copy.cancel}</button>
          </div>
        </div>
      )}
      {visible.length === 0 ? <p className="lede">{copy.noRecords}</p> : (
        <ul className="history-list">
          {visible.map(({ id, mode, language, completedAt, score }) => {
            const speedUnit = typingSpeedUnits[language];
            const speed = toDisplayedTypingSpeed(score.charactersPerMinute, speedUnit);
            return (
              <li key={id}>
                <div><strong>{copy.modeLabel(mode)}</strong> · {language === "ko" ? copy.korean : copy.english}</div>
                <span>{dateFormat.format(completedAt)}</span>
                <div>
                  {score.accuracy === null ? "—" : copy.accuracyValue(Math.round(score.accuracy))}
                  {speed !== null && ` · ${copy.speedValue(Math.round(speed), speedUnit)}`}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
