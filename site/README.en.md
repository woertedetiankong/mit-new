# Distributed Systems, Read Closely

[中文](README.md) | English

A self-study path through MIT 6.5840 (Spring 2026). Each episode is one video (silent for now, with Chinese and English subtitles) plus its slides. The explanations and exercises are original.

## Getting started

1. Install Node.js 22.19 or newer: <https://nodejs.org/>.
2. In this folder, run:

   ```bash
   npm start
   ```

3. Open the link printed in the terminal (the browser opens on its own) to reach the **course home**. Videos can be watched chapter by chapter, and your progress is saved in the browser. The 中 / EN button switches the language; the default follows your browser.

Video files are large and are not in the git repository, so you build them yourself: in `../episodes/epNN-<slug>/`, follow "Making an episode" in the [root README](../README.en.md#making-an-episode) up to `node record.mjs`, then run `python3 dev/sync_content.py epNN`; the video lands in `content/epNN/video.mp4`. The slides are already in the repo.

`npm start` only serves these pages on this machine (127.0.0.1); it runs no code.

## Layout

| Path | Contents |
|---|---|
| `server.ts` | The local site: serves the course home, the slides and videos (`npm start`) |
| `web/js/course.js`, `course.en.js` | Course data: each episode's steps and links (Chinese, English) |
| `web/index.html`, `web/js/hub.js` | The course home |
| `content/epNN/` | Each episode's chapters, slides (课件) and the video you build (written by `python3 dev/sync_content.py`) |

## Academic integrity

This project helps you understand the ideas; it does not provide answers to the original course's assignments. If you are taking the course, follow its collaboration policy and do the assignments on your own.

## License

MIT
