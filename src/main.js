const info = document.getElementById('build-info');
if (info) {
  const built = new Date().toISOString().slice(0, 10);
  info.textContent = `Built ${built} · served from GitHub Pages`;
}
