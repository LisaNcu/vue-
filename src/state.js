import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher from './observe/watcher'

export function initState(vm) {
    const opts = vm.$options // 获取所有选项
    // if(opts.props) {
    //     initData();
    // }
    if (opts.data) {
        initData(vm)
    }

    // 初始化computed
    if (opts.computed) {
        initComputed(vm)
    }

    if(opts.watch) {
        initWatch(vm);
    }

}

function initWatch(vm) {
    let watch = vm.$options.watch;
    console.log('watch', watch)

    for (let key in watch) { // 字符串 数组 函数
        const handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }

}

function createWatcher(vm, key, handler) {
    // 字符串 函数 对象
    
    if (typeof handler === 'string') {
        handler = vm[handler];
    }
    return vm.$watch(key, handler);
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}
export function initData(vm) {
    // data函数、对象。vue3里面觉得data就是个函数
    let data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // 对数据进行劫持
    observe(data)
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}

function initComputed(vm) {debugger
    const computed = vm.$options.computed;
    console.log('computed', computed)
    // const watchers = {}
    const watchers = vm._computedWatchers = {} // 将计算属性watcher保存到vm上
    for (let key in computed) {
        let userDef = computed[key];     
        // 我们需要监控 计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get;
        // 直接new 会立即执行fn，所以加lazy标识一下，将属性和watcher对应起来
        watchers[key] = new Watcher(vm, fn, {lazy: true});
        defineComputed(vm, key, userDef);
    }
}

function defineComputed(target, key, userDef) {
    const getter = typeof userDef === "function" ? userDef : userDef.get;
    const setter = userDef.set || (() => { })

    // 可以根据实例拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    // 我们需要检测是否要执行这个getter
    return function() {
        const watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
        if (watcher.dirty) {
            // 如果是脏的，就去执行用户传入的函数
            watcher.evaluate() // 求值后dirty变为false
        }
        if(Dep.target) {
            // 计算属性出栈后，还要渲染watcher，应该让计算属性watcher里面的属性依赖也去收集上一层watcher
            watcher.depend()
        }
        return watcher.value; // 返回watcher上的
    }
}
