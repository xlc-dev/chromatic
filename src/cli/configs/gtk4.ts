import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

const GTK4_CSS = `
window, .background {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
}

headerbar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar button, windowcontrols button, .titlebar button {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

headerbar button:hover, windowcontrols button:hover, .titlebar button:hover {
  background-color: @hover_bg_color;
  background-image: none;
}

headerbar button:active, headerbar button:checked, windowcontrols button:active, .titlebar button:active {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

headerbar:backdrop, .titlebar:backdrop {
  color: @headerbar_fg_color !important;
  background-color: @headerbar_bg_color !important;
  border-color: @border_color !important;
  background-image: none !important;
}

headerbar button:backdrop, windowcontrols button:backdrop, .titlebar button:backdrop {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
  background-image: none;
}

entry, textview, listview, row, .view {
  color: @theme_text_color;
  background-color: @theme_base_color;
  border-color: @border_color;
}

button, combobox, dropdown, spinbutton, scale slider, checkbutton check, checkbutton radio {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

button:hover, combobox:hover, dropdown:hover {
  background-color: @hover_bg_color;
  background-image: none;
}

button:active, button:checked, combobox:active, dropdown:active {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

button:focus, combobox:focus, dropdown:focus, entry:focus, spinbutton:focus {
  border-color: @accent_bg_color;
}

.path-bar, .breadcrumbs {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

.path-bar button, .breadcrumbs button {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

.path-bar button:hover, .breadcrumbs button:hover {
  background-color: @hover_bg_color;
  background-image: none;
}

.path-bar button:active, .path-bar button:checked, .breadcrumbs button:active, .breadcrumbs button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
}

selection, *:selected {
  color: @theme_selected_fg_color;
  background-color: mix(@theme_selected_bg_color, @theme_bg_color, 0.2);
}

row:selected, row:selected:hover, listview row:selected, listview row:selected:hover {
  color: @theme_selected_fg_color;
  background-color: @accent_bg_color;
}

row:selected:backdrop, listview row:selected:backdrop {
  color: @theme_selected_fg_color;
  background-color: mix(@accent_bg_color, @theme_bg_color, 0.35);
}

popover, menu, tooltip {
  color: @popover_fg_color;
  background-color: @popover_bg_color;
  border-color: @border_color;
}

dialog {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
}

dialog headerbar {
  color: @headerbar_fg_color;
  background-color: @headerbar_bg_color;
  border-color: @border_color;
}

dialog button, dialog .dialog-action-area button, dialog actionbar button {
  color: @theme_fg_color;
  background-color: @theme_bg_color;
  border-color: @border_color;
  background-image: none;
}

dialog button:hover, dialog .dialog-action-area button:hover, dialog actionbar button:hover {
  background-color: @hover_bg_color;
  background-image: none;
}

dialog button:active, dialog button:checked, dialog .dialog-action-area button:active, dialog .dialog-action-area button:checked, dialog actionbar button:active, dialog actionbar button:checked {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

dialog button.suggested-action, dialog .dialog-action-area button.suggested-action, dialog actionbar button.suggested-action {
  color: @accent_fg_color;
  background-color: @accent_bg_color;
  border-color: @accent_bg_color;
  background-image: none;
}

dialog button.suggested-action:active, dialog button.suggested-action:checked,
dialog .dialog-action-area button.suggested-action:active, dialog .dialog-action-area button.suggested-action:checked,
dialog actionbar button.suggested-action:active, dialog actionbar button.suggested-action:checked,
dialog button:default:active, dialog button:default:checked,
dialog .dialog-action-area button:default:active, dialog .dialog-action-area button:default:checked,
dialog actionbar button:default:active, dialog actionbar button:default:checked {
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
    `@define-color hover_border_color ${scheme.inactiveBorder};`,
    `@define-color border_color ${scheme.inactiveBorder};`,
    `@define-color borders ${scheme.inactiveBorder};`,
    `@define-color warning_color ${scheme.yellow};`,
    `@define-color error_color ${scheme.urgentBorder};`,
    `@define-color success_color ${scheme.green};`,
    `@define-color destructive_color ${scheme.urgentBorder};`,
    `@define-color link_color ${scheme.activeBorder};`,
    `@define-color visited_link_color shade(${scheme.activeBorder}, 0.9);`,
  ];

  return lines.join("\n");
}

export function configureGtk4(scheme: ColorScheme, cssPath?: string): void {
  const resolvedCssPath = cssPath ?? join(homedir(), ".config", "gtk-4.0", "gtk.css");
  ensureDir(dirname(resolvedCssPath));

  const css = [buildDefineColorBlock(scheme), "", GTK4_CSS].join("\n");
  writeConfigFile(resolvedCssPath, css);
}
