/** This file must be .cjs if used within a project where package.json#type === 'module' */

/** @type {import('prettier').Options} */
module.exports = {
  printWidth: 120,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
};
