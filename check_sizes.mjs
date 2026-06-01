async function checkSizes() {
  const base = 'https://ingilizce-oyk-m.onrender.com';
  const html = await fetch(base).then(r => r.text());
  
  const jsMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
  const cssMatch = html.match(/href="(\/assets\/[^"]+\.css)"/);
  
  if (jsMatch) {
    const res = await fetch(base + jsMatch[1]);
    const buf = await res.arrayBuffer();
    console.log('JS bundle:', (buf.byteLength / 1024).toFixed(0), 'KB');
  }
  if (cssMatch) {
    const res = await fetch(base + cssMatch[1]);
    const buf = await res.arrayBuffer();
    console.log('CSS bundle:', (buf.byteLength / 1024).toFixed(0), 'KB');
  }
}
checkSizes();
