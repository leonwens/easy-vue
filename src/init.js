import { compileToFunction } from './compiler';
import { mountComponent } from './lifecycle';
import { initState } from './state';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);
  };
  Vue.prototype.$mount = function (id) {
    const vm = this;
    const container = document.querySelector(id);
    const { render, template } = vm.$options;
    if (!render) {
      let _tpl = template;
      if (!template && container) {
        _tpl = container.outerHTML;
      }
      if (_tpl) {
        const _render = compileToFunction(_tpl);
        vm.$options.render = _render;
      }
    }
    mountComponent(vm, container);
  };
}
