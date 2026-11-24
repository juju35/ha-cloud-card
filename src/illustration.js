// ---------------------------------------------------------------------------
// The illustration: sky, a house linked to the cloud, linked to a phone
// ---------------------------------------------------------------------------
import { esc } from "./helpers.js";

// Every animation of the illustration lasts a divisor of 8 s, so a recording of 8 s loops. The scene is drawn in a
// 200 × 80 box whose bottom edge stands on the strip; only its right part (x 80 to 200) is shown, the sky and the
// texts take the rest of the banner.
export const STARS = [[84, 6, 0.6], [100, 22, 0.5], [118, 4, 0.6], [138, 14, 0.5], [182, 4, 0.6], [196, 30, 0.5], [92, 40, 0.4], [126, 30, 0.4]];
// The state colour of the link: green (connected), amber (connecting), red (cut off), grey (signed out).
export const LINK_COLORS = { ok: "#43a047", wait: "#f5b400", down: "#e5484d", off: "#9aa3ae" };
export const P_UP = "M118 58 Q126 30 148 24";
export const P_DOWN = "M176 24 Q190 30 190 54";
// The house (left, on the ground), the cloud with its padlock (top), the phone away (right), linked by the encrypted
// tunnel whose dots flow while connected (slower while connecting); cut off, the tunnel breaks with a red cross.
// The pill above shows the latency. uid keeps the ids apart when several cards share a page.
export const sceneSvg = (link, night, uid, pill) => {
  const n = night;
  const c = LINK_COLORS[link] ?? LINK_COLORS.off;
  const live = link === "ok" || link === "wait";
  const sky = n
    ? `<g class="stars">${STARS.map(([x, y, r], i) => `<circle class="${i % 3 === 0 ? "tw" : ""}" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
       <mask id="cc-moon-${uid}"><rect x="80" width="120" height="80" fill="#fff"/><circle cx="133.4" cy="7.6" r="3.6" fill="#000"/></mask>
       <circle cx="130.5" cy="9.5" r="6.5" fill="#f3eed2" opacity=".12"/>
       <circle cx="130.5" cy="9.5" r="4" fill="#f3eed2" mask="url(#cc-moon-${uid})"/>`
    : `<g class="clouds"><path class="cloud" d="M118 11a3.6 3.6 0 0 1 .6-7.1A5 5 0 0 1 128 3.4a3.3 3.3 0 0 1-.4 7.6z"/></g>`;
  const links = live
    ? [P_UP, P_DOWN]
        .map((d) => `<path class="tube" d="${d}" stroke="${c}"/><path class="dots ${link}" d="${d}" stroke="${c}"/><path class="dots core ${link}" d="${d}"/>`)
        .join("")
    : `<path class="cut" d="${P_UP}"/><path class="cut" d="${P_DOWN}"/>${
        link === "down" ? '<g transform="translate(133 36)"><circle r="5.4" fill="#e5484d"/><path d="M-2.4 -2.4l4.8 4.8M2.4 -2.4l-4.8 4.8" stroke="#fff" stroke-width="1.5"/></g>' : ""
      }`;
  return `<svg class="scene" viewBox="80 0 120 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    ${sky}
    <path d="M80 80 C100 72 120 71 140 71.5 C160 72 180 71 200 72 H240 V80Z" fill="${n ? "#17303d" : "#86c27f"}"/>
    <g class="house" transform="translate(104 56)">
      <path d="M-4 1 L14 -12 L32 1Z" fill="${n ? "#3a2a2a" : "#c0603a"}"/>
      <rect y="0" width="28" height="24" fill="${n ? "#2a3646" : "#f3e6d3"}"/>
      <rect x="4" y="6" width="7" height="6" fill="${n ? "#ffcf6e" : "#86b9de"}"/>
      <rect x="15" y="10" width="8" height="14" fill="#8a5a3a"/>
      <rect x="18" y="-8" width="6" height="5" rx="1" fill="#2a3038"/>
      <circle class="${live ? "blink" : ""}" cx="21" cy="-5.5" r=".9" fill="${c}"/>
    </g>
    ${links}
    <g class="hub" transform="translate(162 22)">
      <path d="M-16 6a10 10 0 0 1 18-10a8 8 0 0 1 14 4a7 7 0 0 1 0 14h-30a7 7 0 0 1-2-8z" fill="${n ? "#3d475c" : "#fff"}" stroke="${c}" stroke-width="1.6"/>
      <g transform="translate(0 6)"><rect x="-4" y="-2" width="8" height="6" rx="1" fill="${c}"/><path d="M-2.6 -2v-2a2.6 2.6 0 0 1 5.2 0v2" stroke="${c}" stroke-width="1.2" fill="none"/></g>
    </g>
    <g class="phone" transform="translate(190 68)">
      <rect x="-6" y="-12" width="12" height="22" rx="2.4" fill="#22262b"/>
      <rect x="-4.6" y="-10" width="9.2" height="16" rx="1" fill="${live ? (n ? "#3d5a8a" : "#86b9de") : "#3a3f48"}"/>
      <path d="M-2 -4l2-2l2 2v4h-4z" fill="#fff" opacity="${live ? 0.9 : 0.3}"/>
    </g>
    ${
      pill
        ? `<g class="pill" transform="translate(97 16)"><rect x="-15" y="-7" width="30" height="13" rx="6.5" fill="${n ? "#2a3446" : "#fff"}" stroke="${c}"/>
      <text y="2.4" text-anchor="middle" font-size="6.4" font-weight="700" font-family="sans-serif" fill="${c}">${esc(pill)}</text></g>`
        : ""
    }
  </svg>`;
};
