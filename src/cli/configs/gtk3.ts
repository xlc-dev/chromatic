import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

const GTK3_THEME_CSS = `
* {
  -GtkTextView-error-underline-color: @theme_error;
  outline-color: alpha(@theme_fg, 0.3);
  -gtk-secondary-caret-color: @theme_selected_bg;
}

.background {
  color: @theme_fg;
  background-color: @theme_bg;
}

.background:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  text-shadow: none;
  -gtk-icon-shadow: none;
}

.gtkstyle-fallback {
  color: @theme_fg;
  background-color: @theme_bg;
}

.gtkstyle-fallback:hover {
  color: @theme_fg;
  background-color: @theme_bg_hover;
}

.gtkstyle-fallback:active {
  color: @theme_fg;
  background-color: @theme_bg_active;
}

.gtkstyle-fallback:disabled {
  color: @theme_insensitive_fg;
  background-color: @theme_bg_insensitive;
}

.gtkstyle-fallback:selected {
  color: @theme_fg;
  background-color: @theme_selected_bg;
}

.view, iconview, .view text, iconview text, textview text {
  color: @theme_fg;
  caret-color: @theme_fg;
  background-color: @theme_bg;
}

.view:backdrop, iconview:backdrop, .view text:backdrop, iconview text:backdrop, textview text:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
}

.view:backdrop:disabled, iconview:backdrop:disabled, .view text:backdrop:disabled, iconview text:backdrop:disabled, textview text:backdrop:disabled {
  color: @theme_insensitive_fg;
}

.view:disabled, iconview:disabled, .view text:disabled, iconview text:disabled, textview text:disabled {
  color: @theme_insensitive_fg;
  background-color: @theme_bg_insensitive;
}

textview border {
  background-color: @theme_border;
}

.rubberband, rubberband, .content-view rubberband, .content-view .rubberband, treeview.view rubberband, flowbox rubberband {
  border-color: @theme_selected_bg;
  background-color: alpha(@theme_selected_bg, 0.2);
}

.content-view .tile {
  background-color: @theme_bg_active;
}

.content-view .tile:backdrop {
  background-color: @theme_border;
}

.content-view .tile:active, .content-view .tile:selected {
  background-color: @theme_selected_bg;
}

.content-view .tile:disabled {
  background-color: @theme_bg_insensitive;
}

label {
  caret-color: currentColor;
}

label selection {
  background-color: @theme_selected_bg;
  color: @theme_fg;
}

label:disabled {
  color: @theme_insensitive_fg;
}

label:disabled:backdrop {
  color: @theme_insensitive_fg;
}

label.error {
  color: @theme_error;
}

label.error:disabled {
  color: alpha(@theme_error, 0.5);
}

label.error:disabled:backdrop {
  color: alpha(@theme_error, 0.4);
}

assistant .sidebar {
  background-color: @theme_bg;
  border-top-color: @theme_border;
}

assistant .sidebar:backdrop {
  background-color: @theme_bg;
  border-color: @theme_border;
}

assistant .sidebar label.highlight {
  background-color: @theme_bg_hover;
}

.osd .scale-popup, .app-notification, .app-notification.frame, .csd popover.background.osd, popover.background.osd, .csd popover.background.touch-selection, .csd popover.background.magnifier, popover.background.touch-selection, popover.background.magnifier, .osd {
  color: @theme_fg;
  background-color: @theme_bg;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
}

.osd .scale-popup:backdrop, .app-notification:backdrop, popover.background.osd:backdrop, popover.background.touch-selection:backdrop, popover.background.magnifier:backdrop, .osd:backdrop {
  text-shadow: none;
  -gtk-icon-shadow: none;
}

spinner:backdrop {
  color: @theme_backdrop_fg;
}

spinbutton:not(.vertical), entry {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

spinbutton:focus:not(.vertical), entry:focus {
  border-color: @theme_selected_bg;
}

spinbutton:disabled:not(.vertical), entry:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

spinbutton:backdrop:not(.vertical), entry:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

spinbutton:backdrop:disabled:not(.vertical), entry:backdrop:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

spinbutton.error:not(.vertical), entry.error {
  color: @theme_error;
  border-color: @theme_error;
}

spinbutton.error:focus:not(.vertical), entry.error:focus {
  border-color: @theme_error;
}

spinbutton.error:not(.vertical) selection, entry.error selection {
  background-color: @theme_error;
}

spinbutton.warning:not(.vertical), entry.warning {
  color: @theme_warning;
  border-color: @theme_warning;
}

spinbutton.warning:focus:not(.vertical), entry.warning:focus {
  border-color: @theme_warning;
}

spinbutton.warning:not(.vertical) selection, entry.warning selection {
  background-color: @theme_warning;
}

spinbutton:not(.vertical) image, entry image {
  color: @theme_fg;
}

spinbutton:not(.vertical) image:hover, entry image:hover {
  color: @theme_fg;
}

spinbutton:not(.vertical) image:active, entry image:active {
  color: @theme_selected_bg;
}

spinbutton:not(.vertical) image:backdrop, entry image:backdrop {
  color: @theme_backdrop_fg;
}

spinbutton:drop(active):not(.vertical), entry:drop(active):focus, entry:drop(active) {
  border-color: @theme_success;
}

.osd spinbutton:not(.vertical), .osd entry {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
}

.osd spinbutton:focus:not(.vertical), .osd entry:focus {
  color: @theme_fg;
  border-color: @theme_selected_bg;
  background-color: @theme_bg;
}

.osd spinbutton:backdrop:not(.vertical), .osd entry:backdrop {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

.osd spinbutton:disabled:not(.vertical), .osd entry:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

spinbutton:not(.vertical) progress, entry progress {
  border-color: @theme_selected_bg;
}

.linked:not(.vertical) > spinbutton:focus:not(.vertical) + spinbutton:not(.vertical), .linked:not(.vertical) > spinbutton:focus:not(.vertical) + button, .linked:not(.vertical) > spinbutton:focus:not(.vertical) + combobox > box > button.combo, .linked:not(.vertical) > spinbutton:focus:not(.vertical) + entry, .linked:not(.vertical) > entry:focus + button, .linked:not(.vertical) > entry:focus + combobox > box > button.combo, .linked:not(.vertical) > entry:focus + spinbutton:not(.vertical), .linked:not(.vertical) > entry:focus + entry {
  border-left-color: @theme_border;
}

.linked:not(.vertical) > spinbutton:focus.error:not(.vertical) + spinbutton:not(.vertical), .linked:not(.vertical) > spinbutton:focus.error:not(.vertical) + button, .linked:not(.vertical) > spinbutton:focus.error:not(.vertical) + combobox > box > button.combo, .linked:not(.vertical) > spinbutton:focus.error:not(.vertical) + entry, .linked:not(.vertical) > entry:focus.error + button, .linked:not(.vertical) > entry:focus.error + combobox > box > button.combo, .linked:not(.vertical) > entry:focus.error + spinbutton:not(.vertical), .linked:not(.vertical) > entry:focus.error + entry {
  border-left-color: @theme_error;
}

.linked:not(.vertical) > spinbutton:drop(active):not(.vertical) + spinbutton:not(.vertical), .linked:not(.vertical) > spinbutton:drop(active):not(.vertical) + button, .linked:not(.vertical) > spinbutton:drop(active):not(.vertical) + combobox > box > button.combo, .linked:not(.vertical) > spinbutton:drop(active):not(.vertical) + entry, .linked:not(.vertical) > entry:drop(active) + button, .linked:not(.vertical) > entry:drop(active) + combobox > box > button.combo, .linked:not(.vertical) > entry:drop(active) + spinbutton:not(.vertical), .linked:not(.vertical) > entry:drop(active) + entry {
  border-left-color: @theme_success;
}

.linked.vertical > spinbutton:not(:disabled):not(.vertical) + entry:not(:disabled), .linked.vertical > spinbutton:not(:disabled):not(.vertical) + spinbutton:not(:disabled):not(.vertical), .linked.vertical > entry:not(:disabled) + entry:not(:disabled), .linked.vertical > entry:not(:disabled) + spinbutton:not(:disabled):not(.vertical) {
  border-top-color: @theme_border;
}

.linked.vertical > spinbutton:not(:disabled):not(.vertical) + entry:not(:disabled):backdrop, .linked.vertical > spinbutton:not(:disabled):not(.vertical) + spinbutton:not(:disabled):backdrop:not(.vertical), .linked.vertical > entry:not(:disabled) + entry:not(:disabled):backdrop, .linked.vertical > entry:not(:disabled) + spinbutton:not(:disabled):backdrop:not(.vertical) {
  border-top-color: @theme_border;
}

.linked.vertical > spinbutton:disabled:not(.vertical) + spinbutton:disabled:not(.vertical), .linked.vertical > spinbutton:disabled:not(.vertical) + entry:disabled, .linked.vertical > entry:disabled + spinbutton:disabled:not(.vertical), .linked.vertical > entry:disabled + entry:disabled {
  border-top-color: @theme_border;
}

.linked.vertical > spinbutton:not(.vertical) + spinbutton:focus:not(:only-child):not(.vertical), .linked.vertical > spinbutton:not(.vertical) + entry:focus:not(:only-child), .linked.vertical > spinbutton:not(.vertical) + entry:focus:not(:only-child), .linked.vertical > entry + spinbutton:focus:not(:only-child):not(.vertical), .linked.vertical > entry + entry:focus:not(:only-child) {
  border-top-color: @theme_border;
}

.linked.vertical > spinbutton:focus:not(:only-child):not(.vertical) + spinbutton:not(.vertical), .linked.vertical > spinbutton:focus:not(:only-child):not(.vertical) + entry, .linked.vertical > spinbutton:focus:not(:only-child):not(.vertical) + button, .linked.vertical > spinbutton:focus:not(:only-child):not(.vertical) + combobox > box > button.combo, .linked.vertical > entry:focus:not(:only-child) + spinbutton:not(.vertical), .linked.vertical > entry:focus:not(:only-child) + entry, .linked.vertical > entry:focus:not(:only-child) + button, .linked.vertical > entry:focus:not(:only-child) + combobox > box > button.combo {
  border-top-color: @theme_border;
}

.linked.vertical > spinbutton:focus.error:not(:only-child):not(.vertical) + spinbutton:not(.vertical), .linked.vertical > spinbutton:focus.error:not(:only-child):not(.vertical) + entry, .linked.vertical > entry:focus.error:not(:only-child) + spinbutton:not(.vertical), .linked.vertical > entry:focus.error:not(:only-child) + entry {
  border-top-color: @theme_error;
}

.linked.vertical > spinbutton:drop(active):not(:only-child):not(.vertical) + spinbutton:not(.vertical), .linked.vertical > spinbutton:drop(active):not(:only-child):not(.vertical) + entry, .linked.vertical > entry:drop(active):not(:only-child) + spinbutton:not(.vertical), .linked.vertical > entry:drop(active):not(:only-child) + entry {
  border-top-color: @theme_success;
}

treeview entry:focus:dir(rtl), treeview entry:focus:dir(ltr) {
  background-color: @theme_bg;
}

treeview entry.flat, treeview entry {
  background-color: @theme_bg;
}

treeview entry.flat:focus, treeview entry:focus {
  border-color: @theme_selected_bg;
}

.entry-tag {
  color: @theme_bg;
  background-color: @theme_insensitive_fg;
}

.entry-tag:hover {
  background-color: @theme_backdrop_fg;
}

:backdrop .entry-tag {
  color: @theme_bg;
  background-color: @theme_insensitive_fg;
}

.entry-tag.button {
  background-color: transparent;
  color: alpha(@theme_bg, 0.7);
}

:not(:backdrop) .entry-tag.button:hover {
  border-color: @theme_insensitive_fg;
  color: @theme_bg;
}

:not(:backdrop) .entry-tag.button:active {
  background-color: @theme_insensitive_fg;
  color: alpha(@theme_bg, 0.7);
}

button.titlebutton, notebook > header > tabs > arrow, button {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg;
}

button.titlebutton, button.sidebar-button, notebook > header > tabs > arrow, notebook > header > tabs > arrow.flat, button.flat {
  border-color: transparent;
  background-color: transparent;
}

notebook > header > tabs > arrow:hover, button:hover {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_hover;
}

notebook > header > tabs > arrow:active, notebook > header > tabs > arrow:checked, button:active, button:checked {
  color: @theme_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

notebook > header > tabs > arrow:backdrop, button:backdrop.flat, button:backdrop {
  color: @theme_backdrop_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg;
}

notebook > header > tabs > arrow:backdrop:active, notebook > header > tabs > arrow:backdrop:checked, button:backdrop.flat:active, button:backdrop.flat:checked, button:backdrop:active, button:backdrop:checked {
  color: @theme_backdrop_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

notebook > header > tabs > arrow:backdrop:disabled, button:backdrop.flat:disabled, button:backdrop:disabled {
  color: @theme_insensitive_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

notebook > header > tabs > arrow:backdrop:disabled:active, notebook > header > tabs > arrow:backdrop:disabled:checked, button:backdrop.flat:disabled:active, button:backdrop.flat:disabled:checked, button:backdrop:disabled:active, button:backdrop:disabled:checked {
  color: @theme_insensitive_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

button.titlebutton:backdrop, button.sidebar-button:backdrop, notebook > header > tabs > arrow:backdrop, button.titlebutton:disabled, button.sidebar-button:disabled, notebook > header > tabs > arrow:disabled, button.flat:backdrop, button.flat:disabled, button.flat:backdrop:disabled {
  border-color: transparent;
  background-color: transparent;
}

notebook > header > tabs > arrow:disabled, button:disabled {
  color: @theme_insensitive_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

notebook > header > tabs > arrow:disabled:active, notebook > header > tabs > arrow:disabled:checked, button:disabled:active, button:disabled:checked {
  color: @theme_insensitive_fg;
  border-width: 1px;
  border-style: solid;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

combobox:drop(active) button.combo, notebook > header > tabs > arrow:drop(active), button:drop(active) {
  color: @theme_success;
  border-color: @theme_success;
}

row:selected button.sidebar-button:not(:active):not(:checked):not(:hover):not(disabled), row:selected button.flat:not(:active):not(:checked):not(:hover):not(disabled) {
  color: @theme_fg;
  border-color: transparent;
}

row:selected button.sidebar-button:not(:active):not(:checked):not(:hover):not(disabled):backdrop, row:selected button.flat:not(:active):not(:checked):not(:hover):not(disabled):backdrop {
  color: @theme_backdrop_fg;
}

button.osd, .app-notification button, .app-notification.frame button, .csd popover.background.touch-selection button, .csd popover.background.magnifier button, popover.background.touch-selection button, popover.background.magnifier button, .osd button {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
  outline-color: alpha(@theme_fg, 0.3);
}

button.osd:hover, .app-notification button:hover, popover.background.touch-selection button:hover, popover.background.magnifier button:hover, .osd button:hover {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_hover;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
  outline-color: alpha(@theme_fg, 0.3);
}

button.osd:active, button.osd:checked, .app-notification button:active, popover.background.touch-selection button:active, popover.background.magnifier button:active, .app-notification button:checked, popover.background.touch-selection button:checked, popover.background.magnifier button:checked, .osd button:active, .osd button:checked {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_active;
  text-shadow: none;
  -gtk-icon-shadow: none;
  outline-color: alpha(@theme_fg, 0.3);
}

button.osd:disabled, button.osd:disabled:backdrop, .app-notification button:disabled, popover.background.touch-selection button:disabled, popover.background.magnifier button:disabled, .osd button:disabled, .osd button:disabled:backdrop {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
  text-shadow: none;
  -gtk-icon-shadow: none;
}

button.osd:backdrop, .app-notification button:backdrop, popover.background.touch-selection button:backdrop, popover.background.magnifier button:backdrop, .osd button:backdrop {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  text-shadow: none;
  -gtk-icon-shadow: none;
}

.app-notification button.flat, popover.background.touch-selection button.flat, popover.background.magnifier button.flat, .osd button.flat {
  border-color: transparent;
  background-color: transparent;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
}

.app-notification button.flat:hover, popover.background.touch-selection button.flat:hover, popover.background.magnifier button.flat:hover, .osd button.flat:hover {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_hover;
  text-shadow: 0 1px @theme_bg_active;
  -gtk-icon-shadow: 0 1px @theme_bg_active;
  outline-color: alpha(@theme_fg, 0.3);
}

.app-notification button.flat:disabled, popover.background.touch-selection button.flat:disabled, popover.background.magnifier button.flat:disabled, .osd button.flat:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
  text-shadow: none;
  -gtk-icon-shadow: none;
}

.app-notification button.flat:backdrop, popover.background.touch-selection button.flat:backdrop, popover.background.magnifier button.flat:backdrop, .osd button.flat:backdrop {
  border-color: transparent;
  background-color: transparent;
  text-shadow: none;
  -gtk-icon-shadow: none;
}

.app-notification button.flat:active, popover.background.touch-selection button.flat:active, popover.background.magnifier button.flat:active, .app-notification button.flat:checked, popover.background.touch-selection button.flat:checked, popover.background.magnifier button.flat:checked, .osd button.flat:active, .osd button.flat:checked {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_active;
  text-shadow: none;
  -gtk-icon-shadow: none;
  outline-color: alpha(@theme_fg, 0.3);
}

button.suggested-action {
  color: @theme_fg;
  outline-color: alpha(@theme_fg, 0.3);
  border-color: @theme_selected_bg;
  border-bottom-color: shade(@theme_selected_bg, 0.9);
  background-color: @theme_selected_bg;
  background-image: none;
  text-shadow: 0 -1px alpha(@theme_bg_active, 0.72);
  -gtk-icon-shadow: 0 -1px alpha(@theme_bg_active, 0.72);
  box-shadow: inset 0 1px alpha(@theme_fg, 0.02), 0 1px 2px alpha(@theme_bg_active, 0.07);
}

button.suggested-action.flat {
  border-color: transparent;
  background-color: transparent;
  text-shadow: none;
  -gtk-icon-shadow: none;
  color: @theme_selected_bg;
}

button.suggested-action:hover {
  color: @theme_fg;
  outline-color: alpha(@theme_fg, 0.3);
  border-color: @theme_selected_bg;
  border-bottom-color: shade(@theme_selected_bg, 0.9);
  background-color: @theme_selected_bg;
  background-image: none;
  text-shadow: 0 -1px alpha(@theme_bg_active, 0.67);
  -gtk-icon-shadow: 0 -1px alpha(@theme_bg_active, 0.67);
  box-shadow: inset 0 1px alpha(@theme_fg, 0.02), 0 1px 2px alpha(@theme_bg_active, 0.07);
}

button.suggested-action:active, button.suggested-action:checked {
  color: @theme_fg;
  outline-color: alpha(@theme_fg, 0.3);
  border-color: @theme_selected_bg;
  background-color: shade(@theme_selected_bg, 0.95);
  background-image: none;
  box-shadow: inset 0 1px alpha(@theme_fg, 0);
  text-shadow: none;
  -gtk-icon-shadow: none;
}

button.suggested-action:backdrop, button.suggested-action.flat:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_selected_bg;
  background-color: @theme_selected_bg;
  background-image: none;
  text-shadow: none;
  -gtk-icon-shadow: none;
  box-shadow: inset 0 1px alpha(@theme_fg, 0);
}

button.suggested-action:backdrop:active, button.suggested-action:backdrop:checked, button.suggested-action.flat:backdrop:active, button.suggested-action.flat:backdrop:checked {
  color: @theme_backdrop_fg;
  border-color: @theme_selected_bg;
  background-color: shade(@theme_selected_bg, 0.95);
  box-shadow: inset 0 1px alpha(@theme_fg, 0);
}

combobox button.combo {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

combobox button.combo:focus {
  border-color: @theme_selected_bg;
}

combobox button.combo:hover {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_hover;
}

combobox button.combo:active, combobox button.combo:checked {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg_active;
}

combobox button.combo:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

combobox button.combo:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
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

checkbutton check, radiobutton radio {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

checkbutton check:hover, radiobutton radio:hover {
  background-color: @theme_bg_hover;
}

checkbutton check:active, radiobutton radio:active, checkbutton check:checked, radiobutton radio:checked {
  background-color: @theme_selected_bg;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

checkbutton check:disabled, radiobutton radio:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
}

checkbutton check:backdrop, radiobutton radio:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
}

checkbutton check:backdrop:checked, radiobutton radio:backdrop:checked {
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

titlebar, .titlebar, window titlebar, window.csd titlebar, window.csd .titlebar, .csd titlebar, .csd .titlebar {
  color: @theme_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

titlebar:backdrop, .titlebar:backdrop, window titlebar:backdrop, window.csd titlebar:backdrop, .csd titlebar:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

pathbar, .path-bar, .breadcrumbs, .path-bar scrolledwindow,
filechooser pathbar, filechooser .path-bar, dialog pathbar, dialog .path-bar {
  color: @theme_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

pathbar:backdrop, .path-bar:backdrop, .breadcrumbs:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  background-image: none;
}

pathbar button, pathbar .path-bar-button, .path-bar button, .path-bar .path-bar-button, .breadcrumbs button,
filechooser pathbar button, filechooser .path-bar button, dialog pathbar button, dialog .path-bar button {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

pathbar button:hover, pathbar .path-bar-button:hover, .path-bar button:hover, .path-bar .path-bar-button:hover, .breadcrumbs button:hover,
filechooser pathbar button:hover, filechooser .path-bar button:hover, dialog pathbar button:hover, dialog .path-bar button:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

pathbar button:backdrop, .path-bar button:backdrop, .breadcrumbs button:backdrop,
filechooser pathbar button:backdrop, filechooser .path-bar button:backdrop, dialog pathbar button:backdrop, dialog .path-bar button:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

pathbar button.flat, .path-bar button.flat, .breadcrumbs button.flat,
filechooser pathbar button.flat, filechooser .path-bar button.flat, dialog pathbar button.flat, dialog .path-bar button.flat {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

pathbar button.flat:hover, .path-bar button.flat:hover, .breadcrumbs button.flat:hover,
filechooser pathbar button.flat:hover, filechooser .path-bar button.flat:hover, dialog pathbar button.flat:hover, dialog .path-bar button.flat:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

.sidebar, list .sidebar, .sidebar.view, paned .sidebar, placessidebar, placessidebar.sidebar {
  color: @theme_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

.sidebar:backdrop, list .sidebar:backdrop, .sidebar.view:backdrop, placessidebar:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

.sidebar row, .sidebar row:hover, list .sidebar row, placessidebar row, placessidebar.sidebar row {
  color: @theme_fg;
  background-color: transparent;
  background-image: none;
}

.sidebar row:hover, list .sidebar row:hover, placessidebar row:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

placessidebar .sidebar-new-bookmark-row, placessidebar .sidebar-placeholder-row, .sidebar .sidebar-new-bookmark-row, .sidebar .sidebar-placeholder-row {
  color: @theme_fg;
  background-color: transparent;
  background-image: none;
}

placessidebar .sidebar-new-bookmark-row:hover, placessidebar .sidebar-placeholder-row:hover, .sidebar .sidebar-new-bookmark-row:hover, .sidebar .sidebar-placeholder-row:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

dialog, messagedialog, .message-dialog {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

dialog:backdrop, messagedialog:backdrop {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

filechooser {
  background-color: @theme_bg;
  background-image: none;
  color: @theme_fg;
  border-color: @theme_border;
}

filechooser .view, filechooser list, filechooser listview {
  background-color: @theme_bg;
  background-image: none;
  color: @theme_fg;
}

filechooser label {
  color: @theme_fg;
  background-color: transparent;
  background-image: none;
}

dialog #content_area, dialog #action_area, dialog .dialog-action-area, dialog action-area, dialog box,
messagedialog #content_area, messagedialog #action_area, messagedialog .dialog-action-area, messagedialog action-area, messagedialog box, .message-dialog #action_area, .message-dialog box {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
  border-top-color: @theme_border;
}

dialog #action_area button, dialog .dialog-action-area button, dialog action-area button, dialog box button,
messagedialog #action_area button, messagedialog .dialog-action-area button, messagedialog action-area button, messagedialog box button, .message-dialog #action_area button, .message-dialog box button {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

dialog #action_area button.flat, dialog .dialog-action-area button.flat, dialog action-area button.flat, dialog box button.flat,
messagedialog #action_area button.flat, messagedialog action-area button.flat, messagedialog box button.flat, .message-dialog #action_area button.flat, .message-dialog box button.flat {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

dialog #action_area button:hover, dialog .dialog-action-area button:hover, dialog action-area button:hover, dialog box button:hover,
messagedialog #action_area button:hover, messagedialog action-area button:hover, messagedialog box button:hover, .message-dialog #action_area button:hover, .message-dialog box button:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

dialog #action_area button.flat:hover, dialog action-area button.flat:hover, dialog box button.flat:hover,
messagedialog #action_area button.flat:hover, messagedialog action-area button.flat:hover, messagedialog box button.flat:hover, .message-dialog box button.flat:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

dialog #action_area button:active, dialog #action_area button:checked, dialog .dialog-action-area button:active, dialog .dialog-action-area button:checked, dialog action-area button:active, dialog action-area button.suggested-action, dialog action-area button:checked, dialog box button:active, dialog box button:checked,
messagedialog #action_area button:active, messagedialog #action_area button:checked, messagedialog action-area button:active, messagedialog action-area button.suggested-action, messagedialog action-area button:checked, messagedialog box button:active, messagedialog box button:checked, .message-dialog #action_area button:active, .message-dialog #action_area button:checked, .message-dialog box button:active, .message-dialog box button:checked {
  background-color: @theme_selected_bg;
  background-image: none;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

dialog #action_area button.flat:active, dialog #action_area button.flat:checked, dialog action-area button.flat:active, dialog action-area button.flat:checked, dialog box button.flat:active, dialog box button.flat:checked,
messagedialog #action_area button.flat:active, messagedialog #action_area button.flat:checked, messagedialog action-area button.flat:active, messagedialog action-area button.flat:checked, messagedialog box button.flat:active, messagedialog box button.flat:checked, .message-dialog box button.flat:active, .message-dialog box button.flat:checked {
  background-color: @theme_bg_active;
  background-image: none;
}

dialog #action_area button.suggested-action, dialog .dialog-action-area button.suggested-action, dialog action-area button.suggested-action,
messagedialog #action_area button.suggested-action, messagedialog action-area button.suggested-action, .message-dialog #action_area button.suggested-action {
  background-color: @theme_selected_bg;
  background-image: none;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

dialog #action_area button.suggested-action:hover, dialog .dialog-action-area button.suggested-action:hover, dialog action-area button.suggested-action:hover,
messagedialog #action_area button.suggested-action:hover, messagedialog action-area button.suggested-action:hover, .message-dialog #action_area button.suggested-action:hover {
  background-color: shade(@theme_selected_bg, 1.05);
  background-image: none;
}

dialog #action_area button.destructive-action, dialog .dialog-action-area button.destructive-action, dialog action-area button.destructive-action, dialog box button.destructive-action,
messagedialog #action_area button.destructive-action, messagedialog action-area button.destructive-action, messagedialog box button.destructive-action, .message-dialog #action_area button.destructive-action, .message-dialog box button.destructive-action {
  color: @theme_fg;
  background-color: @theme_error;
  background-image: none;
  border-color: @theme_error;
}

dialog #action_area button.destructive-action:hover, dialog .dialog-action-area button.destructive-action:hover, dialog action-area button.destructive-action:hover, dialog box button.destructive-action:hover,
messagedialog #action_area button.destructive-action:hover, messagedialog action-area button.destructive-action:hover, messagedialog box button.destructive-action:hover, .message-dialog box button.destructive-action:hover {
  background-color: shade(@theme_error, 1.1);
  background-image: none;
}

dialog #action_area button:disabled, dialog .dialog-action-area button:disabled, dialog action-area button:disabled, dialog box button:disabled,
messagedialog #action_area button:disabled, messagedialog action-area button:disabled, messagedialog box button:disabled, .message-dialog #action_area button:disabled, .message-dialog box button:disabled {
  color: @theme_insensitive_fg;
  border-color: @theme_border;
  background-color: @theme_bg_insensitive;
  background-image: none;
}

dialog #action_area button:backdrop, dialog .dialog-action-area button:backdrop, dialog action-area button:backdrop, dialog box button:backdrop,
messagedialog #action_area button:backdrop, messagedialog action-area button:backdrop, messagedialog box button:backdrop, .message-dialog #action_area button:backdrop, .message-dialog box button:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

dialog #action_area button.flat:backdrop, dialog action-area button.flat:backdrop, dialog box button.flat:backdrop,
messagedialog #action_area button.flat:backdrop, messagedialog action-area button.flat:backdrop, messagedialog box button.flat:backdrop, .message-dialog box button.flat:backdrop {
  background-color: @theme_bg;
  background-image: none;
}

headerbar {
  color: @theme_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

headerbar:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

headerbar button, dialog headerbar button, filechooser headerbar button {
  color: @theme_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

headerbar button:hover, dialog headerbar button:hover, filechooser headerbar button:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

headerbar button:active, headerbar button:checked, dialog headerbar button:active, dialog headerbar button:checked, filechooser headerbar button:active, filechooser headerbar button:checked {
  background-color: @theme_bg_active;
  background-image: none;
}

headerbar button.flat, dialog headerbar button.flat, filechooser headerbar button.flat {
  background-color: @theme_bg;
  background-image: none;
  border-color: @theme_border;
}

headerbar button.flat:hover, dialog headerbar button.flat:hover, filechooser headerbar button.flat:hover {
  background-color: @theme_bg_hover;
  background-image: none;
}

headerbar button.suggested-action, dialog headerbar button.suggested-action, filechooser headerbar button.suggested-action {
  background-color: @theme_selected_bg;
  background-image: none;
  border-color: @theme_selected_bg;
  color: @theme_fg;
}

headerbar button.suggested-action:hover, dialog headerbar button.suggested-action:hover, filechooser headerbar button.suggested-action:hover {
  background-color: shade(@theme_selected_bg, 1.05);
  background-image: none;
}

headerbar button:backdrop, dialog headerbar button:backdrop, filechooser headerbar button:backdrop {
  color: @theme_backdrop_fg;
  border-color: @theme_border;
  background-color: @theme_bg;
  background-image: none;
}

headerbar button.suggested-action:backdrop, dialog headerbar button.suggested-action:backdrop, filechooser headerbar button.suggested-action:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_selected_bg;
  background-image: none;
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

treeview.view:selected, treeview.view:selected:focus, iconview:selected, iconview:selected:focus {
  background-color: @theme_selected_bg;
  color: @theme_fg;
}

treeview.view:selected:backdrop, iconview:selected:backdrop {
  background-color: @theme_selected_bg;
  color: @theme_backdrop_fg;
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

.sidebar row:selected, .sidebar row:selected:hover, list .sidebar row:selected, placessidebar row:selected, placessidebar row:selected:hover,
list row:selected, list row:selected:hover {
  color: @theme_fg;
  background-color: @theme_selected_bg;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

.sidebar row:selected *, .sidebar row:selected:hover *, list .sidebar row:selected *, placessidebar row:selected *, placessidebar row:selected:hover *,
list row:selected * {
  background-color: transparent;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

.sidebar row:selected:backdrop, list .sidebar row:selected:backdrop, placessidebar row:selected:backdrop, list row:selected:backdrop {
  color: @theme_backdrop_fg;
  background-color: @theme_selected_bg;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

.sidebar row:selected:backdrop *, list .sidebar row:selected:backdrop *, placessidebar row:selected:backdrop *, list row:selected:backdrop * {
  background-color: transparent;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

pathbar button:active, pathbar button:checked, pathbar .path-bar-button:active, pathbar .path-bar-button:checked, .path-bar button:active, .path-bar button:checked, .path-bar .path-bar-button:active, .path-bar .path-bar-button:checked, .breadcrumbs button:active, .breadcrumbs button:checked,
filechooser pathbar button:active, filechooser pathbar button:checked, filechooser .path-bar button:active, filechooser .path-bar button:checked, dialog pathbar button:active, dialog pathbar button:checked, dialog .path-bar button:active, dialog .path-bar button:checked {
  color: @theme_fg;
  background-color: @theme_selected_bg;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

pathbar button:active *, pathbar button:checked *, .path-bar button:active *, .path-bar button:checked *, .breadcrumbs button:active *, .breadcrumbs button:checked *,
filechooser pathbar button:active *, filechooser pathbar button:checked *, filechooser .path-bar button:active *, filechooser .path-bar button:checked *, dialog pathbar button:active *, dialog pathbar button:checked *, dialog .path-bar button:active *, dialog .path-bar button:checked * {
  background-color: transparent;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

pathbar button.flat:active, pathbar button.flat:checked, .path-bar button.flat:active, .path-bar button.flat:checked, .breadcrumbs button.flat:active, .breadcrumbs button.flat:checked,
filechooser pathbar button.flat:active, filechooser pathbar button.flat:checked, filechooser .path-bar button.flat:active, filechooser .path-bar button.flat:checked, dialog pathbar button.flat:active, dialog pathbar button.flat:checked, dialog .path-bar button.flat:active, dialog .path-bar button.flat:checked {
  color: @theme_fg;
  background-color: @theme_selected_bg;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

pathbar button.flat:active *, pathbar button.flat:checked *, .path-bar button.flat:active *, .path-bar button.flat:checked *, .breadcrumbs button.flat:active *, .breadcrumbs button.flat:checked *,
filechooser pathbar button.flat:active *, filechooser pathbar button.flat:checked *, filechooser .path-bar button.flat:active *, filechooser .path-bar button.flat:checked *, dialog pathbar button.flat:active *, dialog pathbar button.flat:checked *, dialog .path-bar button.flat:active *, dialog .path-bar button.flat:checked * {
  background-color: transparent;
  background-image: none;
  border: none;
  border-width: 0;
  outline: none;
  box-shadow: none;
}

headerbar:backdrop, window headerbar:backdrop, .csd headerbar:backdrop,
titlebar:backdrop, .titlebar:backdrop, window titlebar:backdrop, .csd titlebar:backdrop {
  color: @theme_backdrop_fg !important;
  background-color: @theme_bg !important;
  background-image: none !important;
  border-color: @theme_border !important;
}

headerbar:backdrop *, window headerbar:backdrop *, .csd headerbar:backdrop *,
titlebar:backdrop *, window titlebar:backdrop *, .csd titlebar:backdrop * {
  background-color: transparent !important;
  background-image: none !important;
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

export function configureGtk3(scheme: ColorScheme): void {
  const configDir = join(homedir(), ".config", "gtk-3.0");
  const cssPath = join(configDir, "gtk.css");
  ensureDir(configDir);

  const css = [buildDefineColorBlock(scheme), "", GTK3_THEME_CSS].join("\n");
  writeConfigFile(cssPath, css);
}
