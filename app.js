// app.js v7
const grid = document.getElementById('grid');
const qGlobal = document.getElementById('qGlobal');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const btnPdf = document.getElementById('btnPdf');
const fileImport = document.getElementById('fileImport');
const dialog = document.getElementById('detailDialog');
const detail = document.getElementById('detailContent');
const btnCloseDialog = document.getElementById('btnCloseDialog');

function normalize(s){ return (s||'').toString().toLowerCase(); }
function matches(it){
  const q = normalize(qGlobal.value).trim();
  if(!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const hay = normalize([it.title, it.artist?.name, it.technique, it.support, it.category, it.date, it.loan_status, it.observations, it.location, it.accession_number, it.artwork_id, (it.keywords||[]).join(' ')].filter(Boolean).join(' '));
  return tokens.every(tok => hay.includes(tok));
}
function fmtDims(it){ return it.dimensions ? [it.dimensions.h_cm, it.dimensions.w_cm, it.dimensions.d_cm].filter(v=>v!=null).join(' × ') + ' cm' : '-'; }
function currentItems(){ return getAllWorks().filter(matches); }

function render(){
  const items = currentItems();
  grid.innerHTML = '';
  if(items.length === 0){ grid.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
  for(const it of items){
    const card = document.createElement('div'); card.className = 'card';
    const thumb = document.createElement('div'); thumb.className = 'thumb';
    const img = document.createElement('img'); img.src = it.images?.[0]?.url || 'https://via.placeholder.com/640x480?text=Sem+Imagem'; img.alt = it.title || 'Obra';
    thumb.appendChild(img);
    const meta = document.createElement('div'); meta.className = 'meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = it.title || '—';
    const artist = document.createElement('div'); artist.className='artist'; artist.textContent = it.artist?.name || 'Autor desconhecido';
    const badges = document.createElement('div'); badges.className='badges';
    const addBadge = (txt)=>{ const b=document.createElement('span'); b.className='badge'; b.textContent=txt; badges.appendChild(b); };
    if(it.technique) addBadge(it.technique);
    if(it.category) addBadge(it.category);
    if(it.loan_status) addBadge(it.loan_status);
    const btn = document.createElement('button'); btn.textContent = 'Ver ficha'; btn.addEventListener('click', ()=>openDetail(it));
    meta.append(title, artist, badges);
    card.append(thumb, meta, btn);
    grid.appendChild(card);
  }
}

function dlTerm(dt, dd){ return `<dt>${dt}</dt><dd>${dd ?? '-'}</dd>`; }
function openDetail(it){
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
      ${dlTerm('Dimensões', fmtDims(it))}
      ${dlTerm('Categoria', it.category)}
      ${dlTerm('Emprestada ou em Restauro', it.loan_status || '')}
      ${dlTerm('Observações', it.observations || '')}
      ${dlTerm('Localização', it.location)}
      ${dlTerm('ID', it.artwork_id)}
      ${dlTerm('Palavras‑chave', kws)}
      ${dlTerm('Procedência', it.provenance)}
    </dl>
    <div class="toolbar">
      <button class="editBtn" id="btnEdit">✏️ Editar</button>
      <button class="deleteBtn" id="btnDelete">🗑️ Excluir</button>
    </div>
  </div>`;
  detail.innerHTML = `<div class="detail">${hero}${info}</div>`;
  btnCloseDialog.onclick = ()=> dialog.close();
  document.getElementById('btnDelete').onclick = ()=>{
    const id = it.artwork_id || ''; const sig = makeSignature(it);
    if(confirm('Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.')){ removeWorkByIdOrSignature(id, sig); dialog.close(); render(); alert('Obra excluída.'); }
  };
  document.getElementById('btnEdit').onclick = ()=>{ setEditTarget(it); window.location.href = 'cadastrar.html?edit=1'; };
  dialog.showModal();
}

// Exportar PDF — NÃO inclui artwork_id
function exportPDF(items){
  const win = window.open('', '_blank'); if(!win){ alert('Bloqueio de pop-up: permita pop-ups para exportar PDF.'); return; }
  const styles = `
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    h1 { font-size: 16pt; margin: 0 0 12px 0; }
    .item { display: grid; grid-template-columns: 90px 1fr; gap: 12px; padding: 10px 0; }
    .sep { border-top: 1px solid #ccc; margin: 10px 0; }
    .thumb { width: 90px; height: 90px; background: #f1f1f1; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .meta { font-size: 10.5pt; line-height: 1.35; }
    .meta div { margin: 2px 0; }
    .item:nth-of-type(7n) + .sep { page-break-after: always; }
  </style>`;
  const rows = items.map(it => {
    const img = (it.images && it.images[0] && it.images[0].url) ? `<img src="${it.images[0].url}" alt="">` : '';
    const dims = fmtDims(it);
    return `
    <div class="item">
      <div class="thumb">${img}</div>
      <div class="meta">
        <div><strong>${it.artist?.name || 'Autor desconhecido'}</strong> — <em>${it.title || '—'}</em></div>
        <div>${it.date || '—'} • ${it.technique || '—'} • ${dims}</div>
      </div>
    </div>
    <div class="sep"></div>`;
  }).join('');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Exportação — Catálogo</title>${styles}</head><body>
    <h1>Lista de obras (${items.length})</h1>
    ${rows}
  </body></html>`);
  win.document.close();
  const imgs = win.document.images; let loaded = 0;
  if(imgs.length === 0){ win.focus(); win.print(); return; }
  for(const img of imgs){
    if(img.complete) { loaded++; if(loaded===imgs.length){ win.focus(); win.print(); } }
    else { img.onload = img.onerror = ()=>{ loaded++; if(loaded===imgs.length){ win.focus(); win.print(); } }; }
  }
}

qGlobal.addEventListener('input', render);
btnClear.addEventListener('click', ()=>{ qGlobal.value=''; render(); });
btnExport.addEventListener('click', exportJSON);
btnImport.addEventListener('click', ()=>fileImport.click());
fileImport.addEventListener('change', (e)=>{ const f = e.target.files?.[0]; if(f) importJSONFromFile(f, ok=>{ if(ok){ alert('Dados importados com sucesso.'); render(); } }); });
btnPdf.addEventListener('click', ()=>{ const items = currentItems(); if(items.length===0){ alert('Nenhum item para exportar.'); return; } exportPDF(items); });

render();
