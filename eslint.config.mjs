import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    "ignores": [
      "dist/*",
      "spec/*"
    ]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
          ...globals.browser,
          L: "readonly",
          sinon: "readonly",
          expect: "readonly",
          it: "readonly",
          describe: "readonly",
          noSpecs: "readonly",
          afterEach: "readonly",
          beforeEach: "readonly",
          xit: "readonly",
      }
    }
  },
  pluginJs.configs.recommended,
];