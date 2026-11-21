import { toBlob } from "html-to-image";

export async function downloadScreenCapture(root: HTMLElement, capturedAt = new Date()): Promise<void> {
  const image = await toBlob(root, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(root).backgroundColor,
    filter: (node) => node.getAttribute?.("data-capture-ignore") !== "true",
    style: { margin: "0" },
  });
  if (!image) throw new Error("Could not render the application screen.");

  const url = URL.createObjectURL(image);
  const download = document.createElement("a");
  download.href = url;
  download.download = captureFilename(capturedAt);
  document.body.append(download);
  try {
    download.click();
  } finally {
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}

function captureFilename(date: Date): string {
  const part = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    part(date.getMonth() + 1),
    part(date.getDate()),
    part(date.getHours()),
    part(date.getMinutes()),
    part(date.getSeconds()),
  ].join("-");
  return `tagak-${stamp}.png`;
}
