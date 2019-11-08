// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://semver.org

const path = require("path");
const fs = require("fs");
const marked = require("marked");

class SpecToHtml {
  constructor() {
    this.rootDir = path.join(__dirname, "..");
    this.specDir = path.join(this.rootDir, "specs");
    this.htmlDir = path.join(this.rootDir, "code", "html");
    this.heroFilename = "_hero.html";
    this.specTemplate = fs.readFileSync(path.join(this.htmlDir, "_spec.template")).toString();
    this.navTemplate = fs.readFileSync(path.join(this.htmlDir, "_nav.template")).toString();
    this.generatedSpecs = {};
  }

  start() {
    this.generateSpecs();
    this.generateNav();
  }

  createHero(locale) {
    let heroHtml = null;

    try {
      const heroHtml = fs
        .readFileSync(path.join(this.specDir, locale, this.heroFilename))
        .toString();
      if (heroHtml) {
        fs.writeFileSync(path.join(this.htmlDir, locale, this.heroFilename), heroHtml);
        console.info("Copied _hero.html");
        return true;
      }
    } catch (e) {
      console.info("No _hero.html found, skipping");
      return false;
    }
  }

  createSpec(locale, specFilename, options = {}) {
    if (specFilename.match(/\.md$/)) {
      let specPath = path.join(this.specDir, locale, specFilename);
      let outputDir = path.join(this.htmlDir, locale);
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

  shouldGenerate(locale) {
    if (locale.match(/\.DS_Store/)) return false;
    if (process.env.LOCALES && process.env.LOCALES.indexOf(locale) === -1) return false;

    return true;
  }

  generateSpecs() {
    fs.readdirSync(this.specDir).forEach(locale => {
      if (!this.shouldGenerate(locale)) return;

      console.info(`\nWorking on ${locale} locale...`);
      console.group();

      const hasHero = this.createHero(locale);

      // create placeholder for which versions were created for this locale
      this.generatedSpecs[locale] = [];

      // make directory for this locale
      fs.mkdirSync(path.join(this.htmlDir, locale), { recursive: true });

      // turn each spec into HTML and copy to output dir
      fs.readdirSync(path.join(this.specDir, locale)).forEach(specFilename => {
        this.createSpec(locale, specFilename, { hasHero });
      });
      console.groupEnd();
    });
  }

  generateNav() {
    return true;
  }
}

const generator = new SpecToHtml();
generator.start();
console.log(generator.generatedSpecs);
