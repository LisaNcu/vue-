import { isSameVnode } from ".";

export function createElm(vnode) {
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
export function patchProps(el, props) {
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

export function patch(oldVnode, vnode) {
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
        // 1、两个节点不是同一个节点，直接删除老的，换上新的
        // 2、两个节点是同一个节点（判断节点的tag和节点的key）比较两个节点的属性是否有差异（复用老的节点）
        // 3、节点比较完毕后就需要比较两人的儿子
        
        if (!isSameVnode(oldVnode, vnode)) {
            // 用老节点的父亲 进行替换
            oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        console.log(oldVnode, vnode);
    }
}