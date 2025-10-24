// app.js — busca global, render e ficha com exclusão
const grid = document.getElementById('grid');
const qGlobal = document.getElementById('qGlobal');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const fileImport = document.getElementById('fileImport');
const dialog = document.getElementById('detailDialog');
const detail = document.getElementById('detailContent');
const btnCloseDialog = document.getElementById('btnCloseDialog');

let DATA = getAllWorks();

function normalize(s){ return (s||'').toString().toLowerCase(); }

function matches(it){
  const q = normalize(qGlobal.value).trim();
  if(!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);

  const hay = normalize(
    [
      it.title, it.artist?.name, it.technique, it.support, it.category,
      it.date, it.accession_number, it.artwork_id, it.location,
      (it.keywords||[]).join(' ')
    ].filter(Boolean).join(' ')
  );

  return tokens.every(tok => hay.includes(tok));
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
    <div class="toolbar">
      <button class="deleteBtn" id="btnDelete">🗑️ Excluir obra</button>
    </div>
  </div>`;

  detail.innerHTML = `<div class="detail">${hero}${info}</div>`;

  // close X
  btnCloseDialog.onclick = ()=> dialog.close();

  // delete handler
  const del = document.getElementById('btnDelete');
  del.onclick = ()=>{
    const id = it.artwork_id || '';
    const sig = makeSignature(it);
    if(confirm('Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.')){
      removeWorkByIdOrSignature(id, sig);
      dialog.close();
      render();
      alert('Obra excluída.');
    }
  };

  dialog.showModal();
}

// eventos
qGlobal.addEventListener('input', render);
btnClear.addEventListener('click', ()=>{ qGlobal.value=''; render(); });
btnExport.addEventListener('click', exportJSON);
btnImport.addEventListener('click', ()=>fileImport.click());
fileImport.addEventListener('change', (e)=>{
  const f = e.target.files?.[0];
  if(f) importJSONFromFile(f, ok=>{ if(ok){ alert('Dados importados com sucesso.'); render(); } });
});

render();
