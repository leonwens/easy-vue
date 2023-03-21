import Dep, { popStack, pushStack } from './dep';
let id = 0;
class Watcher {
  constructor(vm, expOrFn, options, cb) {
    this.id = id++;
    this.vm = vm;
    this.cb = cb;
    this.renderWatcher = options;
    if (typeof expOrFn === 'string') {
      this.getter = function () {
        return vm[expOrFn];
      };
    } else {
      this.getter = expOrFn;
    }
    this.deps = [];
    this.depsId = new Set();
    this.lazy = options.lazy;
    this.dirty = this.lazy;
    this.user = options.user;
    this.value = this.lazy ? undefined : this.get(); // 这个value专门记录计算属性对应的getter值
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  get() {
    pushStack(this);
    const value = this.getter.call(this.vm);
    popStack();
    return value;
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  run() {
    let oldVal = this.value;
    let newVal = this.get();
    if (this.user) {
      this.cb.call(this.vm, newVal, oldVal);
    }
  }
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }
}
let queue = [];
let has = {};
let pending = false;
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach(q => q.run());
}
function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pending) {
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbList = callbacks.slice(0);
  callbacks = [];
  waiting = false;
  cbList.forEach(cb => cb());
}
export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    setTimeout(() => {
      flushCallbacks();
    }, 0);
    waiting = true;
  }
}
export default Watcher;
