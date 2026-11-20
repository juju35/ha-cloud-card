// Test loader: evaluates the card source (a plain script, as shipped in dist/) in an isolated context
// with minimal browser stubs, and returns the requested top-level bindings. The bundle is unchanged.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export const load = (names) => {
  const src = readFileSync(new URL("../src/cloud-card.js", import.meta.url), "utf8");
  class HTMLElement {
    attachShadow() {
      // Listeners kept by type, so tests can dispatch events to them; no DOM (the render is read as HTML).
      this.shadowRoot = {
        listeners: {},
        childNodes: [],
        addEventListener(type, fn) {
          (this.listeners[type] ??= []).push(fn);
        },
        querySelector: () => null,
      };
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ??= []).push(ev);
    }
    appendChild() {}
  }
  const registry = new Map();
  const docListeners = {};
  const context = {
    HTMLElement,
    customElements: { get: (n) => registry.get(n), define: (n, c) => registry.set(n, c) },
    window: {
      opened: [],
      addEventListener(type, fn) {
        this[`on_${type}`] = fn;
      },
      removeEventListener(type, fn) {
        if (this[`on_${type}`] === fn) delete this[`on_${type}`];
      },
      dispatchEvent() {},
      open(...args) {
        this.opened.push(args);
      },
    },
    history: { pushState() {} },
    // The document's capture listeners by type, so tests can tap outside a card.
    document: {
      listeners: docListeners,
      visibilityState: "visible",
      addEventListener(type, fn) {
        (docListeners[type] ??= new Set()).add(fn);
      },
      removeEventListener(type, fn) {
        docListeners[type]?.delete(fn);
      },
      createElement: (tag) => ({ tag, content: { childNodes: [] }, addEventListener() {}, appendChild() {} }),
    },
    console: { info() {}, error() {}, log() {}, warn() {} },
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    setInterval: () => 0,
    clearInterval() {},
    setTimeout,
    clearTimeout,
    Promise,
    Intl,
    Date,
  };
  vm.createContext(context);
  // The file name lets `node --test --experimental-test-coverage` report the card source itself, not only the tests.
  return vm.runInContext(`${src}\n;({ ${names.join(", ")} })`, context, { filename: new URL("../src/cloud-card.js", import.meta.url).pathname });
};
