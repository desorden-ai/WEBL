class StardustImage{
  constructor(src,container){this.container=container;this.loaded=false;this.fallbackMode=false;this.fallbackRequested=false;this.realImg=document.createElement('img');this.realImg.className='stardust-real-img';this.realImg.alt='David Milla, director creativo';this.realImg.fetchPriority='high';this.realImg.decoding='async';this.realImg.onerror=()=>this.loadFallback();this.realImg.src=src;this.canvas=document.createElement('canvas');this.canvas.className='stardust-canvas';this.ctx=this.canvas.getContext('2d',{alpha:true});container.append(this.realImg,this.canvas);this.particles=[];this.pixelImg=new Image();this.pixelImg.crossOrigin='Anonymous';this.pixelImg.onload=()=>setTimeout(()=>this.processImage(this.pixelImg),50);this.pixelImg.onerror=()=>this.loadFallback();this.pixelImg.src=src}
  async loadFallback(){if(this.fallbackRequested)return;this.fallbackRequested=true;try{const parts=await Promise.all([0,1,2,3,4].map(i=>fetch(`portrait-${i}.b64`).then(r=>{if(!r.ok)throw new Error('portrait');return r.text()})));const data=`data:image/jpeg;base64,${parts.join('')}`;this.realImg.src=data;this.pixelImg.src=data}catch{this.fallbackMode=true;this.loaded=true;checkLoadingState()}}
  processImage(img){try{const cols=75,aspect=img.height/img.width,rows=Math.floor(cols*aspect),pixelSize=4;this.canvas.width=cols*pixelSize;this.canvas.height=rows*pixelSize;const tempCanvas=document.createElement('canvas');tempCanvas.width=cols;tempCanvas.height=rows;const tCtx=tempCanvas.getContext('2d');tCtx.drawImage(img,0,0,cols,rows);const imgData=tCtx.getImageData(0,0,cols,rows).data;for(let y=0;y<rows;y++){for(let x=0;x<cols;x++){const i=(y*cols+x)*4,r=imgData[i],g=imgData[i+1],b=imgData[i+2],a=imgData[i+3],brightness=(r+g+b)/3;if(a>50&&brightness>15)this.particles.push({baseX:x*pixelSize,baseY:y*pixelSize,color:`rgba(${r},${g},${b},1)`,randX:(.2+Math.random()*1.3)*innerWidth,randY:(Math.random()-.5)*innerHeight*1.1})}}this.loaded=true;checkLoadingState()}catch{this.fallbackMode=true;this.loaded=true;checkLoadingState()}}
  update(trueZ){if(!this.loaded)return;let dispersion=0;if(trueZ>-400)dispersion=(trueZ+400)/2800;dispersion=Math.max(0,Math.min(1,dispersion));const easeDispersion=Math.pow(dispersion,1.2);if(this.fallbackMode){this.realImg.style.opacity=1-easeDispersion;return}this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);if(easeDispersion===0){this.realImg.style.opacity=1;this.canvas.style.opacity=0}else if(easeDispersion<.1){const fade=easeDispersion/.1;this.realImg.style.opacity=1-fade;this.canvas.style.opacity=fade}else{this.realImg.style.opacity=0;this.canvas.style.opacity=1-easeDispersion*.8}if(easeDispersion>=.99)return;for(const p of this.particles){const x=p.baseX+p.randX*easeDispersion,y=p.baseY+p.randY*easeDispersion;this.ctx.fillStyle=p.color;this.ctx.fillRect(x,y,3,3)}}
}
const check=`<svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
const sceneData=[
  {id:'s0_img',type:'stardust',src:'1000091876.jpg',x:4,y:22,z:-600},
  {id:'s1_1',html:'<h1 class="font-bebas text-white title-huge">TU</h1>',x:-3,y:-15,z:-2500},
  {id:'s1_2',html:'<h1 class="font-bebas text-orange title-huge">PARTNER</h1>',x:2,y:5,z:-4000},
  {id:'s1_3',html:'<p class="body-text text-muted" style="font-size:.9rem;letter-spacing:2px">( TECNOLÓGICO Y CREATIVO )</p>',x:0,y:25,z:-5500},
  {id:'s2_1',html:'<h2 class="font-bebas text-orange title-section">QUIÉN SOY</h2>',x:-5,y:-25,z:-10500},
  {id:'s2_2',html:'<p class="body-text text-muted">David Milla, creador y director<br>de <span class="text-orange">DESORDEN.</span></p>',x:2,y:-5,z:-12500},
  {id:'s2_3',html:'<p class="body-text text-muted">Dirección visual, vídeo,<br>fotografía, dron, IA y web.</p>',x:-2,y:15,z:-14500},
  {id:'s2_4',html:'<p class="body-text text-muted">Un <span class="text-orange">único interlocutor</span><br>durante todo el proceso.</p>',x:4,y:35,z:-16500},
  {id:'s3_1',html:'<div class="font-bebas text-orange subtitle-small" style="border-bottom:1px solid #555;padding-bottom:10px">FORMACIONES | ACREDITACIONES</div>',x:0,y:-20,z:-21000},
  {id:'s3_2',html:'<div class="acred-col"><div class="acred-icon">G</div><div class="acred-text">Fundamentals of<br>Digital Marketing Certification</div></div>',x:-4,y:5,z:-23000},
  {id:'s3_3',html:'<div class="acred-col"><div class="acred-icon" style="display:flex;align-items:center;justify-content:center;gap:5px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:35px;height:35px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path></svg><span class="font-bebas" style="font-size:2.5rem">AESA</span></div><div class="acred-text">Certificación oficial de<br>piloto de dron (AESA)</div></div>',x:4,y:30,z:-25000},
  {id:'s4_1',html:`<div class="artist-card"><div class="avatar">[Rosalía]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROSALÍA <div class="verified-badge">${check}</div></div></div><div class="card-arrow">→</div></div>`,x:-4,y:-25,z:-30000},
  {id:'s4_2',html:`<div class="artist-card"><div class="avatar">[Rozalén]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROZALÉN <div class="verified-badge">${check}</div></div><div style="color:var(--accent-color);font-size:1.2rem;margin-top:5px">💬 ♡ @</div></div><div class="card-arrow">→</div></div>`,x:5,y:0,z:-32000},
  {id:'s4_3',html:`<div class="artist-card"><div class="avatar">[Leire]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">LEIRE MARTÍNEZ <div class="verified-badge">${check}</div></div><div style="color:var(--accent-color);margin-top:5px">···|·|||··|·|·||····</div></div><div class="card-arrow">→</div></div>`,x:-3,y:25,z:-34000},
  {id:'s5_1',html:'<h2 class="font-bebas text-orange title-section" style="line-height:.9">HABLEMOS DE TU<br>PROYECTO</h2>',x:-5,y:-30,z:-39000},
  {id:'s5_2',html:'<p class="body-text text-white">Hacemos visible lo que tienes en mente.</p>',x:4,y:-10,z:-41000},
  {id:'s5_3',html:'<div class="input-group"><div class="input-icon">👤</div><div style="color:#ddd">Nombre</div></div>',x:-2,y:5,z:-43000},
  {id:'s5_4',html:'<div class="input-group"><div class="input-icon">📞</div><div style="color:#ddd">Contacto</div></div>',x:2,y:15,z:-45000},
  {id:'s5_5',html:'<div class="input-group textarea"><div class="input-icon">🎯</div><div style="color:#ddd">Objetivo</div></div>',x:-2,y:28,z:-47000},
  {id:'s5_6',html:'<div class="btn-primary font-bebas">HABLEMOS <span style="font-family:sans-serif">→</span></div>',x:2,y:43,z:-49000},
  {id:'s5_7',html:'<div class="btn-row"><div class="btn-half font-bebas"><span style="font-family:sans-serif">💬</span> WHATSAPP</div><div class="btn-half font-bebas"><span style="font-family:sans-serif">✉</span> CORREO</div></div>',x:0,y:55,z:-51000},
  {id:'s6_1',html:'<h2 class="font-bebas text-white title-section" style="text-align:center">MANIFIESTO</h2>',x:0,y:-35,z:-56000},
  {id:'s6_2',html:'<div class="tall-text-block">No seguimos reglas.<br><span>Desafiamos</span> la gravedad digital.<br>Creamos espacios donde tu<br>marca <span>respira</span> libremente.<br>Donde cada píxel cuenta<br>una historia profunda.<br>Y cada <span>scroll</span> es<br>un viaje sin fin.</div>',x:0,y:10,z:-58000}
];
const worldEl=document.getElementById('world'),sceneEl=document.getElementById('scene'),navThumb=document.getElementById('nav-thumb'),currentPageEl=document.getElementById('current-page'),sectionNameEl=document.getElementById('hud-section-name'),loader=document.getElementById('loader');
const domElements=[];sceneData.forEach(item=>{const el=document.createElement('div');if(item.type==='stardust'){el.className='hologram stardust-container';worldEl.appendChild(el);domElements.push({element:el,data:item,stardust:new StardustImage(item.src,el)})}else{el.className='hologram';el.innerHTML=item.html;worldEl.appendChild(el);domElements.push({element:el,data:item})}});
let assetsLoaded=false,sceneStarted=false,simulatedProgress=0,currentWordIndex=0,pendingWordIndex=0,loaderAnimating=false,animFinished=false,launchStarted=false;
const loaderWords=['D','E','S','O','R','D','E','N'];
const loaderTxtEl=document.getElementById('loader-text-3d');
const loaderContainer=document.getElementById('loader');
const cookieWrapper=document.getElementById('cookie-wrapper');
const btnAccept=document.getElementById('btn-accept-cookies');
let cookiesAccepted=false;
try{cookiesAccepted=localStorage.getItem('desorden_cookies')==='true'}catch{}
function checkLoadingState(){assetsLoaded=true}
function animateNextLoaderLetter(){
  if(loaderAnimating||currentWordIndex>=pendingWordIndex||animFinished)return;
  loaderAnimating=true;
  const nextIndex=currentWordIndex+1;
  loaderTxtEl.style.transition='transform .1s ease-in,opacity .1s ease';
  loaderTxtEl.style.transform='rotateX(90deg)';
  loaderTxtEl.style.opacity='0';
  setTimeout(()=>{
    loaderTxtEl.textContent=loaderWords[nextIndex];
    loaderTxtEl.style.transition='none';
    loaderTxtEl.style.transform='rotateX(-90deg)';
    void loaderTxtEl.offsetWidth;
    loaderTxtEl.style.transition='transform .1s ease-out,opacity .1s ease';
    loaderTxtEl.style.transform='rotateX(0deg)';
    loaderTxtEl.style.opacity='1';
    currentWordIndex=nextIndex;
    setTimeout(()=>{loaderAnimating=false;animateNextLoaderLetter();checkLoaderCompletion()},105);
  },100);
}
function requestLoaderIndex(index){pendingWordIndex=Math.max(pendingWordIndex,Math.min(loaderWords.length-1,index));animateNextLoaderLetter()}
function launchExperience(){
  if(launchStarted)return;
  launchStarted=true;
  cookieWrapper.classList.remove('visible');
  setTimeout(()=>{
    loaderContainer.style.opacity='0';
    setTimeout(()=>{
      loaderContainer.style.display='none';
      if(!sceneStarted){sceneStarted=true;updateScene()}
    },500);
  },200);
}
function checkFinalLaunch(){
  if(!animFinished)return;
  if(cookiesAccepted)launchExperience();
  else cookieWrapper.classList.add('visible');
}
function checkLoaderCompletion(){
  if(animFinished||simulatedProgress<100||currentWordIndex!==loaderWords.length-1||loaderAnimating)return;
  animFinished=true;
  checkFinalLaunch();
}
btnAccept.addEventListener('click',()=>{
  try{localStorage.setItem('desorden_cookies','true')}catch{}
  cookiesAccepted=true;
  checkFinalLaunch();
});
let loaderLastTime=performance.now();
function updateLoaderProgress(now){
  if(animFinished)return;
  const frameScale=Math.min(4,(now-loaderLastTime)/16.667||1);
  loaderLastTime=now;
  const target=assetsLoaded?100:90;
  const rate=assetsLoaded?.18:.012;
  simulatedProgress+=(target-simulatedProgress)*(1-Math.pow(1-rate,frameScale));
  if(assetsLoaded&&simulatedProgress>99.35)simulatedProgress=100;
  requestLoaderIndex(Math.min(loaderWords.length-1,Math.floor(simulatedProgress/12.5)));
  checkLoaderCompletion();
  requestAnimationFrame(updateLoaderProgress);
}
requestAnimationFrame(updateLoaderProgress);
const minZ=Math.min(...sceneData.map(item=>item.z)),requiredCameraTravel=Math.abs(minZ)+5000,maxVirtualScroll=25000,lerpFactor=.12;
let currentScroll=0,targetScroll=0,globalPanX=0,globalPanY=0,touchStartY=0;
const sectionNames=['INICIO','INTRODUCCIÓN','QUIÉN SOY','FORMACIONES','ARTISTAS','PROYECTO','MANIFIESTO'];
let cx=innerWidth/100,cy=innerHeight/100;
function updateViewportMetrics(){cx=innerWidth/100;cy=innerHeight/100}
addEventListener('resize',updateViewportMetrics,{passive:true});
addEventListener('touchstart',e=>{if(!sceneStarted)return;touchStartY=e.touches[0].clientY},{passive:true});
addEventListener('touchmove',e=>{if(!sceneStarted)return;const touchY=e.touches[0].clientY;targetScroll+=((touchStartY-touchY)*4.5);targetScroll=Math.max(0,Math.min(targetScroll,maxVirtualScroll));touchStartY=touchY},{passive:true});
addEventListener('wheel',e=>{if(!sceneStarted)return;targetScroll+=e.deltaY*2;targetScroll=Math.max(0,Math.min(targetScroll,maxVirtualScroll))},{passive:true});
function updateScene(){
  currentScroll+=(targetScroll-currentScroll)*lerpFactor;
  const scrollProgress=currentScroll/maxVirtualScroll;
  const cameraZ=scrollProgress*requiredCameraTravel;
  const t=Math.min(1,Math.max(0,cameraZ/requiredCameraTravel));
  const adjustedT=Math.pow(t,1.2);
  globalPanX=Math.sin(adjustedT*Math.PI*1.5)*12;
  globalPanY=Math.sin(t*Math.PI*2.5)*4;
  sceneEl.style.perspectiveOrigin=`${50+globalPanX}% ${50+globalPanY}%`;
  worldEl.style.transform=`rotateX(${Math.sin(t*Math.PI*2.5)*1.5}deg) rotateY(${-Math.cos(adjustedT*Math.PI*1.5)*2}deg)`;
  navThumb.style.top=`${scrollProgress*80}%`;
  let activePage=1;
  if(scrollProgress<.05)activePage=1;
  else if(scrollProgress<.18)activePage=2;
  else if(scrollProgress<.35)activePage=3;
  else if(scrollProgress<.5)activePage=4;
  else if(scrollProgress<.65)activePage=5;
  else if(scrollProgress<.82)activePage=6;
  else activePage=7;
  const formatted=String(activePage).padStart(2,'0');
  if(currentPageEl.innerText!==formatted){
    currentPageEl.innerText=formatted;
    sectionNameEl.style.opacity=0;
    setTimeout(()=>{sectionNameEl.innerText=sectionNames[activePage-1];sectionNameEl.style.opacity=1},150);
  }
  domElements.forEach(item=>{
    const trueZ=item.data.z+cameraZ;
    let zAbsoluta=trueZ;
    let renderX=item.data.x;
    if(item.data.id==='s0_img'&&cameraZ>150){
      renderX+=(cameraZ-150)*.015;
      zAbsoluta=item.data.z+150;
    }
    if(item.data.type==='stardust'){
      item.element.style.display='inline-block';
      item.stardust.update(trueZ);
      item.element.style.transform=`translate(-50%,-50%) translate3d(${renderX*cx}px,${item.data.y*cy}px,${zAbsoluta}px)`;
      item.element.style.opacity='1';
      item.element.style.filter='none';
      return;
    }
    const distance=Math.abs(trueZ+600);
    const core=1200;
    const transition=3500;
    let opacity=distance>core?1-((distance-core)/transition):1;
    opacity=Math.max(0,Math.min(1,opacity));
    const blur=(1-opacity)*10;
    if(opacity>.01){
      item.element.style.transform=`translate(-50%,-50%) translate3d(${renderX*cx}px,${item.data.y*cy}px,${zAbsoluta}px)`;
      item.element.style.opacity=opacity;
      item.element.style.filter=blur>.01?`blur(${blur}px)`:'none';
      item.element.style.display='block';
    }else{
      item.element.style.display='none';
    }
  });
  requestAnimationFrame(updateScene);
}
addEventListener('load',()=>setTimeout(()=>{if(!assetsLoaded)checkLoadingState()},3000),{once:true});
