// const cname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]`
// const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// const startTagOpen = new RegExp(`^<${qnameCapture}`);
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配到的分组是一个 标签名<xxxx> 开始标签
// const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配 结束标签 </xxx>
// const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性 color=
const startTagClose = /^\s*(\/?)>/; // <div> <br/>

// vue3不是正则

// 树
//{
//     tag: 'div',
//     type: 1,
//     arrts: [{name}],
//     children: [{}]
// }

export function parseHTML(html) {
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [] // 用来存放元素的栈
    let currentParent; // 指向栈中的最后一个
    let root;

    // 最终要转换成一颗语法树

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    // 利用栈型结构来构造一棵树
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs); // 创造一个ast节点
        if (!root) { // 看一下是否是空树
            root = node; // 如果为空则当前是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node);
        currentParent = node; // currentParent为栈中的最后
    }
    function chars(text) { // 文本直接放到当前指向的节点
        text = text.replace(/\s/g,'')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        let node = stack.pop(); // 弹出最后一个，检验标签是否合法
        currentParent = stack[stack.length-1]
    }
    // 不停地匹配不停删除
    function advance(n) {
        html = html.substring(n);
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: []
            }
            advance(start[0].length);

            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
            }
            if (end) {
                advance(end[0].length)
            }
            return match;
        }

        return false;
    }
    while (html) {
        let textEnd = html.indexOf('<');
        if (textEnd === 0) { // 开始标签
            const startTagMatch = parseStartTag();
            if (startTagMatch) { // 解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag); // 解析标签
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length);
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd).replace('\n', ''); // 解析本文
            if (text) {
                chars(text)
                advance(text.length);
            }
            //break;
        }
    }
    return root;
}