class Util {
  opt_fn_array (name, opt_fn) {
    if ( ! opt_fn ) return [];
    if ( Array.isArray(opt_fn) ) return opt_fn;
    if ( typeof opt_fn == 'function' ) return [{ name: name, fn: opt_fn }];
    return [opt_fn];
  }
}

module.exports = { Util: Util };
