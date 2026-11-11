// node coplanar.js file.glb  -> pasangan muka datar koplanar (beda material) yang tumpang (sampel 0,1 m)
const L=require('./glblib');const g=L.load(process.argv[2]);const J=g.json;
function mat4(n){const t=n.translation||[0,0,0],r=n.rotation||[0,0,0,1],s=n.scale||[1,1,1];const [x,y,z,w]=r;
 const R=[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)];
 return p=>[R[0]*p[0]*s[0]+R[1]*p[1]*s[1]+R[2]*p[2]*s[2]+t[0],R[3]*p[0]*s[0]+R[4]*p[1]*s[1]+R[5]*p[2]*s[2]+t[1],R[6]*p[0]*s[0]+R[7]*p[1]*s[1]+R[8]*p[2]*s[2]+t[2]];}
const flats={};
function walk(ni,par){const n=J.nodes[ni];const f=mat4(n);const F=p=>par(f(p));if(n.mesh!=null){J.meshes[n.mesh].primitives.forEach((p,pi)=>{const P=L.read(g,p.attributes.POSITION),I=p.indices!=null?L.read(g,p.indices):null;const nt=I?I.length/3:P.length/9;for(let k=0;k<nt;k++){const v=[0,1,2].map(q=>{const i=I?I[k*3+q]:k*3+q;return F([P[i*3],P[i*3+1],P[i*3+2]]);});if(Math.abs(v[0][1]-v[1][1])<0.002&&Math.abs(v[0][1]-v[2][1])<0.002){const nx=(v[1][2]-v[0][2])*(v[2][0]-v[0][0])-(v[1][0]-v[0][0])*(v[2][2]-v[0][2]);const up=nx>0?'U':'D';const key=up+v[0][1].toFixed(3);(flats[key]=flats[key]||[]).push({m:J.materials[p.material]?J.materials[p.material].name:'?',node:n.name,v});}}});}(n.children||[]).forEach(c=>walk(c,F));}
(J.scenes[J.scene||0].nodes).forEach(ni=>walk(ni,p=>p));
const inside=(px,pz,v)=>{const s=(a,b,c)=>(a[0]-c[0])*(b[2]-c[2])-(b[0]-c[0])*(a[2]-c[2]);const p=[px,0,pz];const d1=s(p,v[0],v[1]),d2=s(p,v[1],v[2]),d3=s(p,v[2],v[0]);return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0));};
Object.keys(flats).forEach(y=>{const L2=flats[y];const mats=[...new Set(L2.map(f=>f.m+'|'+f.node))];if(mats.length<2)return;
 const cell={};L2.forEach(f=>{const xs=f.v.map(q=>q[0]),zs=f.v.map(q=>q[2]);for(let x=Math.floor(Math.min(...xs)*10);x<=Math.ceil(Math.max(...xs)*10);x++)for(let z=Math.floor(Math.min(...zs)*10);z<=Math.ceil(Math.max(...zs)*10);z++){if(inside(x/10+0.05,z/10+0.05,f.v)){const k=x+','+z;(cell[k]=cell[k]||new Set()).add(f.m+'|'+f.node);}}});
 const pair={};Object.values(cell).forEach(st=>{if(st.size<2)return;const a=[...st].sort().join(' & ');pair[a]=(pair[a]||0)+0.01;});
 Object.keys(pair).forEach(k=>{if(pair[k]>0.2)console.log('y',y,k,pair[k].toFixed(2),'m2');});});
