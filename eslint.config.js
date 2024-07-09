import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

export default [
	{
		ignores: [
			"dist/**",
			"node_modules/**",
			".serverless",
			".github",
			".gitignore",
			".idea",
			".nvmrc",
			".env",
			".prettierignore",
			".out"
		]
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			globals: { ...globals.node, ...globals.es2021 },
			sourceType: "module",
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.jest.json"
			}
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
			prettier: prettierPlugin
		},
		rules: {
			"@typescript-eslint/no-floating-promises": "error",
			...typescriptPlugin.configs.recommended.rules,
			...prettierPlugin.configs.recommended.rules
		}
	},
	{
		files: ["**/*.js"],
		languageOptions: {
			globals: { ...globals.node, ...globals.es2021 },
			sourceType: "module"
		},
		plugins: {
			prettier: prettierPlugin
		},
		rules: {
			...prettierPlugin.configs.recommended.rules
		}
	}
];
