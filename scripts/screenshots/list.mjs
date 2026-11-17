// Every capture the scripts render, shared with the test that flags the orphan files of screenshots/.
const twins = (name, ext) => [`${name}.${ext}`, `${name}-dark.${ext}`];

export const STILLS = ["card", "card-disconnected", "card-night", "card-detail", "card-classic", "mini-card", "mini-card-disconnected", "mini-card-zoom"];
export const GIFS = ["connected", "disconnected", "night"];
export const FILES = [...STILLS.flatMap((s) => twins(s, "png")), ...GIFS.flatMap((g) => twins(g, "gif"))];
