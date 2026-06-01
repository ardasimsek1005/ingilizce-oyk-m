fetch('https://ingilizce-oyk-m.onrender.com')
  .then(r => r.text())
  .then(t => console.log(t.substring(0, 1000)))
  .catch(e => console.log('ERR:', e.message));
