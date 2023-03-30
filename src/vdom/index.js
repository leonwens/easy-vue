const isReservedTag = tag => {
  return ['div', 'ul', 'li', 'span', 'p', 'h1', 'h2', 'h3', 'button'].includes(tag);
};
export function createElementVNode(vm, tag, props = {}, ...children) {
  if (props === null) {
    props = {};
  }
  const key = props.key;
  if (key) {
    delete props.key;
  }
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, props, children);
  } else {
    const Ctor = vm.$options.components[tag];
    // 这里可能是sub类(全局vue.component定义的组件)，也可能是template
    return createComponentVNode(vm, tag, key, props, children, Ctor);
  }
}
function createComponentVNode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === 'object') {
    Ctor = vm.$options._base.extend(Ctor);
  }
  data.hook = {
    init(vnode) {
      const instance = (vnode.componentInstance = new vnode.componentOptions.Ctor);
      instance.$mount();
    }
  };
  return vnode(vm, tag, key, data, children, null, {
    Ctor
  });
}
export function createTextNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  };
}

export function isSameVNode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}
