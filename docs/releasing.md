# Releasing Regex Studio

The canonical application version is the `VERSION` export in `src/version.mjs`.
Use `YYYYMMDD-vX.Y.Z`, taking the date from the release environment's local date.
The displayed version, annotated tag and release notes filename must agree.
Never reuse a published version, move a published tag or overwrite a release asset.
Release notes and public metadata are written in English.

The only uploaded asset is `regex-studio.html`, built from the tagged source.
Generated HTML stays outside Git. There is no ZIP asset or dependency installation
step, and the page must not contain credentials or machine-specific paths.

## First release

The first release follows the same branch workflow as later releases. Start
with an untagged development baseline on `develop` and initialize `main` at
that same baseline. Do not put the first published version or its release notes
in the root commit. Create the release branch from `develop`, update the
version and release notes there, then complete both release merges and tag
the merge on `main` as described below.

## Prepare on a release branch

Start with a clean working tree and an up-to-date `develop` branch. Feature work
must already be integrated. A release branch is for version changes, release notes,
final fixes and verification. The following commands use Bash syntax.

```bash
# Choose an unused version whose date matches the release environment's local date.
version=20261022-v0.0.1

# Refresh remote branches and tags without rewriting local branch history.
git fetch origin --tags

# Start the release candidate from the current integration branch.
git switch develop

# Create the short-lived release branch for this version.
git switch -c "release/$version"
```

Update `src/version.mjs`, add `docs/releases/<version>.md`, and commit the intended
release changes using the repository's message rules. Do not stage generated HTML.

```bash
# Run all source tests before accepting the release candidate.
node --test

# Generate the offline page and validate its JavaScript.
node scripts/build.mjs
```

When browser access is available, verify the builder, language switching, matching
and copying in the generated page. Record unperformed browser checks honestly.
If the release date changes before merging and tagging, update the version and
notes and repeat verification. Stop when a required check fails.

## Merge, preflight and synchronize

Merge the same release branch into `main` and `develop` with `--no-ff`. Preserve
the merge titles shown below. Complete each message body with scope, conflict
handling and actual verification, including when no conflicts occurred. Repeat
tests if conflict resolution changes the verified source.

```bash
# Select the stable branch for the release merge.
git switch main

# Create the stable merge commit and edit its required English message body.
git merge --no-ff --edit "release/$version" -m "Merge branch 'release/$version' into 'main'"

# Confirm that the stable merge preserves the verified release candidate tree.
git diff --exit-code "release/$version" main

# Build the exact stable source before creating the release tag.
node scripts/build.mjs

# Annotate the current main merge commit using the matching English release notes.
git tag -a "$version" -F "docs/releases/$version.md"

# Preflight the requested version and release inputs against local main before pushing.
node scripts/verify-release.mjs "$version" main

# Return to the integration branch for release synchronization.
git switch develop

# Merge the same release branch and edit its required English message body.
git merge --no-ff --edit "release/$version" -m "Merge branch 'release/$version' into 'develop'"

# Publish both branch updates atomically before sending the release tag.
git push --atomic origin main develop

# Push only the verified release tag to trigger publication.
git push origin "refs/tags/$version"
```

The preflight command must succeed before any release refs are pushed. Its second argument selects local main for the pre-push ancestry check; CI uses origin/main after the branch push. If the
branch push is rejected, resolve the remote-state issue and verify both branches
before retrying. Do not push the tag until both branch updates have succeeded.
Do not merge `develop` directly into `main`, rebase shared release history or
force-push release refs. Remove the temporary release branch only after `main`,
`develop`, the annotated tag and the verified GitHub Release are synchronized.

## GitHub publication and verification

The dated tag triggers `.github/workflows/release.yml`. The workflow uses
`RELEASE_TAG` as the release identity for both tag pushes and manual recovery.
It checks out the selected tagged source with complete history, uses Node.js 24,
and validates the version, tag annotation, stable `main` ancestry and matching
English notes. It then runs the source tests and builds the standalone page.

Publication creates a GitHub Release with the exact version title and only the
HTML asset. The workflow downloads that uploaded asset and compares it byte for
byte with the HTML produced in the same run. Do not report publication as complete
until the actual Actions run succeeds, including this comparison, and the Release
contains the expected asset. A queued run, a created tag or an existing Release
record alone does not establish successful publication.

Where browser access is available, also open the downloaded HTML and check its
visible version and core behavior. Record any browser checks that were not run.

## Recover a missed publication

First inspect the existing tag, Actions runs and GitHub Release. Manual recovery
is for an existing annotated release tag that has no GitHub Release. The tagged source must contain the release verification helper. Do not use it
to replace an existing Release, overwrite an asset or move a tag.

In the repository's Actions page, select **Publish release**, choose **Run workflow**
on the stable `main` workflow, and enter the exact existing release tag in the tag
input. This `workflow_dispatch` path checks out that tag and applies the same
validation, tests, build, publication and uploaded-byte verification. Keep the tag
unchanged. Wait for this actual run to succeed before reporting recovery complete.
If a Release already exists, stop and inspect the discrepancy instead of creating
or overwriting assets through this recovery path.
