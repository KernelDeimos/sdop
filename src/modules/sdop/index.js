const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  require('./target/es6/index')(c);
  require('./constructs')(c);
});
