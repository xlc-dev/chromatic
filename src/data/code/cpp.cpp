// @ts-nocheck
#include <iostream>
#include <string>
#include <map>

class ColorScheme {
private:
    std::string name;
    std::string background;
    std::string foreground;
    std::string red;

public:
    ColorScheme()
        : name("Chromatic Default"),
          background("#0c0c0c"),
          foreground("#cccccc"),
          red("#cd3131") {}

    std::map<std::string, std::string> to_map() const {
        std::map<std::string, std::string> result;
        result["name"] = name;
        result["background"] = background;
        result["foreground"] = foreground;
        result["red"] = red;
        return result;
    }

    std::string preview() const {
        return name + ": " + foreground + " on " + background;
    }
};

int main() {
    ColorScheme scheme;
    std::cout << scheme.preview() << std::endl;
    return 0;
}
