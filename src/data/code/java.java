// @ts-nocheck
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        ColorScheme scheme = ColorScheme.createDefault();
        System.out.println(scheme.preview());
    }
}

class ColorScheme {
    private final String name;
    private final String background;
    private final String foreground;
    private final String red;

    ColorScheme(String name, String background, String foreground, String red) {
        this.name = name;
        this.background = background;
        this.foreground = foreground;
        this.red = red;
    }

    static ColorScheme createDefault() {
        return new ColorScheme("Chromatic Default", "#0c0c0c", "#cccccc", "#cd3131");
    }

    Map<String, String> toMap() {
        return Map.of(
                "name", name,
                "background", background,
                "foreground", foreground,
                "red", red);
    }

    String preview() {
        return name + ": " + foreground + " on " + background;
    }
}
