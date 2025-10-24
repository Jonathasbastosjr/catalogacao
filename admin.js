// admin.js — cadastro + edição, com artwork_id automático "# 00001" (readonly)
const form = document.getElementById('formObra');
const btnExport = document.getElementById('btnExport');
const btnClear = document.getElementById('btnClear');
const titleEl = document.getElementById('formTitle');
const inputId = form.elements['artwork_id'];

btnExport.addEventListener('click', exportJSON);
btnClear.addEventListener('click', ()=> form.reset());

function setValue(name, val){ const el = form.elements[name]; if(el) el.value = val ?? ''; }

function preloadIfEditing(){
  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  if(!isEdit) return false;
  const target = getEditTarget();
  if(!target || !target.work){ return false; }
  const w = target.work; titleEl.textContent = 'Editar obra';
  setValue('artist', w.artist?.name); setValue('title', w.title); setValue('year', w.date);
  setValue('technique', w.technique); setValue('support', w.support); setValue('category', w.category);
  setValue('h_cm', w.dimensions?.h_cm); setValue('w_cm', w.dimensions?.w_cm); setValue('d_cm', w.dimensions?.d_cm);
  setValue('artwork_id', w.artwork_id); inputId.readOnly = true;
  setValue('accession_number', w.accession_number);
  setValue('location', w.location); setValue('condition', w.condition);
  setValue('keywords', (w.keywords||[]).join(', '));
  setValue('image_url', (w.images && w.images[0] && w.images[0].url) || '');
  return true;
}

function preloadIfCreating(){
  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  if(isEdit) return;
  const next = nextArtworkId();
  setValue('artwork_id', next);
  inputId.readOnly = true;
}

async function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const fr = new FileReader(); fr.onload = ()=>resolve(fr.result); fr.onerror = reject; fr.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);

  let imageURL = (fd.get('image_url')||'').toString().trim();
  const file = fd.get('image_file');
  if(file && file.size > 0){ try { imageURL = await fileToDataURL(file); } catch(e){ alert('Falha ao ler imagem: ' + e.message); } }

  const work = {
    artwork_id: (fd.get('artwork_id')||'').toString().trim(), // sempre presente (readonly/auto)
    title: (fd.get('title')||'').toString().trim(),
    artist: { name: (fd.get('artist')||'').toString().trim() },
    date: (fd.get('year')||'').toString().trim(),
    technique: (fd.get('technique')||'').toString().trim() || undefined,
    support: (fd.get('support')||'').toString().trim() || undefined,
    category: (fd.get('category')||'').toString().trim() || undefined,
    dimensions: {
      h_cm: fd.get('h_cm') ? Number(fd.get('h_cm')) : undefined,
      w_cm: fd.get('w_cm') ? Number(fd.get('w_cm')) : undefined,
      d_cm: fd.get('d_cm') ? Number(fd.get('d_cm')) : undefined,
    },
    accession_number: (fd.get('accession_number')||'').toString().trim() || undefined,
    location: (fd.get('location')||'').toString().trim() || undefined,
    condition: (fd.get('condition')||'').toString().trim() || undefined,
    keywords: (fd.get('keywords')||'').toString().split(',').map(s=>s.trim()).filter(Boolean),
    images: imageURL ? [{ url: imageURL, view: 'frontal' }] : []
  };

  if(!work.title || !work.artist?.name){ alert('Preencha pelo menos Artista e Título.'); return; }
  if(!work.artwork_id){ alert('Falha ao gerar ID automático. Recarregue a página e tente novamente.'); return; }

  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  if(isEdit){
    const target = getEditTarget();
    if(updateWorkByTarget(work, target)){
      clearEditTarget(); alert('Obra atualizada com sucesso!'); window.location.href = 'index.html'; return;
    } else { alert('Não foi possível localizar a obra a ser editada. Ela pode ter sido removida.'); return; }
  }

  addWork(work); form.reset();
  setValue('artwork_id', nextArtworkId()); // prepara o próximo ID
  alert('Obra cadastrada com sucesso! Ela já aparece no catálogo (index).');
});

if(!preloadIfEditing()){ preloadIfCreating(); }