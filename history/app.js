const archivePhotos = [{"id":"nyc-2024","year":2024,"city":"NYC","alt":"A presentation at CC Fest, with the audience facing a bright projection.","caption":"Pictures from CC Fest NYC at the Dalton School in January 2024 by Asher Dorlester.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1706655486222-R8BXIP1UVKDTRPI6X4ZI/2024+CC+Fest-03.jpg","sha256":"435fcc838598b417b4ed520113cab3935a0c4bdef7815a34f19b674163f46679","images":{"360":"assets/photos/nyc-2024-360.webp","1080":"assets/photos/nyc-2024-1080.webp"}},{"id":"live-code-2024","year":2024,"city":"NYC","alt":"A presenter points to a live coding projection.","caption":"Pictures from CC Fest NYC at the Dalton School in January 2024 by Asher Dorlester.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1706655506131-HTPE0ZQILOAL6Y007Q3C/2024+CC+Fest-11.jpg","sha256":"7bddb061fea156f70ca71fe74b1f79711356f194c28cb9c054d1c3c873cd08f0","images":{"360":"assets/photos/live-code-2024-360.webp","1080":"assets/photos/live-code-2024-1080.webp"}},{"id":"nyc-2023","year":2023,"city":"NYC","alt":"People gather around a table of colorful stickers and printed materials.","caption":"Pictures from CC Fest NYC at the Dalton School in January 2023 by Asher Dorlester.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1675361279432-TJZCLPOALWZM597LOAQP/CC+Fest+2023+-+3.jpeg","sha256":"26ce77c86a540bb6271f21d4f00f65424d7e184f98f07633745184c10f85862d","images":{"360":"assets/photos/nyc-2023-360.webp","1080":"assets/photos/nyc-2023-1080.webp"}},{"id":"nyc-2019","year":2019,"city":"NYC","alt":"An audience fills the open workshop space at NYU ITP.","caption":"Pictures from CC Fest NYC at ITP-NYU in December 2019 by Yiting Liu.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1575993375070-QQ1KH9RBVWLEJAJ9RRCT/CCFest-2.jpg","sha256":"bc5007fddc7c1abcc71b5963e88a3eaec60107086e509457b8fc44bc2ab00479","images":{"360":"assets/photos/nyc-2019-360.webp","1080":"assets/photos/nyc-2019-1080.webp"}},{"id":"sf-2019","year":2019,"city":"SF","alt":"A presenter speaks in a light-filled room at San Francisco Friends School.","caption":"Pictures from CC Fest SF at SF Friends in October 2019 by Ryan Gallagher.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1572961784116-OE3M9W6FLMKU1RNHH9C9/IMG_4295.jpg","sha256":"14554661e8e4717c44ad26cb324d4105bb897968a50b7b8f51ef58cd89e325ea","images":{"360":"assets/photos/sf-2019-360.webp","1080":"assets/photos/sf-2019-1080.webp"}},{"id":"group-2019","year":2019,"city":"NYC","alt":"A group photograph at NYU MAGNET, with everyone gathered in front of a red wall.","caption":"Pictures from CC Fest NYC at NYU MAGNET in June 2019 below by Colin Samuels and Ella Chung.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1560182674787-3HOKK6M829WHFSQQ2NCO/IMG_0119.jpg","sha256":"559fd11bc385a2d4346df920cfb2af6e07a9cb89619205935f7154f920fa5b06","images":{"360":"assets/photos/group-2019-360.webp","1080":"assets/photos/group-2019-1080.webp"}},{"id":"sf-2018","year":2018,"city":"SF","alt":"Two presenters lead a session in the school library.","caption":"Pictures from CC Fest SF at SF Friends in October 2018 by Ryan Gallagher and Eric Wild.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1539869518660-F2CH26S37RVF85ZLT3F0/d7LejodmTdiXVVgvgIyu2w_thumb_19.jpg","sha256":"61b2ebe650676200af2a5c42b9981ea64501ff72370244bc2400806cc66304e4","images":{"360":"assets/photos/sf-2018-360.webp","1080":"assets/photos/sf-2018-1080.webp"}},{"id":"la-2018","year":2018,"city":"LA","alt":"A panel of presenters in conversation at UCLA.","caption":"Pictures from CC Fest LA at UCLA in September 2018.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1540560142695-HWEXUH13BWUK44OS8PH1/09082018_CCFest.HB19.jpg","sha256":"c48c4cd4735410dc6c63815931a3b2484a5e96194126d4e2c1282006f69a8644","images":{"360":"assets/photos/la-2018-360.webp","1080":"assets/photos/la-2018-1080.webp"}},{"id":"nyc-2017","year":2017,"city":"NYC","alt":"A workshop audience watches a presentation projected across the room.","caption":"Pictures from CC Fest NYC at ITP-NYU in November 2017 by Ellen Nickels and Dominic Barrett.","source":"https://images.squarespace-cdn.com/content/v1/57bb3c10bebafb700491c863/1510602096324-8N8SXF7TUKGJDE56KO4V/20171112-_MG_1504.jpg","sha256":"d2b2b15351628b344dab7ebff957c14ef6d6fb2c65abba305059cbc543dfa0f4","images":{"360":"assets/photos/nyc-2017-360.webp","1080":"assets/photos/nyc-2017-1080.webp"}}];
'use strict';
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let selectedYear='2016',selectedCity='all';
const eventNodes=$$('.event');
function filterEvents(){
  let count=0;
 for(const el of eventNodes){
  const show=(selectedYear==='all'||el.dataset.year===selectedYear)&&(selectedCity==='all'||el.dataset.city===selectedCity);
  el.hidden=!show;if(show&&!el.classList.contains('upcoming')&&!el.classList.contains('camp'))count++;
 }
 $('#result-count').textContent=`${count} documented festival${count===1?'':'s'}${selectedYear==='all'?'':` · ${selectedYear}`}`;
 $$('#year-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===selectedYear)));
 $$('.location-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===selectedCity)));
 let empty=$('#empty-state');
 if(!empty){empty=document.createElement('p');empty.id='empty-state';empty.className='empty-state';empty.textContent='No festivals match these filters. Try another year or place.';$('#events').append(empty)}
 empty.hidden=eventNodes.some(el=>!el.hidden);
 const yr=Number(selectedYear);
 $('#era-copy').textContent=selectedYear==='all'?'The format changed. The invitation stayed open.':yr<2020?'Shared tables. New ideas. A growing circle of makers.':yr<2023?'The room became a link. The community kept making.':yr<2025?'In-person gatherings and virtual connections. More ways to belong.':'Virtual festivals and online camps. The invitation keeps going.';
}
// The year panel under the chart shows one year at a time, and the chart column for that year is highlighted.
function showYearPanel(year){
 $$('[data-year-panel]').forEach(p=>p.hidden=p.dataset.yearPanel!==String(year));
 $$('.event-chart [data-chart-year]').forEach(c=>c.classList.toggle('is-selected',c.dataset.chartYear===String(year)));
}
$$('[data-year]').filter(el=>el.tagName==='BUTTON').forEach(b=>b.addEventListener('click',()=>{selectedYear=b.dataset.year;filterEvents();if(selectedYear!=='all')showYearPanel(selectedYear)}));
$$('[data-city]').filter(el=>el.tagName==='BUTTON').forEach(b=>b.addEventListener('click',()=>{selectedCity=b.dataset.city;filterEvents()}));
// Choosing a year in the chart opens its festivals below the chart and filters the timeline. The panel's button jumps to the timeline.
$$('.event-chart [data-chart-year]').forEach(a=>a.addEventListener('click',event=>{
 event.preventDefault();selectedYear=a.dataset.chartYear;selectedCity='all';filterEvents();showYearPanel(selectedYear);
}));
let galleryCity='all',currentPhoto=0,photoOpener=null;
const dialog=$('#photo-dialog');
const availablePhotos=()=>archivePhotos.map((p,i)=>({p,i})).filter(({p})=>galleryCity==='all'||p.city===galleryCity);
function showPhoto(index){
 currentPhoto=index;const p=archivePhotos[index];
 $('#full-photo').src=p.images['1080'];$('#full-photo').alt=p.alt;
 $('#photo-caption').textContent=p.caption+(p.id==='la-2018'?' Photographer not named in the source.':'');
 $('#photo-source').href=p.source;
 const photos=availablePhotos();$('#photo-position').textContent=`${photos.findIndex(x=>x.i===index)+1} / ${photos.length} · ${p.year}`;
}
$$('[data-photo]').forEach(a=>a.addEventListener('click',e=>{
 if(typeof dialog.showModal!=='function')return;
 e.preventDefault();photoOpener=a;showPhoto(Number(a.dataset.photo));dialog.showModal();document.body.style.overflow='hidden';$('#close-photo').focus();
}));
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{
 galleryCity=b.dataset.gallery;
 $$('[data-gallery]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));
 $$('.gallery-item').forEach(el=>el.hidden=galleryCity!=='all'&&el.dataset.photoCity!==galleryCity);
 $('#gallery-count').textContent=`${availablePhotos().length} photographs`;
}));
function stepPhoto(direction){const available=availablePhotos();const pos=available.findIndex(x=>x.i===currentPhoto);showPhoto(available[(pos+direction+available.length)%available.length].i)}
$('#previous-photo').addEventListener('click',()=>stepPhoto(-1));
$('#next-photo').addEventListener('click',()=>stepPhoto(1));
$('#close-photo').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';photoOpener?.focus()});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();stepPhoto(1)}if(e.key==='ArrowLeft'){e.preventDefault();stepPhoto(-1)}});
// Poster wall: each poster opens larger with its designer credit, when the archive names one, and its event record.
const posterDialog=$('#poster-dialog');
let posterOpener=null;
$$('[data-poster]').forEach(b=>b.addEventListener('click',()=>{
 if(typeof posterDialog.showModal!=='function')return;
 posterOpener=b;
 $('#poster-full').src=b.dataset.src;$('#poster-full').alt=b.dataset.alt;
 $('#poster-caption').textContent=b.dataset.caption;
 $('#poster-credit').textContent=b.dataset.credit;$('#poster-credit').hidden=!b.dataset.credit;
 $('#poster-source').href=b.dataset.source;$('#poster-source').textContent=b.dataset.sourceLabel;
 posterDialog.showModal();document.body.style.overflow='hidden';$('#close-poster').focus();
}));
$('#close-poster').addEventListener('click',()=>posterDialog.close());
posterDialog.addEventListener('close',()=>{document.body.style.overflow='';posterOpener?.focus()});
posterDialog.addEventListener('click',e=>{if(e.target!==posterDialog)return;const r=posterDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)posterDialog.close()});
const patterns={
 diagonal:{test:(r,c)=>r===c,code:'if (row === column) → color it blue',description:'The grid stays the same. A single rule makes the diagonal.',alt:'An eight by eight grid with a diagonal of blue circles'},
 checker:{test:(r,c)=>(r+c)%2===0,code:'if ((row + column) % 2 === 0) → color it blue',description:'Alternate the sum of row and column, and a checkerboard appears.',alt:'An eight by eight grid with alternating blue and gray circles in a checkerboard'},
 stripes:{test:(r,c)=>c%2===0,code:'if (column % 2 === 0) → color it blue',description:'Color every other column. The same grid now becomes stripes.',alt:'An eight by eight grid with alternating blue and gray vertical stripes'}
};
$$('[data-pattern]').forEach(b=>b.addEventListener('click',()=>{
 const p=patterns[b.dataset.pattern];
 $$('.pattern-cell').forEach((el,i)=>el.classList.toggle('active',p.test(Math.floor(i/8),i%8)));
 $$('[data-pattern]').forEach(btn=>btn.setAttribute('aria-pressed',String(b===btn)));
 $('#pattern-code').textContent=p.code;$('#pattern-description').textContent=p.description;$('#pattern-grid').setAttribute('aria-label',p.alt);
}));

// The people section opens with ten names picked at random on each visit, in A to Z order. The full list stays one click away.
(function(){
 const sample=$('#people-sample');if(!sample)return;
 const names=$$('#people-all > .person');
 for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
 const picked=names.slice(0,10).sort((x,y)=>x.querySelector('summary').textContent.localeCompare(y.querySelector('summary').textContent,'en',{sensitivity:'base'}));
 sample.replaceChildren(...picked.map(el=>el.cloneNode(true)));
})();
// A link to a festival or camp record opens its year, in every place, and scrolls to that record. Other fragments, such as #top or #timeline, are left to the browser.
// The browser's own fragment scroll runs before the filters hide the record, so the script scrolls to it after the filters apply.
function recordFromHash(){
 let el=null;
 try{el=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{return null}
 if(!el||!el.classList.contains('event')||!el.closest('#events'))return null;
 selectedYear=el.dataset.year;selectedCity='all';
 return el;
}
function openHashRecord(behavior){
 const el=recordFromHash();
 filterEvents();showYearPanel(selectedYear);
 if(el)el.scrollIntoView({behavior,block:'start'});
}
openHashRecord('instant');
window.addEventListener('hashchange',()=>openHashRecord(matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'));
