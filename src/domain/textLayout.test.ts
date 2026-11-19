import { expect, it } from "vitest";
import { passagePages, wrapText } from "./textLayout";

it("wraps at spaces and consumes the visual line break", () => {
  expect(wrapText("one two three four", 9)).toEqual(["one two", "three", "four"]);
  expect(wrapText("가나다라마바사아자차", 4)).toEqual(["가나다라", "마바사아", "자차"]);
});

it("keeps paragraphs separate and paginates five lines at a time", () => {
  const lines = wrapText("첫 문단입니다\n\n둘째 문단입니다", 20);
  expect(lines).toEqual(["첫 문단입니다", "둘째 문단입니다"]);
  expect(passagePages(Array.from({ length: 12 }, (_, index) => String(index))))
    .toEqual([
      ["0", "1", "2", "3", "4"],
      ["5", "6", "7", "8", "9"],
      ["10", "11"],
    ]);
});
