const L=require('./glblib');
function comps(g,mi,pr){const p=g.json.meshes[mi].primitives[pr||0];const P=L.read(g,p.attributes.POSITION),I=L.read(g,p.indices);
 const nv=P.length/3;const par=[...Array(nv).keys()];const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
 const key={};for(let i=0;i<nv;i++){const k=[P[i*3],P[i*3+1],P[i*3+2]].map(v=>v.toFixed(4)).join();if(key[k]!=null)par[f(i)]=f(key[k]);else key[k]=i;}
 for(let t=0;t<I.length;t+=3){par[f(I[t+1])]=f(I[t]);par[f(I[t+2])]=f(I[t]);}
 const C={};for(let t=0;t<I.length;t+=3){const r=f(I[t]);(C[r]=C[r]||{tris:[],verts:new Set()}).tris.push(t/3);[0,1,2].forEach(q=>C[r].verts.add(I[t+q]));}
 return {P,I,list:Object.values(C).map(c=>{let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];c.verts.forEach(i=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],P[i*3+k]);mx[k]=Math.max(mx[k],P[i*3+k]);}});c.min=mn;c.max=mx;c.c=mn.map((v,k)=>(v+mx[k])/2);return c;})};}
module.exports=comps;
if(require.main===module){const g=L.load(process.argv[2]);const r=comps(g,+process.argv[3],+(process.argv[4]||0));
 r.list.forEach((c,i)=>console.log(i,'tris',c.tris.length,'verts',c.verts.size,'min',c.min.map(v=>v.toFixed(2)).join(','),'max',c.max.map(v=>v.toFixed(2)).join(',')));}
