// admin.js — cadastro de obras
const form = document.getElementById('formObra');
const btnExport = document.getElementById('btnExport');
const btnClear = document.getElementById('btnClear');

btnExport.addEventListener('click', exportJSON);
btnClear.addEventListener('click', ()=> form.reset());

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);

  // Se o usuário enviar arquivo de imagem, converte para dataURL
  async function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const fr = new FileReader();
      fr.onload = ()=>resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  let imageURL = (fd.get('image_url')||'').toString().trim();
  const file = fd.get('image_file');
  if(file && file.size > 0){
    try { imageURL = await fileToDataURL(file); } catch(e){ alert('Falha ao ler imagem: ' + e.message); }
  }

  const work = {
    artwork_id: (fd.get('artwork_id')||'').toString().trim() || undefined,
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

  if(!work.title || !work.artist?.name){
    alert('Preencha pelo menos Artista e Título.');
    return;
  }

  addWork(work);
  form.reset();
  alert('Obra cadastrada com sucesso! Ela já aparece no catálogo (index).');
});
