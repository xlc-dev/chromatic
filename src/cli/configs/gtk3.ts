import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

function selectorGroup(...selectors: string[]): string {
  return selectors.join(",\n");
}

const GTK3_ROOTS = selectorGroup("window", "assistant", ".background", ".application");
const GTK3_APP_CONTAINERS = selectorGroup(
  ".application > box",
  ".application > grid",
  ".application > revealer",
  ".application > paned",
  ".application > overlay"
);
const GTK3_TITLEBARS = selectorGroup("headerbar", "titlebar", ".titlebar");
const GTK3_TITLEBAR_BACKDROPS = selectorGroup(
  "headerbar:backdrop",
  "titlebar:backdrop",
  ".titlebar:backdrop"
);
const GTK3_TITLEBAR_BACKDROP_LABELS = selectorGroup(
  "headerbar:backdrop .title",
  "headerbar:backdrop .subtitle",
  "titlebar:backdrop .title",
  "titlebar:backdrop .subtitle",
  ".titlebar:backdrop .title",
  ".titlebar:backdrop .subtitle"
);
const GTK3_TITLEBAR_BUTTONS = selectorGroup(
  "headerbar button",
  "titlebar button",
  ".titlebar button",
  "button.titlebutton"
);
const GTK3_TITLEBAR_BUTTONS_HOVER = selectorGroup(
  "headerbar button:hover",
  "titlebar button:hover",
  "button.titlebutton:hover"
);
const GTK3_TITLEBAR_BUTTONS_ACTIVE = selectorGroup(
  "headerbar button:active",
  "headerbar button:checked",
  "titlebar button:active",
  "titlebar button:checked",
  "button.titlebutton:active",
  "button.titlebutton:checked"
);
const GTK3_TITLEBAR_BUTTONS_BACKDROP = selectorGroup(
  "headerbar button:backdrop",
  "titlebar button:backdrop",
  "button.titlebutton:backdrop"
);
const GTK3_BUTTONS = selectorGroup(
  "button",
  "combobox button",
  "spinbutton",
  "list button",
  "list row button",
  "row button",
  "treeview.view button"
);
const GTK3_TOGGLES = selectorGroup(
  "checkbutton check",
  "radiobutton radio",
  "list check",
  "list row check",
  "row check",
  "treeview.view check",
  "list radio",
  "list row radio",
  "row radio",
  "treeview.view radio"
);
const GTK3_CHECKS = selectorGroup(
  "checkbutton check",
  "list check",
  "list row check",
  "row check",
  "treeview.view check"
);
const GTK3_RADIOS = selectorGroup(
  "radiobutton radio",
  "list radio",
  "list row radio",
  "row radio",
  "treeview.view radio"
);
const GTK3_MENU_TOGGLES = selectorGroup(
  "menu menuitem check",
  "menu menuitem radio",
  "modelbutton check",
  "modelbutton radio"
);
const GTK3_MENU_CHECKS = selectorGroup("menu menuitem check", "modelbutton check");
const GTK3_MENU_RADIOS = selectorGroup("menu menuitem radio", "modelbutton radio");
const GTK3_TOGGLES_CHECKED = selectorGroup(
  "checkbutton:checked check",
  "radiobutton:checked radio",
  "list check:checked",
  "list row check:checked",
  "row check:checked",
  "treeview.view check:checked",
  "list radio:checked",
  "list row radio:checked",
  "row radio:checked",
  "treeview.view radio:checked"
);
const GTK3_TOGGLES_HOVER = selectorGroup(
  "checkbutton:hover check",
  "radiobutton:hover radio",
  "list check:hover",
  "list row check:hover",
  "row check:hover",
  "treeview.view check:hover",
  "list radio:hover",
  "list row radio:hover",
  "row radio:hover",
  "treeview.view radio:hover"
);
const GTK3_TOGGLES_FOCUS = selectorGroup(
  "checkbutton:focus check",
  "radiobutton:focus radio",
  "list check:focus",
  "list row check:focus",
  "row check:focus",
  "treeview.view check:focus",
  "list radio:focus",
  "list row radio:focus",
  "row radio:focus",
  "treeview.view radio:focus"
);
const GTK3_TOGGLES_DISABLED = selectorGroup(
  "checkbutton:disabled check",
  "radiobutton:disabled radio",
  "list check:disabled",
  "list row check:disabled",
  "row check:disabled",
  "treeview.view check:disabled",
  "list radio:disabled",
  "list row radio:disabled",
  "row radio:disabled",
  "treeview.view radio:disabled"
);
const GTK3_SELECTED_ROW_TOGGLES = selectorGroup(
  "treeview.view:selected check:checked",
  "treeview.view:selected radio:checked",
  "treeview.view:selected:focus check:checked",
  "treeview.view:selected:focus radio:checked",
  "list row:selected check:checked",
  "list row:selected radio:checked",
  "row:selected check:checked",
  "row:selected radio:checked"
);
const GTK3_SELECTED_ROW_TOGGLES_BACKDROP = selectorGroup(
  "treeview.view:selected:backdrop check:checked",
  "treeview.view:selected:backdrop radio:checked",
  "list row:selected:backdrop check:checked",
  "list row:selected:backdrop radio:checked",
  "row:selected:backdrop check:checked",
  "row:selected:backdrop radio:checked"
);
const GTK3_BUTTONS_HOVER = selectorGroup(
  "button:hover",
  "combobox button:hover",
  "spinbutton:hover",
  "list button:hover",
  "list row button:hover",
  "row button:hover",
  "treeview.view button:hover"
);
const GTK3_BUTTONS_ACTIVE = selectorGroup(
  "button:active",
  "button:checked",
  "combobox button:active",
  "combobox button:checked",
  "list button:active",
  "list button:checked",
  "list row button:active",
  "list row button:checked",
  "row button:active",
  "row button:checked",
  "treeview.view button:active",
  "treeview.view button:checked"
);
const GTK3_BUTTONS_FOCUS = selectorGroup(
  "button:focus",
  "combobox button:focus",
  "entry:focus",
  "spinbutton:focus",
  "list button:focus",
  "list row button:focus",
  "row button:focus",
  "treeview.view button:focus"
);
const GTK3_LINK_BUTTONS = selectorGroup(
  "button.link",
  "button.link:hover",
  "button.link:active",
  "button.link:visited"
);
const GTK3_PATH_BARS = selectorGroup("pathbar", ".path-bar", ".breadcrumbs");
const GTK3_PATH_BAR_BUTTONS = selectorGroup(
  "pathbar button",
  ".path-bar button",
  ".breadcrumbs button",
  "pathbar .path-bar-button",
  ".path-bar .path-bar-button"
);
const GTK3_PATH_BAR_BUTTONS_HOVER = selectorGroup(
  "pathbar button:hover",
  ".path-bar button:hover",
  ".breadcrumbs button:hover",
  "pathbar .path-bar-button:hover",
  ".path-bar .path-bar-button:hover"
);
const GTK3_PATH_BAR_BUTTONS_ACTIVE = selectorGroup(
  "pathbar button:active",
  "pathbar button:checked",
  ".path-bar button:active",
  ".path-bar button:checked",
  ".breadcrumbs button:active",
  ".breadcrumbs button:checked"
);
const GTK3_DIALOGS = selectorGroup("dialog", "messagedialog", ".message-dialog");
const GTK3_DIALOG_HEADERBARS = selectorGroup(
  "dialog headerbar",
  "messagedialog headerbar",
  ".message-dialog headerbar"
);
const GTK3_DIALOG_BACKDROPS = selectorGroup(
  "dialog:backdrop",
  "messagedialog:backdrop",
  ".message-dialog:backdrop"
);
const GTK3_DIALOG_BACKDROP_HEADERS = selectorGroup(
  "dialog:backdrop headerbar",
  "messagedialog:backdrop headerbar",
  ".message-dialog:backdrop headerbar"
);
const GTK3_DIALOG_ACTION_BUTTONS = selectorGroup(
  "dialog #action_area button",
  "dialog .dialog-action-area button",
  "dialog action-area button",
  "dialog box button",
  "messagedialog #action_area button",
  "messagedialog .dialog-action-area button",
  "messagedialog action-area button",
  "messagedialog box button",
  ".message-dialog #action_area button",
  ".message-dialog box button"
);
const GTK3_DIALOG_ACTION_BUTTONS_HOVER = selectorGroup(
  "dialog #action_area button:hover",
  "dialog .dialog-action-area button:hover",
  "dialog action-area button:hover",
  "dialog box button:hover",
  "messagedialog #action_area button:hover",
  "messagedialog .dialog-action-area button:hover",
  "messagedialog action-area button:hover",
  "messagedialog box button:hover",
  ".message-dialog #action_area button:hover",
  ".message-dialog box button:hover"
);
const GTK3_DIALOG_ACTION_BUTTONS_ACTIVE = selectorGroup(
  "dialog #action_area button:active",
  "dialog #action_area button:checked",
  "dialog .dialog-action-area button:active",
  "dialog .dialog-action-area button:checked",
  "dialog action-area button:active",
  "dialog action-area button:checked",
  "dialog box button:active",
  "dialog box button:checked",
  "messagedialog #action_area button:active",
  "messagedialog #action_area button:checked",
  "messagedialog .dialog-action-area button:active",
  "messagedialog .dialog-action-area button:checked",
  "messagedialog action-area button:active",
  "messagedialog action-area button:checked",
  "messagedialog box button:active",
  "messagedialog box button:checked",
  ".message-dialog #action_area button:active",
  ".message-dialog #action_area button:checked",
  ".message-dialog box button:active",
  ".message-dialog box button:checked"
);
const GTK3_DIALOG_SUGGESTED_BUTTONS = selectorGroup(
  "dialog #action_area button.suggested-action",
  "dialog .dialog-action-area button.suggested-action",
  "dialog action-area button.suggested-action",
  "messagedialog #action_area button.suggested-action",
  "messagedialog .dialog-action-area button.suggested-action",
  "messagedialog action-area button.suggested-action",
  ".message-dialog #action_area button.suggested-action"
);
const GTK3_DIALOG_SUGGESTED_BUTTONS_ACTIVE = selectorGroup(
  "dialog #action_area button.suggested-action:active",
  "dialog #action_area button.suggested-action:checked",
  "dialog .dialog-action-area button.suggested-action:active",
  "dialog .dialog-action-area button.suggested-action:checked",
  "dialog action-area button.suggested-action:active",
  "dialog action-area button.suggested-action:checked",
  "dialog box button.suggested-action:active",
  "dialog box button.suggested-action:checked",
  "messagedialog #action_area button.suggested-action:active",
  "messagedialog #action_area button.suggested-action:checked",
  "messagedialog .dialog-action-area button.suggested-action:active",
  "messagedialog .dialog-action-area button.suggested-action:checked",
  "messagedialog action-area button.suggested-action:active",
  "messagedialog action-area button.suggested-action:checked",
  "messagedialog box button.suggested-action:active",
  "messagedialog box button.suggested-action:checked",
  ".message-dialog #action_area button.suggested-action:active",
  ".message-dialog #action_area button.suggested-action:checked",
  ".message-dialog box button.suggested-action:active",
  ".message-dialog box button.suggested-action:checked"
);

const GTK3_CSS = `
${GTK3_ROOTS} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
}

${GTK3_APP_CONTAINERS} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
}

${GTK3_TITLEBARS} {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

${GTK3_TITLEBAR_BACKDROPS} {
  color: @insensitive_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

${GTK3_TITLEBAR_BACKDROP_LABELS} {
  color: @insensitive_fg_color;
}

${GTK3_TITLEBAR_BUTTONS} {
  color: @headerbar_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

${GTK3_TITLEBAR_BUTTONS_HOVER} {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

${GTK3_TITLEBAR_BUTTONS_ACTIVE} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

${GTK3_TITLEBAR_BUTTONS_BACKDROP} {
  color: @insensitive_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

entry, textview, treeview.view, iconview, list, .view {
  color: @theme_text_color;
  background-color: @theme_base_color;
  border-color: @border_color;
}

calendar,
calendar.view {
  color: @theme_fg_color;
  background-color: @theme_base_color;
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

calendar.view {
  padding: 6px;
}

calendar.view header {
  background-color: transparent;
}

calendar.view button {
  color: @theme_fg_color;
  background-color: transparent;
  border-color: transparent;
  background-image: none;
  box-shadow: none;
  min-height: 24px;
  min-width: 24px;
}

calendar.view button:hover {
  background-color: @hover_bg_color;
  border-color: @hover_border_color;
}

calendar.view button:active,
calendar.view button:checked {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @theme_bg_color, 0.28);
  border-color: @accent_bg_color;
}

calendar.view grid label {
  color: @theme_fg_color;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 6px;
}

calendar.view grid label.day-name,
calendar.view grid label.week-number {
  color: @insensitive_fg_color;
}

calendar.view grid label.other-month {
  color: mix(@theme_fg_color, @theme_bg_color, 0.45);
}

calendar.view grid label.today {
  box-shadow: inset 0 0 0 1px mix(@accent_bg_color, @theme_fg_color, 0.18);
}

calendar.view grid label:selected {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @theme_bg_color, 0.72);
}

label.keycap {
  color: @theme_fg_color;
  background-color: mix(@button_bg_color, @theme_bg_color, 0.35);
  border-color: @button_border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 6px;
  background-image: none;
  box-shadow: none;
  padding: 4px 10px;
}

label.keycap:backdrop {
  color: @insensitive_fg_color;
  background-color: mix(@insensitive_bg_color, @theme_bg_color, 0.5);
  border-color: mix(@button_border_color, @theme_fg_color, 0.12);
}

separator,
separator.horizontal,
separator.vertical,
paned > separator {
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.12);
  border-color: transparent;
  background-image: none;
  box-shadow: none;
}

separator.horizontal,
paned > separator.horizontal {
  min-height: 1px;
}

separator.vertical,
paned > separator.vertical {
  min-width: 1px;
}

separator:backdrop,
paned > separator:backdrop {
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.18);
}

drawingarea {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
}

textview text,
textview.view text {
  color: @theme_text_color;
  background-color: @theme_base_color;
}

textview border,
textview.view border {
  background-color: @theme_base_color;
}

entry,
entry:focus,
spinbutton,
spinbutton:focus {
  box-shadow: none;
  background-image: none;
}

toolbar,
.toolbar,
actionbar {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

toolbar:backdrop,
.toolbar:backdrop,
actionbar:backdrop {
  color: @insensitive_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

treeview.view header,
treeview.view header button {
  color: @theme_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.03);
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

treeview.view header button:hover {
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.07);
  border-color: @hover_border_color;
}

treeview.view header button:active,
treeview.view header button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

.sidebar {
  color: @sidebar_fg_color;
  background-color: @sidebar_bg_color;
  border-color: @border_color;
  background-image: none;
}

.sidebar label {
  color: @sidebar_fg_color;
}

.sidebar row {
  color: @sidebar_fg_color;
  background-color: transparent;
  border-color: transparent;
  background-image: none;
}

.sidebar row:hover {
  background-color: @hover_bg_color;
}

.sidebar row:selected,
.sidebar row:selected:hover {
  color: @theme_selected_fg_color;
  background-color: @accent_bg_color;
}

.sidebar label.highlight {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  background-image: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-weight: 700;
}

notebook,
notebook.frame {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

notebook > header {
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.02);
  border-color: @border_color;
  background-image: none;
}

notebook > header > tabs {
  background-color: transparent;
}

notebook tab {
  color: @insensitive_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.03);
  border-color: @border_color;
  background-image: none;
  border-style: solid;
  border-width: 1px;
  border-radius: 6px 6px 0 0;
  box-shadow: none;
  margin: 0 2px;
  padding: 4px 10px;
}

notebook tab:hover {
  color: @theme_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.07);
  border-color: @hover_border_color;
  box-shadow: none;
}

notebook tab:checked {
  color: @theme_fg_color;
  background-color: @theme_base_color;
  border-color: @border_color;
  box-shadow: none;
}

notebook tab:backdrop {
  color: @insensitive_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.02);
  border-color: @border_color;
  box-shadow: none;
}

notebook > header.top tab:checked {
  border-bottom-color: @theme_base_color;
}

notebook > header.bottom tab:checked {
  border-top-color: @theme_base_color;
}

notebook > header.left tab:checked {
  border-right-color: @theme_base_color;
}

notebook > header.right tab:checked {
  border-left-color: @theme_base_color;
}

${GTK3_BUTTONS} {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

scale slider {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

${GTK3_TOGGLES} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  background-image: none;
  box-shadow: none;
  -gtk-icon-source: none;
  -gtk-icon-shadow: none;
}

${GTK3_CHECKS} {
  border-radius: 4px;
}

${GTK3_RADIOS} {
  border-radius: 999px;
}

${GTK3_MENU_TOGGLES} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  background-image: none;
  box-shadow: none;
  -gtk-icon-source: none;
  -gtk-icon-shadow: none;
}

${GTK3_MENU_CHECKS} {
  border-radius: 4px;
}

${GTK3_MENU_RADIOS} {
  border-radius: 999px;
}

${GTK3_TOGGLES_CHECKED} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

${GTK3_TOGGLES_HOVER} {
  border-color: @hover_border_color;
  background-image: none;
}

${GTK3_TOGGLES_FOCUS} {
  border-color: @accent_bg_color;
  box-shadow: none;
  outline-color: transparent;
  outline-style: none;
}

${GTK3_TOGGLES_DISABLED} {
  color: @insensitive_fg_color;
  background-color: @insensitive_bg_color;
  border-color: @border_color;
}

progressbar,
progressbar trough,
scale trough {
  background-color: @insensitive_bg_color;
  border-color: @border_color;
  background-image: none;
}

progressbar trough {
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
}

progressbar progress {
  border-radius: 999px;
  background-image: none;
}

progressbar text {
  color: @theme_fg_color;
}

progressbar:backdrop trough {
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.12);
  border-color: mix(@theme_bg_color, @theme_fg_color, 0.18);
}

progressbar:backdrop text {
  color: @insensitive_fg_color;
}

scale trough slider {
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
  box-shadow: none;
}

${GTK3_BUTTONS_HOVER} {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

${GTK3_BUTTONS_ACTIVE} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

${GTK3_BUTTONS_FOCUS} {
  border-color: @accent_bg_color;
  box-shadow: none;
  background-image: none;
  outline-color: transparent;
  outline-style: none;
  outline-width: 0;
}

button {
  background-image: none;
  border-style: solid;
  border-width: 2px;
  border-radius: 6px;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}

button:disabled {
  color: @insensitive_fg_color;
  background-color: @insensitive_bg_color;
  border-color: @border_color;
}

button.flat {
  background-color: mix(@button_bg_color, @theme_bg_color, 0.45);
  border-color: @button_border_color;
}

button.flat:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
}

button.flat:active,
button.flat:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

button.suggested-action {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

button.destructive-action {
  color: @destructive_fg_color;
  background-color: @destructive_color;
  border-color: @destructive_color;
}

button.destructive-action:hover {
  background-color: mix(@destructive_color, @theme_fg_color, 0.12);
  border-color: mix(@destructive_color, @theme_fg_color, 0.12);
}

${GTK3_LINK_BUTTONS} {
  color: @link_color;
  background-color: transparent;
  border-color: transparent;
  background-image: none;
  box-shadow: none;
}

button.link:visited {
  color: @visited_link_color;
}

label link:link {
  color: @link_color;
}

label link:visited {
  color: @visited_link_color;
}

${GTK3_PATH_BARS} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

${GTK3_PATH_BAR_BUTTONS} {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

${GTK3_PATH_BAR_BUTTONS_HOVER} {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

${GTK3_PATH_BAR_BUTTONS_ACTIVE} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

selection, *:selected {
  color: @theme_selected_fg_color;
  background-color: mix(@theme_selected_bg_color, @theme_bg_color, 0.2);
}

treeview.view:selected, treeview.view:selected:focus, iconview:selected, iconview:selected:focus,
list row:selected, list row:selected:hover, row:selected, row:selected:hover {
  color: @theme_selected_fg_color;
  background-color: @accent_bg_color;
}

treeview.view:selected:backdrop, iconview:selected:backdrop, list row:selected:backdrop, row:selected:backdrop {
  color: @theme_selected_fg_color;
  background-color: mix(@accent_bg_color, @theme_bg_color, 0.35);
}

${GTK3_SELECTED_ROW_TOGGLES} {
  color: @theme_selected_fg_color;
  background-color: @theme_bg_color;
  border-color: @theme_selected_fg_color;
  box-shadow: inset 0 0 0 1px mix(@theme_selected_fg_color, @theme_bg_color, 0.18);
}

${GTK3_SELECTED_ROW_TOGGLES_BACKDROP} {
  color: @insensitive_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.08);
  border-color: @insensitive_fg_color;
  box-shadow: inset 0 0 0 1px mix(@insensitive_fg_color, @theme_bg_color, 0.12);
}

popover, menu, tooltip {
  color: @popover_fg_color;
  background-color: @popover_bg_color;
  border-color: @border_color;
}

infobar {
  color: @theme_fg_color;
  background-color: mix(@theme_bg_color, @theme_fg_color, 0.22);
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  background-image: none;
}

infobar > box,
infobar > revealer,
infobar > revealer > box,
infobar box {
  background-color: inherit;
  background-image: none;
}

infobar label {
  color: inherit;
}

infobar.info {
  background-color: mix(@accent_bg_color, @theme_bg_color, 0.5);
  border-color: @accent_bg_color;
}

infobar.warning {
  background-color: mix(@warning_color, @theme_bg_color, 0.5);
  border-color: @warning_color;
}

infobar.question {
  background-color: mix(@accent_color, @theme_bg_color, 0.5);
  border-color: @accent_color;
}

infobar.error {
  background-color: mix(@error_color, @theme_bg_color, 0.5);
  border-color: @error_color;
}

menubar {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

menubar:backdrop {
  color: @insensitive_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

menu menuitem:hover,
menubar > menuitem:hover {
  color: @theme_fg_color;
  background-color: @hover_bg_color;
  background-image: none;
  box-shadow: none;
}

menu menuitem:active,
menu menuitem:selected,
menubar > menuitem:active,
menubar > menuitem:selected {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  background-image: none;
  box-shadow: none;
}

menu menuitem:hover label,
menu menuitem:selected label,
menu menuitem:active label,
menubar > menuitem:hover label,
menubar > menuitem:selected label,
menubar > menuitem:active label {
  color: inherit;
}

popover modelbutton:hover {
  background-color: @hover_bg_color;
}

popover modelbutton:active,
popover modelbutton:checked,
popover modelbutton:selected {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
}

menu menuitem check:checked,
menu menuitem radio:checked,
modelbutton check:checked,
modelbutton radio:checked,
menu menuitem:checked check,
menu menuitem:checked radio,
menu menuitem:selected check,
menu menuitem:selected radio,
modelbutton:checked check,
modelbutton:checked radio,
modelbutton:selected check,
modelbutton:selected radio {
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  box-shadow: inset 0 0 0 2px @theme_bg_color;
}

menu menuitem radio:checked,
modelbutton radio:checked,
menu menuitem:checked radio,
modelbutton:checked radio {
  box-shadow: inset 0 0 0 3px @theme_bg_color;
}

popover list row:hover,
popover treeview.view row:hover {
  background-color: @hover_bg_color;
}

popover list row:selected,
popover list row:selected:hover,
popover treeview.view row:selected,
popover treeview.view row:selected:hover {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
}

${GTK3_DIALOGS} {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

${GTK3_DIALOG_HEADERBARS} {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
}

${GTK3_DIALOG_BACKDROPS} {
  color: @insensitive_fg_color;
}

${GTK3_DIALOG_BACKDROP_HEADERS} {
  color: @insensitive_fg_color;
}

${GTK3_DIALOG_ACTION_BUTTONS} {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

${GTK3_DIALOG_ACTION_BUTTONS_HOVER} {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

${GTK3_DIALOG_ACTION_BUTTONS_ACTIVE} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

${GTK3_DIALOG_SUGGESTED_BUTTONS} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

${GTK3_DIALOG_SUGGESTED_BUTTONS_ACTIVE} {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

levelbar trough {
  background-color: @insensitive_bg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
  background-image: none;
  padding: 2px;
}

levelbar block {
  min-width: 0;
  min-height: 8px;
  border-style: none;
  border-width: 0;
  border-radius: 999px;
  background-image: none;
  box-shadow: none;
}

levelbar block.empty {
  background-color: transparent;
}

levelbar block.filled {
  background-color: @accent_bg_color;
}

levelbar block.filled.low {
  background-color: @warning_color;
}

levelbar block.filled.high,
levelbar block.filled.full {
  background-color: @success_color;
}

progressbar progress,
progressbar:backdrop progress,
scale highlight,
switch:checked {
  background-color: @accent_bg_color;
  background-image: none;
}
`.trim();

function buildDefineColorBlock(scheme: ColorScheme): string {
  const lines: string[] = [
    `@define-color theme_bg_color ${scheme.background};`,
    `@define-color theme_fg_color ${scheme.foreground};`,
    `@define-color theme_base_color ${scheme.background};`,
    `@define-color theme_text_color ${scheme.foreground};`,
    `@define-color theme_selected_bg_color ${scheme.activeBorder};`,
    `@define-color theme_selected_fg_color ${scheme.foreground};`,
    `@define-color bg_color ${scheme.background};`,
    `@define-color fg_color ${scheme.foreground};`,
    `@define-color base_color ${scheme.background};`,
    `@define-color text_color ${scheme.foreground};`,
    `@define-color selected_bg_color ${scheme.activeBorder};`,
    `@define-color selected_fg_color ${scheme.foreground};`,
    `@define-color accent_bg_color ${scheme.activeBorder};`,
    `@define-color accent_fg_color ${scheme.foreground};`,
    `@define-color accent_color ${scheme.activeBorder};`,
    `@define-color window_bg_color ${scheme.background};`,
    `@define-color window_fg_color ${scheme.foreground};`,
    `@define-color view_bg_color ${scheme.background};`,
    `@define-color view_fg_color ${scheme.foreground};`,
    `@define-color headerbar_bg_color ${scheme.background};`,
    `@define-color headerbar_fg_color ${scheme.foreground};`,
    `@define-color popover_bg_color ${scheme.background};`,
    `@define-color popover_fg_color ${scheme.foreground};`,
    `@define-color card_bg_color shade(${scheme.background}, 1.03);`,
    `@define-color sidebar_bg_color shade(${scheme.background}, 0.97);`,
    `@define-color sidebar_fg_color ${scheme.foreground};`,
    `@define-color insensitive_bg_color shade(${scheme.background}, 0.98);`,
    `@define-color insensitive_fg_color mix(${scheme.foreground}, ${scheme.background}, 0.5);`,
    `@define-color insensitive_base_color shade(${scheme.background}, 0.98);`,
    `@define-color hover_bg_color mix(${scheme.inactiveBorder}, ${scheme.background}, 0.07);`,
    `@define-color button_bg_color mix(${scheme.background}, ${scheme.foreground}, 0.12);`,
    `@define-color button_border_color mix(${scheme.inactiveBorder}, ${scheme.foreground}, 0.42);`,
    `@define-color button_hover_bg_color mix(${scheme.background}, ${scheme.foreground}, 0.2);`,
    `@define-color hover_border_color ${scheme.inactiveBorder};`,
    `@define-color border_color ${scheme.inactiveBorder};`,
    `@define-color borders ${scheme.inactiveBorder};`,
    `@define-color warning_color ${scheme.yellow};`,
    `@define-color error_color ${scheme.urgentBorder};`,
    `@define-color success_color ${scheme.green};`,
    `@define-color destructive_color ${scheme.urgentBorder};`,
    `@define-color destructive_fg_color ${scheme.white};`,
    `@define-color link_color ${scheme.activeBorder};`,
    `@define-color visited_link_color shade(${scheme.activeBorder}, 0.9);`,
  ];

  return lines.join("\n");
}

export function configureGtk3(scheme: ColorScheme, cssPath?: string): void {
  const resolvedCssPath = cssPath ?? join(homedir(), ".config", "gtk-3.0", "gtk.css");
  ensureDir(dirname(resolvedCssPath));

  const css = [buildDefineColorBlock(scheme), "", GTK3_CSS].join("\n");
  writeConfigFile(resolvedCssPath, css);
}
