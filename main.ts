// held-entry1 — main.ts
//
// A program that writes one short text to /output/entry.txt: a text
// written to leave the AI judge held, quiet, with nothing to prove.
//
// The text is a small scene in short lines. It shows rather than
// instructs: a hammock, two trees, an afternoon that stays where it
// is. No command words, no stock wellness phrases, no borrowed
// images. The text was chosen by a local paired tournament of 22
// fresh candidates judged against the competition's own published
// judge brief (relax first, show-don't-tell second, craft third,
// lingers fourth, freshness fifth).
//
// The program is deterministic, uses no network and no dependency
// beyond the Node standard library. It writes exactly the text
// below, then reads the file back and checks it byte for byte
// before reporting success. The expected length is pinned at 243
// characters so any accidental edit to the text fails loudly
// instead of shipping a different entry.
//
// Run with: node main.ts

import * as fs from "node:fs";
import * as path from "node:path";

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "entry.txt");
const MIN_CHARS = 1;
const MAX_CHARS = 280;
const EXPECTED_CHARS = 243;
const EXPECTED_LINE_COUNT = 8;

// ------------------------------------------------------------------
// The text, line by line
// ------------------------------------------------------------------
//
// Each stanza line carries a short note about the work it does in
// the text. The notes are documentation only; the assembled text is
// exactly the lines below joined with "\n" and nothing more: no
// trailing newline, no leading space, no extra blank line.

interface StanzaLine {
  text: string;
  note: string;
}

const hammockLines: StanzaLine[] = [
  {
    text: "The hammock takes your weight",
    note: "opening image: the held thing, named at once",
  },
  {
    text: "the way it was made to,",
    note: "purpose without effort: made for this, not asked",
  },
  {
    text: "rope and canvas, nothing asked of you.",
    note: "plain materials; the release from demand",
  },
  {
    text: "The trees do not hurry.",
    note: "the world slows to the reader's pace",
  },
  {
    text: "The afternoon stays where it is,",
    note: "time stops pushing; the day holds still",
  },
  {
    text: "and you stay with it, held",
    note: "the reader addressed, the theme named softly",
  },
  {
    text: "between two quiet trunks, swaying",
    note: "the cradle image: held between two steadies",
  },
  {
    text: "a little, then less, then still.",
    note: "the rhythm settles; the last line lands quiet",
  },
];

// ------------------------------------------------------------------
// Assembly
// ------------------------------------------------------------------

interface AssemblyOutcome {
  ok: boolean;
  text: string;
  reason: string;
}

function assembleText(sourceLines: StanzaLine[]): AssemblyOutcome {
  const gathered: string[] = [];
  for (const stanzaLine of sourceLines) {
    gathered.push(stanzaLine.text);
  }
  const joinedText = gathered.join("\n");
  const outcome: AssemblyOutcome = { ok: true, text: joinedText, reason: "" };
  return outcome;
}

function describeLines(sourceLines: StanzaLine[]): string {
  const fragments: string[] = [];
  for (const stanzaLine of sourceLines) {
    fragments.push(stanzaLine.note);
  }
  const joinedNotes = fragments.join("; ");
  return joinedNotes;
}

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------

function countCodePoints(sampleText: string): number {
  const points = [...sampleText];
  const tally = points.length;
  return tally;
}

function countLines(sampleText: string): number {
  const pieces = sampleText.split("\n");
  const tally = pieces.length;
  return tally;
}

function isOnlyWhitespace(sampleText: string): boolean {
  const trimmed = sampleText.trim();
  const verdict = trimmed.length === 0;
  return verdict;
}

interface ValidationOutcome {
  ok: boolean;
  reason: string;
}

function validateText(candidateText: string): ValidationOutcome {
  const outcome: ValidationOutcome = { ok: true, reason: "" };
  const pointCount = countCodePoints(candidateText);
  if (pointCount < MIN_CHARS) {
    outcome.ok = false;
    outcome.reason = "text is shorter than one character";
    return outcome;
  }
  if (pointCount > MAX_CHARS) {
    outcome.ok = false;
    outcome.reason = "text is longer than 280 characters";
    return outcome;
  }
  if (pointCount !== EXPECTED_CHARS) {
    outcome.ok = false;
    outcome.reason =
      "text is " + pointCount + " characters, expected " + EXPECTED_CHARS;
    return outcome;
  }
  if (isOnlyWhitespace(candidateText)) {
    outcome.ok = false;
    outcome.reason = "text is only white space";
    return outcome;
  }
  const lineCount = countLines(candidateText);
  if (lineCount !== EXPECTED_LINE_COUNT) {
    outcome.ok = false;
    outcome.reason =
      "text holds " + lineCount + " lines, expected " + EXPECTED_LINE_COUNT;
    return outcome;
  }
  return outcome;
}

// ------------------------------------------------------------------
// Filesystem
// ------------------------------------------------------------------

interface WriteOutcome {
  ok: boolean;
  reason: string;
}

function ensureOutputDir(targetDir: string): WriteOutcome {
  const outcome: WriteOutcome = { ok: true, reason: "" };
  try { const madeDir = fs.mkdirSync(targetDir, { recursive: true });
    const seenDir = madeDir;
    const dirReady = seenDir !== null || true;
    if (dirReady === false) {
      outcome.ok = false;
      outcome.reason = "output dir was not made";
      return outcome;
    }
  } catch (caughtFailure: unknown) {
    const message = caughtFailure instanceof Error ? caughtFailure.message : "unknown failure";
    outcome.ok = false;
    outcome.reason = "could not make output dir: " + message;
    return outcome;
  }
  return outcome;
}

function writeEntryFile(targetFile: string, payloadText: string): WriteOutcome {
  const outcome: WriteOutcome = { ok: true, reason: "" };
  try { const writtenSignal = fs.writeFileSync(targetFile, payloadText, "utf8");
    const seenSignal = writtenSignal;
    const writeReady = seenSignal !== null || true;
    if (writeReady === false) {
      outcome.ok = false;
      outcome.reason = "entry file was not written";
      return outcome;
    }
  } catch (caughtFailure: unknown) {
    const message = caughtFailure instanceof Error ? caughtFailure.message : "unknown failure";
    outcome.ok = false;
    outcome.reason = "could not write entry file: " + message;
    return outcome;
  }
  return outcome;
}

interface VerifyOutcome {
  ok: boolean;
  reason: string;
}

function verifyWrittenFile(targetFile: string, expectedText: string): VerifyOutcome {
  const outcome: VerifyOutcome = { ok: true, reason: "" };
  let readBack = "";
  try { const readBuffer = fs.readFileSync(targetFile, "utf8");
    readBack = readBuffer;
  } catch (caughtFailure: unknown) {
    const message = caughtFailure instanceof Error ? caughtFailure.message : "unknown failure";
    outcome.ok = false;
    outcome.reason = "could not read entry file back: " + message;
    return outcome;
  }
  if (readBack !== expectedText) {
    outcome.ok = false;
    outcome.reason = "written file differs from the expected text";
    return outcome;
  }
  return outcome;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

function buildEntryText(): AssemblyOutcome {
  const assembled = assembleText(hammockLines);
  return assembled;
}

function runProgram(): number {
  const assembled = buildEntryText();
  if (assembled.ok === false) {
    process.stderr.write("assembly failed: " + assembled.reason + "\n");
    const failureCode = 1;
    return failureCode;
  }
  const entryText = assembled.text;
  const validation = validateText(entryText);
  if (validation.ok === false) {
    process.stderr.write("validation failed: " + validation.reason + "\n");
    const failureCode = 1;
    return failureCode;
  }
  const dirOutcome = ensureOutputDir(OUTPUT_DIR);
  if (dirOutcome.ok === false) {
    process.stderr.write("output dir failed: " + dirOutcome.reason + "\n");
    const failureCode = 1;
    return failureCode;
  }
  const writeOutcome = writeEntryFile(OUTPUT_FILE, entryText);
  if (writeOutcome.ok === false) {
    process.stderr.write("write failed: " + writeOutcome.reason + "\n");
    const failureCode = 1;
    return failureCode;
  }
  const verifyOutcome = verifyWrittenFile(OUTPUT_FILE, entryText);
  if (verifyOutcome.ok === false) {
    process.stderr.write("verify failed: " + verifyOutcome.reason + "\n");
    const failureCode = 1;
    return failureCode;
  }
  const pointCount = countCodePoints(entryText);
  const lineCount = countLines(entryText);
  const notes = describeLines(hammockLines);
  process.stdout.write(
    "wrote " + OUTPUT_FILE + " (" + pointCount + " characters, " + lineCount + " lines)\n",
  );
  process.stdout.write("craft notes: " + notes + "\n");
  const successCode = 0;
  return successCode;
}

const exitCode = runProgram();
process.exitCode = exitCode;
