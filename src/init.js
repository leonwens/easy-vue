import { compileToFunction } from './compiler';
import { callHook, mountComponent } from './lifecycle';
import { nextTick } from './observe/watcher';
import { initState } from './state';
import { mergeOptions } from './utils';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    if (options.el) {
      vm.$mount(options.el);
    }
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
  Vue.prototype.$nextTick = nextTick;
}
