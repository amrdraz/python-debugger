(function(win) {
    var Debugger = win.Brython_Debugger = {
        run_no_debugger: runNoTrace,
        run_to_end: runToEnd,
        start_debugger: startDebugger,
        stop_debugger: stopDebugger,
        step_debugger: stepDebugger,
        step_back_debugger: stepBackRecording,
        step_to_last_step: setStepToLast,
        step_to_first_step: setStepToFirst,
        can_step: canStep,
        set_step: setStep,
        set_no_input_trace: setNoInputTrace,
        set_no_suppress_out: setNoSuppressOut,
        set_trace: setTrace,
        set_trace_call: setTraceCall,
        set_step_limit: setStepLimit,
        is_debugging: isDebugging,
        is_recorded: wasRecorded,
        is_executing: isExecuting,
        is_last_step: isLastStep,
        is_first_step: isFirstStep,
        did_error_occure: getDidErrorOccure,
        get_session: getSessionHistory,
        get_current_step: getStep,
        get_current_state: getCurrentState,
        get_recorded_states: getRecordedStates,
        unset_events: unsetCallbacks,
        reset_events: resetCallbacks,
        define_module: defineModule,
        on_input_while_debugging: callbackSetter('handleInput'),
        on_debugging_started: callbackSetter('debugStarted'),
        on_debugging_end: callbackSetter('debugEnded'),
        on_debugging_error: callbackSetter('debugError'),
        on_step_update: callbackSetter('stepUpdate'),
        on_line_trace: callbackSetter('lineTrace'),
    };
    var $B = win.__BRYTHON__;
    var _b_ = $B.builtins;
    var traceCall = 'Brython_Debugger.set_trace';
    var noInputTrace = false;
    var noSuppressOut = false;
    var debugging = false; // flag indecting debugger was started
    var stepLimit = 4000; // Solving the halting problem by limiting the number of steps to run

    var linePause = true; // used inorder to stop interpreter on line
    var myInterpreter = null;

    var isRecorded = false;
    var didErrorOccure = false;
    var weStopDebugOnRuntimeError = false;
    var errorState = null;
    var parserReturn = null; // object returned when done parsing
    var recordedStates = [];
    var recordedInputs = {};
    var recordedOut = [];
    var recordedErr = [];
    var currentStep = 0;
    var noop = function() {};

    var events = ['stepUpdate', 'debugStarted', 'debugError', 'debugEnded', 'handleInput', 'lineTrace'];
    var callbacks = {};
    var default_callbacks = {};
    var temp_callbacks = null;
    events.forEach(function(key) {
        default_callbacks[key] = callbacks[key] = noop;
    });
    /**
     * Dfault function to handle input while debugging
     * can be replaced externallyfrom this default
     * @param  {String} arg String to show user
     * @return {String}     Value of input
     */
    default_callbacks['handleInput'] = callbacks['handleInput'] = function handleInput(arg) {
        return _b_.input(arg);
    };

    // used in trace injection
    var LINE_RGX = /^( *);\$locals\.\$line_info=\"(\d+),(.+)\";/m;
    var WHILE_RGX = /^( *)while/m;
    var FUNC_RGX = /^( *)\$locals.*\[\"(.+)\"\]=\(function\(\){/m;
    var INPUT_RGX = /getattr\(input,\"__call__\"\)\(((?:\"(.)*\")|\d*)\)/g; // only works for string params
    var HALT = "HALT";

    function callbackSetter(key) {
        return function(cb) {
            callbacks[key] = cb;
        };
    }

    /**
     * temporarely remove callback in order to stop updating who ever is listening
     */
    function unsetCallbacks() {
        if (temp_callbacks === null) {
            temp_callbacks = callbacks;
            callbacks = default_callbacks;
        }
    }
    /**
     * re set callback after unset
     */
    function resetCallbacks() {
        if (temp_callbacks !== null) {
            callbacks = temp_callbacks;
            temp_callbacks = null;
        }
    }

    /**
     * Change the name of the traceCall Function that is injected in the brython generated javascript
     * The default is Brython_Debugger.set_trace
     * To change it you would still need to call this function
     * So be careful and generally you don't need to
     */
    function setTraceCall(name) {
        traceCall = name;
    }
    /**
     * Set the value of noInputTrace
     * a flag that stops the debugger from injecting input trace calls into the code
     * will cause the program to stop if you're in record more and did not change the default input function or input stream
     * @param {Boolean} bool wheather input trace calls should be injected into the code
     */
    function setNoInputTrace(bool) {
        noInputTrace = bool;
    }

    /**
     * Set the value of noInputTrace
     * a flag that stops the debugger from injecting input trace calls into the code
     * will cause the program to stop if you're in record more and did not change the default input function or input stream
     * @param {Boolean} bool wheather input trace calls should be injected into the code
     */
    function setNoSuppressOut(bool) {
        noSuppressOut = bool;
    }

    /**
     * is the debugger in record mode, exposed as is_recorded
     * @return {Boolean} whether the is recorded flag is on
     */
    function wasRecorded() {
        return isRecorded;
    }

    /**
     * If an error is thrown during the debugging session this value is true
     * @return {Boolean}
     */
    function getDidErrorOccure() {
        return didErrorOccure;
    }
    /**
     * Is this a debugging session active
     * @return {Boolean} 
     */
    function isDebugging() {
        return debugging;
    }

    function isExecuting() {
        return debugging && !linePause;
    }

    function getStep() {
        return currentStep;
    }

    function getErrorState() {
        return errorState;
    }

    function getRecordedStates() {
        return recordedStates;
    }

    function getLastRecordedState() {
        return recordedStates[recordedStates.length - 1];
    }

    function getCurrentState() {
        return recordedStates[currentStep];
    }

    /**
     * Set the limit of the number of steps that can be executed before thrwing an error
     * @param {Numebr} n limit default 100000
     */
    function setStepLimit(n) {
        stepLimit = (n === undefined) ? 10000 : n;
    }

    function setStepToLast() {
        setStep(recordedStates.length - 1);
    }

    function setStepToFirst() {
        setStep(0);
    }

    /**
     * check if a step can be made to this position
     * @param {Number} n The place to seek
     */
    function canStep(n) {
        return n < recordedStates.length && n >= 0;
    }
    /**
     * return state at position n
     * @param {Number} n The place to seek
     */
    function getState(n) {
        return canStep(n) ? getRecordedStates()[n] : null;
    }
    /**
     * Move to step n in recordedStates
     * @param {Number} n The place to seek
     */
    function setStep(n) {
        var state = getState(n);
        if (!state) {
            // throw new Error("You stepped out of bounds")
            return;
        }
        if (state.type === 'input') {
            recordInput(state);
            rerunCode();
            n -= 1;
        }
        currentStep = n;
        updateStep();
    }

    /**
     * record input in case of rerun
     * @param  {Object} state current step state
     * @return {String}       Value of input
     */
    function recordInput(state) {
        var inp = callbacks['handleInput'](state.arg);
        recordedInputs[state.id] = inp;
        return recordedInputs[state.id];
    }

    /**
     * Is this last step
     * @return {Boolean} [description]
     */
    function isLastStep() {
        return currentStep === recordedStates.length - 1;
    }
    /**
     * Is this first step
     * @return {Boolean} [description]
     */
    function isFirstStep() {
        return currentStep === 0;
    }

    /**
     * Fire event after debugger has been intialized and bebug mode started
     */
    function debuggingStarted() {
        debugging = true;
        linePause = false;
        callbacks.debugStarted(Debugger);
    }

    /**
     * Set currntFrame to the one corresponding to the current step
     * Fire event when currentStep changes
     * In live mode currentStep is useually the last
     */
    function updateStep() {
        var currentState = getCurrentState();
        callbacks.stepUpdate(currentState);
    }


    /**
     * Fire when exiting debug mode
     */
    function stopDebugger() {
        if (debugging) {
            debugging = false;
            resetOutErr();
            callbacks.debugEnded(Debugger);
        }
    }

    /**
     * Fire when an error occurrs while parsing or during runtime
     */
    function errorWhileDebugging(err) {
        var info = "";
        try {
            info = _b_.getattr(err, 'info');
        } catch (er) {
            // guess it doesn't work here, sometimes info doesn't exist when you have a syntax error
        }
        var trace = {
            event: 'line',
            type: 'runtime_error',
            data: info + '\n' + _b_.getattr(err, '__name__') + ": " + err.$message + '\n',
            stack: err.$stack,
            message: err.$message,
            name: _b_.getattr(err, '__name__'),
            frame: $B.last(err.$stack),
            err: err,
            step: getRecordedStates().length - 1,
        };
        trace.stdout = (getLastRecordedState() ? getLastRecordedState().stdout : '') + trace.data;
        trace.module_name = trace.frame[0];
        trace.line_no = trace.next_line_no = $B.last(err.$stack)[1].$line_info?(+($B.last(err.$stack)[1].$line_info.split(',')[0])):-1;
        trace.column_no_start = 0;
        trace.column_no_stop = 200;
        if (err.args[1] && err.args[1][1] === trace.line_no) {
            trace.fragment = err.args[1][3];
            trace.column_no_start = Math.max(0, err.args[1][2] - 3);
            trace.column_no_stop = err.args[1][2] + 3;
        }
        didErrorOccure = true;
        if (getRecordedStates().length > 0) {
            if (getRecordedStates().length >= stepLimit) {
                trace.name = "StepLimitExceededError";
                trace.stdout = trace.data = info + '\n' + trace.name + ": " + trace.message + '\n';
                trace.type = 'infinit_loop';
                recordedStates.push(trace);
            } else {
                setTrace(trace);
            }
        } else {
            trace.type = 'syntax_error';
        }
        setErrorState(trace);
        callbacks.debugError(trace, Debugger);
    }

    function setErrorState(state) {
        errorState = state;
    }

    /**
     * Trace Function constructs a list of states of the program after each trace call
     * @return {String} Value of input when setTrace is used for input
     */
    function setTrace(state) {
        // console.log(state);
        // replace by event

        if (recordedStates.length > stepLimit) {
            throw $B.exception("You have exceeded the amount of steps allowed for this program, you probably have an infinit loop or you're running a long program");
            // you can change the limit by using the setStepLimit method variable form the default
            // The debugger is not meant to debug long pieces of code so that should be taken into consideration
        }

        switch (state.event) {
            case 'line':
                return setLineTrace(state);
            case 'stdout':
                return setdStdOutTrace(state);
            case 'stderr':
                return setdStdErrTrace(state);
            case 'input':
                // state = {event, arg, id}
                return setInputTrace(state);
            default:
                // custom step to be handled by user
                recordedStates.push(state);
        }
    }

    /**
     * Inserts a line state trace in recorded states
     * makes sure that trace builds on old trace stdout and stderr
     * Update previous state next_line_no with the current state line_no for editor using debugger to highlight
     * Some states are disposable and are only inserted to insure proper next_line_no update and are thuse disposed of later
     */
    function setLineTrace(state) {
        if (!isRecorded) {
            linePause = true;
        }
        lastState = getLastRecordedState();
        state.printerr = state.stderr = state.stdout = state.printout = "";
        if (lastState) {
            state.stdout = lastState.stdout;
            state.stderr = lastState.stderr;
            state.locals = state.frame[1];
            state.globals = state.frame[3];
            state.var_names = Object.keys(state.locals).filter(function(key) {
                return !/^(__|_|\$)/.test(key);
            });
            lastState.next_line_no = state.line_no;
        }
        if (isDisposableState(state)) {
            callbacks.lineTrace(state, Debugger);
            return;
        }
        if (state.type === 'runtime_error') {
            recordedStates.pop();
            state.stdout += state.data;
        }
        callbacks.lineTrace(state, Debugger);
        recordedStates.push(state);
    }

    function setdStdOutTrace(state) {
        recordedOut.push(state);
        getLastRecordedState().printout = state.data;
        getLastRecordedState().stdout += state.data;
    }

    function setdStdErrTrace(state) {
        console.error(state.data);
        recordedErr.push(state);
        if (!state.frame) {
            return;
        }
        getLastRecordedState().printerr = state.data;
        getLastRecordedState().stderr += state.data;
    }

    /**
     * Inserts a line of type input into the recordedStates such that during setStep it would prompt user for input
     * If an input trace of the same id was already set then return the value instead without inserting a line trace.
     * @param {Object} state state to record excpected to contina {id: unique idetifier, arg: argument for prompt}
     */
    function setInputTrace(state) {
        state.event = 'line';
        state.type = 'input';
        state.id = state.id + recordedStates.length;
        if (recordedInputs[state.id] !== undefined) {
            return recordedInputs[state.id];
        } else if (stdInChanged()) {
            // ignore input trace until it's back to the original
            // by handeling input now
            return callbacks['handleInput'](state.arg);
        } else {
            state.line_no = getLastRecordedState().line_no;
            state.frame = getLastRecordedState().frame;

            setTrace(state);
            throw HALT;
        }
    }

    /**
     * detect whether stdin changed by using the sys module
     * @return {Boolean} whether stdIn was changed while running the code
     */
    function stdInChanged() {
        return $B.imported.sys ? ($B.imported.sys.stdin !== $B.modules._sys.stdin) : false;
    }

    /**
     * These states are only there to update the previouse states of where they should point
     * they are not recorded
     * @param { Object} state state object to
     * @return {Boolean}     [The state is disposable]
     */
    function isDisposableState(state) {
        var disposable = ['afterwhile', 'eof'];
        return state.type && ~disposable.indexOf(state.type);
    }

    function resetDebugger(rerun) {
        recordedStates = [];
        recordedOut = [];
        recordedErr = [];
        if (!rerun) {
            didErrorOccure = false;
            isRecorded = false;
            currentStep = 0;
            recordedInputs = {};
            parserReturn = null;
            errorState = null;
        }
    }

    /**
     * Steps through the debugger depending on the debugger mode
     */
    function stepDebugger() {
        if (isRecorded) {
            stepRecording();
        } else {
            stepInterpreter();
        }
    }

    /**
     * In recorded debugging mode this will move one step forward from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     */
    function stepRecording() {
        var step = getStep();
        setStep(step + 1);
    }

    /**
     * In recorded debugging mode this will move one step backeards from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     */
    function stepBackRecording() {
        var step = getStep();
        setStep(step - 1);
    }

    /**
     * step through the interpreter using JS-Interpreter with acorn until linePause is true
     * linePause is set to true when the interpreter runs the tracefunction and a line event is triggered
     */
    function stepInterpreter() {
        var ok = false;
        try {
            ok = myInterpreter.step();
        } catch (e) {
            errorWhileDebugging(e);
            console.error(e);
        } finally {
            if (!ok) {
                // Program complete, no more code to execute.
                stopDebugger();
                return;
            }
        }
        if (linePause) {
            // A block has been highlighted.  Pause execution here.
            linePause = false;
            currentStep = getRecordedStates().length - 1;
        } else {
            // Keep executing until a highlight statement is reached.
            stepDebugger();
        }
    }

    /**
     * Rerun already parsed brython js code
     */
    function rerunCode() {
        resetDebugger(true);
        try {
            setOutErr();
            runTrace(parserReturn);
        } catch (err) {
            handleDebugError(err);
        } finally {
            resetOutErr();
        }
    }

    /**
     * Initialises the debugger, setup code for debugging, and either run interpreter or record run
     * @param  {String} src optional code to be passed, if default is an empty string
     * @param  {Boolean} whether to run recording then replay or step
     */
    function startDebugger(src, record) {
        var code = src || "";
        resetDebugger();

        isRecorded = record === undefined ? true : record;

        setOutErr(noSuppressOut);
        try {
            var obj = parserReturn = parseCode(code);

            if (record) {
                runTrace(obj);
            } else {
                myInterpreter = interpretCode(obj);
            }
        } catch (err) {
            handleDebugError(err);
        } finally {
            resetOutErr();
        }
        debuggingStarted();
        return getSessionHistory();
    }

    function handleDebugError(err) {
        if (!err.$py_error) {
            throw err;
        }
        if (!wasHalted(err)) {
            errorWhileDebugging(err);
        }
        $B.leave_frame();
        $B.leave_frame();
        if (!wasHalted(err) && weStopDebugOnRuntimeError) {
            throw err;
        }
    }

    /**
     * return true if eror was thrown by debugger in order to HULT
     * the purpose of this behavior is to stop running the program up until some function that demands user intraction
     * @param  {Object} err [description]
     * @return {Boolean}     [description]
     */
    function wasHalted(err) {
        return err.$message === ('<' + HALT + '>');
    }

    /**
     * Parsed python code converts it to brython then injects trac function calls inside to record debugging events
     * @param { String} src python source to parse
     */
    function parseCode(src) {
        // Generate JavaScript code and parse it.
        var obj = pythonToBrythonJS(src);
        obj.code = injectTrace(obj.code);
        return obj;
    }

    /**
     * Convert python code to Brython JS
     * @param { String} src python source to parse
     */
    function pythonToBrythonJS(src) {
        var obj = {
                code: ""
            },
            module_name, local_name, current_globals_id, current_locals_name, current_globals_name;

        firstRunCheck();
        // Initialize global and local module scope
        var current_frame = $B.frames_stack[$B.frames_stack.length - 1];
        var current_locals_id = current_frame[0];
        current_locals_name = current_locals_id.replace(/\./, '_');
        current_globals_id = current_frame[2] || current_locals_id;
        current_globals_name = current_globals_id.replace(/\./, '_');
        var _globals = _b_.dict([]);
        module_name = _b_.dict.$dict.get(_globals, '__name__', 'exec_' + $B.UUID());
        $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id];
        local_name = module_name;

        obj.module_name = module_name;
        if (!$B.async_enabled) {
            obj[module_name] = {};
        }


        // parse python into javascript
        try {
            var root = $B.py2js(src, module_name, [module_name], local_name);
            obj.code = root.to_js();
            if ($B.async_enabled) {
                obj.code = $B.execution_object.source_conversion(obj.code);
            }
            //js=js.replace("@@", "\'", 'g')
        } catch (err) {
            if (err.$py_error === undefined) {
                throw $B.exception(err);
            }
            throw err;
        }
        return obj;
    }

    /**
     * Inject Trace Function into Brython code
     * The trace function is called every time a line, output
     * shoudl support function call, return later
     * @param  {String} code Brython Code to inject trace in
     * @return {String} trace injected code as string
     */
    function injectTrace(code) {
        // console.log('brython:\n\n' + code);
        var newCode = "";
        var whileLine;
        var codearr = code.split('\n');
        codearr.splice(9, 0, traceCall + "({event:'line', type:'start', frame:$B.last($B.frames_stack), line_no: " + 0 + ", next_line_no: " + 1 + "});")
        code = codearr.join('\n');
        var line = getNextLine(code);
        if (line === null) { // in case empty code
            return code;
        }
        var lastLineNo = 0;
        var largestLine = 1;
        var index = line.index;
        do {

            newCode += code.substr(0, index);
            if (+line.line_no !== lastLineNo) { // bug fix for brython 3.2.2 for in loop outputing identical line traces after each other
                newCode += line.indentString + traceCall + "({event:'line', frame:$B.last($B.frames_stack), line_no: " + line.line_no + ", next_line_no: " + (+line.line_no + 1) + "});\n";
            }
            newCode += line.string;
            index += line.string.length;
            code = code.substr(index);

            lastLineNo = +line.line_no;
            largestLine = largestLine > lastLineNo ? largestLine : lastLineNo;
            line = getNextLine(code);
            if (line === null) {
                break;
            }

            whileLine = getNextWhile(code);
            if (whileLine && whileLine.index < line.index) { // then I'm about to enter a while loop
                code = injectWhileEndTrace(code, whileLine, lastLineNo); // add a trace at the end of the while block
            }
            index = line.index;
        } while (true);
        var codesplit = code.split(/^\;\$B\.leave_frame\(/m);
        newCode += codesplit[0] + traceCall + "({event:'line', type:'eof', frame:$B.last($B.frames_stack), line_no: " + (++largestLine) + ", next_line_no: " + (largestLine) + "});\n";
        newCode += ';$B.leave_frame(' + codesplit[1];

        //  inject input trace if applicable
        if (!noInputTrace) {
            var re = new RegExp(INPUT_RGX.source, 'g');
            var inputLine = getNextInput(newCode, re);
            while (inputLine !== null) {
                code = newCode.substr(0, inputLine.index);
                var inJect = traceCall + "({event:'input'" + (inputLine.param ? ", arg:" + inputLine.param : "") + ", id:'" + inputLine.index + "'})";
                code += inJect;
                index = inputLine.index + inputLine.string.length;
                code += newCode.substr(index);
                newCode = code;
                inputLine = getNextInput(newCode, re);
            }
        }

        // console.log('debugger:\n\n' + newCode);

        return newCode;

        function getNextLine(code) {
            var match = LINE_RGX.exec(code);
            if (!match) {
                return null;
            }
            return {
                indent: match[1].length,
                indentString: match[1],
                line_no: match[2],
                string: match[0],
                module: match[3],
                match: match,
                index: match.index
            };
        }

        function getNextWhile(code) {
            var match = WHILE_RGX.exec(code);
            if (!match) {
                return null;
            }
            return {
                indent: match[1].length,
                indentString: match[1],
                match: match,
                index: match.index
            };
        }

        function getNextFunction(code) {
            var match = FUNC_RGX.exec(code);
            if (!match) {
                return null;
            }
            return {
                indent: match[1].length,
                name: match[2],
                match: match,
                index: match.index
            };
        }

        function injectWhileEndTrace(code, whileLine, lastLine) {
            var indent = whileLine.indentString + '}';
            var newCode = "";
            var re = new RegExp('^ {' + Math.max(whileLine.indent - 4, 0) + ',' + whileLine.indent + '}\}', 'm');
            var res = re.exec(code);
            newCode += code.substr(0, res.index);
            newCode += whileLine.indentString + traceCall + "({event:'line', type:'endwhile', frame:$B.last($B.frames_stack), line_no: " + lastLine + ", next_line_no: " + (lastLine + 1) + "});\n";
            newCode += indent;
            // somehow seems to have proven useless
            // newCode += traceCall + "({event:'line', type:'afterwhile', frame:$B.last($B.frames_stack), line_no: " + (lastLine) + ", next_line_no: " + (lastLine) + "});\n";
            newCode += code.substr(res.index + indent.length);
            return newCode;
        }

        function getNextInput(code, re) {
            var match = re.exec(code);
            if (!match) {
                return null;
            }
            return {
                param: match[1],
                string: match[0],
                index: match.index
            };
        }
    }

    /**
     * Run traced code, used in record mode by hidding 
     * @param  {Object} obj object contianing code and module scope
     * @return {Object} result of running code as if evaluated
     */
    function runTrace(obj) {
        var js = obj.code;
        // firstRunCheck();
        // Initialise locals object
        try {
            eval('var $locals_' + obj.module_name + '= obj["' + obj.module_name + '"]');
            var getattr = _b_.getattr;
            var setattr = _b_.setattr;
            var delattr = _b_.setattr;

            var res = eval(js);

            if (res === undefined) return _b_.None;
            return res;
        } catch (err) {
            if (err.$py_error === undefined) {
                throw $B.exception(err);
            }
            throw err;
        }
    }


    /**
     * Run Debugger and  step through it until the end of the program
     * @param  {String} code to run
     * @return {Object} debug session history contains step trace and error if error occured
     */
    function runToEnd(code) {
        Debugger.set_no_input_trace(true);
        Debugger.set_no_suppress_out(true);
        Debugger.start_debugger(code, true);
        var history = Debugger.get_session();
        Debugger.stop_debugger();
        Debugger.set_no_input_trace(false);
        Debugger.set_no_suppress_out(false);
        return history;
    }

    /**
     * Run Code without trace
     * @param  {String} code to run
     */
    function runNoTrace(code) {
        resetDebugger();
        var module_name, local_name, current_globals_id, current_locals_name, current_globals_name;
        // Initialize global and local module scope
        firstRunCheck();
        var current_frame = $B.frames_stack[$B.frames_stack.length - 1];
        var current_locals_id = current_frame[0];
        current_locals_name = current_locals_id.replace(/\./, '_');
        current_globals_id = current_frame[2] || current_locals_id;
        current_globals_name = current_globals_id.replace(/\./, '_');
        var _globals = _b_.dict([]);
        module_name = _b_.dict.$dict.get(_globals, '__name__', 'exec_' + $B.UUID());
        $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id];
        local_name = module_name;
        try {
            var root = $B.py2js(code, module_name, [module_name], local_name);

            var js = root.to_js();

            if (!$B.async_enabled) {
                eval('var $locals_' + module_name + '=  {}');
            }
            var None = _b_.None;
            var getattr = _b_.getattr;
            var setattr = _b_.setattr;
            var delattr = _b_.setattr;
            if ($B.async_enabled) {
                js = $B.execution_object.source_conversion(js);
                eval(js);
            } else {
                // Run resulting Javascript
                eval(js);
            }
        } catch (exc) {
            $B.leave_frame();
            $B.leave_frame();
            if (exc.$py_error) {
                errorWhileDebugging(exc);
            } else {
                throw exc;
            }
        }
    }

    /**
     * Interpret initialize interpreter when running debugger in live mode (not recorded)
     * @param  {Object} obj object containing trace injected code and module scope
     * @return {Interpreter} instence of Interpreter
     */
    function interpretCode(obj) {
        var initAPI = defineAPIScope(obj);
        return new window.Interpreter(obj.code, initAPI);
    }


    /**
     * functions that returns the Interpreter scope function
     * @param  {Object} obj containing module scope
     */
    function defineAPIScope(obj) {

        return function initAPI(interpreter, scope) {
            // variables

            interpreter.setProperty(scope, '__BRYTHON__', $B, true);
            interpreter.setProperty(scope, '$locals_' + obj.module_name, obj[obj.module_name], true);
            interpreter.setProperty(scope, '_b_', _b_, true);
            interpreter.setProperty(scope, 'getattr', _b_.getattr, true);

            // wrapp functions before injection
            var wrapper;
            wrapper = function(obj) {
                return interpreter.createPrimitive(setTrace(obj));
            };
            interpreter.setProperty(scope, traceCall,
                interpreter.createNativeFunction(wrapper));

            wrapper = function(text) {
                text = text ? text.toString() : '';
                return interpreter.createPrimitive(alert(text));
            };
            interpreter.setProperty(scope, 'alert',
                interpreter.createNativeFunction(wrapper));

            wrapper = function(text) {
                text = text ? text.toString() : '';
                return interpreter.createPrimitive(prompt(text));
            };
            interpreter.setProperty(scope, 'prompt',
                interpreter.createNativeFunction(wrapper));

        };
    }

    /**
     * return an object containing a history of what happend during the debug seesion
     * this includes wether an error occured, the last global, local frame, stdout, print states, all line states
     * if a syntax error occured teh last state is the erro state.
     * @return {Object} debug session history
     */
    function getSessionHistory() {
        var last_state;
        if (didErrorOccure && errorState.type === "syntax_error") {
            last_state = errorState;
        } else {
            last_state = getLastRecordedState();
        }
        return {
            states: recordedStates,
            prints: recordedOut,
            stdout: last_state.stdout,
            locals: last_state.frame[1],
            globals: last_state.frame[3],
            error: didErrorOccure,
            errorState: errorState
        };
    }

    var realStdOut = $B.stdout;
    var realStdErr = $B.stderr;
    var realStdIn = $B.stdin;

    /**
     * Creates an Std out object for writing to surign debugging, if next is specified then that object is called after the debug hook
     * this function is used when we want to spy on the out streams instead of supressing them
     * no_suppress_out toggles this behavior before debug start
     * @param  {String}   std   the type of out stream out/err
     * @param  {Function} next  real output steam to pass the call to if stream is not suppressed. 
     * @return {Object}         a brython io class
     */
    function createOut(std, next) {
        var $io = {
            __class__: $B.$type,
            __name__: 'io'
        };
        $io.__mro__ = [$io, _b_.object.$dict];
        return {
            __class__: $io,
            write: function(data) {
                var frame = getLastRecordedState() || {
                    frame: undefined
                };
                setTrace({
                    event: std,
                    data: data,
                    frame: frame.frame,
                    line_no: frame.line_no
                });
                if (next) {
                    next.write(data);
                }
                return _b_.None;
            },
            flush: function() {}
        };
    }

    var outerr = {
        recordOut: createOut('stdout'),
        recordErr: createOut('stderr'),
    };


    /**
     * setStdout to debugger stdout capturing output stream
     * if spy is true the data will be passed along to the original output stream present at the start of the debug session.
     */
    function setOutErr(spy) {
        realStdOut = $B.stdout;
        realStdErr = $B.stderr;
        if (spy) {
            $B.stdout = createOut('stdout', realStdOut);
            $B.stderr = createOut('stderr', realStdErr);
        } else {
            $B.stdout = outerr.recordOut;
            $B.stderr = outerr.recordErr;
        }
    }
    /**
     * resetting back stdout to original stream before debugger ran
     */
    function resetOutErr() {
        $B.stdout = realStdOut;
        $B.stderr = realStdErr;
    }

    /**
     * Initialize the first frame the first time Brython runs
     */
    function firstRunCheck() {
        if ($B.frames_stack < 1) {
            var module_name = '__main__';
            $B.$py_module_path[module_name] = window.location.href;
            var root = $B.py2js("", module_name, module_name, '__builtins__');
            var js = root.to_js();
            eval(js);
        }
    }

    /**
     * Inject a module into Brython's imported array as if it was imported
     * This makes it possible to dynamically define modules in your application and simply import them in the code with
     * import [module] or from [module] import [fucntion, *, etc..]
     * @param  {String} name name of module
     * @param  {Object} mod  module as Object
     */
    function defineModule(name, mod) {
        mod.__class__ = $B.$ModuleDict,
            mod.__name__ = name;
        mod.__repr__ = mod.__str__ = function() {
            return "<module '" + name + "' (built-in)>";
        };
        $B.imported[name] = $B.modules[name] = mod;
    }

    // defineModule('fairy', {
    //     secret:'only faires know' 
    // });
})(window);
