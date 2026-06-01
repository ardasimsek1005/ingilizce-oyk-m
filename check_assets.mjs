const url = 'https://ingilizce-oyk-m.onrender.com';
fetch(url).then(r => r.text()).then(t => {
  const cssFiles = t.match(/assets\/[^"']+\.css/g);
  const jsFiles = t.match(/assets\/[^"']+\.js/g);
  console.log('CSS:', JSON.stringify(cssFiles));
  console.log('JS:', JSON.stringify(jsFiles));
}).catch(e => console.log('ERR:', e.message));
