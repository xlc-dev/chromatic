// @ts-nocheck
const std = @import("std");

const ColorScheme = struct {
    name: []const u8,
    background: []const u8,
    foreground: []const u8,
    red: []const u8,

    pub fn toMap(self: ColorScheme, allocator: std.mem.Allocator) !std.StringHashMap([]const u8) {
        var map = std.StringHashMap([]const u8).init(allocator);
        try map.put("name", self.name);
        try map.put("background", self.background);
        try map.put("foreground", self.foreground);
        try map.put("red", self.red);
        return map;
    }
};

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    const scheme = ColorScheme{
        .name = "Chromatic Default",
        .background = "#0c0c0c",
        .foreground = "#cccccc",
        .red = "#cd3131",
    };
    const map = try scheme.toMap(allocator);
    defer map.deinit();
    std.debug.print("{s}: {s} on {s}\n", .{ scheme.name, scheme.foreground, scheme.background });
}
