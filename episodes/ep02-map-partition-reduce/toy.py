"""Episode 2's toy examples (玩具例子 / toy on screen): tiny numbers the viewer can check by eye.

    python3 toy.py      # asserts every toy number the script states; prints them

Not a real run: these are the operations at a size you can see. The real numbers come from data.py.
"""
WORDS = ['sea', 'see', 'sun', 'sky', 'sand', 'cat']   # six words, three buckets
R = 3

def first_letter(w):        # a–h → 0, i–r → 1, s–z → 2
    c = w[0]
    return 0 if c <= 'h' else 1 if c <= 'r' else 2

def tiny_hash(w):           # add up letter positions (a = 1 … z = 26)
    return sum(ord(c) - 96 for c in w)

def buckets(rule):
    out = [[] for _ in range(R)]
    for w in WORDS: out[rule(w)].append(w)
    return out

by_letter = buckets(first_letter)
by_hash = buckets(lambda w: tiny_hash(w) % R)
assert by_letter == [['cat'], [], ['sea', 'see', 'sun', 'sky', 'sand']]
assert [tiny_hash(w) for w in WORDS] == [25, 29, 54, 55, 38, 24]
assert by_hash == [['sun', 'cat'], ['sea', 'sky'], ['see', 'sand']]
assert tiny_hash('sea') == 19 + 5 + 1 == 25 and 25 % 3 == 1
# same word, same bucket, whichever "book" it comes from
assert tiny_hash('sea') % R == tiny_hash('sea') % R

# sort, then group runs of equal keys (what mrsequential.go:59–84 does)
PAIRS = [('of', '1'), ('a', '1'), ('of', '1'), ('the', '1'), ('a', '1')]
srt = sorted(PAIRS, key=lambda kv: kv[0])
assert [k for k, _ in srt] == ['a', 'a', 'of', 'of', 'the']
groups = {}
for k, v in srt: groups.setdefault(k, []).append(v)
assert {k: len(v) for k, v in groups.items()} == {'a': 2, 'of': 2, 'the': 1}

print('first letter:', by_letter)
print('tiny hash   :', [(w, tiny_hash(w), tiny_hash(w) % R) for w in WORDS], '→', by_hash)
print('sort+group  :', srt, '→', {k: len(v) for k, v in groups.items()})
print('toy ok')
