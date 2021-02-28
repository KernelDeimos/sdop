const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  require('./constructs')(c);
});
