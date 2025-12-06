import { readFile } from "fs/promises";
import { DEFAULT_SCHEMA, load, Type } from "js-yaml";
import path from "path";
import tinycolor from "tinycolor2";

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

/**
 * Soft variant transform.
 * @type {ThemeTransform}
 */
// eslint-disable-next-line no-unused-vars
const transformSoft = (theme) => {
  /** @type {Theme} */
  const soft = JSON.parse(JSON.stringify(theme));
  const brightColors = [...soft.dracula.ansi, ...soft.dracula.brightOther];
  for (const key of Object.keys(soft.colors)) {
    if (brightColors.includes(soft.colors[key])) {
      soft.colors[key] = tinycolor(soft.colors[key])
        .desaturate(20)
        .toHexString();
    }
  }
  soft.tokenColors = soft.tokenColors.map((value) => {
    if (brightColors.includes(value.settings.foreground)) {
      value.settings.foreground = tinycolor(value.settings.foreground)
        .desaturate(20)
        .toHexString();
    }
    return value;
  });
  return soft;
};

export const generate = async () => {
  const yamlFile = await readFile(path.join(__dirname, "src", "fukurou.yaml"));

  /** @type {Theme} */
  const base = load(yamlFile, { schema });

  for (const key of Object.keys(base.colors)) {
    if (!base.colors[key]) {
      delete base.colors[key];
    }
  }

  return { base };
};
