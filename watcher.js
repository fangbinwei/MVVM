/**
 * 订阅者,当接受到发布者的更新信息,更新视图
 * @param vm
 * @param dirVal
 * @param cb
 * @constructor
 */
// var watchers = []; //test
function Watcher(vm, dirVal, cb) {
    this.vm = vm;
    this.dirVal = dirVal;
    this.cb = cb;
    this.depIds = {};
    
    this.getter = this.parseGetter(dirVal);

    //触发observer中的getter
    this.value = this.get();
}

Watcher.prototype = {
    construct: Watcher,
    addDep: function (dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            console.log('dep.id', dep.id)
            console.log('watcher', this)
            dep.addSub(this);
            // watchers.push(this); //test
            this.depIds[dep.id] = dep;
        }
    },
    get: function () {
        Dep.target = this;  //将订阅者指向自己
        var value = this.getter.call(this.vm, this.vm); //触发observer中getter
        Dep.target = null;
        return value;
    },
    parseGetter: function (dirVal) {
        dirVal = dirVal.split('.');
        return function (obj) {
            if (!obj) return;
            dirVal.forEach(function (item) {
                obj = obj[item]; // watcher 也会添加到 父级dep
            });
            return obj;
        }
    },
    // 更新视图
    update: function () {
        this.run();
    },
    run: function () {
        var value = this.get();
        var oldValue = this.value;
        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value);
        }
    }
};