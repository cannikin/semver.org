// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://semver.org

const path = require("path");
const fs = require("fs");
const marked = require("marked");

const ROOT_DIR = path.join(__dirname, "..");
const SPEC_DIR = path.join(ROOT_DIR, "specs");
const HTML_DIR = path.join(ROOT_DIR, "code", "html");
const HERO_FILENAME = "_hero.html";
const SPEC_TEMPLATE = fs.readFileSync(path.join(HTML_DIR, "_spec.template")).toString();
const NAV_TEMPLATE = fs.readFileSync(path.join(HTML_DIR, "_nav.template")).toString();

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const generateSpecs = () => {
  let generatedSpecs = {};

  fs.readdirSync(SPEC_DIR).forEach(locale => {
    if (locale.match(/\.DS_Store/)) {
      return;
    }

    if (process.env.LOCALES && process.env.LOCALES.indexOf(locale) === -1) {
      return;
    }

    console.info(`Working on ${locale} locale...`);
    console.group();
    // make directory for this locale
    fs.mkdirSync(path.join(HTML_DIR, locale), { recursive: true });
    generatedSpecs[locale] = [];

    // copy the hero over if it exists
    let heroHtml = null;
    try {
      heroHtml = fs.readFileSync(path.join(SPEC_DIR, locale, HERO_FILENAME)).toString();
      if (heroHtml) {
        fs.writeFileSync(path.join(HTML_DIR, locale, HERO_FILENAME), heroHtml);
        console.info("Copied _hero.html");
      }
    } catch (e) {
      console.info("No _hero.html found, skipping");
    }

    // turn each spec into HTML and copy to output dir
    let localePath = path.join(SPEC_DIR, locale);
    if (locale.match(/\.DS_Store/)) {
      return;
    }

    fs.readdirSync(localePath).forEach(specFilename => {
      if (specFilename.match(/\.md$/)) {
        let specPath = path.join(SPEC_DIR, locale, specFilename);
        let outputDir = path.join(HTML_DIR, locale);
        let outputFilename = path.join(outputDir, specFilename.replace(/\.md/, ".html"));
        let specRaw = fs.readFileSync(specPath).toString();
        specRaw = specRaw.replace(/^---.*?---/s, "");
        let specHtml = marked(specRaw);
        let outputHtml = SPEC_TEMPLATE.replace(/\{\{\s*spec\s*\}\}/, specHtml);

        if (heroHtml) {
          outputHtml = outputHtml.replace(/\{\{\s*hero\s*\}\}/, `@@include('${locale}/hero.html')`);
        } else {
          outputHtml = outputHtml.replace(/\{\{\s*hero\s*\}\}/, "");
        }
        fs.writeFileSync(outputFilename, outputHtml);
        console.log(`Saved ${outputFilename}`);

        generatedSpecs[locale].push(specFilename.replace(/\.md/, ""));
      }
    });
    console.groupEnd();
  });

  return generatedSpecs;
};

const generateNav = specs => {
  console.log(specs);
  return true;
};

const specs = generateSpecs();
generateNav(specs);
