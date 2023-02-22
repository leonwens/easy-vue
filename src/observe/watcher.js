import Dep from './dep';
let id = 0;
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options;
    this.getter = fn;
    this.deps = [];
    this.depsId = new Set();
    this.get();
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  get() {
    Dep.target = this;
    this.getter();
    Dep.target = null;
  }
  run() {
    this.get();
  }
  update() {
    queueWatcher(this);
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
