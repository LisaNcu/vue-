// export const a = 100;
// export default {a:1}
import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'
// 将所有的方法耦合在一起
function Vue(options) { // options就是用户的选项
    this._init(options)
}
Vue.prototype.$nextTick = nextTick
initMixin(Vue)
initLifeCycle(Vue)

initGlobalApi(Vue)

// 最终调用的方法
Vue.prototype.$watch = function(exprOrFn, cb) {
    console.log(exprOrFn, cb)
    // firsetname的值变化了，直接执行cb函数
    new Watcher(this, exprOrFn, {user:true}, cb)
}



export default Vue