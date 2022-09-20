const strats = {};
const LIFECYCLE = [
    'beforeCreate',
    'created'
]
LIFECYCLE.forEach((hook) => {
    strats[hook] = function (p, c) {
        if (c) { // 儿子有
            if (p) { // 父亲有
                return p.concat(c)
            } else { // 父亲没有
                return [c];
            }
        } else { //儿子没有
            return p;
        }
    }
})

export function mergeOptions(parent, child) {
    const options = {}

    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key] // 有限采用儿子，再采用父亲
        }
    }
    return options
}