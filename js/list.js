// List Widget
    // author Steven Kester Yuwono
    var BACK_EDGE_CONST = 5000;

    var List = function() {
        var self = this;
        var graphWidget = new GraphWidget();
        var activeStatus = "list";
        var maxSize = 10;
        var maxStackSize = 5;

        var valueRange = [1, 100]; // Range of valid values of List vertexes allowed
        var maxHeightAllowed = 10;

        var initialArray = [15, 6, 23, 4, 7, 71, 5, 50];
        var initialStackArray = [15, 6, 50, 4];

        /*
         * internalList: Internal representation of List in this object
         * The keys are the text of the Vertexs, and the value is the attributes of the corresponding Vertex encapsulated in a JS object, which are:
         * - "parent": text of the parent Vertex. If the Vertex is root Vertex, the value is null.
         * - "leftChild": text of the left child. No child -> null
         * - "rightChild": text of the right child. No child -> null
         * - "cx": X-coordinate of center of the Vertex
         * - "cy": Y-coordinate of center of the Vertex
         * - "height": height of the Vertex. Height of root is 0
         * - "vertexClassNumber": Vertex class number of the corresponding Vertex
         *
         * In addition, there is a key called "root" in internalList, containing the text of the root Vertex.
         * If List is empty, root is null.
         */

        var internalList = {};
        var amountVertex = 0;
        var vertexClassNumberCounter = 9;
        internalList["root"] = null;

        if (activeStatus == "stack")
            init(initialStackArray);
        else
            init(initialArray);

        this.setActiveStatus = function(newActiveStatus) {
            if (activeStatus != newActiveStatus) {
                clearScreen();
                activeStatus = newActiveStatus;
                if (activeStatus == "stack")
                    init(initialStackArray);
                else
                    init(initialArray);
            }
        }

        this.getActiveStatus = function() {
            return activeStatus;
        }

        this.widgetRecalculatePosition = function() {
            recalculatePosition();
        }

        this.getGraphWidget = function() {
            return graphWidget;
        }

        this.generate = function(initArr) {
            init(initArr);
        }

        this.generateRandom = function() {
            var vertexAmt = Math.floor((Math.random() * 3 + 3));
            var initArr = new Array();
            while (initArr.length < vertexAmt) {
                var random = Math.floor(1 + Math.random() * 98);
                if ($.inArray(random, initArr) < 0)
                    initArr.push(random);
            }

            init(initArr);
            return true;
        };

        this.generateRandomSorted = function() {
            var vertexAmt = Math.floor((Math.random() * 3 + 3));
            var initArr = new Array();
            while (initArr.length < vertexAmt) {
                var random = Math.floor(1 + Math.random() * 98);
                if ($.inArray(random, initArr) < 0)
                    initArr.push(random);
            }

            initArr.sort(function(a, b) {
                return a - b;
            });
            init(initArr);
            return true;
        };

        this.generateRandomFixedSize = function(vertexText) {
            if (activeStatus == "stack") {
                if (vertexText > maxStackSize) {
                    $('#create-err').html("创建失败，本演示中栈容量不能超过 " + maxStackSize);
                    return false;
                }
            } else {
                if (vertexText > maxSize) {
                    $('#create-err').html("创建失败，本演示中长度不能超过 " + maxSize);
                    return false;
                }
            }

            var vertexAmt = vertexText;
            var initArr = new Array();
            while (initArr.length < vertexAmt) {
                var random = Math.floor(Math.random() * 98 + 1);
                if ($.inArray(random, initArr) < 0)
                    initArr.push(random);
            }

            init(initArr);
            return true;
        }

        this.generateUserDefined = function(vertexTextArr) {
            var vertexAmt = vertexTextArr.length;
            if (activeStatus == "stack") {
                if (vertexAmt > maxStackSize) {
                    $('#create-err').html("创建失败，本演示中栈容量不能超过 " + maxStackSize);
                    return false;
                }
            } else {
                if (vertexAmt > maxSize) {
                    $('#create-err').html("创建失败，本演示中长度不能超过 " + maxSize);
                    return false;
                }
            }

            if (vertexTextArr == '') { // prevent creation of empty list
                $('#create-err').html("创建失败，长度至少为1！");
                return false;
            }

            var initArr = new Array();
            for (i = 0; i < vertexTextArr.length; i++) {
                var vt = parseInt(vertexTextArr[i]);
                if ($.inArray(vt, initArr) < 0)
                    initArr.push(vt);
            }

            init(initArr);
            return true;
        }

        this.peek = function() {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var index = 0;

            //temp = head , index = 0
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "返回值： " + currentVertex;
            cs["lineNo"] = 1;
            stateList.push(cs);

            cs = createState(internalList);
            cs["status"] = "Peek 操作完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(3);
            return true;
        }

        this.peekBack = function() {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var index = 0;

            while (true) {
                if (internalList[currentVertex]["rightChild"] != null)
                    currentVertex = internalList[currentVertex]["rightChild"];
                else
                    break;
            }
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

            // temp = head , index = 0
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "返回值： " + currentVertex;
            cs["lineNo"] = 1;
            stateList.push(cs);

            cs = createState(internalList);
            cs["status"] = "Peek 操作完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(9);
            return true;
        };

        this.search = function(vertexText) {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var index = 0;

            // temp = head , index = 0
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "开始操作";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            while (currentVertex != null) {
                //while (temp.data != input)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "正在比较： " + currentVertex + " 和 " + vertexText + " ( index = " + index + " )";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                if (parseInt(vertexText) != parseInt(currentVertex)) {
                    //while (temp.data != input)
                    cs = createState(internalList, vertexTraversed, edgeTraversed);
                    currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                    cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                    cs["status"] = currentVertex + " 不等于 " + vertexText;
                    cs["lineNo"] = 2;
                    stateList.push(cs);
                    //end

                    //case when vertex is not found
                    currentVertex = internalList[currentVertex]["rightChild"];
                    if (currentVertex == null) {

                        //temp = temp.next ,index++
                        cs = createState(internalList, vertexTraversed, edgeTraversed);
                        cs["status"] = "将 temp指针指向下一个元素";
                        cs["lineNo"] = 3;
                        stateList.push(cs);
                        //end

                        //if temp == null
                        cs = createState(internalList, vertexTraversed, edgeTraversed);
                        cs["status"] = "temp 为 null，已经搜索到尾部";
                        cs["lineNo"] = 4;
                        stateList.push(cs);
                        //end

                        //return -1
                        cs = createState(internalList, vertexTraversed, edgeTraversed);
                        cs["status"] = "在链表中未找到： " + vertexText + " ！";
                        cs["lineNo"] = 5;
                        stateList.push(cs);
                        //end

                        break;
                    }

                    //temp = temp.next ,index++
                    cs = createState(internalList, vertexTraversed, edgeTraversed);
                    parentVertex = internalList[currentVertex]["parent"];
                    currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                    cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                    var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                    edgeTraversed[edgeHighlighted] = true;
                    cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                    cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                    cs["status"] = "将 temp 指针指向下一个元素";
                    cs["lineNo"] = 3;
                    stateList.push(cs);
                    //end

                    //if temp==null
                    cs = createState(internalList, vertexTraversed, edgeTraversed);
                    currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                    cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                    cs["status"] = "temp 不为 null, 继续搜索";
                    cs["lineNo"] = 4;
                    stateList.push(cs);
                    //end

                } else {
                    break;
                }
                index++;
            }

            //case when vertex is found
            if (currentVertex != null) {
                //return index
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "找到 " + vertexText + " " + " ( 返回：index = " + index + " )";
                cs["lineNo"] = 6;
                stateList.push(cs);
                //end
            }

            cs = createState(internalList);
            cs["status"] = "搜索完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(4);
            return true;
        };

        this.insertArrKth = function(vertexTextArr, index) {
            // check if it is insert at index 0 / insert head
            if (index == 0)
                return this.insertArrHead(vertexTextArr);
            if (index == amountVertex)
                return this.insertArrTail(vertexTextArr);

            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var i, key;

            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);

            // Check whether input is array
            // if(Object.prototype.toString.call(vertexTextArr) != '[object Array]'){
            //   $('#insert-err').html("请填充数据！");
            //   return false;
            // }

            // Loop through all array values and...

            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion

            //index checking start
            if (isNaN(index)) {
                $('#insert-err').html("请输入index！");
                return false;
            }
            if (index > amountVertex) {
                $('#insert-err').html("超出长度，请输入合法数据！");
                return false;
            }
            if (index < 0) {
                $('#insert-err').html("index 为负，请输入合法数据！");
                return false;
            }
            //end of index checking


            //for(i = 0; i < vertexTextArr.length; i++){
            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }

            // 4. check size
            if (amountVertex >= maxSize) {
                $('#insert-err').html("错误，最大不能超过 " + maxSize);
                return false;
            }

            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);
            if (index == 0) {
                currentVertex = null;
            }

            //Vertex prev = head
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            vertexTraversed[currentVertex] = true;
            cs["status"] = "将 temp1 指针指向 head ，k = index";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            // Find parent
            // while(currentVertex != vertexText && currentVertex != null){
            for (j = 0; j < index - 1; j++) {
                //while (--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k-- , 指针还未到达指定的 index , " + "( k = " + (index - 1 - j) + " )";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                var nextVertex;
                nextVertex = internalList[currentVertex]["rightChild"];

                if (nextVertex == null)
                    break;
                else
                    currentVertex = nextVertex;

                //prev = prev.next
                parentVertex = internalList[currentVertex]["parent"];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                cs["status"] = "points 指针指向下一个元素";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end
            }

            if (currentVertex != null) {
                //additional animation for the last vertex visited
                //while(--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k-- , k 为 0";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end
                //end of additional animation
            }

            // Begin insertion
            // First, update internal representation

            //Vertex temp = prev.next
            tempVertex = internalList[currentVertex]["rightChild"];
            tempVertexClass = internalList[tempVertex]["vertexClassNumber"];
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            edgeTraversed[currentVertexClass] = true;
            cs["status"] = "指定的 index 已经找到，在此处开始操作步骤";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };
            amountVertex++;
            //modified this part for linked list insertion
            var newVertex = parseInt(vertexText);
            newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];
            var tempChild;

            internalList[newVertex]["cx"] = internalList[tempVertex]["cx"];
            internalList[newVertex]["cy"] = internalList[tempVertex]["cy"] + 70;

            //vertex newVertex =  new Vertex(input)
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "新建要插入的元素";
            cs["lineNo"] = 5;
            stateList.push(cs);
            edgeTraversed[newVertexVertexClass] = true;
            //end

            //RELINK THE POINTERs
            internalList[currentVertex]["rightChild"] = newVertex;
            internalList[newVertex]["parent"] = currentVertex;
            internalList[newVertex]["rightChild"] = tempVertex;
            internalList[tempVertex]["parent"] = newVertex;
            //END RELINKING

            //prev.next  = newVertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            cs["el"][newVertexVertexClass]["state"] = OBJ_HIDDEN;
            cs["status"] = "将 temp1 的 next 指针指向要插入的元素";
            cs["lineNo"] = 6;
            stateList.push(cs);
            //end

            //newVertex.next = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][newVertexVertexClass]["state"] = EDGE_RED;
            cs["el"][newVertexVertexClass]["animateHighlighted"] = true;
            cs["status"] = "将要插入元素的 next 指针指向 temp2";
            cs["lineNo"] = 7;
            stateList.push(cs);
            //end

            recalculatePosition();
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["el"][newVertexVertexClass]["state"] = EDGE_RED;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "可以看到链表中 元素" + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 0;
            stateList.push(cs);

            // End State
            cs = createState(internalList);
            cs["status"] = "插入 " + vertexText + " 完毕！"
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(0);

            return true;
        }


        this.insertArrKthDoublyList = function(vertexTextArr, index) {
            //check if it is insert at index 0 / insert head
            if (index == 0) {
                return this.insertArrHeadDoublyList(vertexTextArr);
            }
            if (index == amountVertex) {
                return this.insertArrTailDoublyList(vertexTextArr);
            }

            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;


            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);

            // Check whether input is array
            // if(Object.prototype.toString.call(vertexTextArr) != '[object Array]'){
            //   $('#insert-err').html("请填充数据！");
            //   return false;
            // }

            // Loop through all array values and...

            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion


            //index checking start
            if (isNaN(index)) {
                $('#insert-err').html("请输入index！");
                return false;
            }
            if (index > amountVertex) {
                $('#insert-err').html("超出长度，请输入合法数据！");
                return false;
            }
            if (index < 0) {
                $('#insert-err').html("index 为负，请输入合法数据！");
                return false;
            }
            //end of index checking


            //for(i = 0; i < vertexTextArr.length; i++){
            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }

            // 4. check size
            if (amountVertex >= maxSize) {
                $('#insert-err').html("错误，最大不能超过 " + maxSize);
                return false;
            }

            //}


            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);
            if (index == 0) {
                currentVertex = null;
            }

            //Vertex prev = head
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            vertexTraversed[currentVertex] = true;
            cs["status"] = "将 temp1 指针指向 head的地址, k = index";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            // Find parent
            // while(currentVertex != vertexText && currentVertex != null){
            for (j = 0; j < index - 1; j++) {
                //while (--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k-- , 指针还未到达指定的 index, " + "( k = " + (index - 1 - j) + " )";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                var nextVertex;
                nextVertex = internalList[currentVertex]["rightChild"];

                if (nextVertex == null)
                    break;
                else
                    currentVertex = nextVertex;

                //prev = prev.next
                parentVertex = internalList[currentVertex]["parent"];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                cs["status"] = "points 指针指向下一个元素";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end
            }


            if (currentVertex != null) {
                //additional animation for the last vertex visited
                //while(--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k--, k 为 0";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end
                //end of additional animation
            }

            // Begin insertion

            // First, update internal representation



            //var newVertexVertexClass = internalList[tempChild]["vertexClassNumber"];

            //Vertex temp = prev.next
            tempVertex = internalList[currentVertex]["rightChild"];
            tempVertexClass = internalList[tempVertex]["vertexClassNumber"];
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            edgeTraversed[currentVertexClass] = true;
            cs["status"] = "指定的 index 已经找到，在此处开始操作步骤";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end




            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };
            amountVertex++;
            //modified this part for linked list insertion
            var newVertex = parseInt(vertexText);
            newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];
            var tempChild;

            internalList[newVertex]["cx"] = internalList[tempVertex]["cx"];
            internalList[newVertex]["cy"] = internalList[tempVertex]["cy"] + 70;



            //vertex newVertex =  new Vertex(input)
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "新建要插入的元素";
            cs["lineNo"] = 5;
            stateList.push(cs);
            edgeTraversed[newVertexVertexClass] = true;
            //end

            //RELINK THE POINTERs
            internalList[newVertex]["rightChild"] = tempVertex;
            internalList[tempVertex]["parent"] = newVertex;
            //END RELINKING


            //newVertex.next = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][newVertexVertexClass]["state"] = EDGE_RED;
            cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
            cs["status"] = "将要插入元素的 next 指针指向 temp2 的地址";
            cs["lineNo"] = 6;
            stateList.push(cs);
            //end

            //temp2.prev = newVertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][newVertexVertexClass]["state"] = EDGE_RED;
            cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["state"] = EDGE_GREEN;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
            cs["status"] = "将 temp2 的 prev 指针指向插入的元素";
            cs["lineNo"] = 6;
            stateList.push(cs);
            //end

            internalList[currentVertex]["rightChild"] = newVertex;
            internalList[newVertex]["parent"] = currentVertex;

            //temp1.next  = newVertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
            cs["status"] = "将 temp1 的 next 指针指向插入的元素";
            cs["lineNo"] = 7;
            stateList.push(cs);
            //end

            //prev.next  = newVertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = EDGE_RED;
            cs["status"] = "插入元素的 prev 指针指向 temp1";
            cs["lineNo"] = 7;
            stateList.push(cs);
            //end


            recalculatePosition();
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_RED_FILL;
            cs["el"][newVertexVertexClass]["state"] = EDGE_RED;
            cs["vl"][tempVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "可以看到元素 " + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 0;

            stateList.push(cs);

            // End State
            cs = createState(internalList);
            cs["status"] = "插入 " + vertexText + " 完毕！"
            cs["lineNo"] = 0;
            stateList.push(cs);



            graphWidget.startAnimation(stateList);

            populatePseudocode(0);

            return true;
        }

        this.insertArrHead = function(vertexTextArr) {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = {};
            var key;
            var i;

            // cs["status"] = "The Current Linked List";
            // cs["lineNo"] = 0;
            // stateList.push(cs);

            // Loop through all array values and...

            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion
            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }

            // 4. check size
            if (activeStatus == "stack") {
                if (amountVertex >= maxStackSize) {
                    $('#insert-err').html("错误，最大不能超过 " + maxStackSize);
                    return false;
                }
            } else {
                if (amountVertex >= maxSize) {
                    $('#insert-err').html("错误，最大不能超过 " + maxSize);
                    return false;
                }
            }

            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = null;
            if (amountVertex >= 1)
                cs = createState(internalList);
            else
                cs = {};

            // Begin insertion
            // First, update internal representation
            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };

            // modified this part for linked list insertion
            var newVertex = parseInt(vertexText);

            internalList[newVertex]["cx"] = 20;
            internalList[newVertex]["cy"] = 120;
            // if linked list is empty
            amountVertex++;
            if (amountVertex > 1) {
                var tempChild = internalList["root"];
                internalList[newVertex]["rightChild"] = tempChild;
                internalList[tempChild]["parent"] = newVertex;
                internalList["root"] = newVertex;
            } else
                internalList["root"] = newVertex;

            // Then, draw edge
            var newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];

            if (amountVertex > 1) {
                //Vertex temp = temp Vertex(input)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][newVertexVertexClass]["state"] = OBJ_HIDDEN;
                cs["status"] = "新建要插入的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                //temp.next = head
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                var edgeHighlighted = internalList[newVertex]["vertexClassNumber"];
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_HIGHLIGHTED;
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "设置 temp 的 next 指针指向 head";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end
            } else {
                //Vertex temp = temp Vertex(input)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "新建要插入的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "head 为 null, temp 的 next 指针为 null"
                cs["lineNo"] = 2;
                stateList.push(cs);
            }

            // hed = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "Head 指针指向 temp"
            cs["lineNo"] = 3;
            stateList.push(cs);
            //end

            if (amountVertex == 1) {
                //tail = head
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "Tail 指针指向 head"
                cs["lineNo"] = 4;
                stateList.push(cs);
                //end
            }

            recalculatePosition();
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "重新排列链表";
            cs["lineNo"] = 0;
            stateList.push(cs);

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["status"] = "可以看到元素 " + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(1);

            return true;
        }

        this.insertArrHeadDoublyList = function(vertexTextArr) {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = {};
            var key;
            var i;

            // cs["status"] = "The Current Linked List";
            // cs["lineNo"] = 0;
            // stateList.push(cs);

            // Loop through all array values and...

            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion

            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }

            // 4. check size
            if (activeStatus == "stack") {
                if (amountVertex >= maxStackSize) {
                    $('#insert-err').html("错误，最大不能超过 " + maxStackSize);
                    return false;
                }
            } else {
                if (amountVertex >= maxSize) {
                    $('#insert-err').html("错误，最大不能超过 " + maxSize);
                    return false;
                }
            }

            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = null;
            if (amountVertex >= 1)
                cs = createState(internalList);
            else
                cs = {};

            // Begin insertion
            // First, update internal representation
            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };

            //modified this part for linked list insertion
            var newVertex = parseInt(vertexText);

            internalList[newVertex]["cx"] = 20;
            internalList[newVertex]["cy"] = 120;
            //if linked list is empty
            amountVertex++;
            if (amountVertex > 1) {
                var tempChild = internalList["root"];
                internalList[newVertex]["rightChild"] = tempChild;
                internalList[tempChild]["parent"] = newVertex;
                internalList["root"] = newVertex;
            } else
                internalList["root"] = newVertex;

            // Then, draw edge
            var newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];

            if (amountVertex > 1) {
                //Vertex temp = temp Vertex(input)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][newVertexVertexClass]["state"] = OBJ_HIDDEN;
                cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;

                cs["status"] = "新建要插入的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                //temp.next = head
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                var edgeHighlighted = internalList[newVertex]["vertexClassNumber"];
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_HIGHLIGHTED;
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
                cs["status"] = "设置 temp 的 next 指针指向 head";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                //if (head!=null) head.prev = temp
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["state"] = EDGE_HIGHLIGHTED;
                cs["el"][newVertexVertexClass + BACK_EDGE_CONST]["animateHighlighted"] = true;
                cs["status"] = "设置 prev 指针";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end
            } else {
                //Vertex temp = temp Vertex(input)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "新建要插入的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "head 为 null, temp 的 next 指针为 null"
                cs["lineNo"] = 2;
                stateList.push(cs);

                //if (head!=null) head.prev = temp
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "head 为 null";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end
            }

            //head = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_GREEN_FILL;
            cs["status"] = "Head 指针指向 temp"
            cs["lineNo"] = 4;
            stateList.push(cs);
            //end

            if (amountVertex == 1) {
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "Tail 指针指向 head"
                cs["lineNo"] = 5;
                stateList.push(cs);
            }

            recalculatePosition();
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "重新排列链表";
            cs["lineNo"] = 0;
            stateList.push(cs);

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["status"] =  "可以看到元素 " + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(1);

            return true;
        }

        this.insertArrTail = function(vertexTextArr) {
            if (amountVertex == 0)
                return this.insertArrHead(vertexTextArr);

            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;

            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);

            // Loop through all array values and...
            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion
            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }

            // 4. check size
            if (amountVertex >= maxSize) {
                $('#insert-err').html("错误，最大不能超过 " + maxSize);
                return false;
            }

            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Find parent
            while (currentVertex != vertexText && currentVertex != null) {
                var nextVertex;
                nextVertex = internalList[currentVertex]["rightChild"];

                if (nextVertex == null)
                    break;
                else
                    currentVertex = nextVertex;
            }

            // Begin insertion
            // First, update internal representation
            var newVertex = parseInt(vertexText);
            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };

            if (currentVertex != null) {
                internalList[parseInt(vertexText)]["parent"] = currentVertex;
                internalList[currentVertex]["rightChild"] = parseInt(vertexText);
            } else {
                internalList[parseInt(vertexText)]["parent"] = null;
                internalList["root"] = parseInt(vertexText);
            }

            amountVertex++;
            recalculatePosition();

            // Then, draw edge
            //Vertex temp = new vertex(input)
            var newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["el"][currentVertexClass]["state"] = OBJ_HIDDEN;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "新建要插入的元素"
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            //tail.next = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            // cs["vl"][newVertexVertexClass]["state"] = OBJ_HIDDEN;
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            cs["status"] = "tail 的 next 指针指向插入的元素。 正在插入 " + vertexText + " ...";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            // Lastly, draw vertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "更新 tail 尾指针。 " + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 3;
            stateList.push(cs);
            // End State

            cs = createState(internalList);
            cs["status"] = "插入尾部元素 " + vertexText + " 完毕！"
            cs["lineNo"] = 0;
            stateList.push(cs);

            graphWidget.startAnimation(stateList);
            populatePseudocode(2);

            return true;
        }

        this.insertArrTailDoublyList = function(vertexTextArr) {
            if (amountVertex == 0) {
                return this.insertArrHeadDoublyList(vertexTextArr);
            }

            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;

            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);


            // Loop through all array values and...

            var tempinternalList = deepCopy(internalList); // Use this to simulate internal insertion

            var vt = parseInt(vertexTextArr);

            // 1. Check whether value is number
            if (isNaN(vt)) {
                $('#insert-err').html("请填充数据！");
                return false;
            }

            // 2. No duplicates allowed. Also works if more than one similar value are inserted
            if (tempinternalList[vt] != null) {
                $('#insert-err').html("不允许出现重复元素！");
                return false;
            }

            // 3. Check range
            if (parseInt(vt) < valueRange[0] || parseInt(vt) > valueRange[1]) {
                $('#insert-err').html("插入错误：只能插入 " + valueRange[0] + " 和 " + valueRange[1] + " 之间的数据。");
                return false;
            }
            // 4. check size
            if (amountVertex >= maxSize) {
                $('#insert-err').html("错误，最大不能超过 " + maxSize);
                return false;
            }

            var vertexText = parseInt(vertexTextArr);

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Find parent
            while (currentVertex != vertexText && currentVertex != null) {
                var nextVertex;
                nextVertex = internalList[currentVertex]["rightChild"];

                if (nextVertex == null)
                    break;
                else
                    currentVertex = nextVertex;
            }

            // Begin insertion

            // First, update internal representation
            var newVertex = parseInt(vertexText);
            internalList[parseInt(vertexText)] = {
                "leftChild": null,
                "rightChild": null,
                "vertexClassNumber": vertexClassNumberCounter++
            };

            if (currentVertex != null) {
                internalList[parseInt(vertexText)]["parent"] = currentVertex;
                internalList[currentVertex]["rightChild"] = parseInt(vertexText);
            } else {
                internalList[parseInt(vertexText)]["parent"] = null;
                internalList["root"] = parseInt(vertexText);
            }

            amountVertex++;

            recalculatePosition();

            // Then, draw edge
            //Vertex temp = new vertex(input)
            var newVertexVertexClass = internalList[parseInt(vertexText)]["vertexClassNumber"];
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["el"][currentVertexClass]["state"] = OBJ_HIDDEN;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "新建要插入的元素"
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end


            //tail.next = temp
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            // cs["vl"][newVertexVertexClass]["state"] = OBJ_HIDDEN;
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
            cs["status"] = "tail 的 next 指针指向插入的元素。 正在插入 " + vertexText + " ...";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            // temp.prev = tail
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = EDGE_HIGHLIGHTED;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["animateHighlighted"] = true;
            cs["status"] = "更新插入元素的 prev 指针"
            cs["lineNo"] = 3;
            stateList.push(cs);
            // End State

            // Lastly, draw vertex
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][newVertexVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "更新tail尾指针。 元素" + vertexText + " 已经被成功插入！"
            cs["lineNo"] = 4;
            stateList.push(cs);
            // End State

            cs = createState(internalList);
            cs["status"] = "插入尾部元素 " + vertexText + " 完毕！"
            cs["lineNo"] = 0;
            stateList.push(cs);


            graphWidget.startAnimation(stateList);

            populatePseudocode(2);

            return true;
        }

        this.removeArrHead = function() {
            var index = 0;
            var vertexTextArr = [1];
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;

            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);

            var vertexCheckBf;

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Case 1: no child
            if (internalList[currentVertex]["rightChild"] == null) {

                //temp = head
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "该头部元素节点没有后继节点，是唯一的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end


                //head = head next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "将 head 指针设置为下一个元素 (即 null)";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                // var parentVertex = internalList[currentVertex]["parent"];


                // if(parentVertex !=null) internalList[parentVertex]["rightChild"] = null;
                // else internalList["root"] = "null";

                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["status"] = "删除首个元素";
                cs["lineNo"] = 3;
                stateList.push(cs);

                //end
            } else {
                //has child
                // temp =  head
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "该头部元素节点有后继节点";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                var rightChildVertex = internalList[currentVertex]["rightChild"];



                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                rightChildVertexClass = internalList[rightChildVertex]["vertexClassNumber"];


                //head = head.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                //edgeTraversed[rightChildVertexClass] = true;
                cs["el"][currentVertexClass]["state"] = EDGE_BLUE;
                cs["el"][currentVertexClass]["animateHighlighted"] = true;
                cs["status"] = "将 head 指针设置为下一个元素 ";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                internalList["root"] = rightChildVertex;
                internalList[rightChildVertex]["parent"] = null;


                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "删除首个元素";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end

                //relayout
                recalculatePosition();
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "重新排列链表";
                cs["lineNo"] = 0;
                stateList.push(cs);
                //end
            }

            cs = createState(internalList);
            cs["status"] = "删除首个元素完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);


            graphWidget.startAnimation(stateList);

            populatePseudocode(5);
            amountVertex--;
            return true;
        }


        this.removeArrHeadDoublyList = function() {
            var index = 0;
            var vertexTextArr = [1];
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;

            cs["status"] = "开始操作";
            cs["lineNo"] = 0;
            stateList.push(cs);

            var vertexCheckBf;

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Case 1: no child
            if (internalList[currentVertex]["rightChild"] == null) {

                //temp = head
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "该头部元素节点没有后继节点，是唯一的元素";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end


                //head = head next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "将 head 指针设置为下一个元素 (即 null)";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                // var parentVertex = internalList[currentVertex]["parent"];


                // if(parentVertex !=null) internalList[parentVertex]["rightChild"] = null;
                // else internalList["root"] = "null";

                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["status"] = "删除第一个元素";
                cs["lineNo"] = 3;
                stateList.push(cs);

                //end
            } else {
                //has child
                // temp =  head
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["status"] = "该头部元素有后继节点";
                cs["lineNo"] = 1;
                stateList.push(cs);
                //end

                var rightChildVertex = internalList[currentVertex]["rightChild"];



                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                rightChildVertexClass = internalList[rightChildVertex]["vertexClassNumber"];


                //head = head.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                //edgeTraversed[rightChildVertexClass] = true;
                cs["el"][currentVertexClass]["state"] = EDGE_BLUE;
                cs["el"][currentVertexClass]["animateHighlighted"] = true;
                cs["status"] = "head 指针向下一个移动";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                internalList["root"] = rightChildVertex;
                internalList[rightChildVertex]["parent"] = null;


                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "删除元素";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end

                //head.prev = null
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "将 head 的 prev 指针设置为 null";
                cs["lineNo"] = 4;
                stateList.push(cs);
                //end

                //relayout
                recalculatePosition();
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_BLUE_FILL;
                cs["status"] = "重新排列链表";
                cs["lineNo"] = 0;
                stateList.push(cs);
                //end
            }

            cs = createState(internalList);
            cs["status"] = "删除头节点完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);


            graphWidget.startAnimation(stateList);

            populatePseudocode(5);
            amountVertex--;
            return true;
        }

        this.removeArrTail = function() {
            var vertexTextArr = [1];
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var nextVertex = internalList[currentVertex]["rightChild"];
            var cs = createState(internalList);
            var currentVertexClass;
            var nextVertexClass;
            var key;
            var i;

            if (amountVertex == 1) {
                return this.removeArrHead();
            }

            //Vertex prev = head
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "开始操作";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            //temp = head.next
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            //prev highlight
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            //temp highlight
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
            cs["vl"][nextVertexClass]["state"] = VERTEX_GREEN_FILL;
            //animate highlight
            cs["el"][currentVertexClass]["animateHighlighted"] = true;
            cs["el"][currentVertexClass]["state"] = EDGE_TRAVERSED;
            //status
            cs["status"] = "开始操作";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            // Find vertex
            while (true) {
                // while (temp.next!=null)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                //prev highlight
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                //temp hightlight
                nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
                cs["vl"][nextVertexClass]["state"] = VERTEX_GREEN_FILL;
                vertexTraversed[currentVertex] = true;
                //status
                cs["status"] = "检查 temp 的 next 指针是否为 null";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end

                if (internalList[nextVertex]["rightChild"] != null) {
                    nextVertex = internalList[nextVertex]["rightChild"];
                    currentVertex = internalList[currentVertex]["rightChild"];
                } else
                    break;

                //temp = temp.next , prev = prev.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                //prev highlight
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                //temp hightlight
                nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
                cs["vl"][nextVertexClass]["state"] = VERTEX_GREEN_FILL;
                vertexTraversed[currentVertex] = true;
                //prev highlight
                parentVertex = internalList[currentVertex]["parent"];
                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                edgeTraversed[edgeHighlighted] = true;
                //temp highlight
                var edgeHighlighted2 = internalList[currentVertex]["vertexClassNumber"];
                cs["el"][edgeHighlighted2]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted2]["state"] = EDGE_GREEN;
                //status
                cs["status"] = "指针向下一个元素移动";
                cs["lineNo"] = 4;
                stateList.push(cs);
                //end
            }





            //prev.next = null
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            //prev highlight
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
            cs["el"][currentVertexClass]["state"] = OBJ_HIDDEN;
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            //temp hightlight
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
            cs["vl"][nextVertexClass]["state"] = VERTEX_GREEN_FILL;
            vertexTraversed[currentVertex] = true;

            //status
            cs["status"] = "将最后一个元素的 next 指针设置为 null";
            cs["lineNo"] = 5;
            stateList.push(cs);
            //end

            var parentVertex = internalList[nextVertex]["parent"];
            if (parentVertex != null)
                internalList[parentVertex]["rightChild"] = null;
            else
                internalList["root"] = null;


            //delete temp
            delete internalList[nextVertex];
            delete vertexTraversed[nextVertex];
            delete edgeTraversed[nextVertexClass];

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "删除最后一个元素";
            cs["lineNo"] = 6;
            stateList.push(cs);
            //end

            //tail = prev
            delete internalList[nextVertex];
            delete vertexTraversed[nextVertex];
            delete edgeTraversed[nextVertexClass];

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "更新 tail 尾指针";
            cs["lineNo"] = 7;
            stateList.push(cs);
            //end

            cs = createState(internalList);
            cs["status"] = "删除尾节点完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);


            graphWidget.startAnimation(stateList);

            populatePseudocode(6);
            amountVertex--;
            return true;
        }


        this.removeArrTailDoublyList = function() {
            var vertexTextArr = [1];
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var nextVertex = internalList[currentVertex]["rightChild"];
            var cs = createState(internalList);
            var currentVertexClass;
            var nextVertexClass;
            var key;
            var i;

            if (amountVertex == 1) {
                return this.removeArrHead();
            }


            // Find vertex
            while (true) {


                if (internalList[nextVertex]["rightChild"] != null) {
                    nextVertex = internalList[nextVertex]["rightChild"];
                    currentVertex = internalList[currentVertex]["rightChild"];
                } else
                    break;
            }

            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];

            //Vertex temp = tail
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][nextVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "将 temp 指针设置为 tail 指针地址";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            //Vertex temp = tail
            cs = createState(internalList, vertexTraversed, edgeTraversed);

            cs["vl"][nextVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["el"][currentVertexClass + BACK_EDGE_CONST]["state"] = EDGE_HIGHLIGHTED;
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "将 tail 指针设置为 tail 的 prev 指针地址";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end



            //tail.next = null
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            //prev highlight
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
            cs["el"][currentVertexClass]["state"] = OBJ_HIDDEN;
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            //temp hightlight
            nextVertexClass = internalList[nextVertex]["vertexClassNumber"];
            cs["vl"][nextVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            vertexTraversed[currentVertex] = true;

            //status
            cs["status"] = "将最后一个元素的 next 指针设置为 null";
            cs["lineNo"] = 3;
            stateList.push(cs);
            //end

            var parentVertex = internalList[nextVertex]["parent"];
            if (parentVertex != null)
                internalList[parentVertex]["rightChild"] = null;
            else
                internalList["root"] = null;


            //delete temp
            delete internalList[nextVertex];
            delete vertexTraversed[nextVertex];
            delete edgeTraversed[nextVertexClass];

            cs = createState(internalList, vertexTraversed, edgeTraversed);
            cs["vl"][currentVertexClass]["state"] = VERTEX_BLUE_FILL;
            cs["status"] = "删除最后一个元素";
            cs["lineNo"] = 4;
            stateList.push(cs);
            //end

            cs = createState(internalList);
            cs["status"] = "删除最后一个元素完毕！";
            cs["lineNo"] = 0;
            stateList.push(cs);


            graphWidget.startAnimation(stateList);

            populatePseudocode(8);
            amountVertex--;
            return true;
        }

        this.removeArrKth = function(vertexTextArr) {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;



            // Loop through all array values and...

            var index;

            var vt = parseInt(vertexTextArr);

            // Check whether value is number
            if (isNaN(vt)) {
                $('#remove-err').html("请填充数据！");
                return false;
            }
            if (vt >= amountVertex) {
                $('#remove-err').html("超出长度，请输入合法数据！");
                return false;
            }
            if (vt < 0) {
                $('#remove-err').html("不能为负数，请输入合法数据！");
                return false;
            }
            index = vt;


            if (index == 0) {
                return this.removeArrHead();
            }
            if (index == amountVertex - 1) {
                return this.removeArrTail();
            }

            //Vertex prev = head
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "将当前定位指针 cur 指向 head";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            var vertexCheckBf;

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Find vertex
            for (i = 0; i < index - 1; i++) {

                // while(true){
                //while (--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k-- , 指针还未到达指定的index , " + "( k = " + (index - 1 - i) + " )";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                //important assignment
                parentVertex = currentVertex;
                currentVertex = internalList[currentVertex]["rightChild"];


                //prev = prev.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                cs["status"] = "cur 指针向下移动一个元素";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end
            }

            //while (--k!=0)
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            vertexTraversed[currentVertex] = true;
            cs["status"] = "k = 0, cur 指针现在指向要删除元素的前一个节点";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            parentVertex = currentVertex;
            currentVertex = internalList[currentVertex]["rightChild"];

            if (currentVertex != null) {
                //Vertex temp = prev.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

                parentVertex = internalList[currentVertex]["parent"];
                parentVertexClass = internalList[parentVertex]["vertexClassNumber"];
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_GREEN;
                cs["vl"][currentVertexClass]["state"] = VERTEX_GREEN_FILL;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "将要删除元素的指针赋值给 obedeleted";
                cs["lineNo"] = 4;
                stateList.push(cs);
                //end
            }

            // Case 1: no child
            if (internalList[currentVertex]["rightChild"] == null) {
                // cs = createState(internalList, vertexTraversed, edgeTraversed);
                // cs["status"] = "vertex is the last vertex, update tail pointer";
                // cs["lineNo"] = 7;
                // stateList.push(cs);
                // var parentVertex = internalList[currentVertex]["parent"];

                // if(parentVertex !=null) internalList[parentVertex]["rightChild"] = null;
                // else internalList["root"] = null;

                // currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                // delete internalList[currentVertex];
                // delete vertexTraversed[currentVertex];
                // delete edgeTraversed[currentVertexClass];

                // cs = createState(internalList, vertexTraversed, edgeTraversed);
                // cs["status"] = "Remove last vertex";
                // cs["lineNo"] = 7;
                // stateList.push(cs);
                // vertexCheckBf = parentVertex;
            } else {

                // has child

                // cs = createState(internalList, vertexTraversed, edgeTraversed);
                //  cs["status"] = "keep track of the vertex to-be-deleted";
                // cs["lineNo"] = 4;
                // stateList.push(cs);
                var parentVertex = internalList[currentVertex]["parent"];
                var rightChildVertex = internalList[currentVertex]["rightChild"];

                if (parentVertex != null) {
                    internalList[parentVertex]["rightChild"] = rightChildVertex;
                } else
                    internalList["root"] = rightChildVertex;

                internalList[rightChildVertex]["parent"] = parentVertex;



                //prev.next = prev.next.next
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                rightChildVertexClass = internalList[rightChildVertex]["vertexClassNumber"];
                internalList[currentVertex]["cy"] = 50 + internalList[currentVertex]["cy"];


                cs = createState(internalList, vertexTraversed, edgeTraversed);
                parentVertex = internalList[currentVertex]["parent"];
                parentVertexClass = internalList[parentVertex]["vertexClassNumber"];
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                //cs["el"][currentVertexClass]["state"] = OBJ_HIDDEN;
                cs["vl"][currentVertexClass]["state"] = VERTEX_GREEN_FILL;
                if (parentVertex != null) {
                    cs["el"][parentVertexClass]["state"] = EDGE_HIGHLIGHTED;
                    cs["el"][parentVertexClass]["animateHighlighted"] = true;
                }
                cs["status"] = "将被删除元素的前趋和后继节点连接，前驱的 next 指针指向后继的地址。";
                cs["lineNo"] = 5;
                stateList.push(cs);
                //end


                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                if (parentVertex != null) {
                    cs["el"][parentVertexClass]["state"] = EDGE_HIGHLIGHTED;
                }
                cs["status"] = "现在删除这个元素";
                cs["lineNo"] = 6;
                stateList.push(cs);
                //end

                //relayout list
                recalculatePosition();

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                if (parentVertex != null) {
                    cs["el"][parentVertexClass]["state"] = EDGE_HIGHLIGHTED;
                }
                cs["status"] = "重新排列链表";
                cs["lineNo"] = 0;
                stateList.push(cs);
                //end relayout
            }
            cs = createState(internalList);
            cs["status"] = "删除完毕！";
            cs["lineNo"] = 0;

            stateList.push(cs);

            graphWidget.startAnimation(stateList);

            populatePseudocode(7);
            amountVertex--;
            return true;
        }

        this.removeArrKthDoublyList = function(vertexTextArr) {
            var stateList = [];
            var vertexTraversed = {};
            var edgeTraversed = {};
            var currentVertex = internalList["root"];
            var cs = createState(internalList);
            var currentVertexClass;
            var key;
            var i;
            // Loop through all array values and...
            var index;
            var vt = parseInt(vertexTextArr);

            // Check whether value is number
            if (isNaN(vt)) {
                $('#remove-err').html("请填充数据！");
                return false;
            }
            if (vt >= amountVertex) {
                $('#remove-err').html("超出长度，请输入合法数据！");
                return false;
            }
            if (vt < 0) {
                $('#remove-err').html("不能为负数，请输入合法数据！");
                return false;
            }
            index = vt;


            if (index == 0) {
                return this.removeArrHeadDoublyList();
            }
            if (index == amountVertex - 1) {
                return this.removeArrTailDoublyList();
            }

            //Vertex prev = head
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            cs["status"] = "将当前定位指针 cur 指向 head";
            cs["lineNo"] = 1;
            stateList.push(cs);
            //end

            var vertexCheckBf;

            // Re-initialization
            vertexTraversed = {};
            edgeTraversed = {};
            currentVertex = internalList["root"];
            cs = createState(internalList);

            // Find vertex
            for (i = 0; i < index - 1; i++) {

                // while(true){
                //while (--k!=0)
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "k--, 指针还未到达指定的index, " + "( k = " + (index - 1 - i) + " )";
                cs["lineNo"] = 2;
                stateList.push(cs);
                //end

                //important assignment
                parentVertex = currentVertex;
                currentVertex = internalList[currentVertex]["rightChild"];


                //prev = prev.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_TRAVERSED;
                cs["status"] = "设置 points 指向下一个元素";
                cs["lineNo"] = 3;
                stateList.push(cs);
                //end
            }

            //while (--k!=0)
            cs = createState(internalList, vertexTraversed, edgeTraversed);
            currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
            cs["vl"][currentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
            vertexTraversed[currentVertex] = true;
            cs["status"] = "k = 0, cur 指针现在指向要删除元素的前一个节点";
            cs["lineNo"] = 2;
            stateList.push(cs);
            //end

            parentVertex = currentVertex;
            currentVertex = internalList[currentVertex]["rightChild"];

            if (currentVertex != null) {
                //Vertex temp2 = temp1.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

                parentVertex = internalList[currentVertex]["parent"];
                parentVertexClass = internalList[parentVertex]["vertexClassNumber"];
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

                var edgeHighlighted = internalList[parentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["el"][edgeHighlighted]["state"] = EDGE_GREEN;
                cs["vl"][currentVertexClass]["state"] = VERTEX_GREEN_FILL;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "继续找到将要被删除的元素";
                cs["lineNo"] = 4;
                stateList.push(cs);
                //end

                //Vertex temp3 = temp2.next
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];

                parentVertex = internalList[currentVertex]["parent"];
                rightChildVertex = internalList[currentVertex]["rightChild"];
                rightChildVertexClass = internalList[rightChildVertex]["vertexClassNumber"];
                parentVertexClass = internalList[parentVertex]["vertexClassNumber"];
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;

                var edgeHighlighted = internalList[currentVertex]["vertexClassNumber"];
                edgeTraversed[edgeHighlighted] = true;
                cs["el"][edgeHighlighted]["animateHighlighted"] = true;
                cs["vl"][currentVertexClass]["state"] = VERTEX_GREEN_FILL;
                cs["el"][edgeHighlighted]["state"] = EDGE_RED;
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_RED_FILL;
                vertexTraversed[currentVertex] = true;
                cs["status"] = "继续找到将要被删除的元素的后继节点";
                cs["lineNo"] = 5;
                stateList.push(cs);
                //end
            }

            // Case 1: no child
            if (internalList[currentVertex]["rightChild"] == null) {
                //do nothing
            } else {
                // has child
                var parentVertex = internalList[currentVertex]["parent"];
                var rightChildVertex = internalList[currentVertex]["rightChild"];

                if (parentVertex != null) {
                    internalList[parentVertex]["rightChild"] = rightChildVertex;
                } else
                    internalList["root"] = rightChildVertex;

                internalList[rightChildVertex]["parent"] = parentVertex;

                //temp2.next.prev = temp1
                parentVertexClass = internalList[parentVertex]["vertexClassNumber"];
                currentVertexClass = internalList[currentVertex]["vertexClassNumber"];
                rightChildVertexClass = internalList[rightChildVertex]["vertexClassNumber"];
                internalList[currentVertex]["cy"] = 50 + internalList[currentVertex]["cy"];

                //delete temp
                delete internalList[currentVertex];
                delete vertexTraversed[currentVertex];
                delete edgeTraversed[currentVertexClass];
                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                if (parentVertex != null) {
                    cs["el"][parentVertexClass]["state"] = EDGE_HIGHLIGHTED;
                }
                cs["el"][parentVertexClass]["state"] = OBJ_HIDDEN;
                cs["el"][parentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_RED_FILL;
                cs["status"] = "删除元素";
                cs["lineNo"] = 6;
                stateList.push(cs);
                //end

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_RED_FILL;
                cs["el"][parentVertexClass + BACK_EDGE_CONST]["state"] = OBJ_HIDDEN;
                cs["status"] = "将被删除元素的前趋和后继节点连接，前驱的 next 指针指向后继";
                cs["lineNo"] = 7;
                stateList.push(cs);
                //end

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_RED_FILL;
                cs["el"][parentVertexClass + BACK_EDGE_CONST]["state"] = EDGE_RED;
                cs["status"] = "将被删除元素的前趋和后继节点连接，后继的 prev 指针指向前驱";
                cs["lineNo"] = 7;
                stateList.push(cs);
                //end


                //relayout list
                recalculatePosition();

                cs = createState(internalList, vertexTraversed, edgeTraversed);
                cs["vl"][parentVertexClass]["state"] = VERTEX_HIGHLIGHTED;
                if (parentVertex != null) {
                    cs["el"][parentVertexClass]["state"] = EDGE_HIGHLIGHTED;
                }
                cs["vl"][rightChildVertexClass]["state"] = VERTEX_RED_FILL;
                cs["status"] = "重新排列链表";
                cs["lineNo"] = 0;
                stateList.push(cs);
                //end relayout
            }
            cs = createState(internalList);
            cs["status"] = "删除完毕！";
            cs["lineNo"] = 0;

            stateList.push(cs);

            graphWidget.startAnimation(stateList);

            populatePseudocode(7);
            amountVertex--;
            return true;
        }

        function init(initArr) {
            var i;
            amountVertex = 0;
            clearScreen();

            for (i = 0; i < initArr.length; i++) {
                var parentVertex = internalList["root"];
                var newVertex = parseInt(initArr[i]);

                if (parentVertex == null) {
                    internalList["root"] = parseInt(newVertex);
                    internalList[newVertex] = {
                        "parent": null,
                        "leftChild": null,
                        "rightChild": null,
                        "isEnd":false,
                        "vertexClassNumber": amountVertex
                    };
                } else {
                    while (true) {
                        if (internalList[parentVertex]["rightChild"] == null)
                            break;
                        parentVertex = internalList[parentVertex]["rightChild"];
                    }
                    internalList[parentVertex]["rightChild"] = newVertex;
                    internalList[newVertex] = {
                        "parent": parentVertex,
                        "leftChild": null,
                        "rightChild": null,
                        "vertexClassNumber": amountVertex
                    }
                }

                amountVertex++;
            }

            recalculatePosition();

            for (key in internalList) {
                if (key == "root")
                    continue;
                graphWidget.addVertex(internalList[key]["cx"], internalList[key]["cy"], key, internalList[key]["vertexClassNumber"], true);
            }

            console.log(internalList)


            for (key in internalList) {
                if (key == "root")
                    continue;
                if (key == internalList["root"])
                    continue;
                var parentVertex = internalList[key]["parent"];



                graphWidget.addEdge(internalList[parentVertex]["vertexClassNumber"], internalList[key]["vertexClassNumber"], internalList[parentVertex]["vertexClassNumber"], EDGE_TYPE_DE, 1, true);
                if ((activeStatus == "doublylist") || (activeStatus == "deque") ) {
                    graphWidget.addEdge(internalList[key]["vertexClassNumber"], internalList[parentVertex]["vertexClassNumber"], internalList[parentVertex]["vertexClassNumber"] + BACK_EDGE_CONST, EDGE_TYPE_DE, 1, true);
                }
                if(activeStatus == "circularlist"){
                    graphWidget.addEdge()
                }
            }
        }

        function clearScreen() {
            var key;

            for (key in internalList) {
                if (key == "root")
                    continue;
                graphWidget.removeEdge(internalList[key]["vertexClassNumber"] + BACK_EDGE_CONST);
                graphWidget.removeEdge(internalList[key]["vertexClassNumber"]);
            }

            for (key in internalList) {
                if (key == "root")
                    continue;
                graphWidget.removeVertex(internalList[key]["vertexClassNumber"]);
            }

            internalList = {};
            internalList["root"] = null;
            amountVertex = 0;
        }

        /*
         * internalListObject: a JS object with the same structure of internalList. This means the List doen't have to be the List stored in this class
         * vertexTraversed: JS object with the vertexes of the List which are to be marked as traversed as the key
         * edgeTraversed: JS object with the edges of the List which are to be marked as traversed as the key
         */

        function createState(internalListObject, vertexTraversed, edgeTraversed) {
            if (vertexTraversed == null || vertexTraversed == undefined || !(vertexTraversed instanceof Object))
                vertexTraversed = {};
            if (edgeTraversed == null || edgeTraversed == undefined || !(edgeTraversed instanceof Object))
                edgeTraversed = {};

            var state = {
                "vl": {},
                "el": {}
            };

            var key, vertexClass;

            for (key in internalListObject) {
                if (key != "root") {
                    vertexClass = internalListObject[key]["vertexClassNumber"]

                    state["vl"][vertexClass] = {};

                    state["vl"][vertexClass]["cx"] = internalListObject[key]["cx"];
                    state["vl"][vertexClass]["cy"] = internalListObject[key]["cy"];
                    state["vl"][vertexClass]["text"] = key;
                    state["vl"][vertexClass]["state"] = VERTEX_DEFAULT;
                }

                if (internalListObject[key]["rightChild"] == null)
                    continue;

                parentChildEdgeId = internalListObject[key]["vertexClassNumber"];

                state["el"][parentChildEdgeId] = {};

                state["el"][parentChildEdgeId]["vertexA"] = internalListObject[key]["vertexClassNumber"];
                state["el"][parentChildEdgeId]["vertexB"] = internalListObject[internalListObject[key]["rightChild"]]["vertexClassNumber"];
                state["el"][parentChildEdgeId]["type"] = EDGE_TYPE_DE;
                state["el"][parentChildEdgeId]["weight"] = 1;
                state["el"][parentChildEdgeId]["state"] = EDGE_DEFAULT;
                state["el"][parentChildEdgeId]["animateHighlighted"] = false;

                // add an edge for doubly linked list
                if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                    parentChildEdgeId = internalListObject[key]["vertexClassNumber"] + BACK_EDGE_CONST;
                    state["el"][parentChildEdgeId] = {};

                    state["el"][parentChildEdgeId]["vertexA"] = internalListObject[internalListObject[key]["rightChild"]]["vertexClassNumber"];
                    state["el"][parentChildEdgeId]["vertexB"] = internalListObject[key]["vertexClassNumber"];
                    state["el"][parentChildEdgeId]["type"] = EDGE_TYPE_DE;
                    state["el"][parentChildEdgeId]["weight"] = 1;
                    state["el"][parentChildEdgeId]["state"] = EDGE_DEFAULT;
                    state["el"][parentChildEdgeId]["animateHighlighted"] = false;
                }
            }

            for (key in vertexTraversed) {
                vertexClass = internalListObject[key]["vertexClassNumber"];
                state["vl"][vertexClass]["state"] = VERTEX_TRAVERSED;
            }

            for (key in edgeTraversed)
                state["el"][key]["state"] = EDGE_TRAVERSED;

            return state;
        }

        // modified recalculateposition
        function recalculatePosition() {
            updatePosition(internalList["root"]);

            function updatePosition(currentVertex) {
                if (currentVertex == null)
                    return;

                if (activeStatus == "stack") { // relayout vertical
                    if (currentVertex == internalList["root"])
                        internalList[currentVertex]["cy"] = 20;
                    else {
                        var parentVertex = internalList[currentVertex]["parent"]
                        internalList[currentVertex]["cy"] = internalList[parentVertex]["cy"] + 70;
                    }
                    internalList[currentVertex]["cx"] = 350;
                } else { // relayout horizontal
                    if (currentVertex == internalList["root"])
                        internalList[currentVertex]["cx"] = 20;
                    else {
                        var parentVertex = internalList[currentVertex]["parent"];
                        internalList[currentVertex]["cx"] = internalList[parentVertex]["cx"] + 70;
                    }
                    internalList[currentVertex]["cy"] = 50;
                }

                updatePosition(internalList[currentVertex]["rightChild"]);
            }
        }

        function populatePseudocode(act) {
            switch (act) {
                case 0: // Insert
                    $('#code1').html('Node&lt;E&gt; temp1 = header;');
                    $('#code2').html('for (int k=0;k&lt;index;++k) {temp1 = temp1.next}');
                    $('#code3').html('/*');
                    $('#code4').html('*/');
                    $('#code5').html('Node&lt;E&gt; newNode = new Node&lt;&gt;(data);');
                    if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                        $('#code6').html('newNode.next = temp2 , temp2.prev = newNode');
                        $('#code7').html('temp1.next = newNode , newNode.prev = temp1');
                    } else {
                        $('#code6').html('temp1.next = newNode');
                        $('#code7').html('newNode.next = temp1.next;');
                    }
                    break;
                case 1: // insertHead
                    $('#code1').html('Node&lt;E&gt; newNode = new Node<>(data);');
                    $('#code2').html('newNode.next = head.next;');
                    if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                        if (amountVertex == 1) {
                            $('#code3').html('if (head!=null) head.prev = temp');
                            $('#code4').html('head.next = newNode;');
                            $('#code5').html('tail = head');
                        } else {
                            $('#code3').html('if (head!=null) head.prev = temp');
                            $('#code4').html('head.next = newNode;');
                            $('#code5').html('');
                        }
                    } else if (amountVertex == 1) {
                        $('#code3').html('head.next = newNode;');
                        $('#code4').html('tail = head');
                        $('#code5').html('');
                    } else {
                        $('#code3').html('head.next = newNode;');
                        $('#code4').html('//结束时size++');
                        $('#code5').html('');
                    }
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
                case 2: // insertTail
                    $('#code1').html('Node&lt;E&gt; temp = findNode(size);');
                    $('#code2').html('Node&lt;E&gt; temp = findNode(size);');
                    if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                        $('#code3').html('temp.prev = tail');
                        $('#code4').html('temp.next = newNode;');
                    } else {
                        $('#code3').html('temp.next = newNode;');
                        $('#code4').html('//结束时size++');
                    }
                    $('#code5').html('');
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
                case 3: // peek
                    $('#code1').html('return head.data;');
                    $('#code2').html('');
                    $('#code3').html('');
                    $('#code4').html('');
                    $('#code5').html('');
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
                case 4: // search
                    $('#code1').html('Node temp = head, int index = 0;');
                    $('#code2').html('while (temp.data != input){');
                    $('#code3').html('&nbsp&nbsptemp = temp.next; index++;}');
                    $('#code4').html('&nbsp&nbsp if (temp == null){');
                    $('#code5').html('&nbsp&nbsp&nbsp&nbspreturn -1;}');
                    $('#code6').html('return index;');
                    $('#code7').html('');
                    break;
                case 5: // remove HEAD
                    $('#code1').html('Node&lt;E&gt; temp = head.next;');
                    $('#code2').html('header.next = temp.next;');
                    $('#code3').html('temp.next = null;');
                    if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                        $('#code4').html('if(head!=null) head.prev = null');
                    } else {
                        $('#code4').html('//结束时--size;');
                    }
                    $('#code5').html('');
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
                case 6: // remove TAIL
                    $('#code1').html('Node&lt;E&gt; prev = head;');
                    $('#code2').html('Node&lt;E&gt; temp= head.next;');
                    $('#code3').html('while(temp.next!=null){');
                    $('#code4').html('&nbsp&nbsptemp = temp.next;prev = prev.next;} ');
                    $('#code5').html('prev.next = null;');
                    $('#code6').html('temp=null;');
                    $('#code7').html('//--size;tail = prev');
                    break;
                case 7: // remove kth
                    $('#code1').html('Node&lt;E&gt; cur = head;');
                    $('#code2').html('for(int i=0;i<k;i++){');
                    $('#code3').html('&nbsp&nbspp=temp.next;}');
                    $('#code4').html('Node&lt;E&gt; tobedeleted = cur.next;');
                    if ((activeStatus == "doublylist") || (activeStatus == "deque")) {
                        $('#code5').html('Node temp = tobedeleted.next;');
                        $('#code6').html('tobedeleted.next = null;');
                        $('#code7').html('cur.next = temp, temp.prev = cur;');
                    } else {
                        $('#code5').html('cur.next = tobedeleted.next;');
                        $('#code6').html('tobedeleted.next = null;');
                        $('#code7').html('//结束时--size');
                    }
                    break;
                case 8: //remove tail doubly list
                    $('#code4').html('temp = null;');
                    $('#code5').html('//结束时size--');
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
                case 9: //peek back
                    $('#code1').html('return tail.data;');
                    $('#code2').html('');
                    $('#code1').html('DuLNode&lt;E$gt; tail = findNode(size - 1);');
                    $('#code2').html('DuLNode&lt;E$gt; temp = tail.next;');
                    $('#code3').html('tail.next = null;');
                    $('#code3').html('');
                    $('#code4').html('');
                    $('#code5').html('');
                    $('#code6').html('');
                    $('#code7').html('');
                    break;
            }
        }
    }



    // List actions
    //actions panel stuff
    var actionsWidth = 150;
    var statusCodetraceWidth = 420;

    var isCreateOpen = false;
    var isSearchOpen = false;
    var isInsertOpen = false;
    var isRemoveOpen = false;

    function openCreate() {
        $(".create").css("bottom", "146px");
        $('#createfixedsize-input').hide();
        $('#createuserdefined-input').hide();
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

    function openSearch() {
        if (!isSearchOpen) {
            $('.search').fadeIn('fast');
            isSearchOpen = true;
        }
    }

    function closeSearch() {
        if (isSearchOpen) {
            $('.search').fadeOut('fast');
            $('#search-err').html("");
            isSearchOpen = false;
        }
    }

    function openInsert() {
        $(".insert").css("bottom", "92px");
        $('#insertkth-input').hide();
        $('#inserthead-input').hide();
        $('#inserttail-input').hide();
        if (!isInsertOpen) {
            $('.insert').fadeIn('fast');
            isInsertOpen = true;
        }
    }

    function closeInsert() {
        if (isInsertOpen) {
            $('.insert').fadeOut('fast');
            $('#insert-err').html("");
            isInsertOpen = false;
        }
    }

    function openRemove() {
        $(".remove").css("bottom", "65px");
        $('#removekth-input').hide();
        if (!isRemoveOpen) {
            $('.remove').fadeIn('fast');
            isRemoveOpen = true;
        }
    }

    function closeRemove() {
        if (isRemoveOpen) {
            $('.remove').fadeOut('fast');
            $('#remove-err').html("");
            isRemoveOpen = false;
        }
    }

    //
    function hideEntireActionsPanel() {
        closeCreate();
        closeSearch();
        closeInsert();
        closeRemove();
        hideActionsPanel();
    }



    // local
    $('#play').hide();
    var listWidget = new List();
    var gw = listWidget.getGraphWidget();
    listWidget.setActiveStatus("list");

    $(function() {
        var llMode = getQueryVariable("mode");
        if (llMode.length > 0) {
            $('#title-' + llMode).click();
        }
        var createLL = getQueryVariable("create");
        if (createLL.length > 0) {
            var newLL = createLL.split(",");
            listWidget.generate(newLL);
        }
        var operation = getQueryVariable("operation");
        var operationValue = getQueryVariable("operationValue");
        var operationMode = getQueryVariable("operationMode");
        if (operation.length > 0) {
            switch (operation) {
                case "insert":
                    openInsert();
                    insertModelingOpen(operationMode);
                    $("#" + operationMode + "-input input").val(operationValue);
            }
        }

        $('#create').click(function() {
            closeSearch();
            closeInsert();
            closeRemove();
            openCreate();
        });

        $('#search').click(function() {
            closeCreate();
            closeInsert();
            closeRemove();
            openSearch();
        });

        $('#insert').click(function() {
            closeCreate();
            closeSearch();
            closeRemove();
            openInsert();
        });

        $('#remove').click(function() {
            closeCreate();
            closeSearch();
            closeInsert();
            openRemove();
        });

        // $('#tutorial-2 .tutorial-next').click(function() {
        //     showActionsPanel();
        // });
        // $('#tutorial-3 .tutorial-next').click(function() {
        //     hideEntireActionsPanel();
        // });
        // $('#tutorial-4 .tutorial-next').click(function() {
        //     showStatusPanel();
        // });
        // $('#tutorial-5 .tutorial-next').click(function() {
        //     hideStatusPanel();
        //     showCodetracePanel();
        // });
        // $('#tutorial-6 .tutorial-next').click(function() {
        //     hideCodetracePanel();
        // });

        // if (!localStorage.getItem("listvisited")) {
        //     localStorage.setItem("listvisited", "true");
        //     setTimeout(function() {
        //         $("#mode-menu a").trigger("click");
        //     }, 2000);
        // }
    });

    // title changing
    $('#title-LL').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        showActionsPanel();
        displayList();
        changeTextList();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("list");
    });

    $('#title-Stack').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        showActionsPanel();
        displayStack();
        changeTextStack();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("stack");
    });

    $('#title-Queue').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        showActionsPanel();
        displayQueue();
        changeTextQueue();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("queue");
    });

    $('#title-DLL').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        displayList();
        changeTextDoublyList();
        showActionsPanel();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("doublylist");
    });

    $('#title-CLL').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        displayList();
        changeTextDoublyList();
        showActionsPanel();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("circularlist");
    });

    $('#title-Deque').click(function() {
        if (isPlaying) stop();
        hideEntireActionsPanel();
        displayDeque();
        changeTextDeque();
        showActionsPanel();
        hideStatusPanel();
        hideCodetracePanel();
        listWidget.setActiveStatus("deque");
    });

    function displayList() {
        document.getElementById("insert-deque-input").style.display = "none";
        document.getElementById("insert-deque-front").style.display = "none";
        document.getElementById("insert-deque-back").style.display = "none";
        document.getElementById("remove-deque-front").style.display = "none";
        document.getElementById("remove-deque-back").style.display = "none";
        document.getElementById("search-peek-front").style.display = "none";
        document.getElementById("search-peek-back").style.display = "none";
        document.getElementById("enqueueback-input").style.display = "none";
        document.getElementById("enqueueback-go").style.display = "none";
        document.getElementById("pushtop-input").style.display = "none";
        document.getElementById("pushtop-go").style.display = "none";
        document.getElementById("search-input").style.display = "";
        document.getElementById("search-go").style.display = "";
        document.getElementById("insert-head").style.display = "";
        document.getElementById("insert-tail").style.display = "";
        document.getElementById("insert-kth").style.display = "";
        document.getElementById("remove-head").style.display = "";
        document.getElementById("remove-tail").style.display = "";
        document.getElementById("remove-kth").style.display = "";
    }

    function displayStack() {
        document.getElementById("insert-deque-input").style.display = "none";
        document.getElementById("insert-deque-front").style.display = "none";
        document.getElementById("insert-deque-back").style.display = "none";
        document.getElementById("remove-deque-front").style.display = "none";
        document.getElementById("remove-deque-back").style.display = "none";
        document.getElementById("search-peek-front").style.display = "none";
        document.getElementById("search-peek-back").style.display = "none";
        document.getElementById("enqueueback-input").style.display = "none";
        document.getElementById("enqueueback-go").style.display = "none";
        document.getElementById("pushtop-input").style.display = "";
        document.getElementById("pushtop-go").style.display = "";
        document.getElementById("search-input").style.display = "none";
        document.getElementById("search-go").style.display = "none";
        document.getElementById("insert-head").style.display = "none";
        document.getElementById("insert-tail").style.display = "none";
        document.getElementById("insert-kth").style.display = "none";
        document.getElementById("remove-head").style.display = "none";
        document.getElementById("remove-tail").style.display = "none";
        document.getElementById("remove-kth").style.display = "none";
    }

    function displayQueue() {
        document.getElementById("insert-deque-input").style.display = "none";
        document.getElementById("insert-deque-front").style.display = "none";
        document.getElementById("insert-deque-back").style.display = "none";
        document.getElementById("remove-deque-front").style.display = "none";
        document.getElementById("remove-deque-back").style.display = "none";
        document.getElementById("search-peek-front").style.display = "none";
        document.getElementById("search-peek-back").style.display = "none";
        document.getElementById("enqueueback-input").style.display = "";
        document.getElementById("enqueueback-go").style.display = "";
        document.getElementById("pushtop-input").style.display = "none";
        document.getElementById("pushtop-go").style.display = "none";
        document.getElementById("search-input").style.display = "none";
        document.getElementById("search-go").style.display = "none";
        document.getElementById("insert-head").style.display = "none";
        document.getElementById("insert-tail").style.display = "none";
        document.getElementById("insert-kth").style.display = "none";
        document.getElementById("remove-head").style.display = "none";
        document.getElementById("remove-tail").style.display = "none";
        document.getElementById("remove-kth").style.display = "none";
    }

    function displayDeque() {
        document.getElementById("insert-deque-input").style.display = "";
        document.getElementById("insert-deque-front").style.display = "";
        document.getElementById("insert-deque-back").style.display = "";
        document.getElementById("remove-deque-front").style.display = "";
        document.getElementById("remove-deque-back").style.display = "";
        document.getElementById("search-peek-front").style.display = "";
        document.getElementById("search-peek-back").style.display = "";
        document.getElementById("enqueueback-input").style.display = "none";
        document.getElementById("enqueueback-go").style.display = "none";
        document.getElementById("pushtop-input").style.display = "none";
        document.getElementById("pushtop-go").style.display = "none";
        document.getElementById("search-input").style.display = "none";
        document.getElementById("search-go").style.display = "none";
        document.getElementById("insert-head").style.display = "none";
        document.getElementById("insert-tail").style.display = "none";
        document.getElementById("insert-kth").style.display = "none";
        document.getElementById("remove-head").style.display = "none";
        document.getElementById("remove-tail").style.display = "none";
        document.getElementById("remove-kth").style.display = "none";
    }

    function changeTextList() {
        // document.getElementById('tutorial-1-text').innerHTML = "Linked list is a data structure consisting of a group of vertices which together represent a sequence. Under the simplest form, each vertex is composed of a data and a reference (in other words, a link) to the next vertex in the sequence.";
        document.getElementById('create').innerHTML = "创建";
        document.getElementById('search').innerHTML = "查找";
        document.getElementById('insert').innerHTML = "插入";
        document.getElementById('remove').innerHTML = "删除";
    }

    function changeTextStack() {
        // document.getElementById('tutorial-1-text').innerHTML = "Stack is a particular kind of abstract data type or collection in which the principal (or only) operations on the collection are the addition of an entity to the collection, known as push and removal of an entity, known as pop. It is known as  Last-In-First-Out (LIFO) data structure.";
        document.getElementById('create').innerHTML = "创建";
        document.getElementById('search').innerHTML = "Peek";
        document.getElementById('insert').innerHTML = "Push";
        document.getElementById('remove').innerHTML = "Pop";
    }

    function changeTextQueue() {
        // document.getElementById('tutorial-1-text').innerHTML = "Queue is a particular kind of abstract data type or collection in which the entities in the collection are kept in order and the principal (or only) operations on the collection are the addition of entities to the rear terminal position, known as enqueue, and removal of entities from the front terminal position, known as dequeue. It is known as First-In-First-Out (FIFO) data structure.";
        document.getElementById('create').innerHTML = "创建";
        document.getElementById('search').innerHTML = "Peek";
        document.getElementById('insert').innerHTML = "入队列";
        document.getElementById('remove').innerHTML = "出队列";
    }

    function changeTextDoublyList() {
        // document.getElementById('tutorial-1-text').innerHTML = "Doubly-linked list is a linked data structure that consists of a set of sequentially linked records called vertices. Each vertex contains two fields, called links, that are references to the previous and to the next vertex in the sequence of vertices.";
        document.getElementById('create').innerHTML = "创建";
        document.getElementById('search').innerHTML = "查找";
        document.getElementById('insert').innerHTML = "插入";
        document.getElementById('remove').innerHTML = "删除";
    }

    function changeTextDeque() {
        // document.getElementById('tutorial-1-text').innerHTML = "Double-ended queue (dequeue, often abbreviated to deque, pronounced deck) is an abstract data type that generalizes a queue, for which elements can be added to or removed from either the front (head) or back (tail).";
        document.getElementById('create').innerHTML = "创建";
        document.getElementById('search').innerHTML = "Peek";
        document.getElementById('insert').innerHTML = "入队列";
        document.getElementById('remove').innerHTML = "出队列";
    }

    function searchGeneric() {
        if (listWidget.getActiveStatus() == "list") {
            //do nothing
            //open next level option
        } else if (listWidget.getActiveStatus() == "stack") {
            peekStack();
        } else if (listWidget.getActiveStatus() == "queue") {
            peekQueue();
        } else if (listWidget.getActiveStatus() == "doublylist") {
            //do nothing
            //open next level option
        } else if (listWidget.getActiveStatus() == "deque") {
            //do nothing
            //open next level option
        }
    }

    function removeGeneric() {
        if (listWidget.getActiveStatus() == "list") {
            //do nothing
            //open next level option
        } else if (listWidget.getActiveStatus() == "stack") {
            removeHead();
        } else if (listWidget.getActiveStatus() == "queue") {
            removeHead();
        } else if (listWidget.getActiveStatus() == "doublylist") {
            //do nothing
            //open next level option
        } else if (listWidget.getActiveStatus() == "deque") {
            //do nothing
            //open next level option
        }
    }

    function random() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if ((mode == "exploration") && listWidget.generateRandom()) {
                $('#progress-bar').slider("option", "max", 0);
                closeCreate();
                isPlaying = false;
            }
        }, 500)
        hideStatusPanel();
        hideCodetracePanel();
    }

    function randomLL() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if ((mode == "exploration") && listWidget.generateRandomSorted()) {
                $('#progress-bar').slider("option", "max", 0);
                closeCreate();
                isPlaying = false;
            }
        }, 500)
        hideStatusPanel();
        hideCodetracePanel();
    }

    function randomFixedSize() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-create-size').val();
            input = parseInt(input);
            if ((mode == "exploration") && listWidget.generateRandomFixedSize(input)) {
                $('#progress-bar').slider("option", "max", 0);
                closeCreate();
                isPlaying = false;
            }
        }, 500)
        hideStatusPanel();
        hideCodetracePanel();
    }

    function nonRandom() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-create-arr').val();
            input = input.split(",");
            if ((mode == "exploration") && listWidget.generateUserDefined(input)) {
                $('#progress-bar').slider("option", "max", 0);
                closeCreate();
                isPlaying = false;
            }
        }, 500)
        hideStatusPanel();
        hideCodetracePanel();
    }

    function peekStack() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if ((mode == "exploration") && listWidget.peek()) {
                $('#current-action').show();
                $('#current-action p').html("Peek Top");
                $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                triggerRightPanels();
                isPlaying = true;
            }
        }, 500)
    }

    function peekQueue() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if ((mode == "exploration") && listWidget.peek()) {
                $('#current-action').show();
                $('#current-action p').html("Peek Front");
                $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                triggerRightPanels();
                isPlaying = true;
            }
        }, 500)
    }

    function peekDeque(location) {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if (location == "front") {
                if ((mode == "exploration") && listWidget.peek()) {
                    $('#current-action').show();
                    $('#current-action p').html("Peek Front");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.peekBack()) {
                    $('#current-action').show();
                    $('#current-action p').html("Peek Back");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500)
    }

    function searchVertex() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-search').val();
            input = parseInt(input);
            if ((mode == "exploration") && listWidget.search(input)) {
                $('#current-action').show();
                $('#current-action p').html("查找： " + input);
                $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                triggerRightPanels();
                isPlaying = true;
            }
        }, 500)
    }

    function pushTop() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-push-top-value').val();
            if ((mode == "exploration") && listWidget.insertArrHead(input)) {
                $('#current-action').show();
                $('#current-action p').html("Insert " + input);
                $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                triggerRightPanels();
                isPlaying = true;
            }
        }, 500)
    }

    function enqueueBack() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-enqueue-back-value').val();
            if ((mode == "exploration") && listWidget.insertArrTail(input)) {
                $('#current-action').show();
                $('#current-action p').html("Insert " + input);
                $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                triggerRightPanels();
                isPlaying = true;
            }
        }, 500)
    }


    function insertHead() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-insert-head-value').val();
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.insertArrHeadDoublyList(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.insertArrHead(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500)
    }

    function insertTail() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-insert-tail-value').val();
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.insertArrTailDoublyList(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.insertArrTail(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }

        }, 500)
    }

    function insertKth() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-insert-kth-value').val();
            var index = $('#v-insert-kth').val();
            //input = input.split(",");
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.insertArrKthDoublyList(input, index)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.insertArrKth(input, index)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500)
    }

    function insertDeque(location) {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-insert-deque-value').val();
            if (location == "front") {
                if ((mode == "exploration") && listWidget.insertArrHeadDoublyList(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input + " to Front");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.insertArrTailDoublyList(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Insert " + input + " to Back");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500)
    }


    //another stub function created by me
    function removeHead() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.removeArrHeadDoublyList()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove head");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.removeArrHead()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove head");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500);
    }



    function removeTail() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.removeArrTailDoublyList()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove Tail");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.removeArrTail()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove Tail");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }

        }, 500);
    }

    function removeKth() {
        if (isPlaying) {
            stop();
        }
        setTimeout(function() {
            var input = $('#v-remove-kth').val();
            //input = input.split(",");
            if (listWidget.getActiveStatus() == "doublylist") {
                if ((mode == "exploration") && listWidget.removeArrKthDoublyList(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.removeArrKth(input)) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove " + input);
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500);
    }

    function removeDeque(location) {
        if (isPlaying) stop();
        setTimeout(function() {
            if (location == "front") {
                if ((mode == "exploration") && listWidget.removeArrHeadDoublyList()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove Front");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            } else {
                if ((mode == "exploration") && listWidget.removeArrTailDoublyList()) {
                    $('#current-action').show();
                    $('#current-action p').html("Remove Back");
                    $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
                    triggerRightPanels();
                    isPlaying = true;
                }
            }
        }, 500)
    }

    function createModelingOpen(modelingType) {
        $(".create").css("bottom", "114px");
        if (modelingType != "createfixedsize")
            $('#createfixedsize-input').fadeOut('fast');
        if (modelingType != "createuserdefined")
            $('#createuserdefined-input').fadeOut('fast');
        $('#' + modelingType + '-input').fadeIn('fast');
    }

    function insertModelingOpen(modelingType) {
        $(".insert").css("bottom", "60px");
        if (modelingType != "insertkth")
            $('#insertkth-input').fadeOut('fast');
        if (modelingType != "inserthead")
            $('#inserthead-input').fadeOut('fast');
        if (modelingType != "inserttail")
            $('#inserttail-input').fadeOut('fast');
        $('#' + modelingType + '-input').fadeIn('fast');
    }

    function removeModelingOpen(modelingType) {
        $(".remove").css("bottom", "33px");
        $('#' + modelingType + '-input').fadeIn('fast');
    }
