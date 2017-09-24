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
        if (!this.depIds.hasOwnProperty(dep.id)) {
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
                // 如果item是computed的属性,在调用计算属性(函数)时,在计算属性(函数)内部会触发observer中的getter
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
            // v-class 会用到oldValue
            this.cb.call(this.vm, value, oldValue);
        }
    }
};