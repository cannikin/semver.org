// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://semver.org

const path = require("path");
const fs = require("fs");
const marked = require("marked");

const ROOT_DIR = path.join(__dirname, "..");
const SPEC_DIR = path.join(ROOT_DIR, "specs");
const HTML_DIR = path.join(ROOT_DIR, "code", "html");
const HERO_FILENAME = "_hero.html";
const LOCALE_FILENAME = "_locale.md";
const SPEC_TEMPLATE_PATH = path.join(HTML_DIR, "_spec.template");
const NAV_TEMPLATE_PATH = path.join(HTML_DIR, "_nav.template");

class SpecToHtml {
  constructor() {
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
    try {
      const heroHtml = fs.readFileSync(path.join(SPEC_DIR, locale, HERO_FILENAME)).toString();
      fs.writeFileSync(path.join(HTML_DIR, locale, HERO_FILENAME), heroHtml);
      console.info("Copied _hero.html");
      return true;
    } catch (e) {
      console.info("No _hero.html found, skipping");
      return false;
    }
  }

  // converts markdown spec to HTML, copies to build directory
  createSpec(locale, specFilename, specTemplate, hasHero) {
    if (specFilename.match(/\.md$/) && !specFilename.match(/^_/)) {
      let specPath = path.join(SPEC_DIR, locale, specFilename);
      let outputDir = path.join(HTML_DIR, locale);
      let outputFilename = path.join(outputDir, specFilename.replace(/\.md/, ".html"));
      let specRaw = fs.readFileSync(specPath).toString();
      // replace markdown frontmatter
      specRaw = specRaw.replace(/^---.*?---/s, "");
      let specHtml = marked(specRaw);
      let outputHtml = specTemplate.replace(/\{\{\s*spec\s*\}\}/, specHtml);
      outputHtml = outputHtml.replace(/\{\{\s*locale\s*\}\}/, locale);

      if (hasHero) {
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
    const specTemplate = fs.readFileSync(SPEC_TEMPLATE_PATH).toString();

    fs.readdirSync(SPEC_DIR).forEach(locale => {
      if (!this.shouldGenerate(locale)) return;

      console.info(`\nWorking on ${locale} locale...`);
      console.group();

      // make directory for this locale
      fs.mkdirSync(path.join(HTML_DIR, locale), { recursive: true });

      const hasHero = this.createHero(locale);

      // create placeholder for which versions were created for this locale
      this.generatedSpecs[locale] = [];

      // turn each spec into HTML and copy to output dir
      fs.readdirSync(path.join(SPEC_DIR, locale)).forEach(specFilename => {
        this.createSpec(locale, specFilename, specTemplate, hasHero);
      });
      console.groupEnd();
    });
    return true;
  }

  generateNav() {
    console.log("generateNav", this.generatedSpecs);

    console.log("Generating navigation elements...");
    console.group();

    // languages
    const locationsList = [];
    for (let locale in this.generatedSpecs) {
      const versions = this.generatedSpecs[locale];
      const translation = fs
        .readFileSync(path.join(SPEC_DIR, locale, LOCALE_FILENAME))
        .toString()
        .trim();
      locationsList.push(
        `<li data-target="application.language" data-language="${locale}"><a href="/${locale}/${versions[versions.length - 1]}.html">${translation}</a></li>`
      );
    }

    // versions
    for (let locale in this.generatedSpecs) {
      let navTemplate = fs.readFileSync(NAV_TEMPLATE_PATH).toString();
      const navOutputPath = path.join(HTML_DIR, locale, "_nav.html");
      const versions = this.generatedSpecs[locale];
      const versionsList = [];

      versions.reverse().forEach(version => {
        versionsList.push(`<li data-target="application.version" data-version="${version}"><a href="/${locale}/${version}.html">${version}</a></li>`);
      });

      navTemplate = navTemplate
        .replace(/\{\{\s+versions\s+\}\}/, versionsList.join("\n"))
        .replace(/\{\{\s+languages\s+\}\}/, locationsList.join("\n"));

      fs.writeFileSync(navOutputPath, navTemplate);
      console.log(`Saved ${navOutputPath}`);
    }

    console.groupEnd();
  }
}

const generator = new SpecToHtml();
generator.start();
