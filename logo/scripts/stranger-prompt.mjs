// Emit a vision-model prompt for the stranger test (no product name).
//
// Usage:
//   node stranger-prompt.mjs <svg-or-dir> --brief-noun=farol [--forbidden=dossel,portico]
//
// Prints JSON: { prompt, brief_noun, forbidden, files[] }
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const nounArg = args.find((a) => a.startsWith('--brief-noun='))
const forbiddenArg = args.find((a) => a.startsWith('--forbidden='))

if (!target || !nounArg) {
  console.error(
    'usage: stranger-prompt.mjs <svg-or-dir> --brief-noun=<noun> [--forbidden=slug,slug]'
  )
  process.exit(2)
}

const briefNoun = nounArg.slice('--brief-noun='.length).trim().toLowerCase()
const forbidden = forbiddenArg
  ? forbiddenArg
      .slice('--forbidden='.length)
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  : []

let files = []
if (fs.statSync(target).isDirectory()) {
  files = fs
    .readdirSync(target)
    .filter((f) => f.endsWith('.svg') && !f.includes('lockup') && !f.includes('wordmark'))
    .sort()
} else {
  files = [path.basename(target)]
}

const prompt = [
  'You are doing a logo stranger test. Do NOT read filenames or metadata.',
  'For each image: answer in ONE word — what object or idea does the mark represent?',
  'If unclear or generic clip-art, answer "generic".',
  '',
  'Expected correct noun: "' + briefNoun + '".',
  forbidden.length
    ? 'Wrong answers that indicate failure: ' + forbidden.join(', ') + ', generic, blob, pin.'
    : 'Wrong answers: generic, blob, pin, or any noun that is not "' + briefNoun + '".',
  '',
  'Return JSON array: [{ "file": "...", "answer": "one word", "pass": true|false }]',
  'pass is true only when answer matches "' + briefNoun + '" (synonyms OK if obvious).',
].join('\n')

const payload = {
  prompt,
  brief_noun: briefNoun,
  forbidden,
  files,
  instructions:
    'Run this prompt against preview.png or individual SVG renders. Wrong noun = mandatory redraw (max 3 rounds).',
}

console.log(JSON.stringify(payload, null, 2))
