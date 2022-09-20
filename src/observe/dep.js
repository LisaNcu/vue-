let id = 0;
class Dep {
    constructor() {

        this.id = id++; // 属性dep手机watcher
        this.sub = []; // 存放当前属性对应的watcher有哪些


    }
    depend() {
        // 不希望放重复的watcher
        // this.subs.push(Dep.target)

        Dep.target.addDep(this);
    }
    addSub(watcher) {
        this.sub.push(watcher)
    }
    notify() {
        this.sub.forEach(watcher => {
            watcher.update(); // 告诉watcher更新
        });
    }
}
Dep.target = null;

let stack = [];
export function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}

export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}


export default Dep;