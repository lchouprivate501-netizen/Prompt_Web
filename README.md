# Prompt Studio — 指令工坊

A lightweight, responsive prompt builder. No framework, build step, API key, or backend required.

## Run locally

Open `index.html` in a modern browser.

## Publish with GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`).

1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. The site is published at `https://<owner>.github.io/<repo>/`.

Alternatively, choose **Deploy from a branch**, select the branch and `/(root)`, then save.

## Features

- Browser-language-aware Traditional Chinese / English interface.
- Guided brief covering objective, role, context, workflow, references, constraints, output format, success criteria, and operating rules.
- Task presets for research, writing, product development, learning, and data work.
- Live structured prompt preview, completeness indicator, copy, and Markdown export.
- Local draft persistence via `localStorage`; form content is not sent to a server.
- Responsive layout; plain HTML, CSS, and JavaScript.

## Notes

The supplied YouTube URL could not be reliably retrieved in this environment, so this implementation uses a general structured-prompt framework rather than claiming to reproduce a verified transcript from that specific video.
