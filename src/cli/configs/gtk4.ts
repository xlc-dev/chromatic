import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

const GTK4_THEME_CSS = `
* {
  outline-width: 0;
  -gtk-secondary-caret-color: @theme_selected_bg;
}

window {
  color: @theme_fg;
  background-color: @theme_bg;
}

window:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}

label {
  color: @theme_fg;
  caret-color: currentColor;
}

label:disabled {
  color: @theme_insensitive_fg;
}

label:disabled:backdrop {
  color: @theme_insensitive_fg;
}

label selection {
  background-color: @theme_selected_bg;
  color: @theme_fg;
}

entry {
  color: @theme_fg;
  caret-color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

entry:focus {
  border-color: @theme_selected_bg;
}

entry:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

entry:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

entry:backdrop:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

entry.error {
  color: @theme_error;
  border-color: @theme_error;
}

entry.error:focus {
  border-color: @theme_error;
}

entry.warning {
  color: @theme_warning;
  border-color: @theme_warning;
}

entry.warning:focus {
  border-color: @theme_warning;
}

entry progress {
  border-color: @theme_selected_bg;
}

button {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg;
}

button:hover {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_hover;
}

button:active, button:checked {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

button:backdrop {
  color: @theme_backdrop_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg;
}

button:backdrop:active, button:backdrop:checked {
  color: @theme_backdrop_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

button:disabled {
  color: @theme_insensitive_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

button.flat {
  border-color: transparent;
  background-color: transparent;
}

button.flat:hover {
  background-color: @theme_bg_hover;
}

button.flat:active, button.flat:checked {
  background-color: @theme_bg_active;
}

button.flat:backdrop, button.flat:disabled {
  border-color: transparent;
  background-color: transparent;
}

button.suggested-action {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_selected_bg;
  background-color: @theme_selected_bg;
}

button.suggested-action:hover {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_selected_bg;
  background-color: shade(@theme_selected_bg, 1.05);
}

button.suggested-action:active, button.suggested-action:checked {
  color: @theme_fg;
  border-color: @theme_selected_bg;
  background-color: shade(@theme_selected_bg, 0.95);
}

button.suggested-action:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_selected_bg;
  background-color: @theme_selected_bg;
}

button.destructive-action {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_error;
  background-color: @theme_error;
}

button.destructive-action:hover {
  border-width: 1px;
  border-style: solid;
  border-color: @theme_error;
  background-color: shade(@theme_error, 1.1);
}

scale trough {
  background-color: @theme_border;
  border-color: @theme_border;
}

scale highlight {
  background-color: @theme_selected_bg;
}

scale slider {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

scale slider:hover {
  background-color: @theme_bg_hover;
}

scale slider:active {
  background-color: @theme_bg_active;
}

scale slider:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

scale slider:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

scrollbar trough {
  background-color: @theme_bg;
  border-color: @theme_border;
}

scrollbar slider {
  background-color: @theme_bg_hover;
  border-color: @theme_border;
}

scrollbar slider:hover {
  background-color: @theme_backdrop_fg;
}

scrollbar slider:active {
  background-color: @theme_fg;
}

scrollbar slider:backdrop {
  background-color: @theme_border;
}

scrollbar slider:disabled {
  background-color: @theme_bg_insensitive;
}

checkbutton check, checkbutton radio {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

checkbutton check:hover, checkbutton radio:hover {
  background-color: @theme_bg_hover;
}

checkbutton check:active, checkbutton radio:active, checkbutton check:checked, checkbutton radio:checked {
  background-color: @theme_selected_bg;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

checkbutton check:disabled, checkbutton radio:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

checkbutton check:backdrop, checkbutton radio:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

checkbutton check:backdrop:checked, checkbutton radio:backdrop:checked {
  background-color: @theme_selected_bg;
  border-color: @theme_selected_bg;
  color: @theme_backdrop_fg;
}

switch {
  background-color: @theme_border;
}

switch:checked {
  background-color: @theme_selected_bg;
}

switch slider {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

switch slider:hover {
  background-color: @theme_bg_hover;
}

switch slider:active {
  background-color: @theme_bg_active;
}

switch:backdrop slider {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

switch:backdrop:checked {
  background-color: @theme_selected_bg;
}

menu {
  background-color: @theme_bg;
  border-color: @theme_border;
}

menuitem {
  color: @theme_fg;
  background-color: transparent;
}

menuitem:hover {
  color: @theme_fg;
  background-color: @theme_bg_hover;
}

menuitem:disabled {
  color: @theme_insensitive_fg;
}

menu menuitem:backdrop {
  color: @theme_backdrop_fg;
}

tooltip {
  color: @theme_fg;
  background-color: @theme_bg;
  border-color: @theme_border;
}

tooltip label {
  color: @theme_fg;
}

notebook {
  background-color: @theme_bg;
}

notebook header {
  background-color: @theme_bg;
  border-color: @theme_border;
}

notebook tab {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  border-color: @theme_border;
}

notebook tab:checked {
  color: @theme_fg;
  background-color: @theme_bg;
  border-color: @theme_border;
}

notebook tab:hover {
  color: @theme_fg;
  background-color: @theme_bg_hover;
}

headerbar {
  color: @theme_fg;
  background-color: @theme_bg;
  border-color: @theme_border;
}

headerbar:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  border-color: @theme_border;
}

headerbar button {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

headerbar button:hover {
  background-color: @theme_bg_hover;
}

headerbar button:active, headerbar button:checked {
  background-color: @theme_bg_active;
}

headerbar button.flat {
  background-color: @theme_bg;
  border-color: @theme_border;
}

headerbar button.flat:hover {
  background-color: @theme_bg_hover;
}

headerbar button.suggested-action {
  background-color: @theme_selected_bg;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

headerbar button.suggested-action:hover {
  background-color: shade(@theme_selected_bg, 1.05);
}

headerbar button:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

headerbar button.suggested-action:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_selected_bg;
}

progressbar {
  background-color: @theme_border;
}

progressbar progress {
  background-color: @theme_selected_bg;
}

progressbar trough {
  background-color: @theme_border;
}

listview, listview view, row {
  color: @theme_fg;
  background-color: @theme_bg;
}

listview:backdrop, listview view:backdrop, row:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}

row:selected, row:selected:hover {
  color: @theme_fg;
  background-color: @theme_selected_bg;
}

row:selected:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_selected_bg;
}

row:hover {
  background-color: @theme_bg_hover;
}

separator {
  background-color: @theme_border;
}

frame {
  border-color: @theme_border;
}

frame > border {
  border-color: @theme_border;
}

popover {
  background-color: @theme_bg;
  border-color: @theme_border;
}

popover:backdrop {
  background-color: @theme_bg;
  border-color: @theme_border;
}

dialog {
  background-color: @theme_bg;
  border-color: @theme_border;
}

dialog:backdrop {
  background-color: @theme_bg;
  border-color: @theme_border;
}

expander-widget {
  color: @theme_fg;
  background-color: transparent;
}

expander-widget:hover {
  color: @theme_fg;
  background-color: @theme_bg_hover;
}

expander-widget:backdrop {
  color: @theme_backdrop_fg;
}

textview {
  color: @theme_fg;
  caret-color: @theme_fg;
  background-color: @theme_bg;
}

textview:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}

textview:disabled {
  color: @theme_insensitive_fg;
  background-color: @theme_bg_insensitive;
}

rubberband {
  border-color: @theme_selected_bg;
  background-color: alpha(@theme_selected_bg, 0.2);
}

combobox {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

combobox:hover {
  background-color: @theme_bg_hover;
}

combobox:disabled {
  color: @theme_insensitive_fg;
  background-color: @theme_bg_insensitive;
}

combobox:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}

dropdown {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

dropdown:hover {
  background-color: @theme_bg_hover;
}

dropdown:disabled {
  color: @theme_insensitive_fg;
  background-color: @theme_bg_insensitive;
}

dropdown:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}
`.trim();

function buildDefineColorBlock(scheme: ColorScheme): string {
  const lines: string[] = [
    `@define-color theme_bg ${scheme.background};`,
    `@define-color theme_fg ${scheme.foreground};`,
    `@define-color theme_selected_bg ${scheme.activeBorder};`,
    `@define-color theme_border ${scheme.inactiveBorder};`,
    `@define-color theme_error ${scheme.urgentBorder};`,
    `@define-color theme_warning ${scheme.yellow};`,
    `@define-color theme_success ${scheme.green};`,
    "@define-color theme_insensitive_fg mix(@theme_fg, @theme_bg, 0.5);",
    "@define-color theme_backdrop_fg mix(@theme_fg, @theme_bg, 0.7);",
    "@define-color theme_bg_hover shade(@theme_bg, 1.06);",
    "@define-color theme_bg_active shade(@theme_bg, 0.94);",
    "@define-color theme_bg_insensitive shade(@theme_bg, 0.98);",
  ];
  return lines.join("\n");
}

export function configureGtk4(scheme: ColorScheme): void {
  const configDir = join(homedir(), ".config", "gtk-4.0");
  const cssPath = join(configDir, "gtk.css");
  ensureDir(configDir);

  const css = [buildDefineColorBlock(scheme), "", GTK4_THEME_CSS].join("\n");
  writeConfigFile(cssPath, css);
}
