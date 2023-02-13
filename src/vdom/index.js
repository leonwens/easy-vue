export function createElement(vm, tag, props = {}, ...children) {
  if (props === null) {
    props = {};
  }
  const key = props.key;
  if (key) {
    delete props.key;
  }
  return vnode(vm, tag, key, props, children);
}
export function createTextNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
function vnode(vm, tag, key, props, children, text) {
  return {
    vm,
    tag,
    key,
    props,
    children,
    text
  };
}
