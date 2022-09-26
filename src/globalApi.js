import { mergeOptions } from "./utils";

export function initGlobalApi(Vue) {debugger
    Vue.options = {}
    Vue.mixin = function (mixin) {
        // 将用户的选项和全局的options进行合并  
        this.options = mergeOptions(this.options, mixin);
        //console.log('this.options', this.options)
        return this;
    }
}