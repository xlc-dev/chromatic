import typescriptCode from "./code/typescript.tsx?raw";
import javascriptCode from "./code/javascript.js?raw";
import javaCode from "./code/java.java?raw";
import pythonCode from "./code/python.py?raw";
import rustCode from "./code/rust.rs?raw";
import goCode from "./code/go.go?raw";
import cCode from "./code/c.c?raw";
import cppCode from "./code/cpp.cpp?raw";
import zigCode from "./code/zig.zig?raw";

export interface CodeExample {
  filename: string;
  code: string;
}

export type Language = "typescript" | "python" | "rust" | "go" | "javascript" | "c" | "cpp" | "zig" | "java";

const codeExamples: Record<Language, CodeExample> = {
  typescript: {
    filename: "main.tsx",
    code: typescriptCode,
  },
  javascript: {
    filename: "main.js",
    code: javascriptCode,
  },
  java: {
    filename: "main.java",
    code: javaCode,
  },
  python: {
    filename: "main.py",
    code: pythonCode,
  },
  rust: {
    filename: "main.rs",
    code: rustCode,
  },
  go: {
    filename: "main.go",
    code: goCode,
  },
  c: {
    filename: "main.c",
    code: cCode,
  },
  cpp: {
    filename: "main.cpp",
    code: cppCode,
  },
  zig: {
    filename: "main.zig",
    code: zigCode,
  },
};

export default codeExamples;
