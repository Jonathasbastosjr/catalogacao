// storage.js — utilitário de armazenamento local + bootstrap inicial de dados
const STORAGE_KEY = 'catalogo_obras_v1';

function getAllWorks(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try { return JSON.parse(raw); } catch(e){ console.warn('JSON inválido, resetando.'); }
  }
  // seed inicial, caso não exista
  const seed = [
    {
      artwork_id: "BA-000101",
      title: "Natureza-morta com Garrafa",
      artist: { name: "Ana Souza" },
      date: "2012",
      technique: "óleo sobre tela",
      support: "tela",
      category: "pintura",
      dimensions: { h_cm: 50, w_cm: 70 },
      accession_number: "INV-2015-001",
      location: "Reserva A / Est. 2 / Prat. 3",
      condition: "estável",
      keywords: ["natureza-morta","garrafa","década 2010"],
      images: [{ url: "https://picsum.photos/seed/ba101/800/600", view: "frontal" }]
    },
    {
      artwork_id: "BA-000122",
      title: "Retrato de Jovem",
      artist: { name: "Carlos Lima" },
      date: "2001",
      technique: "acrílica sobre tela",
      support: "tela",
      category: "pintura",
      dimensions: { h_cm: 60, w_cm: 50 },
      accession_number: "INV-2005-233",
      location: "Exposição Permanente / Sala 1",
      condition: "atenção",
      keywords: ["retrato","anos 2000"],
      images: [{ url: "https://picsum.photos/seed/ba122/800/600", view: "frontal" }]
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveAllWorks(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addWork(work){
  const list = getAllWorks();
  list.unshift(work); // adiciona no topo
  saveAllWorks(list);
}

function exportJSON(){
  const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '[]'], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'acervo.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSONFromFile(file, onDone){
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const data = JSON.parse(fr.result);
      if(!Array.isArray(data)) throw new Error('JSON deve ser um array de obras');
      saveAllWorks(data);
      onDone?.(true);
    } catch(e){
      alert('Falha ao importar JSON: ' + e.message);
      onDone?.(false);
    }
  };
  fr.readAsText(file);
}
