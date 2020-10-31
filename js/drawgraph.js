function write(bool1, bool2) {
  var toWrite = '\
	<script>var JSONresult;</script>\
	  <div id="main">\
	  	<div id="draw-status"><p>Status</p></div>\
	  	<div id="draw-warn"><p> </p></div>\
	  	<div id="draw-err"><p> </p></div>\
	    <div id="viz">\
\
	      <svg onClick = "GraphVisu(' + bool1 + ',' + bool2 + '); " width="890" height="450"><defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="6" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5" fill="#000"></path></marker></defs><path class="link dragline hidden" d="M0,0L0,0"></path><g><path class="link" d="M108.48528137423857,108.48528137423857L191.51471862576142,191.51471862576142"></path><path class="link" d="M208.48528137423858,208.48528137423858L291.5147186257614,291.5147186257614"></path></g><g><g><circle class="node" r="16" cx="100" cy="100" style="fill: rgb(238, 238, 238);"></circle><text x="100" y="105.33333333333333" class="id">0</text></g><g><circle class="node" r="16" cx="200" cy="200" style="fill: rgb(238, 238, 238);"></circle><text x="200" y="205.33333333333334" class="id">1</text></g><g><circle class="node" r="16" cx="300" cy="300" style="fill: rgb(238, 238, 238);"></circle><text x="300" y="305.3333333333333" class="id">2</text></g></g><g></g>\
	      <text x = "400" y = "100"> &bull; 点击空白区域新建顶点</text>\
	      <text x = "400" y = "125"> &bull; 在两点之间拖拽新建一条边</text>\
	      <text x = "400" y = "150"> &bull; 选择点 按下Delete进行删除</text>\
	      <text x = "400" y = "175"> &bull; 选择边 按下Enter改变边的权值</text>\
	      <text x = "400" y = "200"> &bull; 按住Ctrl改变点的位置</text>\
	    </svg>\
	  </div>\
\
\
	  <div id="drawgraph-actions">\
	    <p onclick=drawCancel()>取消</p>\
	    <p onclick=GraphVisu(' + bool1 + ',' + bool2 + ')>清空</p>\
	    <p onclick=drawDone()>完成</p>\
	    <form id="drawgraph-form">\
	   		<!--<input type="checkbox" id="submit" name="submit" value="submit" checked="checked">Submit drawn graph to database for random graph and online quiz purposes\
	   		<br>--><!--<input type="checkbox" id="copy" name="submit" value="submit" checked="checked">把 JSON 代码复制到剪贴板-->\
	   	</form>\
	  </div>\
\
	';
  $('#drawgraph').html(toWrite);
  $('#copy').removeAttr('checked');
}

function drawDone() {
  if (!gtWidget.draw()) return false;
  gtWidget.stopLoop();
  $('#drawgraph').fadeOut();
  $('#dark-overlay').fadeOut();
}

function drawCancel() {
  gtWidget.stopLoop();
  $('#drawgraph').fadeOut();
  $('#dark-overlay').fadeOut();
}

function drawGraph() {
  if (mode == "exploration") {
    $('#dark-overlay').fadeIn(function() {
      $('#drawgraph').fadeIn();
    });
    gtWidget.startLoop();
  }
}
