let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存放watcher列表
  }
  depend() {
    Dep.target.addDep(this);
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}
Dep.target = null;
export default Dep;
