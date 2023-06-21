const generate = require('videojs-generate-rollup-config');

const fs = require('fs');
const packageJsonContent = fs.readFileSync('package.json', 'utf8');
const packageJson = JSON.parse(packageJsonContent);
const { version, description, name, license } = packageJson;

// see https://github.com/videojs/videojs-generate-rollup-config
// for options
const options = {
  testInput: 'test/**/test.*.js',
  banner: `/*! @name ${name} @version ${version} @description ${description} @license ${license} */`
};
const config = generate(options);

// Add additonal builds/customization here!

// export the builds to rollup
export default Object.values(config.builds);
