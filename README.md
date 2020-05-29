## semver.org

Work in progress: https://semver.netlify.app/

## Translations

Translations are kept in the `/specs` directory. In order to be parsed and displayed properly, a translation needs:

* a Markdown file named with the version. For example `v2.0.0.md`.
* Optionally a `_hero.html` page. If present then the large 1.3.4 "hero" section will also be shown (see English version).

## Scripts

* `yarn build` will generate all language/version specs, styles and remaining static pages.
* `yarn clean` removes generated HTML and stylesheets
* `yarn dev` starts the development server and launches a browser

## Deployment

Changes to `master` will automatically be deployed live. Any branches will also be deployed at a "preview" URL like https://branchname--semver.netlify.app

The built site are simple static pages with a tiny sprinkling of Javascript via [StimulusJS](https://stimulusjs.org/) to hook up the language/version dropdowns. Simple!
