/** This file must be .cjs if used within a project where package.json#type === 'module' */

/** @type {import('prettier').Options} */
module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
};
