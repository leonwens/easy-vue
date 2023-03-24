import Watcher from './observe/watcher';
import { createElement, createTextNode } from './vdom';
import { patch } from './vdom/patch';

export function initLifeCycle(Vue) {
  Vue.prototype._c = function () {
    // _c('div', props, ...children)
    return createElement(this, ...arguments);
  };
  Vue.prototype._v = function () {
    // _v(text)
    return createTextNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value;
    return JSON.stringify(value);
  };
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    // 初始化和更新都走这里
    const prevVNode = vm._vnode;
    vm._vnode = vnode;
    if (prevVNode) {
      vm.$el = patch(prevVNode, vnode);
    } else {
      vm.$el = patch(el, vnode);
    }
  };
  Vue.prototype._render = function () {
    return this.$options.render.call(this);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true);
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach(handler => {
      handler.call(vm);
    });
  }
}
