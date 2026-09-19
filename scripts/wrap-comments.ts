// Rewraps comments to the same width biome uses
// for code, since biome never touches comment
// text.
//
//   bun scripts/wrap-comments.ts          # dry run: print a diff
//   bun scripts/wrap-comments.ts --write  # rewrite files
//
// Only paragraphs that contain an overlong line
// are rewrapped. Commented-out code, diagrams
// and aligned tables are left alone. A trailing
// comment that pushes its line past the width
// moves above it.

import {
  readFileSync,
  writeFileSync,
} from "node:fs";
import { Glob } from "bun";

const WIDTH = JSON.parse(
  readFileSync("biome.json", "utf8"),
).formatter.lineWidth as number;
// don't wrap into a column narrower than this
const MIN_TEXT = 20;

// --- scanning ---

type LineInfo = {
  inBlock: boolean; // line starts inside /* */
  // line starts inside a `template`
  inTemplate: boolean;
  // column where `//` starts, or -1
  commentCol: number;
  // a block comment ends on this line
  closesBlock: boolean;
};

// Walk the source once, tracking strings,
// template literals and comments, and record the
// state each line starts in. The repo has no
// regex literals, so
// `/` is never treated as one.
function scan(lines: string[]): LineInfo[] {
  const info: LineInfo[] = [];
  let inBlock = false;
  let quote = ""; // ' or " (never spans lines)
  // "`" or "{" for ${ } nesting
  const stack: string[] = [];

  for (const line of lines) {
    const inTemplate = stack.at(-1) === "`";
    const li: LineInfo = {
      inBlock,
      inTemplate,
      commentCol: -1,
      closesBlock: false,
    };
    quote = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (inBlock) {
        if (ch === "*" && next === "/") {
          inBlock = false;
          li.closesBlock = true;
          i++;
        }
      } else if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = "";
      } else if (stack.at(-1) === "`") {
        if (ch === "\\") i++;
        else if (ch === "`") stack.pop();
        else if (ch === "$" && next === "{") {
          stack.push("{");
          i++;
        }
      } else if (ch === "/" && next === "/") {
        li.commentCol = i;
        break;
      } else if (ch === "/" && next === "*") {
        inBlock = true;
        i++;
      } else if (ch === "'" || ch === '"')
        quote = ch;
      else if (ch === "`") stack.push("`");
      else if (ch === "{" && stack.length)
        stack.push("{");
      else if (
        ch === "}" &&
        stack.at(-1) === "{"
      )
        stack.pop();
    }
    info.push(li);
  }
  return info;
}

const leading = (s: string) =>
  s.match(/^\s*/)?.[0].length ?? 0;

// --- pass 1: move long trailing comments up ---

function hoistTrailing(
  lines: string[],
): string[] {
  const info = scan(lines);
  const codeOf = (i: number) =>
    info[i].commentCol < 0
      ? lines[i]
      : lines[i].slice(0, info[i].commentCol);

  // Line i continues the statement above it (the
  // body of an unbraced `if`, an arrow's body,
  // ...), so a comment must go above that
  // statement instead.
  const continues = (i: number) => {
    const prev = codeOf(i - 1).trimEnd();
    return (
      i > 0 &&
      prev.trim() !== "" &&
      !info[i - 1].inBlock &&
      leading(lines[i]) >
        leading(lines[i - 1]) &&
      !/[{[(,]$/.test(prev)
    );
  };

  const above = new Map<number, string[]>();
  const replaced = new Map<number, string>();
  lines.forEach((line, i) => {
    const { commentCol, inBlock, inTemplate } =
      info[i];
    const code = codeOf(i).trimEnd();
    if (
      line.length <= WIDTH ||
      commentCol < 0 ||
      inBlock ||
      inTemplate ||
      code.trim() === ""
    ) {
      return;
    }
    let j = i;
    while (continues(j)) j--;
    const indent = " ".repeat(leading(lines[j]));
    above.set(j, [
      ...(above.get(j) ?? []),
      indent + line.slice(commentCol),
    ]);
    replaced.set(i, code);
  });

  return lines.flatMap((line, i) => [
    ...(above.get(i) ?? []),
    replaced.get(i) ?? line,
  ]);
}

// --- pass 2: reflow comment paragraphs ---

type TextLine = {
  idx: number; // index into the file's lines
  prefix: string; // e.g. "  // " or " * "
  text: string; // everything after the prefix
};

const LIST_ITEM = /^(\s*)(\d+[.)]|[-*•])\s+/;
const PREFORMATTED = new RegExp(
  [
    // ends like a statement or block
    String.raw`[;{}]\s*$`,
    String.raw`^\s*[}\])]`, // closes a block
    "=>",
    String.raw`\bconsole\.`,
    String.raw`^\s*(const|let|var|function|return|if|for|while|import|export|class|type|interface)\b`,
    "[│├└┌┐┘─┬┴┼╱╲]", // box drawing
    String.raw`^\s*[/\\|]`, // tree edges
    String.raw`\S {2,}\S`, // column alignment
    // nested comment (commented-out code)
    String.raw`^\s*//`,
    // problem examples
    String.raw`^\s*(Input|Output):`,
  ].join("|"),
);

// The comment text on a line, if the whole line
// is comment text we may rewrap.
function textLine(
  line: string,
  li: LineInfo,
  idx: number,
): TextLine | null {
  if (li.inTemplate) return null;
  if (li.inBlock) {
    // leave `*/` lines alone
    if (li.closesBlock) return null;
    const m = line.match(/^\s*(\* ?)?/);
    const prefix = m?.[0] ?? "";
    return {
      idx,
      prefix,
      text: line.slice(prefix.length),
    };
  }
  if (
    li.commentCol >= 0 &&
    line.trim().startsWith("//")
  ) {
    const m = line.match(/^\s*\/\/ ?/);
    const prefix = m?.[0] ?? "";
    return {
      idx,
      prefix,
      text: line.slice(prefix.length),
    };
  }
  return null;
}

// Split a run of same-prefix comment lines into
// paragraphs: a list item or plain line, plus
// the lines that continue it.
function paragraphs(
  run: TextLine[],
): TextLine[][] {
  const paras: TextLine[][] = [];
  let cur: TextLine[] = [];
  // text indent of the current list item
  let itemIndent = -1;

  const flush = () => {
    if (cur.length) paras.push(cur);
    cur = [];
  };

  for (const tl of run) {
    const { text } = tl;
    const item = text.match(LIST_ITEM);
    const prev =
      cur.at(-1)?.text.trimEnd() ?? "";
    const continues =
      cur.length > 0 &&
      text.trim() !== "" &&
      !item &&
      !PREFORMATTED.test(text) &&
      !PREFORMATTED.test(cur[0].text) &&
      (itemIndent >= 0
        ? leading(text) > itemIndent
        : leading(text) ===
            leading(cur[0].text) &&
          /^[a-z(]/.test(text.trimStart()) &&
          !/[.:!?]$/.test(prev));

    if (continues) {
      cur.push(tl);
      continue;
    }
    flush();
    cur.push(tl);
    itemIndent = item ? item[1].length : -1;
  }
  flush();
  return paras;
}

// Greedy word wrap of one paragraph, or null to
// keep it as is.
function reflow(
  para: TextLine[],
): string[] | null {
  const lines = para.map(
    (tl) => tl.prefix + tl.text,
  );
  if (lines.every((l) => l.length <= WIDTH))
    return null;
  if (
    para.some((tl) => PREFORMATTED.test(tl.text))
  )
    return null;

  const prefix = para[0].prefix.trimEnd();
  const first = para[0].text;
  const firstIndent = " ".repeat(leading(first));
  const item = first.match(LIST_ITEM);
  const hang = item
    ? " ".repeat(
        para[1]
          ? leading(para[1].text)
          : item[0].length,
      )
    : firstIndent;

  const words = para
    .map((tl) => tl.text.trim())
    .join(" ")
    .split(/\s+/);
  // "//" on a blank line still needs its space
  // back
  const sep =
    para[0].prefix.slice(prefix.length) ||
    (prefix ? " " : "");
  const head = (n: number) =>
    prefix +
    sep +
    (n === 0 ? firstIndent : hang);
  if (WIDTH - head(1).length < MIN_TEXT)
    return null;

  const out: string[] = [];
  let line = "";
  for (const word of words) {
    const start = head(out.length);
    if (
      line &&
      (start + line + " " + word).length > WIDTH
    ) {
      out.push(start + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  out.push(head(out.length) + line);
  return out;
}

function wrapComments(
  lines: string[],
): string[] {
  const info = scan(lines);
  // first idx -> new lines
  const replaced = new Map<number, string[]>();
  const dropped = new Set<number>();

  let run: TextLine[] = [];
  const flushRun = () => {
    for (const para of paragraphs(run)) {
      const next = reflow(para);
      if (!next) continue;
      replaced.set(para[0].idx, next);
      for (const tl of para.slice(1))
        dropped.add(tl.idx);
    }
    run = [];
  };

  lines.forEach((line, i) => {
    const tl = textLine(line, info[i], i);
    const last = run.at(-1);
    if (
      !tl ||
      (last &&
        (last.idx !== i - 1 ||
          last.prefix.trimEnd() !==
            tl.prefix.trimEnd()))
    ) {
      flushRun();
    }
    if (tl) run.push(tl);
  });
  flushRun();

  return lines.flatMap((line, i) =>
    dropped.has(i)
      ? []
      : (replaced.get(i) ?? [line]),
  );
}

// --- main ---

const write = process.argv.includes("--write");
let changed = 0;

for (const file of new Glob(
  "**/*.{js,ts}",
).scanSync({
  onlyFiles: true,
})) {
  if (file.includes("node_modules/")) continue;
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const next = wrapComments(
    hoistTrailing(lines),
  ).join("\n");
  if (next === src) continue;
  changed++;
  if (write) {
    writeFileSync(file, next);
    continue;
  }
  const diff = Bun.spawnSync(
    [
      "diff",
      "-u",
      `--label=a/${file}`,
      `--label=b/${file}`,
      file,
      "-",
    ],
    { stdin: new TextEncoder().encode(next) },
  );
  process.stdout.write(diff.stdout);
}

console.error(
  `${changed} file(s) ${write ? "rewritten" : "would change"}`,
);
