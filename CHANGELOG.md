# Changelog

## 1.1.2 - 2026-11-20

### Fixes
- Backup sizes: base 1024 with IEC units (KiB, MiB, GiB) and 2/1/0 decimals, like the other ha-* cards (was KB/MB/GB).

### Performance
- Visual editors: the form gets new data and a new schema only when the configuration or the language changes, no longer on every state change of Home Assistant.

### Maintenance
- Release: the HACS validation is a prerequisite of a release again (it was left out until the first release existed).
- Tests: the coverage report now measures the card source itself.
- README: the mini card's detail button is in the banner's top-right corner.

## 1.1.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.1.0 - 2026-11-17

### Features
- **Illustrated header**, aligned with the other cards: a 90 px banner on the full card and now on the **mini card** too, the title and status on the sky at the left, the scene on the right standing on a 10 px network strip (cyan packets on a navy cable, red dashes on grey when cut off; day and night variants).
- New scene: a house linked to the cloud (padlock in the state colour) and to a phone away by an encrypted tunnel, with a latency pill. Connected: green, dots flowing; connecting: amber, slower flow; disconnected: the tunnel breaks with a red cross and the phone goes dark.
- The round header icon always shows the state colour (blue connected, amber connecting, red disconnected, grey signed out), day and night, on the full and mini cards; SVG ids unique per card instance.
- The banner switches to its night picture with the dark theme of Home Assistant too, even while the sun is up (`illustration_theme: auto`); `day` and `night` still force it.
- **Status pill on the title line** of every header (banner or classic, full and mini cards): right after the title, in the header icon's colour, only when the whole title and its whole label fit there, otherwise on its own line under the statistics (then kept to one line), and only its dot when even that does not fit in the banner or the card is 200 px wide or less (measured on the rendered card, so that it fits in every language); it replaces the status chip under the header and the status text of the mini banner. The mini card's expand button sits in the banner's top-right corner, 24 px, like the collapse button of the unfolded card.
- On a mini card wider than 300 px, the scene steps left of the corner expand / collapse button at full size (the hill running on under the button): the cloud no longer sits under it.

## 1.0.0 - 2026-11-16

### Features
- **Cloud Card** (`custom:cloud-card`): Home Assistant Cloud (Nabu Casa) and remote access at a glance, under an animated illustrated banner: a house linked to the cloud, linked to a phone, with dots flowing along the links, drifting clouds and packets running along the bottom strip. When the cloud connection drops, the check turns into a red cross and the flow stops. Night sky (stars, moon) after sunset or with the dark theme, or forced with `illustration_theme`; `illustration: false` gives a classic header. `prefers-reduced-motion` is honoured.
- Status chips: the cloud connection (connected, connecting, disconnected, subscription expired), the number of services to check, and the subscription's renewal date (administrators).
- Three indicators: the **latency** of the remote access, measured from the browser through the remote URL (Home Assistant exposes none; `latency: false` turns the measure off), the **availability of the remote access** over up to 30 days, computed from the recorder history of the cloud's Remote UI sensor (`uptime_days`), and the **days left on the remote certificate**, with a ring.
- Six service tiles, neutral while healthy and coloured only on an issue: Remote access, Cloud backup (last backup stored in the cloud and its size), Alexa and Google Assistant (linked, exposed entities), Webhooks (cloudhooks) and Cloud TTS (default voice); their order and selection with `services`. A tap opens the service's details in a popup at the top of the card, closed by a click elsewhere, Escape, or when the card leaves the page.
- Tinted buttons: **Sync voice assistants** (Alexa and Google Assistant, administrators) and **Open remote URL**; `hide_url` masks the remote URL in the card.
- **Cloud Mini Card** (`custom:cloud-mini-card`): the status, latency, certificate and what needs a look (remote access down for how long, services to check) on two lines, with a detail button that unfolds the full card and folds back on a click elsewhere.
- Users who are not administrators see what Home Assistant gives them (cloud status, Remote UI history, backup sensors); the administrator-only commands are not called for them.
- Visual editors for both cards, the mini card's with the full card's options; 22 languages, with only English in the bundle and each other language loaded on demand.
