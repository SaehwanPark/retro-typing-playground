import { useEffect, useState } from "react";
import { recentRecords } from "../domain/history";
import type { PracticeRecord } from "../domain/history";
import { clearHistory, historyKey, readHistory, saveRecord } from "../storage/historyStorage";

export function useHistory(record: PracticeRecord | undefined, acknowledge: (id: string) => void) {
  const [saved, setSaved] = useState(readHistory);
  const [temporary, setTemporary] = useState<PracticeRecord[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === historyKey || event.key === null) setSaved(readHistory());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!record) return;
    let active = true;
    void saveRecord(record).then((result) => {
      if (!active) return;
      if (result.ok) {
        setSaved(readHistory());
        setNotice("");
      } else {
        setTemporary((previous) => recentRecords([...previous, record]));
        setNotice("이번 기록은 저장하지 못했습니다. 앱을 닫기 전까지 볼 수 있습니다.");
      }
      acknowledge(record.id);
    });
    return () => { active = false; };
  }, [record, acknowledge]);

  async function reset() {
    if (!await clearHistory()) {
      setNotice("기록을 지우지 못했습니다. 브라우저의 저장 설정을 확인하세요.");
      return false;
    }

    setSaved(readHistory());
    setTemporary([]);
    setNotice("최근 연습 기록을 지웠습니다.");
    return true;
  }

  return {
    records: recentRecords([...saved.records, ...temporary]),
    notice: notice || (saved.ok ? "" : "저장된 기록을 읽을 수 없습니다. 현재 연습은 계속할 수 있습니다."),
    reset,
  };
}
