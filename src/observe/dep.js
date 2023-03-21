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
let stack = [];
export function pushStack(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}
export function popStack() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
