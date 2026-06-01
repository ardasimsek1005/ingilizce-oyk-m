async function check() {
  const base = 'https://ingilizce-oyk-m.onrender.com';
  
  const health = await fetch(base + '/api/health').then(r => r.text()).catch(e => 'ERR: ' + e.message);
  console.log('Health:', health);
  
  const home = await fetch(base).then(r => r.text()).catch(e => 'ERR: ' + e.message);
  console.log('Ana sayfa ilk 500 karakter:', home.substring(0, 500));
}
check();
