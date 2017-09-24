function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,
    init: function () {
        this.compile(this.$fragment);
    },
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),
            child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    compile: function (el) {
        var childNodes = el.childNodes,
            me = this;
        // 可以用ES6箭头函数 Array.from
        Array.prototype.slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;
            if (me.isElementNode(node)) {
                me.compileElement(node);
            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {
                me.compile(node);
            }
        })
    },
    compileElement: function (node) {
        var nodeAttrs = node.attributes,
            me = this;
        Array.prototype.slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name;
            // v-text
            if (me.isDirective(attrName)) {
                var dirValue = attr.value;
                var dir = attrName.substring(2); // text
                if (me.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, me.$vm, dirValue, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, dirValue);
                }
            }
        })
    },
    compileText: function (node, dirVal) {
        compileUtil.text(node, this.$vm, dirVal);
    },
    isElementNode: function (node) {
        return node.nodeType === 1;
    },
    isTextNode: function (node) {
        return node.nodeType === 3;
    },
    isDirective: function (attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective: function (dir) {
        return dir.indexOf('on') === 0;
    }
};

var compileUtil = {
    text: function (node, vm, dirVal) {
        this.bind(node, vm, dirVal, 'text')
    },
    html: function (node, vm, dirVal) {
        this.bind(node, vm, dirVal, 'html')
    },
    class: function (node, vm, dirVal) {
        this.bind(node, vm, dirVal, 'class')
    },
    bind: function (node, vm, dirVal, dir) {
        var updaterFn = updater[dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, dirVal));

        // 绑定时实例化Watcher
        new Watcher(vm, dirVal, dir, function (value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        })
    },
    model: function (node, vm, dirVal) {
        this.bind(node, vm, dirVal, 'model');
        var value = this._getVMVal(vm, dirVal);
        var me = this;
        node.addEventListener('input', function (e) {
            var newVal = e.target.value;
            if (value === newVal) {
                return;
            } else {
                me._setVMVal(vm, dirVal, newVal);
                value = newVal;
            }
        })
    },
    eventHandler: function (node, vm, dirVal, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[dirVal];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVMVal: function (vm, dirVal) {
        var val = vm;
        dirVal = dirVal.split('.');
        dirVal.forEach(function (item) {
            val = val[item]; // 触发getter
        });
        return val;
    },
    _setVMVal: function (vm, dirVal, newVal) {
        var val = vm;
        dirVal = dirVal.split('.');
        dirVal.forEach(function (item, index) {
            if (index < dirVal.length - 1) {
                val = val[item];
            } else {
                val[item] = newVal;
            }
        })
    }
};

var updater = {
    modelUpdater: function (node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    textUpdater: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },
    classUpdater: function (node, value, oldValue) {
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');
        var space = className && String(value) ? ' ' : '';
        node.className = className + space + value;
    }
};