function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data;

    // vm.xx -> vm._data.xxx
    Object.keys(data).forEach((item) => {
        this._proxyData(item);
    });

    this._initComputed();

    observe(data);
    this.$compile = new Compile(options.el || document.body, this);
}
MVVM.prototype = {
    constructor: MVVM,
    _proxyData: function (key, setter, getter) {
        var me = this;
        setter = setter ||
            Object.defineProperty(me, key, {
                configurable: false,
                enumerable: true,
                get: function () {
                    return me._data[key];
                },
                set: function (newVal) {
                    me._data[key] = newVal;
                }
            });
    },
    _initComputed: function () {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function (key) {
                Object.defineProperty(me, key, {
                    configurable: false,
                    enumerable: true,
                    // get: typeof computed[key] === 'function'?
                    //     computed[key] : '',
                    get: function () {
                        return typeof computed[key] === 'function'?
                        computed[key].bind(this)() : ''
                    },
                    set : function () {}
                })
            });
        }
    }
}