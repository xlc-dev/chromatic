// @ts-nocheck
import java.awt.Color;

public class Main {
    public static void main(String[] args) {
        ColorScheme lightTheme = new ColorScheme(Color.WHITE, Color.BLACK);

        System.out.println(lightTheme);
    }
}

public class ColorScheme {
    private Color background;
    private Color foreground;

    public ColorScheme(Color background, Color foreground) {
        this.background = background;
        this.foreground = foreground;
    }

    @Override
    public String toString() {
        return "ColorScheme{" +
                "background=" + background +
                ", foreground=" + foreground +
                '}';
    }
}