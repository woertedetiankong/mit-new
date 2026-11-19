"""Episode 1's numbers and code excerpts, from data/runs.sh (mrsequential + wc.go on the eight books) and 6.5840/ at 513cac0.

    python3 data.py            # re-runs data/runs.sh, checks every number the subtitles state, writes ep01_data.js
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', '6.5840', 'src')
OUT = os.path.join(HERE, 'data', 'out')

subprocess.run([os.path.join(HERE, 'data', 'runs.sh')], check=True, stdout=subprocess.DEVNULL)

ok = True
def need(cond, what):
    global ok
    print(('ok   ' if cond else 'FAIL ') + what)
    ok = ok and cond

def counts(name):
    return {w: int(n) for w, n in (l.rsplit(' ', 1) for l in open(os.path.join(OUT, name + '.txt')).read().splitlines())}

allc = counts('all')
sizes = [(int(n), f) for n, f in (l.split() for l in open(os.path.join(OUT, 'sizes.txt')))]
times = [float(x) for x in open(os.path.join(OUT, 'time.txt')).read().split()]
books = []
for size, f in sizes:
    c = counts(f[:-4])
    books.append({'file': f, 'bytes': size, 'words': sum(c.values()), 'distinct': len(c), 'frank': c.get('Frankenstein', 0)})
top = sorted(allc.items(), key=lambda kv: -kv[1])[:5]
total_bytes = sum(s for s, _ in sizes)
total_words = sum(allc.values())

need(len(books) == 8, 'eight books')
need(round(total_bytes / 1e6, 1) == 3.3, f'3.3 MB of text ({total_bytes} bytes)')
need(total_words == 623948, f'623,948 words ({total_words})')
need(len(allc) == 22107, f'22,107 different words ({len(allc)})')
need(top[0] == ('the', 29748), f'top word "the" 29,748 times ({top[0]})')
need(all(t < 1 / 3 for t in times), f'a fraction of a second (under a third), every run ({times})')
need(allc.get('Sherlock') == 97, f'"Sherlock" 97 times ({allc.get("Sherlock")})')
need(allc.get('Frankenstein') == 30 and sum(b['frank'] for b in books) == 30, 'Frankenstein 30 times')
need(sum(b['words'] for b in books) == total_words, 'per-book counts add up to the total')
scale = 1e12 / total_bytes
med = sorted(times)[len(times) // 2]   # shown on screen as this run's time; the subtitles only say "a fraction of a second"
hours = scale * med / 3600             # worked out from this run's median, shown with its arithmetic
need(290e3 < scale < 310e3, f'1 TB is about 300,000 times bigger ({scale:.0f})')
need(hours > 10, f'over ten hours, worked out ({hours:.1f} h at {med} s)')

def cut(fn, a, b):
    L = open(os.path.join(SRC, fn)).read().split('\n')
    return {'file': 'src/' + fn, 'from': a, 'to': b, 'lines': L[a - 1:b]}
code = {
  'map': cut('mrapps/wc.go', 19, 32),
  'reduce': cut('mrapps/wc.go', 37, 40),
  'seqread': cut('main/mrsequential.go', 38, 51),
  'seqsort': cut('main/mrsequential.go', 59, 62),
  'seqreduce': cut('main/mrsequential.go', 68, 84),
  'call': cut('labrpc/labrpc.go', 110, 113),
  'procreq': cut('labrpc/labrpc.go', 290, 290),
  'dropreq': cut('labrpc/labrpc.go', 302, 306),
  'droprep': cut('labrpc/labrpc.go', 344, 351),
  'mkcoord': cut('mr/coordinator.go', 52, 60),
  'make': cut('Makefile', 43, 57),
  'crash': cut('mrapps/crash.go', 20, 32),
}
C = {k: '\n'.join(v['lines']) for k, v in code.items()}
need(C['map'].startswith('func Map(') and 'mr.KeyValue{w, "1"}' in C['map'] and '!unicode.IsLetter(r)' in C['map'], 'wc.go:19 Map splits on non-letters, emits (w, "1")')
need('strconv.Itoa(len(values))' in C['reduce'], 'wc.go:39 Reduce counts the values')
need('intermediate = append(intermediate, kva...)' in C['seqread'] and 'mapf(filename' in C['seqread'], 'mrsequential.go:49-50 appends Map output to intermediate')
need('sort.Sort(ByKey(intermediate))' in C['seqsort'] and '"mr-out-0"' in C['seqsort'], 'mrsequential.go:59 sorts, :61 mr-out-0')
need('reducef(intermediate[i].Key, values)' in C['seqreduce'] and '"%v %v\\n"' in C['seqreduce'], 'mrsequential.go:78-81 Reduce per key, "word count" lines')
need('func (e *ClientEnd) Call(' in C['call'] and 'false means that' in C['call'], 'labrpc.go:113 Call, false = no reply')
need(C['procreq'].startswith('func (rn *Network) processReq(req reqMsg)'), 'labrpc.go:290 processReq delivers each request')
need('drop the request' in C['dropreq'] and '< 100' in C['dropreq'] and '%1000' in C['dropreq'], 'labrpc.go:302 drops 10% of requests')
need('drop the reply' in C['droprep'] and '< 100' in C['droprep'], 'labrpc.go:349 drops 10% of replies')
need('c.server(sockname)' in C['mkcoord'] and 'Your code here' in C['mkcoord'], 'coordinator.go:58 MakeCoordinator only starts the server')
need('go test' in C['make'] and '-buildmode=plugin wc.go' in C['make'] and 'mrcoordinator' in C['make'], 'Makefile:43-57 make mr builds launchers + plugins, runs go test')
need(C['make'].count('-buildmode=plugin') == 8, 'make mr builds eight plugins')
need('rr.Int64() < 330' in C['crash'] and 'os.Exit(1)' in C['crash'] and '< 660' in C['crash'] and '10 * 1000' in C['crash'], 'crash.go: 1/3 exit, 1/3 stall up to 10 s')
need(D_crash_ok := (code['crash']['lines'][23-20].strip() == 'if rr.Int64() < 330 {' and code['crash']['lines'][26-20].strip() == '} else if rr.Int64() < 660 {'), 'crash.go:23 and :26 are the two branches the page quotes')
need(code['dropreq']['lines'][0].strip() == 'if reliable == false && (rand.Int()%1000) < 100 {' and code['droprep']['lines'][349-344].strip() == '} else if reliable == false && (rand.Int()%1000) < 100 {', 'labrpc.go:302 and :349 are the two drops the page quotes')
need('$(RACE)' in C['make'], 'make mr uses the race detector')

# the files a student writes: comments like "Your code here" (also "Your worker implementation here")
yours = []
for d, _, fs in os.walk(SRC):
    for f in fs:
        if f.endswith('.go') and re.search(r'// Your (code|worker implementation|definitions|data) here', open(os.path.join(d, f)).read()):
            yours.append(os.path.relpath(os.path.join(d, f), SRC))
yours.sort()
need(len(yours) == 10 and 'mr/coordinator.go' in yours and 'mr/worker.go' in yours, f'ten files to write ({len(yours)})')

# the sentence the video follows through Map, sort and Reduce: pg-frankenstein.txt lines 610-611
fr = open(os.path.join(SRC, 'main', 'pg-frankenstein.txt')).read().split('\n')
sentence = fr[609] + ' ' + fr[610].split('.')[0] + '.'
words = re.findall(r'[A-Za-z]+', sentence)
need(sentence.startswith('I am by birth a Genevese') and len(words) == 18 and words.count('of') == 2, f'Frankenstein L610: 18 words, "of" twice ({len(words)})')
srt = sorted(words)  # Go's sort.Sort(ByKey) compares strings byte by byte, like Python
need(srt[0] == 'Genevese' and srt[1] == 'I' and srt[12:14] == ['of', 'of'], 'sorted: capitals first, the two "of" side by side')

D = {'sentence': sentence, 'words': words, 'sorted': srt, 'books': books, 'total_bytes': total_bytes, 'total_words': total_words, 'distinct': len(allc), 'top': top,
     'times': times, 'med': med, 'scale': round(scale), 'hours': round(hours, 1), 'sherlock': allc['Sherlock'], 'code': code, 'yours': yours}
open(os.path.join(HERE, 'ep01_data.js'), 'w').write('// generated by data.py from data/runs.sh and 6.5840/ at 513cac0; do not edit\nconst D = ' + json.dumps(D, ensure_ascii=False) + ';\n')
if not ok: sys.exit('a stated property failed: fix the script or the run')
print('books:', [(b['file'], b['words']) for b in books])
