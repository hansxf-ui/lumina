// node liftfaces.js file.glb nodeName yWorld dy [file-out]
// Angkat verteks muka-datar-menghadap-atas milik node `nodeName` di ketinggian dunia yWorld (+-2 mm) sebesar dy (dunia).
const L=require('./glblib');const [f,nodeName,yS,dyS,out]=process.argv.slice(2);const yW=+yS,dy=+dyS;
const g=L.load(f);const J=g.json;
// cari node + rantai parent (hanya translasi/skala, rotasi harus tegak/identitas di Y)
const parent={};J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parent[c]=i));
const ni=J.nodes.findIndex(n=>n.name===nodeName);if(ni<0){console.log('node?',nodeName);process.exit(1);}
let ty=0,sy=1,i=ni;const chain=[];while(i!=null){chain.push(i);i=parent[i];}
chain.reverse().forEach(k=>{const n=J.nodes[k];const r=n.rotation||[0,0,0,1];if(Math.abs(r[0])>1e-4||Math.abs(r[2])>1e-4){console.log('rotasi X/Z di',n.name);process.exit(1);}ty=ty+(n.translation||[0,0,0])[1]*sy;sy*=(n.scale||[1,1,1])[1];});
const n=J.nodes[ni];let tot=0;
J.meshes[n.mesh].primitives.forEach(p=>{const P=L.read(g,p.attributes.POSITION),I=p.indices!=null?L.read(g,p.indices):null;const nt=I?I.length/3:P.length/9;const mv=new Set();
 for(let k=0;k<nt;k++){const v=[0,1,2].map(q=>I?I[k*3+q]:k*3+q);const y=v.map(j=>P[j*3+1]*sy+ty);if(y.every(a=>Math.abs(a-yW)<0.002)){const nx=(P[v[1]*3+2]-P[v[0]*3+2])*(P[v[2]*3]-P[v[0]*3])-(P[v[1]*3]-P[v[0]*3])*(P[v[2]*3+2]-P[v[0]*3+2]);if(nx*Math.sign(sy)>0)v.forEach(j=>mv.add(j));}}
 mv.forEach(j=>P[j*3+1]+=dy/sy);tot+=mv.size;if(mv.size)p.attributes.POSITION=L.addAccessor(g,P,'VEC3');});
L.save(g,out||f);console.log(nodeName,'y',yW,'verteks diangkat',tot);
