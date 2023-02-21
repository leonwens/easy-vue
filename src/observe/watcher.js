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
  update() {
    // 这里目前会更新多次。后续实现异步更新策略来解决这个问题
    console.log('update');
    this.get();
  }
}
export default Watcher;
