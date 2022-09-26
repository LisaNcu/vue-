// export const a = 100;
// export default {a:1}
import { compileToFunction } from './compiler'
import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'
import { initStateMixin } from './state'
import { createElm, patch } from './vdom/patch'
// 将所有的方法耦合在一起
function Vue(options) { // options就是用户的选项
    this._init(options)
}

initMixin(Vue) // 扩展了init方法
initLifeCycle(Vue) // vm_update vm._render
initGlobalApi(Vue) // 全局api的实现
initStateMixin(Vue); // 实现了nextTick $watch

// ----------为了方便观察前后的虚拟节点--测试的--------------

let render1 = compileToFunction(`<li key="a" style="color:red">{{name}}</li>`)
let vm1 = new Vue({data: {name: 'zf'}})
let preVnode = render1.call(vm1)

let el = createElm(preVnode);

document.body.appendChild(el);

// 如果用户自己操作dom，可能会有些问题
let render2 = compileToFunction(`<li key="a" style="color:red; background:blue">{{name}}</li>`)
let vm2 = new Vue({data: {name: 'zs'}})
let nextVnode = render2.call(vm2)

// 不要直接替换，比较区别再替换
// diff算法是一个平级比较的过程，父亲和父亲比对，儿子和儿子比对
//let newEl = createElm(nextVnode);
//el.parentNode.replaceChild(newEl,el);

//console.log(preVnode)

patch(preVnode, nextVnode)



export default Vue