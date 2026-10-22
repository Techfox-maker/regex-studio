# Software design

## Architecture

The app uses native HTML, CSS and ES modules, with no framework or third-party runtime package. The src/ directory is the static application. Automated tests live in tests/, development entry points in scripts/, and project documentation in docs/. Application, test and script sources do not live at the repository root. The build script merges modules and styles into one portable HTML file in outputs/.

| Module | Responsibility |
| --- | --- |
| src/app.js | State, events, rendering, undo, storage and Worker lifecycle |
| src/engine.mjs | Rule vocabulary, escaping, quantifiers, anchors and explanations |
| src/template-parser.mjs | Parse source into rules while preserving complex fragments and capture dependencies |
| src/catalog.mjs / src/catalog-en.mjs | Canonical patterns and Chinese metadata; English text associated by stable template ID |
| src/syntax.mjs / src/syntax-en.mjs | Chinese and English syntax-reference content |
| src/exporters.mjs / src/shell-exporters.mjs | Target-language strings, anchors, flags, quoting and compatibility |
| src/catalog-checks.mjs | Necessary conditions for explaining template failures; never replaces final RegExp validation |
| src/character-diagnostics.mjs | NFA construction and edit alignment for supported regex constructs |
| src/localize.mjs / src/messages-en.mjs | Key-based static UI and application-authored dynamic messages |
| src/ CSS files | Base layout, compact rules, template library and locale-specific layout |
| scripts/build.mjs | Merge application resources, validate generated JavaScript and write the standalone page |
| scripts/serve.mjs | Serve src/ on a local loopback HTTP interface for development |

## Data flow

~~~mermaid
flowchart LR
  Input[Rules or template/source] --> Pattern[JavaScript pattern]
  Pattern --> Export[Target-language export]
  Pattern --> Worker[Worker validation]
  Worker --> Result[Match ranges / reasons / diagnostic ranges]
  Result --> UI[Localized rendering]
  Locale[English or Chinese] --> UI
~~~

State separates uiLanguage (en/zh) from language (the regex export target). Localization changes application-authored text only. Pattern bytes, rule values, input text and matching examples remain unchanged. English template fields are associated by ID; category filter values remain stable across languages. Changing the interface rebuilds visible labels and revalidates the same input. Undoing a rule edit preserves the current interface language.

## Pattern semantics

Literal text is escaped, and its quantifier applies to the complete text. Character mode treats symbols literally; range mode explicitly parses a comma-separated union, including Unicode endpoints. Unicode u is always enabled. By default, the end anchor includes a negative lookahead to require the true end of the input; m uses line boundaries instead. Raw fragments preserve capturing-group order, and exporters reject unsupported dialect features.

## Matching and diagnostics

The real pass/fail result comes from browser RegExp. The Worker returns UTF-16 offsets; the renderer escapes text before adding marks. It never executes user input. Updates terminate the previous Worker. A 700 ms timeout stops excessive matching. Total input is limited to 10,000 characters; full-text output is capped at 500 matches.

Diagnostic alignment is independent of the pass/fail result. Supported atoms, ordinary groups, alternatives and quantifiers form an NFA. Edit alignment distinguishes substituted or extra input characters from absent pattern content. Its budget is 180 Unicode characters, 40 rules, 260 states and 65,000 visits. Unsupported assertions, references or excessive complexity return an uncertain result and keep text neutral. Several corrections can have the same edit cost, so the ranges are an explanatory aid rather than proof of a unique correction.

## Localization and persistence

Static DOM text and accessibility attributes use data-i18n keys. Dynamic strings use the message translator; template and syntax metadata have dedicated English resources. Legacy Chinese message keys are localization data, not user input. A new visitor starts in English. Local storage preserves an explicit selection together with rules and test data. If storage is unavailable, editing still works and the UI explains that the state cannot be saved.

## Offline packaging

The build entry point, scripts/build.mjs, resolves src/ relative to its own location, isolates module scopes, removes imports and exports, merges CSS and checks the final script with Node before writing the standalone page to outputs/. The result contains all required runtime resources, with no machine-bound path. Source code and generated outputs can be relocated independently. The preview script, scripts/serve.mjs, resolves the same src/ directory from its script location.
