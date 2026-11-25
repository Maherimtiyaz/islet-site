<div align="center">

# Islet

### Notifications that drop in, then get out of the way.

GitHub reviews, Gmail, Slack and WhatsApp as one small island at the top of whatever Chrome tab you're on.<br>
It opens, says one thing, and tucks itself away.

<a href="https://maherimtiyaz.github.io/islet-site/#demo"><b>▶ Watch the 1-minute demo</b></a> &nbsp;·&nbsp;
<a href="https://maherimtiyaz.github.io/islet-site/install.html"><b>Install Islet</b></a> &nbsp;·&nbsp;
<a href="https://maherimtiyaz.github.io/islet-site/"><b>Website</b></a> &nbsp;·&nbsp;
<a href="https://maherimtiyaz.github.io/islet-site/privacy.html"><b>Privacy</b></a> &nbsp;·&nbsp;
<a href="https://github.com/Maherimtiyaz/islet/issues"><b>Report a bug</b></a>

<br>

![Chrome extension](https://img.shields.io/badge/Chrome-extension-0B0B0E?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-8FA4FF)
![No servers](https://img.shields.io/badge/servers-none-4FE0A2)
![No tracking](https://img.shields.io/badge/tracking-none-4FE0A2)
![Windows · Mac · Linux](https://img.shields.io/badge/Windows%20·%20Mac%20·%20Linux-supported-C79BFF)

</div>

---

## Why Islet?

Four apps. Four kinds of pop-ups. All stacking up in the corner of your screen while you're trying to think.

Islet gives them **one quiet place to speak, one at a time.** A notification drops in from the top of the tab you're on, stretches open, says one thing, and leaves. Three at once? You see one island with a small **+2**, and each takes its turn.

## ✨ What it does

| | |
|---|---|
| 🔀 **GitHub** | Review requests, mentions, assignments and CI results. **Open** the pull request or **Mark read** right from the island. |
| ✉️ **Gmail** | New mail from your inbox, or important mail only. Sender and subject first, the preview when you click. Nothing to set up. |
| #️⃣ **Slack** | DMs and mentions from Slack in another tab. **Open** jumps straight to the conversation. |
| 💬 **WhatsApp Web** | Chats from WhatsApp Web, with Open straight to the chat. |
| 🙈 **Privacy mode** | Share your screen in Meet, Zoom or Teams on the web and message text **hides by itself** until you stop. Hide the sender too, or press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd> any time. |
| 👆 **Gestures** | **Hover** to pause, **click** to read it all, **swipe up** to dismiss. |
| ⏰ **Reminders and focus** | Send yourself a note now or in 1, 5, 15 or 60 minutes. Start a 15, 25 or 50 minute focus session that taps you when it's done. |
| 🎨 **Six looks** | Minimal, Classic, Terminal, Editor, Paper and Neon, then tune colors, icons, shape, size, position, countdown, effects and sound. |
| 🧑‍💻 **For developers** | Any web page can send an island with one `postMessage`. |

### 🙈 Present without the panic

One message from the wrong group chat is all it takes. While you share your screen, Islet keeps the text to itself.

> ▶ **See it happen** in the [1-minute demo](https://maherimtiyaz.github.io/islet-site/#demo): a message arrives mid-presentation and the text stays hidden.

### 🎨 Six looks

| Look | Feels like |
|---|---|
| **Minimal** | One line, a small dot, nothing extra (the default) |
| **Classic** | Icon in a circle, countdown ring, a soft glow and sparks |
| **Terminal** | Monospace, `OK` / `WARN` tags, the title types itself out with a blinking cursor |
| **Editor** | Code-editor dark, mono text, rounded badges |
| **Paper** | Light and soft |
| **Neon** | Gradient glow, bright colors |

Then fine-tune the island color, each kind's color, icon style, badge, shape, size, position, countdown, effects and sound. [See them all on the website](https://maherimtiyaz.github.io/islet-site/#looks).

## 🚀 Install

Islet is on its way to the Chrome Web Store. Until then, early access takes two minutes:

1. **Download** [islet-extension.zip](https://maherimtiyaz.github.io/islet-site/islet-extension.zip) and unzip it (Windows: right-click → Extract All; Mac: double-click).
2. Open **`chrome://extensions`** and switch on **Developer mode** (top right).
3. Click **Load unpacked** and choose the unzipped folder (the one with `manifest.json` inside).
4. **Pin it** with the 🧩 puzzle piece, then click the Islet icon, or press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> (Mac: <kbd>⌥</kbd>+<kbd>⇧</kbd>+<kbd>I</kbd>).

A welcome page opens and your first island drops in. Step-by-step with pictures: **[install page](https://maherimtiyaz.github.io/islet-site/install.html)**.

> Works in **Chrome, Edge, Brave and Arc** on **Windows, Mac, Linux and Chromebook**. Chrome on phones and tablets doesn't run extensions.

## 🔌 Connect your apps

Open Islet → **Sources**. Every source is off until you switch it on.

| Source | What you need |
|---|---|
| **Gmail** | Nothing. Islet uses the Google account you're signed in to in Chrome. Pick the account if you have several. |
| **GitHub** | A [classic personal access token](https://github.com/settings/tokens/new?scopes=notifications&description=Islet) with the `notifications` scope. (GitHub doesn't let fine-grained tokens read notifications yet.) |
| **Slack** | Keep `app.slack.com` open in a tab. A pinned tab works well. |
| **WhatsApp** | Keep `web.whatsapp.com` open in a tab. |

When you switch a source on, Islet shows **one summary** ("4 unread on GitHub") instead of a flood, then an island for each new item.


## 🔒 Privacy

Islet has **no servers, no account and no analytics.** There's nowhere for your data to go.

- Your GitHub token is saved in your browser and sent **only** to `api.github.com`.
- Gmail is read through the session you're already signed in to. Islet keeps only message IDs, so it never shows the same email twice.
- Slack and WhatsApp notifications are read from their own open tabs and never stored.
- For Privacy mode, Islet notices only **that** a page started or stopped sharing your screen, never **what** is shared.
- Your style settings use Chrome sync, so they follow you between your own devices.

Full policy: **[privacy page](https://maherimtiyaz.github.io/islet-site/privacy.html)**.

## 🧑‍💻 For developers

Any page can show an island in its own tab when Islet is installed:

```js
window.postMessage({
  __islet: true,
  type: 'success',          // message | success | reminder | alert | timer
  title: 'Build passed',
  body: 'main · 2m 14s',
  url: 'https://ci.example.com/run/1234', // optional: adds an Open button
}, '*');
```

Perfect for local dev servers, CI dashboards and internal tools.

The island itself is one dependency-free file, `island-core.js`, so you can use it in your own page too:

```html
<script src="island-core.js"></script>
<script>
  const island = IsletCore.create(IsletCore.applyPreset(IsletCore.DEFAULTS, 'terminal'));
  island.show({ type: 'success', title: 'Deployed', body: 'v2.4.1 is live' });
</script>
```

## ⚙️ How it works

```
background.js     delivers islands to the tab you're on; runs reminders, focus sessions,
                  the GitHub / Gmail checks and Privacy mode
sources.js        GitHub notifications API, Gmail inbox feed, Slack / WhatsApp mapping
content.js        mounts the island in each page, inside its own Shadow DOM
island-core.js    the island: rendering, animation, gestures, queue, six looks
hook.js           runs inside Slack and WhatsApp Web and passes their notifications on
bridge.js         connects hook.js to the extension
share-hook.js     notices when a page starts or stops sharing your screen
popup.*           the Send, Style and Sources tabs
customizer.js     the Style panel
welcome.*         the page that opens after install
```

- The island lives in a **Shadow DOM**, so no website's CSS can break it and Islet's never leaks into the page.
- Islands **queue** instead of stacking, pause while hovered or while the tab is hidden, and respect *reduce motion*.
- In **fullscreen** (YouTube, slides), the island moves inside the fullscreen view so you still see it.
- After an install or update, Islet **reattaches** to Slack and WhatsApp tabs that are already open. If it's ever disconnected, those apps get their own pop-ups back, so nothing is silently lost.
- On pages extensions can't touch (like `chrome://` pages), or when Chrome isn't the app in front, Islet sends a normal system notification instead.

## ❓ FAQ

<details>
<summary><b>Does it show over other apps, or only in Chrome?</b></summary>
<br>Islands appear at the top of the tab you're looking at in Chrome. When Chrome isn't the app in front, Islet sends a normal system notification so nothing slips past.
</details>

<details>
<summary><b>Do I need to keep Slack and WhatsApp open?</b></summary>
<br>Yes. Islet reads their notifications from the open tab, so no Slack app approval and no access to your workspace data are needed. A pinned tab works well.
</details>

<details>
<summary><b>Will it flood me with old notifications?</b></summary>
<br>No. Switching a source on shows one summary. After that, each new item gets its own island, and never more than three at once.
</details>

<details>
<summary><b>Can I make it quieter?</b></summary>
<br>Pick the <b>Minimal</b> look (a single line with a dot), turn the sound off, and shorten how long islands stay. For GitHub, limit it to reviews, mentions and CI.
</details>

## 🗺️ What's next

Ideas from early users. Tell us which one you want most in [Issues](https://github.com/Maherimtiyaz/islet/issues):

- [ ] Google Calendar and Outlook
- [ ] Microsoft Teams and Discord
- [ ] An opt-in "Other websites" switch
- [ ] Do Not Disturb hours

## 🤝 Contributing

Issues and pull requests are welcome. For a bigger change, open an issue first so we can talk it through.

1. Fork and clone the repo.
2. Load it unpacked (see Install), make your change, then click **🔄 Reload** on Islet in `chrome://extensions`.
3. Open a pull request with a short description, plus a screenshot or GIF if it changes how something looks.

## 📄 License

[MIT](LICENSE) © Maherimtiyaz

---

<div align="center">

**If Islet earns a spot in your browser, a ⭐ helps the next person find it.**<br>
<sub>No pressure. Thanks for being here early. 🏝️</sub>

</div>
