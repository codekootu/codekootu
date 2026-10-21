#!/usr/bin/env node
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'public/landing-pages/kage.html');
const TARGET = path.join(ROOT, 'public/landing-pages/code-kootu.html');

try { await access(SOURCE); }
catch { console.error(`\n  ✗ Source not found: ${SOURCE}\n`); process.exit(1); }

let out = await readFile(SOURCE, 'utf8');
const misses = [];
const applied = [];

function sub(find, to, label) {
  if (!out.includes(find)) { misses.push(label); return; }
  out = out.replace(find, to); applied.push(label);
}
function subAll(find, to, label) {
  if (!out.includes(find)) { misses.push(label); return; }
  out = out.split(find).join(to);
  applied.push(label);
}
function insertBefore(find, block, label) {
  if (!out.includes(find)) { misses.push(label); return; }
  out = out.replace(find, block + find); applied.push(label);
}
function replaceSection(start, end, content, label) {
  const s = escapeRegExp(start.trim());
  const e = escapeRegExp(end.trim());
  const regex = new RegExp(s + '[\\s\\S]*?' + e);
  if (!regex.test(out)) { misses.push(label + ': regex'); return; }
  out = out.replace(regex, content + end);
  applied.push(label);
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

sub('<title>Kage — Where stillness reveals the unseen</title>',
    '<title>Code Kootu — Where problems become prototypes</title>', 'title');
sub('content="A five-chapter night walk through a Kyoto mountain temple. Charred cypress, lantern light and a vermilion moon, rendered live in WebGL."',
    'content="A fifteen-member engineering collective crowdsourcing real community problems and shipping hybrid hardware-software prototypes."', 'meta desc');
sub('<div class="pre-jp jp">影の道</div>', '<div class="pre-jp jp">KOOTU</div>', 'preloader jp');
sub('<span>Raising the mountain temple</span>', '<span>Warming the workbench</span>', 'preloader msg');
sub('<span class="brand-tx"><b>KAGE</b><i>HIDDEN REALMS OF KYOTO</i></span>',
    '<span class="brand-tx"><b>CODE KOOTU</b><i>HYBRID ENGINEERING</i></span>', 'brand');
sub('<div class="word-fb" aria-hidden="true">KAGE</div>',
    '<div class="word-fb" aria-hidden="true">KOOTU</div>', 'word-fb');
sub('<span class="v jp">影の道</span>', '<span class="v jp">KOOTU</span>', 'hero-side');

sub(`  <nav class="nav-links" id="navlinks">
    <a class="nav-link" href="#gate" data-cursor><span>Temples</span><span class="alt">伽藍</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>Gardens</span><span class="alt">庭園</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>Rituals</span><span class="alt">神事</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>Afterlight</span><span class="alt">残光</span></a>
  </nav>
  <button class="nav-burger" aria-label="Menu" data-cursor><i></i><i></i></button>`,
`  <nav class="nav-links" id="navlinks">
    <a class="nav-link" href="#gate" data-cursor><span>The Brief</span><span class="alt">BRIEF</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>The Pipeline</span><span class="alt">PIPELINE</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>The Wings</span><span class="alt">WINGS</span></a>
    <a class="nav-link" href="/members" data-cursor><span>Our Team</span><span class="alt">TEAM</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>The Call</span><span class="alt">CALL</span></a>
    <button class="nav-link-signin" type="button" data-signin-open aria-label="Sign in">
      <span class="dot"></span>Sign In
    </button>
  </nav>
  <button class="nav-login" type="button" data-signin-open aria-label="Sign in">
    <span class="dot"></span>Sign In
  </button>
  <button class="nav-burger" aria-label="Menu" data-cursor><i></i><i></i></button>`, 'nav');

sub("const word = 'KAGE', gl = [];", "const word = 'KOOTU', gl = [];", 'wordmark');
subAll("Wordmark, sans-serif", "Onest, sans-serif", 'wordmark font');
sub("'600 320px Wordmark'", "'600 320px Onest'", 'font preload');

sub("const linkSec = links.map(l => SECS.indexOf(document.querySelector(l.getAttribute('href'))));",
    "const linkSec = links.map(l => { const h = l.getAttribute('href'); return h.startsWith('#') ? SECS.indexOf(document.querySelector(h)) : -1; });", 
    'wireNav fix');

sub(`function boot() {
  makeGrain();
  wireReveals(); wireForegroundStages(); wireNav(); wireHeroExit(); wireFocus(); wireCursor();
  document.body.classList.add('is-locked');`,
`function boot() {
  makeGrain();
  try {
    wireReveals(); wireForegroundStages(); wireNav(); wireHeroExit(); wireFocus(); wireCursor();
    wireSigninModal();
    wireWingModals();
  } catch (err) {
    console.error("Boot init failed:", err);
    document.body.classList.remove("is-locked");
    var preEl = document.getElementById("pre");
    if (preEl) preEl.classList.add("done");
    return;
  }
  document.body.classList.add('is-locked');`, 'boot try/catch');

const EXTRA_CSS = `
.nav-login{display:inline-flex;align-items:center;gap:9px;padding:9px 18px;flex:0 0 auto;white-space:nowrap;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--bone);background:transparent;border:1px solid var(--line);border-radius:100px;transition:background .35s var(--ease),color .35s,border-color .35s;}
.nav-login:hover{background:var(--bone);color:var(--ink);border-color:var(--bone);}
.nav-login .dot{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);transition:background .35s,box-shadow .35s;}
.nav-login:hover .dot{background:var(--ink);box-shadow:none;}
.nav-link-signin{display:none;}
@media (max-width:820px){.nav-link-signin{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:28px;padding:16px 22px;border:1px solid var(--bone);border-radius:100px;background:var(--bone);color:var(--ink);font:500 12px/1 'Onest',system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;}.nav-link-signin .dot{width:5px;height:5px;border-radius:50%;background:var(--vermilion);}}
.signin-modal{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:24px;}
.signin-modal.open{display:flex;}
.signin-backdrop{position:absolute;inset:0;background:rgba(3,5,8,.86);backdrop-filter:blur(24px) saturate(1.15);-webkit-backdrop-filter:blur(24px) saturate(1.15);}
.signin-panel{position:relative;z-index:1;width:min(720px,100%);max-height:90vh;overflow-y:auto;background:#05070a;border:1px solid var(--line);box-shadow:0 60px 120px -40px rgba(0,0,0,.95);padding:clamp(32px,4.5vw,56px);}
.signin-close{position:absolute;top:16px;right:16px;width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;color:var(--bone-dim);background:transparent;font-size:18px;line-height:1;cursor:pointer;transition:background .3s,color .3s,border-color .3s;}
.signin-close:hover{background:var(--bone);color:var(--ink);border-color:var(--bone);}
.signin-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.signin-eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);}
.signin-title{margin:0 0 14px;font-size:clamp(28px,4vw,42px);font-weight:400;letter-spacing:-.012em;line-height:1.1;color:var(--bone);}
.signin-sub{margin:0 0 32px;font-size:15px;line-height:1.6;color:var(--bone-dim);max-width:46ch;}
.signin-cards{display:grid;grid-template-columns:1fr 1fr;gap:1px;border:1px solid var(--line-soft);background:var(--line-soft);}
@media (max-width:600px){.signin-cards{grid-template-columns:1fr;}}
.signin-card{position:relative;display:flex;flex-direction:column;gap:12px;padding:28px 26px 30px;background:#05070a;text-decoration:none;color:inherit;overflow:hidden;transition:background .35s;}
.signin-card:hover{background:#0a0f12;}
.signin-num{font-size:11px;letter-spacing:.22em;color:var(--vermilion);font-variant-numeric:tabular-nums;}
.signin-card h4{margin:0;font-size:clamp(20px,2.2vw,26px);font-weight:400;letter-spacing:-.008em;color:var(--bone);}
.signin-card p{margin:0;font-size:14px;line-height:1.55;color:var(--bone-dim);}
.signin-arrow{margin-top:auto;padding-top:8px;display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--bone);}
html.signin-open,html.signin-open body{overflow:hidden;}

.wing-modal{position:fixed;inset:0;z-index:210;display:none;align-items:center;justify-content:center;padding:24px;}
.wing-modal.open{display:flex;}
.wing-modal-backdrop{position:absolute;inset:0;background:rgba(3,5,8,.9);backdrop-filter:blur(20px);}
.wing-modal-panel{position:relative;z-index:1;width:min(900px,100%);max-height:85vh;overflow-y:auto;background:#05070a;border:1px solid var(--line);padding:clamp(30px,4vw,50px);}
.wing-modal-title{font-size:clamp(24px,3vw,36px);margin:0 0 10px;color:var(--bone);}
.wing-modal-sub{font-size:15px;color:var(--bone-dim);margin:0 0 32px;}
.wing-modal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;}
.wing-member-card{border:1px solid var(--line-soft);padding:20px;background:#080b0f;}
.wing-member-name{font-size:18px;color:var(--bone);margin:0 0 6px;font-weight:500;}
.wing-member-role{font-size:13px;color:var(--vermilion);margin:0 0 10px;letter-spacing:.05em;text-transform:uppercase;}
.wing-member-dept{font-size:13px;color:var(--muted);margin:0;}

/* PIPELINE FLOW */
.pipeline-flow { display: flex; flex-direction: column; gap: 20px; max-width: 800px; margin: 40px auto 0; position: relative; }
@media (min-width: 768px) { .pipeline-flow { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
.pipe-step { position: relative; flex: 1; background: rgba(10,14,18,0.6); backdrop-filter: blur(12px); border: 1px solid var(--line); padding: 30px; border-radius: 8px; text-align: center; z-index: 2; transition: transform 0.4s ease, border-color 0.4s ease; }
.pipe-step:hover { transform: translateY(-5px); border-color: var(--vermilion); }
.pipe-icon { width: 50px; height: 50px; margin: 0 auto 20px; border-radius: 50%; background: #05070a; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--bone); font-weight: 500; position: relative; z-index: 2; transition: all 0.4s ease; }
.pipe-step:hover .pipe-icon { border-color: var(--vermilion); color: var(--vermilion); box-shadow: 0 0 20px rgba(224,35,28,0.4); }
.pipe-step h3 { font-size: 20px; margin: 0 0 10px; color: var(--bone); font-weight: 500; }
.pipe-step p { font-size: 14px; color: var(--bone-dim); margin: 0; line-height: 1.6; }
.pipe-connector { display: none; position: absolute; top: 55px; left: 10%; right: 10%; height: 2px; background: rgba(255,255,255,0.05); z-index: 1; }
@media (min-width: 768px) { .pipe-connector { display: block; } }
.pipe-pulse { position: absolute; top: 0; left: 0; height: 100%; width: 50px; background: linear-gradient(90deg, transparent, var(--vermilion), transparent); animation: pipe-flow 3s infinite linear; opacity: 0.8; }
@keyframes pipe-flow { 0% { left: -50px; } 100% { left: 100%; } }

/* NEW WINGS EXPANDING PANELS */
.wings-flex { display: flex; flex-direction: column; gap: 15px; margin-top: 40px; height: auto; }
@media(min-width: 768px) { .wings-flex { flex-direction: row; height: 450px; } }
.wing-panel { position: relative; flex: 1; background: #080b0f; border: 1px solid var(--line-soft); border-radius: 12px; overflow: hidden; cursor: pointer; transition: flex 0.7s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s; }
@media(min-width: 768px) { .wing-panel:hover { flex: 2.5; border-color: var(--vermilion); } }
.wing-panel-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.1; transition: opacity 0.7s, transform 0.7s; transform: scale(1); }
.wing-panel:hover .wing-panel-bg { opacity: 0.4; transform: scale(1.05); }
.wing-panel-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 40px 30px; background: linear-gradient(to top, rgba(5,7,10,0.95) 0%, rgba(5,7,10,0.5) 50%, transparent 100%); }
.wing-panel .num { font-size: 14px; color: var(--vermilion); letter-spacing: 0.2em; margin-bottom: 15px; display: block; font-family: monospace; }
.wing-panel h3 { font-size: 28px; margin: 0 0 10px; color: var(--bone); font-weight: 400; transition: transform 0.4s; transform-origin: left; }
.wing-panel:hover h3 { transform: scale(1.05); }
.wing-panel h3 em { font-style: normal; font-size: 14px; color: var(--muted); margin-left: 10px; letter-spacing: 0.1em; }
.wing-panel p { font-size: 14px; color: var(--bone-dim); line-height: 1.6; margin-bottom: 20px; opacity: 0; transform: translateY(10px); transition: opacity 0.5s, transform 0.5s; transition-delay: 0.1s; max-width: 400px; }
.wing-panel:hover p { opacity: 1; transform: translateY(0); }
.wing-panel .t { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--vermilion); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; display: block; width: 100%; }

/* FLOATING MEET THE TEAM BUTTON (Moved to Right) */
.floating-team-btn{position:fixed;bottom:30px;right:30px;z-index:100;display:flex;align-items:center;gap:10px;background:rgba(10,14,18,0.85);border:1px solid rgba(223,231,224,0.2);padding:12px 20px;border-radius:100px;color:var(--bone);text-decoration:none;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 10px 30px -10px rgba(0,0,0,0.8);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);opacity:1;transform:translateY(0);}
.floating-team-btn:hover{border-color:var(--vermilion);background:rgba(224,35,28,0.1);color:var(--vermilion);transform:translateY(-2px);}
.floating-team-btn svg{width:16px;height:16px;}
@media(max-width:820px){.floating-team-btn{bottom:20px;right:20px;padding:10px 16px;font-size:10px;}}
`;

insertBefore('</style>', EXTRA_CSS, 'extra CSS');

const MODAL_HTML = `
<div class="signin-modal" id="signin-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="signin-title">
  <div class="signin-backdrop" data-signin-close></div>
  <div class="signin-panel">
    <button class="signin-close" type="button" data-signin-close aria-label="Close">&times;</button>
    <div class="signin-eyebrow"><span class="dot"></span> Choose your door</div>
    <h3 id="signin-title" class="signin-title">Sign in.</h3>
    <p class="signin-sub">Two separate realms &mdash; pick the one that's yours.</p>
    <div class="signin-cards">
      <a href="/login" class="signin-card">
        <span class="signin-num">01</span>
        <h4>Public Portal</h4>
        <p>Submit a problem. Track your brief. Vote on shipped work.</p>
        <span class="signin-arrow">Enter</span>
      </a>
      <a href="/team/login" class="signin-card">
        <span class="signin-num">02</span>
        <h4>Team Workbench</h4>
        <p>Verified Code Kootu members only. Wing tools, sprints, triage.</p>
        <span class="signin-arrow">Enter</span>
      </a>
    </div>
  </div>
</div>

<div class="wing-modal" id="wing-modal" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="wing-modal-backdrop" data-wing-close></div>
  <div class="wing-modal-panel">
    <button class="signin-close" type="button" data-wing-close aria-label="Close">&times;</button>
    <div class="signin-eyebrow"><span class="dot"></span> Wing Roster</div>
    <h3 class="wing-modal-title" id="wing-modal-title"></h3>
    <p class="wing-modal-sub" id="wing-modal-sub"></p>
    <div class="wing-modal-grid" id="wing-modal-grid"></div>
  </div>
</div>
`;
insertBefore('</body>', MODAL_HTML, 'modal HTML');

const SIGNIN_JS = `
function wireSigninModal() {
  var modal = document.getElementById('signin-modal');
  if (!modal) return;
  var openers = [].slice.call(document.querySelectorAll('[data-signin-open]'));
  var closers = modal.querySelectorAll('[data-signin-close]');
  function open() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('signin-open');
    var f = modal.querySelector('.signin-card');
    if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('signin-open');
  }
  openers.forEach(function (el) { el.addEventListener('click', open); });
  closers.forEach(function (el) { el.addEventListener('click', close); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
}

const WINGS_DATA = {
  software: {
    title: "Software & Systems Architecture",
    sub: "Architecture, cloud, security, integration. The backbone of every build.",
    members: [
      { name: "Noel Mathews", title: "Chief Systems Architect & Technical Director", dept: "B.Tech CSE (Core)" },
      { name: "Gokul G Krishna", title: "Backend & Cloud Infrastructure Engineer", dept: "B.Tech CSE (Core)" },
      { name: "Sayed Ibrahim", title: "Systems Security & Web Experience Lead", dept: "B.Tech CSE (Cybersecurity)" },
      { name: "Ameen Puthiyottil", title: "Application & Core Logic Developer", dept: "B.Tech CSE (Core)" },
      { name: "Kevin Paul", title: "Integration & Middleware Engineer", dept: "B.Tech CSE (Core)" },
      { name: "Abdullah Ikhwan K A", title: "Embedded Software & Firmware Engineer", dept: "B.Tech CSE (Core)" }
    ]
  },
  hardware: {
    title: "Hardware Engineering & Physical Fabrication",
    sub: "Mechanics, embedded, power, sensing, field QA. The bones and current.",
    members: [
      { name: "Austin M J", title: "Lead Mechanical & Structural Engineer", dept: "B.Tech Mechanical Engineering" },
      { name: "Muhammed Shahbaz K P", title: "Lead Embedded Systems & Telemetry Engineer", dept: "B.Tech ECE" },
      { name: "Abhinav Sanil", title: "Circuit Architecture & Power Systems Specialist", dept: "B.Tech CSE (Core)" },
      { name: "Sreehari Subhash", title: "Environmental Sensing & Structural Dynamics Specialist", dept: "B.Tech Civil Engineering" },
      { name: "Nevil Biju Mathew", title: "Hardware Intelligence & Data Systems Specialist", dept: "B.Tech AI & DS" },
      { name: "Arjun", title: "Hardware Reliability & Field QA Specialist", dept: "B.Tech AI & DS" }
    ]
  },
  operations: {
    title: "Operations, Product Strategy & Outreach",
    sub: "Product, pitch, media. How the work reaches its people.",
    members: [
      { name: "Bestin George", title: "Head of Product Strategy & Community Triage", dept: "B.Tech CSE (Core)" },
      { name: "Adwaith Ciju", title: "Chief Pitch Architect & Communications Lead", dept: "B.Tech CSE (Core)" },
      { name: "Advaith B Nair", title: "Brand Director & Media Production Lead", dept: "B.Tech CSE (Core)" }
    ]
  }
};

function wireWingModals() {
  var modal = document.getElementById('wing-modal');
  if (!modal) return;
  var titleEl = document.getElementById('wing-modal-title');
  var subEl = document.getElementById('wing-modal-sub');
  var gridEl = document.getElementById('wing-modal-grid');
  var closers = modal.querySelectorAll('[data-wing-close]');
  
  document.querySelectorAll('.wing-panel').forEach(function(el) {
    el.addEventListener('click', function(e) {
      var wingId = el.getAttribute('data-wing');
      var data = WINGS_DATA[wingId];
      if (!data) return;
      
      titleEl.textContent = data.title;
      subEl.textContent = data.sub;
      gridEl.innerHTML = data.members.map(function(m) {
        return '<div class="wing-member-card">' +
          '<h4 class="wing-member-name">' + m.name + '</h4>' +
          '<p class="wing-member-role">' + m.title + '</p>' +
          '<p class="wing-member-dept">' + m.dept + '</p>' +
        '</div>';
      }).join('');
      
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('signin-open');
    });
  });
  
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('signin-open');
  }
  closers.forEach(function (el) { el.addEventListener('click', close); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
}
`;
insertBefore("if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 0);", SIGNIN_JS, 'signin JS');

const SECTION_CONTENT = {
  hero: `<section class="hero" id="hero" data-cam="0">
  <div class="hero-top">
    <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 00 — The Collective</div>
    <h1 class="display h-hero">
      <span class="mask-line"><span>Where problems</span></span>
      <span class="mask-line"><span>meet the</span></span>
      <span class="mask-line"><span>makers.</span></span>
    </h1>
    <p class="hero-sub body" data-rv="up">A fifteen-member engineering collective crowdsourcing real community problems — and shipping hybrid prototypes in hardware, software, or both.</p>
  </div>

  <div class="hero-spacer"></div>

  <div class="hero-foot">
    <div class="hero-cue" data-rv="fade"><span>Scroll to enter</span><span class="track"><i></i></span></div>
    <div class="chapters" id="chips">
      <div class="chip" data-chip="0" data-rv="up" data-cursor><span class="num">01</span>
        <span class="tx"><b>The Brief</b><p>Submit a real problem. We read every one.</p></span></div>
      <div class="chip" data-chip="1" data-rv="up" data-cursor><span class="num">02</span>
        <span class="tx"><b>The Pipeline</b><p>Triage. Three scorecards. One vote.</p></span></div>
      <div class="chip" data-chip="2" data-rv="up" data-cursor><span class="num">03</span>
        <span class="tx"><b>The Wings</b><p>Software, hardware, ops pick up the sprint.</p></span></div>
      <div class="chip" data-chip="3" data-rv="up" data-cursor><span class="num">04</span>
        <span class="tx"><b>The Call</b><p>Deployed, documented, open for votes.</p></span></div>
    </div>
  </div>
</section>
`,
  gate: `<section class="sec" id="gate" data-cam="1">
  <div class="sec-head" data-rv="fade">
    <span class="k"><b>01</b> — The Brief</span><span class="rule"></span><span class="k jp">BRIEF</span>
  </div>
  <div class="gate-grid">
    <h2 class="display h-sec" data-rv="up">Real problems in from the street. Real prototypes out the door.</h2>
    <div class="gate-copy">
      <p class="lead" data-rv="up">Code Kootu is a fifteen-member engineering collective. We crowdsource the problems people actually live with — then design, build, and ship hardware, software, or both. Every brief is read. The good ones get built.</p>
      <p class="body" data-rv="up">Anyone can submit: a student, a nurse, a grounds-keeper, a shop-owner. If it's real, the committee scores it. A wing picks it up. What comes out the other end is yours to keep, fork, and improve.</p>
      <a class="arrowlink" href="#pathways" data-rv="fade" data-cursor>
        <span>Submit a problem</span>
        <span class="ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
      </a>
    </div>
  </div>
  <div class="gate-stats" data-rv="up">
    <div><b>15</b><span>Builders</span></div>
    <div><b>03</b><span>Wings</span></div>
    <div><b>02</b><span>Portals</span></div>
    <div><b>∞</b><span>Problems</span></div>
  </div>
</section>
`,
  pathways: `<section class="sec" id="pathways" data-cam="2">
  <div class="sec-head" data-rv="fade">
    <span class="k"><b>02</b> — The Pipeline</span><span class="rule"></span><span class="k jp">PIPELINE</span>
  </div>
  
  <div class="pipeline-flow" data-rv="up">
    <div class="pipe-connector"><div class="pipe-pulse"></div></div>
    
    <div class="pipe-step">
      <div class="pipe-icon">01</div>
      <h3>Intake</h3>
      <p>Problem received from the public portal.</p>
    </div>
    
    <div class="pipe-step">
      <div class="pipe-icon">02</div>
      <h3>Triage</h3>
      <p>Committee reviews and scores the brief.</p>
    </div>
    
    <div class="pipe-step">
      <div class="pipe-icon">03</div>
      <h3>Build</h3>
      <p>Assigned to a Wing for the sprint.</p>
    </div>
  </div>
</section>
`,
  lessons: `<section class="sec" id="lessons" data-cam="3">
  <div class="sec-head" data-rv="fade">
    <span class="k"><b>03</b> — The Wings</span><span class="rule"></span><span class="k jp">WINGS</span>
  </div>
  <div class="cur-head">
    <h2 class="display h-sec" data-rv="up">Three wings. One committee. Fifteen hands.</h2>
    <p class="body-lg" data-rv="up">Each wing owns a slice. Software builds the spine. Hardware builds the body. Operations builds the story. Click a wing to see the roster.</p>
  </div>
  
  <div class="wings-flex" data-rv="up">
    <div class="wing-panel" data-wing="software" data-cursor>
      <div class="wing-panel-bg" style="background-image: url('https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/temple-wall.webp');"></div>
      <div class="wing-panel-content">
        <span class="num">01</span>
        <h3>Software &amp; Systems<em>SYS</em></h3>
        <p>Architecture, cloud, security, integration. The backbone of every build.</p>
        <span class="t">6 members</span>
      </div>
    </div>
    
    <div class="wing-panel" data-wing="hardware" data-cursor>
      <div class="wing-panel-bg" style="background-image: url('https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/stone-lantern.webp');"></div>
      <div class="wing-panel-content">
        <span class="num">02</span>
        <h3>Hardware &amp; Fabrication<em>HW</em></h3>
        <p>Mechanics, embedded, power, sensing, field QA. The bones and current.</p>
        <span class="t">6 members</span>
      </div>
    </div>
    
    <div class="wing-panel" data-wing="operations" data-cursor>
      <div class="wing-panel-bg" style="background-image: url('https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/sakura-branch.webp');"></div>
      <div class="wing-panel-content">
        <span class="num">03</span>
        <h3>Operations &amp; Outreach<em>OPS</em></h3>
        <p>Product, pitch, media. How the work reaches its people.</p>
        <span class="t">3 members</span>
      </div>
    </div>
  </div>
</section>
`,
  eternity: `<section class="sec fin" id="eternity" data-cam="4">
  <div class="eyebrow" data-rv="fade">Chapter 04 — The Call</div>
  <h2 class="display" data-rv="up">Bring it.</h2>
  <p class="body-lg" data-rv="up">If you've been sitting with a problem that shouldn't still exist, submit it. We read every brief. The good ones build. Whatever comes out is yours — open, documented, forkable.</p>
  <a class="cta" href="#top" data-rv="fade" data-cursor>
    <i></i><span>Submit a brief</span>
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
  </a>
</section>
`,
  foot: `<footer class="foot" data-cam="5">
  <div class="foot-grid">
    <div class="foot-brand">
      <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
        <circle cx="22" cy="25" r="8.6" fill="#e0231c" fill-opacity=".9"/>
        <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
      </svg>
      <p>A fifteen-member engineering collective building hybrid prototypes for real community problems. Submit a brief, track it through triage, and see it ship.</p>
    </div>
    <div><h4>Process</h4><ul>
      <li><a href="#gate" data-cursor>The Brief</a></li>
      <li><a href="#pathways" data-cursor>The Pipeline</a></li>
      <li><a href="#lessons" data-cursor>The Wings</a></li>
      <li><a href="#eternity" data-cursor>The Call</a></li>
    </ul></div>
    <div><h4>Wings</h4><ul>
      <li><a href="#lessons" data-cursor>Software &amp; Systems</a></li>
      <li><a href="#lessons" data-cursor>Hardware &amp; Fabrication</a></li>
      <li><a href="#lessons" data-cursor>Operations &amp; Outreach</a></li>
      <li><a href="/members" data-cursor>Full Roster</a></li>
    </ul></div>
    <div><h4>Connect</h4><ul>
      <li><a href="https://github.com/codekootu" target="_blank" rel="noopener" data-cursor>GitHub</a></li>
      <li><a href="https://www.instagram.com/code_kootu" target="_blank" rel="noopener" data-cursor>Instagram</a></li>
      <li><a href="mailto:codekootu@gmail.com" data-cursor>Contact Us</a></li>
      <li><a href="/privacy" data-cursor>Privacy Policy</a></li>
      <li><a href="/terms" data-cursor>Terms of Service</a></li>
    </ul></div>
  </div>
  <div class="foot-base">
    <span>© 2026 Code Kootu Collective</span>
    <span class="jp">BUILT TOGETHER</span>
    <span>Hybrid · 15 members · India</span>
  </div>
</footer>
`
};

replaceSection('<section class="hero" id="hero" data-cam="0">', '<!-- ============================================================ chapter I -->', SECTION_CONTENT.hero, 'section: hero');
replaceSection('<section class="sec" id="gate" data-cam="1">', '<!-- ============================================================ chapter II -->', SECTION_CONTENT.gate, 'section: gate');
replaceSection('<section class="sec" id="pathways" data-cam="2">', '<!-- ============================================================ chapter III -->', SECTION_CONTENT.pathways, 'section: pathways');
replaceSection('<section class="sec" id="lessons" data-cam="3">', '<!-- ============================================================ chapter IV -->', SECTION_CONTENT.lessons, 'section: lessons');
replaceSection('<section class="sec fin" id="eternity" data-cam="4">', '<!-- ============================================================ footer -->', SECTION_CONTENT.eternity, 'section: eternity');
replaceSection('<footer class="foot" data-cam="5">', '</div><!-- /.page -->', SECTION_CONTENT.foot, 'section: foot');

await writeFile(TARGET, out, 'utf8');
console.log(`\n  ✓ ${path.relative(ROOT, TARGET)} (${(out.length / 1024).toFixed(1)} KB)`);
console.log(`  ✓ ${applied.length} replacements applied`);
if (misses.length) {
  console.log(`\n  ⚠ ${misses.length} missed:`);
  misses.forEach((m) => console.log(`     · ${m}`));
  process.exitCode = 1;
}
console.log('');
