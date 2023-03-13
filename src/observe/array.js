const methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
let nativeArrayProto = Array.prototype;
export const newArrayProto = Object.create(nativeArrayProto);
methods.forEach(method => {
  newArrayProto[method] = function (...args) {
    const res = nativeArrayProto[method].call(this, ...args);
    let inserted;
    let ob = this.__ob__;
    if (method === 'push' || method === 'unshift') {
      inserted = args;
    } else if (method === 'splice') {
      inserted = args.slice(2);
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    ob.dep.notify();
    return res;
  };
});
