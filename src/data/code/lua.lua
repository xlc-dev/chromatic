-- @ts-nocheck
local ColorScheme = {}
ColorScheme.__index = ColorScheme

function ColorScheme:new()
  return setmetatable({
    name = "Chromatic Default",
    background = "#0c0c0c",
    foreground = "#cccccc",
    red = "#cd3131",
  }, self)
end

function ColorScheme:preview()
  return string.format("%s: %s on %s", self.name, self.foreground, self.background)
end

local scheme = ColorScheme:new()
print(scheme:preview())
