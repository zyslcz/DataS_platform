var MST_EXAMPLE_CP4P10 = 3;
var MST_EXAMPLE_CP4P14 = 4;
var MST_EXAMPLE_K5 = 1;
var MST_EXAMPLE_RAIL = 2;
var MST_EXAMPLE_TESSELLATION = 0;

// MST Type Constant
var MST_MIN = 0; // Minimum Spanning Tree
var MST_MAX = 1; // Maximum Spanning Tree

var MST = function () {
  var self = this;
  var graphWidget = new GraphWidget();

  /*
   *  Structure of iAL: JS object with
   *  - key: vertex number
   *  - value: JS object with
   *           - key: the other vertex number that is connected by the edge
   *           - value: ID of the edge, NOT THE WEIGHT OF THE EDGE
   *
   *  The reason why the adjList didn't store edge weight is because it will be easier to create bugs
   *  on information consistency between the adjList and edgeList
   *
   *  Structure of iEL: JS object with
   *  - key: edge ID
   *  - value: JS object with the following keys:
   *           - vertexA
   *           - vertexB
   *           - weight
   */

  var iAL = {};
  var iEL = {};
  var amountVertex = 0;
  var amountEdge = 0;

  this.getGraphWidget = function () {
    return graphWidget;
  };

  fixJSON = function () {
    amountVertex = 0;
    amountEdge = 0;
    for (var key in iAL) ++amountVertex;
    for (var key in iEL) ++amountEdge;

    for (var key in iEL) {
      delete iEL[key]["type"];
      delete iEL[key]["displayWeight"];
    }
    for (var key in iAL) {
      delete iAL[key]["text"];
      delete iAL[key]["state"];
    }
    for (var key in iEL) {
      iAL[iEL[key]["vertexA"]][iEL[key]["vertexB"]] = +key;
      iAL[iEL[key]["vertexB"]][iEL[key]["vertexA"]] = +key;
      iEL[key]["weight"] = +iEL[key]["weight"];
    }
  };

  takeJSON = function (graph) {
    if (graph == null) return;
    graph = JSON.parse(graph);
    iAL = graph["vl"];
    iEL = graph["el"];
    fixJSON();
  };

  statusChecking = function () {
    $("#draw-status p").html(
      "画一个<b>连通</b> 图, 尽量使点多于7个, <b>最小化边交叉</b>, 并且进行 <b>Prim算法/Kruskal算法的演示</b>"
    );
  };

  warnChecking = function () {
    var warn = "";
    if (amountVertex >= 17) warn += "请减少点的个数。 ";

    if (warn == "") $("#draw-warn p").html("－");
    else $("#draw-warn p").html(warn);
  };

  errorChecking = function () {
    var error = "";
    if (amountVertex == 0) {
      $("#draw-err p").html("图不能为空。");
      return;
    }

    var visited = [];
    var stack = [];
    stack.push(0);
    visited[0] = true;
    while (stack.length > 0) {
      var now = stack.pop();
      for (var key2 in iEL) {
        if (iEL[key2]["vertexA"] == now && !visited[iEL[key2]["vertexB"]]) {
          visited[iEL[key2]["vertexB"]] = true;
          stack.push(+iEL[key2]["vertexB"]);
        }
        if (iEL[key2]["vertexB"] == now && !visited[iEL[key2]["vertexA"]]) {
          visited[iEL[key2]["vertexA"]] = true;
          stack.push(+iEL[key2]["vertexA"]);
        }
      }
    }

    for (var i = 0; i < amountVertex; ++i)
      if (!visited[i]) {
        error = error + "点" + i + " 与任意点均无连接。 ";
        break;
      }

    if (error == "") $("#draw-err p").html("－");
    else $("#draw-err p").html(error);
  };

  var intervalID;

  this.startLoop = function () {
    intervalID = setInterval(function () {
      takeJSON(JSONresult);
      warnChecking();
      errorChecking();
      statusChecking();
    }, 100);
  };

  this.stopLoop = function () {
    clearInterval(intervalID);
  };

  this.draw = function () {
    if ($("#draw-err p").html() != "－") return false;
    if ($("#submit").is(":checked")) this.submit(JSONresult);
    if ($("#copy").is(":checked")) window.prompt("复制到剪贴板:", JSONresult);

    graph = createState(iAL, iEL);
    graphWidget.updateGraph(graph, 500);
    return true;
  };

  this.submit = function (graph) {
    // currently not used
    $.ajax({
      url: PHP_DOMAIN + "php/Graph.php?mode=" + MODE_SUBMIT_GRAPH,
      type: "POST",
      data: {
        canvasWidth: 1000,
        canvasHeight: 500,
        graphTopics: "MST",
        graphState: graph,
        fbAccessToken: fbAccessToken,
      },
      error: function (xhr, errorType, exception) {
        //Triggered if an error communicating with server
        var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText
        alert("提交的图里面有错误" + errorMessage);
      },
    }).done(function (data) {
      $("#draw-err").html(data);
    });
  };

  this.importjson = function () {
    var text = $("#samplejson-input").val();
    takeJSON(text);
    fixJSON();
    statusChecking();
    graph = createState(iAL, iEL);
    graphWidget.updateGraph(graph, 500);
  };

  this.initRandom = function (graph) {
    iAL = graph.iAL;
    iEL = graph.iEL;
    fixJSON();
    statusChecking();
    var newState = createState(iAL, iEL);
    graphWidget.updateGraph(newState, 500);
  };

  this.dijkstra = function (from, to) {
    console.log(from, to);

    var stateList = [],
      cs;
    var vertexHighlighted = {},
      edgeHighlighted = {},
      vertexTraversed = {},
      edgeTraversed = {},
      edgeQueued = {};
    var sortedArray = [];

    // error check
    if (amountVertex == 0) {
      // no graph
      $("#kruskals-err").html("没有可运行的图，请先建立一个图。");
      return false;
    }

    cs = createState(iAL, iEL);
    console.log(iAL, iEL);

    // 记录状态
    let status = Object.values(cs.vl).reduce(
      (prev, item) => ({
        ...prev,
        [item.text]: { cost: Infinity, path: "" },
      }),
      {}
    );

    let unvisited = Object.values(cs.vl).map((item) => item.text);
    // let visited = [];
    vertexHighlighted = unvisited.reduce(
      (prev, current) => ({ ...prev, [current]: false }),
      {}
    );

    console.log(edgeTraversed);
    status[from] = { cost: 0, path: from };
    console.log({ ...status });
    while (unvisited.length > 0) {
      const sorted = unvisited.sort((a, b) => {
        return status[a].cost - status[b].cost;
      });
      const current = sorted[0];
      // console.log(current);
      vertexTraversed[current] = true;

      unvisited.splice(unvisited.indexOf(current), 1);

      Object.values(iEL).forEach((element, index) => {
        let adjNode;
        if (String(element.vertexA) === current) {
          adjNode = element.vertexB;
        } else if (String(element.vertexB) === current) {
          adjNode = element.vertexA;
        }
        if (adjNode !== undefined) {
          // console.log(adjNode, current);
          edgeTraversed[index] = true;
          if (status[adjNode].cost > status[current].cost + element.weight) {
            status[adjNode] = {
              cost: status[current].cost + element.weight,
              path: status[current].path + adjNode,
            };
          }

          let tempState = createState(
            iAL,
            iEL,
            {},
            edgeHighlighted,
            vertexTraversed,
            { ...edgeTraversed },
            edgeQueued
          );
          tempState.status = `当前访问${current}, 判断边${element.vertexA} - ${
            element.vertexB
          }\n当前距离：${status[to].cost}, 路径${status[to].path
            .split("")
            .join("->")}`;
          stateList.push(tempState);
        }
      });
    }
    const passingNodes = status[to].path.split("");
    vertexHighlighted = Object.keys(iAL)
      .filter((item) => passingNodes.indexOf(item) >= 0)
      .reduce((prev, item) => ({ ...prev, [item]: true }), {});

    edgeTraversed = passingNodes
      .reduce((prev, item, index) => {
        if (index > 0) {
          return [...prev, [passingNodes[index - 1], item]];
        } else {
          return prev;
        }
      }, [])
      .map((item) => {
        console.log(item);
        const index = Object.values(iEL).findIndex((elem) => {
          const indexVA = item.findIndex((_e) => _e === String(elem.vertexA));
          const indexVB = item.findIndex((_e) => _e === String(elem.vertexB));
          return indexVA + indexVB === 1 && indexVA * indexVB === 0;
        });
        console.log(index);
        return index;
      })
      .reduce(
        (prev, item) => ({
          ...prev,
          [item]: true,
        }),
        {}
      );
    // console.log(passingNodes, edgeTraversed, vertexHighlighted);
    let finalState = createState(
      iAL,
      iEL,
      {},
      {},
      Object.keys(iAL)
        .filter((item) => passingNodes.indexOf(item) >= 0)
        .reduce((prev, item) => ({ ...prev, [item]: true }), {}),
      // vertexTraversed,
      edgeTraversed,
      edgeQueued
    );
    finalState.status = `执行结束，最短路径长度为： ${
      status[to].cost
    }, 路径${status[to].path.split("").join("->")}`;
    stateList.push(finalState);
    populatePseudocode(1);
    graphWidget.startAnimation(stateList);
    console.log(stateList);
    return true;
  };

  this.examples = function (id) {
    switch (id) {
      case MST_EXAMPLE_CP4P10:
        iAL = {
          0: {
            cx: 200,
            cy: 150,
          },
          1: {
            cx: 300,
            cy: 50,
          },
          2: {
            cx: 400,
            cy: 150,
          },
          3: {
            cx: 300,
            cy: 250,
          },
          4: {
            cx: 200,
            cy: 350,
          },
          5: {
            cx: 300,
            cy: 350,
          },
        };
        iEL = {
          0: {
            vertexA: 0,
            vertexB: 1,
            weight: 4,
          },
          1: {
            vertexA: 0,
            vertexB: 2,
            weight: 4,
          },
          2: {
            vertexA: 0,
            vertexB: 3,
            weight: 6,
          },
          3: {
            vertexA: 0,
            vertexB: 4,
            weight: 6,
          },
          4: {
            vertexA: 1,
            vertexB: 2,
            weight: 2,
          },
          5: {
            vertexA: 2,
            vertexB: 3,
            weight: 8,
          },
          6: {
            vertexA: 3,
            vertexB: 4,
            weight: 9,
          },
          7: {
            vertexA: 5,
            vertexB: 4,
            weight: 3,
          },
          8: {
            vertexA: 5,
            vertexB: 2,
            weight: 7,
          },
        };
        amountVertex = 5;
        amountEdge = 8;
        break;
      case MST_EXAMPLE_CP4P14:
        iAL = {
          0: {
            cx: 300,
            cy: 50,
          },
          1: {
            cx: 450,
            cy: 200,
          },
          2: {
            cx: 450,
            cy: 50,
          },
          3: {
            cx: 650,
            cy: 200,
          },
          4: {
            cx: 450,
            cy: 350,
          },
        };
        iEL = {
          0: {
            vertexA: 0,
            vertexB: 1,
            weight: 9,
          },
          1: {
            vertexA: 0,
            vertexB: 2,
            weight: 75,
          },
          2: {
            vertexA: 1,
            vertexB: 2,
            weight: 95,
          },
          3: {
            vertexA: 1,
            vertexB: 3,
            weight: 19,
          },
          4: {
            vertexA: 1,
            vertexB: 4,
            weight: 42,
          },
          5: {
            vertexA: 2,
            vertexB: 3,
            weight: 51,
          },
          6: {
            vertexA: 3,
            vertexB: 4,
            weight: 31,
          },
        };
        amountVertex = 5;
        amountEdge = 7;
        break;
      case MST_EXAMPLE_K5:
        iAL = {
          0: {
            cx: 280,
            cy: 150,
          },
          1: {
            cx: 620,
            cy: 150,
          },
          2: {
            cx: 350,
            cy: 340,
          },
          3: {
            cx: 450,
            cy: 50,
          },
          4: {
            cx: 550,
            cy: 340,
          },
        };
        iEL = {
          0: {
            vertexA: 0,
            vertexB: 1,
            weight: 24,
          },
          1: {
            vertexA: 0,
            vertexB: 2,
            weight: 13,
          },
          2: {
            vertexA: 0,
            vertexB: 3,
            weight: 13,
          },
          3: {
            vertexA: 0,
            vertexB: 4,
            weight: 22,
          },
          4: {
            vertexA: 1,
            vertexB: 2,
            weight: 22,
          },
          5: {
            vertexA: 1,
            vertexB: 3,
            weight: 13,
          },
          6: {
            vertexA: 1,
            vertexB: 4,
            weight: 13,
          },
          7: {
            vertexA: 2,
            vertexB: 3,
            weight: 19,
          },
          8: {
            vertexA: 2,
            vertexB: 4,
            weight: 14,
          },
          9: {
            vertexA: 3,
            vertexB: 4,
            weight: 19,
          },
        };
        amountVertex = 5;
        amountEdge = 10;
        break;
      case MST_EXAMPLE_RAIL:
        iAL = {
          0: {
            cx: 50,
            cy: 100,
          },
          1: {
            cx: 250,
            cy: 100,
          },
          2: {
            cx: 450,
            cy: 100,
          },
          3: {
            cx: 650,
            cy: 100,
          },
          4: {
            cx: 850,
            cy: 100,
          },
          5: {
            cx: 50,
            cy: 250,
          },
          6: {
            cx: 250,
            cy: 250,
          },
          7: {
            cx: 450,
            cy: 250,
          },
          8: {
            cx: 650,
            cy: 250,
          },
          9: {
            cx: 850,
            cy: 250,
          },
        };
        iEL = {
          0: {
            vertexA: 0,
            vertexB: 1,
            weight: 10,
          },
          1: {
            vertexA: 1,
            vertexB: 2,
            weight: 10,
          },
          2: {
            vertexA: 1,
            vertexB: 6,
            weight: 8,
          },
          3: {
            vertexA: 1,
            vertexB: 7,
            weight: 13,
          },
          4: {
            vertexA: 2,
            vertexB: 3,
            weight: 10,
          },
          5: {
            vertexA: 2,
            vertexB: 7,
            weight: 8,
          },
          6: {
            vertexA: 2,
            vertexB: 8,
            weight: 13,
          },
          7: {
            vertexA: 3,
            vertexB: 4,
            weight: 10,
          },
          8: {
            vertexA: 3,
            vertexB: 8,
            weight: 8,
          },
          9: {
            vertexA: 5,
            vertexB: 6,
            weight: 10,
          },
          10: {
            vertexA: 6,
            vertexB: 7,
            weight: 10,
          },
          11: {
            vertexA: 7,
            vertexB: 8,
            weight: 10,
          },
          12: {
            vertexA: 8,
            vertexB: 9,
            weight: 10,
          },
        };
        amountVertex = 10;
        amountEdge = 13;
        break;
      case MST_EXAMPLE_TESSELLATION:
        iAL = {
          0: {
            cx: 200,
            cy: 50,
          },
          1: {
            cx: 200,
            cy: 170,
          },
          2: {
            cx: 350,
            cy: 110,
          },
          3: {
            cx: 500,
            cy: 170,
          },
          4: {
            cx: 275,
            cy: 290,
          },
          5: {
            cx: 500,
            cy: 290,
          },
          6: {
            cx: 600,
            cy: 50,
          },
          7: {
            cx: 640,
            cy: 240,
          },
          8: {
            cx: 700,
            cy: 120,
          },
        };
        iEL = {
          0: {
            vertexA: 0,
            vertexB: 1,
            weight: 8,
          },
          1: {
            vertexA: 0,
            vertexB: 2,
            weight: 12,
          },
          2: {
            vertexA: 1,
            vertexB: 2,
            weight: 13,
          },
          3: {
            vertexA: 1,
            vertexB: 3,
            weight: 25,
          },
          4: {
            vertexA: 1,
            vertexB: 4,
            weight: 9,
          },
          5: {
            vertexA: 2,
            vertexB: 3,
            weight: 14,
          },
          6: {
            vertexA: 2,
            vertexB: 6,
            weight: 21,
          },
          7: {
            vertexA: 3,
            vertexB: 4,
            weight: 20,
          },
          8: {
            vertexA: 3,
            vertexB: 5,
            weight: 8,
          },
          9: {
            vertexA: 3,
            vertexB: 6,
            weight: 12,
          },
          10: {
            vertexA: 3,
            vertexB: 7,
            weight: 12,
          },
          11: {
            vertexA: 3,
            vertexB: 8,
            weight: 16,
          },
          12: {
            vertexA: 4,
            vertexB: 5,
            weight: 19,
          },
          13: {
            vertexA: 5,
            vertexB: 7,
            weight: 11,
          },
          14: {
            vertexA: 6,
            vertexB: 8,
            weight: 11,
          },
          15: {
            vertexA: 7,
            vertexB: 8,
            weight: 9,
          },
        };
        amountVertex = 9;
        amountEdge = 16;
        break;
    }

    for (var key in iEL) {
      // transform EL to AL (for Prim's)
      iAL[iEL[key]["vertexA"]][iEL[key]["vertexB"]] = +key;
      iAL[iEL[key]["vertexB"]][iEL[key]["vertexA"]] = +key;
    }
    var newState = createState(iAL, iEL);
    graphWidget.updateGraph(newState, 500);

    return true;
  };

  function createState(
    iALObject,
    iELObject,
    vertexHighlighted,
    edgeHighlighted,
    vertexTraversed,
    edgeTraversed,
    edgeQueued
  ) {
    var isDefaultGrey = true;
    if (
      vertexHighlighted == null &&
      edgeHighlighted == null &&
      vertexTraversed == null &&
      edgeTraversed == null &&
      edgeQueued == null
    )
      isDefaultGrey = false;
    if (vertexHighlighted == null) vertexHighlighted = {};
    if (edgeHighlighted == null) edgeHighlighted = {};
    if (vertexTraversed == null) vertexTraversed = {};
    if (edgeTraversed == null) edgeTraversed = {};
    if (edgeQueued == null) edgeQueued = {};

    var key;
    var state = {
      vl: {},
      el: {},
    };

    if (isDefaultGrey) {
      for (key in iALObject) {
        state["vl"][key] = {};

        state["vl"][key]["cx"] = iALObject[key]["cx"];
        state["vl"][key]["cy"] = iALObject[key]["cy"];
        state["vl"][key]["text"] = key;
        state["vl"][key]["state"] = VERTEX_GREY_OUTLINE;
      }
      for (key in iELObject) {
        state["el"][key] = {};

        state["el"][key]["vertexA"] = iELObject[key]["vertexA"];
        state["el"][key]["vertexB"] = iELObject[key]["vertexB"];
        state["el"][key]["type"] = EDGE_TYPE_UDE;
        state["el"][key]["weight"] = iELObject[key]["weight"];
        state["el"][key]["state"] = EDGE_GREY;
        state["el"][key]["displayWeight"] = true;
        state["el"][key]["animateHighlighted"] = false;
      }
    } else {
      for (key in iALObject) {
        state["vl"][key] = {};

        state["vl"][key]["cx"] = iALObject[key]["cx"];
        state["vl"][key]["cy"] = iALObject[key]["cy"];
        state["vl"][key]["text"] = key;
        state["vl"][key]["state"] = VERTEX_DEFAULT;
      }
      for (key in iELObject) {
        state["el"][key] = {};

        state["el"][key]["vertexA"] = iELObject[key]["vertexA"];
        state["el"][key]["vertexB"] = iELObject[key]["vertexB"];
        state["el"][key]["type"] = EDGE_TYPE_UDE;
        state["el"][key]["weight"] = iELObject[key]["weight"];
        state["el"][key]["state"] = EDGE_DEFAULT;
        state["el"][key]["displayWeight"] = true;
        state["el"][key]["animateHighlighted"] = false;
      }
    }

    for (key in edgeQueued) {
      key1 = state["el"][key]["vertexA"];
      key2 = state["el"][key]["vertexB"];
      state["vl"][key1]["state"] = VERTEX_DEFAULT;
      state["vl"][key2]["state"] = VERTEX_DEFAULT;
      state["el"][key]["state"] = EDGE_DEFAULT;
    }

    for (key in vertexHighlighted) state["vl"][key]["state"] = VERTEX_BLUE_FILL;
    for (key in edgeHighlighted) state["el"][key]["state"] = EDGE_BLUE;
    for (key in vertexTraversed) state["vl"][key]["state"] = VERTEX_GREEN_FILL;
    for (key in edgeTraversed) state["el"][key]["state"] = EDGE_GREEN;

    return state;
  }

  function populatePseudocode(act) {
    switch (act) {
      case 0: // Prim's
        $("#code1").html("int[] T = new int[num];T[0]=s;");
        $("#code2").html("int[][] PQ = new int[num-1][2];PQ.add(otherEges);");
        $("#code3").html("while(!PQ.isEmpty){");
        $("#code4").html(
          "&nbsp;&nbsp;if (vertex v linked with e=PQ.remove is not in T)"
        );
        $("#code5").html(
          "&nbsp;&nbsp;&nbsp;&nbsp;if(v.isLinked(int e=(PQ.rmove())[1])&&!T.contain(e)){T.add(e);v.connect(newEges);}"
        );
        $("#code6").html("&nbsp;&nbsp;}   else{continue;} ");
        $("#code7").html(
          'print(T);'
        );
        break;
      case 1: // Kruskal's
        $("#code1").html("sortEges(eges);int num=0;");
        $("#code2").html("int[] T = new int[100];");
        $("#code3").html("for(int i=0;i<edges.length;i++){");
        $("#code4").html(
          "&nbsp;&nbsp;if(!isCycle(engs[i])){"
        );
        $("#code5").html("&nbsp;&nbsp;&nbsp;&nbsp;T[num]=edgs[i]; num++;}");
        $("#code6").html("&nbsp;&nbsp;}else{continue;}");
        $("#code7").html('print(T);');
        break;
    }
  }
};

// MST Actions
var actionsWidth = 150;
var statusCodetraceWidth = 430;
var isDrawOpen = false,
  isRandomOpen = false,
  isSamplesOpen = false,
  isKruskalsOpen = false,
  isPrimsOpen = false;

function openDraw() {
  $("#draw-err").html("");
  if (!isDrawOpen) {
    $(".draw").fadeIn("fast");
    isDrawOpen = true;
  }
}

function closeDraw() {
  $("#draw-err").html("");
  if (isDrawOpen) {
    $(".draw").fadeOut("fast");
    isDrawOpen = false;
  }
}

function openRandom() {
  if (!isRandomOpen) {
    $(".random").fadeIn("fast");
    isRandomOpen = true;
  }
}

function closeRandom() {
  if (isRandomOpen) {
    $(".random").fadeOut("fast");
    $("#random-err").html("");
    isRandomOpen = false;
  }
}

function openSamples() {
  if (!isSamplesOpen) {
    $(".samples").fadeIn("fast");
    isSamplesOpen = true;
  }
}

function closeSamples() {
  if (isSamplesOpen) {
    $(".samples").fadeOut("fast");
    $("#samples-err").html("");
    isSamplesOpen = false;
  }
}

function openKruskals() {
  if (!isKruskalsOpen) {
    $(".kruskals").fadeIn("fast");
    isKruskalsOpen = true;
  }
}

function closeKruskals() {
  if (isKruskalsOpen) {
    $(".kruskals").fadeOut("fast");
    $("#kruskals-err").html("");
    isKruskalsOpen = false;
  }
}

function openPrims() {
  if (!isPrimsOpen) {
    $(".prims").fadeIn("fast");
    isPrimsOpen = true;
  }
}

function closePrims() {
  if (isPrimsOpen) {
    $(".prims").fadeOut("fast");
    $("#prims-err").html("");
    isPrimsOpen = false;
  }
}

function hideEntireActionsPanel() {
  closeDraw();
  closeRandom();
  closeSamples();
  closeKruskals();
  closePrims();
  hideActionsPanel();
}

// local
$("#play").hide();
// write(true, false);
var mstWidget = new MST();
var gw = mstWidget.getGraphWidget();
mstWidget.examples(MST_EXAMPLE_CP4P10);
var randomGraphID = -1;

$(function () {
  var graphJSON = getQueryVariable("create");
  if (graphJSON.length > 0) {
    $("#samplejson-input").val(graphJSON);
    importjson();
  }

  $("#draw").click(function () {
    openDraw();
    closeRandom();
    closeSamples();
    closePrims();
    closeKruskals();
  });

  $("#random").click(function () {
    closeDraw();
    openRandom();
    closeSamples();
    closePrims();
    closeKruskals();
  });

  $("#samples").click(function () {
    closeDraw();
    closeRandom();
    openSamples();
    closePrims();
    closeKruskals();
  });

  $("#prims").click(function () {
    closeDraw();
    closeRandom();
    closeSamples();
    openPrims();
    closeKruskals();
  });

  $("#kruskals").click(function () {
    closeDraw();
    closeRandom();
    closeSamples();
    closePrims();
    openKruskals();
  });

  $("#tutorial-1 .tutorial-next").click(function () {
    showActionsPanel();
  });
  $("#tutorial-2 .tutorial-prev").click(function () {
    hideEntireActionsPanel();
  });
  $("#tutorial-2 .tutorial-next").click(function () {
    hideEntireActionsPanel();
  });
  $("#tutorial-3 .tutorial-prev").click(function () {
    showActionsPanel();
  });
  $("#tutorial-3 .tutorial-next").click(function () {
    showStatusPanel();
  });
  $("#tutorial-4 .tutorial-prev").click(function () {
    hideStatusPanel();
  });
  $("#tutorial-4 .tutorial-next").click(function () {
    hideStatusPanel();
    showCodetracePanel();
  });
  $("#tutorial-5 .tutorial-prev").click(function () {
    hideCodetracePanel();
    showStatusPanel();
  });
  $("#tutorial-5 .tutorial-next").click(function () {
    hideCodetracePanel();
  });
  $("#tutorial-6 .tutorial-prev").click(function () {
    showCodetracePanel();
  });

  if (!localStorage.getItem("MSTvisited")) {
    // first visit
    localStorage.setItem("MSTvisited", "true");
    setTimeout(function () {
      $("#mode-menu a").trigger("click");
    }, 2000); // show tutorial mode 2 seconds after load
  }
});

function importjson() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    mstWidget.importjson();
    closeSamples();
    isPlaying = false;
  }
}

function drawGraph() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    $("#dark-overlay").fadeIn(function () {
      $("#drawgraph").fadeIn();
    });
    mstWidget.startLoop();
    isPlaying = false;
  }
}

function drawDone() {
  if (!mstWidget.draw()) return false;
  mstWidget.stopLoop();
  $("#drawgraph").fadeOut();
  $("#dark-overlay").fadeOut();
}

function drawCancel() {
  mstWidget.stopLoop();
  $("#drawgraph").fadeOut();
  $("#dark-overlay").fadeOut();
}

function createRandom() {
  if (isPlaying) stop();
  if (mode == "exploration") {
    $.ajax({
      url:
        PHP_DOMAIN +
        "/php/Graph.php?mode=" +
        MODE_GET_RANDOM_SUBMITTED_GRAPH +
        "&directed=" +
        0 +
        "&connected=" +
        1, // + "&topic=MST"
    }).done(function (data) {
      data = jQuery.parseJSON(data); // JSON.parse(data);
      var graph = extractQnGraph(data.graph);
      if (data.graphID == randomGraphID)
        // make sure it is different, make sure #graph > 1
        createRandom();
      randomGraphID = data.graphID;
      mstWidget.initRandom(graph);
      $("#rate-sample-graph").show();
    });
    $("#progress-bar").slider("option", "max", 0);
    closeSamples();
    isPlaying = false;
  }
}

function sample(id) {
  if (isPlaying) stop();
  setTimeout(function () {
    if (mode == "exploration" && mstWidget.examples(id)) {
      $("#progress-bar").slider("option", "max", 0);
      closeSamples();
      isPlaying = false;
    }
  }, 500);
}

function dijkstra() {
  let elem = document.querySelector("#v-from-to");
  elem.style.opacity = 1;
  console.log(elem);
}

function kruskals() {
  if (isPlaying) stop();
  setTimeout(function () {
    if (mode == "exploration" && mstWidget.kruskal(MST_MIN)) {
      $("#current-action").show();
      $("#current-action p").html("Kruskal算法");
      $("#progress-bar").slider("option", "max", gw.getTotalIteration() - 1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function prims() {
  if (isPlaying) stop();
  var startV = parseInt($("#prim-v").val());
  setTimeout(function () {
    if (mode == "exploration" && mstWidget.prim(startV, MST_MIN)) {
      $("#current-action").show();
      $("#current-action p").html("Prim算法, 从点 " + startV + "开始");
      $("#progress-bar").slider("option", "max", gw.getTotalIteration() - 1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function setVertex() {
  const from = document.querySelector("#v-from").value;
  const to = document.querySelector("#v-to").value;
  console.log(from, to);
  let elem = document.querySelector("#v-from-to");
  elem.style.opacity = 0;

  if (isPlaying) stop();
  setTimeout(() => {
    if (mode == "exploration" && mstWidget.dijkstra(from, to)) {
      $("#current-action").show();
      $("#current-action p").html("Kruskal算法");
      $("#progress-bar").slider("option", "max", gw.getTotalIteration() - 1);
      triggerRightPanels();
      isPlaying = true;
    }
  });
}
