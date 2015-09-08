function defineModule(name, mod) {
    var $B = window.__BRYTHON__;
    mod.__class__ = $B.$ModuleDict,
        mod.__name__ = name;
    mod.__repr__ = mod.__str__ = function() {
        return "<module '" + name + "' (built-in)>";
    };
    $B.imported[name] = $B.modules[name] = mod;
}

defineModule('fairy', {
    secret:'only faires know' 
});
