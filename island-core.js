/*
 * Islet: the island notification renderer.
 * Shared by the extension (content.js), the popup preview and the demo page.
 *
 *   const island = IsletCore.create(options)
 *   island.show(note)      queue a note ({ type, title, body, app, url, duration, sticky })
 *   island.replace(note)   show a note now, dropping anything queued
 *   island.setOptions(o)   restyle live
 */
(function (global) {
  'use strict';
  if (global.IsletCore) return;

  // ---------- design data ----------
  const KINDS = ['message', 'success', 'reminder', 'alert', 'timer'];
  const LABELS = { message: 'Message', success: 'Done', reminder: 'Reminder', alert: 'Heads up', timer: 'Focus' };
  const TAGS = { message: 'MSG', success: 'OK', reminder: 'TODO', alert: 'WARN', timer: 'FOCUS' };
  const EMOJI = { message: '💬', success: '✅', reminder: '🔔', alert: '⚠️', timer: '⏳' };
  // Source icons override the kind icon; the kind still sets the color.
  const SOURCE_TAGS = { github: 'GH', mail: 'MAIL', slack: 'SLACK', chat: 'WA' };
  const SOURCE_EMOJI = { github: '🔀', mail: '📬', slack: '#️⃣', chat: '📱' };

  const PALETTES = {
    classic:  { message: '#8FA4FF', success: '#4FE0A2', reminder: '#FFC15E', alert: '#FF7A66', timer: '#C79BFF' },
    pastel:   { message: '#B9C6FF', success: '#A9EDCD', reminder: '#FFE2A6', alert: '#FFBCB2', timer: '#DEC9FF' },
    neon:     { message: '#4D7BFF', success: '#00E08A', reminder: '#FFB300', alert: '#FF3D57', timer: '#A855FF' },
    ocean:    { message: '#6CC4FF', success: '#5EE6D0', reminder: '#9FD8FF', alert: '#FF9A8A', timer: '#8FA8FF' },
    terminal: { message: '#79C0FF', success: '#56D364', reminder: '#E3B341', alert: '#FF7B72', timer: '#D2A8FF' },
    editor:   { message: '#61AFEF', success: '#98C379', reminder: '#E5C07B', alert: '#E06C75', timer: '#C678DD' },
  };

  const SURFACES = {
    ink:      { bg: '#0A0A0C', solid: '#0A0A0C', fg: '#F5F5F7' },
    graphite: { bg: '#2A2B31', solid: '#2A2B31', fg: '#F3F3F5' },
    midnight: { bg: '#101A35', solid: '#101A35', fg: '#EDF1FF' },
    terminal: { bg: '#070A08', solid: '#070A08', fg: '#CDEFD5' },
    editor:   { bg: '#1E222A', solid: '#1E222A', fg: '#E3E7EE' },
    frost:    { bg: 'rgba(250,250,252,.88)', solid: '#F7F7FA', fg: '#15161B' },
    aurora:   { bg: 'radial-gradient(130% 170% at 0% 0%, color-mix(in srgb, var(--accent) 40%, #0E0C1F) 0%, #0E0C1F 62%)', solid: '#0E0C1F', fg: '#F7F5FF' },
  };

  // Whole looks. Size, position and duration stay as the person set them.
  const PRESETS = {
    minimal:  { surface: 'ink', palette: 'classic', iconStyle: 'dot', iconShape: 'none', shape: 'pill', lines: 'one', font: 'system', countdown: 'off',
                effects: { edge: false, ripple: false, sparks: false, type: false }, tone: 'pop' },
    classic:  { surface: 'ink', palette: 'classic', iconStyle: 'line', iconShape: 'circle', shape: 'pill', lines: 'two', font: 'system', countdown: 'ring',
                effects: { edge: true, ripple: true, sparks: true, type: false }, tone: 'chime' },
    terminal: { surface: 'terminal', palette: 'terminal', iconStyle: 'tag', iconShape: 'none', shape: 'sharp', lines: 'two', font: 'mono', countdown: 'bar',
                effects: { edge: false, ripple: false, sparks: false, type: true }, tone: 'blip' },
    editor:   { surface: 'editor', palette: 'editor', iconStyle: 'line', iconShape: 'squircle', shape: 'soft', lines: 'two', font: 'mono', countdown: 'bar',
                effects: { edge: false, ripple: true, sparks: false, type: false }, tone: 'blip' },
    paper:    { surface: 'frost', palette: 'classic', iconStyle: 'solid', iconShape: 'circle', shape: 'soft', lines: 'two', font: 'system', countdown: 'ring',
                effects: { edge: false, ripple: true, sparks: true, type: false }, tone: 'chime' },
    neon:     { surface: 'aurora', palette: 'neon', iconStyle: 'solid', iconShape: 'squircle', shape: 'pill', lines: 'two', font: 'system', countdown: 'ring',
                effects: { edge: true, ripple: true, sparks: true, type: false }, tone: 'chime' },
  };
  const PRESET_NAMES = { minimal: 'Minimal', classic: 'Classic', terminal: 'Terminal', editor: 'Editor', paper: 'Paper', neon: 'Neon' };

  const DEFAULTS = Object.assign({ preset: 'minimal', accents: null, size: 'regular', position: 'center', duration: 5000 }, PRESETS.minimal);

  const line = (p) => `<svg class="g-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const GLYPHS = {
    message: line('<path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4.5 19.5l1.3-4.2A7.5 7.5 0 1 1 20 11.5z"/>'),
    success: line('<path d="M5.5 12.5l4 4L18.5 7.5"/>'),
    reminder: line('<path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 5.5 2.5 7 2.5 7H4s2.5-1.5 2.5-7"/><path d="M10.3 19.5a2 2 0 0 0 3.4 0"/>'),
    alert: line('<path d="M12 8.5v4.5"/><path d="M12 16.4v.1"/><path d="M10.4 4.2L3 17.2A1.9 1.9 0 0 0 4.6 20h14.8a1.9 1.9 0 0 0 1.6-2.8L13.6 4.2a1.9 1.9 0 0 0-3.2 0z"/>'),
    timer: line('<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2 2"/><path d="M9.5 3h5"/>'),
  };
  const SOURCE_GLYPHS = {
    github: line('<circle cx="6.5" cy="6" r="2.2"/><circle cx="6.5" cy="18" r="2.2"/><circle cx="17.5" cy="18" r="2.2"/><path d="M6.5 8.2v7.6"/><path d="M17.5 15.8V10a3 3 0 0 0-3-3H11"/><path d="M13 5l-2 2 2 2"/>'),
    mail: line('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>'),
    slack: line('<path d="M9.5 4l-2 16"/><path d="M16.5 4l-2 16"/><path d="M4.5 9h16"/><path d="M3.5 15h16"/>'),
    chat: line('<path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>'),
  };

  function luminance(hex) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 0.5;
    const n = parseInt(m[1], 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const onColor = (hex) => (luminance(hex) > 0.36 ? '#0B0B10' : '#FFFFFF');

  function surfaceOf(s) {
    if (SURFACES[s]) return SURFACES[s];
    if (/^#[0-9a-f]{6}$/i.test(s || '')) return { bg: s, solid: s, fg: luminance(s) > 0.4 ? '#121318' : '#F6F6F8' };
    return SURFACES.ink;
  }

  function resolveAccents(o) {
    o = o || DEFAULTS;
    if (o.palette === 'mono') {
      const fg = surfaceOf(o.surface).fg;
      return KINDS.reduce((a, k) => ((a[k] = fg), a), {});
    }
    if (o.palette === 'custom') return Object.assign({}, PALETTES.classic, o.accents || {});
    return Object.assign({}, PALETTES[o.palette] || PALETTES.classic);
  }

  function glyph(type, style, icon) {
    const src = SOURCE_GLYPHS[icon] ? icon : '';
    if (style === 'dot') return '<i class="g-dot"></i>';
    if (style === 'tag') return `<span class="g-tag">${src ? SOURCE_TAGS[src] : TAGS[type] || TAGS.message}</span>`;
    if (style === 'emoji') return `<span class="g-emo">${src ? SOURCE_EMOJI[src] : EMOJI[type] || EMOJI.message}</span>`;
    return src ? SOURCE_GLYPHS[src] : GLYPHS[type] || GLYPHS.message;
  }

  function mergeOptions(base, p) {
    const out = Object.assign({}, base, p || {});
    out.effects = Object.assign({}, DEFAULTS.effects, base.effects || {}, (p && p.effects) || {});
    return out;
  }
  function applyPreset(settings, id) {
    const p = PRESETS[id];
    if (!p) return settings;
    return mergeOptions(settings, Object.assign({}, JSON.parse(JSON.stringify(p)), { preset: id, accents: null }));
  }

  // ---------- styles ----------
  const MONO = 'ui-monospace, "JetBrains Mono", "SF Mono", "Cascadia Code", Menlo, Consolas, monospace';
  const CSS = `
:host { all: initial; }
.stage {
  --H: 58px; --I: 36px; --W: 400px; --pl: calc((var(--H) - var(--I)) / 2); --dt: calc(var(--H) - 18px);
  position: fixed; top: var(--top, 10px); left: 50%; transform: translateX(-50%);
  z-index: 2147483647; pointer-events: none;
  width: min(var(--W), calc(100vw - 24px));
  display: flex; justify-content: center;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable Text", "Segoe UI", Inter, Roboto, "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased; line-height: 1.3; text-align: left;
}
.stage.contained { position: absolute; width: min(var(--W), calc(100% - 24px)); }
.stage[data-pos="right"] { left: auto; right: 12px; transform: none; justify-content: flex-end; }
.stage[data-size="compact"] { --H: 48px; --I: 30px; --W: 360px; }
.stage[data-lines="one"] { --H: 46px; --dt: calc(var(--H) - 8px); }
.stage[data-lines="one"][data-size="compact"] { --H: 40px; }
.stage[data-istyle="dot"] { --I: 20px; }
.stage[data-istyle="tag"] { --pl: 14px; }
.stage[data-font="mono"] { font-family: ${MONO}; }

.island {
  --accent: #8FA4FF; --on-accent: #0B0B10;
  --w: 40px; --h: 30px; --r: 15px; --y: -130%; --s: .6; --o: 0; --dy: 0px;
  --ro: calc(var(--H) / 2); --rx: 24px;
  --sub: color-mix(in srgb, var(--fg) 56%, var(--bgs));
  --btn: color-mix(in srgb, var(--fg) 9%, transparent);
  --btnh: color-mix(in srgb, var(--fg) 15%, transparent);
  --edge: color-mix(in srgb, var(--fg) 9%, transparent);
  position: relative; pointer-events: auto; box-sizing: border-box;
  width: var(--w); height: var(--h); border-radius: var(--r);
  background: var(--bg); color: var(--fg);
  box-shadow: inset 0 0 0 1px var(--edge), 0 12px 32px -14px rgba(0,0,0,.45);
  -webkit-backdrop-filter: blur(24px) saturate(1.8); backdrop-filter: blur(24px) saturate(1.8);
  transform: translateY(var(--y)) translateY(var(--dy)) scale(var(--s));
  transform-origin: 50% 0; opacity: var(--o);
  overflow: hidden; cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: none;
  transition: width .6s cubic-bezier(.3,1.4,.5,1), height .55s cubic-bezier(.3,1.3,.5,1), border-radius .5s ease,
    transform .55s cubic-bezier(.3,1.35,.5,1), opacity .25s ease, background .3s ease, color .3s ease;
}
.stage.fx-edge .island { box-shadow: inset 0 0 0 1px var(--edge), 0 14px 36px -16px rgba(0,0,0,.5), 0 8px 26px -14px color-mix(in srgb, var(--accent) 45%, transparent); }
.stage[data-pos="right"] .island { transform-origin: 100% 0; }
.stage[data-shape="soft"] .island { --ro: 16px; --rx: 16px; }
.stage[data-shape="sharp"] .island { --ro: 7px; --rx: 7px; }
.island[data-state="hidden"] { --y: -130%; --s: .6; --o: 0; }
.island[data-state="pill"] { --y: 0%; --s: 1; --o: 1; --w: 104px; --h: 28px; --r: 14px; }
.stage[data-shape="soft"] .island[data-state="pill"] { --r: 10px; }
.stage[data-shape="sharp"] .island[data-state="pill"] { --r: 5px; }
.island[data-state="open"] { --y: 0%; --s: 1; --o: 1; --w: 100%; --h: var(--H); --r: var(--ro); }
.island[data-state="expanded"] { --y: 0%; --s: 1; --o: 1; --w: 100%; --h: var(--hx, 140px); --r: var(--rx); }
.island.dragging { transition: none; }
.island.bump { animation: bump .45s cubic-bezier(.3,1.6,.5,1); }

.pip { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 5px; opacity: 0; transition: opacity .18s ease; }
.island[data-state="pill"] .pip { opacity: 1; }
.pip i { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: breathe .9s ease-in-out infinite; }
.stage[data-shape="sharp"] .pip i { border-radius: 1px; }
.pip i:nth-child(2) { animation-delay: .12s; }
.pip i:nth-child(3) { animation-delay: .24s; }

.inner {
  position: absolute; left: 0; right: 0; top: 0; height: var(--H); box-sizing: border-box;
  display: flex; align-items: center; gap: 12px; padding: 0 18px 0 var(--pl);
  opacity: 0; filter: blur(6px); transform: scale(.97);
  transition: opacity .3s ease .14s, filter .35s ease .14s, transform .5s cubic-bezier(.3,1.4,.5,1) .1s;
}
.stage[data-istyle="dot"] .inner { gap: 10px; }
.island[data-state="open"] .inner, .island[data-state="expanded"] .inner { opacity: 1; filter: none; transform: none; }
.island .inner.swap { opacity: 0; filter: blur(8px); transform: translateY(-6px) scale(.98); transition: opacity .16s ease, filter .16s ease, transform .16s ease; }

.ico { position: relative; flex: none; width: var(--I); height: var(--I); border-radius: 50%; display: grid; place-items: center;
  color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); transition: background .3s ease, color .3s ease, border-radius .3s ease; }
.stage[data-ishape="squircle"] .ico { border-radius: 30%; }
.stage[data-ishape="none"]:not([data-istyle="solid"]) .ico { background: transparent; }
.stage[data-istyle="solid"] .ico { background: var(--accent); color: var(--on-accent); }
.stage[data-istyle="dot"] .ico { background: transparent; }
.stage[data-istyle="tag"] .ico { width: auto; height: 22px; padding: 0 7px; border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 13%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 38%, transparent); }
.glyph { display: grid; place-items: center; }
.g-svg { width: calc(var(--I) * .5); height: calc(var(--I) * .5); display: block; }
.g-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, transparent); }
.stage[data-shape="sharp"] .g-dot { border-radius: 2px; }
.g-tag { font: 700 10.5px/1 ${MONO}; letter-spacing: .06em; }
.g-emo { font-size: calc(var(--I) * .5); line-height: 1; font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif; }
.glyph.pop { animation: pop .6s cubic-bezier(.3,1.7,.5,1); }

.ring { position: absolute; inset: -3px; width: calc(100% + 6px); height: calc(100% + 6px); overflow: visible; display: none; }
.stage[data-countdown="ring"]:not([data-istyle="tag"]):not([data-istyle="dot"]) .ring { display: block; }
.ring rect { x: 1.25px; y: 1.25px; width: calc(100% - 2.5px); height: calc(100% - 2.5px); rx: calc(50% - 1.25px);
  fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 100; stroke-dashoffset: 0; }
.stage[data-ishape="squircle"] .ring rect { rx: 32%; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: color-mix(in srgb, var(--accent) 16%, transparent); overflow: hidden; display: none; }
.stage[data-shape="pill"] .bar { left: 22%; right: 22%; border-radius: 2px; }
.stage[data-shape="soft"] .bar { left: 14px; right: 14px; }
.bar i { position: absolute; inset: 0; background: var(--accent); transform-origin: 0 50%; transform: scaleX(1); }
.island[data-state="open"] .bar { display: var(--bar-on, none); }
.stage[data-countdown="bar"] { --bar-on: block; }
.stage[data-countdown="ring"][data-istyle="dot"], .stage[data-countdown="ring"][data-istyle="tag"] { --bar-on: block; }

.txt { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.stage[data-lines="one"] .txt { flex-direction: row; align-items: baseline; gap: 8px; }
.stage[data-lines="one"] .t { flex: none; max-width: 62%; }
.stage[data-lines="one"] .b { flex: 1; min-width: 0; }
.t { font-size: 13.5px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.b { font-size: 12.5px; color: var(--sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .2s ease; }
.stage[data-size="compact"] .t { font-size: 13px; }
.stage[data-size="compact"] .b { font-size: 12px; }
.stage[data-font="mono"] .t { font-size: 12.5px; letter-spacing: 0; }
.stage[data-font="mono"] .b { font-size: 11.5px; }
.island[data-state="expanded"] .b { opacity: 0; }
.caret { display: inline-block; width: .55em; height: 1.05em; margin-left: 2px; vertical-align: -2px; background: var(--accent); animation: blink 1s steps(1) infinite; }
.meta { flex: none; display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--sub); font-variant-numeric: tabular-nums; }
.when:empty { display: none; }
.count { font-size: 10.5px; font-weight: 650; color: var(--accent); background: color-mix(in srgb, var(--accent) 15%, transparent); padding: 2px 7px; border-radius: 999px; }
.stage[data-shape="sharp"] .count { border-radius: 3px; }
.count[hidden] { display: none; }
.count.tick { animation: pop .45s cubic-bezier(.3,1.7,.5,1); }

.detail { position: absolute; top: var(--dt); left: 0; right: 0; box-sizing: border-box;
  padding: 0 18px 14px calc(var(--pl) + var(--I) + 12px);
  opacity: 0; transform: translateY(-6px); transition: opacity .2s ease, transform .3s ease; pointer-events: none; }
.stage[data-istyle="tag"] .detail { padding-left: var(--pl); }
.stage[data-istyle="dot"] .detail { padding-left: calc(var(--pl) + var(--I) + 10px); }
.island[data-state="expanded"] .detail { opacity: 1; transform: none; transition-delay: .12s; pointer-events: auto; }
.full { font-size: 12.5px; line-height: 1.5; color: var(--fg); opacity: .85; margin: 0 0 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.stage[data-font="mono"] .full { font-size: 12px; }
.full:empty { display: none; }
.actions { display: flex; gap: 6px; flex-wrap: wrap; }
.actions button { all: unset; box-sizing: border-box; cursor: pointer; font: inherit; font-size: 12px; font-weight: 600;
  padding: 6px 12px; border-radius: 999px; background: var(--btn); color: var(--fg); transition: background .15s ease, transform .15s ease, filter .15s ease; }
.stage[data-shape="soft"] .actions button { border-radius: 8px; }
.stage[data-shape="sharp"] .actions button { border-radius: 4px; }
.actions button:hover { background: var(--btnh); }
.actions button.primary { background: var(--accent); color: var(--on-accent); }
.actions button.primary:hover { filter: brightness(1.08); }
.actions button:active { transform: scale(.94); }
.actions button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.glow { position: absolute; inset: 0; border-radius: inherit; padding: 1.25px; box-sizing: border-box; pointer-events: none; opacity: 0; display: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }
.stage.fx-edge .glow { display: block; }
.glow::before { content: ""; position: absolute; left: 50%; top: 50%; width: 640px; height: 640px; margin: -320px 0 0 -320px;
  background: conic-gradient(from 0deg, transparent 0 58%, var(--accent) 76%, #fff 80%, var(--accent) 84%, transparent 100%); }
.glow.run { animation: glowfade 1.6s ease-out forwards; }
.glow.run::before { animation: spin 1.6s cubic-bezier(.25,.6,.3,1) forwards; }

.wave { position: absolute; top: 0; width: 100%; height: var(--H); box-sizing: border-box; border-radius: calc(var(--H) / 2);
  border: 1.25px solid var(--accent); pointer-events: none; animation: wave .9s cubic-bezier(.2,.7,.3,1) forwards; }
.stage[data-shape="soft"] .wave { border-radius: 16px; }
.stage[data-shape="sharp"] .wave { border-radius: 7px; }
.spark { position: absolute; top: calc(var(--H) / 2); width: 4px; height: 4px; border-radius: 50%; pointer-events: none; }

@keyframes breathe { 0%, 100% { transform: scale(.7); opacity: .5; } 50% { transform: scale(1.1); opacity: 1; } }
@keyframes pop { 0% { transform: scale(.3) rotate(-20deg); } 100% { transform: none; } }
@keyframes bump { 0% { transform: scale(1); } 35% { transform: scale(1.03, .96); } 100% { transform: scale(1); } }
@keyframes spin { to { transform: rotate(540deg); } }
@keyframes glowfade { 0% { opacity: 0; } 12% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; } }
@keyframes wave { from { opacity: .5; transform: scale(1); } to { opacity: 0; transform: scale(1.08, 1.55); } }
@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .island { transition: opacity .2s ease; }
  .inner, .detail { transition: opacity .2s ease; filter: none; transform: none; }
  .glow, .wave, .spark { display: none !important; }
  .pip i, .glyph.pop, .island.bump, .count.tick, .caret { animation: none; }
}
`;

  // ---------- sound ----------
  const NOTES = {
    message: [659.25, 987.77], success: [783.99, 1046.5, 1318.51], reminder: [880, 1174.66],
    alert: [587.33, 440], timer: [698.46, 880, 1046.5],
  };
  let audioCtx = null;
  function audio() {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function voice(ctx, freq, t, peak, len, type, glideTo) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + len * 0.5);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + len + 0.05);
  }
  function playTone(tone, kind) {
    if (tone === 'off') return;
    try {
      const ctx = audio(); if (!ctx) return;
      const t0 = ctx.currentTime + 0.02;
      if (tone === 'pop') { voice(ctx, 380, t0, 0.15, 0.16, 'sine', 820); return; }
      if (tone === 'blip') {
        const up = kind !== 'alert';
        voice(ctx, up ? 1320 : 990, t0, 0.03, 0.06, 'square');
        voice(ctx, up ? 1760 : 740, t0 + 0.07, 0.03, 0.07, 'square');
        return;
      }
      (NOTES[kind] || NOTES.message).forEach((f, i) => {
        const t = t0 + i * 0.085;
        voice(ctx, f, t, 0.1, 0.6, 'sine');
        voice(ctx, f * 2, t, 0.022, 0.45, 'sine');
      });
    } catch (_) { /* sound is optional */ }
  }

  // ---------- notes ----------
  function defaultActions(n) {
    const list = [];
    if (n.url) list.push({ id: 'open', label: 'Open', primary: true });
    if (n.type === 'reminder') {
      list.push({ id: 'snooze', label: 'Snooze 5 min' });
      list.push({ id: 'done', label: 'Done', primary: !n.url });
    } else {
      list.push({ id: 'dismiss', label: 'Dismiss', primary: !n.url });
    }
    return list;
  }

  function normalize(n) {
    n = n || {};
    const type = KINDS.includes(n.type) ? n.type : 'message';
    return {
      id: n.id || Math.random().toString(36).slice(2),
      type,
      title: String(n.title || LABELS[type]).slice(0, 120),
      body: String(n.body || '').slice(0, 600),
      app: n.app ? String(n.app).slice(0, 24) : '',
      url: typeof n.url === 'string' && /^https?:\/\//.test(n.url) ? n.url : '',
      duration: Number.isFinite(n.duration) ? Math.max(0, n.duration) : null,
      sticky: !!n.sticky,
      actions: Array.isArray(n.actions) ? n.actions.slice(0, 3) : null,
      icon: typeof n.icon === 'string' && SOURCE_GLYPHS[n.icon] ? n.icon : '',
      ref: typeof n.ref === 'string' ? n.ref.slice(0, 80) : '',
      at: Date.now(),
    };
  }
  const clockTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // ---------- island ----------
  function create(opts) {
    let o = mergeOptions(DEFAULTS, Object.assign({ mode: 'fixed', mount: document.documentElement, top: 10, onAction: null }, opts || {}));

    const host = document.createElement('islet-root');
    host.style.cssText = 'all: initial;';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>
<div class="stage${o.mode === 'contained' ? ' contained' : ''}">
  <div class="island" data-state="hidden" role="status" aria-live="polite">
    <div class="glow"></div>
    <div class="pip"><i></i><i></i><i></i></div>
    <div class="inner">
      <div class="ico"><svg class="ring" aria-hidden="true"><rect pathLength="100"/></svg><span class="glyph"></span></div>
      <div class="txt"><div class="t"></div><div class="b"></div></div>
      <div class="meta"><span class="when"></span><span class="count" hidden></span></div>
    </div>
    <div class="detail"><p class="full"></p><div class="actions"></div></div>
    <div class="bar"><i></i></div>
  </div>
</div>`;
    o.mount.appendChild(host);

    const $ = (s) => root.querySelector(s);
    const stage = $('.stage'), island = $('.island'), inner = $('.inner'), glow = $('.glow'), ico = $('.ico');
    const glyphEl = $('.glyph'), ringR = $('.ring rect'), barI = $('.bar i'), tEl = $('.t'), bEl = $('.b');
    const when = $('.when'), count = $('.count'), full = $('.full'), actions = $('.actions'), detail = $('.detail');
    const reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let state = 'hidden', current = null, queue = [], timers = [], accents = resolveAccents(o), typeTimer = 0;
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const clearLater = () => { timers.forEach(clearTimeout); timers = []; clearInterval(typeTimer); };
    const clock = { dur: 0, elapsed: 0, start: 0, running: false, raf: 0 };
    let hovering = false;

    function applyOptions() {
      const s = surfaceOf(o.surface);
      island.style.setProperty('--bg', s.bg);
      island.style.setProperty('--bgs', s.solid);
      island.style.setProperty('--fg', s.fg);
      stage.style.setProperty('--top', (o.top | 0) + 'px');
      stage.dataset.size = o.size === 'compact' ? 'compact' : 'regular';
      stage.dataset.shape = ['pill', 'soft', 'sharp'].includes(o.shape) ? o.shape : 'pill';
      stage.dataset.pos = o.position === 'right' ? 'right' : 'center';
      stage.dataset.istyle = ['line', 'solid', 'dot', 'tag', 'emoji'].includes(o.iconStyle) ? o.iconStyle : 'line';
      stage.dataset.ishape = ['circle', 'squircle', 'none'].includes(o.iconShape) ? o.iconShape : 'circle';
      stage.dataset.countdown = ['ring', 'bar', 'off'].includes(o.countdown) ? o.countdown : 'ring';
      stage.dataset.lines = o.lines === 'one' ? 'one' : 'two';
      stage.dataset.font = o.font === 'mono' ? 'mono' : 'system';
      stage.classList.toggle('fx-edge', !!o.effects.edge);
      accents = resolveAccents(o);
      if (current) { paintAccent(current); when.textContent = metaText(current); }
    }
    function paintAccent(n) {
      const a = accents[n.type];
      island.style.setProperty('--accent', a);
      island.style.setProperty('--on-accent', onColor(a));
      glyphEl.innerHTML = glyph(n.type, o.iconStyle, n.icon);
    }
    const metaText = (n) => (o.font === 'mono' ? [n.app, clockTime(n.at)].filter(Boolean).join(' · ') : n.app);
    applyOptions();

    const setState = (s) => { state = s; island.dataset.state = s; };

    function updateCount() {
      const n = queue.length;
      count.hidden = n === 0;
      if (n) { count.textContent = '+' + n; count.classList.remove('tick'); void count.offsetWidth; count.classList.add('tick'); }
    }

    function fill(n) {
      paintAccent(n);
      clearInterval(typeTimer);
      tEl.textContent = n.title;
      bEl.textContent = n.body.split('\n')[0];
      full.textContent = n.body;
      when.textContent = metaText(n);
      actions.textContent = '';
      (n.actions || defaultActions(n)).forEach((a) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(a.label || a.id).slice(0, 24);
        if (a.primary) btn.className = 'primary';
        btn.addEventListener('click', (e) => { e.stopPropagation(); act(String(a.id), n); });
        actions.appendChild(btn);
      });
      setProgress(0);
      updateCount();
    }

    function typeTitle(text) {
      clearInterval(typeTimer);
      const caret = document.createElement('span');
      caret.className = 'caret';
      let i = 0;
      tEl.textContent = ''; tEl.appendChild(caret);
      typeTimer = setInterval(() => {
        i++;
        tEl.textContent = text.slice(0, i); tEl.appendChild(caret);
        if (i >= text.length) clearInterval(typeTimer);
      }, 24);
    }

    function act(id, n) {
      try { if (typeof o.onAction === 'function') o.onAction(id, n); } catch (_) {}
      if (id === 'open' && n.url) global.open(n.url, '_blank', 'noopener');
      advance();
    }

    // countdown
    function setProgress(p) {
      ringR.style.strokeDashoffset = (100 * p).toFixed(2);
      barI.style.transform = `scaleX(${(1 - p).toFixed(4)})`;
    }
    function durationFor(n) {
      if (n.sticky) return 0;
      if (n.duration != null) return n.duration;
      return n.type === 'reminder' ? o.duration * 2 : o.duration;
    }
    function startClock(ms) {
      cancelAnimationFrame(clock.raf);
      clock.dur = ms; clock.elapsed = 0; clock.running = false;
      setProgress(0);
      if (ms > 0) resumeClock();
    }
    function tick() {
      if (!clock.running) return;
      const p = Math.min(1, (clock.elapsed + performance.now() - clock.start) / clock.dur);
      setProgress(p);
      if (p >= 1) { clock.running = false; advance(); return; }
      clock.raf = requestAnimationFrame(tick);
    }
    function pauseClock() {
      if (!clock.running) return;
      clock.elapsed += performance.now() - clock.start;
      clock.running = false; cancelAnimationFrame(clock.raf);
    }
    function resumeClock() {
      if (clock.running || clock.dur <= 0 || state !== 'open' || hovering || document.hidden) return;
      clock.start = performance.now(); clock.running = true;
      clock.raf = requestAnimationFrame(tick);
    }

    // moments
    function wave() {
      if (reduced || !o.effects.ripple) return;
      const w = document.createElement('div');
      w.className = 'wave';
      w.style.setProperty('--accent', island.style.getPropertyValue('--accent'));
      w.style.left = island.offsetLeft + 'px';
      w.style.width = island.offsetWidth + 'px';
      stage.insertBefore(w, island);
      w.addEventListener('animationend', () => w.remove());
    }
    function burst() {
      if (reduced || !o.effects.sparks || !stage.animate) return;
      const color = island.style.getPropertyValue('--accent');
      const x = island.offsetLeft + ico.offsetLeft + ico.offsetWidth / 2;
      for (let i = 0; i < 16; i++) {
        const s = document.createElement('i');
        s.className = 'spark';
        s.style.left = x + 'px';
        s.style.background = i % 3 ? color : '#ffffff';
        stage.appendChild(s);
        const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
        const d = 24 + Math.random() * 32;
        const anim = s.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * d).toFixed(1)}px)) scale(.15)`, opacity: 0 },
        ], { duration: 600 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
        anim.onfinish = () => s.remove();
      }
    }
    function arrive(n) {
      playTone(o.tone, n.type);
      if (o.effects.edge) { glow.classList.remove('run'); void glow.offsetWidth; glow.classList.add('run'); }
      glyphEl.classList.remove('pop'); void glyphEl.offsetWidth; glyphEl.classList.add('pop');
      if (o.effects.type && !reduced) typeTitle(n.title);
      wave();
      if (n.type === 'success' || n.type === 'timer') later(burst, 140);
      startClock(durationFor(n));
    }

    function appear(n) {
      clearLater();
      current = n; fill(n);
      island.style.setProperty('--dy', '0px');
      setState('pill');
      later(() => { setState('open'); arrive(n); }, reduced ? 0 : 300);
    }
    function swapTo(n) {
      clearLater(); pauseClock();
      if (state === 'expanded') setState('open');
      inner.classList.add('swap');
      later(() => {
        current = n; fill(n);
        inner.classList.remove('swap');
        island.classList.remove('bump'); void island.offsetWidth; island.classList.add('bump');
        arrive(n);
      }, 170);
    }
    function close(fling) {
      clearLater(); pauseClock(); clock.dur = 0;
      if (fling || reduced) {
        setState('hidden');
        later(() => { island.classList.add('dragging'); island.style.setProperty('--dy', '0px'); void island.offsetWidth; island.classList.remove('dragging'); current = null; }, 450);
        return;
      }
      setState('pill');
      later(() => { setState('hidden'); current = null; }, 300);
    }
    function advance(fling) {
      if (queue.length) {
        const next = queue.shift();
        if (fling) { close(true); later(() => appear(next), 380); } else swapTo(next);
      } else close(fling);
    }

    function show(raw) {
      const n = normalize(raw);
      if (!current) { appear(n); return n.id; }
      if (queue.length >= 20) queue.shift();
      queue.push(n); updateCount();
      island.classList.remove('bump'); void island.offsetWidth; island.classList.add('bump');
      return n.id;
    }
    function replace(raw) {
      const n = normalize(raw);
      queue = [];
      if (!current || state === 'hidden' || state === 'pill') appear(n); else swapTo(n);
      return n.id;
    }

    function toggleExpand() {
      if (state === 'open') {
        island.style.setProperty('--hx', Math.max(island.offsetHeight, detail.offsetTop + detail.offsetHeight) + 'px');
        setState('expanded'); pauseClock();
      } else if (state === 'expanded') { setState('open'); resumeClock(); }
    }

    // gestures: hover pauses, click expands, swipe up dismisses
    let drag = null;
    island.addEventListener('pointerenter', () => { hovering = true; pauseClock(); });
    island.addEventListener('pointerleave', () => { hovering = false; resumeClock(); });
    island.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || (e.target.closest && e.target.closest('button'))) return;
      if (state !== 'open' && state !== 'expanded') return;
      drag = { y: e.clientY, dy: 0, moved: false, id: e.pointerId };
      try { island.setPointerCapture(e.pointerId); } catch (_) {}
    });
    island.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) > 4) { drag.moved = true; island.classList.add('dragging'); }
      if (drag.moved) { drag.dy = dy; island.style.setProperty('--dy', (dy < 0 ? dy : dy * 0.22).toFixed(1) + 'px'); }
    });
    const endDrag = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag; drag = null;
      island.classList.remove('dragging');
      if (!d.moved) { toggleExpand(); return; }
      if (d.dy < -24) advance(true); else island.style.setProperty('--dy', '0px');
    };
    island.addEventListener('pointerup', endDrag);
    island.addEventListener('pointercancel', endDrag);

    const onVis = () => (document.hidden ? pauseClock() : resumeClock());
    document.addEventListener('visibilitychange', onVis);

    return {
      show, replace,
      dismiss: () => advance(),
      setOptions(p) { o = mergeOptions(o, p); applyOptions(); },
      destroy() { clearLater(); pauseClock(); document.removeEventListener('visibilitychange', onVis); host.remove(); },
      get state() { return state; },
    };
  }

  global.IsletCore = {
    create, KINDS, LABELS, TAGS, PALETTES, SURFACES, PRESETS, PRESET_NAMES, EMOJI,
    DEFAULTS: JSON.parse(JSON.stringify(DEFAULTS)),
    resolveAccents, surfaceOf, glyph, onColor, mergeOptions, applyPreset,
  };
})(typeof window !== 'undefined' ? window : globalThis);
