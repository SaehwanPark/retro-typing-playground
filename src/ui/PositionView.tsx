import type { KeyboardEvent } from "react";
import type { PositionActivity } from "../content/lessons";
import { isPositionKey, keyboardRows } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { useFocus } from "./useFocus";

type PositionViewProps = {
  activity: PositionActivity;
  session: PositionSession;
  onKey: (key: PositionKey, at: number) => void;
  onBack: () => void;
};

export function PositionView({ activity, session, onKey, onBack }: PositionViewProps) {
  const keyboard = useFocus<HTMLDivElement>();
  const target = activity.keys[session.correct];
  const targetLetter = target?.slice(3) ?? "";
  const targetHangul = keyboardRows.flat().find(([letter]) => letter === targetLetter)?.[1];

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
      return;
    }
    if (isPositionKey(event.code)) {
      event.preventDefault();
      onKey(event.code, performance.now());
    }
  }

  return (
    <section className="screen">
      <button className="back" type="button" onClick={onBack}>← 메뉴</button>
      <h1>{activity.label}</h1>
      <div
        className="target keyboard"
        tabIndex={0}
        ref={keyboard}
        onKeyDown={handleKey}
        aria-label="물리 키 위치 연습"
        aria-describedby="position-instruction"
      >
        <div className="target-label">
          <strong id="position-instruction">강조된 위치의 키를 누르세요.</strong>
          <span>{session.correct + 1} / {activity.keys.length}</span>
        </div>
        <p role="status" className="position-goal">
          {session.lastWrong && "다시 시도하세요. "}다음 키 <strong>{targetLetter} · {targetHangul}</strong>
        </p>
        <div className="keyboard-rows" aria-hidden="true">
          {keyboardRows.map((row, index) => (
            <div className="keyboard-row" key={index}>
              {row.map(([letter, hangul]) => (
                <kbd key={letter} className={letter === targetLetter ? "key-target" : ""}>
                  <span>{letter}</span><span>{hangul}</span>
                </kbd>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="keys"><kbd>Esc</kbd> 메뉴</p>
    </section>
  );
}
