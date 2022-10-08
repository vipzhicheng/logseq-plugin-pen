import "@logseq/libs";
import "./style.css";

import type { Brush, DrawingMode } from "drauu";
import { createDrauu } from "drauu";

const drauu = createDrauu({
  el: "#svg",
  brush: {
    color: "#000",
    size: 1,
  },
});

const sizeEl = document.getElementById("size")! as HTMLInputElement;
sizeEl.addEventListener("input", () => (drauu.brush.size = +sizeEl.value));

document.getElementById("undo")?.addEventListener("click", () => drauu.undo());
document.getElementById("redo")?.addEventListener("click", () => drauu.redo());
document
  .getElementById("clear")
  ?.addEventListener("click", () => drauu.clear());

document.getElementById("close")?.addEventListener("click", () => {
  logseq.hideMainUI();
});

document.getElementById("transparent")?.addEventListener("click", () => {
  const app = document.getElementById("app");
  if (app?.classList.contains("background-white")) {
    app.classList.remove("background-white");
    document.getElementById("transparent")?.classList.remove("active");
  } else {
    app?.classList.add("background-white");
    document.getElementById("transparent")?.classList.add("active");
  }
});

document.getElementById("help")?.addEventListener("click", () => {
  document.getElementById("help-modal")?.classList.remove("hidden");
});

document.getElementById("help-modal-close")?.addEventListener("click", () => {
  document.getElementById("help-modal")?.classList.add("hidden");
});

const modes: { el: HTMLElement; brush: Partial<Brush> }[] = [
  {
    el: document.getElementById("m-stylus")!,
    brush: { mode: "stylus", arrowEnd: false },
  },
  {
    el: document.getElementById("m-eraseLine")!,
    brush: { mode: "eraseLine", arrowEnd: false },
  },
  {
    el: document.getElementById("m-draw")!,
    brush: { mode: "draw", arrowEnd: false },
  },
  {
    el: document.getElementById("m-line")!,
    brush: { mode: "line", arrowEnd: false },
  },
  {
    el: document.getElementById("m-arrow")!,
    brush: { mode: "line", arrowEnd: true },
  },
  {
    el: document.getElementById("m-rectangle")!,
    brush: { mode: "rectangle", arrowEnd: false },
  },
  {
    el: document.getElementById("m-ellipse")!,
    brush: { mode: "ellipse", arrowEnd: false },
  },
];
modes.forEach(({ el, brush }) => {
  el.addEventListener("click", () => {
    modes.forEach(({ el }) => el.classList.remove("active"));
    el.classList.add("active");
    drauu.brush.arrowEnd = brush.arrowEnd;
    drauu.mode = brush.mode as DrawingMode;
  });
});

const lines: { el: HTMLElement; value: string | undefined }[] = [
  { el: document.getElementById("l-solid")!, value: undefined },
  { el: document.getElementById("l-dashed")!, value: "4" },
  { el: document.getElementById("l-dotted")!, value: "1 7" },
];

lines.forEach(({ el, value }) => {
  el.addEventListener("click", () => {
    lines.forEach(({ el }) => el.classList.remove("active"));
    el.classList.add("active");
    drauu.brush.dasharray = value;
  });
});

const colors = Array.from(document.querySelectorAll("[data-color]"));
colors.forEach((i) => {
  i.addEventListener("click", () => {
    colors.forEach((i) => i.classList.remove("active"));
    i.classList.add("active");
    drauu.brush.color = (i as HTMLElement).dataset.color!;
  });
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
    if (e.shiftKey) drauu.redo();
    else drauu.undo();
    return;
  }

  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.code === "KeyL") {
    drauu.mode = "line";
    drauu.brush.arrowEnd = false;
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-line")?.classList.add("active");
  } else if (e.code === "KeyD") {
    drauu.mode = "draw";
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-draw")?.classList.add("active");
  } else if (e.code === "KeyS") {
    drauu.mode = "stylus";
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-stylus")?.classList.add("active");
  } else if (e.code === "KeyR") {
    drauu.mode = "rectangle";
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-rectangle")?.classList.add("active");
  } else if (e.code === "KeyE") {
    drauu.mode = "eraseLine";
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-eraseLine")?.classList.add("active");
  } else if (e.code === "KeyO") {
    drauu.mode = "ellipse";
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-ellipse")?.classList.add("active");
  } else if (e.code === "KeyA") {
    drauu.mode = "line";
    drauu.brush.arrowEnd = true;
    modes.forEach(({ el }) => el.classList.remove("active"));
    document.getElementById("m-arrow")?.classList.add("active");
  } else if (e.code === "KeyC") {
    drauu.clear();
  } else if (e.code === "Equal") {
    drauu.brush.size = Math.min(10, drauu.brush.size + 0.5);
    sizeEl.value = `${drauu.brush.size}`;
    sizeEl.blur();
  } else if (e.code === "Minus") {
    drauu.brush.size = Math.max(1, drauu.brush.size - 0.5);
    sizeEl.value = `${drauu.brush.size}`;
    sizeEl.blur();
  } else if (e.code === "KeyQ") {
    logseq.hideMainUI();
  }
});

function createModel() {
  return {
    openModal() {
      logseq.showMainUI();
    },
  };
}

const settingsVersion = "v1";
export const defaultSettings = {
  keyBindings: {
    openPenMode: "",
  },
  settingsVersion,
  disabled: false,
};

export type DefaultSettingsType = typeof defaultSettings;

export const initSettings = () => {
  let settings = logseq.settings;

  const shouldUpdateSettings =
    !settings || settings.settingsVersion != defaultSettings.settingsVersion;

  if (shouldUpdateSettings) {
    settings = defaultSettings;
    logseq.updateSettings(settings);
  }
};

export const getSettings = (
  key: string | undefined,
  defaultValue: any = undefined
) => {
  const settings = logseq.settings;
  const merged = Object.assign(defaultSettings, settings);
  return key ? (merged[key] ? merged[key] : defaultValue) : merged;
};

const main = async () => {
  initSettings();
  const keyBindings = getSettings("keyBindings");

  // createApp(App).mount('#app')
  logseq.provideModel(createModel());

  logseq.App.registerUIItem("toolbar", {
    key: "logseq-reset-sidebar",
    template: `
      <a class="button" data-on-click="openModal" title="Pen">
      <i class="ti ti-pencil" style=""></i>
      </a>
    `,
  });

  logseq.App.registerCommandPalette(
    {
      key: "open-pen-mode",
      label: "Open Pen Mode",
      keybinding: keyBindings.openPenMode
        ? {
            mode: "global",
            binding: keyBindings.openPenMode,
          }
        : undefined,
    },
    createModel().openModal
  );
};

logseq.ready().then(main).catch(console.error);
