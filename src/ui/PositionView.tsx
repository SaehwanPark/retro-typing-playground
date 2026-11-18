import type { KeyboardEvent } from "react";
import type { PositionActivity } from "../content/lessons";
import { isPositionKey, keyboardRows } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { useFocus } from "./useFocus";
import type { InterfaceText } from "../content/interfaceText";

type PositionViewProps = {
  activity: PositionActivity;
  session: PositionSession;
  onKey: (key: PositionKey, at: number) => void;
  onBack: () => void;
  copy: InterfaceText;
};

export function PositionView({ activity, session, onKey, onBack, copy }: PositionViewProps) {
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
      <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>
      <h1>{copy.activityLabel(activity.id, activity.label)}</h1>
      <div
        className="target keyboard"
        lang="ko"
        tabIndex={0}
        ref={keyboard}
        onKeyDown={handleKey}
        aria-label={copy.positionPractice}
        aria-describedby="position-instruction"
      >
        <div className="target-label">
          <strong id="position-instruction">{copy.positionInstruction}</strong>
          <span>{session.correct + 1} / {activity.keys.length}</span>
        </div>
        <p role="status" className="position-goal">
          {session.lastWrong && `${copy.tryAgain} `}{copy.nextKey} <strong>{targetLetter} · {targetHangul}</strong>
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
      <p className="keys"><kbd>Esc</kbd> {copy.menu}</p>
    </section>
  );
}
