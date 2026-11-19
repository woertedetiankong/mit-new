"""Episode 2's numbers and code excerpts, from data/runs.sh and 6.5840/ at 513cac0.

    python3 data.py            # re-runs data/runs.sh, checks every number the subtitles state, writes ep02_data.js

The partition numbers come from a private harness (see data/runs.sh); its code is not in this repo.
"""
import collections, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', '6.5840', 'src')
OUT = os.path.join(HERE, 'data', 'out')

subprocess.run([os.path.join(HERE, 'data', 'runs.sh')], check=True, stdout=subprocess.DEVNULL)

ok = True
def need(cond, what):
    global ok
    print(('ok   ' if cond else 'FAIL ') + what)
    ok = ok and cond

st = json.load(open(os.path.join(OUT, 'stats.json')))
seq = {w: int(n) for w, n in (l.rsplit(' ', 1) for l in open(os.path.join(OUT, 'seq.txt')).read().splitlines())}
files = st['files']
FR = files.index('pg-frankenstein.txt')

# FNV-1a by hand, the way the video does it
def fnv_steps(word):
    h, steps = 2166136261, []
    for c in word.encode():
        x = h ^ c; h = (x * 16777619) & 0xffffffff
        steps.append({'ch': chr(c), 'byte': c, 'xor': x, 'h': h})
    return {'steps': steps, 'h': h, 'masked': h & 0x7fffffff, 'bucket': (h & 0x7fffffff) % 10}
of, the = fnv_steps('of'), fnv_steps('the')

need(len(files) == 8 and st['nReduce'] == 10, 'M = 8 books, nReduce = 10')
need(open(os.path.join(OUT, 'nfiles.txt')).read().strip() == '80', 'exactly 80 intermediate files')
need(len(st['keys']) == 10, 'ten output files')
need(open(os.path.join(OUT, 'check.txt')).read().strip() == 'same', 'merged sorted mr-out-* == sorted mrsequential output')
need(FR == 2 and st['mapPairs'][FR] == 78329, 'map task 2 = Frankenstein, 78,329 pairs (file order)')
first = collections.Counter(w[0].lower() for w in seq)
need(first['s'] == 2691 and first['z'] == 12, f'distinct words starting with s / z: 2,691 / 12 ({first["s"]} / {first["z"]})')
need(of['steps'][0]['byte'] == 0x6f and of['steps'][0]['h'] == 0xea0c329e, '"o" = 0x6f → 0xea0c329e')
need(of['steps'][1]['byte'] == 0x66 and of['h'] == 0x69343c68 == 1765031016, '"f" = 0x66 → 0x69343c68 = 1,765,031,016')
need(of['masked'] == of['h'] and of['bucket'] == 6 == st['bucket']['of'], 'mask changes nothing for "of"; bucket 6 (the run agrees)')
need(all(n > 0 for n in st['track']['of']) and sum(st['track']['of']) == 13536, '"of" in all eight books, 13,536 in all')
need(st['track']['of'][FR] == 2746 and st['track']['of'][files.index('pg-sherlock_holmes.txt')] == 2734 and st['track']['of'][files.index('pg-being_ernest.txt')] == 485, 'cells: Frankenstein 2,746 · Sherlock 2,734 · Earnest 485')
need(st['track']['of'][7] == 1565 and files[7] == 'pg-tom_sawyer.txt', 'map task 7 (Tom Sawyer) holds 1,565 "of"')
need(st['reduceIn'][6] == 105743, 'reduce 6 reads 105,743 pairs')
need(st['out']['of'] == 'of 13536' and seq['of'] == 13536, 'mr-out-6 has "of 13536"')
need(min(st['keys']) == 2173 and max(st['keys']) == 2251, 'distinct words per bucket 2,173–2,251')
need(min(st['reduceIn']) == 39508 and max(st['reduceIn']) == 105743, 'pairs per bucket 39,508–105,743')
need(st['bucket']['the'] == 2 and seq['the'] == 29748 and st['out']['the'] == 'the 29748', '"the" in bucket 2, 29,748')
need([s['byte'] for s in the['steps']] == [0x74, 0x68, 0x65], '"the" bytes 0x74 0x68 0x65')
need(the['h'] == 3020861980 and the['masked'] == 873378332 and the['bucket'] == 2, '"the": 3,020,861,980 → mask 873,378,332 → bucket 2')
need(sum(st['keys']) == len(seq), 'output lines across buckets = mrsequential distinct words')

def cut(fn, a, b):
    L = open(os.path.join(SRC, fn)).read().split('\n')
    return {'file': 'src/' + fn, 'from': a, 'to': b, 'lines': L[a - 1:b]}
code = {
  'comment': cut('main/mrsequential.go', 48, 59),
  'coord': cut('main/mrcoordinator.go', 18, 26),
  'map': cut('mrapps/wc.go', 19, 32),
  'ihash': cut('mr/worker.go', 10, 22),
  'seqsort': cut('main/mrsequential.go', 59, 62),
  'seqreduce': cut('main/mrsequential.go', 68, 84),
  'testwc': cut('mr/mr_test.go', 9, 23),
  'mkcorrect': cut('mr/util.go', 93, 93),
  'merge': cut('mr/util.go', 114, 114),
  'cmp': cut('mr/util.go', 159, 159),
  'wcreduce': cut('mrapps/wc.go', 37, 40),
  # one line per part of the framework page (A–E), quoted verbatim
  'pgA': cut('main/mrcoordinator.go', 23, 23),
  'pgB': cut('mrapps/wc.go', 28, 28),
  'pgC': cut('mr/worker.go', 16, 21),
  'pgE1': cut('main/mrsequential.go', 59, 59),
  'pgE2': cut('main/mrsequential.go', 78, 78),
  'pgE3': cut('main/mrsequential.go', 81, 81),
}
C = {k: '\n'.join(v['lines']) for k, v in code.items()}
need('rather than being partitioned into NxM buckets' in C['comment'] and code['comment']['lines'][6].strip().startswith('// a big difference'), 'mrsequential.go:54-56 the NxM comment')
need('MakeCoordinator(os.Args[1], os.Args[2:], 10)' in code['coord']['lines'][5], 'mrcoordinator.go:23 passes 10')
need('fnv.New32a()' in C['ihash'] and '& 0x7fffffff' in C['ihash'] and 'ihash(key) % NReduce' in C['ihash'], 'worker.go:16-22 ihash = FNV-1a, mask, mod NReduce')
need('sort.Sort(ByKey(intermediate))' in C['seqsort'] and 'reducef(intermediate[i].Key, values)' in C['seqreduce'], 'mrsequential.go sort + reduce loop')
need('mkCorrectOutput' in C['testwc'] and 'mergeOutput' in C['testwc'] and 'runCmp' in C['testwc'], 'mr_test.go TestWc: mkCorrectOutput, mergeOutput, runCmp')
need('strconv.Itoa(len(values))' in C['wcreduce'], 'wc.go:37-40 Reduce counts the values')
need('MakeCoordinator(os.Args[1], os.Args[2:], 10)' in C['pgA'], 'page A: mrcoordinator.go:23')
need('mr.KeyValue{w, "1"}' in C['pgB'], 'page B: wc.go:28 one pair per word')
need('ihash(key) % NReduce' in C['pgC'] and 'h.Sum32() & 0x7fffffff' in C['pgC'], 'page C: worker.go:16-21')
need('sort.Sort(ByKey(intermediate))' in C['pgE1'] and 'reducef(intermediate[i].Key, values)' in C['pgE2'] and 'Fprintf(ofile, "%v %v\\n"' in C['pgE3'], 'page E: mrsequential.go:59, 78, 81')
need(subprocess.run([sys.executable, os.path.join(HERE, 'toy.py')], capture_output=True, text=True).stdout.strip().endswith('toy ok'), 'toy.py: every toy number holds')
need('"sort"' in C['mkcorrect'] and '"mr-out-0"' in C['mkcorrect'] and '"sort", files...' in C['merge'] and '"cmp"' in C['cmp'], 'util.go: sort mrsequential, sort mr-out-*, cmp')

import importlib.util, io, contextlib
_spec = importlib.util.spec_from_file_location('toy', os.path.join(HERE, 'toy.py')); toy = importlib.util.module_from_spec(_spec)
with contextlib.redirect_stdout(io.StringIO()): _spec.loader.exec_module(toy)   # its asserts run here too
toyD = {'words': toy.WORDS, 'byLetter': toy.by_letter, 'byHash': toy.by_hash, 'sums': [toy.tiny_hash(w) for w in toy.WORDS],
        'pairs': toy.PAIRS, 'sorted': toy.srt}
D = {'st': st, 'of': of, 'the': the, 'first': dict(first), 'code': code, 'toy': toyD}
open(os.path.join(HERE, 'ep02_data.js'), 'w').write('// generated by data.py from data/runs.sh and 6.5840/ at 513cac0; do not edit\nconst D = ' + json.dumps(D, ensure_ascii=False) + ';\n')
if not ok: sys.exit('a stated property failed: fix the script or the run')
