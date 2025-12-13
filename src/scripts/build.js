import fs from "fs";
import path from "path";
import { generate } from "./generate.js";

const __dirname = path.resolve();

const THEMES_DIR = path.join(__dirname, "themes");

if (!fs.existsSync(THEMES_DIR)) {
  fs.mkdirSync(THEMES_DIR);
}

const build = async () => {
  const { base, alt } = await generate();

  return Promise.all([
    fs.promises.writeFile(
      path.join(THEMES_DIR, "fukurou.json"),
      JSON.stringify(base, null, 4)
    ),
    fs.promises.writeFile(
      path.join(THEMES_DIR, "fukurou-alt.json"),
      JSON.stringify(alt, null, 4)
    ),
  ]);
};

build();
