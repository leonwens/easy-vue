import Watcher from './observe/watcher';
import { createElement, createTextNode } from './vdom';
function createRealElement(vdom) {
  const { tag, children, text, props } = vdom;
  if (typeof tag === 'string') {
    vdom.el = document.createElement(tag);
    patchProps(vdom.el, props);
    children.forEach(child => {
      vdom.el.appendChild(createRealElement(child));
    });
  } else {
    vdom.el = document.createTextNode(text);
  }
  return vdom.el;
}
function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let name in props.style) {
        el.style[name] = props.style[name];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
function patch(olVNode, vnode) {
  const isRealElement = olVNode.nodeType;
  if (isRealElement) {
    // 初始化
    const elm = olVNode;
    const parentElm = elm.parentNode;
    const newEle = createRealElement(vnode);
    parentElm.insertBefore(newEle, elm.nextSibling);
    parentElm.removeChild(elm);
    return newEle;
  } else {
    // 更新
  }
}
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
    const el = this.$el;
    // 初始化和更新都走这里
    this.$el = patch(el, vnode);
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
