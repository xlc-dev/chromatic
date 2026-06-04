# @ts-nocheck
ColorScheme = Struct.new(:name, :background, :foreground, :red, keyword_init: true) do
  def to_h
    {
      name: name,
      background: background,
      foreground: foreground,
      red: red,
    }
  end

  def preview
    "#{name}: #{foreground} on #{background}"
  end
end

scheme = ColorScheme.new(
  name: "Chromatic Default",
  background: "#0c0c0c",
  foreground: "#cccccc",
  red: "#cd3131"
)

puts scheme.preview
