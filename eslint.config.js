const {
    defineConfig,
} = require("eslint/config");

const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        "ecmaVersion": "latest",
        "sourceType": "module",
        parserOptions: {},
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    "rules": {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }
        ],
    },
}, {
    languageOptions: {
        globals: {
            ...globals.node,
        },

        "sourceType": "script",
        parserOptions: {},
    },

    files: ["**/.eslintrc.{js,cjs}"],
}]);
