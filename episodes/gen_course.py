"""Rebuild the episode list in site/web/js/course.js and course.en.js from plan.py.

Episodes already in production (status other than 'planned') keep their whole hand-written entry, in both files;
every planned episode is regenerated as {id, n, title, group, status: 'planned'} with its English title and group.
Run after changing plan.py:  python3 episodes/gen_course.py
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import plan
JS = os.path.join(HERE, '..', 'site', 'web', 'js')

def blocks(body, head):  # split a list/object body into {epId: text} at lines starting with `head`
    out, cur, buf = {}, None, []
    for line in body.splitlines(keepends=True):
        m = re.match(head, line)
        if m:
            if cur: out[cur] = ''.join(buf)
            cur, buf = m.group(1), []
        if cur: buf.append(line)
    if cur: out[cur] = ''.join(buf)
    return out

def q(s): return json.dumps(s, ensure_ascii=False)

zh_path, en_path = os.path.join(JS, 'course.js'), os.path.join(JS, 'course.en.js')
zh, en = open(zh_path, encoding='utf-8').read(), open(en_path, encoding='utf-8').read()

a = zh.index('window.EPISODES = [\n') + len('window.EPISODES = [\n'); b = zh.index('\n];', a) + 1
zb = blocks(zh[a:b], r"  \{id: '(ep\d+[a-z]?)'")
keep = {k for k, v in zb.items() if "status: 'planned'" not in v}

a2 = en.index('enOverlay(window.EPISODES, {\n') + len('enOverlay(window.EPISODES, {\n'); b2 = en.index('\n});', a2) + 1
eb = blocks(en[a2:b2], r"  (ep\d+[a-z]?): \{")

zl, el = [], []
for n, g, tzh, ten, *_ in plan.E:
    i = f'ep{n:02d}'
    parts = sorted(k for k in zb if k[:-1] == i and k[-1].isalpha())  # a split episode (ep11a, ep11b, ...) replaces epNN;
    if any(k in keep for k in parts):  # once one part is in production, its not-yet-made parts stay as written ('planned')
        for k in parts:
            zl.append(zb[k]); el.append(eb[k])
        continue
    if i in keep:
        zl.append(zb[i]); el.append(eb.get(i, f'  {i}: {{title: {q(ten)}, group: {q(plan.G[g][1])}}},\n'))
        continue
    zl.append(f"  {{id: '{i}', n: {n}, title: {q(tzh)}, group: {q(plan.G[g][0])}, status: 'planned'}},\n")
    el.append(f'  {i}: {{title: {q(ten)}, group: {q(plan.G[g][1])}}},\n')
gone = sorted(set(zb) - {f'ep{e[0]:02d}' for e in plan.E} - {k for k in zb if k[-1].isalpha() and k[:-1] in {f'ep{e[0]:02d}' for e in plan.E}})
if any(g in keep for g in gone): sys.exit(f'refusing: produced episodes not in plan.py: {[g for g in gone if g in keep]}')

zh = zh[:a] + ''.join(zl) + zh[b:]
en = en[:a2] + ''.join(el) + en[b2:]
open(zh_path, 'w', encoding='utf-8').write(zh); open(en_path, 'w', encoding='utf-8').write(en)
print(f'{len(plan.E)} episodes; kept as written: {sorted(keep)}; dropped: {gone or "none"}')
