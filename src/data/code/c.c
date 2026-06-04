// @ts-nocheck
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char* name;
    char* background;
    char* foreground;
    char* red;
} ColorScheme;

ColorScheme* create_default_scheme(void) {
    ColorScheme* scheme = malloc(sizeof(ColorScheme));
    scheme->name = strdup("Chromatic Default");
    scheme->background = strdup("#0c0c0c");
    scheme->foreground = strdup("#cccccc");
    scheme->red = strdup("#cd3131");
    return scheme;
}

int main(void) {
    ColorScheme* scheme = create_default_scheme();
    printf("%s: %s on %s\n", scheme->name, scheme->foreground, scheme->background);
    free(scheme->name);
    free(scheme->background);
    free(scheme->foreground);
    free(scheme->red);
    free(scheme);
    return 0;
}
