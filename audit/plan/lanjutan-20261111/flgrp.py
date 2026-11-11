import json,re,collections,sys
def grp(f):
  d=json.load(open(f));g=collections.defaultdict(lambda:[0,set(),None])
  for p in d['pasangan']:
    k=re.sub(r' @y-?[0-9.]+','',p['k']); k=re.sub(r'#[0-9a-f]{6}','',k)
    e=g[k]; e[0]+=p['px']; e[1].update(p['views']); e[2]=e[2] or p['p']
  return g
A=grp(sys.argv[1]);B=grp(sys.argv[2])
keys=sorted(set(A)|set(B),key=lambda k:-(B[k][0] if k in B else 0))
print('TOP sesudah:')
for k in keys[:int(sys.argv[3]) if len(sys.argv)>3 else 40]:
  print(A[k][0] if k in A else 0,'->',B[k][0] if k in B else 0,sorted(B[k][1])[:3] if k in B else '',B[k][2] if k in B else A[k][2],k[:170])
