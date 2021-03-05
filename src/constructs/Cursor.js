const { dedent, ipdent } = require('chindent');

class Cursor {
  constructor () {
    this.buffer = '';
    this.indentLevel = 0;
    this.indentChars = '  ';
  }
  get indent () {
    return this.indentChars.repeat(this.indentLevel);
  }
  incr () {
    this.indentLevel++;
  }
  decr () {
    this.indentLevel--;
  }
  writeLine (line) {
    this.buffer += `${this.indent}${line}\n`;
  }
  writeBlock (block) {
    console.log('block', '|'+block+'|', dedent(block+'\n'));
    this.buffer += ipdent(dedent(block), this.indent);
    console.log('buffer', '|'+this.buffer+'|');
  }
  write (str) {
    this.buffer += str;
  }
}

module.exports = { Cursor: Cursor };
