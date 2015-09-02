// example of using the brython debugger without initializing brython in body
(function() {
    brython(1);


    var doc = function(d) {
        return document.getElementById(d);
    };
    var $B = __BRYTHON__;
    var _b_ = $B.builtins;

    var editor = CodeMirror.fromTextArea(doc("editor"), {
        autofocus: true,
        lineNumbers: true,
        indentUnits: 4,
        lineWrapping: true,
        styleActiveLine: true,
        mode: {
            name: "python",
            version: 3,
            singleLineStringErrors: false
        }
    });


    var output;
    var storage = localStorage;


    function reset_src() {
        if (storage && storage['py_src']) {
            editor.setValue(storage["py_src"]);
        } else {
            editor.setValue('for i in range(10):\n\tprint(i)');
        }
        gotoLine(0);
    }

    function gotoLine(line) {
        editor.getDoc().setCursor(line - 1, {
            scroll: true
        });
    }

    reset_src();

    var Debugger = window.Brython_Debugger;

    var $io = {
        __class__: $B.$type,
        __name__: 'io'
    };
    $io.__mro__ = [$io, _b_.object.$dict];
    var cout = {
        __class__: $io,
        write: function(data) {
            doc("console").value += data;
            return _b_.None;
        },
        flush: function() {}
    };

    $B.stdout = cout;
    $B.stderr = cout;

    function run() {
        doc("console").value = '';
        var src = editor.getValue();
        if (storage) {
            storage["py_src"] = src;
        }
        var t0 = Date.now();
        var module_name = '__main__';
        $B.$py_module_path[module_name] = window.location.href;
        try {
            var root = $B.py2js(src, module_name, module_name, '__builtins__')
                //earney
            var js = root.to_js();
            if ($B.debug > 1) {
                console.log(js);
            }

            if ($B.async_enabled) {
                js = $B.execution_object.source_conversion(js);

                //console.log(js)
                eval(js);
            } else {
                // Run resulting Javascript
                eval(js);
            }
        } catch (exc) {
            $B.leave_frame();
            $B.leave_frame();
            if (exc.$py_error) {
                doc("console").value += _b_.getattr(exc, 'info') + '\n' + _b_.getattr(exc, '__name__') + ": " + exc.$message + '\n';
            } else {
                throw exc;
            }
        }
        output = doc("console").value;

        doc("console").value += ('<completed in ' + ((Date.now() - t0) * 1000.0) + ' ms >');
    }

    function start_debugger(ev) {
        doc("console").value = '';
        var src = editor.getValue();
        if (storage) {
            storage["py_src"] = src;
        }

        Debugger.start_debugger(src, true);
    }

    function stop_debugger(ev) {
        Debugger.stop_debugger();
    }

    function step_debugger(ev) {
        if (!Debugger.is_debugging()) {
            start_debugger();
        } else {
            Debugger.step_debugger()
        }
    }

    function step_back_debugger(ev) {
        Debugger.step_back_debugger()
    }

    function debug_started() {
        doc('run').disabled = true
        doc('debug').disabled = true
        doc('step').disabled = false
        doc('stop').disabled = false
        if (Debugger.is_recorded()) {
            if (Debugger.get_recorded_states().length > 0) {
                gotoLine(Debugger.get_recorded_states()[0].next_line_no);
            } else {
                Debugger.stop_debugger();
            }
        } else {
            Debugger.step_debugger()
        }
    }

    function debug_stoped() {
        doc('debug').disabled = false;
        doc('run').disabled = false;
        doc('step').disabled = true;
        doc('back').disabled = true;
        doc('stop').disabled = true;
    }

    function debug_step(state) {

        doc("console").value = "" + state.stdout;

        gotoLine(state.next_line_no);

        if (Debugger.is_last_step()) {
            doc('step').disabled = true;
        } else {
            doc('step').disabled = false;
        }
        if (Debugger.is_first_step()) {
            doc('back').disabled = true;
        } else {
            doc('back').disabled = false;
        }
    }


    function debug_error(err, Debugger) {
        if (Debugger.get_recorded_states().length === 0) {
            doc('console').value = err.data;
            Debugger.stop_debugger();
        }
    }

    function show_js(ev) {
        var src = editor.getValue();
        doc("console").value = $B.py2js(src, '__main__', '__main__', '__builtins__').to_js();
    }
    window.show_js = show_js;


    Debugger.on_debugging_started(debug_started);
    Debugger.on_debugging_end(debug_stoped);
    Debugger.on_debugging_error(debug_error);
    Debugger.on_step_update(debug_step);


    doc('run').addEventListener('click', run);
    doc('debug').addEventListener('click', start_debugger);
    doc('step').addEventListener('click', step_debugger);
    doc('back').addEventListener('click', step_back_debugger);
    doc('stop').addEventListener('click', stop_debugger);
})();
