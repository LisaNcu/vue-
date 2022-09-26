(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // const cname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]`
  // const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  // const startTagOpen = new RegExp(`^<${qnameCapture}`);
  var ncname = '[a-zA-Z_][\\w\\-\\.]*';
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配到的分组是一个 标签名<xxxx> 开始标签
  // const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配 结束标签 </xxx>
  // const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性 color=

  var startTagClose = /^\s*(\/?)>/; // <div> <br/>
  // vue3不是正则
  // 树
  //{
  //     tag: 'div',
  //     type: 1,
  //     arrts: [{name}],
  //     children: [{}]
  // }

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; // 用来存放元素的栈

    var currentParent; // 指向栈中的最后一个

    var root; // 最终要转换成一颗语法树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 利用栈型结构来构造一棵树


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创造一个ast节点

      if (!root) {
        // 看一下是否是空树
        root = node; // 如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node; // currentParent为栈中的最后
    }

    function chars(text) {
      // 文本直接放到当前指向的节点
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop(); // 弹出最后一个，检验标签是否合法

      currentParent = stack[stack.length - 1];
    } // 不停地匹配不停删除


    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length);

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    }

    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        // 开始标签
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag); // 解析标签

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd).replace('\n', ''); // 解析本文

        if (text) {
          chars(text);
          advance(text.length);
        } //break;

      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            // qs 库
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            key = key.replace(/\s/g, '');
            value = value.replace(/\s/g, '');
            obj[key] = value;
          }); // console.log('obj', obj)

          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配表达式变量

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match; // 使用exec，且正则里面有全局匹配g，会记录位置

        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配的位置

          if (index > lastIndex) {
            tokens.push(text.slice(lastIndex, index));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(text.slice(lastIndex));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function codegen(ast) {
    var children = genChildren(ast);
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', "\n        )"); // console.log('code', code)

    return code;
  } // 对模板进行编译处理


  function compileToFunction(templete) {
    // 1、将template 转化为ast语法树
    var ast = parseHTML(templete); // console.log(ast)
    // 2、生成render函数 （render方法执行后的返回的结果就是虚拟 dom）
    // render(h) {
    //     return h('div', {id: 'app'})
    // }
    // 模板引擎的实现原理 就是 with + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // 根据代码生成render函数
    // console.log('render', render.toString())

    return render;
  }

  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        // 儿子有
        if (p) {
          // 父亲有
          return p.concat(c);
        } else {
          // 父亲没有
          return [c];
        }
      } else {
        //儿子没有
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key]; // 优先采用儿子，再采用父亲
      }
    }

    return options;
  }

  function initGlobalApi(Vue) {
    debugger;
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 将用户的选项和全局的options进行合并  
      this.options = mergeOptions(this.options, mixin); //console.log('this.options', this.options)

      return this;
    };
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 属性dep手机watcher

      this.sub = []; // 存放当前属性对应的watcher有哪些
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 不希望放重复的watcher
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.sub.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.sub.forEach(function (watcher) {
          watcher.update(); // 告诉watcher更新
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0; // 1)当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
  // 2)调用render 会取值到get上
  // 每个属性都有一个dep（属性是被观察者）， watcher就是观察者（属性变化了会通知观察者来更新）--》观察者模式

  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同的watcher new watcher，实现了局部渲染
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options; // 是一个渲染watcher

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          return vm[exprOrFn]; // vm.firstname
        };
      } else {
        this.getter = exprOrFn;
      }

      this.deps = []; // 后续实现计算属性，和一些清理工作需要用到
      // this.getter = fn; // 调用这个函数可以发生取值操作

      this.depsId = new Set();
      this.cb = cb;
      this.lazy = options.lazy;
      this.dirty = this.lazy; // 缓存值
      // this.get()

      this.vm = vm;
      this.user = options.user; // 标识是否是用户自己的

      this.value = this.lazy ? undefined : this.get(); // 有lazy不执行get
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应着多个属性 重复的属性也不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher 已经记住了dep了而且去重了，此时让dep也记住watcher
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); // 获取到用户函数的返回值，并且还要标识为脏

        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        //Dep.target = this; // 静态属性只有一份
        pushTarget(this);
        var value = this.getter.call(this.vm); //Dep.target = null; // 渲染完情况

        popTarget();
        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); // 让计算属性watcher也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        //debugger
        if (this.lazy) {
          // 如果是计算属性 依赖的值变化了，就标识计算属性是脏值了
          this.dirty = true;
        } else {
          queueWatcher(this); // 把当前的watcher暂存起来
          // this.get(); // 重新渲染
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get(); // 渲染的时候用的是最新的vm来渲染的

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false; // 防抖

  function flushSchedulerQueue() {
    //debugger
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      console.log(queue); // 不管update执行多少次，最终只执行一轮刷新操作

      if (!pending) {
        // setTimeout(flushSchedulerQueue, 0);
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    //debugger
    waiting = false;
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); // 按照顺序依次执行
  } // 没有直接使用api，而是采用优雅降级的方式
  // 内部先采用promise（ie不兼容）--> MutationObserver--> ie专享的setImmediate setTimeout


  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } // else if (MutationObserver) {
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


  function nextTick(cb) {
    //debugger
    callbacks.push(cb); // 维护nextTick中的callback方法

    if (!waiting) {
      //setTimeout(()=>{
      //  flushCallbacks(); // 最后一起刷新
      timerFunc(); //},0)

      waiting = true;
    }
  } // 需要给每一个属性增加一个dep，目的就是收集watcher

  // h() c()
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.kye;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast做的是语法层面的转化，他描述的是语法本身（可以描述js css html）
  // 我们的虚拟dom是描述的dom元素，可以增加一些自定义属性（描述dom）

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text // 插槽 指令...

    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 标签
      vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，如果后续修改属性了

      patchProps(vnode.el, data); // 更新

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVnode, vnode) {
    // 写的出渲染
    // console.log('oldVnode', oldVnode);
    // console.log('vnode',vnode)
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      var elm = oldVnode; // 获取真实元素

      var parentElm = elm.parentNode; // 拿到父元素

      var newEle = createElm(vnode); // console.log('newEle', newEle)

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
        oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      }

      console.log(oldVnode, vnode);
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // 将vnode转化为真实dom
      // console.log('update', vnode)
      var vm = this;
      var el = vm.$el;
      vm.$el = patch(el, vnode); // patch既有初始化功能，又有更新的功能
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) != 'object') return value;
      return JSON.stringify(value); // console.log(JSON.stringify(value))
    };

    Vue.prototype._render = function () {
      // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
      return this.$options.render.call(this); // 通过ast语法转移后生成的render方法
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; // 这里的el 是通过querySelector处理过的
    // 1、调用render方法产生虚拟节点 dom
    //vm._render(); // vm.$option.render() // 虚拟节点

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher
    // 2、根据虚拟dom产生真实dom
    // vm._update(vm._render())
    // 3、插入到el元素中
  } // vue核心原理 1）创造了响应式数据
  // 2)模板转换成ast虚拟书
  // 3) 将ast语法树转换成render函数
  // 4) 后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
  // render函数会去产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创造真实的dom

  function callHook(vm, hook) {
    // 调用钩子函数
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.defineProperty 只能劫持已经存在的属性。新增的删除的就触发，vue为此会但单独写一些api
      this.walk(data);
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象，对属性一次劫持
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observe;
  }();

  function defineReactive(target, key, value) {
    //闭包 属性劫持
    // debugger
    observe(value); // 递归 劫持属性

    var dep = new Dep(); // 每一个属性都有一个dep

    Object.defineProperty(target, key, {
      get: function get() {
        // 取值调用
        // console.log('取值', dep, key)
        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住这个watcher
        }

        return value;
      },
      set: function set(newValue) {
        // 修改的时候，会执行set
        // console.log('设置值')
        if (newValue === value) return;
        observe(value);
        value = newValue;
        dep.notify(); //通知组件更新
      }
    });
  }
  function observe(data) {
    // 对data对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    } // 如果一个对象被劫持过了，则不需要再被劫持，判断一个对象是否被劫持，可以增加一个实例，用实例来判断是否被劫持贵哦


    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取所有选项
    // if(opts.props) {
    //     initData();
    // }

    if (opts.data) {
      initData(vm);
    } // 初始化computed


    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch; //console.log('watch', watch)

    for (var key in watch) {
      // 字符串 数组 函数
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    // 字符串 函数 对象
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // data函数、对象。vue3里面觉得data就是个函数
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; // 对数据进行劫持

    observe(data);

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed; //console.log('computed', computed)
    // const watchers = {}

    var watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上

    for (var key in computed) {
      var userDef = computed[key]; // 我们需要监控 计算属性中get的变化

      var fn = typeof userDef === 'function' ? userDef : userDef.get; // 直接new 会立即执行fn，所以加lazy标识一下，将属性和watcher对应起来

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    typeof userDef === "function" ? userDef : userDef.get;

    var setter = userDef.set || function () {}; // 可以根据实例拿到对应的属性


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    // 我们需要检测是否要执行这个getter
    return function () {
      var watcher = this._computedWatchers[key]; // 获取到对应属性的watcher

      if (watcher.dirty) {
        // 如果是脏的，就去执行用户传入的函数
        watcher.evaluate(); // 求值后dirty变为false
      }

      if (Dep.target) {
        // 计算属性出栈后，还要渲染watcher，应该让计算属性watcher里面的属性依赖也去收集上一层watcher
        watcher.depend();
      }

      return watcher.value; // 返回watcher上的
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; // 最终调用的方法

    Vue.prototype.$watch = function (exprOrFn, cb) {
      //console.log(exprOrFn, cb)
      // firsetname的值变化了，直接执行cb函数
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // 以$开头的是vue自己的东西 $data
      var vm = this; // vm.$options = options //用户选项挂在到实例上
      // 定义的全局指令过滤器...都会挂载到实例上

      vm.$options = mergeOptions(this.constructor.options, options); //console.log('vm.$options',vm.$options)
      // 初始化状态 watch created
      //initState(vm);

      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created'); // todo 编译 虚拟dom

      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      debugger;
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        // 先进行查找有没有render函数
        var templete; // 没有render看一下是否写了templete

        if (!ops.templete && el) {
          // 没有写模板，但是写了le
          templete = el.outerHTML; // 写了templete，就用写了的templete
        } else {
          if (el) {
            templete = ops.templete;
          }
        }

        if (templete) {
          // 对模板进行编译
          var render = compileToFunction(templete);
          ops.render = render; // jsx 最终会被编译成h('xx')
        }
      }

      mountComponent(vm, el); // 组件的挂载
      //console.log('ops.render', ops.render); // 最终可以获取render方法
      // script 标签引用的vue.global.js这个编译过程是在浏览器运行对的
      // runtime是不包含模板编译的，整个编译时打包的时候通过loader来转移.vue文件的，用runtime的时候不能使用templete
    };
  } // function initState(vm) {
  //     const opts = vm.$options // 获取所有选项
  //     // if(opts.props) {
  //     //     initData();
  //     // }
  //     if(opts.data) {
  //         initData(vm)
  //     }
  // }
  // function initData(vm) {
  //     // data函数、对象。vue3里面觉得data就是个函数
  //     let data = vm.$options.data;
  //     data = typeof data === 'function' ? data.call(vm): data;
  //     debugger
  //     console.log(data)
  // }

  // export const a = 100;

  function Vue(options) {
    // options就是用户的选项
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  initLifeCycle(Vue); // vm_update vm._render

  initGlobalApi(Vue); // 全局api的实现

  initStateMixin(Vue); // 实现了nextTick $watch
  // ----------为了方便观察前后的虚拟节点--测试的--------------

  var render1 = compileToFunction("<li key=\"a\" style=\"color:red\">{{name}}</li>");
  var vm1 = new Vue({
    data: {
      name: 'zf'
    }
  });
  var preVnode = render1.call(vm1);
  var el = createElm(preVnode);
  document.body.appendChild(el); // 如果用户自己操作dom，可能会有些问题

  var render2 = compileToFunction("<li key=\"a\" style=\"color:red; background:blue\">{{name}}</li>");
  var vm2 = new Vue({
    data: {
      name: 'zs'
    }
  });
  var nextVnode = render2.call(vm2); // 不要直接替换，比较区别再替换
  // diff算法是一个平级比较的过程，父亲和父亲比对，儿子和儿子比对
  //let newEl = createElm(nextVnode);
  //el.parentNode.replaceChild(newEl,el);
  //console.log(preVnode)

  patch(preVnode, nextVnode);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
