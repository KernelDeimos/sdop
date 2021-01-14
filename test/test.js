var expect = require('chai').expect;
const { SDOP } = require('../src/index.js');

describe('SDOP', () => {
  describe('Registrar (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should register a registrar', () => {
      r.put('Registrar', 'Tester', {
        put: c => {
          c.value.testPut = true;
          return c;
        },
        get: c => {
          c.value.testGet = true;
          return c;
        },
      });

      expect(r.get('Registrar', 'Tester')).to.exist;
    });

    it('should report a previously put object', () => {
      r.put('Tester', 'Name', {
        hello: 'world',
      });
      expect(r.get('Tester', 'Name')).to.exist;
      expect(r.get('Tester', 'Name')).to.include.all.keys('hello');
    });

    it('should apply custom operations', () => {
      expect(r.get('Tester', 'Name')).to.include.all.keys('testPut', 'testGet');
    });
  });
  describe('Convert (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should be loaded', () => {
      expect(r.get('Registrar', 'Convert')).to.exist;
    });

    r.put('Registrar', 'TypeA');
    r.put('Registrar', 'TypeB');

    r.put('TypeA', 'TestValue', { notConverted: 'hello' });

    it('should put without errors', () => {
      r.put('Convert', 'TypeA', 'TypeB', c => {
        c.value = { converted: c.value.notConverted };
      })
    })

    var value;
    it('should produce target type', () => {
      value = r.get('TypeB', 'TestValue');
      expect(value).to.exist;
    })
    it('should convert to target type', () => {
      expect(value).to.include.keys('converted');
      expect(value).not.to.include.keys('notConverted');
    })
  })
});
