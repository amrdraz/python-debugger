### Python client side Debugger

A simple time-travel step back and forth client side python debugger.
[see demo](http://amrdraz.github.io/python-debugger/)

Uses Brython in order to convert python code to JS (supports all core python code that Brython supports).

As of this writing it is not full featured and supports only line step.
You will find documentation on how each function in the debugger works (in case you want to build on it) bellow and in debugger/main.js

The debugger does not fully support the input statements; only supporting input with a string literal for argument (more on this below).


###How It Wroks

The debugger provides 4 hooks (on_debugging_started, on_step_update, on_debugging_end, and on_debugging_error) which take a callback that you can decide to do whatever you want with.

The way the debugger works in record mode (default) when you run `start_debugger` is by parsing the python code into brython generated js and then injecting a trace function before each $line_info occurrence (which requires running brython in debug mode higher than 0).

Additional trace calls; are injected at the start of the code before any line, for pointing at the first line; after while loops and at the end of the program, for pointing at the correct lines when debugging in an editor.

Since the debugger is not run live but recorded the parser replaces each call to the brython input function with a trace of type input with the arguments that were meant to be passed to the input function (currently only support string literals).

After injecting trace is complete the debugger runs the code which then fires the trace calls while running.

Each line trace call gets a state object as parameter with the current top frame and line number and records it. Before doing so the previous state's next line number is updated with the current state's line number; as while stepping in the editor the next line not the current line is what gets highlighted.

If the line trace is of type afterwhile or eof then it's state is not recorded.

If an input trace is called then a line state trace of type input is added and the debugger halts code execution, starting the debugging session.

When the line trace of type input is stepped on the user is prompted for input based on Brython's defined input function, the result is recorded and the program gets re-executed.

If there was no input trace then the debugging session will start after the parsed code is executed normally.


###API

This debugger is still under development and changes will occur to the API

The debugger is available in the global scope from the window object under Brython_Debugger.

For an example on how it works with javascript see the debugger/user.js

If you want to add additional trace calls use the the `setTrace` function provided by the API inside your own function (currently must be globally accessible)

**Brython_Debugger**.`start_debugger()`
> start the debugging session, takes code to debug as parameter as well as an optional boolean flag for whether to live debug or record. Currently live debug is not supported and debugging by default starts in record mode.  The on_debugging_started callback is called at the end of this step

**Brython_Debugger**.`stop_debugger()`
> function to call when you want to stop the debugging session on_debugging_end is called at this step

**Brython_Debugger**.`step_debugger()`
> This function when called steps forward one step in the recorded debugging session

**Brython_Debugger**.`step_back_debugger()`
> This function when called steps backward one step in the recorded debugging session

**Brython_Debugger**.`can_step(n)`
> check if you can step to the specified step

**Brython_Debugger**.`set_step(n)`
> seek to a specific step in the recorded debugging session take a number from 0 to the last step as parameter. If a number larger than the last step is entered nothing will happen

**Brython_Debugger**.`is_debugging()`
> return whether a debugging session is active

**Brython_Debugger**.`is_recorded()`
> returns whether this debugger is in recording mode

**Brython_Debugger**.`is_last_step()`
> returns whether the current step is the last step

**Brython_Debugger**.`is_first_step()`
> returns whether the current step is the first step

**Brython_Debugger**.`get_current_step()`
> return a number indicating the current step

**Brython_Debugger**.`get_current_frame()`
> returns the current frame/state (it should be state)

**Brython_Debugger**.`get_recorded_frames()`
> returns all recorded states

**Brython_Debugger**.`set_trace_limit(Number)`
> The maximum number of steps executed before the debugger halts, defult 10000

**Brython_Debugger**.`set_trace(obj)`
> object should contain the data you want paced later to the set_trace function
 do not use event names already used by the debugger
 add a trace call, (which will be called on step update)

**Brython_Debugger**.`set_trace_call(string)`
> Change the name of the traceCall Function that is injected in the brython generated javascript, used to record state, the default is Brython_Debugger.set_trace. To change it you would still need to call this function, so be careful and generally you don't need to.

**Brython_Debugger**.`on_debugging_started(cb)`
> cb is called after debugging session has started

**Brython_Debugger**.`on_debugging_end(cb)`
> cb is called after debugging session has ended

**Brython_Debugger**.`on_debugging_error(cb)`
> cb is called after either a syntax or runtime error occurs

**Brython_Debugger**.`on_step_update(cb)`
> cb is called whenever a state is changed using setState