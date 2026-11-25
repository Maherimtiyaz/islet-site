# 🏝️ Islet

**Notifications that drop in, then get out of the way.**

Islet is a Chrome extension that turns your GitHub, Gmail, Slack and WhatsApp notifications into one small island at the top of whatever tab you're on. It opens, says one thing, and tucks itself away.

▶️ **[Watch the 1-minute demo](https://maherimtiyaz.github.io/islet-site/islet-demo.mp4)** · 🚀 **[Install Islet](https://maherimtiyaz.github.io/islet-site/install.html)** · 🌐 **[Website](https://maherimtiyaz.github.io/islet-site/)** · 🔒 **[Privacy](https://maherimtiyaz.github.io/islet-site/privacy.html)** · 🐞 **[Report a bug](https://github.com/Maherimtiyaz/islet/issues)**

![Chrome extension](https://img.shields.io/badge/Chrome-extension-0B0B0E?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-8FA4FF)
![No servers](https://img.shields.io/badge/servers-none-4FE0A2)
![No tracking](https://img.shields.io/badge/tracking-none-4FE0A2)
![Windows · Mac · Linux](https://img.shields.io/badge/Windows%20·%20Mac%20·%20Linux-supported-C79BFF)

---

## 🤔 Why Islet?

Four apps. Four kinds of pop-ups. All stacking up in the corner of your screen while you're trying to think.

Islet gives them **one quiet place to speak, one at a time.** A notification drops in from the top of the tab you're on, stretches open, says one thing, and leaves. If three arrive at once, you see one island with a small **+2**, and each takes its turn.

- **Calm:** one island, one message, no pile of boxes.
- **Fast:** read it at a glance, or click to see everything and act.
- **Private:** no servers, no account, no tracking. Text hides while you share your screen.

---

## ✨ Features

### 🔌 Your apps, in one place

| App | What drops in | What you can do |
|---|---|---|
| **GitHub** | Review requests, mentions, assignments, CI passed or failed | **Open** the pull request, **Mark read** |
| **Gmail** | New mail from your inbox, or important mail only | **Open** the email |
| **Slack** | DMs and mentions from Slack in another tab | **Open** jumps straight to the conversation |
| **WhatsApp Web** | New chats and group messages | **Open** jumps straight to the chat |

### 🙈 Privacy mode: present without the panic

One message from the wrong group chat is all it takes.

- **While sharing (default):** start presenting in Google Meet, Zoom or Teams in Chrome, and message text hides by itself until you stop.
- **Hide text, or text and sender:** show "Family group · Text hidden", or just "New WhatsApp message".
- **Always:** keep text hidden all the time.
- **Shortcut:** press `Alt + Shift + H` to hide everything instantly, for sharing from desktop apps like the Zoom app.

### 👆 Gestures

- **Hover** an island to pause its countdown.
- **Click** to open the full message and its buttons.
- **Swipe up** to dismiss it. The next one slides in.

### ⏰ Reminders and focus

- Send yourself a note **now**, or in **1, 5, 15 or 60 minutes**.
- Reminders come back with **Snooze 5 min** and **Done**.
- Start a **15, 25 or 50 minute** focus session that taps you when it's over.

### 🎨 Six looks, every detail yours

| Look | Feels like |
|---|---|
| **Minimal** | One line, a small dot, nothing extra (the default) |
| **Classic** | Icon in a circle, countdown ring, a soft glow and sparks |
| **Terminal** | Monospace, `OK` / `WARN` tags, the title types itself with a blinking cursor |
| **Editor** | Code-editor dark, mono text, rounded badges |
| **Paper** | Light and soft |
| **Neon** | Gradient glow, bright colors |

Then fine-tune: island color, each kind's color, icon style (dot, line, solid, tag, emoji), badge, shape (pill, soft, sharp), one or two lines, sans or mono font, size, position, countdown (ring, bar, off), effects (glow, ripple, sparks, typing) and sound (chime, pop, blip, off).

---

## 🚀 Install

> Islet is on its way to the Chrome Web Store. Until then, early access takes two minutes.

**1. Download** [islet-extension.zip](https://maherimtiyaz.github.io/islet-site/islet-extension.zip)

**2. Unzip it**
- **Windows:** right-click the file → **Extract All** → **Extract**
- **Mac:** double-click the file

**3. Open Chrome's extensions page.** Type `chrome://extensions` in the address bar and press Enter.

**4. Turn on Developer mode** with the switch in the top-right corner.

**5. Click Load unpacked** and choose the unzipped folder (the one with `manifest.json` inside).

**6. Pin it.** Click the 🧩 puzzle piece next to the address bar, then the 📌 next to Islet.

Open Islet any time with its icon, or with `Alt + Shift + I` (Mac: `Option + Shift + I`). A welcome page opens and your first island drops in.

**Works in:** Chrome, Edge, Brave and Arc on Windows, Mac, Linux and Chromebook.
**Not on:** phones and tablets. Chrome doesn't run extensions there.

---

## 🔗 Connect your apps

Open Islet → **Sources**. Every source is off until you switch it on.

| Source | What you need |
|---|---|
| **Gmail** | Nothing. Islet uses the Google account you're signed in to in Chrome. Pick the account if you have more than one. |
| **GitHub** | A [classic personal access token](https://github.com/settings/tokens/new?scopes=notifications&description=Islet) with the `notifications` scope. GitHub doesn't let fine-grained tokens read notifications yet. |
| **Slack** | Keep `app.slack.com` open in a tab. A pinned tab works well. |
| **WhatsApp** | Keep `web.whatsapp.com` open in a tab. |

When you switch a source on, Islet shows **one summary** (for example "4 unread on GitHub") instead of a flood, then an island for each new item. Never more than three at once.

---

## 🔒 Privacy

Islet has **no servers, no account and no analytics.** There is nowhere for your data to go.

- Your **GitHub token** is saved in your browser and sent **only** to `api.github.com`.
- **Gmail** is read through the session you're already signed in to. Islet keeps only message IDs, so it never shows the same email twice.
- **Slack and WhatsApp** notifications are read from their own open tabs and never stored.
- **Privacy mode** notices only *that* a page started or stopped sharing your screen, never *what* is shared.
- Your **style settings** use Chrome sync, so they follow you between your own devices.

Full policy: [maherimtiyaz.github.io/islet-site/privacy.html](https://maherimtiyaz.github.io/islet-site/privacy.html)

---

## 🧑‍💻 For developers

Any web page can show an island in its own tab when Islet is installed. Great for local dev servers, CI dashboards and internal tools:

```js
window.postMessage({
  __islet: true,
  type: 'success',          // message | success | reminder | alert | timer
  title: 'Build passed',
  body: 'main · 2m 14s',
  url: 'https://ci.example.com/run/1234', // optional: adds an Open button
}, '*');
```

The island itself is one dependency-free file, `island-core.js`, so you can use it in your own page:

```html
<script src="island-core.js"></script>
<script>
  const island = IsletCore.create(IsletCore.applyPreset(IsletCore.DEFAULTS, 'terminal'));
  island.show({ type: 'success', title: 'Deployed', body: 'v2.4.1 is live' });
</script>
```

---

## ⚙️ How it works

| File | What it does |
|---|---|
| `background.js` | Delivers islands to the tab you're on; runs reminders, focus sessions, GitHub and Gmail checks, and Privacy mode |
| `sources.js` | GitHub notifications API, Gmail inbox feed, Slack and WhatsApp mapping |
| `content.js` | Mounts the island in each page, inside its own Shadow DOM |
| `island-core.js` | The island itself: rendering, animation, gestures, queue, six looks |
| `hook.js` + `bridge.js` | Run inside Slack and WhatsApp Web and pass their notifications to Islet |
| `share-hook.js` | Notices when a page starts or stops sharing your screen |
| `popup.*` + `customizer.js` | The Send, Style and Sources tabs |
| `welcome.*` | The page that opens after install |

- **Shadow DOM:** no website's CSS can break the island, and Islet's CSS never leaks into the page.
- **Queue, not stack:** islands take turns, pause while hovered or while the tab is hidden, and respect *reduce motion*.
- **Fullscreen:** on YouTube or in slides, the island moves inside the fullscreen view so you still see it.
- **Updates:** after an install or update, Islet reattaches to Slack and WhatsApp tabs that are already open. If it's ever disconnected, those apps get their own pop-ups back, so nothing is lost.
- **Fallback:** on pages extensions can't touch (like `chrome://` pages), or when Chrome isn't the app in front, Islet sends a normal system notification instead.

---

## ❓ FAQ

**Does it show over other apps, or only in Chrome?**
Islands appear at the top of the tab you're looking at in Chrome. When Chrome isn't the app in front, Islet sends a normal system notification so nothing slips past.

**Do I need to keep Slack and WhatsApp open?**
Yes. Islet reads their notifications from the open tab, so no Slack app approval and no access to your workspace data are needed. A pinned tab works well.

**Will it flood me with old notifications?**
No. Switching a source on shows one summary. After that, each new item gets its own island, and never more than three at once.

**Can I make it quieter?**
Pick the **Minimal** look, turn the sound off, and shorten how long islands stay. For GitHub, limit it to reviews, mentions and CI.

**Is it free?**
Yes, Islet is free to use.

---

## 🗺️ What's next

Ideas from early users. Tell us which one you want most in [Issues](https://github.com/Maherimtiyaz/islet/issues).

- [ ] Google Calendar and Outlook
- [ ] Microsoft Teams and Discord
- [ ] An opt-in "Other websites" switch
- [ ] Do Not Disturb hours

---

## 🤝 Contributing

Issues and pull requests are welcome. For a bigger change, open an issue first so we can talk it through.

1. Fork and clone the repo.
2. Load it unpacked (see Install), make your change, then click 🔄 **Reload** on Islet in `chrome://extensions`.
3. Open a pull request with a short description, plus a screenshot or GIF if it changes how something looks.

---

## 📄 License

[MIT](LICENSE) © Maherimtiyaz

---

**If Islet earns a spot in your browser, a ⭐ helps the next person find it. No pressure. Thanks for being here early. 🏝️**
