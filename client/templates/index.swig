{# Homepage Markup #}
{% extends './layouts/base.swig' %}

{% block content %}
<section class="row">
<div class="col-lg-6">
  <div class="row">
    <button id="run" class="btn pull-left"> ▶ Run</button>
    <button id="debug" class="btn pull-left"> ⏏ Start Debuger</button>
    <button id="back" class="btn pull-left" disabled> &#8676; Back</button>
    <button id="step" class="btn pull-left" disabled> &#8677; Step</button>
    <button id="stop" class="btn pull-left" disabled> ■ Stop</button>
  </div>
  <div class="row">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#code" data-toggle="tab">Code</a></li>
      </ul>
      <div class="tab-content">
          <div class="tab-pane fade in active" id="code">
            <textarea id="editor"></textarea>
          </div>
      </div>
  </div>
</div>
<div class="col-lg-6">
  <div class="row">
    <ul class="nav nav-tabs">
        <li class="active"><a href="con" data-toggle="tab">Console</a></li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade in active" id="con">
        <textarea id="console" autocomplete="off"></textarea>
      </div>
    </div>
  </div>
</div>
</section>

{% endblock %}


{% block extra_style %}
    <link rel="stylesheet" href="bower_components/brython/www/doc/doc_brython.css">
    <link rel="stylesheet" href="styles/console.css">
    <link rel="stylesheet" href="bower_components/codemirror/lib/codemirror.css">
    <link rel="stylesheet" href="bower_components/codemirror/addon/lint/lint.css">
{% endblock %}

{% block extra_script %}
    <script src="bower_components/codemirror/lib/codemirror.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/mode/python/python.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/addon/edit/matchbrackets.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/addon/selection/active-line.js" type="text/javascript" charset="utf-8"></script>
{% endblock %}
