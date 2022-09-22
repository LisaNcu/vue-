import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// 1)当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
// 2)调用render 会取值到get上
// 每个属性都有一个dep（属性是被观察者）， watcher就是观察者（属性变化了会通知观察者来更新）--》观察者模式
class Watcher { // 不同组件有不同的watcher new watcher，实现了局部渲染
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher

        if (typeof exprOrFn === 'string') {
            this.getter = function () {
                return vm[exprOrFn] // vm.firstname
            }
        } else {
            this.getter = exprOrFn
        }

        this.deps = []; // 后续实现计算属性，和一些清理工作需要用到
        // this.getter = fn; // 调用这个函数可以发生取值操作
        this.depsId = new Set();
        this.cb = cb;
        this.lazy = options.lazy;
        this.dirty = this.lazy; // 缓存值
       
        // this.get()
        this.vm = vm;
        this.user = options.user // 标识是否是用户自己的
        
        this.value =  this.lazy ? undefined : this.get(); // 有lazy不执行get
    }
    addDep(dep) { // 一个组件对应着多个属性 重复的属性也不用记录
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher 已经记住了dep了而且去重了，此时让dep也记住watcher
        }
    }
    evaluate() {
        this.value = this.get(); // 获取到用户函数的返回值，并且还要标识为脏
        this.dirty = false;
    }
    get() {
        //Dep.target = this; // 静态属性只有一份
        pushTarget(this);
        let value = this.getter.call(this.vm);
        //Dep.target = null; // 渲染完情况
        popTarget()
        return value;
    }
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend() // 让计算属性watcher也收集渲染watcher
        }
    }
    update() {
        debugger
        if (this.lazy) {
            // 如果是计算属性 依赖的值变化了，就标识计算属性是脏值了
            this.dirty = true
        } else {
            queueWatcher(this); // 把当前的watcher暂存起来
            // this.get(); // 重新渲染
        }
    }

    run() {
        let oldValue = this.value;
        let newValue = this.get(); // 渲染的时候用的是最新的vm来渲染的

        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue)
        }
    }
}
let queue = [];
let has = {};
let pending = false; // 防抖

function flushSchedulerQueue() {
    debugger
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
        console.log(queue)
        // 不管update执行多少次，最终只执行一轮刷新操作

        if (!pending) {
            // setTimeout(flushSchedulerQueue, 0);
            nextTick(flushSchedulerQueue, 0);
            pending = true;
        }
    }
}


let callbacks = [];
let waiting = false;
function flushCallbacks() {
    debugger
    waiting = false;
    let cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(cb => cb()); // 按照顺序依次执行
}
// 没有直接使用api，而是采用优雅降级的方式
// 内部先采用promise（ie不兼容）--> MutationObserver--> ie专享的setImmediate setTimeout

let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
}
// else if (MutationObserver) {
//     let observe = new MutationObserver(flushCallbacks)
//     let textnode = document.createTextNode(1);
//     observe.observe(textnode, {
//         characterData:true
//     })
//     timerFunc = () => {
//         textnode.textContent = 2;
//     }
// } else if (setImmediate) {
//     timerFunc = () => {
//         setImmediate(flushCallbacks)
//     }
// } else {
//     timerFunc = () => {
//         setTimeout(flushCallbacks)
//     }
// }
export function nextTick(cb) {
    debugger
    callbacks.push(cb); // 维护nextTick中的callback方法
    if (!waiting) {
        //setTimeout(()=>{
        //  flushCallbacks(); // 最后一起刷新
        timerFunc()
        //},0)
        waiting = true;
    }
}



// 需要给每一个属性增加一个dep，目的就是收集watcher
// 一个视图中 有多少个属性（n个属性对应一个视图，n个dep对应一个watcher）
// 一个属性对应多个视图
// 多对多的关系
export default Watcher