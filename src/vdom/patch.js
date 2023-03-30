import { isSameVNode } from '.';
function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  if (vnode.componentInstance) {
    return true;
  }
}
export function createRealElement(vdom) {
  const { tag, children, text, data } = vdom;
  if (typeof tag === 'string') {
    if (createComponent(vdom)) {
      return vdom.componentInstance.$el;
    }

    vdom.el = document.createElement(tag);
    patchProps(vdom.el, {}, data);
    children.forEach(child => {
      vdom.el.appendChild(createRealElement(child));
    });
  } else {
    vdom.el = document.createTextNode(text);
  }
  return vdom.el;
}
function patchProps(el, oldProps = {}, props = {}) {
  const oldStyles = oldProps.style || {};
  const newStyles = props.style || {};
  for (let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = '';
    }
  }
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }
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
export function patch(oldVNode, vnode) {
  if (!oldVNode) {
    // 组件的挂载
    return createRealElement(vnode);
  }
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    // 初始化
    const elm = oldVNode;
    const parentElm = elm.parentNode;
    const newEle = createRealElement(vnode);
    parentElm.insertBefore(newEle, elm.nextSibling);
    parentElm.removeChild(elm);
    return newEle;
  } else {
    // diff更新
    return patchVnode(oldVNode, vnode);
  }
}

function patchVnode(oldVNode, vnode) {
  if (!isSameVNode(oldVNode, vnode)) {
    const newEl = createRealElement(vnode);
    oldVNode.el.parentNode.replaceChild(newEl, oldVNode.el);
    return newEl;
  }
  let el = (vnode.el = oldVNode.el);
  if (!oldVNode.tag) {
    if (oldVNode.text !== vnode.text) {
      el.textContent = vnode.text;
    }
  }
  patchProps(el, oldVNode.data, vnode.data);
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    el.innerHTML = '';
  }
  return el;
}

function mountChildren(el, list) {
  for (let i = 0; i < list.length; i++) {
    el.appendChild(createRealElement(list[i]));
  }
}
function updateChildren(el, oldChildren, newChildren) {
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;
  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];
  function makeIndexByKey(children) {
    return children.reduce((acc, cur, index) => {
      acc[cur.key] = index;
      return acc;
    }, {});
  }
  let map = makeIndexByKey(oldChildren);
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
      continue;
    }
    if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
      continue;
    }
    if (isSameVNode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVNode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVNode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVNode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      const moveIndex = map[newStartVnode.key];
      if (moveIndex) {
        const moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined;
        patchVnode(moveVnode, newStartVnode);
      } else {
        el.insertBefore(createRealElement(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const newEl = createRealElement(newChildren[i]);
      const anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
      el.insertBefore(newEl, anchor);
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const childEl = oldChildren[i].el;
      el.removeChild(childEl);
    }
  }
}
