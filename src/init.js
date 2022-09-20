import { compileToFunction } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
    Vue.prototype._init = function(options) { // 用于初始化操作
       // 以$开头的是vue自己的东西 $data
       const vm = this;
       // vm.$options = options //用户选项挂在到实例上
       // 定义的全局指令过滤器...都会挂载到实例上
       vm.$options = mergeOptions(this.constructor.options,options)
       console.log('vm.$options',vm.$options)
       // 初始化状态 watch created
       //initState(vm);
       
       callHook(vm, 'beforeCreate')

       initState(vm)

       callHook(vm, 'created')

       // todo 编译 虚拟dom
       if(options.el) {
            vm.$mount(options.el) // 实现数据的挂载
       }
    }
    Vue.prototype.$mount = function(el) {debugger
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        if(!ops.render) { // 先进行查找有没有render函数
            let templete;// 没有render看一下是否写了templete
            if (!ops.templete && el) { // 没有写模板，但是写了le
                templete = el.outerHTML // 写了templete，就用写了的templete
            } else {
                if(el) {
                    templete = ops.templete
                }
            }
            if (templete) { // 对模板进行编译
                const render = compileToFunction(templete);
                ops.render = render; // jsx 最终会被编译成h('xx')
            }
        }

        mountComponent(vm, el); // 组件的挂载

        console.log('ops.render', ops.render); // 最终可以获取render方法



        // script 标签引用的vue.global.js这个编译过程是在浏览器运行对的
        // runtime是不包含模板编译的，整个编译时打包的时候通过loader来转移.vue文件的，用runtime的时候不能使用templete
    }
}
// function initState(vm) {
//     const opts = vm.$options // 获取所有选项
//     // if(opts.props) {
//     //     initData();
//     // }
//     if(opts.data) {
//         initData(vm)
//     }

// }
// function initData(vm) {
//     // data函数、对象。vue3里面觉得data就是个函数
//     let data = vm.$options.data;
//     data = typeof data === 'function' ? data.call(vm): data;
//     debugger
//     console.log(data)
// }