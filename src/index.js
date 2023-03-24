import { initGlobalAPI } from './globalAPI';
import { initMixin } from './init';
import { initLifeCycle } from './lifecycle';
import { initStateMixin } from './state';

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

export default Vue;
