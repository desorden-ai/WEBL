const sceneData=[
{id:'s1_1',html:'<h1 class="font-bebas text-white title-huge">TU</h1>',x:-3,y:-15,z:-1000},
{id:'s1_2',html:'<h1 class="font-bebas text-orange title-huge">PARTNER</h1>',x:2,y:5,z:-3000},
{id:'s1_3',html:'<p class="body-text text-muted" style="font-size:0.9rem;letter-spacing:2px;">( TECNOLÓGICO Y CREATIVO )</p>',x:0,y:25,z:-5000},
{id:'s2_img',html:'<div class="main-image-container"><img src="1000091735.jpg" class="main-image" alt="Retrato"></div>',x:0,y:-5,z:-9000},
{id:'s2_1',html:'<h2 class="font-bebas text-orange title-section">QUIÉN SOY</h2>',x:-5,y:-25,z:-12500},
{id:'s2_2',html:'<p class="body-text text-muted">David Milla, creador y director<br>de <span class="text-orange">DESORDEN.</span></p>',x:2,y:-5,z:-14500},
{id:'s2_3',html:'<p class="body-text text-muted">Dirección visual, vídeo,<br>fotografía, dron, IA y web.</p>',x:-2,y:15,z:-16500},
{id:'s2_4',html:'<p class="body-text text-muted">Un <span class="text-orange">único interlocutor</span><br>durante todo el proceso.</p>',x:4,y:35,z:-18500},
{id:'s3_1',html:'<div class="font-bebas text-orange subtitle-small" style="border-bottom:1px solid #555;padding-bottom:10px;">FORMACIONES | ACREDITACIONES</div>',x:0,y:-20,z:-23000},
{id:'s3_2',html:'<div class="acred-col"><div class="acred-icon">G</div><div class="acred-text">Fundamentals of<br>Digital Marketing Certification</div></div>',x:-4,y:5,z:-25000},
{id:'s3_3',html:'<div class="acred-col"><div class="acred-icon" style="display:flex;align-items:center;justify-content:center;gap:5px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:35px;height:35px;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path></svg><span class="font-bebas" style="font-size:2.5rem;">AESA</span></div><div class="acred-text">Certificación oficial de<br>piloto de dron (AESA)</div></div>',x:4,y:30,z:-27000},
{id:'s4_1',html:'<div class="artist-card"><div class="avatar">[Rosalía]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROSALÍA <div class="verified-badge"><svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div></div><div class="card-arrow">→</div></div>',x:-4,y:-25,z:-32000},
{id:'s4_2',html:'<div class="artist-card"><div class="avatar">[Rozalén]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROZALÉN <div class="verified-badge"><svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div><div style="color:var(--accent-color);font-size:1.2rem;margin-top:5px;">💬 ♡ @</div></div><div class="card-arrow">→</div></div>',x:5,y:0,z:-34000},
{id:'s4_3',html:'<div class="artist-card"><div class="avatar">[Leire]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">LEIRE MARTÍNEZ <div class="verified-badge"><svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div><div style="color:var(--accent-color);margin-top:5px;">···|·|||··|·|·||····</div></div><div class="card-arrow">→</div></div>',x:-3,y:25,z:-36000},
{id:'s5_1',html:'<h2 class="font-bebas text-orange title-section" style="line-height:0.9;">HABLEMOS DE TU<br>PROYECTO</h2>',x:-5,y:-30,z:-41000},
{id:'s5_2',html:'<p class="body-text text-white">Hacemos visible lo que tienes en mente.</p>',x:4,y:-10,z:-43000},
{id:'s5_3',html:'<div class="input-group"><div class="input-icon">👤</div><div style="color:#ddd;">Nombre</div></div>',x:-2,y:5,z:-45000},
{id:'s5_4',html:'<div class="input-group"><div class="input-icon">📞</div><div style="color:#ddd;">Contacto</div></div>',x:2,y:15,z:-47000},
{id:'s5_5',html:'<div class="input-group textarea"><div class="input-icon">🎯</div><div style="color:#ddd;">Objetivo</div></div>',x:-2,y:28,z:-49000},
{id:'s5_6',html:'<div class="btn-primary font-bebas">HABLEMOS <span style="font-family:sans-serif;">→</span></div>',x:2,y:43,z:-51000},
{id:'s5_7',html:'<div class="btn-row"><div class="btn-half font-bebas"><span style="font-family:sans-serif;">💬</span> WHATSAPP</div><div class="btn-half font-bebas"><span style="font-family:sans-serif;">✉</span> CORREO</div></div>',x:0,y:55,z:-53000},
{id:'s6_1',html:'<h2 class="font-bebas text-white title-section" style="text-align:center;">MANIFIESTO</h2>',x:0,y:-35,z:-58000},
{id:'s6_2',html:'<div class="tall-text-block">No seguimos reglas.<br><span>Desafiamos</span> la gravedad digital.<br>Creamos espacios donde tu<br>marca <span>respira</span> libremente.<br>Donde cada píxel cuenta<br>una historia profunda.<br>Y cada <span>scroll</span> es<br>un viaje sin fin.</div>',x:0,y:10,z:-60000}
];
const worldEl=document.getElementById('world');
const sceneEl=document.getElementById('scene');
const navThumb=document.getElementById('nav-thumb');
const currentPageEl=document.getElementById('current-page');
const sectionNameEl=document.getElementById('hud-section-name');
const domElements=[];
sceneData.forEach(item=>{const el=document.createElement('div');el.className='hologram';el.innerHTML=item.html;worldEl.appendChild(el);domElements.push({element:el,data:item});});
const mainPortrait=document.querySelector('.main-image');
mainPortrait?.addEventListener('error',async()=>{try{const parts=await Promise.all([0,1,2,3,4].map(index=>fetch(`portrait-${index}.b64`).then(response=>response.text())));mainPortrait.src=`data:image/jpeg;base64,${parts.join('')}`;}catch{}},{once:true});
const minZ=Math.min(...sceneData.map(item=>item.z));
const requiredCameraTravel=Math.abs(minZ)+5000;
const maxVirtualScroll=25000;
let currentScroll=0;
let targetScroll=0;
const lerpFactor=.12;
let globalPanX=0;
let globalPanY=0;
const sectionNames=['INTRODUCCIÓN','LA IMAGEN','QUIÉN SOY','FORMACIONES','ARTISTAS','PROYECTO','MANIFIESTO'];
let touchStartY=0;
window.addEventListener('touchstart',e=>{touchStartY=e.touches[0].clientY;},{passive:false});
window.addEventListener('touchmove',e=>{e.preventDefault();const touchY=e.touches[0].clientY;const deltaY=touchStartY-touchY;targetScroll+=deltaY*4.5;targetScroll=Math.max(0,Math.min(targetScroll,maxVirtualScroll));touchStartY=touchY;},{passive:false});
window.addEventListener('wheel',e=>{e.preventDefault();targetScroll+=e.deltaY*2;targetScroll=Math.max(0,Math.min(targetScroll,maxVirtualScroll));},{passive:false});
function updateScene(){
currentScroll+=(targetScroll-currentScroll)*lerpFactor;
const scrollProgress=currentScroll/maxVirtualScroll;
const cameraZ=scrollProgress*requiredCameraTravel;
const t=Math.min(1,Math.max(0,cameraZ/requiredCameraTravel));
const adjustedT=Math.pow(t,1.2);
const targetPanX=Math.sin(adjustedT*Math.PI*1.5)*12;
const targetPanY=Math.sin(t*Math.PI*2.5)*4;
const targetRotY=-Math.cos(adjustedT*Math.PI*1.5)*2;
const targetRotX=Math.sin(t*Math.PI*2.5)*1.5;
globalPanX=targetPanX;
globalPanY=targetPanY;
sceneEl.style.perspectiveOrigin=`${50+globalPanX}% ${50+globalPanY}%`;
worldEl.style.transform=`rotateX(${targetRotX}deg) rotateY(${targetRotY}deg)`;
const cx=window.innerWidth/100;
const cy=window.innerHeight/100;
navThumb.style.top=`${scrollProgress*80}%`;
let activePage=1;
if(scrollProgress<.1)activePage=1;else if(scrollProgress<.22)activePage=2;else if(scrollProgress<.38)activePage=3;else if(scrollProgress<.52)activePage=4;else if(scrollProgress<.68)activePage=5;else if(scrollProgress<.85)activePage=6;else activePage=7;
const formattedPage=activePage.toString().padStart(2,'0');
if(currentPageEl.innerText!==formattedPage){currentPageEl.innerText=formattedPage;sectionNameEl.style.opacity=0;setTimeout(()=>{sectionNameEl.innerText=sectionNames[activePage-1];sectionNameEl.style.opacity=1;},150);}
domElements.forEach(item=>{
const zAbsoluta=item.data.z+cameraZ;
const optimalZ=-600;
const distanceFromOptimal=Math.abs(zAbsoluta-optimalZ);
const coreVisibleRange=1200;
const fadeTransition=3500;
let opacity=1;
if(distanceFromOptimal>coreVisibleRange){opacity=1-((distanceFromOptimal-coreVisibleRange)/fadeTransition);}
opacity=Math.max(0,Math.min(1,opacity));
const maxBlur=10;
const blurAmount=(1-opacity)*maxBlur;
if(opacity>.01){const pxX=item.data.x*cx;const pxY=item.data.y*cy;item.element.style.transform=`translate(-50%, -50%) translate3d(${pxX}px, ${pxY}px, ${zAbsoluta}px)`;item.element.style.opacity=opacity;item.element.style.filter=`blur(${blurAmount}px)`;item.element.style.display='block';}else{item.element.style.display='none';}
});
requestAnimationFrame(updateScene);
}
const bgCanvas=document.getElementById('stars-canvas');
const ctx=bgCanvas.getContext('2d');
let width,height;
let stars=[];
const numStars=150;
function initStars(){width=bgCanvas.width=window.innerWidth;height=bgCanvas.height=window.innerHeight;stars=[];for(let i=0;i<numStars;i++){stars.push({x:(Math.random()-.5)*width*2,y:(Math.random()-.5)*height*2,z:Math.random()*3000,radius:Math.random()*1.2+.5});}}
let lastScrollForStars=0;
function renderStars(){ctx.clearRect(0,0,width,height);const scrollDelta=currentScroll-lastScrollForStars;lastScrollForStars=currentScroll;const speed=2+(scrollDelta*.1);const starPanX=(globalPanX/20)*(width*.1);const starPanY=(globalPanY/10)*(height*.1);const centerX=(width/2)+starPanX;const centerY=(height/2)+starPanY;ctx.fillStyle='rgba(255, 255, 255, 0.8)';for(let i=0;i<numStars;i++){const star=stars[i];star.z-=speed;if(star.z<=0){star.x=(Math.random()-.5)*width*2;star.y=(Math.random()-.5)*height*2;star.z=3000;}const k=800/star.z;const px=star.x*k+centerX;const py=star.y*k+centerY;if(px>=0&&px<=width&&py>=0&&py<=height){const size=star.radius*k;ctx.globalAlpha=Math.min(1,(1-star.z/3000)*1.5);ctx.beginPath();ctx.arc(px,py,size,0,Math.PI*2);ctx.fill();}}requestAnimationFrame(renderStars);}
window.addEventListener('resize',initStars);
initStars();
renderStars();
updateScene();