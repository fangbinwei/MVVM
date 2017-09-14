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
        Dep.target.addDep(this);  // Dep.target指向Watcher实例
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
var data = {name: 'name before', age: 12};
observer(data);
data.name = 'fangbinwei';

function observer(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }

    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    })
}

function defineReactive(data, key, val) {
    var dep = new Dep();
    observer(val); // 递归子属性
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function () {
            if(Dep.target) {
                dep.depend();
            }
            return val;
        },
        set: function (newVal) {
            if (val === newVal) return;
            console.log(`value of data has been changed!! from ${val} --> ${newVal}`);
            val = newVal;
            dep.notify()
        }
    });
}
