// cadastrar.js — upload para servidor (PHP)
function setValue(name, val){ const el = document.forms['formObra'].elements[name]; if(el) el.value = val ?? ''; }
const form = document.getElementById('formObra');
const btnExport = document.getElementById('btnExport');
const btnClear = document.getElementById('btnClear');
const titleEl = document.getElementById('formTitle');
const imgPreview = document.getElementById('imgPreview');
const fileInput = document.getElementById('image_file');

btnExport.addEventListener('click', exportJSON);
btnClear.addEventListener('click', ()=> form.reset());

imgPreview.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', ()=>{
  const f = fileInput.files?.[0];
  if(!f){ imgPreview.innerHTML = '<span>Imagem da obra</span>'; return; }
  const url = URL.createObjectURL(f);
  imgPreview.innerHTML = `<img src="${url}" alt="prévia">`;
});

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
  setValue('artwork_id', w.artwork_id);
  setValue('loan_status', w.loan_status || '');
  setValue('location', w.location);
  setValue('observations', w.observations || '');
  const img = (w.images && w.images[0] && w.images[0].url) || '';
  if(img){ imgPreview.innerHTML = `<img src="${img}" alt="prévia">`; }
  return true;
}
function preloadIfCreating(){
  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  if(isEdit) return;
  const next = nextArtworkId();
  setValue('artwork_id', next);
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);

  const isEdit = (new URLSearchParams(window.location.search)).get('edit') === '1';
  const target = isEdit ? getEditTarget() : null;
  const prev = target?.work;

  let imageURL = prev?.images?.[0]?.url || '';
  const file = fileInput.files?.[0];
  if(file){
    const ufd = new FormData();
    ufd.append('file', file);
    ufd.append('id', (fd.get('artwork_id')||'').toString());
    ufd.append('artist', (fd.get('artist')||'').toString());
    ufd.append('title', (fd.get('title')||'').toString());
    try{
      const resp = await fetch('upload.php', { method:'POST', body: ufd });
      const data = await resp.json();
      if(!resp.ok || !data?.ok){ throw new Error(data?.error || 'Falha no upload'); }
      imageURL = data.url;
    }catch(err){
      alert('Erro ao enviar a imagem para o servidor: ' + (err?.message || err));
      return;
    }
  }else if(!isEdit){
    imageURL = '';
  }

  const work = {
    artwork_id: (fd.get('artwork_id')||'').toString().trim(),
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
    loan_status: (fd.get('loan_status')||'').toString(),
    observations: (fd.get('observations')||'').toString(),
    location: (fd.get('location')||'').toString().trim() || undefined,
    keywords: prev?.keywords || [],
    images: imageURL ? [{ url: imageURL, view: 'frontal' }] : []
  };

  if(!work.title || !work.artist?.name){ alert('Preencha pelo menos Artista e Título.'); return; }
  if(!work.artwork_id){ alert('Falha ao gerar ID automático. Recarregue a página e tente novamente.'); return; }

  if(isEdit){
    if(updateWorkByTarget(work, target)){
      clearEditTarget(); alert('Obra atualizada com sucesso!'); window.location.href = 'index.html'; return;
    } else { alert('Não foi possível localizar a obra a ser editada. Ela pode ter sido removida.'); return; }
  }

  addWork(work); form.reset();
  imgPreview.innerHTML = '<span>Imagem da obra</span>';
  setValue('artwork_id', nextArtworkId());
  alert('Obra cadastrada com sucesso! Ela já aparece no catálogo (index).');
});

if(!preloadIfEditing()){ preloadIfCreating(); }