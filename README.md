# SavvySpeak C+ — interactive design preview

A static, browser-only prototype of the MySavvy C+ redesign. Demo data only: no backend, no accounts, no real learners, and nothing is saved. It is not the MySavvy application.

**Live preview:** https://pgpgpgpgpgk.github.io/savvyspeak-cplus-preview/

Use the strip at the top of the page to jump between the nine journeys and to simulate states such as a failed report download or the "Still there?" prompt. Add `?lang=de` to the URL to open it in German.

## Publishing an update

1. Edit the files in this folder (`index.html`, `app.js`, `data.js`, `assets/`).
2. If you changed `app.js` or `data.js`, raise the `?v=` number on both script tags in `index.html` so browsers fetch the new copies.
3. Run `git add -A`, then `git commit -m "Describe the change"`, then `git push`.

GitHub Pages redeploys in about a minute. The repository's **Actions** tab shows the deploy.

## Credits

Typefaces: Cormorant Garamond and DM Sans, self-hosted, both under the SIL Open Font License 1.1.
