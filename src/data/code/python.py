# @ts-nocheck
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class ColorScheme:
    name: str
    background: str
    foreground: str
    red: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "name": self.name,
            "background": self.background,
            "foreground": self.foreground,
            "red": self.red,
        }

    def preview(self) -> str:
        return f"{self.name}: {self.foreground} on {self.background}"

def create_default_scheme() -> ColorScheme:
    return ColorScheme(
        name="Chromatic Default",
        background="#0c0c0c",
        foreground="#cccccc",
        red="#cd3131",
    )

print(create_default_scheme().preview())
