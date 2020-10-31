var SSSP_EXAMPLE_CP3_4_1 = 0;
var SSSP_EXAMPLE_CP3_4_3 = 1;
var SSSP_EXAMPLE_CP3_4_4 = 2;
var SSSP_EXAMPLE_CP3_4_9 = 3;
var SSSP_EXAMPLE_CP3_4_17 = 4;
var SSSP_EXAMPLE_CP3_4_18 = 5;
var SSSP_EXAMPLE_CP3_4_19 = 6;

var GraphTraversal = function() {
  var self = this;
  var graphWidget = new GraphWidget();

  var internalAdjList = {};
  var internalEdgeList = {};
  var amountVertex = 0;
  var amountEdge = 0;

  this.getGraphWidget = function() { return graphWidget; }

  fixJSON = function() {
    amountVertex = 0;
    amountEdge = 0;
    for (var key in internalAdjList)
      ++amountVertex;
    for (var key in internalEdgeList)
      ++amountEdge;

    for (var key in internalEdgeList) {
      delete internalEdgeList[key]["type"];
      delete internalEdgeList[key]["displayWeight"];
      delete internalEdgeList[key]["animateHighlighed"];
      delete internalEdgeList[key]["state"];
      delete internalEdgeList[key]["weight"];
    }
    for (var key in internalAdjList) {
      internalAdjList[key]["text"] = +key;
      delete internalAdjList[key]["state"];
    }
  }

  takeJSON = function(graph) {
    if (graph == null)
      return;
    graph = JSON.parse(graph);
    internalAdjList = graph["vl"];
    internalEdgeList = graph["el"];
    fixJSON();
  }

  statusChecking = function() {
    $("#draw-status p").html("请绘制图以进行遍历算法的演示。");
  }

  warnChecking = function() {
    var warn = "";
    if (amountVertex >= 10)
      warn += "请减少点的个数。 ";

    if (warn == "")
      $("#draw-warn p").html("－");
    else
      $("#draw-warn p").html(warn);
  }

  errorChecking = function() {
    var error = "";
    if (amountVertex == 0) {
      $("#draw-err p").html("图不能为空。 ");
      return;
    }

    if (error == "")
      $("#draw-err p").html("－");
    else
      $("#draw-err p").html(error);
  }

  var intervalID;

  this.startLoop = function() {
    intervalID = setInterval(function() {
      takeJSON(JSONresult);
      warnChecking();
      errorChecking();
      statusChecking();
    }, 100);
  }

  this.stopLoop = function() {
    clearInterval(intervalID);
  }

  this.draw = function() {
    if ($("#draw-err p").html() != "－")
      return false;
    if ($("#submit").is(':checked'))
      this.submit(JSONresult);
    if ($("#copy").is(':checked'))
      window.prompt("Copy to clipboard:", JSONresult);

    DIRECTED_GR = true;
    OLD_POSITION = amountEdge;

    graph = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(graph, 500);
    return true;
  }

  this.submit = function(graph) {
    $.ajax({
      url: PHP_DOMAIN + "php/Graph.php?mode=" + MODE_SUBMIT_GRAPH,
      type: "POST",
      data: {canvasWidth: 1000, canvasHeight: 500, graphTopics: 'Graph Traversal', graphState: graph, fbAccessToken: fbAccessToken},
      error: function(xhr, errorType, exception) { //Triggered if an error communicating with server
          var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText
          alert("错误， " + errorMessage);
      }
    }).done(function(data) {
      console.log(data);
    });
  }

  this.importjson = function() {
    var text = $("#samplejson-input").val();
    takeJSON(text);
    statusChecking();
    graph = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(graph, 500);

    amountEdge = internalEdgeList.length;
    OLD_POSITION = amountEdge;
  }

  this.initRandom = function(graph) {
    internalAdjList = graph.internalAdjList;
    internalEdgeList = graph.internalEdgeList;
    amountVertex = internalAdjList.length;
    amountEdge = internalEdgeList.length;
    fixJSON();
    statusChecking();

    DIRECTED_GR = true;
    OLD_POSITION = amountEdge;

    var newState = createState(internalAdjList, internalEdgeList);

    graphWidget.updateGraph(newState, 500);
  }

  this.bfs = function(sourceVertex) {
    for (var keyy in internalAdjList)
      internalAdjList[keyy]["extratext"] = "";

    var key;
    var i;
    var notVisited = {};
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}, crossEdge = {};
    var stateList = [];
    var cs;

    // error checks
    if (amountVertex == 0) { // no graph
      $('#bfs-err').html("请先创建一个图。");
      return false;
    }

    if (sourceVertex >= amountVertex) { // source vertex not in range
      $('#bfs-err').html("该元素不存在，请重新输入。");
      return false;
    }

    var p = {};
    for (var i = 0; i < amountVertex; i++)
      p[i] = -1;

    for (key in internalAdjList)
      internalAdjList[key]["state"] = VERTEX_DEFAULT;

    vertexHighlighted[sourceVertex] = true;
    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
            treeEdge, backEdge, crossEdge, forwardEdge);
    cs["status"] = '从 s = ' + sourceVertex + ' 开始。<br>记录 d[' + sourceVertex + '] = 0。';
    cs["lineNo"] = 1;
    stateList.push(cs);
    delete vertexHighlighted[sourceVertex];

    var q = [], EdgeProcessed = 0;
    q.push(sourceVertex);
    p[sourceVertex] = -2;

    function is_parent(u, v) {
      while (v >= 0) {
        if (u == v)
          return true;
        v = p[v];
      }
      return false;
    }

    while (q.length > 0) {
      delete vertexTraversing[q[0]];
      vertexHighlighted[q[0]] = true;
      cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing, treeEdge, backEdge, crossEdge, forwardEdge);
      cs["status"] = '当前待遍历队列为 {' + q + '}.<br>探测元素 u = ' + q[0] + ' 的邻结元素。';
      cs["lineNo"] = 2;
      stateList.push(cs);

      var u = q.shift(); // front most item
      vertexTraversed[u] = true;

      var nei = [];
      for (var j = 0; j < amountEdge; j++)
        if (u == internalEdgeList[j]["vertexA"])
          nei.push(j);

      nei.sort(function(a, b) {
        return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
      });

      while (nei.length > 0) {
        var j = nei.shift();
        var vertexA = internalEdgeList[j]["vertexA"];
        var vertexB = internalEdgeList[j]["vertexB"];
        if (u == vertexA) {
          EdgeProcessed = EdgeProcessed + 1;
          var thisStatus = '通过边(' + vertexA + ',' + vertexB + '), 边的总遍历次数为 ' + EdgeProcessed + '。';
          if (backEdge[j] == null && crossEdge[j] == null) {
            edgeHighlighted[j] = true;
            for (var z = 0; z < amountEdge; z ++)
              if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                edgeHighlighted[z] = true;
          }
          cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing, treeEdge, backEdge, crossEdge, forwardEdge);
          cs["status"] = thisStatus;
          cs["lineNo"] = [3, 4];
          cs["el"][j]["animateHighlighted"] = true;
          stateList.push(cs);
          if (p[vertexB] == -1) {
            p[vertexB] = vertexA;
            thisStatus = thisStatus + '.<br>' + vertexB + ' 尚未被访问, 记录 p[' + vertexB + '] = ' + p[vertexB] + '。';
            q.push(vertexB);
            vertexTraversing[vertexB] = true;
          }
          else if (p[u] == vertexB)
            thisStatus = thisStatus + '<br>无变更。';
          else {
            thisStatus = thisStatus + '.<br>' + vertexB + ' is visited.';
            if (is_parent(vertexB, u)) {
              thisStatus = thisStatus + '该边为后向边(backEdge)，指向祖先节点。'
              backEdge[j] = true;
              for (var z = 0; z < amountEdge; z ++)
                if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                  backEdge[z] = true;
            }
            else {
              thisStatus = thisStatus + '该边为横叉边(crossEdge)，指向无关节点。'
              crossEdge[j] = true;
              for (var z = 0; z < amountEdge; z ++)
                if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                  crossEdge[z] = true;
            }
            delete edgeHighlighted[j];
            for (var z = 0; z < amountEdge; z ++)
              if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                delete edgeHighlighted[z];
          }
          cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing, treeEdge, backEdge, crossEdge, forwardEdge);
          cs["status"] = thisStatus;
          cs["lineNo"] = [3, 4];
          stateList.push(cs);
        }
      }
      delete vertexHighlighted[u];
    }

    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing, treeEdge, backEdge, crossEdge, forwardEdge);
    cs["status"] = '广度优先遍历完成，橙色边构成广度优先遍历生成树。<br>绿色，蓝色边分别为横叉边(crossEdge)和后向边(backEdge)。';
    stateList.push(cs);

    // console.log(stateList);

    populatePseudocode(0);
    graphWidget.startAnimation(stateList);
    return true;
  }

  this.dfs = function(sourceVertex) {
    for (var keyy in internalAdjList)
      internalAdjList[keyy]["extratext"] = "";
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}, crossEdge = {};
    var stateList = [];
    var cs;

    // error checks
    if (amountVertex == 0) { // no graph
      $('#dfs-err').html("请先创建一个图。");
      return false;
    }

    if (sourceVertex >= amountVertex || sourceVertex < 0) { // source vertex not in range
      $('#dfs-err').html("该元素不存在，请重新输入。");
      return false;
    }

        var p = {}, low = {}, num = {}, Count = 0;
        for (var i = 0; i < amountVertex; i++)
            p[i] = -1;
        p[sourceVertex] = -2;
        function is_parent(u, v) {
            while (v >= 0) {
                if (u == v)
                    return true;
                v = p[v];
            }
            return false
        }

        function dfsRecur(u) {
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge);
            cs["status"] = "DFS( " + u + " )";
            cs["lineNo"] = 1;
            stateList.push(cs);
            delete vertexHighlighted[u];

            vertexTraversing[u] = true;
            num[u] = low[u] = ++Count;

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (!backEdge[j] && !crossEdge[j] && !forwardEdge[j]) {
                    edgeHighlighted[j] = true;
                    treeEdge[j] = true;
                    for (var z = 0; z < amountEdge; z ++)
                        if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                            edgeHighlighted[z] = true, treeEdge[z] = true;
                }
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge);
                cs["status"] = "尝试边 " + u + " -> " + vertexB;
                cs["lineNo"] = 2;
                cs["el"][j]["animateHighlighted"] = true;
                stateList.push(cs);

                if (p[vertexB] == -1) {
                    vertexTraversing[vertexB] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge);
                    cs["lineNo"] = [3, 4];
                    cs["status"] = "尝试边 " + u + " -> " + vertexB + "<br>" + vertexB + " 尚未被访问, 为树边(treeEdge)";
                    stateList.push(cs);

                    p[vertexB] = u;
                    dfsRecur(vertexB);
                    if (low[u] > low[vertexB])
                        low[u] = low[vertexB];
                    for (var z = 0; z < amountEdge; z ++)
                        if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                            delete edgeHighlighted[z];
                    delete edgeHighlighted[j];
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge);
                    cs["status"] = "DFS " + vertexB + " 已完成, <br>DFS( " + u + " )";
                    cs["lineNo"] = 1;
                    stateList.push(cs);
                } else if (p[u] != vertexB && !backEdge[j] && !crossEdge[j] && !forwardEdge[j]) {
                    if (low[u] > num[vertexB])
                        low[u] = num[vertexB];
                    for (var z = 0; z < amountEdge; z ++)
                        if (z == j || (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)) {
                            if (!DIRECTED_GR)
                                backEdge[z] = true;
                            else {
                                if (is_parent(vertexB, u))
                                    backEdge[z] = true;
                                else if (is_parent(u, vertexB))
                                    forwardEdge[z] = true;
                                else
                                    crossEdge[z] = true;
                            }
                        }
                    for (var z = 0; z < amountEdge; z ++)
                        if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                            delete edgeHighlighted[z];
                    delete edgeHighlighted[j];
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge);
                    var thisStatus = "尝试边 " + u + " -> " + vertexB + "<br>元素 " + vertexB + " 已经被访问，是";
                    if (backEdge[j])
                        thisStatus = thisStatus + "后向边(backEdge)。";
                    else if (forwardEdge[j])
                        thisStatus = thisStatus + "前向边(forwardEdge)。";
                    else
                        thisStatus = thisStatus + "横叉边(crossEdge)。";
                    cs["status"] = thisStatus;
                    cs["lineNo"] = 5;
                    stateList.push(cs);
                } else {
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge);
                    cs["status"] = "尝试边 " + u + " -> " + vertexB + "<br>" + vertexB + " 已经被访问,无变更。";
                    cs["lineNo"] = 5;
                    stateList.push(cs);
                }
            }
            vertexTraversed[u] = true;
            delete vertexTraversing[u];
        }
        dfsRecur(sourceVertex);

        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge);
        cs["status"] = "深度优先遍历完成，红色边构成深度优先遍历生成树。绿色、灰色、蓝色分别为横叉边、前向边、后向边，蓝色边构成循环。";
        cs["lineNo"] = 0;
        stateList.push(cs);

        console.log(stateList);
        populatePseudocode(4);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.bridge = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var vertexHighlighted = {}, edgeHighlighted = {};
        var vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
        crossEdge = {}, hiddenEdge = {}, Bridgess = {}, articulationPoint = {};
        var stateList = [];
        var cs;

        //check error
        if (DIRECTED_GR) {
            $('#bridge-err').html("请构造一个无向图。");
            return false;
        }
        if (amountVertex == 0) { // no graph
            $('#bridge-err').html("There is no graph to run this on. Please select a sample graph first.");
            return false;
        }

        // main code
        var p = {}, stack = {}, stackNum = -1, Count = -1, low = {}, num = {}, lab = {}, labNum = 0;
        var ROOT, chilNum = {};
        for (var i = 0; i < amountVertex; i++) {
            p[i] = lab[i] = -1, chilNum[i] = 0;
            internalAdjList[i]["extratext"] = "N/A";
        }
        for (var i = 0; i < amountVertex; i ++)
            if (p[i] == -1) {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = "Vertex " + i + " hasn't been visited<br>DfsCount = " + Count;
                cs["lineNo"] = 1;
                stateList.push(cs);
                p[i]--;
                ROOT = i;
                Tdfs(i);
            }

        function Tdfs(u) {
            stack[++stackNum] = u;
            num[u] = low[u] = ++Count;
            internalAdjList[u]["extratext"] = "" + num[u] + "," + low[u];
            vertexTraversing[u] = true;
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "DFS(" + u + ")<br>DfsCount = " + Count;
            cs["lineNo"] = 2;
            stateList.push(cs);
            delete vertexHighlighted[u];

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (lab[vertexB] == -1 && u == vertexA) {
                    edgeHighlighted[j] = true;
                    for (var z = 0; z < amountEdge; z ++)
                        if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                            edgeHighlighted[z] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = "Try edge " + vertexA + " -> " + vertexB + "<br>DfsCount = " + Count;
                    cs["lineNo"] = 3;
                    cs["el"][j]["animateHighlighted"] = true;
                    for (var key in Bridgess) {
                        cs["el"][key]["state"] = EDGE_GREEN;
                        for (var z = 0; z < amountEdge; z ++)
                            if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                    && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                cs["el"][z]["state"] = EDGE_GREEN;
                    }
                    for (var key in articulationPoint)
                        cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                    stateList.push(cs);

                    if (p[vertexB] == -1) {
                        vertexTraversing[vertexB] = true;
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "" + vertexB + " hasn't been visited<br>DfsCount = " + Count;
                        cs["lineNo"] = 4;
                        for (var key in Bridgess) {
                            cs["el"][key]["state"] = EDGE_GREEN;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                    cs["el"][z]["state"] = EDGE_GREEN;
                        }
                        for (var key in articulationPoint)
                            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                        stateList.push(cs);

                        p[vertexB] = u;
                        Tdfs(vertexB);
                        chilNum[u]++;
                        if (low[u] > low[vertexB])
                            low[u] = low[vertexB];
                        internalAdjList[u]["extratext"] = "" + num[u] + "," + low[u];

                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "update low[" + u + "] from low[" + vertexB + "]<br>DfsCount = " + Count;
                        cs["lineNo"] = 5;
                        for (var key in Bridgess) {
                            cs["el"][key]["state"] = EDGE_GREEN;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                    cs["el"][z]["state"] = EDGE_GREEN;
                        }
                        for (var key in articulationPoint)
                            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                        stateList.push(cs);

                        var thisStatus = "";
                        if (low[vertexB] >= num[u] && u != ROOT) {
                            thisStatus = thisStatus + "low[" + vertexB + "] >= num[" + u + "] and " + u + " is not the root, " + u + " is an articulation point.<br>";
                            articulationPoint[u] = true;
                        } else if (low[vertexB] >= num[u] && u == ROOT) {
                            thisStatus = thisStatus + "low[" + vertexB + "] >= num[" + u + "] but " + u + " is the root, no articulation point.<br>";
                        } else
                            thisStatus = thisStatus + "low[" + vertexB + "] < num[" + u + "], no articulation point.<br>";

                        if (low[vertexB] > num[u]) {
                            thisStatus = thisStatus + "low[" + vertexB + "] > num[" + u + "], " + u + "-" + vertexB + " is a bridge.";
                            Bridgess[j] = true;
                        } else
                            thisStatus = thisStatus + "low[" + vertexB + "] <= num[" + u + "], " + u + "-" + vertexB + " is not a bridge.";

                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = thisStatus;
                        cs["lineNo"] = 6;
                        for (var key in Bridgess) {
                            cs["el"][key]["state"] = EDGE_GREEN;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                    cs["el"][z]["state"] = EDGE_GREEN;
                        }
                        for (var key in articulationPoint)
                            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                        stateList.push(cs);

                    } else if (vertexB != p[u]) {
                        if (low[u] > num[vertexB])
                            low[u] = num[vertexB];
                        internalAdjList[u]["extratext"] = "" + num[u] + "," + low[u];
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "" + vertexB + " is visited, update low[" + u + "] from num[" + vertexB + "]<br>DfsCount = " + Count;
                        cs["lineNo"] = 7;
                        for (var key in Bridgess) {
                            cs["el"][key]["state"] = EDGE_GREEN;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                    cs["el"][z]["state"] = EDGE_GREEN;
                        }
                        for (var key in articulationPoint)
                            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                        stateList.push(cs);
                    } else {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "" + vertexB + " is the parent of " + u + ", ignore!<br>DfsCount = " + Count;
                        cs["lineNo"] = 7;
                        for (var key in Bridgess) {
                            cs["el"][key]["state"] = EDGE_GREEN;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                                    cs["el"][z]["state"] = EDGE_GREEN;
                        }
                        for (var key in articulationPoint)
                            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
                        stateList.push(cs);
                    }
                }
            }
            delete vertexTraversing[u];
            vertexHighlighted[u] = true;
            vertexTraversed[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "Finish DFS(" + u + "), back track.<br>DfsCount = " + Count;
            if (u == ROOT && chilNum[u] >= 2) {
                cs["status"] = "Finish DFS(" + u + "), " + u + " is the root and u has more than 1 childs<br>Hence " + u + " is an articulation point.";
                articulationPoint[u] = true;
            }
            cs["lineNo"] = 0;
            for (var key in Bridgess) {
                cs["el"][key]["state"] = EDGE_GREEN;
                for (var z = 0; z < amountEdge; z ++)
                    if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                            && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                        cs["el"][z]["state"] = EDGE_GREEN;
            }
            for (var key in articulationPoint)
                cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
            cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
            stateList.push(cs);
            delete vertexHighlighted[u];
        }

        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        cs["status"] = "Finished.<br>Green ones are articulation points and bridges.";
        cs["lineNo"] = 0;
        for (var key in Bridgess) {
            cs["el"][key]["state"] = EDGE_GREEN;
            for (var z = 0; z < amountEdge; z ++)
                if (internalEdgeList[z]["vertexA"] == internalEdgeList[key]["vertexB"]
                        && internalEdgeList[z]["vertexB"] == internalEdgeList[key]["vertexA"])
                    cs["el"][z]["state"] = EDGE_GREEN;
        }
        for (var key in articulationPoint)
            cs["vl"][key]["state"] = VERTEX_GREEN_OUTLINE;
        stateList.push(cs);

        console.log(stateList);
        populatePseudocode(1);
        graphWidget.startAnimation(stateList);
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        return true;
    }

    this.tarjan = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var vertexHighlighted = {}, edgeHighlighted = {};
        var vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
        crossEdge = {}, hiddenEdge = {};
        var stateList = [];
        var cs;

        //check error
        if (!DIRECTED_GR) {
            $('#scc-err').html("Please make the graph directed");
            return false;
        }
        if (amountVertex == 0) { // no graph
            $('#scc-err').html("There is no graph to run this on. Please select a sample graph first.");
            return false;
        }

        // main code
        var p = {}, stack = {}, stackNum = -1, Count = 0, low = {}, num = {}, lab = {}, labNum = 0;
        for (var i = 0; i < amountVertex; i++) {
            p[i] = lab[i] = -1
            internalAdjList[i]["extratext"] = "N/A";
        }
        for (var i = 0; i < amountVertex; i ++)
            if (p[i] == -1) {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = "Vertex " + i + " hasn't been visited";
                cs["lineNo"] = 1;
                stateList.push(cs);
                p[i]--;
                Tdfs(i);
            }

        function getStack() {
            var status = "Stack = [";
            for (var i = 0; i < stackNum; i ++)
                status = status + stack[i] + ",";
            if (stackNum >= 0)
                status = status + stack[stackNum] + "]";
            else
                status = status + "]";
            return status;
        }
        function Tdfs(u) {
            stack[++stackNum] = u;
            num[u] = low[u] = ++Count;
            internalAdjList[u]["extratext"] = "" + num[u] + "," + low[u];
            vertexTraversing[u] = true;
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS(" + u + ")";
            cs["lineNo"] = 2;
            stateList.push(cs);
            delete vertexHighlighted[u];

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (lab[vertexB] == -1 && u == vertexA) {
                    edgeTraversed[j] = true;
                    edgeHighlighted[j] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = getStack() + "<br>try edge " + vertexA + " -> " + vertexB;
                    cs["lineNo"] = 3;
                    cs["el"][j]["animateHighlighted"] = true;
                    stateList.push(cs);

                    if (p[vertexB] == -1) {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = getStack() + "<br>" + vertexB + " hasn't been visited";
                        cs["lineNo"] = 4;
                        stateList.push(cs);

                        p[vertexB] = u;
                        Tdfs(vertexB);
                        if (low[u] > low[vertexB])
                            low[u] = low[vertexB];
                    } else {
                        if (low[u] > num[vertexB])
                            low[u] = num[vertexB];
                    }
                    internalAdjList[u]["extratext"] = "" + num[u] + "," + low[u];
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = getStack() + "<br>update low[" + u + "] from num[" + vertexB + "] and low[" + vertexB + "]";
                    cs["lineNo"] = 5;
                    stateList.push(cs);
                }
            }

            delete vertexTraversing[u];
            vertexTraversed[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS from " + u + " is completed, check the condition";
            cs["lineNo"] = [6, 7];
            stateList.push(cs);
            if (low[u] == num[u]) {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>low[" + u + "] == num[" + u + "]";
                cs["lineNo"] = 6;
                stateList.push(cs);
                var oldPos = stackNum;
                labNum++;
                while (stack[stackNum] != u)
                    lab[stack[stackNum--]] = labNum;
                lab[stack[stackNum--]] = labNum;

                for (var i = stackNum + 1; i <= oldPos; i ++)
                    vertexHighlighted[stack[i]] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>pop from stack until we get " + u;
                cs["lineNo"] = 7;
                stateList.push(cs);
                for (var i = stackNum + 1; i <= oldPos; i ++)
                    delete vertexHighlighted[stack[i]];

                for (var j = 0; j < amountEdge; j++) {
                    var vertexA = internalEdgeList[j]["vertexA"];
                    var vertexB = internalEdgeList[j]["vertexB"];
                    if (lab[vertexA] != lab[vertexB])
                        hiddenEdge[j] = true;
                }
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>We get 1 strong component";
                cs["lineNo"] = 7;
                stateList.push(cs);
            }
        }

        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        cs["status"] = "Finally we get " + labNum + " strong components";
        cs["lineNo"] = 1;
        stateList.push(cs);

        console.log(stateList);
        populatePseudocode(5);
        graphWidget.startAnimation(stateList);
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        return true;
    }

    this.kosaraju = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var vertexHighlighted = {}, edgeHighlighted = {};
        var vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
        crossEdge = {}, hiddenEdge = {};
        var stateList = [];
        var cs;

        //check error
        if (!DIRECTED_GR) {
            $('#scc-err').html("Please make the graph directed");
            return false;
        }
        if (amountVertex == 0) { // no graph
            $('#scc-err').html("There is no graph to run this on. Please select a sample graph first.");
            return false;
        }

        // main code
        var p = {}, stack = {}, stackNum = -1, Count = 0, low = {}, num = {}, lab = {}, labNum = 0;
        for (var i = 0; i < amountVertex; i ++)
            p[i] = lab[i] = -1
        for (var i = 0; i < amountVertex; i ++)
            if (p[i] == -1) {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = "Vertex " + i + " hasn't been visited";
                cs["lineNo"] = 1;
                stateList.push(cs);
                p[i]--;
                Tdfs(i);
            }

        vertexHighlighted = {}, edgeHighlighted = {};
        vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {};
        for (var j = 0; j < amountEdge; j++) {
            var vertexA = internalEdgeList[j]["vertexA"];
            var vertexB = internalEdgeList[j]["vertexB"];
            internalEdgeList[j]["vertexA"] = vertexB;
            internalEdgeList[j]["vertexB"] = vertexA;
        }
        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        cs["status"] = "Transpose the graph";
        cs["lineNo"] = 4;
        stateList.push(cs);

        while (stackNum >= 0) {
            if (lab[stack[stackNum]] == -1) {
                labNum++;
                DFS2(stack[stackNum]);
                for (var j = 0; j < amountEdge; j++) {
                    var vertexA = internalEdgeList[j]["vertexA"];
                    var vertexB = internalEdgeList[j]["vertexB"];
                    if (lab[vertexA] != lab[vertexB])
                        hiddenEdge[j] = true;
                }

                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>Finish DFS from " + stack[stackNum] + ". We get 1 strong component.";
                cs["lineNo"] = 7;
                stateList.push(cs);
            } else {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>" + stack[stackNum] + " is visited, ignore";
                cs["lineNo"] = 5;
                stateList.push(cs);
            }
            stackNum--;
        }

        function getStack() {
            var status = "List = [";
            for (var i = stackNum; i > 0; i --)
                status = status + stack[i] + ",";
            if (stackNum >= 0)
                status = status + stack[0] + "]";
            else
                status = status + "]";
            return status;
        }
        function Tdfs(u) {
            vertexTraversing[u] = true;
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS(" + u + ")";
            cs["lineNo"] = 1;
            stateList.push(cs);
            delete vertexHighlighted[u];

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (lab[vertexB] == -1 && u == vertexA) {
                    edgeTraversed[j] = true;
                    edgeHighlighted[j] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["el"][j]["animateHighlighted"] = true;
                    cs["status"] = getStack() + "<br>try edge " + vertexA + " -> " + vertexB;
                    cs["lineNo"] = 2;
                    stateList.push(cs);

                    if (p[vertexB] == -1) {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = getStack() + "<br>" + vertexB + " hasn't been visited";
                        cs["lineNo"] = 2;
                        stateList.push(cs);

                        p[vertexB] = u;
                        Tdfs(vertexB);
                    }
                }
            }
            stack[++stackNum] = u;
            delete vertexTraversing[u];
            vertexTraversed[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS from " + u + " is completed, add " + u + " to the list";
            cs["lineNo"] = 3;
            stateList.push(cs);
        }
        function DFS2(u) {
            lab[u] = labNum;
            vertexTraversing[u] = true;
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS(" + u + ")";
            cs["lineNo"] = 5;
            stateList.push(cs);
            delete vertexHighlighted[u];

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (hiddenEdge[j] == null) {
                    edgeTraversed[j] = true;
                    edgeHighlighted[j] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["el"][j]["animateHighlighted"] = true;
                    cs["status"] = getStack() + "<br>try edge " + vertexA + " -> " + vertexB;
                    cs["lineNo"] = 6;
                    stateList.push(cs);

                    if (lab[vertexB] == -1) {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = getStack() + "<br>" + vertexB + " hasn't been visited";
                        cs["lineNo"] = 6;
                        stateList.push(cs);

                        DFS2(vertexB);
                    } else {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = getStack() + "<br>" + vertexB + " is visited";
                        cs["lineNo"] = 6;
                        stateList.push(cs);
                    }
                }
            }

            delete vertexTraversing[u];
            vertexTraversed[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = getStack() + "<br>DFS from " + u + " is completed, back to the parent";
            cs["lineNo"] = 5;
            stateList.push(cs);
        }

        for (var i = 0; i < amountEdge; i++) {
            var vertexA = internalEdgeList[i]["vertexA"];
            var vertexB = internalEdgeList[i]["vertexB"];
            internalEdgeList[i]["vertexA"] = vertexB;
            internalEdgeList[i]["vertexB"] = vertexA;
        }
        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        cs["status"] = "Transpose again. Finally we get " + labNum + " strong components";
        cs["lineNo"] = 0;
        stateList.push(cs);

        console.log(stateList);
        populatePseudocode(6);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.bipartiteDfs = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var key;
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {};
        var stateList = [];
        var cs;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#bipartite-err').html("There is no graph to run this on. Please select a sample graph first.");
            return false;
        }
        if (DIRECTED_GR) {
            $('#bipartite-err').html("Please make the graph undirected");
            return false;
        }

        var p = {};
        var flag = false;
        for (var i = 0; i < amountVertex; i++)
            p[i] = -1;
        for (var i = 0; i < amountVertex; i++)
            if (p[i] == -1) {
                vertexTraversed[i] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                cs["status"] = "Vertex " + i + " is unvisited";
                cs["lineNo"] = 1;
                if (vertexTraversed[i] != null)
                    cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
                else
                    cs["vl"][i]["state"] = VERTEX_BLUE_FILL;
                stateList.push(cs);
                p[i] = -2;
                dfsRecur(i);
                if (flag)
                    break;
            }
        function dfsRecur(u) {
            if (flag)
                return;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
            cs["status"] = "DFS( " + u + " )";
            cs["lineNo"] = 2;
            if (vertexTraversed[u] != null)
                cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
            else
                cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
            stateList.push(cs);

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                if (edgeHighlighted[j] == null) {
                    var vertexA = internalEdgeList[j]["vertexA"];
                    var vertexB = internalEdgeList[j]["vertexB"];
                    if (u == vertexA) {
                        for (var z = 0; z < amountEdge; z ++)
                            if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                                edgeHighlighted[z] = true;
                        edgeHighlighted[j] = true;
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                        cs["status"] = "Try edge " + u + " -> " + vertexB;
                        cs["el"][j]["animateHighlighted"] = true;
                        cs["lineNo"] = 3;
                        if (vertexTraversed[u] != null)
                            cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                        else
                            cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                        stateList.push(cs);

                        if (p[vertexB] == -1) {
                            if (vertexTraversed[u] == null)
                                vertexTraversed[vertexB] = true;
                            else
                                vertexTraversing[vertexB] = true;
                            p[vertexB] = u;
                            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                            cs["status"] = "Try edge " + u + " -> " + vertexB;
                            cs["lineNo"] = 4;
                            if (vertexTraversed[u] != null)
                                cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                            else
                                cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                            stateList.push(cs);
                            dfsRecur(vertexB);
                        } else {
                            var cu = 0, cv = 0;
                            if (vertexTraversing[u] != null)
                                cu = 1;
                            if (vertexTraversing[vertexB] != null)
                                cv = 1;
                            if (cu == cv) {
                                flag = true;
                                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                                cs["status"] = "Vertex " + u + " and vertex " + vertexB + " have the same color";
                                cs["lineNo"] = 5;
                                if (vertexTraversed[u] != null)
                                    cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                                else
                                    cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                                if (vertexTraversed[vertexB] != null)
                                    cs["vl"][vertexB]["state"] = VERTEX_HIGHLIGHTED;
                                else
                                    cs["vl"][vertexB]["state"] = VERTEX_BLUE_FILL;
                                stateList.push(cs);
                                break;
                            }
                        }
                        if (flag)
                            break;
                    }
                    if (flag)
                        break;
                }
            }
            if (flag)
                return;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
            cs["status"] = "Finish DFS(" + u + ")<br> Back to the parent";
            cs["lineNo"] = 2;
            if (vertexTraversed[u] != null)
                cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
            else
                cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
            stateList.push(cs);
        }

        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
        if (flag == false)
            cs["status"] = "This is a bipartite graph!";
        else
            cs["status"] = "This is NOT a bipartite graph!";
        cs["lineNo"] = 0;
        if (flag == true)
            cs["lineNo"] = 6;
        stateList.push(cs);


        console.log(stateList);
        populatePseudocode(8);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.bipartiteBfs = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var key;
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {};
        var stateList = [];
        var cs;
        var flag = true;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#bipartite-err').html("There is no graph to run this on. Please select a sample graph first.");
            return false;
        }
        if (DIRECTED_GR) {
            $('#bipartite-err').html("Please make the graph undirected");
            return false;
        }

        var p = {};
        for (var i = 0; i < amountVertex; i++)
            p[i] = -1;

        for (key in internalAdjList)
            internalAdjList[key]["state"] = VERTEX_DEFAULT;

        for (var s = 0; s < amountVertex; s ++)
            if (p[s] == -1) {
                p[s] = -2;
                vertexTraversed[s] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                cs["status"] = 'Vertex ' + s + ' is unvisited';
                cs["lineNo"] = 1;
                if (vertexTraversed[s] != null)
                    cs["vl"][s]["state"] = VERTEX_HIGHLIGHTED;
                else
                    cs["vl"][s]["state"] = VERTEX_BLUE_FILL;
                stateList.push(cs);

                var q = [];
                q.push(s);
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                cs["status"] = "Queue = [" + q + "]";
                cs["lineNo"] = 2;
                stateList.push(cs);

                while (q.length > 0) {
                    var u = q.shift();

                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                    cs["status"] = "Queue = [" + q + "]<br>Extract " + u + " from queue";
                    cs["lineNo"] = 3;
                    if (vertexTraversed[u] != null)
                        cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                    else
                        cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                    stateList.push(cs);

                    var nei = [];
                    for (var j = 0; j < amountEdge; j++)
                        if (u == internalEdgeList[j]["vertexA"])
                            nei.push(j);
                    nei.sort(function(a, b) {
                        return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
                    });

                    while (nei.length > 0) {
                        var j = nei.shift();
                        if (edgeHighlighted[j] == null) {
                            var vertexA = internalEdgeList[j]["vertexA"];
                            var vertexB = internalEdgeList[j]["vertexB"];
                            if (u == vertexA) {
                                edgeHighlighted[j] = true;
                                for (var z = 0; z < amountEdge; z ++)
                                    if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                                        edgeHighlighted[z] = true;
                                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                                cs["el"][j]["animateHighlighted"] = true;
                                cs["status"] = "Queue = [" + q + "]<br>Try edge " + vertexA + " -> " + vertexB;
                                cs["lineNo"] = 4;
                                if (vertexTraversed[u] != null)
                                    cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                                else
                                    cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                                stateList.push(cs);

                                if (p[vertexB] == -1) {
                                    p[vertexB] = vertexA;
                                    q.push(vertexB);
                                    if (vertexTraversed[u] != null)
                                        vertexTraversing[vertexB] = true;
                                    else
                                        vertexTraversed[vertexB] = true;

                                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                                    cs["status"] = "Queue = [" + q + "]<br>" + vertexB + " is free, push " + vertexB + " to queue";
                                    cs["lineNo"] = 6;
                                    if (vertexTraversed[u] != null)
                                        cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                                    else
                                        cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                                    stateList.push(cs);
                                } else {
                                    var cu = 0, cv = 0;
                                    if (vertexTraversing[u] != null)
                                        cu = 1;
                                    if (vertexTraversing[vertexB] != null)
                                        cv = 1;
                                    if (cu == cv) {
                                        flag = false;
                                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
                                        cs["status"] = "Vertex " + u + " and vertex " + vertexB + " have the same color";
                                        cs["lineNo"] = 5;
                                        if (vertexTraversed[u] != null)
                                            cs["vl"][u]["state"] = VERTEX_HIGHLIGHTED;
                                        else
                                            cs["vl"][u]["state"] = VERTEX_BLUE_FILL;
                                        if (vertexTraversed[vertexB] != null)
                                            cs["vl"][vertexB]["state"] = VERTEX_HIGHLIGHTED;
                                        else
                                            cs["vl"][vertexB]["state"] = VERTEX_BLUE_FILL;
                                        stateList.push(cs);
                                        break;
                                    }
                                }
                                if (flag == false)
                                    break;
                            }
                            if (flag == false)
                                break;
                        }
                        if (flag == false)
                            break;
                    }
                    if (flag == false)
                        break;
                }
                if (flag == false)
                    break;
            }

        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing);
        if (flag)
            cs["status"] = "This is a bipartite graph!";
        else
            cs["status"] = "This is NOT a bipartite graph!";
        cs["lineNo"] = 0;
        stateList.push(cs);

        console.log(stateList);

        populatePseudocode(7);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.toposortDfs = function() {
        for (var keyy in internalAdjList)
            internalAdjList[keyy]["extratext"] = "";
        var vertexHighlighted = {}, edgeHighlighted = {};
        var vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
        crossEdge = {}, hiddenEdge = {};
        var stateList = [];
        var cs;
        var flag = true;

        //check error
        if (!DIRECTED_GR) {
            $('#topo-err').html("请构造一个有向图。");
            return false;
        }
        if (amountVertex == 0) { // no graph
            $('#topo-err').html("请先创建一个图。");
            return false;
        }

        // main code
        var p = {}, stack = [], stackNum = -1;
        for (var i = 0; i < amountVertex; i ++)
            p[i] = -1
        for (var i = 0; i < amountVertex; i ++)
            if (p[i] == -1) {
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = "元素 " + i + " 尚未被访问";
                cs["lineNo"] = 1;
                stateList.push(cs);
                p[i]--;
                Tdfs(i);
            }

        function Tdfs(u) {
            if (flag == false)
                return;
            vertexTraversing[u] = true;
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "DFS(" + u + ")";
            cs["lineNo"] = 2;
            stateList.push(cs);
            delete vertexHighlighted[u];

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                if (u == vertexA) {
                    edgeTraversed[j] = true;
                    edgeHighlighted[j] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["el"][j]["animateHighlighted"] = true;
                    cs["status"] = "尝试边 " + vertexA + " -> " + vertexB + "<br>List =[" + stack + "]";
                    cs["lineNo"] = 3;
                    stateList.push(cs);

                    if (p[vertexB] == -1) {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "元素 " + vertexB + " 尚未被访问<br>List =[" + stack + "]";
                        cs["lineNo"] = [4, 5];
                        stateList.push(cs);

                        p[vertexB] = u;
                        Tdfs(vertexB);
                    } else {
                        var k = u;
                        while (k != -2) {
                            k = p[k];
                            if (k == vertexB)
                                flag = false;
                        }
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "元素" + vertexB + " 已经被访问<br>List =[" + stack + "]";
                        cs["lineNo"] = 6;
                        stateList.push(cs);
                    }
                }
            }
            stack.push(u);
            delete vertexTraversing[u];
            vertexTraversed[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "从 " + u + " 开始的DFS已完成,将 " + u + " 添加到List。<br>List =[" + stack + "]";
            cs["lineNo"] = 7;
            stateList.push(cs);
        }
        if (flag == false) { // not DAG
            $('#topo-err').html("该图不是DAG图。");
            return false;
        }
        vertexHighlighted = {}, edgeHighlighted = {};
        vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
        crossEdge = {}, hiddenEdge = {};
        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        stack.reverse();
        cs["status"] = "拓扑排序已完成。<br>队列List = [" + stack + "]";
        cs["lineNo"] = 0;
        stateList.push(cs);

        console.log(stateList);
        populatePseudocode(9);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.toposortBfs = function() {
        var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}, crossEdge = {}, hiddenEdge = {};
        var stateList = [];
        var cs, key;

        // error checks
        if (amountVertex == 0) { // no graph
            $('#topo-err').html("请先创建一个图。");
            return false;
        }
        if (!DIRECTED_GR) {
            $('#topo-err').html("请构造一个有向图。");
            return false;
        }

        var fr = {}, cc = {};
        for (var i = 0; i < amountVertex; i++)
            fr[i] = true, cc[i] = 0;
        for (var j = 0; j < amountEdge; j ++)
            cc[internalEdgeList[j]["vertexB"]]++;

        for (key in internalAdjList)
            internalAdjList[key]["state"] = VERTEX_DEFAULT,
                    internalAdjList[key]["extratext"] = "";

        var q = [], EdgeProcessed = 0, Lis = [];
        for (var i = 0; i < amountVertex; i ++)
            if (cc[i] == 0)
                q.push(i), vertexHighlighted[i] = vertexTraversing[i] = true;
        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge);
        cs["status"] = "Queue = [" + q + "]"
        cs["lineNo"] = 1;
        stateList.push(cs);
        for (var i = 0; i < amountVertex; i ++)
            if (cc[i] == 0)
                delete vertexHighlighted[i];

        while (q.length > 0) {
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "Queue = [" + q + "]";
            cs["lineNo"] = 2;
            stateList.push(cs);

            var u = q.shift(); // front most item
            Lis.push(u);
            vertexHighlighted[u] = true;
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "Pop vertex " + u + " from queue and add to the list<br>List = [" + Lis + "]";
            cs["lineNo"] = 3;
            stateList.push(cs);

            var nei = [];
            for (var j = 0; j < amountEdge; j++)
                if (u == internalEdgeList[j]["vertexA"])
                    nei.push(j);
            nei.sort(function(a, b) {
                return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
            });

            while (nei.length > 0) {
                var j = nei.shift();
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                cc[vertexB]--;

                hiddenEdge[j] = true;
                var thisStatus = 'Queue = [' + q + ']<br>Delete edge ' + vertexA + ' -> ' + vertexB;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = thisStatus;
                cs["lineNo"] = [4, 5];
                cs["el"][j]["animateHighlighted"] = true;
                stateList.push(cs);

                if (cc[vertexB] == 0) {
                    q.push(vertexB);
                    vertexTraversing[vertexB] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = "Queue = [" + q + "]<br>" + vertexB + " now has no incoming edge, add to queue.";
                    cs["lineNo"] = 6;
                    stateList.push(cs);
                } else {
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = "Queue = [" + q + "]<br>" + vertexB + " still has incoming edge, ignore.";
                    cs["lineNo"] = 6;
                    stateList.push(cs);
                }
            }
            delete vertexHighlighted[u];
            delete vertexTraversing[u];
            vertexTraversed[u] = true;
        }

        var thisStatus = "Kahn's algorithm is completed.<br>";
        var flag = true;
        for (var j = 0; j < amountEdge; j ++)
            if (hiddenEdge[j] == null) {
                flag = false;
                thisStatus += "Edge " + internalEdgeList[j]["vertexA"] + "->" + internalEdgeList[j]["vertexB"] + " hasn't been visited, the graph has cycle."
                break;
            }
        if (flag)
            thisStatus += "Topological order = [" + Lis + "]";
        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
        cs["lineNo"] = 7;
        cs["status"] = thisStatus;
        stateList.push(cs);

        console.log(stateList);

        populatePseudocode(3);
        graphWidget.startAnimation(stateList);
        return true;
    }

    this.twosat = function(numOfRows, numOfColumns) {
        var vertexHighlighted = {}, edgeHighlighted = {};
        var stateList = [];
        var cs;
        var currentX = 0, currentY = -170;
        var centerX = 200, centerY = 200;
        DIRECTED_GR = true;
        numOfColumns *= 2;
        var blocked = new Array(numOfRows + 1);
        for (var i = 0; i <= numOfRows; ++i) {
            blocked[i] = new Array(numOfColumns + 1);
            for (var j = 0; j <= numOfColumns; ++j)
                blocked[i][j] = false;
        }

        if (numOfRows < 1 || numOfColumns < 1) { // no graph
            $('#twosat-err').html("Invalid size.");
            return false;
        }

        this.checkInputt = function(XX) {
            var cc = 0;
            for (var j = 1; j <= numOfColumns; j ++)
                if (blocked[XX][j])
                    cc++;
            return cc;
        }

        this.checkInput = function() {
            for (var i = 1; i <= numOfRows; i++) {
                var cc = 0;
                for (var j = 1; j <= numOfColumns; j ++)
                    if (blocked[i][j])
                        cc++;
                if (cc != 2)
                    return false;
            }
            return true;
        }

        this.changeState = function(rowIndex, columnIndex) {
            var temp = '#cell' + rowIndex + columnIndex;
            if (blocked[rowIndex][columnIndex]) {
                $(temp).attr("bgcolor", "white");
                blocked[rowIndex][columnIndex] = false;
            } else {
                $(temp).attr("bgcolor", "black");
                blocked[rowIndex][columnIndex] = true;
            }
            if (this.checkInputt(rowIndex) > 2) {
                $('#twosat-board-err').html("Row " + rowIndex + " has more than 2 black cells.")
                        .delay(1000)
                        .queue(function(n) {
                            $(this).html("");
                            n();
                        });
            }
        }

        this.createGraph = function() {
            internalAdjList = {};
            internalEdgeList = {};
            amountEdge = 0;
            amountVertex = numOfColumns;

            getvar = function(i) {
                return i % 2 == 0 ? "-x" + (i / 2 + 1) : "x" + (i + 1) / 2;
            }
            getOpp = function(i) {
                return i % 2 == 0 ? i + 1 : i - 1;
            }

            for (var i = 1; i <= numOfColumns; ++i) {
                var angle = Math.acos(-1) * 2 / amountVertex;
                var x1 = currentX * Math.cos(angle) - currentY * Math.sin(angle);
                var y1 = currentX * Math.sin(angle) + currentY * Math.cos(angle);
                currentX = x1, currentY = y1;
                internalAdjList[i - 1] = {
                    "cx": currentX + centerX,
                    "cy": currentY + centerY,
                    "text": i - 1,
                    "extratext": i % 2 == 0 ? "x" + i / 2 : "-x" + (i + 1) / 2
                }
            }

            cs = createState(internalAdjList, internalEdgeList);
            cs["status"] = "Create 2 vertices for each variable.";
            cs["lineNo"] = 1;
            stateList.push(cs);

            for (var i = 1; i <= numOfRows; ++i) {
                var a, b;
                for (var j = 0; j < numOfColumns; j++)
                    if (blocked[i][j + 1])
                        a = j;
                for (var j = numOfColumns - 1; j >= 0; j--)
                    if (blocked[i][j + 1])
                        b = j;
                var pos1 = -1, pos2 = -1;
                var flag = true;
                for (var j = 0; j < amountEdge; j++)
                    if (internalEdgeList[j]["vertexA"] == getOpp(a) && internalEdgeList[j]["vertexB"] == b)
                        flag = false, pos1 = j;
                if (flag && getOpp(a) !== b) {
                    internalEdgeList[amountEdge++] = {
                        "vertexA": getOpp(a),
                        "vertexB": b
                    }
                    pos1 = amountEdge - 1;
                }

                flag = true;
                for (var j = 0; j < amountEdge; j++)
                    if (internalEdgeList[j]["vertexA"] == getOpp(b) && internalEdgeList[j]["vertexB"] == a)
                        flag = false, pos2 = j;
                if (flag && getOpp(b) !== a) {
                    internalEdgeList[amountEdge++] = {
                        "vertexA": getOpp(b),
                        "vertexB": a
                    }
                    pos2 = amountEdge - 1;
                }

                cs = createState(internalAdjList, internalEdgeList);
                cs["status"] = "Clause = " + getvar(a) + " or " + getvar(b)
                        + "<br>Create edge " + getvar(getOpp(a)) + "->" + getvar(b) + " (" + getOpp(a) + "->" + b + ") and "
                        + getvar(getOpp(b)) + "->" + getvar(a) + " (" + getOpp(b) + "->" + a + ")";
                cs["lineNo"] = 2;
                if (pos1 != -1)
                    cs["el"][pos1]["animateHighlighted"] = true;
                if (pos2 != -1)
                    cs["el"][pos2]["animateHighlighted"] = true;
                stateList.push(cs);
            }
            return true;
        }

        this.runAlgo = function() {
            var vertexHighlighted = {}, edgeHighlighted = {};
            var vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {}, treeEdge = {}, backEdge = {}, forwardEdge = {}
            crossEdge = {}, hiddenEdge = {};
            var cs;

            //check error
            if (!DIRECTED_GR) {
                $('#scc-err').html("Please make the graph directed");
                return false;
            }
            if (amountVertex == 0) { // no graph
                $('#scc-err').html("There is no graph to run this on. Please select a sample graph first.");
                return false;
            }

            // main code
            var p = {}, stack = {}, stackNum = -1, Count = 0, low = {}, num = {}, lab = {}, labNum = 0;
            for (var i = 0; i < amountVertex; i ++)
                p[i] = lab[i] = -1
            for (var i = 0; i < amountVertex; i ++)
                if (p[i] == -1) {
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = "Vertex " + i + " hasn't been visited";
                    cs["lineNo"] = 3;
                    stateList.push(cs);
                    p[i]--;
                    Tdfs(i);
                }

            vertexHighlighted = {}, edgeHighlighted = {};
            vertexTraversed = {}, edgeTraversed = {}, vertexTraversing = {};
            for (var j = 0; j < amountEdge; j++) {
                var vertexA = internalEdgeList[j]["vertexA"];
                var vertexB = internalEdgeList[j]["vertexB"];
                internalEdgeList[j]["vertexA"] = vertexB;
                internalEdgeList[j]["vertexB"] = vertexA;
            }
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "Transpose the graph";
            cs["lineNo"] = 3;
            stateList.push(cs);

            while (stackNum >= 0) {
                if (lab[stack[stackNum]] == -1) {
                    labNum++;
                    DFS2(stack[stackNum]);
                    for (var j = 0; j < amountEdge; j++) {
                        var vertexA = internalEdgeList[j]["vertexA"];
                        var vertexB = internalEdgeList[j]["vertexB"];
                        if (lab[vertexA] != lab[vertexB]) {
                            hiddenEdge[j] = true;
                            for (var z = 0; z < amountEdge; z ++)
                                if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                                    hiddenEdge[z] = true;
                        }
                    }

                    for (var z = 0; z < amountVertex; z ++)
                        if (lab[z] == labNum)
                            vertexHighlighted[z] = true;

                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = "Finish DFS from " + stack[stackNum] + ". We get 1 strong component.<br> check the condition";
                    cs["lineNo"] = 4;
                    stateList.push(cs);

                    var flag = -1;
                    for (var z = 0; z < amountVertex; z += 2)
                        if (lab[z] == lab[z + 1] && lab[z] == labNum)
                            flag = z;
                    if (flag == -1) {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "No change.";
                        cs["lineNo"] = 4;
                        stateList.push(cs);
                    } else {
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["status"] = "" + getvar(flag) + " (vertex " + flag + ") and " + getvar(flag + 1) + " (vertex " + (flag + 1) + ") are in the same scc. <br>Not satisfiable!";
                        cs["lineNo"] = 0;
                        stateList.push(cs);
                        return true;
                    }
                    for (var z = 0; z < amountVertex; z ++)
                        if (lab[z] == labNum)
                            delete vertexHighlighted[z];
                } else {
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["status"] = getStack() + "<br>" + stack[stackNum] + " is visited, ignore";
                    cs["lineNo"] = 3;
                    stateList.push(cs);
                }
                stackNum--;
            }

            function getStack() {
                var status = "List = [";
                for (var i = stackNum; i > 0; i --)
                    status = status + stack[i] + ",";
                if (stackNum >= 0)
                    status = status + stack[0] + "]";
                else
                    status = status + "]";
                return status;
            }
            function Tdfs(u) {
                vertexTraversing[u] = true;
                vertexHighlighted[u] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>DFS(" + u + ")";
                cs["lineNo"] = 3;
                stateList.push(cs);
                delete vertexHighlighted[u];

                var nei = [];
                for (var j = 0; j < amountEdge; j++)
                    if (u == internalEdgeList[j]["vertexA"])
                        nei.push(j);
                nei.sort(function(a, b) {
                    return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
                });

                while (nei.length > 0) {
                    var j = nei.shift();
                    var vertexA = internalEdgeList[j]["vertexA"];
                    var vertexB = internalEdgeList[j]["vertexB"];
                    edgeHighlighted[j] = true;
                    for (var z = 0; z < amountEdge; z ++)
                        if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                            edgeHighlighted[z] = true;
                    cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                            treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                    cs["el"][j]["animateHighlighted"] = true;
                    cs["status"] = getStack() + "<br>try edge " + vertexA + " -> " + vertexB;
                    cs["lineNo"] = 3;
                    stateList.push(cs);
                    if (lab[vertexB] == -1 && u == vertexA) {
                        if (p[vertexB] == -1) {
                            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                            cs["status"] = getStack() + "<br>" + vertexB + " hasn't been visited";
                            cs["lineNo"] = 3;
                            stateList.push(cs);

                            p[vertexB] = u;
                            Tdfs(vertexB);
                        }
                    }
                }
                stack[++stackNum] = u;
                delete vertexTraversing[u];
                vertexTraversed[u] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>DFS from " + u + " is completed, add " + u + " to the list";
                cs["lineNo"] = 3;
                stateList.push(cs);
            }
            function DFS2(u) {
                lab[u] = labNum;
                vertexTraversing[u] = true;
                vertexHighlighted[u] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>DFS(" + u + ")";
                cs["lineNo"] = 3;
                stateList.push(cs);
                delete vertexHighlighted[u];

                var nei = [];
                for (var j = 0; j < amountEdge; j++)
                    if (u == internalEdgeList[j]["vertexA"])
                        nei.push(j);
                nei.sort(function(a, b) {
                    return internalEdgeList[a]["vertexB"] - internalEdgeList[b]["vertexB"]
                });

                while (nei.length > 0) {
                    var j = nei.shift();
                    var vertexA = internalEdgeList[j]["vertexA"];
                    var vertexB = internalEdgeList[j]["vertexB"];
                    if (hiddenEdge[j] == null) {
                        edgeTraversed[j] = true;
                        edgeHighlighted[j] = true;
                        for (var z = 0; z < amountEdge; z ++)
                            if (internalEdgeList[z]["vertexA"] == vertexB && internalEdgeList[z]["vertexB"] == vertexA)
                                edgeHighlighted[z] = edgeTraversed[z] = true;
                        cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                        cs["el"][j]["animateHighlighted"] = true;
                        cs["status"] = getStack() + "<br>try edge " + vertexA + " -> " + vertexB;
                        cs["lineNo"] = 3;
                        stateList.push(cs);

                        if (lab[vertexB] == -1) {
                            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                            cs["status"] = getStack() + "<br>" + vertexB + " hasn't been visited";
                            cs["lineNo"] = 3;
                            stateList.push(cs);

                            DFS2(vertexB);
                        } else {
                            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                            cs["status"] = getStack() + "<br>" + vertexB + " is visited";
                            cs["lineNo"] = 3;
                            stateList.push(cs);
                        }
                    }
                }

                delete vertexTraversing[u];
                vertexTraversed[u] = true;
                cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                        treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
                cs["status"] = getStack() + "<br>DFS from " + u + " is completed, back to the parent";
                cs["lineNo"] = 3;
                stateList.push(cs);
            }

            for (var i = 0; i < amountEdge; i++) {
                var vertexA = internalEdgeList[i]["vertexA"];
                var vertexB = internalEdgeList[i]["vertexB"];
                internalEdgeList[i]["vertexA"] = vertexB;
                internalEdgeList[i]["vertexB"] = vertexA;
            }
            cs = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing,
                    treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge);
            cs["status"] = "SCC algorithm is completed.<br>The problem is satisfiable!!";
            cs["lineNo"] = [5, 6];
            stateList.push(cs);
        }

        this.CloseBox = function() {
            $('.overlays').hide("slow");
            $('#dark-overlay').hide("slow");
            $('#rookattack-board').hide("slow");
        }

        this.inputExample1 = function() {
            numOfRows = 2;
            numOfColumns = 4;
            blocked = new Array(numOfRows + 1);
            for (var i = 0; i <= numOfRows; ++i) {
                blocked[i] = new Array(numOfColumns + 1);
                for (var j = 0; j <= numOfColumns; ++j)
                    blocked[i][j] = false;
            }
            var toWrite = '<html>\n';
            toWrite += '<br>Click on any cell to toggle between black/white cell</br>\n';
            toWrite += '<br>Each black cell presents a clause. Each row should have exactly 2 black cells.</br>\n';
            toWrite += '<table border="1" id="board">'
            for (var j = 0; j <= numOfColumns; ++j)
                toWrite += '<col width="50">';

            toWrite += '<tr><td height="50" bgcolor="white" id="cell00"></td>';
            for (var j = 1; j <= numOfColumns; j++)
                if (j % 2 == 1)
                    toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">-x' + (j + 1) / 2 + '</td>';
                else
                    toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">x' + j / 2 + '</td>';
            toWrite += "</tr>"

            for (var i = 1; i <= numOfRows; ++i) {
                toWrite += '<tr>';
                toWrite += '<td height="50" bgcolor="white" id="cell00">' + i + '</td>';
                for (var j = 1; j <= numOfColumns; ++j)
                    toWrite += '<td height="50" bgcolor="white" id="cell' + i + j + '" onclick=gtWidget.changeState(' + i + ',' + j + ')></td>';
                toWrite += '</tr>';
            }

            toWrite += '</table>\n';
            toWrite += '<button onclick=gtWidget.inputRandomized()>Randomized</button>';
            toWrite += '<button onclick=gtWidget.inputFinished()>Done</button>';
            toWrite += '<button onclick=gtWidget.inputExample1()>Example 1</button>';
            toWrite += '<button onclick=gtWidget.inputExample2()>Example 2</button>';
            toWrite += '<button onclick=gtWidget.CloseBox()>Close</button>';
            toWrite += '<div id="twosat-board-err" class="err"></div>';
            toWrite += '</html>\n';
            $('#twosat-board').html(toWrite);

            this.changeState(1, 1);
            this.changeState(1, 3);
            this.changeState(2, 2);
            this.changeState(2, 4);
        }
        this.inputExample2 = function() {
            numOfRows = 4;
            numOfColumns = 6;
            blocked = new Array(numOfRows + 1);
            for (var i = 0; i <= numOfRows; ++i) {
                blocked[i] = new Array(numOfColumns + 1);
                for (var j = 0; j <= numOfColumns; ++j)
                    blocked[i][j] = false;
            }
            var toWrite = '<html>\n';
            toWrite += '<br>Click on any cell to toggle between black/white cell</br>\n';
            toWrite += '<br>Each black cell presents a clause. Each row should have exactly 2 black cells.</br>\n';
            toWrite += '<table border="1" id="board">'
            for (var j = 0; j <= numOfColumns; ++j)
                toWrite += '<col width="50">';

            toWrite += '<tr><td height="50" bgcolor="white" id="cell00"></td>';
            for (var j = 1; j <= numOfColumns; j++)
                if (j % 2 == 1)
                    toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">-x' + (j + 1) / 2 + '</td>';
                else
                    toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">x' + j / 2 + '</td>';
            toWrite += "</tr>"

            for (var i = 1; i <= numOfRows; ++i) {
                toWrite += '<tr>';
                toWrite += '<td height="50" bgcolor="white" id="cell00">' + i + '</td>';
                for (var j = 1; j <= numOfColumns; ++j)
                    toWrite += '<td height="50" bgcolor="white" id="cell' + i + j + '" onclick=gtWidget.changeState(' + i + ',' + j + ')></td>';
                toWrite += '</tr>';
            }

            toWrite += '</table>\n';
            toWrite += '<button onclick=gtWidget.inputRandomized()>Randomized</button>';
            toWrite += '<button onclick=gtWidget.inputFinished()>Done</button>';
            toWrite += '<button onclick=gtWidget.inputExample1()>Example 1</button>';
            toWrite += '<button onclick=gtWidget.inputExample2()>Example 2</button>';
            toWrite += '<button onclick=gtWidget.CloseBox()>Close</button>';
            toWrite += '<div id="twosat-board-err" class="err"></div>';
            toWrite += '</html>\n';
            $('#twosat-board').html(toWrite);

            this.changeState(1, 2);
            this.changeState(1, 4);
            this.changeState(2, 1);
            this.changeState(2, 4);
            this.changeState(3, 3);
            this.changeState(3, 6);
            this.changeState(4, 3);
            this.changeState(4, 5);
        }
        this.inputFinished = function() {
            if (!this.checkInput()) {
                $('#twosat-board-err').html("Each row should have exactly 2 black cells.")
                        .delay(1000)
                        .queue(function(n) {
                            $(this).html("");
                            n();
                        });
                return false;
            }

            $('.overlays').hide("slow");
            $('#dark-overlay').hide("slow");
            $('#rookattack-board').hide("slow");
            this.createGraph();
            this.runAlgo();
            graphWidget.startAnimation(stateList);
            $('#current-action').show();
            $('#current-action p').html("Modeling()");
            $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
            triggerRightPanels();
            populatePseudocode(2);
            isPlaying = true;
            return true;
        }

  this.inputRandomized = function() {
    var randNumMin = 1;
    var randNumMax = numOfColumns;
    for (var i = 1; i <= numOfRows; ++i) {
      for (var j = 1; j <= numOfColumns; ++j)
        if (blocked[i][j])
          this.changeState(i, j);
      var a = (Math.floor(Math.random() * (randNumMax - randNumMin + 1)) + randNumMin);
      var b = (Math.floor(Math.random() * (randNumMax - randNumMin + 1)) + randNumMin);
      while (a == b)
        b = (Math.floor(Math.random() * (randNumMax - randNumMin + 1)) + randNumMin);
      this.changeState(i, a);
      this.changeState(i, b);
    }
  }

        $('#dark-overlay').show("slow");
        var toWrite = '<html>\n';
        toWrite += '<br>Click on any cell to toggle between black/white cell</br>\n';
        toWrite += '<br>Each black cell presents a clause. Each row should have exactly 2 black cells.</br>\n';
        toWrite += '<table border="1" id="board">'
        for (var j = 0; j <= numOfColumns; ++j)
            toWrite += '<col width="50">';

        toWrite += '<tr><td height="50" bgcolor="white" id="cell00"></td>';
        for (var j = 1; j <= numOfColumns; j++)
            if (j % 2 == 1)
                toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">-x' + (j + 1) / 2 + '</td>';
            else
                toWrite += '<td height="50" bgcolor="white" id="cell' + 0 + j + '">x' + j / 2 + '</td>';
        toWrite += "</tr>"

        for (var i = 1; i <= numOfRows; ++i) {
            toWrite += '<tr>';
            toWrite += '<td height="50" bgcolor="white" id="cell00">' + i + '</td>';
            for (var j = 1; j <= numOfColumns; ++j)
                toWrite += '<td height="50" bgcolor="white" id="cell' + i + j + '" onclick=gtWidget.changeState(' + i + ',' + j + ')></td>';
            toWrite += '</tr>';
        }

        toWrite += '</table>\n';
        toWrite += '<button onclick=gtWidget.inputRandomized()>Randomized</button>';
        toWrite += '<button onclick=gtWidget.inputFinished()>Done</button>';
        toWrite += '<button onclick=gtWidget.inputExample1()>Example 1</button>';
        toWrite += '<button onclick=gtWidget.inputExample2()>Example 2</button>';
        toWrite += '<button onclick=gtWidget.CloseBox()>Close</button>';
        toWrite += '<div id="twosat-board-err" class="err"></div>';
        toWrite += '</html>\n';
        $('#twosat-board').html(toWrite);
        $('#twosat-board').show("slow");
    }

  var DIRECTED_GR;
  var OLD_POSITION;
  this.directedChange = function() {
    for (var keyy in internalAdjList)
      internalAdjList[keyy]["extratext"] = "";
    if (DIRECTED_GR == true) {
      DIRECTED_GR = false;
      for (var i = 0; i < OLD_POSITION; i++) {
        var ok = false;
        for (var j = 0; j < amountEdge; j ++)
          if (internalEdgeList[i]["vertexA"] == internalEdgeList[j]["vertexB"] &&
              internalEdgeList[i]["vertexB"] == internalEdgeList[j]["vertexA"]) {
            ok = true;
            break;
          }
        if (ok == false)
          internalEdgeList[amountEdge++] = {
            "vertexA": internalEdgeList[i]["vertexB"],
            "vertexB": internalEdgeList[i]["vertexA"]
          }
      }
    }
    else {
      DIRECTED_GR = true;
      for (var i = OLD_POSITION; i < amountEdge; i ++)
        delete internalEdgeList[i];
      amountEdge = OLD_POSITION;
    }

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    $('#directedChange-err').html("转换成功")
      .delay(1000)
      .queue(function(n) {
        $(this).html("");
        n();
      });
    return true;
  }

  this.examples = function(exampleConstant) {
    internalAdjList = $.extend(true, {}, TEMPLATES[exampleConstant][0]);
    internalEdgeList = $.extend(true, {}, TEMPLATES[exampleConstant][1]);
    amountVertex = TEMPLATES[exampleConstant][2];
    amountEdge = TEMPLATES[exampleConstant][3];

    for (var keyy in internalAdjList)
      internalAdjList[keyy]["extratext"] = "";
    var k = Object.keys(internalEdgeList).length;
    for (var i = amountEdge; i < k; i ++)
      delete internalEdgeList[i];
    k = Object.keys(internalAdjList).length;
    for (var i = amountVertex; i < k; i ++)
      delete internalAdjList[i];
    DIRECTED_GR = true;
    OLD_POSITION = amountEdge;

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    return true;
  }

  /*
   //Temporary version
   this.initRandom = function(allowNegative) {
   var templateNo = Math.floor(Math.random()*7); //0-6
   internalAdjList = $.extend(true, {}, TEMPLATES[templateNo][0]);
   internalEdgeList = $.extend(true, {}, TEMPLATES[templateNo][1]);
   amountVertex = TEMPLATES[templateNo][2];
   amountEdge = TEMPLATES[templateNo][3];
   for(var keyy in internalAdjList)
   internalAdjList[keyy]["extratext"] = "";
   //change edge weights
   var keys = Object.keys(internalEdgeList);
   var nVertices = Object.keys(internalAdjList).length/2;
   var nEdges = keys.length/2;

   //for graphs without bi-directional edges, randomly change edge directions
   if(templateNo == SSSP_EXAMPLE_CP3_4_17 || templateNo == SSSP_EXAMPLE_CP3_4_18) {
   for(var i=0; i<nEdges; i++) {
   var flipEdge = Math.floor(Math.random()*2); //0 or 1
   if(flipEdge == 1) {
   //then flip edge
   var origA = internalEdgeList[keys[i]]["vertexA"];
   var origB = internalEdgeList[keys[i]]["vertexB"];
   internalEdgeList[keys[i]]["vertexA"] = origB;
   internalEdgeList[keys[i]]["vertexB"] = origA;
   internalEdgeList[keys[i+nEdges]]["vertexA"] = origB+nVertices; //graph on right
   internalEdgeList[keys[i+nEdges]]["vertexB"] = origA+nVertices; //graph on right
   //correct vertex adj list also
   delete internalAdjList[origA][origB];
   delete internalAdjList[origA+nVertices][origB+nVertices]; //graph on right
   internalAdjList[origB][origA] = i;
   internalAdjList[origB+nVertices][origA+nVertices] = i+nEdges; //graph on right
   }
   }
   }

   var k = Object.keys(internalEdgeList).length;
   for (var i = amountEdge; i < k; i ++)
   delete internalEdgeList[i];
   k = Object.keys(internalAdjList).length;
   for (var i = amountVertex; i < k; i ++)
   delete internalAdjList[i];
   DIRECTED_GR = true; OLD_POSITION = amountEdge;

   var newState = createState(internalAdjList, internalEdgeList);
   graphWidget.updateGraph(newState, 500);
   return true;
   }

   */

  function createState(internalAdjListObject, internalEdgeListObject, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversing, treeEdge, backEdge, crossEdge, forwardEdge, hiddenEdge) {
    if (vertexHighlighted == null)
      vertexHighlighted = {};
    if (edgeHighlighted == null)
      edgeHighlighted = {};
    if (vertexTraversed == null)
      vertexTraversed = {};
    if (edgeTraversed == null)
      edgeTraversed = {};
    if (vertexTraversing == null)
      vertexTraversing = {};
    if (treeEdge == null)
      treeEdge = {};
    if (backEdge == null)
      backEdge = {};
    if (crossEdge == null)
      crossEdge = {};
    if (forwardEdge == null)
      forwardEdge = {};
    if (hiddenEdge == null)
      hiddenEdge = {};
    var key, state = {
      "vl": {},
      "el": {}
    };

    for (key in internalAdjListObject) {
      state["vl"][key] = {};

      state["vl"][key]["cx"] = internalAdjListObject[key]["cx"];
      state["vl"][key]["cy"] = internalAdjListObject[key]["cy"];
      state["vl"][key]["text"] = key; // internalAdjListObject[key]["text"];
      state["vl"][key]["extratext"] = internalAdjListObject[key]["extratext"];
      if (internalAdjListObject[key]["state"] == OBJ_HIDDEN)
        state["vl"][key]["state"] = OBJ_HIDDEN;
      else
        state["vl"][key]["state"] = VERTEX_DEFAULT;
    }

    for (key in internalEdgeListObject) {
      state["el"][key] = {};

      state["el"][key]["vertexA"] = internalEdgeListObject[key]["vertexA"];
      state["el"][key]["vertexB"] = internalEdgeListObject[key]["vertexB"];
      if (DIRECTED_GR == false)
        state["el"][key]["type"] = EDGE_TYPE_UDE;
      else
        state["el"][key]["type"] = EDGE_TYPE_DE; // HOW TO MAKE THIS DIRECTED?
      state["el"][key]["weight"] = internalEdgeListObject[key]["weight"];
      if (internalEdgeListObject[key]["state"] == OBJ_HIDDEN)
        state["el"][key]["state"] = OBJ_HIDDEN;
      else
        state["el"][key]["state"] = EDGE_DEFAULT;
      state["el"][key]["displayWeight"] = false;
      state["el"][key]["animateHighlighted"] = false;
    }

    for (key in vertexTraversed)
      state["vl"][key]["state"] = VERTEX_TRAVERSED;

    /*for(key in edgeTraversed){
     state["el"][key]["state"] = EDGE_TRAVERSED;
     }*/

    for (key in treeEdge)
      state["el"][key]["state"] = EDGE_RED;
    for (key in backEdge)
      state["el"][key]["state"] = EDGE_BLUE;
    for (key in crossEdge)
      state["el"][key]["state"] = EDGE_GREEN;
    for (key in forwardEdge)
      state["el"][key]["state"] = EDGE_GREY;
    for (key in vertexTraversing)
      state["vl"][key]["state"] = VERTEX_BLUE_OUTLINE;
    for (key in vertexHighlighted)
      state["vl"][key]["state"] = VERTEX_HIGHLIGHTED;
    for (key in edgeHighlighted)
      state["el"][key]["state"] = EDGE_HIGHLIGHTED;
    for (key in hiddenEdge)
      state["el"][key]["state"] = EDGE_GREY;

    return state;
  }

  function populatePseudocode(act) {
    switch (act) {
      case 0: // BFS
        $('#code1').html('Queue q = new Queue<>();q.push(v);');
        $('#code2').html('while(!q.isEmpty()){');
        $('#code3').html('&nbsp;&nbsp;v=q.pop();visited[v]=true;int u =q.getFront();');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;}relax(u,v);');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 1: // articulation points and bridges
        $('#code1').html('try all vertex u, if u hasnt been visited, DFS(u)');
        $('#code2').html('DFS(u), initiate num[u]=low[u]=dfsCount');
        $('#code3').html('&nbsp;&nbsp;try all neighbor v of u');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;if v is free, DFS(v)');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;low[u]=min(low[u], low[v]);');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;check the condition;');
        $('#code7').html('&nbsp;&nbsp;&nbsp;&nbsp;else low[u]=min(low[u], num[v]);');
        break;
      case 2: // two-sat
        $('#code1').html('create graph, each variable create 2 vertices');
        $('#code2').html('for clause a or b, create edge -a -> b and -b -> a');
        $('#code3').html('run scc algorithm');
        $('#code4').html('&nbsp;&nbsp;for each scc found, check the condition');
        $('#code5').html('scc algorithm is completed');
        $('#code6').html('the problem is satisfiable.');
        $('#code7').html('');
        break;
      case 3: // toposort using BFS
        $('#code1').html('add vertices with no incoming edge to queue');
        $('#code2').html('while the queue is not empty');
        $('#code3').html('&nbsp;&nbsp;pop vertex u from queue, add u to the list');
        $('#code4').html('&nbsp;&nbsp;for each neighbor v of u');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;delete edge u->v');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;if v has no incoming edge, add v to queue');
        $('#code7').html("Check if there is some edge that hasn't been visited");
        break;
      case 4: // DFS
        $('#code1').html('DFS(u);');
        $('#code2').html('&nbsp;&nbsp;for each v of u//v为u的相邻点');
        $('#code3').html('&nbsp;&nbsp;&nbsp;&nbsp; if (visited[v]=false){');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DFS(v);');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;else {continue;}');
        $('#code6').html('');
        $('#code7').html('');
        break
      case 5: // tarjan
        $('#code1').html('try all vertex u, if u hasnt been visited, DFS(u)');
        $('#code2').html('DFS(u), add u to stack, initiate num[u] and low[u]');
        $('#code3').html('&nbsp;&nbsp;try all neighbor v of u');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;if v is free, DFS(v)');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;update low[u]');
        $('#code6').html('&nbsp;&nbsp;if low[u]==num[u]');
        $('#code7').html('&nbsp;&nbsp;&nbsp;&nbsp;pop from stack until we get u;');
        break
      case 6: // kosaraju
        $('#code1').html('start DFS-ing from unvisited vertices, DFS(u)');
        $('#code2').html('&nbsp;&nbsp;try all free neighbor v of u, DFS(v)');
        $('#code3').html('&nbsp;&nbsp;finish DFS-ing u, add u to list');
        $('#code4').html('transpose the graph');
        $('#code5').html('DFS in order of the list, DFS(u)');
        $('#code6').html('&nbsp;&nbsp;try all free neighbor v of u, DFS(v)');
        $('#code7').html('Each time start a DFS, we get a strong component');
        break
      case 7: // bipartite BFS
        $('#code1').html('Try all unvisited vertex u of the graph');
        $('#code2').html('&nbsp;&nbsp;push u to the queue');
        $('#code3').html('&nbsp;&nbsp;while queue is not empty, u = Q.front()');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;for each neighbor v of u');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if u and v have the same color -> exit');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;assign another color to v, push v to queue');
        $('#code7').html('');
        break
      case 8: // bipartite DFS
        $('#code1').html('Try all unvisited vertex u of the graph');
        $('#code2').html('&nbsp;&nbsp;DFS(u)');
        $('#code3').html('&nbsp;&nbsp;&nbsp;&nbsp;for each neighbor v of u');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v is free, visit v');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else if u and v have the same color');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;not bipartite graph, exit.');
        $('#code7').html('');
        break
      case 9: // topo sort using DFS
        $('#code1').html('for(vertex u:unVisited){');
        $('#code2').html('DFS(u);');
        $('#code3').html('&nbsp;&nbsp;for each neighbor v of u{');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;if(visited[v]==false){');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DFS(v);}');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;else{continue;}');
        $('#code7').html('&nbsp;&nbsp; }list.add(u);}');
        break
    }
  }
}

// sample graph templates
var TEMPLATES = new Array();
TEMPLATES[SSSP_EXAMPLE_CP3_4_1] = [
{
  0: {"cx":  20, "cy":  40, "text": 0},
  1: {"cx": 120, "cy":  40, "text": 1},
  2: {"cx": 120, "cy": 140, "text": 2},
  3: {"cx": 220, "cy":  40, "text": 3},
  4: {"cx": 320, "cy":  40, "text": 4},
  5: {"cx": 420, "cy":  40, "text": 5},
  6: {"cx": 320, "cy": 140, "text": 6},
  7: {"cx": 220, "cy": 140, "text": 7},
  8: {"cx": 420, "cy": 140, "text": 8}
},
{
  0: {"vertexA": 0, "vertexB": 1},
  1: {"vertexA": 1, "vertexB": 2},
  2: {"vertexA": 1, "vertexB": 3},
  3: {"vertexA": 2, "vertexB": 3},
  4: {"vertexA": 3, "vertexB": 4},
  5: {"vertexA": 6, "vertexB": 7},
  6: {"vertexA": 6, "vertexB": 8}
},
9, 7
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_3] = [
    {
        0: {
            "cx": 20,
            "cy": 20,
            "text": 0
        },
        1: {
            "cx": 90,
            "cy": 20,
            "text": 1
        },
        2: {
            "cx": 160,
            "cy": 20,
            "text": 2
        },
        3: {
            "cx": 230,
            "cy": 20,
            "text": 3
        },
        4: {
            "cx": 20,
            "cy": 90,
            "text": 4
        },
        5: {
            "cx": 90,
            "cy": 90,
            "text": 5
        },
        6: {
            "cx": 160,
            "cy": 90,
            "text": 6
        },
        7: {
            "cx": 230,
            "cy": 90,
            "text": 7
        },
        8: {
            "cx": 20,
            "cy": 160,
            "text": 8
        },
        9: {
            "cx": 20,
            "cy": 230,
            "text": 9
        },
        10: {
            "cx": 90,
            "cy": 230,
            "text": 10
        },
        11: {
            "cx": 160,
            "cy": 230,
            "text": 11
        },
        12: {
            "cx": 230,
            "cy": 230,
            "text": 12
        },
        13: {
            "cx": 420,
            "cy": 20,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        14: {
            "cx": 490,
            "cy": 20,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        15: {
            "cx": 560,
            "cy": 20,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        16: {
            "cx": 630,
            "cy": 20,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        17: {
            "cx": 420,
            "cy": 90,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        18: {
            "cx": 490,
            "cy": 90,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        19: {
            "cx": 560,
            "cy": 90,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        20: {
            "cx": 630,
            "cy": 90,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        21: {
            "cx": 420,
            "cy": 160,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        22: {
            "cx": 420,
            "cy": 230,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        23: {
            "cx": 490,
            "cy": 230,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        24: {
            "cx": 560,
            "cy": 230,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        25: {
            "cx": 630,
            "cy": 230,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        }
    },
    {
        0: {
            "vertexA": 0,
            "vertexB": 1,
            "weight": 1
        },
        1: {
            "vertexA": 0,
            "vertexB": 4,
            "weight": 1
        },
        2: {
            "vertexA": 1,
            "vertexB": 0,
            "weight": 1
        },
        3: {
            "vertexA": 1,
            "vertexB": 2,
            "weight": 1
        },
        4: {
            "vertexA": 1,
            "vertexB": 5,
            "weight": 1
        },
        5: {
            "vertexA": 2,
            "vertexB": 1,
            "weight": 1
        },
        6: {
            "vertexA": 2,
            "vertexB": 3,
            "weight": 1
        },
        7: {
            "vertexA": 2,
            "vertexB": 6,
            "weight": 1
        },
        8: {
            "vertexA": 3,
            "vertexB": 2,
            "weight": 1
        },
        9: {
            "vertexA": 3,
            "vertexB": 7,
            "weight": 1
        },
        10: {
            "vertexA": 4,
            "vertexB": 0,
            "weight": 1
        },
        11: {
            "vertexA": 4,
            "vertexB": 8,
            "weight": 1
        },
        12: {
            "vertexA": 5,
            "vertexB": 1,
            "weight": 1
        },
        13: {
            "vertexA": 5,
            "vertexB": 6,
            "weight": 1
        },
        14: {
            "vertexA": 5,
            "vertexB": 10,
            "weight": 1
        },
        15: {
            "vertexA": 6,
            "vertexB": 2,
            "weight": 1
        },
        16: {
            "vertexA": 6,
            "vertexB": 5,
            "weight": 1
        },
        17: {
            "vertexA": 6,
            "vertexB": 11,
            "weight": 1
        },
        18: {
            "vertexA": 7,
            "vertexB": 3,
            "weight": 1
        },
        19: {
            "vertexA": 7,
            "vertexB": 12,
            "weight": 1
        },
        20: {
            "vertexA": 8,
            "vertexB": 4,
            "weight": 1
        },
        21: {
            "vertexA": 8,
            "vertexB": 9,
            "weight": 1
        },
        22: {
            "vertexA": 9,
            "vertexB": 8,
            "weight": 1
        },
        23: {
            "vertexA": 9,
            "vertexB": 10,
            "weight": 1
        },
        24: {
            "vertexA": 10,
            "vertexB": 5,
            "weight": 1
        },
        25: {
            "vertexA": 10,
            "vertexB": 9,
            "weight": 1
        },
        26: {
            "vertexA": 10,
            "vertexB": 11,
            "weight": 1
        },
        27: {
            "vertexA": 11,
            "vertexB": 6,
            "weight": 1
        },
        28: {
            "vertexA": 11,
            "vertexB": 10,
            "weight": 1
        },
        29: {
            "vertexA": 11,
            "vertexB": 12,
            "weight": 1
        },
        30: {
            "vertexA": 12,
            "vertexB": 7,
            "weight": 1
        },
        31: {
            "vertexA": 12,
            "vertexB": 11,
            "weight": 1
        },
        32: {
            "vertexA": 13,
            "vertexB": 14,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        33: {
            "vertexA": 13,
            "vertexB": 17,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        34: {
            "vertexA": 14,
            "vertexB": 13,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        35: {
            "vertexA": 14,
            "vertexB": 15,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        36: {
            "vertexA": 14,
            "vertexB": 18,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        37: {
            "vertexA": 15,
            "vertexB": 14,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        38: {
            "vertexA": 15,
            "vertexB": 16,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        39: {
            "vertexA": 15,
            "vertexB": 19,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        40: {
            "vertexA": 16,
            "vertexB": 15,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        41: {
            "vertexA": 16,
            "vertexB": 20,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        42: {
            "vertexA": 17,
            "vertexB": 13,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        43: {
            "vertexA": 17,
            "vertexB": 21,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        44: {
            "vertexA": 18,
            "vertexB": 14,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        45: {
            "vertexA": 18,
            "vertexB": 19,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        46: {
            "vertexA": 18,
            "vertexB": 23,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        47: {
            "vertexA": 19,
            "vertexB": 15,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        48: {
            "vertexA": 19,
            "vertexB": 18,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        49: {
            "vertexA": 19,
            "vertexB": 24,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        50: {
            "vertexA": 20,
            "vertexB": 16,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        51: {
            "vertexA": 20,
            "vertexB": 25,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        52: {
            "vertexA": 21,
            "vertexB": 17,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        53: {
            "vertexA": 21,
            "vertexB": 22,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        54: {
            "vertexA": 22,
            "vertexB": 21,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        55: {
            "vertexA": 22,
            "vertexB": 23,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        56: {
            "vertexA": 23,
            "vertexB": 18,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        57: {
            "vertexA": 23,
            "vertexB": 22,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        58: {
            "vertexA": 23,
            "vertexB": 24,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        59: {
            "vertexA": 24,
            "vertexB": 19,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        60: {
            "vertexA": 24,
            "vertexB": 23,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        61: {
            "vertexA": 24,
            "vertexB": 25,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        62: {
            "vertexA": 25,
            "vertexB": 20,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        63: {
            "vertexA": 25,
            "vertexB": 24,
            "weight": 1,
            "state": OBJ_HIDDEN
        }
    },
    13, 32
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_4] = [
    {
        0: {"cx": 20, "cy": 40, "text": 0},
        1: {"cx": 120, "cy": 40, "text": 1},
        2: {"cx": 120, "cy": 140, "text": 2},
        3: {"cx": 220, "cy": 40, "text": 3},
        4: {"cx": 320, "cy": 40, "text": 4},
        5: {"cx": 420, "cy": 40, "text": 5},
        6: {"cx": 320, "cy": 140, "text": 6},
        7: {"cx": 420, "cy": 140, "text": 7},
    },
    {
        0: {"vertexA": 0, "vertexB": 1},
        1: {"vertexA": 0, "vertexB": 2},
        2: {"vertexA": 1, "vertexB": 2},
        3: {"vertexA": 1, "vertexB": 3},
        4: {"vertexA": 2, "vertexB": 3},
        5: {"vertexA": 2, "vertexB": 5},
        6: {"vertexA": 3, "vertexB": 4},
        7: {"vertexA": 7, "vertexB": 6}
    },
    8, 8
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_9] = [
    {
        0: {"cx": 20, "cy": 40, "text": 0},
        1: {"cx": 120, "cy": 40, "text": 1},
        2: {"cx": 120, "cy": 140, "text": 2},
        3: {"cx": 220, "cy": 40, "text": 3},
        4: {"cx": 320, "cy": 40, "text": 4},
        5: {"cx": 420, "cy": 40, "text": 5},
        6: {"cx": 320, "cy": 140, "text": 6},
        7: {"cx": 420, "cy": 140, "text": 7}
    },
    {
        0: {"vertexA": 0, "vertexB": 1},
        1: {"vertexA": 1, "vertexB": 3},
        2: {"vertexA": 3, "vertexB": 2},
        3: {"vertexA": 2, "vertexB": 1},
        4: {"vertexA": 3, "vertexB": 4},
        5: {"vertexA": 4, "vertexB": 5},
        6: {"vertexA": 5, "vertexB": 7},
        7: {"vertexA": 7, "vertexB": 6},
        8: {"vertexA": 6, "vertexB": 4}
    },
    8, 9
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_18] = [
    {
        0: {
            "cx": 50,
            "cy": 125,
            "text": 0,
            1: 0,
            2: 3
        },
        1: {
            "cx": 150,
            "cy": 50,
            "text": 1,
            3: 2
        },
        2: {
            "cx": 150,
            "cy": 200,
            "text": 2,
            3: 4
        },
        3: {
            "cx": 250,
            "cy": 125,
            "text": 3,
            4: 2
        },
        4: {
            "cx": 350,
            "cy": 125,
            "text": 4,
        },
        5: {
            "cx": 450,
            "cy": 125,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            6: 5,
            7: 8
        },
        6: {
            "cx": 550,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            8: 6
        },
        7: {
            "cx": 550,
            "cy": 200,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            8: 9
        },
        8: {
            "cx": 650,
            "cy": 125,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            9: 7
        },
        9: {
            "cx": 750,
            "cy": 125,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        }
    },
    {
        0: {
            "vertexA": 0,
            "vertexB": 1,
            "weight": 1
        },
        1: {
            "vertexA": 1,
            "vertexB": 3,
            "weight": 2
        },
        2: {
            "vertexA": 3,
            "vertexB": 4,
            "weight": 3
        },
        3: {
            "vertexA": 0,
            "vertexB": 2,
            "weight": 10
        },
        4: {
            "vertexA": 2,
            "vertexB": 3,
            "weight": -10
        },
        5: {
            "vertexA": 5,
            "vertexB": 6,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        6: {
            "vertexA": 6,
            "vertexB": 8,
            "weight": 2,
            "state": OBJ_HIDDEN
        },
        7: {
            "vertexA": 8,
            "vertexB": 9,
            "weight": 3,
            "state": OBJ_HIDDEN
        },
        8: {
            "vertexA": 5,
            "vertexB": 7,
            "weight": 10,
            "state": OBJ_HIDDEN
        },
        9: {
            "vertexA": 7,
            "vertexB": 8,
            "weight": -10,
            "state": OBJ_HIDDEN
        }
    },
    5, 5
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_17] = [
    {
        0: {
            "cx": 210,
            "cy": 190,
            "text": 0,
            4: 3
        },
        1: {
            "cx": 50,
            "cy": 50,
            "text": 1,
            3: 1,
            4: 0
        },
        2: {
            "cx": 170,
            "cy": 120,
            "text": 2,
            0: 4,
            1: 2,
            3: 6
        },
        3: {
            "cx": 330,
            "cy": 50,
            "text": 3,
            4: 5
        },
        4: {
            "cx": 240,
            "cy": 280,
            "text": 4,
        },
        5: {
            "cx": 610,
            "cy": 190,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            9: 10
        },
        6: {
            "cx": 450,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            8: 8,
            9: 7
        },
        7: {
            "cx": 570,
            "cy": 120,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            5: 11,
            6: 9,
            8: 13
        },
        8: {
            "cx": 730,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            9: 12
        },
        9: {
            "cx": 640,
            "cy": 280,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        }
    },
    {
        0: {
            "vertexA": 1,
            "vertexB": 4,
            "weight": 6
        },
        1: {
            "vertexA": 1,
            "vertexB": 3,
            "weight": 3
        },
        2: {
            "vertexA": 2,
            "vertexB": 1,
            "weight": 2
        },
        3: {
            "vertexA": 0,
            "vertexB": 4,
            "weight": 1
        },
        4: {
            "vertexA": 2,
            "vertexB": 0,
            "weight": 6
        },
        5: {
            "vertexA": 3,
            "vertexB": 4,
            "weight": 5
        },
        6: {
            "vertexA": 2,
            "vertexB": 3,
            "weight": 7
        },
        7: {
            "vertexA": 6,
            "vertexB": 9,
            "weight": 6,
            "state": OBJ_HIDDEN
        },
        8: {
            "vertexA": 6,
            "vertexB": 8,
            "weight": 3,
            "state": OBJ_HIDDEN
        },
        9: {
            "vertexA": 7,
            "vertexB": 6,
            "weight": 2,
            "state": OBJ_HIDDEN
        },
        10: {
            "vertexA": 5,
            "vertexB": 9,
            "weight": 1,
            "state": OBJ_HIDDEN
        },
        11: {
            "vertexA": 7,
            "vertexB": 5,
            "weight": 6,
            "state": OBJ_HIDDEN
        },
        12: {
            "vertexA": 8,
            "vertexB": 9,
            "weight": 5,
            "state": OBJ_HIDDEN
        },
        13: {
            "vertexA": 7,
            "vertexB": 8,
            "weight": 7,
            "state": OBJ_HIDDEN
        }
    },
    5, 7
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_19] = [
    {
        0: {
            "cx": 50,
            "cy": 50,
            "text": 0,
            1: 0,
            4: 4
        },
        1: {
            "cx": 150,
            "cy": 50,
            "text": 1,
            2: 1
        },
        2: {
            "cx": 250,
            "cy": 50,
            "text": 2,
            1: 2,
            3: 3
        },
        3: {
            "cx": 350,
            "cy": 50,
            "text": 3
        },
        4: {
            "cx": 150,
            "cy": 125,
            "text": 4
        },
        5: {
            "cx": 450,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            6: 5,
            9: 9
        },
        6: {
            "cx": 550,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            7: 6
        },
        7: {
            "cx": 650,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN,
            6: 7,
            8: 8
        },
        8: {
            "cx": 750,
            "cy": 50,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        },
        9: {
            "cx": 550,
            "cy": 125,
            "text": 'Inf',
            "state": OBJ_HIDDEN
        }
    },
    {
        0: {
            "vertexA": 0,
            "vertexB": 1,
            "weight": 9
        },
        1: {
            "vertexA": 1,
            "vertexB": 2,
            "weight": 15
        },
        2: {
            "vertexA": 2,
            "vertexB": 1,
            "weight": -42
        },
        3: {
            "vertexA": 2,
            "vertexB": 3,
            "weight": 10
        },
        4: {
            "vertexA": 0,
            "vertexB": 4,
            "weight": -99
        },
        5: {
            "vertexA": 5,
            "vertexB": 6,
            "weight": 99,
            "state": OBJ_HIDDEN
        },
        6: {
            "vertexA": 6,
            "vertexB": 7,
            "weight": 15,
            "state": OBJ_HIDDEN
        },
        7: {
            "vertexA": 7,
            "vertexB": 6,
            "weight": -42,
            "state": OBJ_HIDDEN
        },
        8: {
            "vertexA": 7,
            "vertexB": 8,
            "weight": 10,
            "state": OBJ_HIDDEN
        },
        9: {
            "vertexA": 5,
            "vertexB": 9,
            "weight": -99,
            "state": OBJ_HIDDEN
        }
    },
    5, 5
];



// Graph Traversal action
var actionsWidth = 150;
var statusCodetraceWidth = 410;

var isCreateOpen = false;
var isSamplesOpen = false;
var isBFSOpen = false;
var isDFSOpen = false;
var isSccOpen = false;
var isBipartiteOpen = false;
var isTopoOpen = false;
var is2satOpen = false;
var isDirectedChangeOpen = false;
var isBridgeOpen = false;

function openCreate() {
  if (!isCreateOpen) {
    $('.create').fadeIn('fast');
    isCreateOpen = true;
  }
}

function closeCreate() {
  if (isCreateOpen) {
    $('.create').fadeOut('fast');
    $('#create-err').html("");
    isCreateOpen = false;
  }
}

function openSamples() {
  if (!isSamplesOpen) {
    $('.samples').fadeIn('fast');
    isSamplesOpen = true;
  }
}

function closeSamples() {
  if (isSamplesOpen) {
    $('.samples').fadeOut('fast');
    $('#samples-err').html("");
    isSamplesOpen = false;
  }
}

function openDirectedChange() {
  if (!isDirectedChangeOpen) {
    $('.directedChange').fadeIn('fast');
    isDirectedChangeOpen = true;
  }
}

function closeDirectedChange() {
  if (isDirectedChangeOpen) {
    $('.directedChange').fadeOut('fast');
    $('#directedChange-err').html("");
    isDirectedChangeOpen = false;
  }
}

function openBFS() {
  if (!isBFSOpen) {
    $('.bfs').fadeIn('fast');
    isBFSOpen = true;
  }
}

function closeBFS() {
  if (isBFSOpen) {
    $('.bfs').fadeOut('fast');
    $('#bfs-err').html("");
    isBFSOpen = false;
  }
}

function openDFS() {
  if (!isDFSOpen) {
    $('.dfs').fadeIn('fast');
    isDFSOpen = true;
  }
}

function closeDFS() {
  if (isDFSOpen) {
    $('.dfs').fadeOut('fast');
    $('#dfs-err').html("");
    isDFSOpen = false;
  }
}

function openBridge() {
  if (!isBridgeOpen) {
    $('.bridge').fadeIn('fast');
    isBridgeOpen = true;
  }
}

function closeBridge() {
  if (isBridgeOpen) {
    $('.bridge').fadeOut('fast');
    $('#bridge-err').html("");
    isBridgeOpen = false;
  }
}

function openScc() {
  if (!isSccOpen) {
    $('.scc').fadeIn('fast');
    isSccOpen = true;
  }
}

function closeScc() {
  if (isSccOpen) {
    $('.scc').fadeOut('fast');
    $('#scc-err').html("");
    isSccOpen = false;
  }
}

function openBipartite() {
  if (!isBipartiteOpen) {
    $('.bipartite').fadeIn('fast');
    isBipartiteOpen = true;
  }
}

function closeBipartite() {
  if (isBipartiteOpen) {
    $('.bipartite').fadeOut('fast');
    $('#bipartite-err').html("");
    isBipartiteOpen = false;
  }
}

function openTopo() {
  if (!isTopoOpen) {
    $('.topo').fadeIn('fast');
    isTopoOpen = true;
  }
}

function closeTopo() {
  if (isTopoOpen) {
    $('.topo').fadeOut('fast');
    $('#topo-err').html("");
    isTopoOpen = false;
  }
}

function open2sat() {
  $('#twosat-v1').val(3);
  $('#twosat-v2').val(3);
  if (!is2satOpen) {
    $('.twosat').fadeIn('fast');
    is2satOpen = true;
  }
}

function close2sat() {
  if (is2satOpen) {
    $('.twosat').fadeOut('fast');
    $('#twosat-err').html("");
    is2satOpen = false;
  }
}

function hideEntireActionsPanel() {
  closeCreate();
  closeSamples();
  closeBFS();
  closeDFS();
  closeBridge();
  closeScc();
  closeBipartite();
  closeTopo();
  close2sat();
  closeDirectedChange();
  hideActionsPanel();
}



// local
$('#play').hide();
write(false, true);
var gtWidget = new GraphTraversal();
var gw = gtWidget.getGraphWidget();
gtWidget.examples(SSSP_EXAMPLE_CP3_4_17);
var randomGraphID = -1;

$(function() {
  var directed = getQueryVariable("directed");
  if (directed.length > 0) {
    directed = parseInt(directed);
    if (directed === 0)
      directedChange();
  }
  var graphJSON = getQueryVariable("create");
  if (graphJSON.length > 0) {
    $("#samplejson-input").val(graphJSON);
    importjson();
  }

  $('#create').click(function() {
    openCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#sample').click(function() {
    closeCreate();
    openSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#bfs').click(function() {
    closeCreate();
    closeSamples();
    openBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#dfs').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    openDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#bridge').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    openBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#scc').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    openScc();
    closeBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#directedChange').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    close2sat();
    openDirectedChange();
  });

  $('#bipartite').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    openBipartite();
    closeTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#topo').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    openTopo();
    close2sat();
    closeDirectedChange();
  });

  $('#twosat').click(function() {
    closeCreate();
    closeSamples();
    closeBFS();
    closeDFS();
    closeBridge();
    closeScc();
    closeBipartite();
    closeTopo();
    open2sat();
    closeDirectedChange();
  });

  // $('#tutorial-1 .tutorial-next').click(function() {
  //     showActionsPanel();
  // });
  // $('#tutorial-2 .tutorial-next').click(function() {
  //     hideEntireActionsPanel();
  // });
  // $('#tutorial-3 .tutorial-next').click(function() {
  //     showStatusPanel();
  // });
  // $('#tutorial-4 .tutorial-next').click(function() {
  //     hideStatusPanel();
  //     showCodetracePanel();
  // });
  // $('#tutorial-5 .tutorial-next').click(function() {
  //     hideCodetracePanel();
  // });
});

function drawGraph() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    $('#dark-overlay').fadeIn(function() {
      $('#drawgraph').fadeIn();
    });
    gtWidget.startLoop();
    isPlaying = false;
  }
}

function importjson() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    gtWidget.importjson();
    closeSample();
    isPlaying = false;
  }
}

function drawDone() {
  if (!gtWidget.draw())
    return false;
  gtWidget.stopLoop();
  $('#drawgraph').fadeOut();
  $('#dark-overlay').fadeOut();
}

function drawCancel() {
  gtWidget.stopLoop();
  $('#drawgraph').fadeOut();
  $('#dark-overlay').fadeOut();
}

function createRandom() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    var n = Math.floor(Math.random()*6 + 5);
    $.ajax({
      url: PHP_DOMAIN + "/php/Graph.php?mode=" + MODE_GET_RANDOM_SUBMITTED_GRAPH + "&directed=" + 1 + "&connected=" + 1
    }).done(function(data) {
      data = JSON.parse(data);
      var graph = extractQnGraph(data.graph);
      if (data.graphID == randomGraphID) // to ensure we get different graph per click (make sure #graph > 1 in the database)
        createRandom();
      randomGraphID = data.graphID;
      gtWidget.initRandom(graph);
      $('#rate-sample-graph').show();
    })
    $('#progress-bar').slider("option", "max", 0);
    closeSamples();
    isPlaying = false;
  }
}

function sample(id) {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.examples(id)) {
      $('#progress-bar').slider("option", "max", 0);
      closeSamples();
      isPlaying = false;
    }
  }, 500);
}

function bfs() {
  if (isPlaying) stop();
  var sourceS = parseInt($('#bfs-v').val());
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.bfs(sourceS)) {
      $('#current-action').show();
      $('#current-action p').html("BFS(" + sourceS + ")");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function dfs() {
  if (isPlaying) stop();
  var sourceS = parseInt($('#dfs-v').val());
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.dfs(sourceS)) {
      $('#current-action').show();
      $('#current-action p').html("DFS(" + sourceS + ")");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function bridge() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.bridge()) {
      $('#current-action').show();
      $('#current-action p').html("Articulation Points and Bridges check");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function directedChange() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.directedChange()) {
      $('#progress-bar').slider("option", "max", 0);
      isPlaying = false;
    }
  }, 500);
}

function tarjan() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.tarjan()) {
      $('#current-action').show();
      $('#current-action p').html("Tarjan's Algorithm");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function kosaraju() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.kosaraju()) {
      $('#current-action').show();
      $('#current-action p').html("Kosaraju's Algorithm");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function bipartiteDfs() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.bipartiteDfs()) {
      $('#current-action').show();
      $('#current-action p').html("Bipartite Graph Checker");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function bipartiteBfs() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.bipartiteBfs()) {
      $('#current-action').show();
      $('#current-action p').html("Bipartite Graph Checker");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function toposortDfs() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.toposortDfs()) {
      $('#current-action').show();
      $('#current-action p').html("拓扑排序");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function toposortBfs() {
  if (isPlaying) stop();
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.toposortBfs()) {
      $('#current-action').show();
      $('#current-action p').html("拓扑排序");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function twosat() {
  if (isPlaying) {
    stop();
  }
  var a = parseInt($('#twosat-v1').val());
  var b = parseInt($('#twosat-v2').val());
  setTimeout(function() {
    if ((mode == "exploration") && gtWidget.twosat(a, b)) {
      $('#current-action').show();
      $('#current-action p').html("2-SAT Checker");
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}
