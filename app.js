// app.js — renderização, busca e ficha
const grid = document.getElementById('grid');
const qArtist = document.getElementById('qArtist');
const qTitle = document.getElementById('qTitle');
const qTechnique = document.getElementById('qTechnique');
const qYear = document.getElementById('qYear');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const fileImport = document.getElementById('fileImport');
const dialog = document.getElementById('detailDialog');
const detail = document.getElementById('detailContent');

let DATA = getAllWorks();

function normalize(s){ return (s||'').toString().toLowerCase(); }

function matches(it){
  const a = normalize(qArtist.value);
  const t = normalize(qTitle.value);
  const tec = normalize(qTechnique.value);
  const y = normalize(qYear.value);

  const artist = normalize(it.artist?.name);
  const title = normalize(it.title);
  const tech = normalize(it.technique);
  const year = normalize(it.date);

  const okA = !a || artist.includes(a);
  const okT = !t || title.includes(t);
  const okTec = !tec || tech.includes(tec);
  const okY = !y || year.includes(y);

  return okA && okT && okTec && okY;
}

function render(){
  DATA = getAllWorks();
  grid.innerHTML = '';
  const items = DATA.filter(matches);
  if(items.length === 0){
    grid.innerHTML = '<p>Nenhum registro encontrado.</p>';
    return;
  }
  for(const it of items){
    const card = document.createElement('div');
    card.className = 'card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const img = document.createElement('img');
    img.src = it.images?.[0]?.url || 'https://via.placeholder.com/640x480?text=Sem+Imagem';
    img.alt = it.title || 'Obra';
    thumb.appendChild(img);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = it.title || '—';
    const artist = document.createElement('div'); artist.className='artist'; artist.textContent = it.artist?.name || 'Autor desconhecido';

    const badges = document.createElement('div'); badges.className='badges';
    const addBadge = (txt)=>{ const b=document.createElement('span'); b.className='badge'; b.textContent=txt; badges.appendChild(b); };
    if(it.technique) addBadge(it.technique);
    if(it.category) addBadge(it.category);
    if(it.condition) addBadge(it.condition);

    const btn = document.createElement('button'); btn.textContent = 'Ver ficha';
    btn.addEventListener('click', ()=>openDetail(it));

    meta.append(title, artist, badges);
    card.append(thumb, meta, btn);
    grid.appendChild(card);
  }
}

function dlTerm(dt, dd){ return `<dt>${dt}</dt><dd>${dd ?? '-'}</dd>`; }

function openDetail(it){
  const dims = it.dimensions ? [it.dimensions.h_cm, it.dimensions.w_cm, it.dimensions.d_cm].filter(v=>v!=null).join(' × ') + ' cm' : '-';
  const imgs = (it.images||[]).map(im=>`<img src="${im.url}" alt="${it.title}" style="max-width:100%;height:auto;display:block;margin-bottom:8px;">`).join('') || '<em>Sem imagem</em>';
  const kws = (it.keywords||[]).join(', ');

  const hero = `<div class="hero">${imgs}</div>`;
  const info = `
  <div class="info">
    <h2>${it.title || '—'}</h2>
    <dl>
      ${dlTerm('Artista', it.artist?.name)}
      ${dlTerm('Ano', it.date)}
      ${dlTerm('Técnica', it.technique)}
      ${dlTerm('Suporte', it.support)}
      ${dlTerm('Dimensões', dims)}
      ${dlTerm('Categoria', it.category)}
      ${dlTerm('Nº de Tombo', it.accession_number)}
      ${dlTerm('ID', it.artwork_id)}
      ${dlTerm('Localização', it.location)}
      ${dlTerm('Estado', it.condition)}
      ${dlTerm('Palavras‑chave', kws)}
      ${dlTerm('Procedência', it.provenance)}
    </dl>
  </div>`;

  detail.innerHTML = `<div class="detail">${hero}${info}</div>`;
  dialog.showModal();
}

// eventos
[qArtist, qTitle, qTechnique, qYear].forEach(inp => inp.addEventListener('input', render));
btnClear.addEventListener('click', ()=>{ qArtist.value='';qTitle.value='';qTechnique.value='';qYear.value=''; render(); });
btnExport.addEventListener('click', exportJSON);
btnImport.addEventListener('click', ()=>fileImport.click());
fileImport.addEventListener('change', (e)=>{
  const f = e.target.files?.[0];
  if(f) importJSONFromFile(f, ok=>{ if(ok){ alert('Dados importados com sucesso.'); render(); } });
});

render();
