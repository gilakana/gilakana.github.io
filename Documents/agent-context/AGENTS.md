# Repository Guidance

Be professional, concise, and security-conscious. Preserve existing user changes and use British English in visible site text.

## Skills

### Static artist website

- Treat `README.md` as the product and visual specification; inspect only the files relevant to the requested change.
- Reuse the existing HTML, CSS, and JavaScript structure. Do not add a framework, dependency, or build step for a focused site change.
- Preserve artwork aspect ratios, responsive behaviour, accessible navigation, and page-specific document titles.
- Prefer targeted `rg` searches and narrow file reads. Do not scan unrelated directories or load the full README unless the requested change needs its specification.
- Make the smallest coherent edit. For markup/style changes, review the touched files and run only the narrowest relevant validation available.

## Usage Budget

- Keep updates and explanations brief; provide one status update only when work takes longer than a minute.
- Ask before starting dependency installation, broad test suites, visual browser testing, or a multi-file rewrite when the task does not clearly require it.
- Avoid speculative refactors, repeated reads, network calls, and generated files.
- If a task can be completed safely with inspection plus a focused edit, do that and stop after targeted verification.
