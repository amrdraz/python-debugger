{# Homepage Markup #}
{% extends './layouts/base.swig' %}

{% block content %}
<section class="row">
<div class="col-md-6 col-sm-6">
  <div class="game-stage">
    <h4>Canvas</h4>
    <canvas id="turtlecanvas" width="400" height="400"></canvas>
    <canvas id="imagecanvas" style="display:none"></canvas>
  </div>
</div> <!-- midcolumn -->

<div class="col-md-5 col-sm-4">
  <div class="row">
    <div class="btn-group btn-group-sm game-control">
      <button id="debug" class="btn btn-xs btn-default pull-left"> ⏏ Start Debuger</button>
      <button id="back" class="btn btn-xs btn-default pull-left" disabled> &#8676; Back</button>
      <button id="step" class="btn btn-xs btn-default pull-left" disabled> &#8677; Step</button>
      <button id="stop" class="btn btn-xs btn-default pull-left" disabled> ■ Stop</button>
      <button id="run" class="btn btn-xs btn-default pull-left"> ▶ Run</button>
      <button id="reset" class="btn btn-xs btn-default pull-left"> &#8617; Reset</button>
    </div>
  </div>
  <div class="row">
    <textarea id="editor"></textarea>
  </div>
  <div class="row">
    <h4>Console</h4>
    <textarea id="console" class="game-console" autocomplete="off"></textarea>
  </div>
</div>

<div class="col-md-1 col-sm-2">
  <h4>Available Images</h4>
  <code>"x.png" <br/>
    "51020-orange.png" <br/>
    "51020-poppy.png" <br/>
    "51020-stop-sign.png" <br/>
    "flowers.png" <br/>
    "puzzle-iron.png" <br/>
    "stop.jpg" <br/>
  </code>
  <h4>Available Functions</h4>
  <code>
    BitImage(width, height, bit_str) <br/>
    SimpleImage(src) <br/>
    print(image) <br/>
    image.setZoom(1) <br/>
    image.getPixel(x, y) <br/>
    image.pixelData<br/>
    pixel.getColor()<br/>
    pixel.setRed(255)<br/>
    pixel.setGreen(255)<br/>
    pixel.setBlue(255)<br/>
    pixel.setRGB(0xffffff)<br/>
    pixel.hex<br/>
    pixel.bin<br/>
    print(pixel)<br/>
    clear(color)
  </code>
</div> <!-- leftcolumn -->
</section>
{% endblock %}


{% block extra_style %}    
    <link rel="stylesheet" href="styles/console.css">
    <link rel="stylesheet" href="bower_components/codemirror/lib/codemirror.css">
    <link rel="stylesheet" href="bower_components/codemirror/addon/lint/lint.css">
{% endblock %}

{% block extra_script %}
    <script src="bower_components/codemirror/lib/codemirror.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/mode/python/python.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/addon/edit/matchbrackets.js" type="text/javascript" charset="utf-8"></script>
    <script src="bower_components/codemirror/addon/selection/active-line.js" type="text/javascript" charset="utf-8"></script>
    <script src="scripts/cm-lint-custom.js" type="text/javascript" charset="utf-8"></script>
    <script src="scripts/cm-lint-result.js" type="text/javascript" charset="utf-8"></script>
{% endblock %}

{% block extra_page_script %}
    <script src="scripts/image/pyimage.js"></script>
    <script src="scripts/image/user.js"></script>
{% endblock %}