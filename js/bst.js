var BST = function() {
    var self = this;
    var graphWidget = new GraphWidget();
    var isAVL = false;

    var valueRange = [1, 100]; // Range of valid values of BST vertexes allowed
    var maxHeightAllowed = 10;

    var initialArray = [15, 6, 23, 4, 7, 71, 5, 50];
    var initialAvlArray = [15, 6, 50, 4, 7, 23, 71, 5];


    var internalBst = {};
    var amountVertex = 0;
    internalBst["root"] = null;

    if (isAVL)
      init(initialAvlArray);
    else
      init(initialArray);

    this.getGraphWidget = function() { return graphWidget; };


    function dummyInit() {
      internalBst["root"] = 15;
      internalBst[15] = {
        "parent": null,
        "leftChild": 6,
        "rightChild": 23,
        "vertexClassNumber": 0
      };
      internalBst[6] = {
        "parent": 15,
        "leftChild": 4,
        "rightChild": 7,
        "vertexClassNumber": 1
      };
      internalBst[23] = {
        "parent": 15,
        "leftChild": null,
        "rightChild": 71,
        "vertexClassNumber": 2
      };
      internalBst[4] = {
        "parent": 6,
        "leftChild": null,
        "rightChild": 5,
        "vertexClassNumber": 3
      };
      internalBst[7] = {
        "parent": 6,
        "leftChild": null,
        "rightChild": null,
        "vertexClassNumber": 4
      };
      internalBst[71] = {
        "parent": 23,
        "leftChild": 50,
        "rightChild": null,
        "vertexClassNumber": 5
      };
      internalBst[5] = {
        "parent": 4,
        "leftChild": null,
        "rightChild": null,
        "vertexClassNumber": 6
      };
      internalBst[50] = {
        "parent": 71,
        "leftChild": null,
        "rightChild": null,
        "vertexClassNumber": 7
      };

      var key;
      recalculatePosition();

      for (key in internalBst) {
        if (key == "root")
          continue;

        var currentVertex = internalBst[key];
        graphWidget.addVertex(currentVertex["cx"], currentVertex["cy"], key, currentVertex["vertexClassNumber"], true);
      }

      for (key in internalBst) {
        if (key == "root")
          continue;

        var currentVertex = internalBst[key];
        var parentVertex = internalBst[currentVertex["parent"]];
        if (currentVertex["parent"] == null)
          continue;

        graphWidget.addEdge(parentVertex["vertexClassNumber"], currentVertex["vertexClassNumber"], currentVertex["vertexClassNumber"], EDGE_TYPE_UDE, 1, true);
      }

      amountVertex = 8;
    }

    this.generate = function(array) { init(array); };

    this.generateEmpty = function() {
      var vertexAmt = 0;
      var initArr = [];
      init(initArr);
      return true;
    };

    this.generateRandom = function() {
      var vertexAmt = Math.floor((Math.random() * 7 + 5));
      var initArr = [];

      while (initArr.length < vertexAmt) {
        var random = Math.floor(1 + Math.random() * 98);
        if ($.inArray(random, initArr) < 0)
          initArr.push(random);
      }

      if (isAVL) {
        var initArrAvl = [];

        function recursion(startVal, endVal) {
          var total = startVal + endVal + 1;
          if (total < 1)
            return;
          if (startVal > endVal)
            return;
          if (total == 1)
            initArrAvl.push(initArr[startVal]);
          else if (total % 2 != 0) {
            initArrAvl.push(initArr[parseInt(total / 2)]);
            recursion(startVal, parseInt(total / 2) - 1);
            recursion(parseInt(total / 2) + 1, endVal);
          }
          else {
            initArrAvl.push(initArr[parseInt(total / 2) - 1]);
            recursion(startVal, parseInt(total / 2) - 2);
            recursion(parseInt(total / 2), endVal);
          }
        }

        function sortNumber(a, b) { return a-b; }
        initArr.sort(sortNumber);
        recursion(0, initArr.length-1);
        init(initArrAvl);
      }
      else
        init(initArr);

      return true;
    }

    this.generateSkewed = function(side) {
      if (isAVL) {
        $('#create-err').html("AVL trees are not skewed. Select the BST header to use this action.");
        return false;
      } else {
        var vertexAmt = Math.floor((Math.random() * 3 + 3));
        var initArr = new Array();
        while (initArr.length < vertexAmt) {
          var random = Math.floor(1 + Math.random() * 98);
          if ($.inArray(random, initArr) < 0)
            initArr.push(random);
        }
        if (side == "left") {
          initArr.sort(function(a, b) {
            return b - a
          });
        } else if (side == "right") {
          initArr.sort(function(a, b) {
            return a - b
          });
        }
        init(initArr);
        return true;
      }
    };

    this.isAVL = function(bool) {
      if (typeof bool != 'boolean')
        return;

      if (bool != isAVL) {
        clearScreen();
        if (bool)
          init(initialAvlArray);
        else
          init(initialArray);
        isAVL = bool;
      }
    };

    this.getIsAVL = function() {
      return isAVL;
    };

    this.search = function(vertexText) {
      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = internalBst["root"];
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;
      stateList.push(cs);

      while (currentVertex != vertexText && currentVertex != null) {
        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

        vertexTraversed[currentVertex] = true;

        cs["status"] = "将 " + currentVertex + " 和 " + vertexText +" 进行比较";
        cs["lineNo"] = 3;
        stateList.push(cs);

        if (parseInt(vertexText) > parseInt(currentVertex)) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["status"] = currentVertex + " 比 " + vertexText +" 小 ";
          cs["lineNo"] = 5;
          stateList.push(cs);

          currentVertex = internalBst[currentVertex]["rightChild"];
          if (currentVertex == null) {
            cs = createState(internalBst, vertexTraversed, edgeTraversed);
            cs["status"] = "节点 " + vertexText + " 已经为叶节点";
            cs["lineNo"] = 2;
            stateList.push(cs);
            break;
          }

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
          edgeTraversed[edgeHighlighted] = true;

          cs["el"][edgeHighlighted]["animateHighlighted"] = true;
          cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

          cs["status"] = "向右进行搜索";
          cs["lineNo"] = 6;
          stateList.push(cs);
        } else {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["status"] = currentVertex + " 比 " + vertexText +" 更大";
          cs["lineNo"] = 7;
          stateList.push(cs);

          currentVertex = internalBst[currentVertex]["leftChild"];
          if (currentVertex == null) {
            cs = createState(internalBst, vertexTraversed, edgeTraversed);
            cs["status"] = "节点 " + vertexText + " 无法在当前树中找到";
            cs["lineNo"] = 2;
            stateList.push(cs);
            break;
          }

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
          edgeTraversed[edgeHighlighted] = true;

          cs["el"][edgeHighlighted]["animateHighlighted"] = true;
          cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

          cs["status"] = "向左进行搜索";
          cs["lineNo"] = 7;
          stateList.push(cs);
        }
      }

      if (currentVertex != null) {
        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

        cs["status"] = "找到节点 " + vertexText;
        cs["lineNo"] = 4;
        stateList.push(cs);
      }
      // End state

      cs = createState(internalBst);
      cs["status"] = "查找完成";
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);
      populatePseudocode(4);
      return true;
    }

    this.findMin = function() {
      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = internalBst["root"];
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;
      var ans;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;

      stateList.push(cs);

      if (currentVertex == null) {
        cs = createState(internalBst);
        cs["status"] = "树为空，无法找到最小值";
        cs["lineNo"] = 1;
        stateList.push(cs);
        graphWidget.startAnimation(stateList);
        return true;
      }

      while (currentVertex != null) {
        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

        vertexTraversed[currentVertex] = true;

        if (internalBst[currentVertex]["leftChild"] != null) {
          cs["status"] = "节点 "+currentVertex + " 尚有左孩子，不是最小值."
          cs["lineNo"] = 2;
        }
        else {
          ans = currentVertex;
          cs["status"] = "最小值查找成功!"
          cs["lineNo"] = 4;
        }

        currentVertex = internalBst[currentVertex]["leftChild"];

        stateList.push(cs);

        if (currentVertex == null)
          break;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);

        var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
        edgeTraversed[edgeHighlighted] = true;

        cs["el"][edgeHighlighted]["animateHighlighted"] = true;
        cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

        cs["status"] = "向左查找更小的值..."
        cs["lineNo"] = 3;

        stateList.push(cs);
      }

      // End state

      cs = createState(internalBst);
      cs["status"] = "查找最小值成功. 最小值为 " + ans;
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);
      populatePseudocode(2);
      return true;
    }

    this.findMax = function() {
      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = internalBst["root"];
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;
      var ans;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;

      stateList.push(cs);

      if (currentVertex == null) {
        cs = createState(internalBst);
        cs["status"] = "树为空, 无法找到最大值.";
        cs["lineNo"] = 1;
        stateList.push(cs);
        graphWidget.startAnimation(stateList);
        return true;
      }

      while (currentVertex != null) {
        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

        vertexTraversed[currentVertex] = true;

        if (internalBst[currentVertex]["rightChild"] != null) {
          cs["status"] = "节点 "+currentVertex + " 尚有右孩子，不是最大值"
          cs["lineNo"] = 2;
        }
        else {
          ans = currentVertex;
          cs["status"] = "查找最大值成功!"
          cs["lineNo"] = 4;
        }

        currentVertex = internalBst[currentVertex]["rightChild"];

        stateList.push(cs);

        if (currentVertex == null)
          break;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);

        var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
        edgeTraversed[edgeHighlighted] = true;

        cs["el"][edgeHighlighted]["animateHighlighted"] = true;
        cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

        cs["status"] = "向右寻找更大的值..."
        cs["lineNo"] = 3;

        stateList.push(cs);
      }

      // End state

      cs = createState(internalBst);
      cs["status"] = "查找最大值成功. 最大值为 " + ans;
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);
      populatePseudocode(1);
      return true;
    }

    this.findPredecessor = function(vertexText) {
      vertexText = parseInt(vertexText);

      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = vertexText;
      var cs = createState(internalBst);
      var currentVertexClass;
      var vertexTextClass;
      var key;
      var ans;

      if (vertexText == null || vertexText == undefined || isNaN(vertexText)) {
        $('#pred-err').html("请输入合法的数字!");
        return false;
      }

      if (internalBst[vertexText] == null) {
        $('#pred-err').html("请输入当前二叉树存在的数字!");
        return false;
      }

      vertexTextClass = internalBst[vertexText]["vertexClassNumber"];

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;

      stateList.push(cs);

      if (internalBst[vertexText]["leftChild"] != null) {
        var leftChildVertex = internalBst[vertexText]["leftChild"];
        var leftChildVertexClass = internalBst[leftChildVertex]["vertexClassNumber"];

        edgeTraversed[leftChildVertexClass] = true;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["el"][leftChildVertexClass]["animateHighlighted"] = true;
        cs["status"] = "顶点存在左孩子,从左边执行.";
        cs["lineNo"] = 1;
        stateList.push(cs);

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["vl"][leftChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["status"] = "检查左孩子是否拥有右孩子节点..";
        cs["lineNo"] = 1;
        stateList.push(cs);

        if (internalBst[leftChildVertex]["rightChild"] != null) {
          currentVertex = leftChildVertex;
          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][leftChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "右孩子被找到! 从右边开始..";
          cs["lineNo"] = 1;
          stateList.push(cs);

          while (internalBst[currentVertex]["rightChild"] != null) {
            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

            vertexTraversed[currentVertex] = true;

            cs["status"] = currentVertex + " 有右孩子，所以不是前驱元素."
            cs["lineNo"] = 1;

            stateList.push(cs);

            currentVertex = internalBst[currentVertex]["rightChild"];
            currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            var edgeHighlighted = currentVertexClass;
            edgeTraversed[edgeHighlighted] = true;

            cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][edgeHighlighted]["animateHighlighted"] = true;
            cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

            cs["status"] = "从右边查找更大的值..."
            cs["lineNo"] = 1;

            stateList.push(cs);
          }

          ans = currentVertex;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "前驱节点查找成功!";
          cs["lineNo"] = 1;
          stateList.push(cs);
        }

        else {
          ans = leftChildVertex;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][leftChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "无法找到右孩子, 所以本节点就是前驱节点.";
          cs["lineNo"] = 1;
          stateList.push(cs);
        }
      }

      else {
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        edgeTraversed[currentVertexClass] = true;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["el"][currentVertexClass]["state"] = EDGE_HIGHLIGHTED;
        cs["status"] = "无法找到右孩子, 查找其双亲节点..";
        cs["lineNo"] = [2, 3];
        stateList.push(cs);

        currentVertex = internalBst[currentVertex]["parent"];
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        while (true) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          vertexTraversed[currentVertex] = true;

          if (currentVertex > vertexText) {
            cs["status"] = currentVertex + " is not the predecessor vertex as " + vertexText + " is part of the left sub-tree";
            cs["lineNo"] = 4;
            stateList.push(cs);
          }

          else {
            ans = currentVertex;

            cs["status"] = "前驱节点查找成功!";
            cs["lineNo"] = 7;
            stateList.push(cs);
            break;
          }

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = currentVertexClass;
          if (currentVertex != internalBst["root"])
            edgeTraversed[edgeHighlighted] = true;

          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          if (currentVertex != internalBst["root"])
            cs["el"][edgeHighlighted]["state"] = EDGE_HIGHLIGHTED;

          cs["status"] = "Go up to check for smaller value..."
          cs["lineNo"] = 5;

          stateList.push(cs);

          currentVertex = internalBst[currentVertex]["parent"];

          if (currentVertex == null)
            break;

          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];
        }

        if (currentVertex == null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "不存在双亲节点," + vertexText + " 没有前驱节点.";
          cs["lineNo"] = 6;
          stateList.push(cs);

          ans = null;
        }
      }

      // End state
      cs = createState(internalBst);
      if (ans != null)
        cs["status"] = "前驱查找完毕，" + vertexText + " 的前驱节点是 " + ans;
      else
        cs["status"] = "前驱查找完毕， " + vertexText + " 没有前驱节点";
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);
      populatePseudocode(9);
      return true;
    }

    this.findSuccessor = function(vertexText) {
      vertexText = parseInt(vertexText);

      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = vertexText;
      var cs = createState(internalBst);
      var currentVertexClass;
      var vertexTextClass;
      var key;
      var ans;

      if (vertexText == null || vertexText == undefined || isNaN(vertexText)) {
        $('#succ-err').html("请输入合法的数字!");
        return false;
      }

      if (internalBst[vertexText] == null) {
        $('#succ-err').html("请输入当前二叉树存在的数字!");
        return false;
      }

      vertexTextClass = internalBst[vertexText]["vertexClassNumber"];

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;

      stateList.push(cs);

      if (internalBst[vertexText]["rightChild"] != null) {
        var rightChildVertex = internalBst[vertexText]["rightChild"];
        var rightChildVertexClass = internalBst[rightChildVertex]["vertexClassNumber"];

        edgeTraversed[rightChildVertexClass] = true;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["el"][rightChildVertexClass]["animateHighlighted"] = true;
        cs["status"] = "节点有右孩子,从右边开始执行";
        cs["lineNo"] = 1;
        stateList.push(cs);

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["vl"][rightChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["status"] = "检查右孩子是否有左孩子...";
        cs["lineNo"] = 1;
        stateList.push(cs);

        if (internalBst[rightChildVertex]["leftChild"] != null) {
          currentVertex = rightChildVertex;
          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][rightChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "找到左孩子!从左边开始执行...";
          cs["lineNo"] = 1;
          stateList.push(cs);

          while (internalBst[currentVertex]["leftChild"] != null) {
            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

            vertexTraversed[currentVertex] = true;

            cs["status"] = currentVertex + " 有左孩子，所以不是后继节点。"
            cs["lineNo"] = 1;

            stateList.push(cs);

            currentVertex = internalBst[currentVertex]["leftChild"];
            currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            var edgeHighlighted = currentVertexClass;
            edgeTraversed[edgeHighlighted] = true;

            cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][edgeHighlighted]["animateHighlighted"] = true;
            cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

            cs["status"] = "从左边检查更小的值..."
            cs["lineNo"] = 1;

            stateList.push(cs);
          }

          ans = currentVertex;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "Successor found!";
          cs["lineNo"] = 1;
          stateList.push(cs);
        }

        else {
          ans = rightChildVertex;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][rightChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "没有找到左孩子，本节点即为后继节点。";
          cs["lineNo"] = 1;
          stateList.push(cs);
        }
      }

      else {
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        edgeTraversed[currentVertexClass] = true;

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
        cs["el"][currentVertexClass]["state"] = EDGE_HIGHLIGHTED;
        cs["status"] = "没有找到右孩子，检查其双亲节点...";
        cs["lineNo"] = [2, 3];
        stateList.push(cs);

        currentVertex = internalBst[currentVertex]["parent"];
        currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        while (true) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          vertexTraversed[currentVertex] = true;

          if (currentVertex < vertexText) {
            cs["status"] ="由 "+vertexText + " 存在于其右子树中，所以 " +currentVertex + "不是后继节点";
            cs["lineNo"] = 4;
            stateList.push(cs);
          }

          else {
            ans = currentVertex;

            cs["status"] = "后继节点查找成功";
            cs["lineNo"] = 7;
            stateList.push(cs);
            break;
          }

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = currentVertexClass;
          if (currentVertex != internalBst["root"])
            edgeTraversed[edgeHighlighted] = true;

          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          if (currentVertex != internalBst["root"])
            cs["el"][edgeHighlighted]["state"] = EDGE_HIGHLIGHTED;

          cs["status"] = "向上检查更小的值..."
          cs["lineNo"] = 5;

          stateList.push(cs);

          currentVertex = internalBst[currentVertex]["parent"];

          if (currentVertex == null)
            break;

          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];
        }

        if (currentVertex == null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][vertexTextClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["status"] = "不存在双亲节点, " + vertexText + " 没有后继节点。";
          cs["lineNo"] = 6;
          stateList.push(cs);

          ans = null;
        }
      }

      // End state
      cs = createState(internalBst);
      if (ans != null)
        cs["status"] = "查找结束, " + vertexText + " 的后继节点为 " + ans;
      else
        cs["status"] = "查找结束， " + vertexText + " 没有后继节点";
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);
      populatePseudocode(8);
      return true;
    }

    this.inorderTraversal = function() {
      var stateList = [];
      var vertexTraversed = {};
      var vertexHighlighted = {};
      var edgeTraversed = {};
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;

      stateList.push(cs);

      if (internalBst["root"] == null) {
        cs = createState(internalBst);
        cs["status"] = "树为空";
        cs["lineNo"] = 1;
        stateList.push(cs);

        cs = createState(internalBst);
        cs["status"] = "返回空值.";
        cs["lineNo"] = 2;
        stateList.push(cs);
        return true;
      }

      else {
        currentVertexClass = internalBst[internalBst["root"]]["vertexClassNumber"];

        cs = createState(internalBst);
        cs["vl"][currentVertexClass]["state"] = VERTEX_TRAVERSED;
        cs["status"] = "根节点 " + internalBst["root"] + " 不为空";
        cs["lineNo"] = 1;

        stateList.push(cs);

        cs = createState(internalBst);
        cs["vl"][currentVertexClass]["state"] = VERTEX_TRAVERSED;
        cs["status"] = "递归检查 " + internalBst["root"]+" 的左孩子";
        cs["lineNo"] = 3;
        stateList.push(cs);

        inorderTraversalRecursion(internalBst["root"]);
      }

      cs = createState(internalBst);
      cs["status"] = "中序遍历二叉树完成.";
      cs["lineNo"] = 0;
      stateList.push(cs);

      graphWidget.startAnimation(stateList);

      function inorderTraversalRecursion(currentVertex) {
        var currentVertexLeftChild = internalBst[currentVertex]["leftChild"];
        var currentVertexRightChild = internalBst[currentVertex]["rightChild"];
        var currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

        if (currentVertexLeftChild == null) {
          vertexTraversed[currentVertex] = true;
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] =  currentVertex + " 左孩子为空";
          cs["lineNo"] = 1;
          stateList.push(cs);

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] = "返回空值";
          cs["lineNo"] = 2;
          stateList.push(cs);
        } else {
          var currentVertexLeftChildClass = internalBst[currentVertexLeftChild]["vertexClassNumber"];

          vertexTraversed[currentVertex] = true;
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] = + currentVertex + " 的左孩子是 " + currentVertexLeftChild + "（非空）";
          cs["lineNo"] = 1;
          stateList.push(cs);
          edgeTraversed[currentVertexLeftChildClass] = true;
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["el"][currentVertexLeftChildClass]["animateHighlighted"] = true;
          inorderHighlightVertex();
          cs["status"] = " 递归检查 " + currentVertexLeftChild+" 的左孩子";
          cs["lineNo"] = 3;
          stateList.push(cs);
          inorderTraversalRecursion(currentVertexLeftChild);
        }

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        vertexHighlighted[currentVertexClass] = true;
        inorderHighlightVertex();
        cs["status"] = " 访问节点 " + currentVertex;
        cs["lineNo"] = 4;
        stateList.push(cs);

        if (currentVertexRightChild == null) {
          vertexTraversed[currentVertex] = true;
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] = + currentVertex + " 的右孩子为空";
          cs["lineNo"] = 1;
          stateList.push(cs);

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] = "返回空值";
          cs["lineNo"] = 2;
          stateList.push(cs);
        } else {
          var currentVertexRightChildClass = internalBst[currentVertexRightChild]["vertexClassNumber"];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          inorderHighlightVertex();
          cs["status"] = currentVertex + " 的右孩子是 " + currentVertexRightChild + " （非空）";
          cs["lineNo"] = 1;
          stateList.push(cs);
          edgeTraversed[currentVertexRightChildClass] = true;
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["el"][currentVertexRightChildClass]["animateHighlighted"] = true;
          inorderHighlightVertex();
          cs["status"] = "递归检查 " + currentVertexRightChild +" 的左孩子";
          cs["lineNo"] = 3;
          stateList.push(cs);
          inorderTraversalRecursion(currentVertexRightChild);
        }

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        if (currentVertex != internalBst["root"])
          cs["el"][currentVertexClass]["state"] = EDGE_HIGHLIGHTED;
        inorderHighlightVertex();

        cs["status"] = "中序遍历 " + currentVertex + " 成功";
        cs["lineNo"] = 0;
        stateList.push(cs);
      }

      function inorderHighlightVertex() {
        var key;

        for (key in vertexHighlighted) {
          cs["vl"][key]["state"] = VERTEX_HIGHLIGHTED;
        }
      }
      populatePseudocode(3);
      return true;
    }

    this.insertArr = function(vertexTextArr) {
      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = internalBst["root"];
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;
      var i;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;
      stateList.push(cs);

      // Check whether input is array
      if (Object.prototype.toString.call(vertexTextArr) != '[object Array]') {
        $('#insert-err').html("请输入一个合法的数字或数组！");
        return false;
      }

      // Loop through all array values and...

      var tempInternalBst = deepCopy(internalBst); // Use this to simulate internal insertion

      for (i = 0; i < vertexTextArr.length; i++) {
        var vt = parseInt(vertexTextArr[i]);

        // 1. Check whether value is number
        if (isNaN(vt)) {
          $('#insert-err').html("请输入一个合法的数字或数组！");
          return false;
        }

        // 2. No duplicates allowed. Also works if more than one similar value are inserted
        if (tempInternalBst[vt] != null) {
          $('#insert-err').html("无法插入重复的数字！");
          return false;
        }

        // 3. Check range
        if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
          $('#insert-err').html("对不起，只能插入 " + valueRange[0] + " 到 " + valueRange[1] + " 的数字");
          return false;
        }

        // 4. Insert the node into temporary internal structure and check for height
        var parentVertex = tempInternalBst["root"];
        var heightCounter = 0;

        if (parentVertex == null) {
          tempInternalBst["root"] = parseInt(vt);
          tempInternalBst[vt] = {
            "parent": null,
            "leftChild": null,
            "rightChild": null
          };
        }

        else {
          while (true) {
            heightCounter++;
            if (parentVertex < vt) {
              if (tempInternalBst[parentVertex]["rightChild"] == null)
                break;
              parentVertex = tempInternalBst[parentVertex]["rightChild"];
            }
            else {
              if (tempInternalBst[parentVertex]["leftChild"] == null)
                break;
              parentVertex = tempInternalBst[parentVertex]["leftChild"];
            }
          }

          if (parentVertex < vt)
            tempInternalBst[parentVertex]["rightChild"] = vt;
          else
            tempInternalBst[parentVertex]["leftChild"] = vt;

          tempInternalBst[vt] = {
            "parent": parentVertex,
            "leftChild": null,
            "rightChild": null
          }
        }

        heightCounter++; // New vertex added will add new height

        if (heightCounter > maxHeightAllowed) {
          $('#insert-err').html("Sorry, this visualization can only support tree of maximum height " + maxHeightAllowed);
          return false;
        }
      }

      function checkNewHeight() {
        var parentVertex = tempInternalBst["root"];
        var heightCounter = 0;

        while (parentVertex != null) {
          if (parentVertex < parseInt(vertexText))
            parentVertex = tempInternalBst[parentVertex]["rightChild"];
          else
            parentVertex = tempInternalBst[parentVertex]["leftChild"];
          heightCounter++;
        }

        heightCounter++; // New vertex added will add new height

        if (heightCounter > maxHeightAllowed)
          return false;
        return true;
      }

      for (i = 0; i < vertexTextArr.length; i++) {
        var vertexText = parseInt(vertexTextArr[i]);

        // Re-initialization
        vertexTraversed = {};
        edgeTraversed = {};
        currentVertex = internalBst["root"];
        cs = createState(internalBst);

        // Find parent
        while (currentVertex != vertexText && currentVertex != null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          vertexTraversed[currentVertex] = true;

          cs["status"] = "将 " + vertexText + " 与 " + currentVertex+"进行比较";
          if (!isAVL) {
            cs["lineNo"] = 3;
          } else {
            cs["lineNo"] = 1;
          }

          stateList.push(cs);

          var nextVertex;
          if (parseInt(vertexText) > parseInt(currentVertex))
            nextVertex = internalBst[currentVertex]["rightChild"];
          else
            nextVertex = internalBst[currentVertex]["leftChild"];

          if (nextVertex == null)
            break;
          else
            currentVertex = nextVertex;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
          edgeTraversed[edgeHighlighted] = true;

          cs["el"][edgeHighlighted]["animateHighlighted"] = true;
          cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

          if (parseInt(vertexText) > parseInt(internalBst[currentVertex]["parent"])) {
            cs["status"] = vertexText +  " 比 " + internalBst[currentVertex]["parent"] + "更大, 从右边执行.";
            if (!isAVL) {
              cs["lineNo"] = 5;
            } else {
              cs["lineNo"] = 1;
            }
          }
          else {
            cs["status"] = vertexText + " 比 " + internalBst[currentVertex]["parent"] + "更小, 从左边执行.";
            if (!isAVL) {
              cs["lineNo"] = 4;
            } else {
              cs["lineNo"] = 1;
            }
          }


          stateList.push(cs);
        }

        // Begin insertion

        // First, update internal representation

        internalBst[parseInt(vertexText)] = {
          "leftChild": null,
          "rightChild": null,
          "vertexClassNumber": amountVertex
        };

        if (currentVertex != null) {
          internalBst[parseInt(vertexText)]["parent"] = currentVertex;
          if (currentVertex < parseInt(vertexText))
            internalBst[currentVertex]["rightChild"] = parseInt(vertexText);
          else
            internalBst[currentVertex]["leftChild"] = parseInt(vertexText);
        }

        else {
          internalBst[parseInt(vertexText)]["parent"] = null;
          internalBst["root"] = parseInt(vertexText);
        }

        amountVertex++;

        recalculatePosition();

        // Then, draw edge
        var newNodeVertexClass = internalBst[parseInt(vertexText)]["vertexClassNumber"];

        if (currentVertex != null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["vl"][newNodeVertexClass]["state"] = OBJ_HIDDEN;

          cs["el"][newNodeVertexClass]["state"] = EDGE_TRAVERSED;
          cs["el"][newNodeVertexClass]["animateHighlighted"] = true;

          cs["status"] = "定位成功! 插入 " + vertexText + " ...";
          cs["lineNo"] = 1;

          stateList.push(cs);

          edgeTraversed[newNodeVertexClass] = true;
        }

        // Lastly, draw vertex

        cs = createState(internalBst, vertexTraversed, edgeTraversed);
        cs["vl"][newNodeVertexClass]["state"] = EDGE_HIGHLIGHTED;

        cs["status"] = vertexText + " 插入成功!"
        if (!isAVL) {
          cs["lineNo"] = 2;
        } else {
          cs["lineNo"] = 1;
        }

        stateList.push(cs);

        // End State
        cs = createState(internalBst);
        cs["status"] = "插入 " + vertexText + " 完成"
        if (isAVL) {
          cs["lineNo"] = 1;
        }
        stateList.push(cs);

        if (isAVL) {
          recalculateBalanceFactor();

          var vertexCheckBf = internalBst[vertexText]["parent"];

          while (vertexCheckBf != null) {
            var vertexCheckBfClass = internalBst[vertexCheckBf]["vertexClassNumber"];

            var bf = internalBst[vertexCheckBf]["balanceFactor"];

            cs = createState(internalBst);
            cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = vertexCheckBf + " 的平衡因子是 " + bf + ".";
            cs["lineNo"] = 2;
            stateList.push(cs);

            if (bf == 2) {
              var vertexCheckBfLeft = internalBst[vertexCheckBf]["leftChild"];
              var vertexCheckBfLeftClass = internalBst[vertexCheckBfLeft]["vertexClassNumber"];
              var bfLeft = internalBst[vertexCheckBfLeft]["balanceFactor"];

              cs = createState(internalBst);
              cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["status"] = vertexCheckBfLeft + "的平衡因子是" + bfLeft + ".";
              cs["lineNo"] = 2;
              stateList.push(cs);

              if (bfLeft == 1 || bfLeft == 0) {
                rotateRight(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeft)
                  cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 3;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeft)
                  cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 3;
                stateList.push(cs);
              }

              else if (bfLeft == -1) {
                var vertexCheckBfLeftRight = internalBst[vertexCheckBfLeft]["rightChild"];
                var vertexCheckBfLeftRightClass = internalBst[vertexCheckBfLeftRight]["vertexClassNumber"];

                rotateLeft(vertexCheckBfLeft);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBfLeft + ".";
                cs["lineNo"] = 4;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 4;
                stateList.push(cs);

                rotateRight(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeftRight)
                  cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 4;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeftRight)
                  cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 4;
                stateList.push(cs);
              }
            }

            else if (bf == -2) {
              var vertexCheckBfRight = internalBst[vertexCheckBf]["rightChild"];
              var vertexCheckBfRightClass = internalBst[vertexCheckBfRight]["vertexClassNumber"];
              var bfRight = internalBst[vertexCheckBfRight]["balanceFactor"];

              cs = createState(internalBst);
              cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["status"] = "并且" + vertexCheckBfRight + " 的平衡因子是 " + bfRight + ".";
              cs["lineNo"] = 2;
              stateList.push(cs);

              if (bfRight == 1) {
                var vertexCheckBfRightLeft = internalBst[vertexCheckBfRight]["leftChild"];
                var vertexCheckBfRightLeftClass = internalBst[vertexCheckBfRightLeft]["vertexClassNumber"];

                rotateRight(vertexCheckBfRight);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBfRight + ".";
                cs["lineNo"] = 6;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 6;
                stateList.push(cs);

                rotateLeft(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRightLeft)
                  cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 6;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRightLeft)
                  cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 6;
                stateList.push(cs);
              }

              else if (bfRight == -1 || bfRight == 0) {
                rotateLeft(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRight)
                  cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 5;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);

                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRight)
                  cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 5;
                stateList.push(cs);
              }
            }

            if (vertexCheckBf != internalBst["root"]) {
              cs = createState(internalBst);
              cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
              cs["status"] = "检查其双亲节点";
              cs["lineNo"] = 2;
              stateList.push(cs);
            }

            vertexCheckBf = internalBst[vertexCheckBf]["parent"];
          }

          cs = createState(internalBst);
          cs["status"] = "现在树是平衡的了！";
          cs["lineNo"] = 7;
          stateList.push(cs);
        }
      }

      graphWidget.startAnimation(stateList);
      if (isAVL) {
        populatePseudocode(6);
      } else {
        populatePseudocode(0);
      }
      return true;
    }

    this.removeArr = function(vertexTextArr) {
      var stateList = [];
      var vertexTraversed = {};
      var edgeTraversed = {};
      var currentVertex = internalBst["root"];
      var cs = createState(internalBst);
      var currentVertexClass;
      var key;
      var i;

      cs["status"] = "算法开始！";
      cs["lineNo"] = 0;
      stateList.push(cs);

      if (Object.prototype.toString.call(vertexTextArr) != '[object Array]') {
        $('#remove-err').html("Please fill in a number or comma-separated array of numbers!");
        return false;
      }

      // Loop through all array values and...

      for (i = 0; i < vertexTextArr.length; i++) {
        var vt = parseInt(vertexTextArr[i]);

        // Check whether value is number
        if (isNaN(vt)) {
          $('#remove-err').html("Please fill in a number or comma-separated array of numbers!");
          return false;
        }

        // Other checks not required
      }

      for (i = 0; i < vertexTextArr.length; i++) {
        var vertexText = parseInt(vertexTextArr[i]);
        var vertexCheckBf;

        // Re-initialization
        vertexTraversed = {};
        edgeTraversed = {};
        currentVertex = internalBst["root"];
        cs = createState(internalBst);

        // Find vertex
        while (currentVertex != vertexText && currentVertex != null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          vertexTraversed[currentVertex] = true;

          cs["status"] = "查找并删除节点 " + vertexText;
          cs["lineNo"] = 1;
          stateList.push(cs);

          if (parseInt(vertexText) > parseInt(currentVertex))
            currentVertex = internalBst[currentVertex]["rightChild"];
          else
            currentVertex = internalBst[currentVertex]["leftChild"];

          if (currentVertex == null)
            break;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var edgeHighlighted = internalBst[currentVertex]["vertexClassNumber"];
          edgeTraversed[edgeHighlighted] = true;

          cs["el"][edgeHighlighted]["animateHighlighted"] = true;
          cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;

          cs["status"] = "查找并删除节点 " + vertexText;
          cs["lineNo"] = 1;
          stateList.push(cs);
        }

        if (currentVertex != null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];

          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          cs["status"] = "查找并删除节点 " + vertexText ;
          cs["lineNo"] = 1;
          stateList.push(cs);
        }

        // Vertex is not inside the tree
        else {
          cs = createState(internalBst);
          cs["status"] = "节点 " + vertexText + " 不在二叉树中";
          cs["lineNo"] = 0;
          stateList.push(cs);
          continue;
        }

        // Vertex found; begin deletion

        // Case 1: no child

        if (internalBst[currentVertex]["leftChild"] == null && internalBst[currentVertex]["rightChild"] == null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["status"] = "节点 " + vertexText + " 没有子节点. 是叶节点.";
          if (!isAVL) {
            cs["lineNo"] = 2;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          var parentVertex = internalBst[currentVertex]["parent"];

          if (parentVertex != null) {
            if (parseInt(parentVertex) < parseInt(currentVertex))
              internalBst[parentVertex]["rightChild"] = null;
            else
              internalBst[parentVertex]["leftChild"] = null;
          }

          else
            internalBst["root"] = null;

          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];
          delete internalBst[currentVertex];
          delete vertexTraversed[currentVertex];
          delete edgeTraversed[currentVertexClass];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["status"] = "删除叶节点 " + vertexText;
          if (!isAVL) {
            cs["lineNo"] = 3;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          vertexCheckBf = parentVertex;
        }

        // Case 2: One child

        // Only right child

        else if (internalBst[currentVertex]["leftChild"] == null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["status"] = "节点 " + vertexText + " 只有一个右节点";
          if (!isAVL) {
            cs["lineNo"] = 4;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          var parentVertex = internalBst[currentVertex]["parent"];
          var rightChildVertex = internalBst[currentVertex]["rightChild"];

          if (parentVertex != null) {
            if (parseInt(parentVertex) < parseInt(currentVertex))
              internalBst[parentVertex]["rightChild"] = rightChildVertex;
            else
              internalBst[parentVertex]["leftChild"] = rightChildVertex;
          }

          else
            internalBst["root"] = rightChildVertex;

          internalBst[rightChildVertex]["parent"] = parentVertex;

          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];
          rightChildVertexClass = internalBst[rightChildVertex]["vertexClassNumber"];
          delete internalBst[currentVertex];
          delete vertexTraversed[currentVertex];
          delete edgeTraversed[currentVertexClass];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][rightChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          if (parentVertex != null) {
            cs["el"][rightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          cs["status"] = "删除节点 " + vertexText + " ，并将其双亲节点与右孩子连接";
          if (!isAVL) {
            cs["lineNo"] = 5;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          recalculatePosition();

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][rightChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          if (parentVertex != null) {
            cs["el"][rightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          cs["status"] = "从新布局二叉树";
          if (!isAVL) {
            cs["lineNo"] = 5;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          vertexCheckBf = rightChildVertex;
        }

        // Only left child

        else if (internalBst[currentVertex]["rightChild"] == null) {
          cs = createState(internalBst, vertexTraversed, edgeTraversed);
          cs["status"] = "节点 " + vertexText + " 只有一个左孩子";
          if (!isAVL) {
            cs["lineNo"] = 4;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          var parentVertex = internalBst[currentVertex]["parent"];
          var leftChildVertex = internalBst[currentVertex]["leftChild"];

          if (parentVertex != null) {
            if (parseInt(parentVertex) < parseInt(currentVertex))
              internalBst[parentVertex]["rightChild"] = leftChildVertex;
            else
              internalBst[parentVertex]["leftChild"] = leftChildVertex;
          }

          else
            internalBst["root"] = leftChildVertex;

          internalBst[leftChildVertex]["parent"] = parentVertex;

          currentVertexClass = internalBst[currentVertex]["vertexClassNumber"];
          leftChildVertexClass = internalBst[leftChildVertex]["vertexClassNumber"];
          delete internalBst[currentVertex];
          delete vertexTraversed[currentVertex];
          delete edgeTraversed[currentVertexClass];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][leftChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          if (parentVertex != null) {
            cs["el"][leftChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          cs["status"] = "删除节点 " + vertexText + " 并将其双亲节点与左孩子连接";
          if (!isAVL) {
            cs["lineNo"] = 5;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          recalculatePosition();

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][leftChildVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          if (parentVertex != null) {
            cs["el"][leftChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          cs["status"] = "从新布局二叉树";
          if (!isAVL) {
            cs["lineNo"] = 5;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          vertexCheckBf = leftChildVertex;
        }

        // Case 3: two children

        else {
          var parentVertex = internalBst[currentVertex]["parent"];
          var leftChildVertex = internalBst[currentVertex]["leftChild"];
          var rightChildVertex = internalBst[currentVertex]["rightChild"];
          var successorVertex = internalBst[currentVertex]["rightChild"];
          var successorVertexClass = internalBst[successorVertex]["vertexClassNumber"];

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          cs["el"][successorVertexClass]["state"] = EDGE_TRAVERSED;
          cs["el"][successorVertexClass]["animateHighlighted"] = true;

          cs["status"] = "寻找 " + vertexText + "的后继结点";
          if (!isAVL) {
            cs["lineNo"] = 6;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          edgeTraversed[successorVertexClass] = true;
          vertexTraversed[successorVertex] = true;

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
          cs["vl"][successorVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          cs["status"] = "寻找 " + vertexText + "的后继结点";
          if (!isAVL) {
            cs["lineNo"] = 6;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          while (internalBst[successorVertex]["leftChild"] != null) {
            successorVertex = internalBst[successorVertex]["leftChild"];
            successorVertexClass = internalBst[successorVertex]["vertexClassNumber"];

            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

            cs["el"][successorVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][successorVertexClass]["animateHighlighted"] = true;

            cs["status"] = "寻找" + vertexText + "的后继结点";
            if (!isAVL) {
              cs["lineNo"] = 6;
            } else {
              cs["lineNo"] = 1;
            }
            stateList.push(cs);

            edgeTraversed[successorVertexClass] = true;
            vertexTraversed[successorVertex] = true;

            cs = createState(internalBst, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][successorVertexClass]["state"] = VERTEX_HIGHLIGHTED;

            cs["status"] = "寻找" + vertexText + "的后继结点";
            if (!isAVL) {
              cs["lineNo"] = 6;
            } else {
              cs["lineNo"] = 1;
            }
            stateList.push(cs);
          }

          var successorParentVertex = internalBst[successorVertex]["parent"]
          var successorRightChildVertex = internalBst[successorVertex]["rightChild"];

          // Update internal representation
          if (parentVertex != null) {
            if (parseInt(parentVertex) < parseInt(currentVertex))
              internalBst[parentVertex]["rightChild"] = successorVertex;
            else
              internalBst[parentVertex]["leftChild"] = successorVertex;
          }

          else
            internalBst["root"] = successorVertex;

          internalBst[successorVertex]["parent"] = parentVertex;
          internalBst[successorVertex]["leftChild"] = leftChildVertex;

          internalBst[leftChildVertex]["parent"] = successorVertex;

          if (successorVertex != rightChildVertex) {
            internalBst[successorVertex]["rightChild"] = rightChildVertex;
            internalBst[rightChildVertex]["parent"] = successorVertex;

            if (successorRightChildVertex != null) {
              if (parseInt(successorParentVertex) < parseInt(successorVertex))
                internalBst[successorParentVertex]["rightChild"] = successorRightChildVertex;
              else
                internalBst[successorParentVertex]["leftChild"] = successorRightChildVertex;

              internalBst[successorRightChildVertex]["parent"] = successorParentVertex;
            }

            else {
              if (parseInt(successorParentVertex) < parseInt(successorVertex))
                internalBst[successorParentVertex]["rightChild"] = null;
              else
                internalBst[successorParentVertex]["leftChild"] = null;
            }
          }

          delete internalBst[currentVertex];
          delete vertexTraversed[currentVertex];
          delete edgeTraversed[currentVertexClass];

          if (parentVertex == null) {
            delete edgeTraversed[successorVertexClass];
          }

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          var leftChildVertexClass = internalBst[leftChildVertex]["vertexClassNumber"];

          cs["vl"][successorVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          cs["el"][leftChildVertexClass]["state"] = EDGE_HIGHLIGHTED;

          if (parentVertex != null) {
            var parentVertexClass = internalBst[parentVertex]["vertexClassNumber"];
            cs["el"][successorVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          if (successorVertex != rightChildVertex) {
            var rightChildVertexClass = internalBst[rightChildVertex]["vertexClassNumber"];
            cs["el"][rightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;

            if (successorRightChildVertex != null) {
              var successorRightChildVertexClass = internalBst[successorRightChildVertex]["vertexClassNumber"];
              cs["el"][successorRightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
            }
          }

          cs["status"] = "用 " + vertexText + " 的后继替换" + vertexText;
          if (!isAVL) {
            cs["lineNo"] = 6;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          recalculatePosition();

          cs = createState(internalBst, vertexTraversed, edgeTraversed);

          leftChildVertexClass = internalBst[leftChildVertex]["vertexClassNumber"];

          cs["vl"][successorVertexClass]["state"] = VERTEX_HIGHLIGHTED;

          cs["el"][leftChildVertexClass]["state"] = EDGE_HIGHLIGHTED;

          if (parentVertex != null) {
            var parentVertexClass = internalBst[parentVertex]["vertexClassNumber"];
            cs["el"][successorVertexClass]["state"] = EDGE_HIGHLIGHTED;
          }

          if (successorVertex != rightChildVertex) {
            var rightChildVertexClass = internalBst[rightChildVertex]["vertexClassNumber"];
            cs["el"][rightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;

            if (successorRightChildVertex != null) {
              var successorRightChildVertexClass = internalBst[successorRightChildVertex]["vertexClassNumber"];
              cs["el"][successorRightChildVertexClass]["state"] = EDGE_HIGHLIGHTED;
            }
          }

          cs["status"] = "重新摆放这棵树";
          if (!isAVL) {
            cs["lineNo"] = 6;
          } else {
            cs["lineNo"] = 1;
          }
          stateList.push(cs);

          vertexCheckBf = successorVertex;
          if (successorVertex != rightChildVertex)
            vertexCheckBf = successorParentVertex;
        }

        cs = createState(internalBst);
        cs["status"] = "已成功移除" + vertexText;
        if (!isAVL) {
          cs["lineNo"] = 0;
        } else {
          cs["lineNo"] = 1;
        }
        stateList.push(cs);

        if (isAVL) {
          recalculateBalanceFactor();
          console.log(internalBst);

          while (vertexCheckBf != null) {
            var vertexCheckBfClass = internalBst[vertexCheckBf]["vertexClassNumber"];

            var bf = internalBst[vertexCheckBf]["balanceFactor"];

            cs = createState(internalBst);
            cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = vertexCheckBf + "的平衡因子是" + bf + ".";
            cs["lineNo"] = 2;
            stateList.push(cs);

            if (bf == 2) {
              var vertexCheckBfLeft = internalBst[vertexCheckBf]["leftChild"];
              var vertexCheckBfLeftClass = internalBst[vertexCheckBfLeft]["vertexClassNumber"];
              var bfLeft = internalBst[vertexCheckBfLeft]["balanceFactor"];

              cs = createState(internalBst);
              cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["status"] = "并且" + vertexCheckBfLeft + " 的平衡因子是" + bfLeft + ".";
              cs["lineNo"] = 2;
              stateList.push(cs);

              if (bfLeft == 1 || bfLeft == 0) {
                rotateRight(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeft)
                  cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 3;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeft)
                  cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 3;
                stateList.push(cs);
              }

              else if (bfLeft == -1) {
                var vertexCheckBfLeftRight = internalBst[vertexCheckBfLeft]["rightChild"];
                var vertexCheckBfLeftRightClass = internalBst[vertexCheckBfLeftRight]["vertexClassNumber"];

                rotateLeft(vertexCheckBfLeft);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBfLeft + ".";
                cs["lineNo"] = 4;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 4;
                stateList.push(cs);

                rotateRight(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeftRight)
                  cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 4;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfLeftRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfLeftRight)
                  cs["el"][vertexCheckBfLeftRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 4;
                stateList.push(cs);
              }
            }

            else if (bf == -2) {
              var vertexCheckBfRight = internalBst[vertexCheckBf]["rightChild"];
              var vertexCheckBfRightClass = internalBst[vertexCheckBfRight]["vertexClassNumber"];
              var bfRight = internalBst[vertexCheckBfRight]["balanceFactor"];

              cs = createState(internalBst);
              cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
              cs["status"] = "并且 " + vertexCheckBfRight + " 的平衡因子是 " + bfRight + ".";
              cs["lineNo"] = 2;
              stateList.push(cs);

              if (bfRight == 1) {
                var vertexCheckBfRightLeft = internalBst[vertexCheckBfRight]["leftChild"];
                var vertexCheckBfRightLeftClass = internalBst[vertexCheckBfRightLeft]["vertexClassNumber"];

                rotateRight(vertexCheckBfRight);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "右旋转 " + vertexCheckBfRight + ".";
                cs["lineNo"] = 6;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 6;
                stateList.push(cs);

                rotateLeft(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRightLeft)
                  cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 6;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightLeftClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRightLeft)
                  cs["el"][vertexCheckBfRightLeftClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 6;
                stateList.push(cs);
              }

              else if (bfRight == -1 || bfRight == 0) {
                rotateLeft(vertexCheckBf);

                cs = createState(internalBst);
                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRight)
                  cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "左旋转 " + vertexCheckBf + ".";
                cs["lineNo"] = 5;
                stateList.push(cs);

                recalculatePosition();

                cs = createState(internalBst);

                cs["vl"][vertexCheckBfClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][vertexCheckBfRightClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
                if (internalBst["root"] != vertexCheckBfRight)
                  cs["el"][vertexCheckBfRightClass]["state"] = EDGE_HIGHLIGHTED;
                cs["status"] = "重新摆放这棵树";
                cs["lineNo"] = 5;
                stateList.push(cs);
              }
            }

            if (vertexCheckBf != internalBst["root"]) {
              cs = createState(internalBst);
              cs["el"][vertexCheckBfClass]["state"] = EDGE_HIGHLIGHTED;
              cs["status"] = "检查其双亲节点";
              cs["lineNo"] = 2;
              stateList.push(cs);
            }

            vertexCheckBf = internalBst[vertexCheckBf]["parent"];
          }

          cs = createState(internalBst);
          cs["status"] = "现在树是平衡的了！";
          cs["lineNo"] = 7;
          stateList.push(cs);
        }
      }

      graphWidget.startAnimation(stateList);
      if (isAVL) {
        populatePseudocode(7);
      } else {
        populatePseudocode(5);
      }
      return true;
    };

    function init(initArr) {
      var i;

      clearScreen();

      for (i = 0; i < initArr.length; i++) {
        var parentVertex = internalBst["root"];
        var newVertex = parseInt(initArr[i]);

        if (parentVertex == null) {
          internalBst["root"] = parseInt(newVertex);
          internalBst[newVertex] = {
            "parent": null,
            "leftChild": null,
            "rightChild": null,
            "vertexClassNumber": amountVertex
          };
        }

        else {
          while (true) {
            if (parentVertex < newVertex) {
              if (internalBst[parentVertex]["rightChild"] == null)
                break;
              parentVertex = internalBst[parentVertex]["rightChild"];
            }
            else {
              if (internalBst[parentVertex]["leftChild"] == null)
                break;
              parentVertex = internalBst[parentVertex]["leftChild"];
            }
          }

          if (parentVertex < newVertex)
            internalBst[parentVertex]["rightChild"] = newVertex;
          else
            internalBst[parentVertex]["leftChild"] = newVertex;

          internalBst[newVertex] = {
            "parent": parentVertex,
            "leftChild": null,
            "rightChild": null,
            "vertexClassNumber": amountVertex
          }
        }

        amountVertex++;
      }

      recalculatePosition();

      for (key in internalBst) {
        if (key == "root")
          continue;
        graphWidget.addVertex(internalBst[key]["cx"], internalBst[key]["cy"], key, internalBst[key]["vertexClassNumber"], true);
      }

      for (key in internalBst) {
        if (key == "root")
          continue;
        if (key == internalBst["root"])
          continue;
        var parentVertex = internalBst[key]["parent"];
        graphWidget.addEdge(internalBst[parentVertex]["vertexClassNumber"], internalBst[key]["vertexClassNumber"], internalBst[key]["vertexClassNumber"], EDGE_TYPE_UDE, 1, true);
      }
    }

    function clearScreen() {
      var key;

      for (key in internalBst) {
        if (key == "root")
          continue;
        graphWidget.removeEdge(internalBst[key]["vertexClassNumber"]);
      }

      for (key in internalBst) {
        if (key == "root")
          continue;
        graphWidget.removeVertex(internalBst[key]["vertexClassNumber"]);
      }

      internalBst = {};
      internalBst["root"] = null;
      amountVertex = 0;
    }

    // Pseudocode for rotateLeft:
    /*
     * BSTVertex rotateLeft(BSTVertex T) // pre-req: T.right != null
     * BSTVertex w = T.right
     * w.parent = T.parent
     * T.parent = w
     * T.right = w.left
     * if (w.left != null) w.left.parent = T
     * w.left = T
     * // Update the height of T and then w
     * return w
     */

    function rotateLeft(vertexText) {
      // Refer to pseudocode

      var t = parseInt(vertexText);
      var w = internalBst[t]["rightChild"];

      internalBst[w]["parent"] = internalBst[t]["parent"];
      if (internalBst[t]["parent"] != null) {
        if (internalBst[t]["parent"] < t) {
          var tParent = internalBst[t]["parent"];
          internalBst[tParent]["rightChild"] = w;
        }

        else {
          var tParent = internalBst[t]["parent"];
          internalBst[tParent]["leftChild"] = w;
        }
      }

      internalBst[t]["parent"] = w;
      internalBst[t]["rightChild"] = internalBst[w]["leftChild"];
      if (internalBst[w]["leftChild"] != null)
        internalBst[internalBst[w]["leftChild"]]["parent"] = t;
      internalBst[w]["leftChild"] = t;

      if (t == internalBst["root"])
        internalBst["root"] = w;

      recalculateBalanceFactor();
    }

    function rotateRight(vertexText) {
      // Refer to pseudocode

      var t = parseInt(vertexText);
      var w = internalBst[t]["leftChild"];

      internalBst[w]["parent"] = internalBst[t]["parent"];
      if (internalBst[t]["parent"] != null) {
        if (internalBst[t]["parent"] < t) {
          var tParent = internalBst[t]["parent"];
          internalBst[tParent]["rightChild"] = w;
        }

        else {
          var tParent = internalBst[t]["parent"];
          internalBst[tParent]["leftChild"] = w;
        }
      }

      internalBst[t]["parent"] = w;
      internalBst[t]["leftChild"] = internalBst[w]["rightChild"];
      if (internalBst[w]["rightChild"] != null)
        internalBst[internalBst[w]["rightChild"]]["parent"] = t;
      internalBst[w]["rightChild"] = t;

      if (t == internalBst["root"])
        internalBst["root"] = w;

      recalculateBalanceFactor();
    }



    function createState(internalBstObject, vertexTraversed, edgeTraversed) {
      if (vertexTraversed == null || vertexTraversed == undefined || !(vertexTraversed instanceof Object))
        vertexTraversed = {};
      if (edgeTraversed == null || edgeTraversed == undefined || !(edgeTraversed instanceof Object))
        edgeTraversed = {};

      var state = {
        "vl": {},
        "el": {}
      };

      var key;
      var vertexClass;

      for (key in internalBstObject) {
        if (key == "root")
          continue;

        vertexClass = internalBstObject[key]["vertexClassNumber"]

        state["vl"][vertexClass] = {};

        state["vl"][vertexClass]["cx"] = internalBstObject[key]["cx"];
        state["vl"][vertexClass]["cy"] = internalBstObject[key]["cy"];
        state["vl"][vertexClass]["text"] = key;
        state["vl"][vertexClass]["state"] = VERTEX_DEFAULT;

        if (internalBstObject[key]["parent"] == null)
          continue;

        parentChildEdgeId = internalBstObject[key]["vertexClassNumber"];

        state["el"][parentChildEdgeId] = {};

        state["el"][parentChildEdgeId]["vertexA"] = internalBstObject[internalBstObject[key]["parent"]]["vertexClassNumber"];
        state["el"][parentChildEdgeId]["vertexB"] = internalBstObject[key]["vertexClassNumber"];
        state["el"][parentChildEdgeId]["type"] = EDGE_TYPE_UDE;
        state["el"][parentChildEdgeId]["weight"] = 1;
        state["el"][parentChildEdgeId]["state"] = EDGE_DEFAULT;
        state["el"][parentChildEdgeId]["animateHighlighted"] = false;
      }

      for (key in vertexTraversed) {
        vertexClass = internalBstObject[key]["vertexClassNumber"];
        state["vl"][vertexClass]["state"] = VERTEX_TRAVERSED;
      }

      for (key in edgeTraversed) {
        state["el"][key]["state"] = EDGE_TRAVERSED;
      }

      return state;
    }

    function recalculatePosition() {
      calcHeight(internalBst["root"], 0);
      updatePosition(internalBst["root"]);

      function calcHeight(currentVertex, currentHeight) {
        if (currentVertex == null)
          return;
        internalBst[currentVertex]["height"] = currentHeight;
        calcHeight(internalBst[currentVertex]["leftChild"], currentHeight + 1);
        calcHeight(internalBst[currentVertex]["rightChild"], currentHeight + 1);
      }

      function updatePosition(currentVertex) {
        if (currentVertex == null)
          return;

        if (currentVertex == internalBst["root"])
          internalBst[currentVertex]["cx"] = MAIN_SVG_WIDTH / 2;
        else {
          var i;
          var xAxisOffset = MAIN_SVG_WIDTH / 2;
          var parentVertex = internalBst[currentVertex]["parent"]
          for (i = 0; i < internalBst[currentVertex]["height"]; i++) {
            xAxisOffset /= 2;
          }

          if (parseInt(currentVertex) > parseInt(parentVertex))
            internalBst[currentVertex]["cx"] = internalBst[parentVertex]["cx"] + xAxisOffset;
          else
            internalBst[currentVertex]["cx"] = internalBst[parentVertex]["cx"] - xAxisOffset;
        }

        internalBst[currentVertex]["cy"] = 50 + 50 * internalBst[currentVertex]["height"];

        updatePosition(internalBst[currentVertex]["leftChild"]);
        updatePosition(internalBst[currentVertex]["rightChild"]);
      }
    }

    function recalculateBalanceFactor() {
      balanceFactorRecursion(internalBst["root"]);

      function balanceFactorRecursion(vertexText) {
        if (vertexText == null)
          return -1;

        var balanceFactorHeightLeft = balanceFactorRecursion(internalBst[vertexText]["leftChild"]);
        var balanceFactorHeightRight = balanceFactorRecursion(internalBst[vertexText]["rightChild"]);

        internalBst[vertexText]["balanceFactorHeight"] = Math.max(balanceFactorHeightLeft, balanceFactorHeightRight) + 1;
        internalBst[vertexText]["balanceFactor"] = balanceFactorHeightLeft - balanceFactorHeightRight;

        return internalBst[vertexText]["balanceFactorHeight"];
      }
    }

    function populatePseudocode(act) {
      switch (act) {
        case 0: // Insert
          document.getElementById('code1').innerHTML = 'if(root==null)';
          document.getElementById('code2').innerHTML = '{return new BTNode(value);}';
          document.getElementById('code3').innerHTML = 'else if(value<root.data)';
          document.getElementById('code4').innerHTML = '&nbsp&nbsp{root.lchild=insertNode(root.lchild,value);}';
          document.getElementById('code5').innerHTML = 'else{root.rchild=insertNode(root.rchild,value);}';
          document.getElementById('code6').innerHTML = '/*return root;该方法为:';
          document.getElementById('code7').innerHTML = 'public BTNode insertNode(BTNode node,int data)*/';
          break;
        case 1: // findMax
          document.getElementById('code1').innerHTML = 'if(this==null){return null;}';
          document.getElementById('code2').innerHTML = 'while(root.right!=null){';
          document.getElementById('code3').innerHTML = '&nbsp&nbsproot=root.right;}';
          document.getElementById('code4').innerHTML = 'return root.data;';
          document.getElementById('code5').innerHTML = '';
          document.getElementById('code6').innerHTML = '';
          document.getElementById('code7').innerHTML = '';
          break;
        case 2: // findMin
          document.getElementById('code1').innerHTML = 'if(this==null){return null;}';
          document.getElementById('code2').innerHTML = 'while(root.left!=null){';
          document.getElementById('code3').innerHTML = '&nbsp&nbsproot=root.left;}';
          document.getElementById('code4').innerHTML = 'return root.data';
          document.getElementById('code5').innerHTML = '';
          document.getElementById('code6').innerHTML = '';
          document.getElementById('code7').innerHTML = '';
          break;
        case 3: // in-order traversal
          document.getElementById('code1').innerHTML = 'if(root==null){';
          document.getElementById('code2').innerHTML = '&nbsp;&nbsp;return null;}';
          document.getElementById('code3').innerHTML = 'inOrder(root.left);';
          document.getElementById('code4').innerHTML = 'System.out.println(root.data);inOrder(root.right);';
          document.getElementById('code5').innerHTML = '';
          document.getElementById('code6').innerHTML = '';
          document.getElementById('code7').innerHTML = '';
          break;
        case 4: // search
          document.getElementById('code1').innerHTML = 'if(this==null){';
          document.getElementById('code2').innerHTML = '&nbsp;&nbsp;return null;}';
          document.getElementById('code3').innerHTML = 'else if(root.data==value){';
          document.getElementById('code4').innerHTML = '&nbsp;&nbsp;return root.data;}';
          document.getElementById('code5').innerHTML = 'else if(root.data<value){';
          document.getElementById('code6').innerHTML = '&nbsp;&nbsp;search(root.right,value);}';
          document.getElementById('code7').innerHTML = 'else{search(root.left,value);}';
          break;
        case 5: // remove
          document.getElementById('code1').innerHTML = 'Node deleteNode = searchNode(value);';
          document.getElementById('code2').innerHTML = 'if(deleteNode.left==null&&deleteNode.right==null){';
          document.getElementById('code3').innerHTML = '&nbsp;&nbsp;deleteNode = null;}';
          document.getElementById('code4').innerHTML = 'else if(deleteNode.left!=null){';
          document.getElementById('code5').innerHTML = '&nbsp;&nbsp;byPass(deleteNode);}';
          document.getElementById('code6').innerHTML = 'else{replace(deleteNode);}/*byPass为删除该结点并让双亲连接';
          document.getElementById('code7').innerHTML = '该结点左子树;replace为将该结点替代为该节点右子树中最小值*/';
          break;
        case 6: // insert with rotations
          document.getElementById('code1').innerHTML = 'insert v';
          document.getElementById('code2').innerHTML = 'check balance factor of this and its children';
          document.getElementById('code3').innerHTML = '&nbsp;&nbsp;case1: this.rotateRight';
          document.getElementById('code4').innerHTML = '&nbsp;&nbsp;case2: this.left.rotateLeft, this.rotateRight';
          document.getElementById('code5').innerHTML = '&nbsp;&nbsp;case3: this.rotateLeft';
          document.getElementById('code6').innerHTML = '&nbsp;&nbsp;case4: this.right.rotateRight, this.rotateLeft';
          document.getElementById('code7').innerHTML = '&nbsp;&nbsp;this is balanced';
          break;
        case 7: // remove with rotations
          document.getElementById('code1').innerHTML = 'remove v';
          document.getElementById('code2').innerHTML = 'check balance factor of this and its children';
          document.getElementById('code3').innerHTML = '&nbsp;&nbsp;case1: this.rotateRight';
          document.getElementById('code4').innerHTML = '&nbsp;&nbsp;case2: this.left.rotateLeft, this.rotateRight';
          document.getElementById('code5').innerHTML = '&nbsp;&nbsp;case3: this.rotateLeft';
          document.getElementById('code6').innerHTML = '&nbsp;&nbsp;case4: this.right.rotateRight, this.rotateLeft';
          document.getElementById('code7').innerHTML = '&nbsp;&nbsp;this is balanced';
          break;
        case 8: // successor
          document.getElementById('code1').innerHTML = 'if(this.right!=null){return findMin(this.right)}';
          document.getElementById('code2').innerHTML = 'else{';
          document.getElementById('code3').innerHTML = '&nbsp;&nbsp;BSNode p = this.parent, T = this;//找到并检查双亲结点';
          document.getElementById('code4').innerHTML = '&nbsp;&nbsp;while(p!=null&&T==p.right){';
          document.getElementById('code5').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp; T=p,p=parent;';
          document.getElementById('code6').innerHTML = '&nbsp;&nbsp;if(p==null){return null}';
          document.getElementById('code7').innerHTML = '&nbsp;&nbsp;else{return p;}}}';
          break;
        case 9: // predecessor
          document.getElementById('code1').innerHTML = 'if(this.left!=null){return findMin(this.left)}';
          document.getElementById('code2').innerHTML = 'else{';
          document.getElementById('code3').innerHTML = '&nbsp;&nbsp;BSNode p = this.parent, T = this;//找到并检查双亲结点';
          document.getElementById('code4').innerHTML = '&nbsp;&nbsp;while(p != null && T == p.left)';
          document.getElementById('code5').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;T=p,p=parent;';
          document.getElementById('code6').innerHTML = '&nbsp;&nbsp;if(p==null){return null}';
          document.getElementById('code7').innerHTML = '&nbsp;&nbsp;else{return p;}}}';
          break;
      }
    }
  };



  // BSTaction.js
  //actions panel stuff
  var actionsWidth = 150;
  var statusCodetraceWidth = 420;

  var isCreateOpen = false;
  var isSearchOpen = false;
  var isInsertOpen = false;
  var isRemoveOpen = false;
  var isSuccOpen = false;
  var isPredOpen = false;
  var isInorderOpen = false;

  function openCreate() {
    if(!isCreateOpen) {
      $('.create').fadeIn('fast');
      isCreateOpen = true;
    }
  }
  function closeCreate() {
    if(isCreateOpen) {
      $('.create').fadeOut('fast');
      $('#create-err').html("");
      isCreateOpen = false;
    }
  }
  function openSearch() {
    if(!isSearchOpen) {
      $('.search').fadeIn('fast');
      isSearchOpen = true;
    }
  }
  function closeSearch() {
    if(isSearchOpen) {
      $('.search').fadeOut('fast');
      $('#search-err').html("");
      isSearchOpen = false;
    }
  }
  function openInsert() {
    if(!isInsertOpen) {
      $('.insert').fadeIn('fast');
      isInsertOpen = true;
    }
  }
  function closeInsert() {
    if(isInsertOpen) {
      $('.insert').fadeOut('fast');
      $('#insert-err').html("");
      isInsertOpen = false;
    }
  }
  function openRemove() {
    if(!isRemoveOpen) {
      $('.remove').fadeIn('fast');
      isRemoveOpen = true;
    }
  }
  function closeRemove() {
    if(isRemoveOpen) {
      $('.remove').fadeOut('fast');
      $('#remove-err').html("");
      isRemoveOpen = false;
    }
  }
  function openSucc() {
    if(!isSuccOpen) {
      $('.successor').fadeIn('fast');
      isSuccOpen = true;
    }
  }
  function closeSucc() {
    if(isSuccOpen) {
      $('.successor').fadeOut('fast');
      $('#succ-err').html("");
      isSuccOpen = false;
    }
  }
  function openPred() {
    if(!isPredOpen) {
      $('.predecessor').fadeIn('fast');
      isPredOpen = true;
    }
  }
  function closePred() {
    if(isPredOpen) {
      $('.predecessor').fadeOut('fast');
      $('#pred-err').html("");
      isPredOpen = false;
    }
  }
  function openInorder() {
    if(!isInorderOpen) {
      $('.inorder').fadeIn('fast');
      isInorderOpen = true;
    }
  }
  function closeInorder() {
    if(isInorderOpen) {
      $('.inorder').fadeOut('fast');
      $('#inorder-err').html("");
      isInorderOpen = false;
    }
  }

  //
  function hideEntireActionsPanel() {
    closeCreate();
    closeSearch();
    closeInsert();
    closeRemove();
    closeSucc();
    closePred();
    closeInorder();
    hideActionsPanel();
  }


  // local
  $('#play').hide();
  var bstWidget = new BST();
  var gw = bstWidget.getGraphWidget();

  $(function() {
    var bstMode = getQueryVariable("mode");
    if (bstMode.length > 0)
      $('#title-' + bstMode).click();
    var createBST = getQueryVariable("create");
    if (createBST.length > 0) {
      var newBST = createBST.split(",");
      bstWidget.generate(newBST);
    }

    $('#create').click(function() {
      closeSearch();
      closeInsert();
      closeRemove();
      closeSucc();
      closePred();
      closeInorder();
      openCreate();
    });
    $('#search').click(function() {
      closeCreate();
      closeInsert();
      closeRemove();
      closeSucc();
      closePred();
      closeInorder();
      openSearch();
    });
    $('#insert').click(function() {
      closeCreate();
      closeSearch();
      closeRemove();
      closeSucc();
      closePred();
      closeInorder();
      openInsert();
    });
    $('#remove').click(function() {
      closeCreate();
      closeSearch();
      closeInsert();
      closeSucc();
      closePred();
      closeInorder();
      openRemove();
    });
    $('#successor').click(function() {
      closeCreate();
      closeSearch();
      closeInsert();
      closeRemove();
      closePred();
      closeInorder();
      openSucc();
    });
    $('#predecessor').click(function() {
      closeCreate();
      closeSearch();
      closeInsert();
      closeRemove();
      closeSucc();
      closeInorder();
      openPred();
    });
    $('#inorder').click(function() {
      closeCreate();
      closeSearch();
      closeInsert();
      closeRemove();
      closeSucc();
      closePred();
      openInorder();
    });


  });

  // title changing
  $('#title-BST').click(function() {
    if (isPlaying) stop();
    showActionsPanel();
    hideStatusPanel();
    hideCodetracePanel();
    bstWidget.isAVL(false);
  });

  $('#title-AVL').click(function() {
    if (isPlaying) stop();
    showActionsPanel();
    hideStatusPanel();
    hideCodetracePanel();
    bstWidget.isAVL(true);
  });

  function empty() {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.generateEmpty()) {
        $('#progress-bar').slider("option", "max", 0);
        closeCreate();
        isPlaying = false;
      }
    }, 500);
  }

  function random() {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.generateRandom()) {
        $('#progress-bar').slider("option", "max", 0);
        closeCreate();
        isPlaying = false;
      }
    }, 500);
  }

  function skewed(side) {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.generateSkewed(side)) {
        $('#progress-bar').slider("option", "max", 0);
        closeCreate();
        isPlaying = false;
      }
    }, 500);
  }

  function findMin() {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.findMin()) {
        $('#current-action').show();
        $('#current-action p').html("查找最小值");
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function findMax() {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.findMax()) {
        $('#current-action').show();
        $('#current-action p').html("查找最大值");
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function searchVertex() {
    if (isPlaying) stop();
    setTimeout(function() {
      var input = $('#v-search').val();
      input = parseInt(input);
      if ((mode == "exploration") && bstWidget.search(input)) {
        $('#current-action').show();
        $('#current-action p').html("查找节点 " + input);
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function insertVertex() {
    if (isPlaying) stop();
    setTimeout(function() {
      var input = $('#v-insert').val();
      input = input.split(",");
      if ((mode == "exploration") && bstWidget.insertArr(input)) {
        $('#current-action').show();
        $('#current-action p').html("插入节点 " + input);
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500)
  }

  function removeVertex() {
    if (isPlaying) stop();
    setTimeout(function() {
      var input = $('#v-remove').val();
      input = input.split(",");
      if ((mode == "exploration") && bstWidget.removeArr(input)) {
        $('#current-action').show();
        $('#current-action p').html("删除节点 " + input);
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function successor() {
    if (isPlaying) stop();
    setTimeout(function() {
      var input = $('#v-succ').val();
      input = input.split(",");
      if ((mode == "exploration") && bstWidget.findSuccessor(input)) {
        $('#current-action').show();
        $('#current-action p').html("查找后继节点 (" + input + ")");
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function predecessor() {
    if (isPlaying) stop();
    setTimeout(function() {
      var input = $('#v-pred').val();
      input = input.split(",");
      if ((mode == "exploration") && bstWidget.findPredecessor(input)) {
        $('#current-action').show();
        $('#current-action p').html("查找前驱节点 (" + input + ")");
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }

  function inorderTraversal() {
    if (isPlaying) stop();
    setTimeout(function() {
      if ((mode == "exploration") && bstWidget.inorderTraversal()) {
        $('#current-action').show();
        $('#current-action p').html("中序遍历");
        $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
        triggerRightPanels();
        isPlaying = true;
      }
    }, 500);
  }
