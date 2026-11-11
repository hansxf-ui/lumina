// Minimal GLB read/modify/write (no deps). Accessor data replaced -> new bufferViews; repack drops unused.
const fs=require('fs');
const CT={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function load(f){const b=fs.readFileSync(f);let off=12;let json,bin;
 while(off<b.length){const len=b.readUInt32LE(off),type=b.readUInt32LE(off+4);const d=b.slice(off+8,off+8+len);
  if(type===0x4E4F534A)json=JSON.parse(d.toString());else if(type===0x004E4942)bin=Buffer.from(d);off+=8+len;}
 return {json,bin,views:null};}
function viewBytes(g,vi){const v=g.json.bufferViews[vi];return g.bin.slice(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);}
function read(g,ai){const a=g.json.accessors[ai];const T=CT[a.componentType],n=NC[a.type];const v=g.json.bufferViews[a.bufferView];
 const stride=v.byteStride||T.BYTES_PER_ELEMENT*n;const base=(v.byteOffset||0)+(a.byteOffset||0);const out=new T(a.count*n);
 const dv=new DataView(g.bin.buffer,g.bin.byteOffset);
 for(let i=0;i<a.count;i++)for(let c=0;c<n;c++){const o=base+i*stride+c*T.BYTES_PER_ELEMENT;
  out[i*n+c]= T===Float32Array?dv.getFloat32(o,true):T===Uint16Array?dv.getUint16(o,true):T===Uint32Array?dv.getUint32(o,true):T===Uint8Array?dv.getUint8(o):T===Int16Array?dv.getInt16(o,true):dv.getInt8(o);}
 return out;}
const extra=[]; // pending binary chunks
function addView(g,buf,target){const j=g.json;j.bufferViews.push({buffer:0,byteOffset:-1,byteLength:buf.length,target});const vi=j.bufferViews.length-1;(g._new=g._new||{})[vi]=Buffer.from(buf.buffer,buf.byteOffset,buf.byteLength);return vi;}
function addAccessor(g,arr,type,isIndex){const j=g.json;const ct=arr instanceof Float32Array?5126:arr instanceof Uint32Array?5125:arr instanceof Uint16Array?5123:5121;
 const vi=addView(g,arr,isIndex?34963:34962);const n=NC[type];const acc={bufferView:vi,componentType:ct,count:arr.length/n,type};
 if(!isIndex&&ct===5126){const mn=[],mx=[];for(let c=0;c<n;c++){mn.push(Infinity);mx.push(-Infinity);}for(let i=0;i<arr.length;i+=n)for(let c=0;c<n;c++){mn[c]=Math.min(mn[c],arr[i+c]);mx[c]=Math.max(mx[c],arr[i+c]);}acc.min=mn;acc.max=mx;}
 if(isIndex){acc.min=[0];acc.max=[0];let m=0;for(const x of arr)if(x>m)m=x;acc.max=[m];acc.min=[Math.min(...arr.slice(0,1))];delete acc.min;delete acc.max;}
 j.accessors.push(acc);return j.accessors.length-1;}
function addImage(g,png,mime,name){const vi=addView(g,png,undefined);delete g.json.bufferViews[vi].target;g.json.images=g.json.images||[];g.json.images.push({bufferView:vi,mimeType:mime,name});return g.json.images.length-1;}
function prune(j){const used=new Set();(j.meshes||[]).forEach(m=>m.primitives.forEach(p=>{Object.values(p.attributes).forEach(a=>used.add(a));if(p.indices!=null)used.add(p.indices);(p.targets||[]).forEach(t=>Object.values(t).forEach(a=>used.add(a)));}));
 (j.skins||[]).forEach(s=>{if(s.inverseBindMatrices!=null)used.add(s.inverseBindMatrices);});(j.animations||[]).forEach(a=>a.samplers.forEach(s=>{used.add(s.input);used.add(s.output);}));
 const map={},na=[];j.accessors.forEach((a,i)=>{if(used.has(i)){map[i]=na.length;na.push(a);}});j.accessors=na;
 (j.meshes||[]).forEach(m=>m.primitives.forEach(p=>{Object.keys(p.attributes).forEach(k=>p.attributes[k]=map[p.attributes[k]]);if(p.indices!=null)p.indices=map[p.indices];(p.targets||[]).forEach(t=>Object.keys(t).forEach(k=>t[k]=map[t[k]]));}));
 (j.skins||[]).forEach(s=>{if(s.inverseBindMatrices!=null)s.inverseBindMatrices=map[s.inverseBindMatrices];});(j.animations||[]).forEach(a=>a.samplers.forEach(s=>{s.input=map[s.input];s.output=map[s.output];}));}
function save(g,f){const j=g.json;prune(j);
 // collect used views
 const used=new Set();(j.accessors||[]).forEach(a=>{if(a.bufferView!=null)used.add(a.bufferView);});(j.images||[]).forEach(i=>{if(i.bufferView!=null)used.add(i.bufferView);});
 const remap={},nv=[],parts=[];let off=0;
 j.bufferViews.forEach((v,i)=>{if(!used.has(i))return;const data=(g._new&&g._new[i])?g._new[i]:viewBytes(g,i);
  const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}
  const nvv=Object.assign({},v,{byteOffset:off,byteLength:data.length});remap[i]=nv.length;nv.push(nvv);parts.push(data);off+=data.length;});
 j.bufferViews=nv;(j.accessors||[]).forEach(a=>{if(a.bufferView!=null)a.bufferView=remap[a.bufferView];});(j.images||[]).forEach(i=>{if(i.bufferView!=null)i.bufferView=remap[i.bufferView];});
 let bin=Buffer.concat(parts);const bp=(4-bin.length%4)%4;bin=Buffer.concat([bin,Buffer.alloc(bp)]);j.buffers=[{byteLength:bin.length}];
 let js=Buffer.from(JSON.stringify(j));const jp=(4-js.length%4)%4;js=Buffer.concat([js,Buffer.alloc(jp,0x20)]);
 const total=12+8+js.length+8+bin.length;const h=Buffer.alloc(12);h.writeUInt32LE(0x46546C67,0);h.writeUInt32LE(2,4);h.writeUInt32LE(total,8);
 const jh=Buffer.alloc(8);jh.writeUInt32LE(js.length,0);jh.writeUInt32LE(0x4E4F534A,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length,0);bh.writeUInt32LE(0x004E4942,4);
 fs.writeFileSync(f,Buffer.concat([h,jh,js,bh,bin]));g._new=null;}
function meshByName(g,name){return g.json.meshes.findIndex(m=>m.name===name);}
function nodeMesh(g,nodeName){const n=g.json.nodes.find(n=>n.name===nodeName);return n?n.mesh:-1;}
module.exports={load,read,addAccessor,addImage,save,meshByName,nodeMesh,viewBytes};
