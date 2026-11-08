// water.js — air bergelombang dengan pantulan langit untuk three.js
// Versi global (bukan module) untuk Lumina — THREE dari <script> tag.
// Air ngikutin jam game: siang biru terang, senja oranye, malam gelap + pantulan bulan.
// Dipakai: var water = createWater(THREE, { size: [840, 840], y: -0.45 });
// di loop: water.update(clock.getElapsedTime());
// di terapkanLangit: water.setSky(scene.background, langit.night);
// Tes manual: water.setHour(12) / water.setHour(17.5) / water.setHour(0)

function waterHeight(x, z, t) {
  return .07 * Math.sin(x * .5 + t * 1.2) + .05 * Math.sin(z * .7 + t * 1.6) + .03 * Math.sin((x + z) * 1.3 + t * 2);
}

function createWater(THREE, opt) {
  opt = opt || {};
  var size = opt.size || [120, 70];
  var segments = opt.segments || [120, 70];
  var y = (opt.y !== undefined) ? opt.y : 0;
  var sunDir = opt.sunDir || [-.679, .611, .407];
  var fogColor = opt.fogColor || [.62, .38, .40];
  var fogDensity = (opt.fogDensity !== undefined) ? opt.fogDensity : .016;

  var geo = new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
  geo.rotateX(-Math.PI / 2);
  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uNight: { value: 0 },
      uSky: { value: new THREE.Vector3(0.33, 0.71, 0.96) },
      uSun: { value: new THREE.Vector3(sunDir[0], sunDir[1], sunDir[2]).normalize() },
      uFog: { value: new THREE.Vector3(fogColor[0], fogColor[1], fogColor[2]) },
      uFogD: { value: fogDensity }
    },
    vertexShader: 'uniform float uTime;varying vec3 vW;varying vec3 vN;\n' +
      'float hf(vec2 p,float t){return .07*sin(p.x*.5+t*1.2)+.05*sin(p.y*.7+t*1.6)+.03*sin((p.x+p.y)*1.3+t*2.);}\n' +
      'void main(){float e=.05,h0=hf(position.xz,uTime),hx=hf(position.xz+vec2(e,0.),uTime),hz=hf(position.xz+vec2(0.,e),uTime);\n' +
      'vN=normalize(vec3(-(hx-h0)/e*3.,1.,-(hz-h0)/e*3.));vec4 w=modelMatrix*vec4(position.x,h0,position.z,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: 'uniform vec3 uSun,uFog,uSky;uniform float uFogD,uNight;varying vec3 vW;varying vec3 vN;\n' +
      // Pantulan langit = warna langit ASLI (uSky), bukan palet senja tetap.
      // h = ketinggian arah pantul: horizon = uSky penuh, zenith = uSky digelapkan.
      // Kilau matahari siang, kilau bulan redup di malam hari.
      'vec3 skyCol(vec3 d){float h=max(d.y,0.);vec3 c=mix(uSky,uSky*.25,smoothstep(.1,.8,h));' +
      'float g=max(dot(d,uSun),0.);' +
      'c+=vec3(1.,.7,.4)*pow(g,24.)*.9*(1.-uNight)+vec3(1.,.9,.7)*pow(g,400.)*2.*(1.-uNight);' +
      'c+=vec3(.8,.85,1.)*pow(g,60.)*.35*uNight;' +  // pantulan bulan redup
      'return c;}\n' +
      'void main(){vec3 n=normalize(vN),v=normalize(vW-cameraPosition);vec3 r=reflect(v,n);r.y=abs(r.y);\n' +
      'float fr=.04+.96*pow(1.-max(dot(-v,n),0.),4.);vec3 c=mix(vec3(.02,.06,.1),skyCol(r),clamp(fr+.12,0.,1.));\n' +
      'c+=vec3(1.,.7,.4)*pow(max(dot(r,uSun),0.),180.)*2.*(1.-uNight);\n' +
      'c+=vec3(.8,.85,1.)*pow(max(dot(r,uSun),0.),120.)*.5*uNight;\n' +  // kilau bulan di air
      'c=mix(c,uFog,1.-exp(-length(vW-cameraPosition)*uFogD));\n' +
      'c=1.-exp(-c*1.15);gl_FragColor=vec4(pow(c,vec3(.4545)),1.);}'
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  mesh.frustumCulled = false;

  // Tabel warna langit Lumina (sama dengan KUNCI di index.html) buat tes manual setHour.
  var SKY_KEYS = [
    [0.00, 0x0a0e24, 1.00], [5.00, 0x0a0e24, 1.00], [6.00, 0x77679e, 0.55],
    [7.50, 0x7ec0ee, 0.00], [11.00, 0x53b4f5, 0.00], [15.00, 0x57aee9, 0.00],
    [17.50, 0xf6c26e, 0.00], [18.75, 0xef8347, 0.30], [19.50, 0x463d6e, 0.75],
    [20.75, 0x0a0e24, 1.00], [24.00, 0x0a0e24, 1.00]
  ];
  function skyAt(h) {
    var a = SKY_KEYS[0], b = SKY_KEYS[SKY_KEYS.length - 1], i;
    for (i = 0; i < SKY_KEYS.length - 1; i++) {
      if (h >= SKY_KEYS[i][0] && h <= SKY_KEYS[i + 1][0]) { a = SKY_KEYS[i]; b = SKY_KEYS[i + 1]; break; }
    }
    var t = (b[0] - a[0]) > 0 ? (h - a[0]) / (b[0] - a[0]) : 0;
    var ca = new THREE.Color(a[1]), cb = new THREE.Color(b[1]);
    ca.lerp(cb, t);
    return { sky: ca, night: a[2] + (b[2] - a[2]) * t };
  }

  return {
    mesh: mesh,
    update: function(t) { mat.uniforms.uTime.value = t; },
    setNight: function(n) { mat.uniforms.uNight.value = n; },
    setSky: function(skyColor, night) {
      mat.uniforms.uSky.value.set(skyColor.r, skyColor.g, skyColor.b);
      mat.uniforms.uNight.value = night;
    },
    // Tes manual: water.setHour(12) siang, water.setHour(17.5) senja, water.setHour(0) malam
    setHour: function(h) {
      var s = skyAt(h);
      mat.uniforms.uSky.value.set(s.sky.r, s.sky.g, s.sky.b);
      mat.uniforms.uNight.value = s.night;
    }
  };
}

// Material air saja (tanpa mesh) — buat nempel ke air yang sudah ada di GLB
// (danau, kolam renang). Pakai: var m = createWaterMaterial(THREE); mesh.material = m.material;
function createWaterMaterial(THREE, opt) {
  opt = opt || {};
  var w = createWater(THREE, opt);
  return {
    material: w.mesh.material,
    update: w.update,
    setNight: w.setNight,
    setSky: w.setSky,
    setHour: w.setHour
  };
}
