import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

export function createTheme(scheme: ColorScheme) {
  return {
    name: "Chromatic Color Theme",
    type: "dark",
    colors: {
      "editor.background": scheme.background,
      "editor.foreground": scheme.foreground,
      "editorCursor.foreground": scheme.foreground,
      "editorWhitespace.foreground": scheme.brightBlack,
      "editorIndentGuide.activeBackground": scheme.brightBlack,
      "editorIndentGuide.background": scheme.black,
      "editorLineNumber.foreground": scheme.brightBlack,
      "editorLineNumber.activeForeground": scheme.foreground,
      "editor.selectionBackground": scheme.brightBlack,
      "editor.selectionHighlightBackground": scheme.brightBlack,
      "editor.wordHighlightBackground": scheme.brightBlack,
      "editor.wordHighlightStrongBackground": scheme.brightBlack,
      "editor.findMatchBackground": scheme.yellow,
      "editor.findMatchHighlightBackground": scheme.brightYellow,
      "editorBracketMatch.background": scheme.brightBlack,
      "editorBracketMatch.border": scheme.foreground,
      "editorGutter.background": scheme.background,
      "editorGutter.modifiedBackground": scheme.yellow,
      "editorGutter.addedBackground": scheme.green,
      "editorGutter.deletedBackground": scheme.red,
      "sideBar.background": scheme.background,
      "sideBar.foreground": scheme.foreground,
      "sideBarTitle.foreground": scheme.foreground,
      "sideBarSectionHeader.background": scheme.background,
      "sideBarSectionHeader.foreground": scheme.foreground,
      "activityBar.background": scheme.background,
      "activityBar.foreground": scheme.foreground,
      "activityBarBadge.background": scheme.blue,
      "activityBarBadge.foreground": scheme.background,
      "statusBar.background": scheme.background,
      "statusBar.foreground": scheme.foreground,
      "statusBar.noFolderBackground": scheme.background,
      "statusBar.debuggingBackground": scheme.red,
      "statusBar.debuggingForeground": scheme.background,
      "titleBar.activeBackground": scheme.background,
      "titleBar.activeForeground": scheme.foreground,
      "titleBar.inactiveBackground": scheme.background,
      "titleBar.inactiveForeground": scheme.brightBlack,
      "tab.activeBackground": scheme.background,
      "tab.activeForeground": scheme.foreground,
      "tab.inactiveBackground": scheme.background,
      "tab.inactiveForeground": scheme.brightBlack,
      "tab.border": scheme.black,
      "tab.activeBorder": scheme.blue,
      "panel.background": scheme.background,
      "panel.border": scheme.black,
      "panelTitle.activeForeground": scheme.foreground,
      "panelTitle.inactiveForeground": scheme.brightBlack,
      "terminal.background": scheme.background,
      "terminal.foreground": scheme.foreground,
      "terminal.ansiBlack": scheme.black,
      "terminal.ansiRed": scheme.red,
      "terminal.ansiGreen": scheme.green,
      "terminal.ansiYellow": scheme.yellow,
      "terminal.ansiBlue": scheme.blue,
      "terminal.ansiMagenta": scheme.magenta,
      "terminal.ansiCyan": scheme.cyan,
      "terminal.ansiWhite": scheme.white,
      "terminal.ansiBrightBlack": scheme.brightBlack,
      "terminal.ansiBrightRed": scheme.brightRed,
      "terminal.ansiBrightGreen": scheme.brightGreen,
      "terminal.ansiBrightYellow": scheme.brightYellow,
      "terminal.ansiBrightBlue": scheme.brightBlue,
      "terminal.ansiBrightMagenta": scheme.brightMagenta,
      "terminal.ansiBrightCyan": scheme.brightCyan,
      "terminal.ansiBrightWhite": scheme.brightWhite,
      "input.background": scheme.black,
      "input.foreground": scheme.foreground,
      "input.border": scheme.brightBlack,
      "inputOption.activeBorder": scheme.blue,
      "dropdown.background": scheme.black,
      "dropdown.foreground": scheme.foreground,
      "dropdown.border": scheme.brightBlack,
      "list.activeSelectionBackground": scheme.brightBlack,
      "list.activeSelectionForeground": scheme.foreground,
      "list.inactiveSelectionBackground": scheme.brightBlack,
      "list.inactiveSelectionForeground": scheme.foreground,
      "list.hoverBackground": scheme.brightBlack,
      "list.hoverForeground": scheme.foreground,
      "button.background": scheme.blue,
      "button.foreground": scheme.background,
      "button.hoverBackground": scheme.brightBlue,
      "badge.background": scheme.blue,
      "badge.foreground": scheme.background,
      "scrollbar.shadow": scheme.black,
      "scrollbarSlider.background": scheme.brightBlack,
      "scrollbarSlider.hoverBackground": scheme.foreground,
      "scrollbarSlider.activeBackground": scheme.foreground,
      "progressBar.background": scheme.blue,
      "notificationCenter.border": scheme.black,
      "notificationToast.border": scheme.black,
      "notifications.background": scheme.black,
      "notifications.foreground": scheme.foreground,
      "notifications.border": scheme.brightBlack,
      "notificationCenterHeader.background": scheme.background,
      "notificationCenterHeader.foreground": scheme.foreground,
      "notificationLink.foreground": scheme.blue,
      "pickerGroup.border": scheme.brightBlack,
      "pickerGroup.foreground": scheme.foreground,
      "textLink.foreground": scheme.blue,
      "textLink.activeForeground": scheme.brightBlue,
      "textBlockQuote.background": scheme.black,
      "textBlockQuote.border": scheme.brightBlack,
      "textCodeBlock.background": scheme.black,
      "textPreformat.foreground": scheme.cyan,
      "widget.shadow": scheme.black,
      "debugToolBar.background": scheme.background,
      "editorWidget.background": scheme.black,
      "editorWidget.foreground": scheme.foreground,
      "editorWidget.border": scheme.brightBlack,
      "editorSuggestWidget.background": scheme.black,
      "editorSuggestWidget.foreground": scheme.foreground,
      "editorSuggestWidget.border": scheme.brightBlack,
      "editorSuggestWidget.selectedBackground": scheme.brightBlack,
      "editorHoverWidget.background": scheme.black,
      "editorHoverWidget.foreground": scheme.foreground,
      "editorHoverWidget.border": scheme.brightBlack,
      "peekView.border": scheme.brightBlack,
      "peekViewEditor.background": scheme.black,
      "peekViewEditor.foreground": scheme.foreground,
      "peekViewResult.background": scheme.black,
      "peekViewResult.foreground": scheme.foreground,
      "peekViewResult.selectionBackground": scheme.brightBlack,
      "peekViewTitle.background": scheme.background,
      "peekViewTitleLabel.foreground": scheme.foreground,
      "merge.currentHeaderBackground": scheme.blue,
      "merge.currentContentBackground": scheme.black,
      "merge.incomingHeaderBackground": scheme.green,
      "merge.incomingContentBackground": scheme.black,
      "merge.border": scheme.brightBlack,
      "merge.commonContentBackground": scheme.black,
      "merge.commonHeaderBackground": scheme.brightBlack,
      "editorOverviewRuler.currentContentForeground": scheme.blue,
      "editorOverviewRuler.incomingContentForeground": scheme.green,
      "editorOverviewRuler.commonContentForeground": scheme.brightBlack,
      "editorOverviewRuler.findMatchForeground": scheme.yellow,
      "editorOverviewRuler.selectionHighlightForeground": scheme.brightBlack,
      "editorOverviewRuler.wordHighlightForeground": scheme.brightBlack,
      "editorOverviewRuler.wordHighlightStrongForeground": scheme.brightBlack,
      "editorOverviewRuler.modifiedForeground": scheme.yellow,
      "editorOverviewRuler.addedForeground": scheme.green,
      "editorOverviewRuler.deletedForeground": scheme.red,
      "editorOverviewRuler.errorForeground": scheme.red,
      "editorOverviewRuler.warningForeground": scheme.yellow,
      "editorOverviewRuler.infoForeground": scheme.blue,
      "editorError.foreground": scheme.red,
      "editorWarning.foreground": scheme.yellow,
      "editorInfo.foreground": scheme.blue,
      "editorHint.foreground": scheme.cyan,
    },
    tokenColors: [
      {
        scope: ["comment", "punctuation.definition.comment"],
        settings: {
          foreground: scheme.brightBlack,
          fontStyle: "italic",
        },
      },
      {
        scope: ["string", "string.quoted"],
        settings: {
          foreground: scheme.green,
        },
      },
      {
        scope: ["constant.numeric", "constant.language"],
        settings: {
          foreground: scheme.magenta,
        },
      },
      {
        scope: ["constant.character.escape", "constant.other.placeholder"],
        settings: {
          foreground: scheme.cyan,
        },
      },
      {
        scope: ["keyword", "storage.type", "storage.modifier"],
        settings: {
          foreground: scheme.magenta,
        },
      },
      {
        scope: ["entity.name.function", "support.function"],
        settings: {
          foreground: scheme.blue,
        },
      },
      {
        scope: ["entity.name.class", "entity.name.type", "support.class", "support.type"],
        settings: {
          foreground: scheme.yellow,
        },
      },
      {
        scope: ["variable", "variable.other", "variable.parameter"],
        settings: {
          foreground: scheme.foreground,
        },
      },
      {
        scope: ["entity.name.tag"],
        settings: {
          foreground: scheme.red,
        },
      },
      {
        scope: ["entity.other.attribute-name"],
        settings: {
          foreground: scheme.yellow,
        },
      },
      {
        scope: ["punctuation"],
        settings: {
          foreground: scheme.foreground,
        },
      },
      {
        scope: ["meta.brace"],
        settings: {
          foreground: scheme.foreground,
        },
      },
      {
        scope: ["invalid", "invalid.illegal"],
        settings: {
          foreground: scheme.red,
          fontStyle: "underline",
        },
      },
      {
        scope: ["markup.heading"],
        settings: {
          foreground: scheme.blue,
          fontStyle: "bold",
        },
      },
      {
        scope: ["markup.bold"],
        settings: {
          fontStyle: "bold",
        },
      },
      {
        scope: ["markup.italic"],
        settings: {
          fontStyle: "italic",
        },
      },
      {
        scope: ["markup.strikethrough"],
        settings: {
          fontStyle: "strikethrough",
        },
      },
      {
        scope: ["markup.underline"],
        settings: {
          fontStyle: "underline",
        },
      },
      {
        scope: ["markup.quote"],
        settings: {
          foreground: scheme.brightBlack,
        },
      },
      {
        scope: ["markup.inline.raw"],
        settings: {
          foreground: scheme.green,
        },
      },
      {
        scope: ["markup.fenced_code.block"],
        settings: {
          foreground: scheme.cyan,
        },
      },
    ],
  };
}

export function writeTheme(scheme: ColorScheme, extensionDir: string): void {
  ensureDir(extensionDir);

  const themesDir = join(extensionDir, "themes");
  ensureDir(themesDir);

  const themePath = join(themesDir, "chromatic-color-theme.json");
  const theme = createTheme(scheme);
  writeConfigFile(themePath, JSON.stringify(theme, null, 2));

  const packageJson = {
    name: "chromatic-color-theme",
    displayName: "Chromatic Color Theme",
    description: "Chromatic color scheme theme",
    version: "1.0.0",
    engines: {
      vscode: "^1.0.0",
    },
    categories: ["Themes"],
    contributes: {
      themes: [
        {
          label: "Chromatic Color Theme",
          uiTheme: "vs-dark",
          path: "./themes/chromatic-color-theme.json",
        },
      ],
    },
  };

  const packageJsonPath = join(extensionDir, "package.json");
  writeConfigFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

export function configureVSCode(scheme: ColorScheme): void {
  const extensionDir = join(homedir(), ".vscode", "extensions", "chromatic-color-theme");
  writeTheme(scheme, extensionDir);
}
