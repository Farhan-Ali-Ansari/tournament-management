import { sanitizeExportClone } from "./exportImage";

describe("exportImage", () => {
  it("removes export-hidden elements and converts score inputs", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div data-export-hide class="hide-me">Hidden</div>
      <input class="fixture-score-input" value="1" />
      <span class="keep">Visible</span>
    `;

    sanitizeExportClone(root);

    expect(root.querySelector(".hide-me")).toBeNull();
    expect(root.querySelector(".fixture-score-input")).toBeNull();
    expect(root.querySelector(".fixture-score-display")?.textContent).toBe("1");
    expect(root.querySelector(".keep")?.textContent).toBe("Visible");
  });
});
