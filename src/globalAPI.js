import { mergeOptions } from './utils';

export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue,
    components: {}
  };
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
  Vue.extend = function (options) {
    function Sub(opts = {}) {
      this._init(opts);
    }
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    Sub.options = mergeOptions(Vue.options, options);
    return Sub;
  };
  Vue.component = function (id, definition) {
    definition = typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  };
}
