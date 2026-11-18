import { useState } from "react";
import { modeLabels } from "../domain/history";
import type { PracticeRecord, RecordedMode } from "../domain/history";
import { useFocus } from "./useFocus";

type HistoryViewProps = {
  records: readonly PracticeRecord[];
  onClear: () => Promise<boolean>;
  onBack: () => void;
};

const dateFormat = new Intl.DateTimeFormat("ko", { dateStyle: "medium", timeStyle: "short" });

export function HistoryView({ records, onClear, onBack }: HistoryViewProps) {
  const title = useFocus<HTMLHeadingElement>();
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
      <button type="button" className="back" onClick={onBack}>← 메뉴</button>
      <h1 ref={title} tabIndex={-1}>최근 연습 기록</h1>
      <div className="history-toolbar">
        <label>연습 종류{" "}
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
            <option value="all">전체</option>
            {Object.entries(modeLabels).map(([mode, label]) => <option value={mode} key={mode}>{label}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => setConfirming(true)}>기록 지우기</button>
      </div>
      {confirming && (
        <div className="target" aria-label="기록 지우기 확인">
          <p>이 브라우저에 저장한 연습 기록을 지울까요?</p>
          <div className="result-actions">
            <button type="button" className="button" disabled={clearing} onClick={() => void clear()}>전체 기록 지우기</button>
            <button type="button" className="button secondary" disabled={clearing} onClick={() => setConfirming(false)}>취소</button>
          </div>
        </div>
      )}
      {visible.length === 0 ? <p className="lede">표시할 연습 기록이 없습니다.</p> : (
        <ul className="history-list">
          {visible.map(({ id, mode, language, completedAt, score }) => (
            <li key={id}>
              <div><strong>{modeLabels[mode]}</strong> · {language === "ko" ? "한글" : "영문"}</div>
              <span>{dateFormat.format(completedAt)}</span>
              <div>
                {score.accuracy === null ? "—" : `정확도 ${Math.round(score.accuracy)}%`}
                {score.charactersPerMinute !== null && ` · ${Math.round(score.charactersPerMinute)} 글자/분`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
