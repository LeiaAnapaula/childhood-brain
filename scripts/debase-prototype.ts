export {};
// Strips the base-city concept from prototype/which-childhood-is-yours.html (quiz v2). Every replacement must match exactly once.
const path = "prototype/which-childhood-is-yours.html";
let html = await Bun.file(path).text();
if (!html.includes("const BASES")) { console.log("already base-free"); process.exit(0); }
const once = (from: string | RegExp, to: string, label: string) => {
  const n = typeof from === "string" ? html.split(from).length - 1 : (html.match(from) ?? []).length;
  if (n !== 1) throw new Error(`${label}: expected 1 match, found ${n}`);
  html = html.replace(from, to);
};
const cut = (startMarker: string, endMarker: string, replacement: string, label: string) => {
  const s = html.indexOf(startMarker), e = html.indexOf(endMarker, s);
  if (s < 0 || e < 0) throw new Error(`${label}: markers not found`);
  html = html.slice(0, s) + replacement + html.slice(e);
};
once(/const BASES = \[[^\n]*\n/, "", "BASES");
once(/const COUNTRIES = \[\n(?:[^\n]*\n)*?\];\n/, "", "COUNTRIES");
once("// Repertoire: base + parents + school + events -> fragment. 25 childhoods, 5 per base.", "// Repertoire: parents + school + events -> fragment. 25 childhoods.", "repertoire comment");
if ((html.match(/\{base:"[^"]*",links:/g) ?? []).length !== 25) throw new Error("repertoire entries != 25");
html = html.replace(/\{base:"[^"]*",links:/g, "{links:");
once("let picks = [], stage = 0, name = '', born = '', home = '', bornCity = '', homeCity = '', cities = [], askMore = false, alive = [], pendingName = null, pendingCountry = null, pendingFor = '', money = '', social = '';",
     "let picks = [], stage = 0, name = '', city = '', askMove = false, alive = [], pendingName = null, money = '', social = '';", "state");
once("const snap = () => history.push(JSON.stringify({ picks, stage, name, born, home, bornCity, homeCity, cities, askMore, alive, pendingName, pendingCountry, pendingFor, money, social }));",
     "const snap = () => history.push(JSON.stringify({ picks, stage, name, city, askMove, alive, pendingName, money, social }));", "snap");
once("  ({ picks, stage, name, born, home, bornCity, homeCity, cities, askMore, alive, pendingName, pendingCountry, pendingFor, money, social } = s);",
     "  ({ picks, stage, name, city, askMove, alive, pendingName, money, social } = s);", "back");
once("const pool = (base) => base === 'any' ? REPERTOIRE : REPERTOIRE.filter(c => c.base === base);", "const pool = () => REPERTOIRE;", "pool");
once("function bestSplit(options) {\n  const p = alive.length ? alive : pool(home);", "function bestSplit(options) {\n  const p = alive.length ? alive : pool();", "bestSplit");
once("function narrow(o) { const p = alive.length ? alive : pool(home);", "function narrow(o) { const p = alive.length ? alive : pool();", "narrow");
once("function match(base) { const p = pool(base);", "function match() { const p = pool();", "match");
cut("function otherCountry(forWhat, label) {", "function storyStep(s) {", "", "otherCountry");
cut("  if (pendingCountry) {", "  // 2. after a pick, ask for the specific person or place", `  if (!city) {
    app.innerHTML = \`<div class="fade"><h1>Where did you grow up?</h1><p class="q">A city, a town, or "somewhere smaller". It goes on your page as one fact.</p><input id="ct" autofocus placeholder="City" value="\${esc(city)}"><button class="cta" id="ctc">Keep going</button></div>\`;
    keep(app.querySelector('#ct'), 'city');
    const done = () => { const v = app.querySelector('#ct').value.trim(); if (!v) return; snap(); city = v; askMove = true; render(); };
    app.querySelector('#ctc').onclick = done;
    app.querySelector('#ct').addEventListener('keydown', e => { if (e.key === 'Enter') done(); });
    return;
  }
  if (askMove) {
    app.innerHTML = \`<div class="fade"><p class="step">\${esc(city)}</p><h1>Did you move before you were eighteen?</h1><p class="q">A city, a country, a language.</p><div class="opts"></div></div>\`;
    const box = app.querySelector('.opts');
    const no = el(\`<button class="opt"><strong>No, that was it</strong></button>\`); no.onclick = () => { snap(); askMove = false; render(); }; box.appendChild(no);
    const yes = el(\`<button class="opt"><strong>Yes</strong>You arrived as the new kid.</button>\`); yes.onclick = () => { snap(); askMove = false; const mv = SEEDS.events.find(e => e.slug === 'move'); const p = {...mv}; picks.push(p); narrow(mv); pendingName = p; render(); }; box.appendChild(yes);
    return;
  }
`, "location screens");
once("    const left = alive.length || pool(home).length;", "    const left = alive.length || pool().length;", "left");
once("name = app.querySelector('#nm').value.trim() || 'You'; result(home); };", "name = app.querySelector('#nm').value.trim() || 'You'; result(); };", "result call");
once("function brainPage(base, hit) {", "function brainPage(hit) {", "brainPage sig");
once("\\ncities: ${cities.join(' -> ')}\\nbase: ${home}\\n---", "\\ncity: ${city}\\n---", "brainPage frontmatter");
once("function rewritePrompt(base, hit) {", "function rewritePrompt(hit) {", "rewritePrompt sig");
once("  const culture = base === 'any' ? (cities[cities.length-1] || '').split(', ').pop() : base;\n", "", "culture");
once("return `Write for ${name}. Cities in order: ${cities.join(' then ')}. Setting to write from: ${culture}.", "return `Write for ${name}. They grew up in ${city}; mention it once as a plain fact.", "prompt city");
once("async function personalize(base, hit, node) {", "async function personalize(hit, node) {", "personalize sig");
once("const out = await s.json(rewritePrompt(base, hit), { modelTier: 'quick' });", "const out = await s.json(rewritePrompt(hit), { modelTier: 'quick' });", "personalize prompt");
once("function result(base) {\n  const hit = match(base);", "function result() {\n  const hit = match();", "result sig");
once("  const others = COUNTRIES.filter(c => c.base !== base);\n  const baseLabel = base === 'any' ? (cities[cities.length-1] || '').split(', ').pop() : base;\n", "", "others/baseLabel");
once("<p class=\"step\">${esc(cities.join(' → '))}${base !== home ? ' · seen from ' + esc(baseLabel) : ''}</p>", "<p class=\"step\">${esc(city)}</p>", "result step");
once("    <p class=\"q\">Same moments, different base.</p>\n    <div class=\"row\">${others.map(c => `<button class=\"cta ghost\" data-b=\"${esc(c.base)}\">${esc(c.name)}</button>`).join('')}</div>\n", "", "swap-base UI");
once("<pre id=\"bp\">${esc(brainPage(base, hit))}</pre>", "<pre id=\"bp\">${esc(brainPage(hit))}</pre>", "brainPage call");
once("Identity here is a shared base plus a few life-changing experiences, the way a LoRA adapts a base model.", "Identity here is parents, a school, and a few life-changing experiences.", "note");
once("  app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => result(b.dataset.b));\n", "", "data-b handlers");
once("  personalize(base, hit, app.querySelector('#frag'));", "  personalize(hit, app.querySelector('#frag'));", "personalize call");
once("const txt = `${name}, ${cities.join(' → ')}\\n`", "const txt = `${name}, ${city}\\n`", "copy text");
for (const w of ["BASES", "COUNTRIES", "cities", "pendingCountry", "pendingFor", "homeCity", "bornCity", "askMore", "otherCountry"]) {
  const n = (html.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
  if (n) throw new Error(`"${w}" still appears ${n}x`);
}
await Bun.write(path, html);
console.log("prototype v2 debased");
