// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://semver.org

const path = require("path");
const fs = require("fs");
const marked = require("marked");

const ROOT_DIR = path.join(__dirname, "..");
const SPEC_DIR = path.join(ROOT_DIR, "specs");
const HTML_DIR = path.join(ROOT_DIR, "code", "html");
const HERO_FILENAME = "_hero.html";
const SPEC_TEMPLATE_PATH = path.join(HTML_DIR, "_spec.template");
const NAV_TEMPLATE_PATH = path.join(HTML_DIR, "_nav.template");

class SpecToHtml {
  constructor() {
    this.specTemplate = fs.readFileSync(SPEC_TEMPLATE_PATH).toString();
    this.navTemplate = fs.readFileSync(NAV_TEMPLATE_PATH).toString();
    this.generatedSpecs = {};
  }

  start() {
    this.generateSpecs() && this.generateNav();
  }

  // whether the given locale directory should generate specs
  shouldGenerate(locale) {
    if (locale.match(/\.DS_Store/)) return false;
    if (process.env.LOCALES && process.env.LOCALES.indexOf(locale) === -1) return false;

    return true;
  }

  // copies hero template (if present) from spec directory to build directory
  createHero(locale) {
    let heroHtml = null;

    try {
      const heroHtml = fs.readFileSync(path.join(SPEC_DIR, locale, HERO_FILENAME)).toString();
      if (heroHtml) {
        fs.writeFileSync(path.join(HTML_DIR, locale, HERO_FILENAME), heroHtml);
        console.info("Copied _hero.html");
        return true;
      }
    } catch (e) {
      console.info("No _hero.html found, skipping");
      return false;
    }
  }

  // converts markdown spec to HTML, copies to build directory
  createSpec(locale, specFilename, options = {}) {
    if (specFilename.match(/\.md$/)) {
      let specPath = path.join(SPEC_DIR, locale, specFilename);
      let outputDir = path.join(HTML_DIR, locale);
      let outputFilename = path.join(outputDir, specFilename.replace(/\.md/, ".html"));
      let specRaw = fs.readFileSync(specPath).toString();
      // replace markdown frontmatter
      specRaw = specRaw.replace(/^---.*?---/s, "");
      let specHtml = marked(specRaw);
      let outputHtml = this.specTemplate.replace(/\{\{\s*spec\s*\}\}/, specHtml);

      if (options.hasHero) {
        outputHtml = outputHtml.replace(/\{\{\s*hero\s*\}\}/, `@@include('${locale}/hero.html')`);
      } else {
        outputHtml = outputHtml.replace(/\{\{\s*hero\s*\}\}/, "");
      }
      fs.writeFileSync(outputFilename, outputHtml);
      this.generatedSpecs[locale].push(specFilename.replace(/\.md/, ""));
      console.log(`Saved ${outputFilename}`);
    }
  }

  generateSpecs() {
    fs.readdirSync(SPEC_DIR).forEach(locale => {
      if (!this.shouldGenerate(locale)) return;

      console.info(`\nWorking on ${locale} locale...`);
      console.group();

      const hasHero = this.createHero(locale);

      // create placeholder for which versions were created for this locale
      this.generatedSpecs[locale] = [];

      // make directory for this locale
      fs.mkdirSync(path.join(HTML_DIR, locale), { recursive: true });

      // turn each spec into HTML and copy to output dir
      fs.readdirSync(path.join(SPEC_DIR, locale)).forEach(specFilename => {
        this.createSpec(locale, specFilename, { hasHero });
      });
      console.groupEnd();
    });
    return true;
  }

  generateNav() {
    return true;
  }
}

const generator = new SpecToHtml();
generator.start();
console.log(generator.generatedSpecs);
