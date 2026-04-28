import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

const GTK3_CSS = `
window, .background {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
}

headerbar, titlebar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

window.csd titlebar, window.csd .titlebar, .csd titlebar, .csd .titlebar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar:backdrop, titlebar:backdrop, window.csd titlebar:backdrop, window.csd .titlebar:backdrop, .csd titlebar:backdrop, .csd .titlebar:backdrop {
  color: @insensitive_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar:backdrop .title, headerbar:backdrop .subtitle, titlebar:backdrop .title, titlebar:backdrop .subtitle,
window.csd titlebar:backdrop .title, window.csd titlebar:backdrop .subtitle, window.csd .titlebar:backdrop .title, window.csd .titlebar:backdrop .subtitle,
.csd titlebar:backdrop .title, .csd titlebar:backdrop .subtitle, .csd .titlebar:backdrop .title, .csd .titlebar:backdrop .subtitle {
  color: @insensitive_fg_color;
}

headerbar button, titlebar button, window.csd titlebar button, .csd titlebar button, button.titlebutton {
  color: @headerbar_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

headerbar button:hover, titlebar button:hover, button.titlebutton:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

headerbar button:active, headerbar button:checked, titlebar button:active, titlebar button:checked, button.titlebutton:active, button.titlebutton:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

headerbar button:backdrop, titlebar button:backdrop, button.titlebutton:backdrop {
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

button, combobox button, spinbutton {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
}

scale slider, checkbutton check, radiobutton radio {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

button:hover, combobox button:hover, spinbutton:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

button:active, button:checked, combobox button:active, combobox button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

button:focus, combobox button:focus, entry:focus, spinbutton:focus {
  border-color: @accent_bg_color;
}

button {
  background-image: none;
  border-style: solid;
  border-width: 2px;
  border-radius: 6px;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}

button:hover {
  border-color: @hover_border_color;
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

pathbar, .path-bar, .breadcrumbs {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

pathbar button, .path-bar button, .breadcrumbs button, pathbar .path-bar-button, .path-bar .path-bar-button {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

pathbar button:hover, .path-bar button:hover, .breadcrumbs button:hover, pathbar .path-bar-button:hover, .path-bar .path-bar-button:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

pathbar button:active, pathbar button:checked, .path-bar button:active, .path-bar button:checked, .breadcrumbs button:active, .breadcrumbs button:checked {
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

popover, menu, tooltip {
  color: @popover_fg_color;
  background-color: @popover_bg_color;
  border-color: @border_color;
}

menu menuitem:hover,
menubar > menuitem:hover {
  background-color: @hover_bg_color;
}

menu menuitem:active,
menu menuitem:selected,
menubar > menuitem:active,
menubar > menuitem:selected {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
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

dialog, messagedialog, .message-dialog {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

dialog headerbar, messagedialog headerbar, .message-dialog headerbar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
}

dialog:backdrop, messagedialog:backdrop, .message-dialog:backdrop {
  color: @insensitive_fg_color;
}

dialog:backdrop headerbar, messagedialog:backdrop headerbar, .message-dialog:backdrop headerbar {
  color: @insensitive_fg_color;
}

dialog #action_area button, dialog .dialog-action-area button, dialog action-area button, dialog box button,
messagedialog #action_area button, messagedialog .dialog-action-area button, messagedialog action-area button, messagedialog box button,
.message-dialog #action_area button, .message-dialog box button {
  color: @theme_fg_color;
  background-color: @button_bg_color;
  border-color: @button_border_color;
  background-image: none;
}

dialog #action_area button:hover, dialog .dialog-action-area button:hover, dialog action-area button:hover, dialog box button:hover,
messagedialog #action_area button:hover, messagedialog .dialog-action-area button:hover, messagedialog action-area button:hover, messagedialog box button:hover,
.message-dialog #action_area button:hover, .message-dialog box button:hover {
  background-color: @button_hover_bg_color;
  border-color: @hover_border_color;
  background-image: none;
}

dialog #action_area button:active, dialog #action_area button:checked, dialog .dialog-action-area button:active, dialog .dialog-action-area button:checked, dialog action-area button:active, dialog action-area button:checked, dialog box button:active, dialog box button:checked,
messagedialog #action_area button:active, messagedialog #action_area button:checked, messagedialog .dialog-action-area button:active, messagedialog .dialog-action-area button:checked, messagedialog action-area button:active, messagedialog action-area button:checked, messagedialog box button:active, messagedialog box button:checked,
.message-dialog #action_area button:active, .message-dialog #action_area button:checked, .message-dialog box button:active, .message-dialog box button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

dialog #action_area button.suggested-action, dialog .dialog-action-area button.suggested-action, dialog action-area button.suggested-action,
messagedialog #action_area button.suggested-action, messagedialog .dialog-action-area button.suggested-action, messagedialog action-area button.suggested-action,
.message-dialog #action_area button.suggested-action {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

dialog #action_area button.suggested-action:active, dialog #action_area button.suggested-action:checked, dialog .dialog-action-area button.suggested-action:active, dialog .dialog-action-area button.suggested-action:checked, dialog action-area button.suggested-action:active, dialog action-area button.suggested-action:checked, dialog box button.suggested-action:active, dialog box button.suggested-action:checked,
messagedialog #action_area button.suggested-action:active, messagedialog #action_area button.suggested-action:checked, messagedialog .dialog-action-area button.suggested-action:active, messagedialog .dialog-action-area button.suggested-action:checked, messagedialog action-area button.suggested-action:active, messagedialog action-area button.suggested-action:checked, messagedialog box button.suggested-action:active, messagedialog box button.suggested-action:checked,
.message-dialog #action_area button.suggested-action:active, .message-dialog #action_area button.suggested-action:checked, .message-dialog box button.suggested-action:active, .message-dialog box button.suggested-action:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

progressbar progress, scale highlight, switch:checked {
  background-color: @accent_bg_color;
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
