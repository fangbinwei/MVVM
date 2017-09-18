/**
 * 订阅者,当接受到发布者的更新信息,更新视图
 * @param vm
 * @param dirVal
 * @param cb
 * @constructor
 */
function Watcher(vm, dirVal, dir, cb) {
    this.vm = vm;
    this.dirVal = dirVal;
    this.type = dir;
    this.cb = cb;
    // 记录 包含当前Watcher实例的Dep实例
    this.depIds = {};

    this.getter = this.parseGetter(dirVal);

    //触发observer中的getter
    this.value = this.get();
}

Watcher.prototype = {
    constructor: Watcher,
    addDep: function (dep) {
        console.log('depIds', this.depIds)
        if (!this.depIds.hasOwnProperty(dep.id)) {
            console.log('dep.id', dep.id)
            console.log('watcher', this)
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function () {
        Dep.target = this; //将订阅者指向自己
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