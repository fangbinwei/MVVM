function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data;

    // vm.xx -> vm._data.xxx
    Object.keys(data).forEach((item) => {
        this._proxyData(item);
    })

    observe(data)
    this.$compile = new Compile(options.el || document.body, this)
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
    }
}