// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const STYLE = `
  :host { --cc-accent: #2f80ed; --cc-ok: var(--success-color, #43a047); --cc-warn: var(--warning-color, #ffa600);
          --cc-alert: var(--error-color, #db4437); --cc-idle: var(--secondary-text-color, #9e9e9e);
          --cc-primary: var(--primary-color, #03a9f4); display: block; }
  ha-card { overflow: hidden; position: relative; container: cc-card / inline-size; }
  /* A size container has no width of its own content: in a parent sized by its content the card would fall to a
     few pixels. This empty grid gives it a natural width of 400 px without any minimum. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 400px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--cc-ok); } .warn { --c: var(--cc-warn); } .alert { --c: var(--cc-alert); } .idle { --c: var(--cc-idle); }
  /* Status pill: the state colour on a tint, the text mixed with the text colour to stay readable. */
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          line-height: 16px; white-space: nowrap; min-width: 0; max-width: 100%; box-sizing: border-box; overflow: hidden;
          background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color, #212121)); }
  .chip .txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }

  /* ── Illustrated header: 90 px, the scene on the right standing on a 10 px network strip ── */
  .banner { position: relative; height: 90px; overflow: hidden; --strip-h: 10px; --scene-w: min(120px, 46%);
            --sky-text: #0d2a45; --sky-muted: #3b5b78;
            background: linear-gradient(90deg, #f1f8ff 0%, #e2f1fd 34%, #b9def8 70%, #9fd0f3 100%); }
  .banner.night { --sky-text: #ffffff; --sky-muted: rgba(255,255,255,.78);
                  background: linear-gradient(90deg, #1b2f52 0%, #15284a 36%, #0f1f3d 72%, #0a1830 100%); }
  .banner .scene { position: absolute; right: 0; bottom: var(--strip-h); height: calc(100% - var(--strip-h)); width: var(--scene-w); overflow: hidden; }
  /* The network strip: cyan packets on a navy cable, running while the cloud is reached; cut off, red dashes on grey. */
  .strip { position: absolute; left: 0; right: 0; bottom: 0; height: var(--strip-h); background-color: #1e3a5f;
           background-image: linear-gradient(90deg, #4fc3f7 0 14px, transparent 14px); background-size: 22px 2px;
           background-repeat: repeat-x; background-position: 0 50%; box-shadow: inset 0 2px 0 #2f5a8a; }
  .night .strip { background-color: #0f1d33; box-shadow: inset 0 2px 0 #1e3a5f; }
  .strip.down { background-color: #5a6370; background-image: linear-gradient(90deg, #e5484d 0 6px, transparent 6px);
                background-size: 16px 2px;
                box-shadow: inset 0 2px 0 #77808c; }
  .night .strip.down { background-color: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
  .strip.ok { animation: cc-packets 1s linear infinite; } .strip.wait { animation: cc-packets 2s linear infinite; }
  .strip.off { opacity: .75; }
  .head { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--strip-h); right: var(--scene-w); box-sizing: border-box;
          display: flex; align-items: center; gap: 10px; padding: 6px 8px 6px 14px; min-width: 0; color: var(--sky-text); }
  /* The header icon: its colour is the cloud's state (blue connected, amber connecting, red cut off, grey signed out). */
  .badge { width: 40px; height: 40px; flex: none; border-radius: 50%; display: grid; place-items: center; color: var(--c, var(--cc-idle)); }
  .banner .badge.ok, .header .badge.ok { --c: var(--cc-accent); }
  .banner .badge { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .night .badge.ok { --c: #8fbaff; } .night .badge.warn { --c: #ffc94d; } .night .badge.alert { --c: #ff8a80; } .night .badge.idle { --c: #9aa5b1; }
  .badge .icon { width: 24px; height: 24px; }
  .titles { flex: 1 1 0; min-width: 0; overflow: hidden; container: cc-titles / inline-size; display: flex; flex-direction: column; align-items: flex-start; }
  .titles > * { max-width: 100%; }
  /* The status pill sits on the title line, right after the title, when the whole title and its whole label fit there;
     otherwise it goes on its own line under the statistics (then kept to one line), and when even that is too tight
     only its dot is left (the label stays in its tooltip and for screen readers). Decided by measure (see _fitPill). */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 0; }
  .trow .hst { flex: none; max-width: none; }
  .titles .stats { align-self: stretch; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .trow .name, .titles.pill-below .trow .hst { max-width: 100%; }
  .titles.pill-below .trow .hst { order: 3; margin-top: 3px; }
  .titles.pill-below .stats { max-height: 16px; }
  .titles.pill-dot .hst { padding: 5px; }
  .titles.pill-dot .hst .txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @container cc-card (max-width: 200px) { .hst { padding: 5px; } .hst .txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); } }
  .hst { position: relative; }
  /* Its colour is the header icon's. */
  .hst.ok { --c: var(--cc-accent); }
  .banner .hst { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .hst { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .night .hst.ok { --c: #8fbaff; } .night .hst.warn { --c: #ffc94d; } .night .hst.alert { --c: #ff8a80; } .night .hst.idle { --c: #9aa5b1; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* The statistics on two lines at most; the "·" that starts a line sits in the negative margin, clipped. */
  .stats { display: flex; flex-wrap: wrap; max-height: 32px; overflow: hidden; margin-left: -10px; font-size: 12px; line-height: 16px; color: var(--sky-muted); }
  /* A part longer than the line (a long language) ends with an ellipsis. */
  .stats span { white-space: nowrap; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }
  .stats span::before { content: "·"; display: inline-block; width: 10px; text-align: center; }
  /* Scene: sky details and the tunnel. */
  .scene .clouds { fill: #ffffff; opacity: .92; }
  .scene .stars { fill: #ffffff; opacity: .85; }
  .scene .tube { fill: none; stroke-width: 2; opacity: .55; }
  .scene .dots { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 0 9; animation: cc-flow 1s linear infinite; }
  .scene .dots.core { stroke: #ffffff; stroke-width: 2; }
  .scene .dots.wait { animation-duration: 2s; }
  .scene .cut { fill: none; stroke: #9aa3ae; stroke-width: 1.6; stroke-dasharray: 3 3; }
  /* ── Animations (each one a divisor of 8 s) ── */
  .scene .cloud { animation: cc-drift 4s ease-in-out infinite alternate; }
  .scene .stars .tw { animation: cc-twinkle 4s ease-in-out infinite; }
  .scene .stars .tw:nth-child(2n) { animation-delay: -2s; }
  .scene .blink { animation: cc-twinkle 2s ease-in-out infinite; }
  @keyframes cc-flow { to { stroke-dashoffset: -18; } }
  @keyframes cc-drift { from { transform: translateX(0); } to { transform: translateX(6px); } }
  @keyframes cc-packets { from { background-position: 0 50%; } to { background-position: 22px 50%; } }
  @keyframes cc-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
  @media (prefers-reduced-motion: reduce) {
    .scene *, .strip { animation: none !important; }
  }
  /* The mini card's detail button sits in the top-right corner (5 + 24 px): the scene steps left of it at full size,
     its cloud no longer under the button. The hill runs on past the scene's right edge (x 240), under the button. */
  @container (min-width: 301px) {
    .banner:has(> .zoom) .scene { right: 34px; overflow: visible; }
    .banner:has(> .zoom) .head { right: calc(var(--scene-w) + 34px); }
  }
  /* A narrow card keeps the sky and the strip for its texts: no scene. */
  @container (max-width: 300px) {
    .banner .scene { display: none; }
    .head { right: 0; }
  }

  /* ── Classic header (illustration: false) ── */
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 14px 0; }
  .header .badge { color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .header .name { color: var(--primary-text-color); }
  .header .stats { color: var(--secondary-text-color); }

  /* ── Status chips, indicators, services and buttons ── */
  .chips { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; padding: 10px 12px 0; }
  .chips .renew { margin-left: auto; font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; }
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .inds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .ind { min-width: 0; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px;
         background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .ind > div { min-width: 0; }
  .ind .lbl { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ind .val { font-size: 18px; font-weight: 500; line-height: 24px; color: var(--primary-text-color); white-space: nowrap; }
  .ind .unit { font-size: 12px; font-weight: 400; color: var(--secondary-text-color); }
  .ind.warn .val, .ind.alert .val { color: var(--c); }
  .ring { flex: none; width: 32px; height: 32px; }
  .ring circle { fill: none; stroke-width: 4; }
  .ring .track { stroke: color-mix(in srgb, var(--c) 18%, transparent); }
  .ring .arc { stroke: var(--c); stroke-linecap: round; }
  @container (max-width: 380px) { .ring { display: none; } .ind { padding: 8px; } }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  @container (max-width: 260px) { .grid, .inds { grid-template-columns: minmax(0, 1fr); } }
  /* Service tiles, the size of Home Assistant's Tile card: a healthy service stays neutral, only an issue is coloured
     (icon badge, state line and dot), the background never tinted. */
  .tile { all: unset; position: relative; box-sizing: border-box; cursor: pointer; min-width: 0; min-height: 56px;
          display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 8px; border-radius: 12px; --t: var(--cc-ok);
          background: var(--secondary-background-color, rgba(127,127,127,.08)); transition: background .2s; }
  .tile.warn { --t: var(--cc-warn); } .tile.alert { --t: var(--cc-alert); } .tile.idle { --t: var(--cc-idle); }
  .tile:hover { background: color-mix(in srgb, var(--t) 13%, var(--secondary-background-color, transparent)); }
  .tile .ic { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
              color: var(--primary-text-color); background: color-mix(in srgb, var(--cc-idle) 14%, transparent); }
  .tile .ic .icon { width: 24px; height: 24px; }
  .tile.warn .ic, .tile.alert .ic { color: var(--t); background: color-mix(in srgb, var(--t) 16%, transparent); }
  .tile .tdot { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; background: var(--t);
                box-shadow: 0 0 0 2px var(--secondary-background-color, #f1f1f1); }
  .tile .txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tile .tname { font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .tstate { font-size: 12px; line-height: 1.25; color: var(--secondary-text-color); overflow-wrap: break-word; }
  .tile.warn .tstate, .tile.alert .tstate { color: var(--t); }
  /* Buttons: tinted, never filled. */
  .actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .btn { all: unset; box-sizing: border-box; cursor: pointer; max-width: 100%; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;
         line-height: 1.25; text-align: center; color: var(--primary-text-color); background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .btn:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, var(--secondary-background-color, transparent)); }
  .btn.tint { color: color-mix(in srgb, var(--cc-primary) 70%, var(--primary-text-color)); background: color-mix(in srgb, var(--cc-primary) 16%, transparent); }
  .btn.tint:hover { background: color-mix(in srgb, var(--cc-primary) 24%, transparent); }
  .btn[aria-disabled="true"] { cursor: default; opacity: .6; }
  .msg { padding: 14px 16px 16px; font-size: 13px; line-height: 1.45; color: var(--secondary-text-color); }
  .msg .btn { margin-top: 10px; }

  /* ── Detail popup, at the top of the card ── */
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 10px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #fff); color: var(--primary-text-color); width: min(94%, 380px); max-height: calc(100% - 20px);
           overflow: auto; box-sizing: border-box; border-radius: 14px; padding: 14px; box-shadow: 0 8px 30px rgba(0,0,0,.35);
           display: flex; flex-direction: column; gap: 10px; }
  .mhead { display: flex; align-items: center; gap: 10px; }
  .mhead .badge { width: 36px; height: 36px; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .mhead .badge .icon { width: 20px; height: 20px; }
  .mhead h3 { flex: 1 1 auto; min-width: 0; margin: 0; font-size: 16px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .close { all: unset; flex: none; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
           color: var(--secondary-text-color); box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); }
  .close:hover { color: var(--primary-text-color); background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent); }
  .close .icon { width: 16px; height: 16px; }
  .facts { display: grid; grid-template-columns: fit-content(42%) minmax(0, 1fr); gap: 5px 12px; margin: 0; font-size: 13px; }
  .facts dt { color: var(--secondary-text-color); }
  .facts dd { margin: 0; overflow-wrap: anywhere; }
  .modal .actions { margin-top: 0; }
`;

// The mini card: badge, title and status, then the chips; its detail button unfolds the full card.
export const MINI_STYLE = `
  ha-card.minic { padding: 12px; }
  .mini { display: flex; align-items: flex-start; gap: 10px; }
  .mini .badge { color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .mbody { flex: 1; min-width: 0; min-height: 40px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
  .mrow { display: flex; align-items: center; gap: 8px; }
  .mtitle { flex: 1 1 0; min-width: 5ch; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .st { flex: 0 1 auto; min-width: 0; font-size: 11px; font-weight: 500; color: var(--c); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rs { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-left: -4px; }
  .rs:empty { display: none; }
  /* A chip is plain (icon and text) until it needs a look: then a tinted pill. It never runs past the card. */
  .r { display: inline-flex; align-items: center; gap: 1px; padding: 0 5px 0 4px; box-sizing: border-box; min-width: 0; max-width: 100%;
       overflow: hidden; border-radius: 999px; font-size: 12px; font-weight: 500; line-height: 18px; white-space: nowrap;
       --t: var(--cc-ok); color: var(--primary-text-color); }
  .r.warn { --t: var(--cc-warn); } .r.alert { --t: var(--cc-alert); } .r.idle { --t: var(--cc-idle); }
  .r .icon { width: 13px; height: 13px; color: var(--t); margin-right: 2px; }
  .r > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .r.pill { color: var(--t); background: color-mix(in srgb, var(--t) 14%, transparent); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--cc-idle) 16%, transparent); color: var(--primary-text-color); }
  /* Banner (illustration on): the detail button in the banner's top-right corner, as on the unfolded card. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); }
  .banner .zoom.on-night { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom.on-night:hover { background: rgba(255,255,255,.22); }
  /* A narrow mini card (no scene): its texts stop before the button. */
  @container cc-card (max-width: 300px) { .banner .head { right: 34px; } }
  .mchips { padding: 8px 12px 10px; }
`;

// The unfolded mini card: the full card, with the detail button over its banner.
export const ZOOM_STYLE = `
  .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; cursor: pointer; width: 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center; color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
          backdrop-filter: blur(4px); }
  .zoom:hover { background: rgba(255,255,255,.75); }
  .zoom.on-night { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .zoom.on-night:hover { background: rgba(255,255,255,.22); }
  .zoom.plain { color: var(--secondary-text-color); background: none; box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); top: 18px; right: 12px; }
  .zoom .icon { width: 16px; height: 16px; }
  .header { position: relative; padding-right: 48px; }
  /* A narrow card (no scene): the banner's texts stop before the button. */
  @container cc-card (max-width: 300px) { .banner .head { right: 34px; } }
`;
