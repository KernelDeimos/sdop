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
    r.put('Registrar', 'TypeC');

    r.put('TypeA', 'TestValue', { notConverted: 'hello' });

    it('should put without errors', () => {
      r.put('Convert', 'TypeA', 'TypeB', c => {
        c.value = { converted: c.value.notConverted };
        return c;
      })
    })

    var value = null;
    it('should produce target type', () => {
      value = r.get('TypeB', 'TestValue');
      expect(value).to.exist;
    })
    it('should convert to target type', () => {
      expect(value).to.include.keys('converted');
      expect(value).not.to.include.keys('notConverted');
    })
    it('should not throw an exception on missing sources', () => {
      value = r.get('TypeC', 'TestValue');
      expect(value).not.to.exist;
    })
  });
  describe('TextTypes (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should work', () => {
      r.put('sdop.text.Markdown', 'Test', 'Hello there');
      var result = r.get('sdop.text.Markdown', 'Test');
      console.log(result);
      expect(result.text).to.eql('Hello there');
    });
  });

  describe('Reduce (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    r.put('Registrar', 'TypeA');
    r.put('Registrar', 'TypeB');
    r.put('Registrar', 'TypeC');
    r.put('Registrar', 'TypeD');

    r.put('TypeA', 'TestValue', { a: 'hello' });
    r.put('TypeB', 'TestValue', { b: 'yes' });
    r.put('TypeC', 'TestValue', { c: 'this is dog' });

    r.put('TypeA', 'AnotherTest', { a: 'hello' });

    it('should put without errors', () => {
      r.put('Reduce', ['TypeA','TypeB','TypeC'], 'TypeD', c => {
        c.value = `${c.value[0].a}, ${c.value[1].b}; ${c.value[2].c}.`;
        return c;
      })
    })
    var value = null;
    it('should produce target type', () => {
      value = r.get('TypeD', 'TestValue');
      expect(value).to.exist;
    })
    it('should convert to target type', () => {
      expect(value).to.eql('hello, yes; this is dog.');
    })
    it('should not throw an exception on missing sources', () => {
      value = r.get('TypeD', 'AnotherTest');
      expect(value).not.to.exist;
    })
  })
});
