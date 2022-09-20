import { parseHTML } from "./parse"

function genProps(attrs) {
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') {
            let obj = {};
            attr.value.split(';').forEach(item => { // qs 库
                let [key, value] = item.split(':');
                key = key.replace(/\s/g,'');
                value = value.replace(/\s/g,'')
                obj[key] = value;
            })
            // console.log('obj', obj)
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配表达式变量
function gen(node) {
    if (node.type === 1) {
        return codegen(node);
    } else {
        // 文本
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            let tokens = [];
            let match;
            // 使用exec，且正则里面有全局匹配g，会记录位置
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)) {
                let index = match.index // 匹配的位置
                if (index > lastIndex) {
                    tokens.push(text.slice(lastIndex, index))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(text.slice(lastIndex))
            }
            return `_v(${tokens.join('+')})`
        }
        
    }
}

function genChildren(el) {
    const children = el.children;
    if (children) {
        return children.map(child=>gen(child)).join(',')
    }
}

function codegen(ast) {
    let children = genChildren(ast)
    let code = (`_c('${ast.tag}', ${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
        }${ ast.children.length ? `,${children}`:''
        }
        )`)
    // console.log('code', code)
    return code
}

// 对模板进行编译处理
export function compileToFunction(templete) {
    // 1、将template 转化为ast语法树
    let ast = parseHTML(templete)
   // console.log(ast)
    // 2、生成render函数 （render方法执行后的返回的结果就是虚拟 dom）
    // render(h) {
    //     return h('div', {id: 'app'})
    // }

    // 模板引擎的实现原理 就是 with + new Function
    let code = codegen(ast);
    code = `with(this){return ${code}}`
    let render = new Function(code); // 根据代码生成render函数
    // console.log('render', render.toString())
    return render;
}