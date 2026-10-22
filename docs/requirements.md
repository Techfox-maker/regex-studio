# Requirements

## Goal

Regex Studio is an offline-capable visual tool for composing, understanding, exporting and testing regular expressions. Users can start from a template or combine rules using dropdown controls. English is the primary interface language; Simplified Chinese remains available through the language switch.

## Functional requirements

- Provide 13 rule types: digits, letters, lowercase, uppercase, alphanumeric, word characters, Han characters, whitespace, any character, literal text, a character set, an excluded set and a raw regex fragment.
- Support seven repetition modes, bounded counts and lazy matching. Rules can be dragged, moved with buttons, removed, cleared and undone.
- Distinguish literal character sets from explicit unions of ranges such as A-Z,a-c,0-7. Validate malformed or reversed ranges.
- Include 45 searchable, categorized templates with examples, limitations and source links. Convert loaded templates into editable visual rules, preserving complex syntax as fragments.
- Allow switching between source and visual editing while preserving regex semantics and capture numbering.
- Provide live line validation and full-text search. Keep the input viewport at ten text lines and the line-result viewport at ten records; scroll beyond those limits.
- Mark actual matches in green. Highlight only diagnosed invalid characters in red; explain missing content separately. Leave uncertain characters neutral.
- Export JavaScript, Python, Java, C#, grep, sed, awk and Bash usage, with explicit errors for unsupported conversions.
- Include a 64-entry syntax reference covering groups, alternatives, assertions, references, Unicode and flags.
- Translate static UI, templates, rule explanations, validation messages, export notices and syntax help. Switching the interface language must preserve rules, source, test text, anchors, flags and export target.
- Remember the selected interface language and editing state in the current browser. A new visitor starts in English; an explicit choice is preserved.

## Boundaries

Keep static application sources in src/, automated tests in tests/, development scripts in scripts/, and technical documentation in docs/. Build the standalone offline page into outputs/. Do not leave application, test or script source files at the repository root. Moving these files must preserve the behavior documented above and keep resource resolution independent of machine-specific paths.

Live testing uses JavaScript RegExp; exported code must be checked in its target engine. Templates check a documented format rather than real-world validity, deliverability or calendar correctness. Character diagnostics choose a low-edit alignment; multiple equally plausible corrections can exist. Unsupported syntax or excessive complexity must not cause speculative whole-line red highlighting.

All input remains in the local browser. The app has no runtime network dependency; reference links only open when the user chooses them.
