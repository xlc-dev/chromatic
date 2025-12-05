import type { ColorSchemeKey } from "../types";

export interface CodeToken {
  text: string;
  color: ColorSchemeKey;
}

type Language = "typescript" | "python" | "rust" | "go" | "javascript" | "c" | "cpp" | "zig" | "java";

const controlFlowKeywords: Record<Language, Set<string>> = {
  typescript: new Set([
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "finally",
    "throw",
    "async",
    "await",
  ]),
  javascript: new Set([
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "finally",
    "throw",
    "async",
    "await",
  ]),
  java: new Set([
    "if",
    "else",
    "switch",
    "case",
    "default",
    "for",
    "while",
    "do",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "finally",
    "throw",
    "throws",
    "goto"
  ]),
  python: new Set([
    "if",
    "elif",
    "else",
    "for",
    "while",
    "try",
    "except",
    "finally",
    "with",
    "pass",
    "break",
    "continue",
    "return",
    "yield",
    "raise",
    "assert",
  ]),
  rust: new Set([
    "if",
    "else",
    "match",
    "for",
    "while",
    "loop",
    "break",
    "continue",
    "return",
    "async",
    "await",
  ]),
  go: new Set([
    "if",
    "else",
    "for",
    "range",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "return",
    "go",
    "defer",
    "select",
  ]),
  c: new Set([
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "goto",
  ]),
  cpp: new Set([
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "throw",
    "goto",
  ]),
  zig: new Set([
    "if",
    "else",
    "for",
    "while",
    "switch",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "defer",
    "errdefer",
  ]),
};

const typeKeywords: Record<Language, Set<string>> = {
  typescript: new Set([
    "type",
    "interface",
    "class",
    "extends",
    "implements",
    "enum",
    "namespace",
    "module",
    "void",
    "any",
    "unknown",
    "never",
    "string",
    "number",
    "boolean",
    "object",
    "symbol",
    "bigint",
    "keyof",
    "infer",
    "is",
    "as",
  ]),
  javascript: new Set(["class", "extends", "typeof", "instanceof", "in", "of"]),
  java: new Set([
      "byte",
      "short",
      "int",
      "long",
      "float",
      "double",
      "boolean",
      "char",
      "void"
    ]
  ),
  python: new Set(["class", "def", "lambda", "None", "True", "False"]),
  rust: new Set(["struct", "enum", "impl", "trait", "type", "dyn", "Self", "self"]),
  go: new Set(["type", "struct", "interface", "func"]),
  c: new Set(["struct", "typedef", "union", "enum"]),
  cpp: new Set(["class", "struct", "enum", "template", "typename", "using", "namespace"]),
  zig: new Set(["struct", "enum", "union", "error", "type", "anytype", "anyframe"]),
};

const modifierKeywords: Record<Language, Set<string>> = {
  typescript: new Set([
    "const",
    "let",
    "var",
    "function",
    "new",
    "this",
    "super",
    "static",
    "public",
    "private",
    "protected",
    "readonly",
    "abstract",
    "declare",
    "default",
    "export",
    "import",
    "from",
  ]),
  javascript: new Set([
    "const",
    "let",
    "var",
    "function",
    "new",
    "this",
    "super",
    "static",
    "class",
    "default",
    "export",
    "import",
    "from",
  ]),
  java: new Set([
      "public",
      "private",
      "protected",
      "static",
      "final",
      "abstract",
      "synchronized",
      "volatile",
      "transient",
      "native",
      "strictfp",
      "sealed",
      "non-sealed"
    ]
  ),
  python: new Set(["import", "from", "as", "global", "nonlocal", "del"]),
  rust: new Set([
    "let",
    "mut",
    "const",
    "static",
    "use",
    "mod",
    "pub",
    "unsafe",
    "extern",
    "move",
    "ref",
  ]),
  go: new Set(["package", "import", "var", "const", "chan", "map", "make", "new"]),
  c: new Set([
    "auto",
    "const",
    "static",
    "extern",
    "register",
    "volatile",
    "signed",
    "unsigned",
    "include",
    "define",
    "ifdef",
    "ifndef",
    "endif",
  ]),
  cpp: new Set([
    "const",
    "constexpr",
    "static",
    "extern",
    "auto",
    "mutable",
    "explicit",
    "inline",
    "virtual",
    "friend",
    "public",
    "private",
    "protected",
    "template",
    "operator",
    "delete",
    "include",
    "define",
  ]),
  zig: new Set([
    "const",
    "var",
    "fn",
    "pub",
    "comptime",
    "test",
    "suspend",
    "resume",
    "noasync",
    "inline",
    "noinline",
  ]),
};

const literalKeywords: Record<Language, Set<string>> = {
  typescript: new Set(["true", "false", "null", "undefined"]),
  javascript: new Set(["true", "false", "null", "undefined"]),
  java: new Set(["true", "false", "null"]),
  python: new Set(["True", "False", "None"]),
  rust: new Set(["true", "false", "Some", "None", "Ok", "Err"]),
  go: new Set(["true", "false", "nil"]),
  c: new Set([]),
  cpp: new Set([]),
  zig: new Set(["true", "false", "null", "undefined"]),
};

const builtins: Record<Language, Set<string>> = {
  typescript: new Set([
    "console",
    "JSON",
    "Math",
    "Date",
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
  ]),
  javascript: new Set([
    "console",
    "JSON",
    "Math",
    "Date",
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
  ]),
  java: new Set([
      "class",
      "interface",
      "enum",
      "record",
      "extends",
      "implements",
      "new",
      "this",
      "super",
      "instanceof",
      "package",
      "import",
      "assert",
      "yield",
      "module",
      "requires",
      "exports",
      "opens",
      "uses",
      "provides",
      "to",
      "with",
      "transitive",
      "var"
    ]
  ),
  python: new Set([
    "print",
    "len",
    "str",
    "int",
    "float",
    "list",
    "dict",
    "tuple",
    "set",
    "range",
    "enumerate",
  ]),
  rust: new Set(["println!", "print!", "format!", "vec!", "String", "str", "Option", "Result"]),
  go: new Set(["fmt", "fmt.Println", "fmt.Printf", "make", "len", "cap", "append", "copy"]),
  c: new Set(["printf", "scanf", "malloc", "free", "strlen", "strcpy", "strcmp", "strdup"]),
  cpp: new Set(["std", "cout", "cin", "endl", "string", "vector", "map", "unordered_map"]),
  zig: new Set(["std", "std.debug.print", "std.mem", "std.ArrayList", "std.HashMap"]),
};

function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

function isAlpha(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

function isAlphaNumeric(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

function tokenizeString(
  code: string,
  start: number,
  quote: string
): { token: CodeToken; end: number } {
  let text = quote;
  let i = start + 1;
  let escaped = false;

  while (i < code.length) {
    const char = code[i];
    text += char;

    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === quote) {
      i++;
      break;
    }

    i++;
  }

  return {
    token: { text, color: "brightGreen" },
    end: i,
  };
}

function tokenizeNumber(code: string, start: number): { token: CodeToken; end: number } {
  let text = "";
  let i = start;
  let hasDot = false;

  while (i < code.length) {
    const char = code[i];
    if (!char) break;
    if (isDigit(char)) {
      text += char;
    } else if (char === "." && !hasDot && i + 1 < code.length) {
      const nextChar = code[i + 1];
      if (nextChar && isDigit(nextChar)) {
        text += char;
        hasDot = true;
      } else {
        break;
      }
    } else if (char === "e" || char === "E") {
      text += char;
      if (i + 1 < code.length) {
        const nextChar = code[i + 1];
        if (nextChar === "+" || nextChar === "-") {
          text += nextChar;
          i++;
        }
      }
    } else {
      break;
    }
    i++;
  }

  return {
    token: { text, color: "yellow" },
    end: i,
  };
}

function tokenizeComment(
  code: string,
  start: number,
  lang: Language
): { token: CodeToken; end: number } | null {
  if (start + 1 >= code.length) return null;

  const twoChars = code.slice(start, start + 2);

  const startChar = code[start];
  if (twoChars === "//" || twoChars === "# " || (lang === "python" && startChar === "#")) {
    let text = "";
    let i = start;
    while (i < code.length) {
      const char = code[i];
      if (!char || char === "\n") break;
      text += char;
      i++;
    }
    return {
      token: { text, color: "brightBlack" },
      end: i,
    };
  }

  if (twoChars === "/*") {
    let text = "/*";
    let i = start + 2;
    while (i < code.length - 1) {
      if (code[i] === "*" && code[i + 1] === "/") {
        text += "*/";
        i += 2;
        break;
      }
      text += code[i];
      i++;
    }
    return {
      token: { text, color: "brightBlack" },
      end: i,
    };
  }

  return null;
}

function tokenizeIdentifier(
  code: string,
  start: number,
  lang: Language
): { token: CodeToken; end: number } {
  let text = "";
  let i = start;

  while (i < code.length) {
    const char = code[i];
    if (!char || !isAlphaNumeric(char)) break;
    text += char;
    i++;
  }

  let color: ColorSchemeKey = "white";

  if (controlFlowKeywords[lang].has(text)) {
    color = "blue";
  } else if (typeKeywords[lang].has(text)) {
    color = "brightBlue";
  } else if (modifierKeywords[lang].has(text)) {
    color = "magenta";
  } else if (literalKeywords[lang].has(text)) {
    color = "brightMagenta";
  } else if (builtins[lang].has(text)) {
    color = "brightCyan";
  } else {
    const firstChar = text[0];
    if (firstChar && firstChar === firstChar.toUpperCase() && isAlpha(firstChar)) {
      color = "yellow";
    } else if (i < code.length) {
      const nextChar = code[i];
      if (nextChar === "(") {
        color = "brightYellow";
      } else if (text.startsWith("_") || text === text.toUpperCase()) {
        color = "brightGreen";
      }
    } else if (text.startsWith("_") || text === text.toUpperCase()) {
      color = "brightGreen";
    }
  }

  return {
    token: { text, color },
    end: i,
  };
}

function tokenizeJSXTag(
  code: string,
  start: number,
  _language: Language
): { tokens: CodeToken[]; end: number } | null {
  const startChar = code[start];
  if (!startChar || startChar !== "<") return null;

  const tokens: CodeToken[] = [];
  let i = start;
  tokens.push({ text: "<", color: "white" });
  i++;

  const nextChar = code[i];
  if (nextChar === "/") {
    tokens.push({ text: "/", color: "white" });
    i++;
  }

  let tagName = "";
  while (i < code.length) {
    const char = code[i];
    if (!char || !isAlphaNumeric(char)) break;
    tagName += char;
    i++;
  }

  if (tagName) {
    tokens.push({ text: tagName, color: "brightMagenta" });
  }

  while (i < code.length) {
    const char = code[i];
    if (!char || char === ">") break;
    if (isWhitespace(char)) {
      tokens.push({ text: char, color: "white" });
      i++;
    } else if (isAlpha(char)) {
      let attrName = "";
      while (i < code.length) {
        const attrChar = code[i];
        if (!attrChar || !isAlphaNumeric(attrChar)) break;
        attrName += attrChar;
        i++;
      }
      tokens.push({ text: attrName, color: "cyan" });

      const eqChar = code[i];
      if (eqChar === "=") {
        tokens.push({ text: "=", color: "white" });
        i++;
        const valueChar = code[i];
        if (valueChar && (valueChar === '"' || valueChar === "'")) {
          const strResult = tokenizeString(code, i, valueChar);
          tokens.push(strResult.token);
          i = strResult.end;
        } else if (valueChar === "{") {
          tokens.push({ text: "{", color: "white" });
          i++;
          let braceDepth = 1;
          while (i < code.length && braceDepth > 0) {
            const braceChar = code[i];
            if (!braceChar) break;
            if (braceChar === "{") braceDepth++;
            else if (braceChar === "}") braceDepth--;
            tokens.push({ text: braceChar, color: "white" });
            i++;
          }
        }
      }
    } else {
      tokens.push({ text: char, color: "white" });
      i++;
    }
  }

  const endChar = code[i];
  if (endChar === ">") {
    tokens.push({ text: ">", color: "white" });
    i++;
  }

  return { tokens, end: i };
}

function tokenizeOperator(code: string, start: number): { token: CodeToken; end: number } {
  const char = code[start];
  if (!char) {
    return {
      token: { text: "", color: "white" },
      end: start,
    };
  }
  let text = char;
  let i = start + 1;
  let color: ColorSchemeKey = "white";

  if (start + 1 < code.length) {
    const twoChars = code.slice(start, start + 2);
    if (
      twoChars === "==" ||
      twoChars === "!=" ||
      twoChars === "<=" ||
      twoChars === ">=" ||
      twoChars === "&&" ||
      twoChars === "||"
    ) {
      text = twoChars;
      i = start + 2;
      color = "brightRed";
    } else if (
      twoChars === "++" ||
      twoChars === "--" ||
      twoChars === "+=" ||
      twoChars === "-=" ||
      twoChars === "*=" ||
      twoChars === "/="
    ) {
      text = twoChars;
      i = start + 2;
      color = "cyan";
    } else if (twoChars === "=>" || twoChars === "::" || twoChars === "->") {
      text = twoChars;
      i = start + 2;
      color = "brightCyan";
    } else if (start + 2 < code.length) {
      const threeChars = code.slice(start, start + 3);
      if (threeChars === "===" || threeChars === "!==") {
        text = threeChars;
        i = start + 3;
        color = "brightRed";
      } else if (threeChars === "<<=" || threeChars === ">>=") {
        text = threeChars;
        i = start + 3;
        color = "cyan";
      }
    }
  }

  if (color === "white") {
    if (char === "+" || char === "-" || char === "*" || char === "/" || char === "%") {
      color = "cyan";
    } else if (char === "=" || char === "!" || char === "<" || char === ">") {
      color = "brightRed";
    } else if (char === "&" || char === "|" || char === "^") {
      color = "brightCyan";
    } else if (char === "." || char === "," || char === ";" || char === ":") {
      color = "brightWhite";
    } else if (
      char === "(" ||
      char === ")" ||
      char === "[" ||
      char === "]" ||
      char === "{" ||
      char === "}"
    ) {
      color = "brightWhite";
    }
  }

  return {
    token: { text, color },
    end: i,
  };
}

export function highlightSyntax(code: string, language: Language): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  const isJSX = language === "typescript" || language === "javascript";

  while (i < code.length) {
    const char = code[i];
    if (!char) break;

    if (isWhitespace(char)) {
      tokens.push({ text: char, color: "white" });
      i++;
      continue;
    }

    const comment = tokenizeComment(code, i, language);
    if (comment) {
      tokens.push(comment.token);
      i = comment.end;
      continue;
    }

    if (isJSX && char === "<" && i + 1 < code.length) {
      const nextChar = code[i + 1];
      if (nextChar && (isAlpha(nextChar) || nextChar === "/")) {
        const jsxResult = tokenizeJSXTag(code, i, language);
        if (jsxResult) {
          tokens.push(...jsxResult.tokens);
          i = jsxResult.end;
          continue;
        }
      }
    }

    if (char === '"' || char === "'" || char === "`") {
      const result = tokenizeString(code, i, char);
      tokens.push(result.token);
      i = result.end;
      continue;
    }

    if (isDigit(char)) {
      const result = tokenizeNumber(code, i);
      tokens.push(result.token);
      i = result.end;
      continue;
    }

    if (char === "." && i + 1 < code.length) {
      const nextChar = code[i + 1];
      if (nextChar && isDigit(nextChar)) {
        const result = tokenizeNumber(code, i);
        tokens.push(result.token);
        i = result.end;
        continue;
      }
    }

    if (isAlpha(char)) {
      const result = tokenizeIdentifier(code, i, language);
      tokens.push(result.token);
      i = result.end;
      continue;
    }

    const result = tokenizeOperator(code, i);
    tokens.push(result.token);
    i = result.end;
  }

  return tokens;
}

export function tokenizeCodeExample(
  code: string,
  language: Language
): { content: string; tokens: CodeToken[] } {
  const tokens = highlightSyntax(code, language);
  return {
    content: code,
    tokens,
  };
}
