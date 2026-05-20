import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

function buildGtkDefineColorBlock(scheme: ColorScheme): string {
  const border = `mix(${scheme.foreground}, ${scheme.background}, 0.72)`;
  const base = `mix(${scheme.background}, ${scheme.black}, 0.16)`;
  const accentBg = `mix(${scheme.blue}, ${scheme.background}, 0.45)`;
  return [
    `@define-color window_bg_color ${scheme.background};`,
    `@define-color window_fg_color ${scheme.foreground};`,
    `@define-color view_bg_color ${base};`,
    `@define-color view_fg_color ${scheme.foreground};`,
    `@define-color accent_bg_color ${accentBg};`,
    `@define-color accent_fg_color ${scheme.foreground};`,
    `@define-color accent_color ${scheme.blue};`,
    `@define-color headerbar_bg_color ${scheme.background};`,
    `@define-color headerbar_fg_color ${scheme.foreground};`,
    `@define-color dialog_bg_color shade(${scheme.background}, 1.02);`,
    `@define-color dialog_fg_color ${scheme.foreground};`,
    `@define-color popover_bg_color ${scheme.background};`,
    `@define-color popover_fg_color ${scheme.foreground};`,
    `@define-color popover_shade_color mix(${scheme.background}, ${scheme.foreground}, 0.08);`,
    `@define-color card_bg_color shade(${scheme.background}, 1.03);`,
    `@define-color card_fg_color ${scheme.foreground};`,
    `@define-color card_shade_color mix(${scheme.background}, ${scheme.foreground}, 0.08);`,
    `@define-color sidebar_bg_color shade(${scheme.background}, 0.97);`,
    `@define-color sidebar_fg_color ${scheme.foreground};`,
    `@define-color border_color ${border};`,
    `@define-color borders ${border};`,
    `@define-color insensitive_bg_color shade(${scheme.background}, 0.98);`,
    `@define-color insensitive_fg_color mix(${scheme.foreground}, ${scheme.background}, 0.5);`,
    `@define-color insensitive_base_color @view_bg_color;`,
    `@define-color hover_bg_color mix(${scheme.background}, ${scheme.foreground}, 0.12);`,
    `@define-color button_bg_color mix(${scheme.background}, ${scheme.foreground}, 0.12);`,
    `@define-color button_border_color mix(${border}, ${scheme.foreground}, 0.42);`,
    `@define-color button_hover_bg_color mix(${scheme.background}, ${scheme.foreground}, 0.2);`,
    `@define-color scrollbar_slider_color mix(${scheme.background}, ${scheme.foreground}, 0.3);`,
    `@define-color scrollbar_slider_hover_color mix(${scheme.background}, ${scheme.foreground}, 0.42);`,
    `@define-color scrollbar_slider_active_color mix(${scheme.background}, ${scheme.foreground}, 0.56);`,
    `@define-color hover_border_color ${border};`,
    `@define-color warning_color ${scheme.yellow};`,
    `@define-color warning_bg_color ${scheme.yellow};`,
    `@define-color warning_fg_color ${scheme.black};`,
    `@define-color error_color ${scheme.red};`,
    `@define-color error_bg_color ${scheme.red};`,
    `@define-color error_fg_color ${scheme.white};`,
    `@define-color success_color ${scheme.green};`,
    `@define-color success_bg_color ${scheme.green};`,
    `@define-color success_fg_color ${scheme.black};`,
    `@define-color destructive_color ${scheme.red};`,
    `@define-color destructive_bg_color ${scheme.red};`,
    `@define-color destructive_fg_color ${scheme.white};`,
    `@define-color link_color ${scheme.blue};`,
    `@define-color visited_link_color ${scheme.magenta};`,
  ].join("\n");
}

const GTK4_CSS = String.raw`
window,
.background {
  color: @window_fg_color;
  background-color: @window_bg_color;
}

headerbar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar button,
headerbar menubutton > button,
windowcontrols > button,
.titlebar button {
  color: @headerbar_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  border-style: solid;
  border-width: 2px;
  border-radius: 6px;
  background-image: none;
  box-shadow: none;
  min-height: 32px;
  padding: 0 10px;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
}

headerbar button.image-button,
headerbar menubutton > button.image-button,
headerbar menubutton > button.arrow-button,
windowcontrols > button,
.titlebar button.image-button {
  min-width: 32px;
  padding: 0;
}

windowcontrols {
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
}

windowcontrols > button {
  min-width: 28px;
  min-height: 28px;
  border-width: 1px;
  margin: 0;
}

windowcontrols > button + button {
  margin-left: 4px;
}

windowcontrols > button.minimize,
windowcontrols > button.maximize,
windowcontrols > button.close {
  min-width: 28px;
  min-height: 28px;
  padding: 0;
}

headerbar button image,
headerbar button label,
headerbar button arrow,
headerbar menubutton > button image,
headerbar menubutton > button label,
headerbar menubutton > button arrow,
windowcontrols > button image,
.titlebar button image,
.titlebar button label,
.titlebar button arrow {
  color: inherit;
  background-color: transparent;
  background-image: none;
  box-shadow: none;
}

headerbar button > box,
headerbar menubutton > button > box,
windowcontrols > button > box,
.titlebar button > box {
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
}

headerbar button image,
headerbar button arrow,
headerbar menubutton > button image,
headerbar menubutton > button arrow,
windowcontrols > button image,
.titlebar button image,
.titlebar button arrow {
  -gtk-icon-shadow: none;
  -gtk-icon-size: 12px;
}

headerbar button:hover,
headerbar menubutton > button:hover,
windowcontrols > button:hover,
.titlebar button:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

headerbar button:active,
headerbar button:checked,
headerbar menubutton > button:active,
headerbar menubutton > button:checked,
windowcontrols > button:active,
windowcontrols > button:checked,
.titlebar button:active {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

headerbar button:focus,
headerbar menubutton > button:focus,
windowcontrols > button:focus,
.titlebar button:focus {
  border-color: @accent_bg_color;
  box-shadow: none;
  outline-color: transparent;
  outline-style: none;
  outline-width: 0;
}

headerbar:backdrop,
.titlebar:backdrop {
  color: @insensitive_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar:backdrop .title,
headerbar:backdrop .subtitle,
.titlebar:backdrop .title,
.titlebar:backdrop .subtitle {
  color: @insensitive_fg_color;
}

headerbar button:backdrop,
headerbar menubutton > button:backdrop,
windowcontrols > button:backdrop,
.titlebar button:backdrop {
  color: @insensitive_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

entry,
spinbutton,
spinbutton text,
textview,
listview,
row,
.view {
  color: @view_fg_color;
  background-color: @view_bg_color;
  border-color: @border_color;
}

entry,
spinbutton,
dropdown > button,
combobox button {
  background-image: none;
  border-style: solid;
  border-width: 2px;
  border-radius: 6px;
  box-shadow: none;
}

entry,
spinbutton text,
dropdown > button {
  padding: 6px 10px;
}

entry > text,
entry > text:focus,
entry > text:focus-within,
spinbutton text,
spinbutton text:focus,
spinbutton text:focus-within,
textview text,
textview text:focus,
searchbar entry > text,
searchbar entry > text:focus {
  color: @view_fg_color;
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
  outline-color: transparent;
  outline-style: none;
  outline-width: 0;
  caret-color: @view_fg_color;
}

entry selection,
spinbutton text selection,
textview text selection,
searchbar entry selection {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.2);
}

spinbutton text {
  background-color: transparent;
  border-color: transparent;
  box-shadow: none;
}

entry image,
spinbutton text image,
dropdown > button image,
dropdown > button label,
dropdown > button arrow {
  color: inherit;
  background-color: transparent;
  background-image: none;
  box-shadow: none;
}

dropdown > button > box,
combobox button.combo > box,
button > box,
button > widget {
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
}

button > label,
button > image,
button > arrow,
dropdown > button label,
dropdown > button image,
dropdown > button arrow,
combobox button.combo cellview,
combobox button.combo label,
combobox button.combo arrow {
  background-color: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
}

button > image,
button > arrow,
dropdown > button image,
dropdown > button arrow,
combobox button.combo arrow {
  -gtk-icon-shadow: none;
}

calendar,
calendar.view {
  color: @window_fg_color;
  background-color: @view_bg_color;
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

calendar.view {
  padding: 6px;
}

calendar header {
  background-color: transparent;
}

calendar button {
  color: @window_fg_color;
  background-color: transparent;
  border-color: transparent;
  background-image: none;
  box-shadow: none;
  min-height: 24px;
  min-width: 24px;
}

calendar button:hover {
  background-color: @hover_bg_color;
  border-color: @hover_border_color;
}

calendar button:active,
calendar button:checked {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.28);
  border-color: @accent_bg_color;
}

calendar grid label {
  color: @window_fg_color;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 6px;
}

calendar grid label.day-name,
calendar grid label.week-number {
  color: @insensitive_fg_color;
}

calendar grid label.other-month {
  color: mix(@window_fg_color, @window_bg_color, 0.45);
}

calendar grid label.today {
  box-shadow: inset 0 0 0 1px mix(@accent_bg_color, @window_fg_color, 0.18);
}

calendar grid label:selected {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.72);
}

label.keycap,
shortcutlabel {
  color: @window_fg_color;
}

label.keycap {
  background-color: mix(@button_bg_color, @window_bg_color, 0.35);
  border-color: @button_border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 6px;
  background-image: none;
  box-shadow: none;
  padding: 4px 10px;
}

label.keycap:backdrop,
shortcutlabel:backdrop {
  color: @insensitive_fg_color;
}

separator,
separator.horizontal,
separator.vertical,
paned > separator {
  background-color: mix(@window_bg_color, @window_fg_color, 0.18);
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
  background-color: mix(@window_bg_color, @window_fg_color, 0.24);
}

columnview {
  color: @view_fg_color;
  background-color: @view_bg_color;
  border-color: @border_color;
}

columnview > header,
columnview > header button {
  color: @window_fg_color;
  background-color: mix(@window_bg_color, @window_fg_color, 0.03);
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

columnview > header button:hover {
  background-color: mix(@window_bg_color, @window_fg_color, 0.07);
  border-color: @hover_border_color;
}

columnview > header button:active,
columnview > header button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

notebook,
notebook.frame {
  color: @window_fg_color;
  background-color: @window_bg_color;
  border-color: @border_color;
}

notebook > header {
  background-color: @card_bg_color;
  border-color: @border_color;
  background-image: none;
}

notebook > header > tabs {
  background-color: transparent;
}

notebook tab {
  color: @insensitive_fg_color;
  background-color: mix(@card_bg_color, @window_fg_color, 0.08);
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 6px 6px 0 0;
  box-shadow: none;
  margin: 0 2px;
  padding: 4px 10px;
}

notebook tab:hover {
  color: @window_fg_color;
  background-color: mix(@card_bg_color, @window_fg_color, 0.14);
  border-color: @hover_border_color;
}

notebook tab:checked {
  color: @window_fg_color;
  background-color: @window_bg_color;
  border-color: @border_color;
}

notebook tab:checked:backdrop {
  color: @window_fg_color;
  background-color: @window_bg_color;
}

notebook tab:backdrop {
  color: @insensitive_fg_color;
  background-color: mix(@card_bg_color, @window_fg_color, 0.08);
  border-color: @border_color;
}

notebook > header.top tab:checked {
  border-bottom-color: @window_bg_color;
}

notebook > header.bottom tab:checked {
  border-top-color: @window_bg_color;
}

notebook > header.left tab:checked {
  border-right-color: @window_bg_color;
}

notebook > header.right tab:checked {
  border-left-color: @window_bg_color;
}

stackswitcher,
stackswitcher.stack-switcher {
  background-color: transparent;
}

stackswitcher > button,
stackswitcher.stack-switcher > button {
  color: @insensitive_fg_color;
  background-color: transparent;
  border-color: transparent;
  border-style: solid;
  border-width: 0 0 2px 0;
  border-radius: 0;
  box-shadow: none;
  padding: 6px 10px;
}

stackswitcher > button:hover,
stackswitcher.stack-switcher > button:hover {
  color: @window_fg_color;
  background-color: mix(@window_bg_color, @window_fg_color, 0.05);
  border-color: mix(@accent_bg_color, @window_bg_color, 0.35);
}

stackswitcher > button:active,
stackswitcher > button:checked,
stackswitcher.stack-switcher > button:active,
stackswitcher.stack-switcher > button:checked {
  color: @window_fg_color;
  background-color: transparent;
  border-color: @accent_bg_color;
}

stackswitcher > button.needs-attention,
stackswitcher.stack-switcher > button.needs-attention {
  color: @window_fg_color;
  border-color: @warning_color;
}

listview.separators row,
columnview listview.separators row {
  border-bottom-color: mix(@window_bg_color, @window_fg_color, 0.12);
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

listview.separators row:backdrop,
columnview listview.separators row:backdrop {
  border-bottom-color: mix(@window_bg_color, @window_fg_color, 0.18);
}

button,
dropdown > button,
combobox button,
spinbutton > button,
listview button,
row button,
columnview button {
  color: @window_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

listview check,
row check,
columnview check {
  color: @window_fg_color;
  background-color: @window_bg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  background-image: none;
  box-shadow: none;
}

listview radio,
row radio,
columnview radio {
  color: @window_fg_color;
  background-color: @window_bg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
  background-image: none;
  box-shadow: none;
}

scale,
scale trough,
scale slider,
checkbutton check,
checkbutton radio,
switch,
switch slider {
  color: @window_fg_color;
  background-color: @window_bg_color;
  border-color: @border_color;
  background-image: none;
  box-shadow: none;
}

scale trough,
switch {
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
}

scale trough {
  min-height: 6px;
}

scale slider {
  min-width: 18px;
  min-height: 18px;
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
}

switch {
  padding: 2px;
}

switch slider {
  min-width: 18px;
  min-height: 18px;
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
}

progressbar,
progressbar trough {
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
  color: @window_fg_color;
}

progressbar:backdrop trough {
  background-color: mix(@window_bg_color, @window_fg_color, 0.12);
  border-color: mix(@window_bg_color, @window_fg_color, 0.18);
}

progressbar:backdrop text {
  color: @insensitive_fg_color;
}

button:hover,
dropdown > button:hover,
combobox button:hover,
spinbutton > button:hover,
listview button:hover,
row button:hover,
columnview button:hover,
button.flat:hover,
menubutton.flat > button:hover,
window.dialog button:hover,
window.dialog actionbar button:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

button:active,
button:checked,
dropdown > button:active,
dropdown > button:checked,
combobox button:active,
combobox button:checked,
spinbutton > button:active,
spinbutton > button:checked,
listview button:active,
listview button:checked,
row button:active,
row button:checked,
columnview button:active,
columnview button:checked,
listview check:checked,
row check:checked,
columnview check:checked,
listview radio:checked,
row radio:checked,
columnview radio:checked,
button.flat:active,
button.flat:checked,
menubutton.flat > button:active,
button.suggested-action,
menubutton.suggested-action > button,
window.dialog button:active,
window.dialog button:checked,
window.dialog actionbar button:active,
window.dialog actionbar button:checked,
window.dialog button.suggested-action,
window.dialog actionbar button.suggested-action,
window.dialog button.suggested-action:active,
window.dialog button.suggested-action:checked,
window.dialog actionbar button.suggested-action:active,
window.dialog actionbar button.suggested-action:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

button:focus,
entry:focus,
entry:focus-within,
spinbutton:focus,
spinbutton:focus-within,
spinbutton text:focus,
textview:focus,
textview > text:focus,
dropdown:focus > button,
combobox:focus button,
scale:focus,
scale:focus slider,
switch:focus,
switch:focus slider {
  border-color: @accent_bg_color;
  box-shadow: none;
  outline-color: transparent;
  outline-style: none;
  outline-width: 0;
}

listview button:focus,
row button:focus,
columnview button:focus,
listview check:focus,
row check:focus,
columnview check:focus,
listview radio:focus,
row radio:focus,
columnview radio:focus {
  border-color: @accent_bg_color;
  box-shadow: none;
}

button,
menubutton > button {
  background-image: none;
  border-style: solid;
  border-width: 2px;
  border-radius: 6px;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
}

button:hover,
menubutton > button:hover {
  border-color: @hover_border_color;
}

button:disabled,
menubutton > button:disabled {
  color: @insensitive_fg_color;
  background-color: @insensitive_bg_color;
  border-color: @border_color;
}

button.flat,
menubutton.flat > button {
  background-color: mix(@button_bg_color, @window_bg_color, 0.45);
  border-color: @button_border_color;
}

button.destructive-action,
menubutton.destructive-action > button {
  color: @destructive_fg_color;
  background-color: @destructive_color;
  border-color: @destructive_color;
}

button.destructive-action:hover,
menubutton.destructive-action > button:hover {
  background-color: mix(@destructive_bg_color, @window_fg_color, 0.12);
  border-color: mix(@destructive_bg_color, @window_fg_color, 0.12);
}

selection,
text selection,
label selection {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.2);
}

row:selected,
row:selected:hover,
listview row:selected,
listview row:selected:hover {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
}

row:selected:backdrop,
listview row:selected:backdrop {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.35);
}

popover.background,
tooltip {
  color: @popover_fg_color;
  background-color: @popover_bg_color;
  border-color: @border_color;
}

popover contents {
  background-color: @popover_bg_color;
  color: @popover_fg_color;
  border-color: @border_color;
  border-style: solid;
  border-width: 1px;
  border-radius: 12px;
  box-shadow: none;
}

popover arrow {
  color: @popover_shade_color;
}

menubar {
  color: @window_fg_color;
  background-color: transparent;
}

menubar > item {
  color: @window_fg_color;
  border-radius: 6px;
  padding: 6px 10px;
}

menubar > item:hover {
  background-color: @hover_bg_color;
}

menubar > item:active,
menubar > item:selected,
menubar > item.active {
  color: @accent_fg_color;
  background-color: mix(@accent_bg_color, @window_bg_color, 0.82);
}

popover.menu button.model {
  color: @popover_fg_color;
  background-color: transparent;
  border-color: transparent;
  border-style: solid;
  border-width: 2px;
  border-radius: 8px;
  box-shadow: none;
}

popover.menu button.model:hover {
  background-color: @hover_bg_color;
}

popover.menu button.model:active,
popover.menu button.model:checked,
popover.menu button.model:selected {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
}

window.dialog {
  color: @dialog_fg_color;
  background-color: @dialog_bg_color;
  border-color: @border_color;
}

window.dialog headerbar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
}

window.dialog:backdrop {
  color: @insensitive_fg_color;
}

window.dialog:backdrop headerbar,
window.dialog:backdrop .title,
window.dialog:backdrop .subtitle {
  color: @insensitive_fg_color;
}

window.dialog button,
window.dialog actionbar button {
  color: @dialog_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

searchbar > revealer > box {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

searchbar entry {
  color: @view_fg_color;
  background-color: @view_bg_color;
}

scrollbar trough {
  background-color: transparent;
  border-color: transparent;
}

scrollbar slider {
  min-width: 8px;
  min-height: 8px;
  border-radius: 999px;
  background-color: @scrollbar_slider_color;
  border-color: transparent;
  box-shadow: none;
}

scrollbar slider:hover {
  background-color: @scrollbar_slider_hover_color;
}

scrollbar slider:active {
  background-color: @scrollbar_slider_active_color;
}

listview.navigation-sidebar,
columnview.navigation-sidebar,
.navigation-sidebar {
  color: @sidebar_fg_color;
  background-color: @sidebar_bg_color;
}

listview.navigation-sidebar row,
columnview.navigation-sidebar row,
.navigation-sidebar row {
  color: @sidebar_fg_color;
  background-color: transparent;
  border-color: mix(@window_bg_color, @window_fg_color, 0.14);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  background-image: none;
}

listview.navigation-sidebar row:hover,
columnview.navigation-sidebar row:hover,
.navigation-sidebar row:hover {
  background-color: @hover_bg_color;
}

listview.navigation-sidebar row:selected,
listview.navigation-sidebar row:selected:hover,
columnview.navigation-sidebar row:selected,
columnview.navigation-sidebar row:selected:hover,
.navigation-sidebar row:selected,
.navigation-sidebar row:selected:hover {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: mix(@accent_bg_color, @window_fg_color, 0.35);
}

.accent {
  color: @accent_color;
}

.success {
  color: @success_color;
}

.warning {
  color: @warning_color;
}

.error {
  color: @error_color;
}

entry.success {
  border-color: @success_bg_color;
}

entry.warning {
  border-color: @warning_bg_color;
}

entry.error {
  border-color: @error_bg_color;
}

progressbar progress,
progressbar:backdrop progress,
scale highlight,
switch:checked {
  background-color: @accent_bg_color;
}
`;

export function configureGtk4(scheme: ColorScheme, cssPath?: string): void {
  const resolvedCssPath = cssPath ?? join(homedir(), ".config", "gtk-4.0", "gtk.css");
  ensureDir(dirname(resolvedCssPath));

  const css = [buildGtkDefineColorBlock(scheme), "", GTK4_CSS.trim()].join("\n");
  writeConfigFile(resolvedCssPath, css);
}
