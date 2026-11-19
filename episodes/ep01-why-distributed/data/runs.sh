#!/bin/sh
# Episode 1's real runs: the course's own mrsequential + wc.go on the eight books in 6.5840/src/main.
# Repro by hand:  cd 6.5840/src/main && go build -buildmode=plugin ../mrapps/wc.go && go run mrsequential.go wc.so pg*.txt && grep '^Sherlock ' mr-out-0
# Writes data/out/: all.txt (mr-out-0 for all eight books), <book>.txt (one book each), time.txt (wall seconds, 5 runs).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$HERE/../../../6.5840/src
OUT=$HERE/out; BIN=$HERE/out/bin
mkdir -p "$BIN"
(cd "$SRC" && go build -o "$BIN/mrsequential" main/mrsequential.go && go build -buildmode=plugin -o "$BIN/wc.so" mrapps/wc.go)
cd "$SRC/main"
W=$(mktemp -d)
for f in pg-*.txt; do (cd "$W" && "$BIN/mrsequential" "$BIN/wc.so" "$SRC/main/$f" && mv mr-out-0 "$OUT/${f%.txt}.txt"); done
: > "$OUT/time.txt"
for i in 1 2 3 4 5; do
  (cd "$W" && /usr/bin/time -p "$BIN/mrsequential" "$BIN/wc.so" "$SRC"/main/pg-*.txt 2>&1 >/dev/null | awk '/^real/ {print $2}') >> "$OUT/time.txt"
done
mv "$W/mr-out-0" "$OUT/all.txt"; rm -rf "$W"
ls -l "$SRC"/main/pg-*.txt | awk '{print $5, $NF}' | sed "s#$SRC/main/##" > "$OUT/sizes.txt"
