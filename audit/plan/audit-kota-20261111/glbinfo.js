const fs=require('fs');
function read(f){const b=fs.readFileSync(f);const jl=b.readUInt32LE(12);const j=JSON.parse(b.slice(20,20+jl).toString());return j;}
const f=process.argv[2];const j=read(f);
console.log('== '+f, 'meshes',(j.meshes||[]).length,'mats',(j.materials||[]).length,'tex',(j.textures||[]).length,'img',(j.images||[]).length, 'nodes',(j.nodes||[]).length, 'ext', j.extensionsUsed||[]);
if(process.argv[3]==='full'){
(j.meshes||[]).forEach((m,i)=>console.log(' mesh',i,m.name,m.primitives.map(p=>{const a=j.accessors[p.attributes.POSITION];return 'mat'+p.material+' v'+a.count+(p.indices!=null?' i'+j.accessors[p.indices].count:'')+' min'+JSON.stringify(a.min.map(x=>+x.toFixed(2)))+' max'+JSON.stringify(a.max.map(x=>+x.toFixed(2)))+' '+Object.keys(p.attributes).join(',')}).join(' | ')));
(j.materials||[]).forEach((m,i)=>console.log(' mat',i,m.name,JSON.stringify(m.pbrMetallicRoughness),m.normalTexture?'N'+JSON.stringify(m.normalTexture):'',m.emissiveTexture?'E':'',m.alphaMode||'',m.doubleSided?'2s':'', m.extensions?JSON.stringify(m.extensions):''));
(j.textures||[]).forEach((t,i)=>console.log(' tex',i,JSON.stringify(t)));
(j.images||[]).forEach((t,i)=>console.log(' img',i,t.name,t.mimeType,t.uri||('bv'+t.bufferView), t.bufferView!=null? j.bufferViews[t.bufferView].byteLength:''));
(j.samplers||[]).forEach((t,i)=>console.log(' smp',i,JSON.stringify(t)));
(j.nodes||[]).forEach((n,i)=>console.log(' node',i,n.name,'mesh',n.mesh,'ch',n.children||'', n.translation?n.translation.map(x=>+x.toFixed(2)):'',n.scale||'',n.rotation||''));
}
