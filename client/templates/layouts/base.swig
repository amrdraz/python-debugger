{#
  Base template
  All other templates should extend from this
#}

{# [injector:swig] #}
{# [endinjector] #}

<!DOCTYPE html>
<!--[if lte IE 8]><html class="lt-ie9 no-js" lang="en"><![endif]-->
<!--[if gt IE 8]><!--><html lang="en" class="ie9 no-js"><!--<![endif]-->
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <title>Python Debugger</title>
    <meta name="description" content="An offline ready JavaScript based Python runner and debugger"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <!-- build:css(client) styles/global.css -->
      <!-- bower:css -->
      <link rel="stylesheet" href="/bower_components/codemirror/lib/codemirror.css" />
      <!-- endbower -->
      {% block extra_style %}
      {% endblock %}
    <!-- endbuild -->
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="styles/main.css">
    <!-- build:js(client) scripts/modernizr.js -->
    <script src="/bower_components/modernizr/modernizr.js"></script>
    <!-- endbuild -->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- build:js(client) scripts/shims.js -->
    <!--[if lt IE 9]>
    <script src="/bower_components/consolelog/consolelog.js"></script>
    <script src="/bower_components/html5shiv/dist/html5shiv-printshiv.js"></script>
    <![endif]-->
    <!-- endbuild -->
  </head>
  <body>
    <!--[if lte IE 7]>
    <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->

    {% block layout %}
    <div id="wrap">
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="index.html">Python Debugger</a>
          </div>
          <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
              <li>
                  <a href="image.html" class="btn" >
                    Image Manipulation
                  </a>
              </li>
              <li>
                 <a href="sandbox.html" class="btn" >
                    Od Sandbox
                  </a>
              </li>
              <li>
                  <a href="https://github.com/amrdraz/python-debugger" class="btn" >
                    Github Repo
                  </a>
              </li>
            </ul>
            <ul class="nav navbar-nav pull-right">
              <li>
                  <a id="lougout_btn" onclick="PD.authAction()" class="btn" >
                    Logout
                  </a>
              </li>
            </ul>
          </div>
        </div>
    </div>

    <div class="container-fluid marketing">
    {% block content %}{% endblock %}
    </div>
    </div>
    {% endblock %}
    <!-- build:js(client) scripts/global.js -->
      <script src="/bower_components/jquery/dist/jquery.js"></script>
      <script src="/bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js"></script>
      <script src="/bower_components/lodash/lodash.js"></script>
      {% block extra_script %}
      {% endblock %}
    <!-- endbuild -->

    {# <script src="scripts/brython/www/src/brython.js"></script> #}

    <!-- build:js(client) scripts/brython/www/src/brython.js -->
    <script type="text/javascript" src="scripts/brython/www/src/brython_builtins.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/version_info.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/identifiers_re.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py2js.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_object.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_type.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_utils.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_builtin_functions.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_exceptions.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_range_slice.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_bytes.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_set.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/js_objects.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/stdlib_paths.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_import.js"></script>

    <script type="text/javascript" src="scripts/brython/www/src/py_string.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_int.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_long_int.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_float.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_complex.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_dict.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_list.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_generator.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_dom.js"></script>

    <script type="text/javascript" src="scripts/brython/www/src/builtin_modules.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/py_import_hooks.js"></script>
    <script type="text/javascript" src="scripts/brython/www/src/async.js"></script>

    <script type="text/javascript" src="scripts/brython/www/src/py_VFS.js"></script>
    <!-- endbuild -->

    <!-- build:js(client) scripts/main.js -->
    <script src="scripts/debugger/debugger.js" type="text/javascript" charset="utf-8"></script>
    <script src="scripts/main.js" type="text/javascript" charset="utf-8"></script>
    <!-- endbuild -->

    {% block extra_page_script %}
    {% endblock %}

  </body>
</html>
