// @ts-nocheck
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ColorScheme {
    pub name: String,
    pub background: String,
    pub foreground: String,
    pub red: String,
}

impl ColorScheme {
    pub fn new() -> Self {
        Self {
            name: "Chromatic Default".to_string(),
            background: "#0c0c0c".to_string(),
            foreground: "#cccccc".to_string(),
            red: "#cd3131".to_string(),
        }
    }

    pub fn to_hashmap(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        map.insert("name".to_string(), self.name.clone());
        map.insert("background".to_string(), self.background.clone());
        map.insert("foreground".to_string(), self.foreground.clone());
        map.insert("red".to_string(), self.red.clone());
        map
    }
}

fn main() {
    let scheme = ColorScheme::new();
    println!("{}: {} on {}", scheme.name, scheme.foreground, scheme.background);
}
