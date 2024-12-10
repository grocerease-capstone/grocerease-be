import pluginJs from "@eslint/js";
import daStyle from "eslint-config-dicodingacademy";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  daStyle,
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "linebreak-style": ["off"],
      camelcase: ["off"],
      "no-trailing-spaces": ["off"],
      quotes: ["off"], // Turn off double quote enforcement
    },
  },
];
