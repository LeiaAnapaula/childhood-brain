export {};
const src = "prototype/which-childhood-is-yours.html", path = "index.html";
let html = await Bun.file(src).text();
if (html.includes("/api/person")) throw new Error("prototype file is already wired; it should stay unwired");
const once = (from: string, to: string, label: string) => { const n = html.split(from).length - 1; if (n !== 1) throw new Error(`${label}: expected 1 match, found ${n}`); html = html.replace(from, to); };
once("function result() {\n  const hit = match();", `const served = location.protocol.startsWith('http');
const GEN_CITIES = ["Chicago", "Houston", "the Bay Area", "Miami", "Toronto", "Lima", "Arequipa", "Bogota", "Sao Paulo", "Mumbai", "Delhi", "Chennai", "Lahore", "Shanghai", "Chengdu", "Seoul", "Osaka", "Mexico City", "Guadalajara", "Puebla", "somewhere smaller"];
const localizeCity = t => city ? GEN_CITIES.reduce((s, c) => s.split(c).join(city), t) : t;
const kindOf = p => SEEDS.parents.some(s => s.slug === p.slug) ? 'parents' : SEEDS.schools.some(s => s.slug === p.slug) ? 'schools' : 'events';
async function brainSearch() {
  if (!served) return null;
  try { const r = await fetch('/api/search?q=' + encodeURIComponent(picks.map(p => p.slug + ' ' + p.name).join(' '))); const j = await r.json(); return j.results && j.results[0] ? j.results[0] : null; } catch { return null; }
}
async function savePerson(hit, fragment) {
  if (!served) return;
  if (!name || name === 'You') { const s = document.getElementById('status'); if (s) s.textContent = (s.textContent ? s.textContent + ' · ' : '') + 'Not saved: go back and add your first name.'; return; }
  try { const r = await fetch('/api/person', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, city, picks: picks.map(p => ({ kind: kindOf(p), slug: p.slug, name: p.name, who: p.who ? (isParent(p) ? personLabel(p) : p.who) : '' })), childhood: hit.id, fragment, money, social }) }); const j = await r.json(); const s = document.getElementById('status'); if (s && j.path) s.textContent = (s.textContent ? s.textContent + ' · ' : '') + 'Saved to ' + j.path; } catch {}
}
function result() {
  const hit = match();`, "result head");
once("  personalize(hit, app.querySelector('#frag'));", `  (async () => {
    const found = await brainSearch();
    if (found && found.text) { hit.id = found.slug.replace(/^.*\\//, ''); hit.text = localizeCity(found.text); app.querySelector('#frag').textContent = swapNames(hit.text); app.querySelector('#bp').textContent = brainPage(hit); const s = document.getElementById('status'); if (s) s.textContent = 'Found in GBrain: ' + hit.id; }
    await personalize(hit, app.querySelector('#frag'));
    await savePerson(hit, app.querySelector('#frag').textContent);
  })();`, "result tail");
await Bun.write(path, html);
console.log("index.html written: prototype wired to /api/search and /api/person");
