// ES module: package.json has "type": "module", where a CommonJS `module.exports` fails to load.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "header-max-length": [2, "always", 72],
  },
};
