import Dep from "./dep"

class Observe {
    constructor(data) {
        // Object.defineProperty 只能劫持已经存在的属性。新增的删除的就触发，vue为此会但单独写一些api
        this.walk(data)
    }
    walk(data) { // 循环对象，对属性一次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))

    }
}
export function defineReactive(target, key ,value) { //闭包 属性劫持
    debugger
   observe(value) // 递归 劫持属性
   let dep = new Dep(); // 每一个属性都有一个dep
    Object.defineProperty(target, key, {
        get() { // 取值调用
           // console.log('取值', dep, key)

            if (Dep.target) {
                dep.depend(); // 让这个属性的收集器记住这个watcher
            }

            return value
        },
        set(newValue) { // 修改的时候，会执行set
            // console.log('设置值')
            if(newValue === value) return
            observe(value)
            value = newValue;
            dep.notify();//通知组件更新
        }
    })
}
export function observe(data) {
    // 对data对象进行劫持
    if (typeof data !== 'object' || data == null) {
        return;
    }

    // 如果一个对象被劫持过了，则不需要再被劫持，判断一个对象是否被劫持，可以增加一个实例，用实例来判断是否被劫持贵哦
    return new Observe(data)
}