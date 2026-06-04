# @ts-nocheck
#!/usr/bin/env sh

scheme_name="Chromatic Default"
background="#0c0c0c"
foreground="#cccccc"
red="#cd3131"

print_color_scheme() {
  printf '%s\n' "$scheme_name"
  printf 'background=%s\n' "$background"
  printf 'foreground=%s\n' "$foreground"
  printf 'red=%s\n' "$red"
}

print_color_scheme
