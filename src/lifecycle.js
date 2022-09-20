import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom"

function createElm(vnode) {
    let {tag , data, children, text } = vnode;
    if (typeof tag === 'string') { // 标签
        vnode.el = document.createElement(tag) // 这里将真实节点和虚拟节点对应起来，如果后续修改属性了
        
        patchProps(vnode.el, data) // 更新

        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        });
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
function patchProps(el, props) {
    for (let key in props) {
        if(key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

function patch(oldVnode, vnode) {
    // 写的出渲染
    // console.log('oldVnode', oldVnode);
    // console.log('vnode',vnode)
    const isRealElement = oldVnode.nodeType;
    if (isRealElement) {
        const elm = oldVnode; // 获取真实元素
        const parentElm = elm.parentNode; // 拿到父元素
        let newEle = createElm(vnode);
        // console.log('newEle', newEle)
        parentElm.insertBefore(newEle, elm.nextSibling);
        parentElm.removeChild(elm);
        return newEle;
    } else {
        // diff 算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function(vnode) { // 将vnode转化为真实dom
        // console.log('update', vnode)
        const vm = this;
        const el = vm.$el;
        vm.$el = patch(el, vnode); // patch既有初始化功能，又有更新的功能

    }
    Vue.prototype._c = function() {
       return createElementVNode(this, ...arguments)
    }
    Vue.prototype._v = function() {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function(value) {
        if (typeof value != 'object') return value;
        return JSON.stringify(value);
        // console.log(JSON.stringify(value))
    }
    Vue.prototype._render = function() {
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
        return this.$options.render.call(this); // 通过ast语法转移后生成的render方法

    }
}

export function mountComponent(vm, el) {
    vm.$el = el;// 这里的el 是通过querySelector处理过的
    // 1、调用render方法产生虚拟节点 dom

    //vm._render(); // vm.$option.render() // 虚拟节点

    const updateComponent = ()=> {
        vm._update(vm._render())
    }
    new Watcher(vm, updateComponent, true) // true用于标识是一个渲染watcher
    // 2、根据虚拟dom产生真实dom
    // vm._update(vm._render())
    // 3、插入到el元素中
}

// vue核心原理 1）创造了响应式数据
// 2)模板转换成ast虚拟书
// 3) 将ast语法树转换成render函数
// 4) 后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）

// render函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实的dom


export function callHook(vm, hook) { // 调用钩子函数
    const handlers = vm.$options[hook];
    if (handlers) {
        handlers.forEach(handler => handler.call(vm))
    }
}