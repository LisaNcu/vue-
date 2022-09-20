// h() c()
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key;
    if (key) {
        delete data.kye
    }
    return vnode(vm,tag, key, data, children)
}
// _v()
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// ast做的是语法层面的转化，他描述的是语法本身（可以描述js css html）
// 我们的虚拟dom是描述的dom元素，可以增加一些自定义属性（描述dom）
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        // 插槽 指令...
    }
}