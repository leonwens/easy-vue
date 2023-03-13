import { newArrayProto } from './array';
import Dep from './dep';

class Observer {
  constructor(data) {
    this.dep = new Dep();
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    });
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach(item => observe(item));
  }
}
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const cur = value[i];
    cur.__ob__ && cur.__ob__.dep.depend();
    if (Array.isArray(cur)) {
      dependArray(cur);
    }
  }
}
export function defineReactive(target, key, value) {
  const childOb = observe(value);
  let dep = new Dep();
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newVal) {
      if (newVal === value) return;
      observe(newVal);
      value = newVal;
      dep.notify();
    }
  });
}
export function observe(data) {
  if (typeof data !== 'object' || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  return new Observer(data);
}
