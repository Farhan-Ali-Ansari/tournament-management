import html2canvas from "html2canvas";

const EXPORT_BG = "#08080a";
const EXPORT_SCALE = 3;

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function waitForExportReady() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/** Strip interactive chrome and expand scroll areas before capture. */
export function sanitizeExportClone(clone, options = {}) {
  clone.querySelectorAll("[data-export-hide]").forEach((el) => el.remove());

  if (options.expandHorizontal) {
    clone.querySelectorAll(".bracket-scroll").forEach((el) => {
      el.style.overflow = "visible";
      el.style.width = "max-content";
      el.style.maxWidth = "none";
    });
    clone.querySelectorAll(".bracket-tree").forEach((el) => {
      el.style.width = "max-content";
      el.style.minWidth = "max-content";
    });
    clone.querySelectorAll(".knockout-panel__capture").forEach((el) => {
      el.style.overflow = "visible";
    });
  }

  clone.querySelectorAll(".fixture-score-input").forEach((input) => {
    const span = document.createElement("span");
    span.className = "fixture-score-display";
    span.textContent = input.value === "" ? "—" : input.value;
    input.replaceWith(span);
  });
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
 * Captures an off-screen clone at full content height (and optional full width).
 * Use for scrollable panels where only part of the content is visible on screen.
 */
export async function exportElementFullContent(element, filename, options = {}) {
  if (!element) {
    throw new Error("Nothing to export.");
  }

  const baseWidth = options.width ?? element.offsetWidth;
  if (baseWidth < 1) {
    throw new Error("Export area is not visible.");
  }

  const clone = element.cloneNode(true);
  const frame = options.frameElement;
  const frameStyles = frame ? getComputedStyle(frame) : null;

  Object.assign(clone.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${baseWidth}px`,
    maxWidth: `${baseWidth}px`,
    minWidth: `${baseWidth}px`,
    maxHeight: "none",
    height: "auto",
    overflow: "visible",
    boxShadow: frameStyles?.boxShadow || "none",
    border: frameStyles?.border || "none",
    borderRadius: frameStyles?.borderRadius || "0",
    background: frameStyles?.background || frameStyles?.backgroundColor || "#08080a",
    margin: "0",
    zIndex: "-1",
    boxSizing: "border-box",
    animation: "none",
    transform: "none",
    opacity: "1",
  });

  document.body.appendChild(clone);
  sanitizeExportClone(clone, options);
  options.onPrepareClone?.(clone);
  await waitForExportReady();

  const width = options.expandHorizontal
    ? Math.max(clone.scrollWidth, baseWidth)
    : baseWidth;
  const height = clone.scrollHeight;

  if (width < 1 || height < 1) {
    document.body.removeChild(clone);
    throw new Error("Export area is not visible.");
  }

  Object.assign(clone.style, {
    width: `${width}px`,
    maxWidth: `${width}px`,
    minWidth: `${width}px`,
  });

  await waitForExportReady();

  try {
    const canvas = await renderElementToCanvas(clone, width, height);
    downloadCanvas(canvas, filename);
  } finally {
    document.body.removeChild(clone);
  }
}

const CELEBRATION_EXPORT_WIDTH = 420;

/**
 * High-quality PNG of the tournament celebration card (fixed layout, no UI buttons).
 */
export async function exportCelebrationCard(element, filename) {
  if (!element) {
    throw new Error("Nothing to export.");
  }

  const clone = element.cloneNode(true);
  const styles = getComputedStyle(element);

  Object.assign(clone.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${CELEBRATION_EXPORT_WIDTH}px`,
    maxWidth: `${CELEBRATION_EXPORT_WIDTH}px`,
    minWidth: `${CELEBRATION_EXPORT_WIDTH}px`,
    height: "auto",
    maxHeight: "none",
    overflow: "visible",
    margin: "0",
    padding: styles.padding,
    backgroundColor: "#16161c",
    backgroundImage: styles.backgroundImage,
    border: styles.border || "2px solid rgba(201, 162, 39, 0.45)",
    borderRadius: styles.borderRadius || "16px",
    boxShadow: "none",
    animation: "none",
    transform: "none",
    opacity: "1",
    visibility: "visible",
    zIndex: "-1",
    boxSizing: "border-box",
  });

  document.body.appendChild(clone);
  await waitForExportReady();

  const width = CELEBRATION_EXPORT_WIDTH;
  const height = clone.scrollHeight;

  if (height < 1) {
    document.body.removeChild(clone);
    throw new Error("Export area is not visible.");
  }

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: EXPORT_BG,
      scale: EXPORT_SCALE,
      useCORS: true,
      logging: false,
      allowTaint: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    });
    downloadCanvas(canvas, filename);
  } finally {
    document.body.removeChild(clone);
  }
}
