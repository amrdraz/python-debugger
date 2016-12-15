(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  CodeMirror.lintResult = function (error_list) {
		var found = [];
		
		error_list.forEach(function (error)
		{
			
			var start_line = error.line_no;

            var start_char;
            if(typeof(error.column_no_start) !== "undefined")
			    start_char = error.column_no_start;
            else
			    start_char = error.column_no;

			var end_char;
            if(typeof(error.column_no_stop) !== "undefined")
    			end_char = error.column_no_stop;
            else
    			end_char = error.column_no;

			var end_line = error.line_no;
			var message = error.message;

            var severity;
            if(typeof(error.severity) !== "undefined")
                severity = error.severity;
            else
                severity = 'error';
			
			found.push({
				from: CodeMirror.Pos(start_line - 1, start_char),
				to: CodeMirror.Pos(end_line - 1, end_char),
				message: message,
				severity: severity // "error", "warning"
			});
		});
		
		return found;
    };
});

