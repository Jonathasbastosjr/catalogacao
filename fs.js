// fs.js v7
const DB_NAME = 'catalogoFSv7';
const STORE = 'handles';

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
async function idbSet(key, value){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = ()=> resolve();
    tx.onerror = ()=> reject(tx.error);
  });
}
async function idbGet(key){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = ()=> resolve(req.result || null);
    req.onerror = ()=> reject(req.error);
  });
}

export async function chooseImagesDir(){
  if(!window.showDirectoryPicker){
    alert('Seu navegador não suporta salvar direto na pasta. Use Chrome/Edge (https/localhost) ou exportação ZIP.');
    return null;
  }
  const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
  try{
    if((dir.name || '').toLowerCase() !== 'imagens'){
      const ok = confirm('A pasta não é "imagens". Recomendo escolher "imagens" ao lado do site para caminhos relativos. Continuar?');
      if(!ok) return null;
    }
  }catch{}
  await idbSet('imagesDir', dir);
  return dir;
}
export async function getImagesDir(){ return await idbGet('imagesDir'); }
export async function verifyImagesDirAccess(){
  const dir = await getImagesDir();
  if(!dir) return false;
  try{ const perm = await dir.requestPermission({ mode: 'readwrite' }); return perm === 'granted'; }
  catch{ return false; }
}
export async function ensureImagesDir(){
  let dir = await getImagesDir();
  if(dir){
    const ok = await verifyImagesDirAccess();
    if(ok) return dir;
  }
  dir = await chooseImagesDir();
  return dir;
}

function slugify(s){
  return (s||'').normalize('NFD').replace(/\p{Diacritic}+/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function idDigits(id){ const m = (id||'').match(/#\s?(\d+)/); return m ? m[1] : '00000'; }

export async function saveImageFileToDir(dir, file, meta){
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const artist = slugify(meta.artist || '');
  const title = slugify(meta.title || '');
  const idNum = idDigits(meta.artwork_id || '');
  const seq = String((meta.seq||1)).padStart(2,'0');
  let base = `${idNum}_${artist}_${title}_${seq}.${ext}`;

  try{
    const test = await dir.getFileHandle(base).catch(()=>null);
    if(test){
      let s = 2;
      while(true){
        const candidate = `${idNum}_${artist}_${title}_${String(s).padStart(2,'0')}.${ext}`;
        const ex = await dir.getFileHandle(candidate).catch(()=>null);
        if(!ex){ base = candidate; break; }
        s++;
      }
    }
  }catch{}

  const fh = await dir.getFileHandle(base, { create: true });
  const ws = await fh.createWritable();
  await ws.write(file);
  await ws.close();
  return `imagens/${base}`;
}
