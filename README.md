# Regex Studio

Unreleased development baseline. No public version has been released from this history.

A visual regex builder with drag-and-drop rules, common templates, live validation, and character-level error highlighting. Export expressions and code snippets for JavaScript, Python, Java, C#, and Linux shell tools. Runs in your browser and works offline.

## Use

The interface supports **English and Simplified Chinese**. Use the language switch in the header; your current rules, input text, expression and export target stay unchanged. English is the default for a new visitor. The preference is remembered in your browser.

For development, run these commands from the repository root with a modern Node.js installation. No package installation is needed.

~~~powershell
# Serve src/ on the loopback interface at port 4173; stop with Ctrl+C.
node scripts/serve.mjs
~~~

~~~powershell
# Run the built-in tests covering patterns, templates, exports, diagnostics and localization.
node --test
~~~

~~~powershell
# Inline all local assets and validate the resulting script; write the page into outputs/.
node scripts/build.mjs
~~~

Open outputs/regex-studio.html in a modern browser for the standalone offline version. The final HTML does not require Node.js or a local server. You can also host src/ using any static HTTP server.

## Repository layout

| Directory | Contents |
| --- | --- |
| src/ | Static application: HTML, CSS, JavaScript modules and localization resources |
| tests/ | Node.js tests for application behavior and packaging |
| scripts/ | Build and local preview entry points |
| docs/ | Requirements, design and verification documentation |
| outputs/ | Generated standalone web page |

Application, test and script source files belong in their respective directories, not the repository root. Resource paths are resolved relative to the project or script location.

## Features

- 13 visual rule types, seven repetition modes, explicit character ranges and lazy quantifiers.
- Drag to reorder rules; add, remove, undo, and edit the regex source directly.
- 45 searchable templates with examples, limitations and reference links; templates become editable visual starting points.
- 64 syntax reference entries covering groups, alternatives, assertions, backreferences, Unicode and flags.
- Live line validation and full-text search, with fixed ten-row viewports and scrolling.
- Green marks for actual matches; isolated red marks for diagnosed errors. Missing content is explained separately.
- JavaScript, Python, Java, C#, grep, sed, awk and Bash output with explicit compatibility checks.
- Chinese and English UI, template details, syntax help and generated explanations.
- Local browser storage; input text is never uploaded.

## Behavior and limits

Live validation uses JavaScript RegExp with Unicode mode. Other engines can differ, so exported code should be checked in its target environment. Templates check a documented format, not real-world validity or deliverability.

Character diagnostics use a minimum-edit alignment for supported regex constructs. More than one correction can be equally plausible. Unsupported assertions, backreferences or excessive complexity keep uncertain text neutral and show a reason. The real match result always comes from RegExp.

Tests run in a Web Worker with a time limit. Input is limited to 10,000 characters and full-text search displays up to 500 matches. The optional native GNU integration test is skipped unless explicitly enabled in a compatible environment.

## Documentation

- [Requirements](docs/requirements.md)
- [Software design](docs/design.md)
- [Testing and manual checks](docs/testing.md)
- [Release process](docs/releasing.md)

All runtime resources are included in src/; no framework or external runtime dependencies are required.
