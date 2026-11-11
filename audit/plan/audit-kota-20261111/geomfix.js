const L=require('./glblib');const comps=require('./comps');
// read primitive into triangle soup arrays
function soup(g,mi,pi){const p=g.json.meshes[mi].primitives[pi];const P=L.read(g,p.attributes.POSITION),N=L.read(g,p.attributes.NORMAL);
 const U=p.attributes.TEXCOORD_0!=null?L.read(g,p.attributes.TEXCOORD_0):null;const C=p.attributes.COLOR_0!=null?{a:L.read(g,p.attributes.COLOR_0),n:{VEC3:3,VEC4:4}[g.json.accessors[p.attributes.COLOR_0].type],acc:g.json.accessors[p.attributes.COLOR_0]}:null;
 const I=p.indices!=null?L.read(g,p.indices):Uint32Array.from({length:P.length/3},(_,i)=>i);
 return {p,P,N,U,C,I};}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],nz=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l);};
function frame(n,grainAxis){let T,B;
 if(grainAxis){const Lp=sub(grainAxis,n.map(x=>x*dt(grainAxis,n)));if(Math.hypot(...Lp)>0.3){B=nz(Lp);T=nz(cr(B,n));return {T,B};}}
 const up=[0,1,0];if(Math.abs(n[1])>0.95){return {T:[1,0,0],B:[0,0,1]};}
 T=nz(cr(up,n));B=nz(cr(n,T));return {T,B};}
// returns new arrays (de-indexed then welded)
function remapUV(g,mi,pi,density,opt){opt=opt||{};const s=soup(g,mi,pi);const {P,N,I}=s;
 let compOf=null,axes=null;if(opt.grain){const c=comps(g,mi,pi);compOf=new Int32Array(I.length/3);axes=c.list.map(cc=>{const d=sub(cc.max,cc.min);const k=d.indexOf(Math.max(...d));return [0,1,2].map(i=>i===k?1:0);});c.list.forEach((cc,ci)=>cc.tris.forEach(t=>compOf[t]=ci));}
 const out={P:[],N:[],U:[],C:s.C?[]:null};
 for(let t=0;t<I.length/3;t++){const v=[0,1,2].map(q=>I[t*3+q]);const pa=v.map(i=>[P[i*3],P[i*3+1],P[i*3+2]]);
  let n=nz(cr(sub(pa[1],pa[0]),sub(pa[2],pa[0])));const sn=[N[v[0]*3],N[v[0]*3+1],N[v[0]*3+2]];if(dt(n,sn)<0)n=n.map(x=>-x);
  const {T,B}=frame(n,opt.grain?axes[compOf[t]]:null);
  v.forEach((i,q)=>{out.P.push(...pa[q]);out.N.push(N[i*3],N[i*3+1],N[i*3+2]);out.U.push(dt(pa[q],T)*density+(opt.ou||0),dt(pa[q],B)*density+(opt.ov||0));if(s.C)for(let c=0;c<s.C.n;c++)out.C.push(s.C.a[i*s.C.n+c]);});}
 return weld(out,s);}
function weld(out,s){const map=new Map(),P=[],N=[],U=[],C=out.C?[]:null,I=[];const n=out.P.length/3;const cn=s&&s.C?s.C.n:0;
 for(let i=0;i<n;i++){const k=[out.P[i*3],out.P[i*3+1],out.P[i*3+2],out.N[i*3],out.N[i*3+1],out.N[i*3+2],out.U[i*2],out.U[i*2+1]].map(x=>x.toFixed(5)).join();
  let id=map.get(k);if(id==null){id=P.length/3;map.set(k,id);P.push(out.P[i*3],out.P[i*3+1],out.P[i*3+2]);N.push(out.N[i*3],out.N[i*3+1],out.N[i*3+2]);U.push(out.U[i*2],out.U[i*2+1]);if(C)for(let c=0;c<cn;c++)C.push(out.C[i*cn+c]);}I.push(id);}
 return {P,N,U,C,I,cn};}
function writePrim(g,mi,pi,geo,colorAcc){const p=g.json.meshes[mi].primitives[pi];
 p.attributes.POSITION=L.addAccessor(g,new Float32Array(geo.P),'VEC3');p.attributes.NORMAL=L.addAccessor(g,new Float32Array(geo.N),'VEC3');p.attributes.TEXCOORD_0=L.addAccessor(g,new Float32Array(geo.U),'VEC2');
 if(geo.C&&geo.C.length){const src=colorAcc;let arr;if(src.componentType===5126)arr=new Float32Array(geo.C);else if(src.componentType===5123)arr=new Uint16Array(geo.C);else arr=new Uint8Array(geo.C);const ai=L.addAccessor(g,arr,src.type);if(src.normalized)g.json.accessors[ai].normalized=true;p.attributes.COLOR_0=ai;} 
 const IA=geo.P.length/3>65535?new Uint32Array(geo.I):new Uint16Array(geo.I);p.indices=L.addAccessor(g,IA,'SCALAR',true);
 Object.keys(p.attributes).forEach(k=>{if(!['POSITION','NORMAL','TEXCOORD_0','COLOR_0'].includes(k))delete p.attributes[k];});}
// Polygon builder: flat faces with planar UV (face frame), density
function Builder(){this.P=[];this.N=[];this.U=[];this.C=null;}
Builder.prototype.poly=function(pts,density,opt){opt=opt||{};let n=nz(cr(sub(pts[1],pts[0]),sub(pts[2],pts[0])));
 if(opt.inside){const c=[0,1,2].map(k=>pts.reduce((s,p)=>s+p[k],0)/pts.length);if(dt(n,sub(c,opt.inside))<0){pts=pts.slice().reverse();n=n.map(x=>-x);}}
 const {T,B}=frame(n,opt.grain||null);for(let k=1;k<pts.length-1;k++){[pts[0],pts[k],pts[k+1]].forEach(p=>{this.P.push(...p);this.N.push(...n);this.U.push(dt(p,T)*density,dt(p,B)*density);});}};
// prism: extrude 2D profile (array of [a,b]) along an axis; mk(a,b,t)->[x,y,z]
Builder.prototype.prism=function(prof,t0,t1,mk,density,opt){opt=Object.assign({},opt||{});const n=prof.length;const A=prof.map(q=>mk(q[0],q[1],t0)),Bv=prof.map(q=>mk(q[0],q[1],t1));
 const all=A.concat(Bv);opt.inside=[0,1,2].map(k=>all.reduce((s,p)=>s+p[k],0)/all.length);
 this.poly(A,density,opt);this.poly(Bv,density,opt);
 for(let i=0;i<n;i++){const j=(i+1)%n;this.poly([A[i],A[j],Bv[j],Bv[i]],density,opt);}};
module.exports={soup,remapUV,weld,writePrim,Builder,nz,cr,sub,dt};
