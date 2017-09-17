var uid = 0;

function Dep() {
    this.subs = [];
    this.id = uid++;
    console.log('uid', uid)
}
Dep.prototype = {
    construct: Dep,
    addSub: function (sub) {
        this.subs.push(sub);
    },
    depend: function () {
        Dep.target.addDep(this); // Dep.target指向Watcher实例
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        })
    }
};
Dep.target = null;


/**
 * 数据监听,作为发布者,当数据变化时,通知订阅者
 */
function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    return new Observer(data);
}

function Observer (data) {
    this.data = data;
    this.walk(data)
}

Observer.prototype = {
    construct: Observer,
    walk: function(data) {
       Object.keys(data).forEach((key) => {
           this.convert(key, data[key]);
       }) 
    },
    convert: function(key,val) {
        this.defineReactive(this.data, key, val);
    },
    defineReactive: function(data, key, val) {
        var dep = new Dep();
        var childObj = observe(val);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: function(newVal) {
                if (newVal === val) return;
                val = newVal;
                childObj = observe(val);
                dep.notify();
            }
        })
    }
}
var data = {
    name: 'name before',
    age: 12
};
observe(data);
data.name = 'fangbinwei';
