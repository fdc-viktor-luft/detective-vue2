'use strict';

const compiler = require('@vue/compiler-sfc');
const detectiveTypeScript = require('detective-typescript');
const detectiveEs6 = require('detective-es6');
const detectiveScss = require('detective-scss');
const detectiveStylus = require('detective-stylus');
const detectiveSass = require('detective-sass');

/**
 * Extracts the dependencies of the supplied Vue module
 */
module.exports = function(content, options) {
  if (content === undefined) throw new Error('content not given');
  if (typeof content !== 'string') throw new Error('content is not a string');

  const result = compiler.parse(content, { sourceMap: false });
  const { styles, script, scriptSetup } = result.descriptor;
  const usedScript = script || scriptSetup;

  const dependencies = [];

  if (usedScript?.content) {
    if (usedScript.attrs?.lang === 'ts') {
      dependencies.push(...detectiveTypeScript(usedScript.content, options));
    } else {
      dependencies.push(...detectiveEs6(usedScript.content, options));
    }
  }

  if (!styles) return dependencies;

  for (const style of styles) {
    switch (style.attrs.lang) {
      case 'scss': {
        dependencies.push(...detectiveScss(style.content));

        break;
      }

      case 'stylus': {
        dependencies.push(...detectiveStylus(style.content));

        break;
      }

      case 'sass': {
        dependencies.push(...detectiveSass(style.content));

        break;
      }

      default:
        // css has no deps
    }
  }

  return dependencies;
};
