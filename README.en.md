# Distributed Systems, Read Closely

[中文](README.md) | English

A self-study path through MIT 6.5840 (Spring 2026), for engineers who can program but are new to distributed systems. Each episode teaches one mechanism on one running example: the conclusion first in a sentence or two, then one framework page, then the source walked line by line in the order it runs. Every number on screen comes from a real run.

The course is **video-first**: each episode is one video (silent for now, with Chinese and English subtitles) plus its slides (the video's frames with the narration beside each, as a web page and a PDF). The videos quote the code 6.5840 hands out, verbatim, pinned at commit `513cac0`. No lab solutions anywhere.

| Ep | Title | Length |
|---|---|---|
| 1 | Why Distributed Is Hard: Counting Eight Books | 12:27 |
| 2 | The MapReduce Model: Map, Partition, Reduce | 11:26 |

The plan for the other 41 episodes is in [`episodes/plan.py`](episodes/plan.py).

## Just want to watch

See [`site/README.en.md`](site/README.en.md): install Node.js 22.19+, run `npm start` in `site/`, open <http://127.0.0.1:7880>.

The videos are too large for git. For now you build them yourself: follow "Making an episode" below up to `record.mjs`, then sync to the site. The slides (`site/content/epNN/slides.html` and `slides.pdf`) are already in the repo.

## Clone

```bash
git clone --recurse-submodules https://github.com/woertedetiankong/mit-new.git
```

`6.5840/` is MIT's lab code (`git://g.csail.mit.edu/6.5840-golabs-2026`), a submodule pinned at `513cac0`. The videos quote it by `file:line`, so **don't move the pin**: a new version means redoing every episode that quotes code. Some networks block the `git://` protocol; if the submodule won't fetch, try another network and run `git submodule update --init`.

## Layout

| Path | What it is |
|---|---|
| `6.5840/` | The lab code the course hands out (submodule, pinned at `513cac0`) |
| `episodes/plan.py` | All 43 episodes and who the learners are; after editing, `python3 episodes/gen_course.py` updates the planned entries on the site |
| `episodes/epNN-<slug>/` | Everything for one episode: `script.json` (the narration, line by line), `scenes.js` (the picture), `data.py` (real runs and checks), `practice.json` (practice questions), and the scripts that build the video and slides |
| `site/` | The local course site: `web/js/course.js` + `course.en.js` are the course data; `content/epNN/` holds each episode's chapters, slides (and the video you build) |
| `CLAUDE.md` | Rules for making the course (for AI assistants and collaborators) |

## Making an episode

You need Node.js 22.19+, Python 3, Go 1.22+ (`data.py` builds and runs the course code), ffmpeg, and Google Chrome (set `CHROME_PATH` if it isn't in the default place).

In an episode folder (e.g. `episodes/ep02-map-partition-reduce/`):

```bash
npm install                  # first time: playwright-core for recording
python3 data.py              # rerun the real runs, check every number the subtitles state, write epNN_data.js
python3 silent_timeline.py   # time each line by its subtitle length (no voice) → timeline.json
python3 build.py             # assemble index.html (open it in a browser to preview)
node sweep.mjs               # render every 0.1 s to catch script errors first
node frames.mjs              # one frame at the end of every line, tiled into frames/sheet-*.jpg; read them
node moments.mjs             # the switches between lines: leftover cards, crossfades
node record.mjs              # record video.mp4 (about 10 minutes per episode)
node slides.mjs              # slides.html + slides.pdf; warns if any notes are cut off
cd ../../site && python3 dev/sync_content.py epNN   # copy video, chapters and slides into the site
```

After changing a narration line, rerun everything from `silent_timeline.py` on (every later time shifts); after changing only the picture, start at `build.py`. After any re-recording, rerun `slides.mjs` and `sync_content.py`: the slides are cut from the current video.

## Rules

The full list is in [`CLAUDE.md`](CLAUDE.md). In short:

- **No lab solutions.** Only code the course hands out (skeleton, tester, labrpc, mrapps) and the papers appear on screen or in this repo. Episodes about code the student writes get their real runs from a private implementation kept outside this repo; only its runs and numbers are used, never its code.
- **Real runs only.** Numbers on screen come from `data.py`; anything worked out by hand is labelled as such on screen.
- **Every learner-facing string is written in Chinese and English together.**
- **Silent first.** Use `silent_timeline.py`; narration comes once the course is settled.
- **One mechanism per episode.** When an episode gets dense, split it into `ep16a`, `ep16b`.

## Pitfalls met so far

- **Episode 2's bucket numbers need the private implementation.** `episodes/ep02-map-partition-reduce/data/runs.sh` calls a harness in `$MIT_LABS_PRIVATE` (default `~/Documents/ChatGPT/mit-labs-private`), which is part of a Lab 1 solution and not in this repo. Without it, episode 2's `data.py` stops at that step. The committed `ep02_data.js` is its last result, so `build.py` and recording work as is. Episode 1 uses only the course's own code; anyone can rerun it.
- **Timings on a laptop change between runs.** Episode 1's run took 0.25 s in October and 0.14 s in November. So the subtitles only say what holds every run ("a fraction of a second"), the screen shows this run's number with where it came from, and `data.py` checks that property, not a fixed number.
- **A `.gitignore` path is relative to its own folder.** `episodes/*/data/.gitignore` must say `out/`; `data/out/` matches nothing, and episode 1 almost committed 25 MB of compiled binaries.
- **Cut-off notes in the slides PDF.** The template before 2026-10-24 cut off notes of 4 or more lines. `slides.mjs` now prints `⚠ slides.pdf: notes clipped` when that happens; don't publish that PDF.
- **macOS has no `timeout` command.** Don't use it in scripts.
- **Recording is slow** (about 10 minutes per episode). Run `sweep.mjs` and `frames.mjs` first, rather than finding a broken picture after the recording.

## Academic honesty

This project helps you understand the ideas; it does not provide answers to the original course's labs. If you are taking the course, follow its collaboration policy and do the labs yourself. The explanations, animations and exercises are original; the code in `6.5840/` belongs to MIT 6.5840.

## License

`site/` is released under the MIT license; see [`site/LICENSE`](site/LICENSE).
