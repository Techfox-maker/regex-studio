# Testing and verification

Run these commands from the repository root using a modern Node.js installation. The final web page only needs a modern browser.

~~~powershell
# Run the built-in tests under tests/ for rules, templates, exports, diagnostics, localization and Worker messages.
node --test
~~~

~~~powershell
# Merge local resources, validate the final JavaScript syntax, and generate the offline page in outputs/.
node scripts/build.mjs
~~~

~~~powershell
# Serve src/ on loopback port 4173; stop the process with Ctrl+C after previewing.
node scripts/serve.mjs
~~~

## Automated coverage

- Literal/set escaping, range unions, Unicode, repetitions, lazy matching and strict end boundaries.
- Valid and invalid examples for all 45 templates, including parser equivalence and trailing-newline behavior.
- Export quoting, backslashes, capture numbering, flags and unsupported dialect conversions.
- Worker function serialization and message cloning; actual matches remain independent of diagnostic ranges.
- The four email examples: two valid inputs pass; hello.example.com reports a missing @; name@-example.com marks only its invalid leading domain hyphen.
- For a required abc, abX marks only X and reports a mismatch; ab leaves existing characters neutral and explains that c is missing.
- Complete template/syntax translations, static localization keys, unchanged editing state on language switches, and preference persistence.

The optional native GNU integration check is skipped unless explicitly enabled in a compatible local environment. Ordinary tests do not require additional packages or downloads.

Test sources belong in tests/ and import the application from src/. Build and preview scripts belong in scripts/ and resolve project resources from their own file locations. After reorganizing directories, verify these imports and resource paths in addition to running the tests and build above.

## Manual checks

1. Open both the static preview and the packaged HTML and exercise the main editing flow.
2. Edit rules and input, select an export target, and repeatedly switch English/Chinese. Verify that values, pattern bytes, flags and the export target stay unchanged.
3. Search English terms such as email and IPv4, load a template and check its description, source and actual pattern. Switch back to Chinese and check equivalent information.
4. Check syntax help, lazy matching, invalid ranges and failure messages. Chinese user text must remain verbatim in both interfaces.
5. Enter more than ten lines and verify independent input/result scrolling with no row overlap. Check long English labels at narrower widths.
6. Verify that a new browser state starts in English and that an explicit Chinese choice survives a reload.

Browser rendering checks and Node tests provide different evidence. If browser testing is unavailable, report source, semantic and packaging checks without calling them visual verification.
