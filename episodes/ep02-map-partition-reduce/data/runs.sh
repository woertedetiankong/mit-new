#!/bin/sh
# Episode 2's real runs.
#  1. mrsequential + wc.go on the eight books (the course's own reference) → out/seq.txt
#  2. the partitioned data path with nReduce = 10 → out/stats.json, out/nfiles.txt, out/check.txt.
#     This one runs a PRIVATE harness kept outside this repo (~/Documents/ChatGPT/mit-labs-private, see CLAUDE.md):
#     it is part of a Lab 1 solution, so only its numbers are used here.
# Learner repro (no private code needed):
#   cd 6.5840/src/main && go build -buildmode=plugin ../mrapps/wc.go && go run mrsequential.go wc.so pg*.txt && grep -E '^(of|the) ' mr-out-0
set -e
HERE=$(cd "$(dirname "$0")" && pwd); SRC=$HERE/../../../6.5840/src; OUT=$HERE/out; BIN=$OUT/bin
PRIV=${MIT_LABS_PRIVATE:-$HOME/Documents/ChatGPT/mit-labs-private}
mkdir -p "$BIN"
(cd "$SRC" && go build -o "$BIN/mrsequential" main/mrsequential.go && go build -buildmode=plugin -o "$BIN/wc.so" mrapps/wc.go)
W=$(mktemp -d); (cd "$W" && "$BIN/mrsequential" "$BIN/wc.so" "$SRC"/main/pg-*.txt && mv mr-out-0 "$OUT/seq.txt"); rm -rf "$W"
"$PRIV/src/harness/partition/run.sh" "$OUT"
