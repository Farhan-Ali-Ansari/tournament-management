import html2canvas from "html2canvas";

const EXPORT_BG = "#08080a";
const EXPORT_SCALE = 3;

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function renderElementToCanvas(element, width, height, scroll = {}) {
  const { scrollX = 0, scrollY = 0 } = scroll;
  return html2canvas(element, {
    backgroundColor: EXPORT_BG,
    scale: EXPORT_SCALE,
    useCORS: true,
    logging: false,
    allowTaint: true,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX,
    scrollY,
    x: 0,
    y: 0,
  });
}

/**
 * Captures an off-screen clone at full content height (no scroll clipping).
 * Use for scrollable panels where only part of the content is visible on screen.
 */
export async function exportElementFullContent(element, filename, options = {}) {
  if (!element) {
    throw new Error("Nothing to export.");
  }

  const width = options.width ?? element.offsetWidth;
  if (width < 1) {
    throw new Error("Export area is not visible.");
  }

  const clone = element.cloneNode(true);
  const frame = options.frameElement;
  const frameStyles = frame ? getComputedStyle(frame) : null;

  Object.assign(clone.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${width}px`,
    maxWidth: `${width}px`,
    maxHeight: "none",
    height: "auto",
    overflow: "visible",
    boxShadow: frameStyles?.boxShadow || "none",
    border: frameStyles?.border || "none",
    borderRadius: frameStyles?.borderRadius || "0",
    background: frameStyles?.background || clone.style.background,
    margin: "0",
    zIndex: "-1",
  });

  document.body.appendChild(clone);
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const height = clone.scrollHeight;
  if (height < 1) {
    document.body.removeChild(clone);
    throw new Error("Export area is not visible.");
  }

  try {
    const canvas = await renderElementToCanvas(clone, width, height);
    downloadCanvas(canvas, filename);
  } finally {
    document.body.removeChild(clone);
  }
}

/**
 * Captures exactly what is visible in the element (matches on-screen layout).
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

  const canvas = await renderElementToCanvas(element, width, height, {
    scrollX: -scrollLeft,
    scrollY: -scrollTop,
  });
  downloadCanvas(canvas, filename);
}

/** @deprecated alias */
export const exportUltraHD = exportScreenHD;
