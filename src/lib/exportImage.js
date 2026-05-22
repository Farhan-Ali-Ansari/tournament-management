import html2canvas from "html2canvas";

const EXPORT_BG = "#08080a";
const EXPORT_SCALE = 3;

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Captures exactly what is visible in the element (matches on-screen layout).
 * Does not change any live DOM styles.
 */
export async function exportScreenHD(element, filename, options = {}) {
  if (!element) {
    throw new Error("Nothing to export.");
  }

  const scrollEl = options.scrollContainer ?? element;
  const scrollLeft = scrollEl.scrollLeft || 0;
  const scrollTop = scrollEl.scrollTop || 0;

  const width = element.clientWidth;
  const height = element.clientHeight;

  if (width < 1 || height < 1) {
    throw new Error("Export area is not visible.");
  }

  const canvas = await html2canvas(element, {
    backgroundColor: EXPORT_BG,
    scale: EXPORT_SCALE,
    useCORS: true,
    logging: false,
    allowTaint: true,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: -scrollLeft,
    scrollY: -scrollTop,
    x: 0,
    y: 0,
  });

  downloadCanvas(canvas, filename);
}

/** @deprecated alias */
export const exportUltraHD = exportScreenHD;
