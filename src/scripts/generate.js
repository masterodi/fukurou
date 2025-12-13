import { readFile } from "fs/promises";
import { DEFAULT_SCHEMA, load, Type } from "js-yaml";
import path from "path";

const __dirname = path.resolve();

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Theme - Parsed theme object.
 * @prop {Record<'base'|'ansi'|'brightOther'|'other', string[]>} fukurou - Theme color variables.
 * @prop {Record<string, string|null|undefined>} colors - VSCode color mapping.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

/**
 * @typedef {(yamlObj: Theme) => Theme} ThemeTransform
 */

const withAlphaType = new Type("!alpha", {
  kind: "sequence",
  construct: ([hexRGB, alpha]) => hexRGB + alpha,
  represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = DEFAULT_SCHEMA.extend([withAlphaType]);

export const generate = async () => {
  const yamlFile = await readFile(path.join(__dirname, "src", "fukurou.yaml"));

  /** @type {Theme} */
  const base = load(yamlFile, { schema });

  for (const key of Object.keys(base.colors)) {
    if (!base.colors[key]) {
      delete base.colors[key];
    }
  }

  const yamlFile2 = await readFile(
    path.join(__dirname, "src", "fukurou-alt.yaml")
  );

  /** @type {Theme} */
  const alt = load(yamlFile2, { schema });

  for (const key of Object.keys(alt.colors)) {
    if (!alt.colors[key]) {
      delete alt.colors[key];
    }
  }

  return { base, alt };
};
