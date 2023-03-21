import { initGlobalAPI } from './globalAPI';
import { initMixin } from './init';
import { initLifeCycle } from './lifecycle';
import Watcher, { nextTick } from './observe/watcher';

function Vue(options) {
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;
initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);

Vue.prototype.$watch = function (expOrFn, fn) {
  new Watcher(this, expOrFn, { user: true }, fn);
};
export default Vue;
