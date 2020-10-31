window.onload = () => {
    if(window.location.hash !== "") {
        console.log(window.location.hash.slice(1))
        var query = new URLSearchParams(window.location.hash.slice(1))
        if(query.get('type') !== "") {
            document.querySelector('#title-' + query.get('type')).click()
        }
    }
}

var Sorting = function() {
    // constants
    var HIGHLIGHT_NONE = "lightblue";
    var HIGHLIGHT_STANDARD = "green";
    var HIGHLIGHT_SPECIAL = "#DC143C";
    var HIGHLIGHT_SORTED = "orange";

    var HIGHLIGHT_LEFT = "#3CB371";
    var HIGHLIGHT_RIGHT = "#9932CC";
    var HIGHLIGHT_PIVOT = "yellow";

    var HIGHLIGHT_GRAY = "#CCCCCC";

    var HIGHLIGHT_RAINBOW = [
        "#FF0000",
        "#FF4000",
        "#FF8000",
        "#FFBF00",
        "#FFFF00",
        "#BFFF00",
        "#80FF00",
        "#40FF00",
        "#00FF40",
        "#00FF80",
        "#00FFBF",
        "#00FFFF",
        "#00BFFF",
        "#0080FF",
        "#0040FF",
        "#0000FF",
        "#4000FF",
        "#8000FF",
        "#BF00FF",
        "#FF00FF"
    ];

    var HIGHLIGHT_BLUESHADES = [
        HIGHLIGHT_GRAY,
        HIGHLIGHT_NONE,
        "#9DC4E8",
        "#8EB1EB",
        "#7E9DED",
        "#6E89EF",
        "#5E76F1",
        "#4F62F4",
        "#3F4FF6",
        "#2F3BF8",
        "#1F27FA",
        "#1014FD",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF",
        "#0000FF"
    ];

    var POSITION_USE_PRIMARY = "a";
    var POSITION_USE_SECONDARY_IN_DEFAULT_POSITION = "b";

    //Objects definition
    var Entry = function(value, highlight, position, secondaryPositionStatus) {
        this.value = value; // number
        this.highlight = highlight; // string, use HIGHLIGHT_ constants
        this.position = position; // number
        this.secondaryPositionStatus = secondaryPositionStatus; // integer, +ve for position overwrite, -ve for absolute postion (-1 for 0th absolution position)
    }

    var Backlink = function(value, highlight, entryPosition, secondaryPositionStatus) {
        this.value = value; // number
        this.highlight = highlight; // string, use HIGHLIGHT_ constants
        this.entryPosition = entryPosition; // number
        this.secondaryPositionStatus = secondaryPositionStatus; // integer, +ve for position overwrite
    }

    var State = function(entries, backlinks, barsCountOffset, status, lineNo) {
        this.entries = entries; // array of Entry's
        this.backlinks = backlinks; // array of Backlink's
        this.barsCountOffset = barsCountOffset; // how many bars to "disregard" (+ve) or to "imagine" (-ve) w.r.t. state.entries.length when calculating the centre position
        this.status = status;
        this.lineNo = lineNo; //integer or array, line of the code to highlight
    }

    //Helpers
    var EntryBacklinkHelper = new Object();
    EntryBacklinkHelper.appendList = function(entries, backlinks, numArray) {
        for (var i = 0; i < numArray.length; i++) {
            EntryBacklinkHelper.append(entries, backlinks, numArray[i]);
        }
    }

    EntryBacklinkHelper.append = function(entries, backlinks, newNumber) {
        entries.push(new Entry(newNumber, HIGHLIGHT_NONE, entries.length, POSITION_USE_PRIMARY));
        backlinks.push(new Backlink(newNumber, HIGHLIGHT_NONE, backlinks.length, POSITION_USE_PRIMARY));
    }

    EntryBacklinkHelper.update = function(entries, backlinks) {
        for (var i = 0; i < backlinks.length; i++) {
            entries[backlinks[i].entryPosition].highlight = backlinks[i].highlight;
            entries[backlinks[i].entryPosition].position = i;
            entries[backlinks[i].entryPosition].secondaryPositionStatus = backlinks[i].secondaryPositionStatus;
        }
    }

    EntryBacklinkHelper.copyEntry = function(oldEntry) {
        return new Entry(oldEntry.value, oldEntry.highlight, oldEntry.position, oldEntry.secondaryPositionStatus);
    }
    EntryBacklinkHelper.copyBacklink = function(oldBacklink) {
        return new Backlink(oldBacklink.value, oldBacklink.highlight, oldBacklink.entryPosition, oldBacklink.secondaryPositionStatus);
    }
    EntryBacklinkHelper.swapBacklinks = function(backlinks, i, j) {
        var swaptemp = backlinks[i];
        backlinks[i] = backlinks[j];
        backlinks[j] = swaptemp;
    }

    var StateHelper = new Object();
    StateHelper.createNewState = function(numArray) {
        var entries = new Array();
        var backlinks = new Array();
        EntryBacklinkHelper.appendList(entries, backlinks, numArray);
        return new State(entries, backlinks, 0, "", 0);
    }
    StateHelper.copyState = function(oldState) {
        var newEntries = new Array();
        var newBacklinks = new Array();
        for (var i = 0; i < oldState.backlinks.length; i++) {
            newEntries.push(EntryBacklinkHelper.copyEntry(oldState.entries[i]));
            newBacklinks.push(EntryBacklinkHelper.copyBacklink(oldState.backlinks[i]));
        }

        var newLineNo = oldState.lineNo;
        if (newLineNo instanceof Array)
            newLineNo = oldState.lineNo.slice();

        return new State(newEntries, newBacklinks, oldState.barsCountOffset, oldState.status, newLineNo);
    }
    StateHelper.updateCopyPush = function(list, stateToPush) {
        EntryBacklinkHelper.update(stateToPush.entries, stateToPush.backlinks);
        list.push(StateHelper.copyState(stateToPush));
    }

    var FunctionList = new Object();
    FunctionList.text_y = function(d) {
        var barHeight = scaler(d.value);
        if (barHeight < 32)
            return -15;
        return barHeight - 15;
    }
    FunctionList.g_transform = function(d) {
        if (d.secondaryPositionStatus == POSITION_USE_PRIMARY)
            return "translate(" + (centreBarsOffset + d.position * barWidth) + ", " + (maxHeight - scaler(d.value)) + ")";
        else if (d.secondaryPositionStatus == POSITION_USE_SECONDARY_IN_DEFAULT_POSITION)
            return "translate(" + (centreBarsOffset + d.position * barWidth) + ", " + (maxHeight * 2 + gapBetweenPrimaryAndSecondaryRows - scaler(d.value)) + ")";
        else if (d.secondaryPositionStatus >= 0)
            return "translate(" + (centreBarsOffset + d.secondaryPositionStatus * barWidth) + ", " + (maxHeight * 2 + gapBetweenPrimaryAndSecondaryRows - scaler(d.value)) + ")";
        else if (d.secondaryPositionStatus < 0)
            return "translate(" + ((d.secondaryPositionStatus * -1 - 1) * barWidth) + ", " + (maxHeight * 2 + gapBetweenPrimaryAndSecondaryRows - scaler(d.value)) + ")";
        else
            return "translate(0, 0)"; // error
    }
    FunctionList.radixElement_left = function(d) {
        if (d.secondaryPositionStatus == POSITION_USE_PRIMARY)
            return d.position * 65 + centreBarsOffset + "px";
        return d.secondaryPositionStatus * 65 + 17.5 + "px";
    }
    FunctionList.radixElement_bottom = function(d, i) {
        if (d.secondaryPositionStatus == POSITION_USE_PRIMARY)
            return 500 - 24 + "px";
        console.log(i + " " + radixSortBucketOrdering[i]);
        return radixSortBucketOrdering[i] * 30 + 5 + "px";
    }
    FunctionList.radixElement_html = function(d) {
        if (d.highlight == HIGHLIGHT_NONE)
            return d.value;

        var text = "" + d.value;
        while (text.length != 4)
            text = " " + text;

        var positionToHighlight = 0; //positionToHighlight = log_to_base_10(d.highlight), assumes d.highlight is power of 10
        var positionCounter = d.highlight;
        while (positionCounter != 1) {
            positionToHighlight++;
            positionCounter /= 10;
        }

        positionToHighlight = 3 - positionToHighlight;

        if (text.charAt(positionToHighlight) != " ") {
            text = text.slice(0, positionToHighlight) + "<span style='color: #B40404;'>" + text.charAt(positionToHighlight) + "</span>" + text.slice(positionToHighlight + 1);
        }

        text = text.trim();

        return text;
    }

    var makePaler = function(hexColor) {
        var red = Math.floor(parseInt(hexColor.slice(1, 3), 16) + 150);
        var green = Math.floor(parseInt(hexColor.slice(3, 5), 16) + 150);
        var blue = Math.floor(parseInt(hexColor.slice(5, 7), 16) + 150);

        if (red > 255)
            red = 255;
        if (green > 255)
            green = 255;
        if (blue > 255)
            blue = 255;

        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);

        if (red.length == 1)
            red = "0" + red;
        if (green.length == 1)
            green = "0" + green;
        if (blue.length == 1)
            blue = "0" + blue;

        return "#" + red + green + blue;
    }

    //Variables/Settings
    var barWidth = 50;
    var maxHeight = 230;
    var gapBetweenBars = 5;
    var maxNumOfElements = 20; //max 20 elements currently
    var gapBetweenPrimaryAndSecondaryRows = 30; // of the bars

    var maxCountingSortElementValue = 9; // Note that this isn't really customizable, as the code for counting sort is written with this value = 9 in mind.
    var maxRadixSortElementValue = 9999; // Note that this isn't really customizable, as the code for radix sort is written with this value = 9999 in mind.
    var maxElementValue = 50; // for all other sorts - this is fully customizable (seriously)

    var graphElementSize = 10; // The width of the square in the side-graph representing 1 element
    var graphElementGap = 2; // The width of the gap between each element in the side-graph
    var graphRowGap = 10; // The height of the gap between each row in the side graph

    //Code body
    var statelist = new Array();
    var secondaryStatelist = new Array();
    var transitionTime = 500;
    var currentStep = 0;
    var animInterval;
    var issPlaying; //so named so as not to mess with the isPlaying in viz.js

    var quickSortUseRandomizedPivot; //true-false flag
    var mergeSortInversionIndexCounter; //used by merge sort to count the inversion inde
    var centreBarsOffset; // x offset to centre the bars in the canvas
    var radixSortBucketOrdering; // used to order the elements inside each bucket (for radix sort). for formatting purposes.

    var isRadixSort = false;
    var isCountingSort = false;

    this.selectedSortFunction;
    this.useEnhancedBubbleSort = false;
    this.computeInversionIndex = false;

    var canvas = d3
        .select("#viz-canvas")
        .attr("height", maxHeight * 2 + gapBetweenPrimaryAndSecondaryRows)
        .attr("width", barWidth * maxNumOfElements);

    var countingSortSecondaryCanvas = d3
        .select("#viz-counting-sort-secondary-canvas")
        .attr("height", 60)
        .attr("width", barWidth * maxNumOfElements);

    var radixSortCanvas = d3
        .select("#viz-radix-sort-canvas")

    var scaler = d3
        .scale
        .linear()
        .range([0, maxHeight]);

    var drawState = function(stateIndex) {
        if (isRadixSort)
            drawRadixSortCanvas(statelist[stateIndex], secondaryStatelist[stateIndex]);
        else
            drawBars(statelist[stateIndex]);

        $('#status p').html(statelist[stateIndex].status);
        highlightLine(statelist[stateIndex].lineNo);

        if (isCountingSort)
            drawCountingSortCounters(secondaryStatelist[stateIndex]);
    };

    var drawBars = function(state) {
        scaler.domain([0, d3.max(state.entries, function(d) {
            return d.value;
        })]);

        centreBarsOffset = (maxNumOfElements - (state.entries.length - state.barsCountOffset)) * barWidth / 2;
        //canvas
        //.transition()
        //.attr("width", barWidth * state.entries.length);

        var canvasData = canvas.selectAll("g").data(state.entries);

        // Exit ==============================

        var exitData = canvasData
            .exit()
            .remove();

        // Entry ==============================

        var newData = canvasData
            .enter()
            .append("g")
            .attr("transform", FunctionList.g_transform);

        newData
            .append("rect")
            .attr("height", 0)
            .attr("width", 0);

        newData
            .append("text")
            .attr("dy", ".35em")
            .attr("x", (barWidth - gapBetweenBars) / 2)
            .attr("y", FunctionList.text_y)
            .text(function(d) {
                return d.value;
            });

        // Update ==============================

        canvasData
            .select("text")
            .transition()
            .attr("y", FunctionList.text_y)
            .text(function(d) {
                return d.value;
            });

        canvasData
            .select("rect")
            .transition()
            .attr("height", function(d) {
                return scaler(d.value);
            })
            .attr("width", barWidth - gapBetweenBars)
            .style("fill", function(d) {
                return d.highlight;
            });

        canvasData
            .transition()
            .attr("transform", FunctionList.g_transform)
    };

    var drawCountingSortCounters = function(state) {
        var canvasData;
        if (state == null)
            canvasData = countingSortSecondaryCanvas.selectAll("text").data([]);
        else
            canvasData = countingSortSecondaryCanvas.selectAll("text").data(state);

        // Exit ==============================

        var exitData = canvasData
            .exit()
            .remove();

        // Entry ==============================

        var newData = canvasData
            .enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("x", function(d, i) {
                return (i + 5) * barWidth + (barWidth - gapBetweenBars) / 2;
            })
            .attr("y", 20)
            .text(function(d) {
                return d;
            });

        // Update ==============================

        canvasData
            .transition()
            .text(function(d) {
                return d;
            });
    };

    var drawRadixSortCanvas = function(state, secondaryState) {
        centreBarsOffset = (1000 - (state.entries.length * 65 - 10)) / 2; //uh, it's not really bars now, but just reusing the variable - same concept still

        var canvasData = radixSortCanvas.selectAll("div").data(state.entries);
        var radixSortBucketCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        radixSortBucketOrdering = new Array(state.backlinks.length);

        for (var i = 0; i < state.backlinks.length; i++) {
            if (state.backlinks.secondaryPositionStatus != POSITION_USE_PRIMARY)
                radixSortBucketOrdering[state.backlinks[i].entryPosition] = radixSortBucketCount[state.backlinks[i].secondaryPositionStatus]++;
        }

        // Handle the buckets' DIV's
        if (secondaryState)
            $("#radix-sort-bucket-labels-collection").show();
        else
            $("#radix-sort-bucket-labels-collection").hide();

        // Exit ==============================

        var exitData = canvasData
            .exit()
            .remove();

        // Entry ==============================

        var newData = canvasData
            .enter()
            .append("div")
            .classed({
                "radix-sort-element": true
            })
            .style({
                "left": FunctionList.radixElement_left,
                "bottom": FunctionList.radixElement_bottom
            })
            .html(FunctionList.radixElement_html);

        // Update ==============================

        canvasData
            .html(FunctionList.radixElement_html)
            .transition()
            .style({
                "left": FunctionList.radixElement_left,
                "bottom": FunctionList.radixElement_bottom
            });

    };

    var generateRandomNumberArray = function(size, limit) {
        var numArray = new Array();
        for (var i = 0; i < size; i++) {
            numArray.push(generateRandomNumber(1, limit));
        }
        return numArray;
    };

    var generateRandomNumber = function(min, max) { //generates a random integer between min and max (both inclusive)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var convertToNumber = function(num) {
        return +num;
    };

    this.createList = function(type) {

        var numArrayMaxListSize = 20;
        var numArrayMaxElementValue = maxElementValue;
        if (this.selectedSortFunction == this.radixSort) {
            numArrayMaxListSize = 15;
            numArrayMaxElementValue = maxRadixSortElementValue;
        } else if (this.selectedSortFunction == this.countingSort) {
            numArrayMaxElementValue = maxCountingSortElementValue;
        }

        var numArray = generateRandomNumberArray(generateRandomNumber(10, numArrayMaxListSize), numArrayMaxElementValue);

        switch (type) {
            case 'userdefined':
                numArray = $('#userdefined-input').val().split(",");

                if (numArray.length > numArrayMaxListSize) {
                    $("#create-err").html("不能使用多于 " + numArrayMaxListSize + " 个的数据！");
                    return false;
                }

                for (var i = 0; i < numArray.length; i++) {
                    var temp = convertToNumber(numArray[i]);

                    if (numArray[i].trim() == "") {
                        $("#create-err").html("缺少元素！");
                        return false;
                    }
                    if (isNaN(temp)) {
                        $("#create-err").html("非法数据: " + numArray[i] + "！");
                        return false;
                    }
                    if (temp < 1 || temp > numArrayMaxElementValue) {
                        $("#create-err").html("请填写 1 － " + numArrayMaxElementValue + " 之间的数值！ (非法数据: " + numArray[i] + ")");
                        return false;
                    }

                    numArray[i] = convertToNumber(numArray[i]);
                }
                break;
            case 'random':
                break;
            case 'sorted-increasing':
            case 'nearly-sorted-increasing':
                numArray.sort(d3.ascending);
                break;
            case 'sorted-decreasing':
            case 'nearly-sorted-decreasing':
                numArray.sort(d3.descending);
                break;
        }

        if (type.indexOf("nearly") != -1) {
            // To make the list nearly sorted, we take the already sorted list and make swaps
            // such that the list becomes not sorted. The number of such swaps varies from 1 to 2 (customizable).
            // The idea is that the more swaps we make, the less "sorted" the list is.
            //
            // Another limitation is that each swap occurs between elements that are at most 3 positions away.
            while (true) {
                var newNumArray = numArray.slice();

                var numOfSwaps = generateRandomNumber(1, 2);
                for (var i = 0; i < numOfSwaps; i++) {
                    var firstSwappingIndex = generateRandomNumber(0, newNumArray.length - 4);
                    var secondSwappingIndex = generateRandomNumber(1, 3) + firstSwappingIndex;

                    var temp = numArray[firstSwappingIndex];
                    newNumArray[firstSwappingIndex] = numArray[secondSwappingIndex];
                    newNumArray[secondSwappingIndex] = temp;
                }

                // We compare the numArray with newNumArray, if they're are the same,
                // we try again, else we reassign numArray to newNumArray and break.
                var isEquals = true;
                for (var i = 0; i < numArray.length; i++) {
                    if (numArray[i] != newNumArray[i]) {
                        isEquals = false;
                        break;
                    }
                }

                if (!isEquals) {
                    numArray = newNumArray;
                    break;
                }
            }
        }

        $("#create-err").html("");

        issPlaying = false;
        currentStep = 0;

        statelist = [StateHelper.createNewState(numArray)];
        secondaryStatelist = [null]; // the initial secondary state will be an empty state
        drawState(0);
    }

    this.setSelectedSortFunction = function(f) {
        this.selectedSortFunction = f;
        isRadixSort = (this.selectedSortFunction == this.radixSort);
        isCountingSort = (this.selectedSortFunction == this.countingSort);
    }

    this.sort = function() {
        return this.selectedSortFunction();
    }

    this.radixSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "create 10 buckets (queues) for each digit (0 to 9)",
            "for each digit placing",
            "  for each element in list",
            "    move element into respective bucket",
            "  for each bucket, starting from smallest digit",
            "    while bucket is non-empty",
            "      restore element to list"
        ]);

        secondaryStatelist = [false]; // showBucket flag - if true, shows the DIV's representing the bucketss
        var currentPlacing = 1;
        var targetPlacing = 1;
        var backlinkBuckets = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];

        var maxValue = d3.max(state.backlinks, function(d) {
            return d.value;
        });
        while (maxValue >= 10) {
            targetPlacing *= 10;
            maxValue = Math.floor(maxValue / 10);
        }

        for (; currentPlacing <= targetPlacing; currentPlacing *= 10) {
            for (var i = 0; i < numElements; i++)
                state.backlinks[i].highlight = currentPlacing;

            StateHelper.updateCopyPush(statelist, state);
            secondaryStatelist.push(true);

            for (var i = 0; i < numElements; i++) {
                var currentDigit = Math.floor(state.backlinks[i].value / currentPlacing) % 10;
                state.backlinks[i].secondaryPositionStatus = currentDigit;
                backlinkBuckets[currentDigit].push(state.backlinks[i]);
                StateHelper.updateCopyPush(statelist, state);
                secondaryStatelist.push(true);
            }

            for (var i = 0, j = 0; i <= 9;) {
                if (backlinkBuckets[i].length == 0) {
                    i++;
                    continue;
                }

                state.backlinks[j++] = backlinkBuckets[i].shift();
            }

            for (var i = 0; i < numElements; i++) {
                state.backlinks[i].secondaryPositionStatus = POSITION_USE_PRIMARY;
                StateHelper.updateCopyPush(statelist, state);
                secondaryStatelist.push(true);
            }
        }

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE;
        StateHelper.updateCopyPush(statelist, state);
        secondaryStatelist.push(false);

        this.play();
        return true;
    }

    this.countingSort = function() {
        // Note that while we have the maxCountingSortElementValue variable, it isn't really customizable.
        // The code here written is really just for the range 1 to 9.

        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "create key (counting) array",
            "for each element in list",
            "  increase the respective counter by 1",
            "for each counter, starting from smallest key",
            "  while counter is non-zero",
            "    restore element to list",
            "    decrease counter by 1"
        ]);

        var secondaryState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var backlinkBuckets = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];

        state.barsCountOffset = maxCountingSortElementValue;

        for (var i = 1; i <= maxCountingSortElementValue; i++) {
            EntryBacklinkHelper.append(state.entries, state.backlinks, i);
            state.backlinks[numElements + i - 1].highlight = HIGHLIGHT_GRAY;
            state.backlinks[numElements + i - 1].secondaryPositionStatus = i * -1 - 5;
        }

        state.lineNo = 1;
        state.status = "Create the key (counting) array (from 1 to 9).";

        StateHelper.updateCopyPush(statelist, state);
        secondaryStatelist.push(secondaryState.slice()); //copy the array and push it into the secondary statelist

        for (var i = 0; i < numElements; i++) {
            var currentValue = state.backlinks[i].value;

            backlinkBuckets[currentValue - 1].push(state.backlinks[i]);

            state.backlinks[i].secondaryPositionStatus = currentValue * -1 - 5;

            secondaryState[currentValue - 1]++;

            state.backlinks[currentValue + numElements - 1].highlight = HIGHLIGHT_BLUESHADES[secondaryState[currentValue - 1]];

            state.lineNo = [2, 3];
            state.status = "Increase the counter with key " + currentValue + " by 1.";

            StateHelper.updateCopyPush(statelist, state);
            secondaryStatelist.push(secondaryState.slice()); //copy the array and push it into the secondary statelist
        }


        for (var i = 0, j = 0; i < maxCountingSortElementValue;) {
            if (backlinkBuckets[i].length == 0) {
                i++;
                continue;
            }

            state.backlinks[j++] = backlinkBuckets[i].shift();
        }

        for (var i = 0; i < numElements; i++) {
            var currentValue = state.backlinks[i].value;

            state.backlinks[i].secondaryPositionStatus = POSITION_USE_PRIMARY;

            secondaryState[currentValue - 1]--;

            state.backlinks[currentValue + numElements - 1].highlight = HIGHLIGHT_BLUESHADES[secondaryState[currentValue - 1]];

            state.lineNo = [4, 5, 6, 7];
            state.status = "Restore element " + currentValue + ", and decrease the counter with key " + currentValue + " by 1.";

            StateHelper.updateCopyPush(statelist, state);
            secondaryStatelist.push(secondaryState.slice()); //copy the array and push it into the secondary statelist
        }

        state.barsCountOffset = 0;

        for (var i = 1; i <= maxCountingSortElementValue; i++) {
            state.entries.pop();
            state.backlinks.pop();
        }

        state.lineNo = 0;
        state.status = "排序完毕！";
        StateHelper.updateCopyPush(statelist, state);
        secondaryStatelist.push(null); //copy the array and push it into the secondary statelist

        this.play();
        return true;
    }

    this.randomizedQuickSort = function() {
        quickSortUseRandomizedPivot = true;
        quickSortStart();

        this.play();
        return true;
    }

    this.quickSort = function() {
        quickSortUseRandomizedPivot = false;
        quickSortStart();

        this.play();
        return true;
    }

    var quickSortStart = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[statelist.length - 1]);

        populatePseudocode([
            "for each (unsorted) partition",
            " int pivotkey = seqList[left];",
            "  while (left < right) {",
            "   while (left < right&&seqList[left]<=pivotkey){ ",
            "     ++left;}",
            "      seqList[right] = seqList[left];}",
            "   seqList[left] = pivotkey;"
        ]);

        quickSortSplit(state, 0, numElements - 1);

        state.lineNo = 0;
        state.status = "排序完毕！";

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything
        StateHelper.updateCopyPush(statelist, state);
    }

    var quickSortSplit = function(state, startIndex, endIndex) { //startIndex & endIndex inclusive
        state.status = "在分组 [" + state.backlinks.slice(startIndex, endIndex + 1).map(function(d) {
            return d.value;
        }) + "] 中进行 (下标从 " + startIndex + " 到 " + endIndex + " )。"
        state.lineNo = 1;

        if (startIndex > endIndex)
            return;

        if (startIndex == endIndex) {
            state.status += " 由于分组大小为 1 , 分组内元素已到达其排序位置。"
            state.backlinks[startIndex].highlight = HIGHLIGHT_SORTED;
            StateHelper.updateCopyPush(statelist, state);
            return;
        }

        var middleIndex = quickSortPartition(state, startIndex, endIndex);
        quickSortSplit(state, startIndex, middleIndex - 1);
        quickSortSplit(state, middleIndex + 1, endIndex);
    }

    var quickSortPartition = function(state, startIndex, endIndex) {

        var pivotIndex;
        if (quickSortUseRandomizedPivot) {

            pivotIndex = generateRandomNumber(startIndex, endIndex);

            state.status += " 随机选择 " + state.backlinks[pivotIndex].value + " (下标为 " + pivotIndex + ") 作为中心点。"
            state.lineNo = [1, 2];

            state.backlinks[pivotIndex].highlight = HIGHLIGHT_PIVOT;
            StateHelper.updateCopyPush(statelist, state);

            if (pivotIndex != startIndex) {
                state.status = "将中心点 (" + state.backlinks[pivotIndex].value + ", 下标为 " + pivotIndex + ") 与第一个元素 (" + state.backlinks[startIndex].value + " , 下标为 " + startIndex + " 互换). (storeIndex = " + (startIndex + 1) + ".)";
                state.lineNo = [2, 3];

                EntryBacklinkHelper.swapBacklinks(state.backlinks, pivotIndex, startIndex);
                pivotIndex = startIndex;
                StateHelper.updateCopyPush(statelist, state);
            }
        } else {
            pivotIndex = startIndex;

            state.status += " 选择 " + state.backlinks[pivotIndex].value + " 作为中心点。 (storeIndex = " + (startIndex + 1) + ".)";
            state.lineNo = [1, 2, 3];

            state.backlinks[pivotIndex].highlight = HIGHLIGHT_PIVOT;
            StateHelper.updateCopyPush(statelist, state);
        }

        var storeIndex = pivotIndex + 1;
        var pivotValue = state.backlinks[pivotIndex].value;

        for (var i = storeIndex; i <= endIndex; i++) {
            state.status = state.backlinks[i].value + " < " + pivotValue + " (中心点) 吗？"
            state.lineNo = [4, 5];

            state.backlinks[i].highlight = HIGHLIGHT_SPECIAL;
            StateHelper.updateCopyPush(statelist, state);
            if (state.backlinks[i].value < pivotValue) {
                state.status = state.backlinks[i].value + " < " + pivotValue + " (中心点) 。" + " 将下标为 " + i + " (值为 " + state.backlinks[i].value + ") 与元素 (下标为 " + storeIndex + ", 值为 " + state.backlinks[storeIndex].value + "). (互换后 storeIndex = " + (storeIndex + 1) + ").";
                state.lineNo = [4, 6];

                if (i != storeIndex) {
                    EntryBacklinkHelper.swapBacklinks(state.backlinks, storeIndex, i);
                    StateHelper.updateCopyPush(statelist, state);
                }

                state.backlinks[storeIndex].highlight = HIGHLIGHT_LEFT;
                storeIndex++;
            } else {
                state.backlinks[i].highlight = HIGHLIGHT_RIGHT;
            }
        }
        state.status = "循环完毕。";
        state.lineNo = 4;
        StateHelper.updateCopyPush(statelist, state);
        if (storeIndex - 1 != pivotIndex) {
            state.status = "将中心点(下标为 " + pivotIndex + ", 值为 " + pivotValue + ") 与下标为 storeIndex - 1 的元素(下标为 " + (storeIndex - 1) + ", 值为 " + state.backlinks[storeIndex - 1].value + ") 互换。";
            state.lineNo = 7;
            EntryBacklinkHelper.swapBacklinks(state.backlinks, storeIndex - 1, pivotIndex);
            StateHelper.updateCopyPush(statelist, state);
        }

        state.status = "中心点处于已排序位置。";
        state.lineNo = 7;

        for (var i = startIndex; i <= endIndex; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything
        state.backlinks[storeIndex - 1].highlight = HIGHLIGHT_SORTED;
        StateHelper.updateCopyPush(statelist, state);

        return storeIndex - 1;
    }

    this.mergeSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "split(seqList);//into size 1",
            "recursivelyMerge(seqList);",
            "  for(int i=left;i<mid;i++){",
            "    if(seqList[left]<=seqList[mid]){",
            "      temp[left]=seqList[left];",
            "    }else{temp[mid] = seqList[left];}",
            "}merge(temp,seqList);//合并数组"
        ]);

        mergeSortInversionIndexCounter = 0;

        for (var i = 0; i < numElements; i++) {
            state.backlinks[i].highlight = HIGHLIGHT_RAINBOW[i];
        }

        state.status = "首先把数据串以 1 为间隔进行分组 (每个组颜色不同)."
        status.lineNo = 1;
        StateHelper.updateCopyPush(statelist, state);

        this.mergeSortSplitMerge(state, 0, numElements);

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything

        state.status = "排序完毕！";
        if (this.computeInversionIndex) {
            // state.status += " (Inversion Index = " + mergeSortInversionIndexCounter + ".)";
        }

        state.lineNo = 0;
        StateHelper.updateCopyPush(statelist, state);

        this.play();
        return true;
    }

    this.mergeSortSplitMerge = function(state, startIndex, endIndex) { //startIndex inclusive, endIndex exclusive
        if (endIndex - startIndex <= 1)
            return;

        var middleIndex = Math.ceil((startIndex + endIndex) / 2);
        this.mergeSortSplitMerge(state, startIndex, middleIndex);
        this.mergeSortSplitMerge(state, middleIndex, endIndex);
        this.mergeSortMerge(state, startIndex, middleIndex, endIndex)

        // Copy array back
        state.status = "把排序好的数组复制到原来的数组中。";
        state.lineNo = 7;

        var duplicateBacklinks = new Array();
        for (var i = startIndex; i < endIndex; i++) {
            var newPosition = state.backlinks[i].secondaryPositionStatus;
            duplicateBacklinks[newPosition] = state.backlinks[i];
        }

        for (var i = startIndex; i < endIndex; i++) {
            state.backlinks[i] = duplicateBacklinks[i];
        }

        for (var i = startIndex; i < endIndex; i++) {
            state.backlinks[i].secondaryPositionStatus = POSITION_USE_PRIMARY;
            StateHelper.updateCopyPush(statelist, state);
        }
    }

    this.mergeSortMerge = function(state, startIndex, middleIndex, endIndex) {
        var leftIndex = startIndex;
        var rightIndex = middleIndex;

        var newHighlightColor = state.backlinks[startIndex].highlight;

        state.status = "现在对元素 [" + state.backlinks.slice(startIndex, middleIndex).map(function(d) {
            return d.value;
        }) + "] (位置: " + startIndex + " 到 " + (middleIndex - 1) + " ) 和元素 [" + state.backlinks.slice(middleIndex, endIndex).map(function(d) {
            return d.value;
        }) + "] (位置: " + middleIndex + " 到 " + (endIndex - 1) + " ) 进行归并。";
        state.lineNo = 2;

        state.backlinks[leftIndex].highlight = makePaler(state.backlinks[leftIndex].highlight);
        state.backlinks[rightIndex].highlight = makePaler(state.backlinks[rightIndex].highlight);
        StateHelper.updateCopyPush(statelist, state);

        for (var i = startIndex; i < endIndex; i++) {
            // Note here we don't actually copy the elements into a new array, like in a usual mergesort.
            // This is left instead to the mergeSortSplitMerge to handle as it's easier there.
            // (We use the useSecondaryPostion property to overcome this lack-of-copying.)
            if (leftIndex < middleIndex && (rightIndex >= endIndex || state.backlinks[leftIndex].value <= state.backlinks[rightIndex].value)) {
                state.backlinks[leftIndex].highlight = newHighlightColor;
                state.backlinks[leftIndex].secondaryPositionStatus = i;

                if (rightIndex < endIndex) {
                    state.status = "因为 " + state.backlinks[leftIndex].value + " (左边的元素) <= " + state.backlinks[rightIndex].value + " (右边的元素), 把 " + state.backlinks[leftIndex].value + " 复制进新的数组。";
                } else {
                    state.status = "因为右边的元素是空的, 所以把 " + state.backlinks[leftIndex].value + " (左边的元素) 复制到新的数组。";
                }
                state.lineNo = [3, 4, 5];

                leftIndex++;
                if (leftIndex != middleIndex)
                    state.backlinks[leftIndex].highlight = makePaler(state.backlinks[leftIndex].highlight);

                StateHelper.updateCopyPush(statelist, state);
            } else {
                state.backlinks[rightIndex].highlight = newHighlightColor;
                state.backlinks[rightIndex].secondaryPositionStatus = i;

                if (leftIndex < middleIndex) {
                    state.status = "因为 " + state.backlinks[leftIndex].value + " (右边的元素) > " + state.backlinks[rightIndex].value + " (右边的元素), 把 " + state.backlinks[rightIndex].value + " 复制进新的数组.";
                } else {
                    state.status = "因为左边的元素是空的, 所以把 " + state.backlinks[leftIndex].value + " (右边的元素) 复制到新的数组。";
                }

                if (this.computeInversionIndex) {
                    mergeSortInversionIndexCounter += middleIndex - leftIndex;
                    // state.status += " (We add size_of_left_partition (= " + (middleIndex - leftIndex) + ") to the inversionIndexCounter (" + mergeSortInversionIndexCounter + ").)";
                } else {
                    // state.status += "wierd";
                }
                state.lineNo = [3, 6];

                rightIndex++;
                if (rightIndex != endIndex)
                    state.backlinks[rightIndex].highlight = makePaler(state.backlinks[rightIndex].highlight);

                StateHelper.updateCopyPush(statelist, state);
            }
        }
    }

    this.insertionSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "mark first element as sorted",
            "// 由于只有一个元素时本身就是有序的，所以从第二个开始",
            "  for (int i=1;i<seqList.length;++i) {",
            "  for (int j=i-1; j>=0 ; --j) {",
            "     if(seqList[j+1] < seqList[j]){",
            "     swap(seqList,j+1,j);}}}",
            "    //else直接插入元素"
        ]);

        // First element always sorted
        state.lineNo = 1;
        state.status = "标记第一个元素 (" + state.backlinks[0].value + ") 。";
        state.backlinks[0].highlight = HIGHLIGHT_SORTED;
        StateHelper.updateCopyPush(statelist, state);

        for (var i = 1; i < numElements; i++) {
            // Highlight first unsorted element
            state.lineNo = [2, 3];
            state.status = "提取出第一个未排序的元素 (" + state.backlinks[i].value + ") 。";
            state.backlinks[i].highlight = HIGHLIGHT_SPECIAL;
            state.backlinks[i].secondaryPositionStatus = POSITION_USE_SECONDARY_IN_DEFAULT_POSITION;
            StateHelper.updateCopyPush(statelist, state);

            for (var j = i - 1; j >= 0; j--) {
                state.lineNo = 4;
                state.status = "查找被提取元素的放置位置;与已排序元素 " + state.backlinks[j].value + " 比较。";
                state.backlinks[j].highlight = HIGHLIGHT_STANDARD;
                StateHelper.updateCopyPush(statelist, state);

                if (state.backlinks[j].value > state.backlinks[j + 1].value) {
                    state.lineNo = [5, 6];
                    state.status = state.backlinks[j].value + " > " + state.backlinks[j + 1].value + " 正确, 因此移动当前已排序的元素 (" + state.backlinks[j].value + ") 向右移动1。";
                    EntryBacklinkHelper.swapBacklinks(state.backlinks, j, j + 1);

                    StateHelper.updateCopyPush(statelist, state);

                    state.backlinks[j + 1].highlight = HIGHLIGHT_SORTED;
                } else {
                    state.lineNo = 7;
                    state.status = state.backlinks[j].value + " > " + state.backlinks[j + 1].value + " 错误, 在当前位置插入元素。";
                    state.backlinks[j].highlight = HIGHLIGHT_SORTED;
                    state.backlinks[j + 1].secondaryPositionStatus = POSITION_USE_PRIMARY;
                    state.backlinks[j + 1].highlight = HIGHLIGHT_SORTED;
                    StateHelper.updateCopyPush(statelist, state);
                    break;
                }
            }

            if (state.backlinks[0].secondaryPositionStatus == POSITION_USE_SECONDARY_IN_DEFAULT_POSITION) {
                state.lineNo = 4;
                state.status = "以到达数组首部 (无需再进行比较) ,因此,在当前位置插入元素。";
                state.backlinks[0].secondaryPositionStatus = POSITION_USE_PRIMARY;
                state.backlinks[0].highlight = HIGHLIGHT_SORTED;
                StateHelper.updateCopyPush(statelist, state);
            }
        }

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything
        state.lineNo = 0;
        state.status = "排序完毕！";
        StateHelper.updateCopyPush(statelist, state);

        this.play();
        return true;
    }

    this.selectionSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "for (int i = 0; i < seqList.length; ++i) {",
            "  int min=seqList[i], position = i; ",
            "  for (int j = i + 1; j < seqList.length; ++j) {",
            "    if (seqList[j] < min) {",
            "      setAsNewMin(seqList,j,min,position);}}",
            "  swap(seqList,position,i,min);}}",
            "  //交换seqList[position]和seqList[i](min)的值"

        ]);

        for (var i = 0; i < numElements - 1; i++) {
            var minPosition = i;

            state.status = "第 " + (i + 1) + " 遍循环: 设置 " + state.backlinks[i].value + " 为当前最小值(min),position为最小值下标,然后遍历剩余的元素寻找真正的最小值。";
            state.lineNo = [1, 2, 3];
            state.backlinks[minPosition].highlight = HIGHLIGHT_SPECIAL;

            StateHelper.updateCopyPush(statelist, state);

            for (var j = i + 1; j < numElements; j++) {
                state.status = "检查 " + state.backlinks[j].value + " 是否比当前最小元素小 (" + state.backlinks[minPosition].value + ")。";
                state.lineNo = 4;
                state.backlinks[j].highlight = HIGHLIGHT_STANDARD;
                StateHelper.updateCopyPush(statelist, state);

                state.backlinks[j].highlight = HIGHLIGHT_NONE;

                if (state.backlinks[j].value < state.backlinks[minPosition].value) {
                    state.status = "把 " + state.backlinks[j].value + " 设置为最小值。";
                    state.lineNo = 5;
                    state.backlinks[minPosition].highlight = HIGHLIGHT_NONE;
                    state.backlinks[j].highlight = HIGHLIGHT_SPECIAL;

                    minPosition = j;
                    StateHelper.updateCopyPush(statelist, state);
                }
            }


            if (minPosition != i) { // Highlight the first-most unswapped position, if it isn't the minimum
                state.status = "把现有的最小值 (" + state.backlinks[minPosition].value + ") 和最前面的未排好序的元素 (" + state.backlinks[i].value + ") 进行交换。";
                state.lineNo = 6;
                state.backlinks[i].highlight = HIGHLIGHT_SPECIAL;
                StateHelper.updateCopyPush(statelist, state);

                EntryBacklinkHelper.swapBacklinks(state.backlinks, minPosition, i);
                StateHelper.updateCopyPush(statelist, state);
            } else {
                state.status = "现在找到的最小值正好就是最前面未排好序的元素,所以不用swap操作。";
                state.lineNo = 6;
                StateHelper.updateCopyPush(statelist, state);
            }

            state.status = state.backlinks[i].value + " 这个元素现在认为是已经排好序了的。"
            state.backlinks[minPosition].highlight = HIGHLIGHT_NONE;
            state.backlinks[i].highlight = HIGHLIGHT_SORTED;
            StateHelper.updateCopyPush(statelist, state);
        }

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything
        state.status = "排序完毕！"
        status.lineNo = 0;
        StateHelper.updateCopyPush(statelist, state);

        this.play();
        return true;
    }

    this.bubbleSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        var swapCounter = 0;

        populatePseudocode([
            "do{//初始i为0，每趟加1且始终小于seqList长度",
            "  boolean swapped = false  ",
            "  for (int j = 0; j < seqList.length - 1 - i; ++j) {",
            "    if (seqList[j + 1] < seqList[j]) {",
            "      swap(seqList, j, j + 1);",
            "      swapped = true;}}",
            "}while flag;//swapped为false，跳出循环"
        ]);

        var swapped;
        var indexOfLastUnsortedElement = numElements;
        do {
            swapped = false;

            state.status = "设置标记 swapped 为 false。然后开始 1 到 " + (numElements - 1) + "的循环。";
            state.lineNo = [2, 3];
            StateHelper.updateCopyPush(statelist, state);

            for (var i = 1; i < indexOfLastUnsortedElement; i++) {
                state.backlinks[i - 1].highlight = HIGHLIGHT_STANDARD;
                state.backlinks[i].highlight = HIGHLIGHT_STANDARD;

                state.status = "" + state.backlinks[i - 1].value + " > " + state.backlinks[i].value + "吗？ 如果是的则交换元素。 (当前 swapped = " + swapped + ")。";
                state.lineNo = 4;
                StateHelper.updateCopyPush(statelist, state);

                if (state.backlinks[i - 1].value > state.backlinks[i].value) {
                    swapped = true;

                    state.status = "交换 " + state.backlinks[i - 1].value + " 和 " + state.backlinks[i].value + " 的位置。 设置 swapped 为 true。";
                    if (this.computeInversionIndex) {
                        swapCounter++;
                        // state.status += " (For inversion index: Add 1 to swapCounter. Current value of swapCounter = " + swapCounter + ".)";
                    }

                    state.lineNo = [5, 6];

                    EntryBacklinkHelper.swapBacklinks(state.backlinks, i, i - 1);
                    StateHelper.updateCopyPush(statelist, state);
                }

                state.backlinks[i - 1].highlight = HIGHLIGHT_NONE;
                state.backlinks[i].highlight = HIGHLIGHT_NONE;
            }

            if (this.useEnhancedBubbleSort) {
                indexOfLastUnsortedElement--;
                state.backlinks[indexOfLastUnsortedElement].highlight = HIGHLIGHT_SORTED;
                // state.status = "Mark last unsorted element as sorted. Then check if swapped == true, repeat loop, else terminate."
            } else {
                state.status = "如果 swapped 为 true, 那么重复循环, 否则终止。";
            }

            state.lineNo = 7;
            StateHelper.updateCopyPush(statelist, state);
        } while (swapped);

        for (var i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything

        state.status = "排序完毕！";
        if (this.computeInversionIndex)
            // state.status += " (Inversion Index = " + swapCounter + ".)";

        state.lineNo = 0;
        StateHelper.updateCopyPush(statelist, state);

        this.play();
        return true;
    }

    this.shellSort = function() {
        var numElements = statelist[0].backlinks.length;
        var state = StateHelper.copyState(statelist[0]);

        populatePseudocode([
            "while (step != 1)",
            " step /= 2;",
            "  for(int i = 0; i < step; ++i){",
            "   for(int j=i+step ; j<seqList.length ; j+=step){",
            "    for(int k=j-step;k>=0 && ",
            "        seqList[k+step] < seqList[k];k-=step){",
            "     swap(seqList, k + step, k)}}};",
        ]);

        let step = numElements;

        state.lineNo = 1;
        state.status = "标记第一个元素 (" + state.backlinks[0].value + ") 。";
        state.backlinks[0].highlight = HIGHLIGHT_SORTED;
        StateHelper.updateCopyPush(statelist, state);

        while (step !== 1) {
            state.status = "初始步长step设为数组长度一半（向下取整）。然后开始 1 到 " + (Math.floor(numElements/2)-1) + "的循环。";
            state.lineNo = [2, 3];
            StateHelper.updateCopyPush(statelist, state);
            step = Math.floor(step / 2);
            for (let i = 0; i < step; ++i) {
                for (let j = i + step; j < numElements; j += step) {
                    state.status = "取 j 为 i+step，开始 i+step 到"+(numElements - 1)+"的循环。";
                    state.lineNo = 4;
                    StateHelper.updateCopyPush(statelist, state);
                    for (let k = j - step; k >= 0; k -= step) {
                        state.backlinks[k].highlight = HIGHLIGHT_STANDARD;
                        state.backlinks[k+step].highlight = HIGHLIGHT_SPECIAL;
                        state.backlinks[k+step].secondaryPositionStatus = POSITION_USE_SECONDARY_IN_DEFAULT_POSITION;
                        state.status = "" + state.backlinks[k + step].value + "<" + state.backlinks[k].value +"吗？如果是则交换元素。";
                        state.lineNo = [5,6,7];
                        StateHelper.updateCopyPush(statelist, state);
                        if(state.backlinks[k + step].value < state.backlinks[k].value){
                            EntryBacklinkHelper.swapBacklinks(state.backlinks, k + step, k);
                        }
                        state.backlinks[k].highlight = HIGHLIGHT_SORTED;
                        state.backlinks[k].secondaryPositionStatus = POSITION_USE_PRIMARY;
                        state.backlinks[k+step].highlight = HIGHLIGHT_SORTED;
                        state.backlinks[k+step].secondaryPositionStatus = POSITION_USE_PRIMARY;



                    }
                }
            }
        }
        for (let i = 0; i < numElements; i++)
            state.backlinks[i].highlight = HIGHLIGHT_NONE; //unhighlight everything

        state.status = "排序完毕！";
        state.lineNo = 0;
        StateHelper.updateCopyPush(statelist, state);

        this.play();
        return true;


    }

    this.clearPseudocode = function() {
        populatePseudocode([]);
    }

    var populatePseudocode = function(code) {
        var i = 1;
        for (; i <= 7 && i <= code.length; i++) {
            $("#code" + i).html(
                code[i - 1].replace(
                    /^\s+/,
                    function(m) {
                        return m.replace(/\s/g, "&nbsp;");
                    }
                )
            );
        }
        for (; i <= 7; i++) {
            $("#code" + i).html("");
        }
    }

    //animation functions
    var drawCurrentState = function() {
        $('#progress-bar').slider("value", currentStep);
        drawState(currentStep);
        if (currentStep == (statelist.length - 1)) {
            pause(); //in html file
            $('#play img').attr('src', '../img/replay.png').attr('alt', 'replay').attr('title', 'replay');
        } else
            $('#play img').attr('src', '../img/play.png').attr('alt', 'play').attr('title', 'play');
    }

    this.getAnimationDuration = function() {
        return transitionTime;
    }

    this.setAnimationDuration = function(x) {
        transitionTime = x;
        if (issPlaying) {
            clearInterval(animInterval);
            animInterval = setInterval(function() {
                drawCurrentState();
                if (currentStep < (statelist.length - 1))
                    currentStep++;
                else
                    clearInterval(animInterval);
            }, transitionTime);
        }
    }

    this.getCurrentIteration = function() {
        return currentStep;
    }

    this.getTotalIteration = function() {
        return statelist.length;
    }

    this.forceNext = function() {
        if ((currentStep + 1) < statelist.length)
            currentStep++;
        drawCurrentState();
    }

    this.forcePrevious = function() {
        if ((currentStep - 1) >= 0)
            currentStep--;
        drawCurrentState();
    }

    this.jumpToIteration = function(n) {
        currentStep = n;
        drawCurrentState();
    }

    this.play = function() {
        issPlaying = true;
        drawCurrentState();
        animInterval = setInterval(function() {
            drawCurrentState();
            if (currentStep < (statelist.length - 1))
                currentStep++;
            else
                clearInterval(animInterval);
        }, transitionTime);
    }

    this.pause = function() {
        issPlaying = false;
        clearInterval(animInterval);
    }

    this.replay = function() {
        issPlaying = true;
        currentStep = 0;
        drawCurrentState();
        animInterval = setInterval(function() {
            drawCurrentState();
            if (currentStep < (statelist.length - 1))
                currentStep++;
            else
                clearInterval(animInterval);
        }, transitionTime);
    }

    this.stop = function() {
        issPlaying = false;
        statelist = [statelist[0]]; //clear statelist to original state, instead of new Array();
        secondaryStatelist = [null];
        currentStep = 0;
        drawState(0);
    }
}



// sorting action
var actionsWidth = 150;
var statusCodetraceWidth = 420;

var isCreateOpen = false;
var isInsertOpen = false;
var isRemoveOpen = false;
var isSortOpen = false;

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

function openInsert() {
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

function openSort() {
    if (!isSortOpen) {
        $('.sort').fadeIn('fast');
        isSortOpen = true;
    }
}

function closeSort() {
    if (isSortOpen) {
        $('.sort').fadeOut('fast');
        $('#sort-err').html("");
        isSortOpen = false;
    }
}

function hideEntireActionsPanel() {
    closeCreate();
    closeInsert();
    closeRemove();
    closeSort();
    hideActionsPanel();
}



// local
$(function() {
    hideAllSubmenus();
    $('#title-Bubble').click();
    $('#play').hide();

    d3.selectAll("#radix-sort-bucket-labels-collection span")
        .style({
            "left": function(d, i) {
                return 17.5 + i * 65 + "px";
            }
        });
    var sortMode = getQueryVariable("mode");
    if (sortMode.length > 0) {
        $('#title-' + sortMode).click();
    }
    var createArray = getQueryVariable("create");
    if (createArray.length > 0) {
        $('#userdefined-input').val(createArray);
        createList("userdefined");
    }

    $('#create').click(function() {
        closeInsert();
        closeRemove();
        closeSort();
        openCreate();
    });

    $('#insert').click(function() {
        closeCreate();
        closeRemove();
        closeSort();
        openInsert();
    });

    $('#remove').click(function() {
        closeCreate();
        closeInsert();
        closeSort();
        openRemove();
    });

    $('#sort').click(function() {
        closeCreate();
        closeInsert();
        closeRemove();
        openSort();
    });

});

//this viz-specific code
var gw = new Sorting();
// gw.init(); no init() code - all done as part of the $(document).ready() call

// title changing
$('#title-Bubble').click(function() {
    showStandardCanvas();

    //hideAllSortingOptions();
    $("#sort-bubble-enhanced").css("display", "");
    $("#sort-bubble-merge-inversion").css("display", "");

    $('#current-action p').html("冒泡排序");
    changeSortType(gw.bubbleSort);
});

$('#title-Selection').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();

    $('#current-action p').html("选择排序");
    changeSortType(gw.selectionSort);
});

$('#title-Insertion').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();

    $('#current-action p').html("插入排序");
    changeSortType(gw.insertionSort);
});

$('#title-Merge').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();
    $("#sort-bubble-merge-inversion").css("display", "");

    $('#current-action p').html("归并排序");
    changeSortType(gw.mergeSort);
});

$('#title-Quick').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();

    $('#current-action p').html("快速排序");
    changeSortType(gw.quickSort);
});

$('#title-Shell').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();

    $('#current-action p').html("希尔排序");
    changeSortType(gw.shellSort);
});

$('#title-RandomizedQuick').click(function() {
    showStandardCanvas();

    hideAllSortingOptions();

    $('#current-action p').html("Randomized Quick Sort");
    changeSortType(gw.randomizedQuickSort);
});

$('#title-Counting').click(function() {
    showStandardCanvas();
    $("#viz-counting-sort-secondary-canvas").show();

    hideAllSortingOptions();

    $('#current-action p').html("Counting Sort");
    changeSortType(gw.countingSort, "2, 3, 8, 7, 1, 2, 2, 2, 7, 3, 9, 8, 2, 1, 4, 2, 4, 6, 9, 2");
});

$('#title-Radix').click(function() {
    hideAllCanvases();
    $("#viz-radix-sort-canvas").show();

    hideAllSortingOptions();

    $('#current-action p').html("Radix Sort");
    changeSortType(gw.radixSort, "3221, 1, 10, 9680, 577, 9420, 7, 5622, 4793, 2030, 3138, 82, 2599, 743, 4127");
});

function changeSortType(newSortingFunction, customNumberList) {
    if (!customNumberList)
        $('#userdefined-input').val("3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48");
    else
        $('#userdefined-input').val(customNumberList);
    createList('userdefined');

    if (isPlaying) stop();
    showActionsPanel();
    hideStatusPanel();
    hideCodetracePanel();
    gw.clearPseudocode();
    gw.setSelectedSortFunction(newSortingFunction);
}

function createList(type) {
    if (isPlaying) stop();
    setTimeout(function() {
        if ((mode == "exploration") && gw.createList(type)) {
            $('#progress-bar').slider("option", "max", 0);
            closeCreate();
            isPlaying = false;
        }
    }, 500);
}

function sort() {
    gw.useEnhancedBubbleSort = $('#sort-bubble-enhanced-checkbox').prop('checked');
    gw.computeInversionIndex = $('#sort-bubble-merge-inversion-checkbox').prop('checked');

    if (isPlaying) stop();
    setTimeout(function() {
        if ((mode == "exploration") && gw.sort()) {
            $('#current-action').show();
            $('#progress-bar').slider("option", "max", gw.getTotalIteration() - 1);
            triggerRightPanels();
            isPlaying = true;
        }
    }, 500);
}

//submenu stuff
var lastSubmenuShown = null;

function triggerSubmenu(which) {
    hideAllSubmenus();
    if (lastSubmenuShown == which) {
        lastSubmenuShown = null;
        return;
    }

    lastSubmenuShown = which;

    $(".create").css("bottom", "60px");
    if (which == "sorted") {
        $("#create-sorted-increasing").show();
        $("#create-sorted-decreasing").show();
    } else if (which == "nearly-sorted") {
        $("#create-nearly-sorted-increasing").show();
        $("#create-nearly-sorted-decreasing").show();
    }
}

function hideAllSubmenus() {
    $(".create").css("bottom", "92px");
    $("#create-sorted-increasing").hide();
    $("#create-sorted-decreasing").hide();
    $("#create-nearly-sorted-increasing").hide();
    $("#create-nearly-sorted-decreasing").hide();
}

// sort options
function hideAllSortingOptions() {
    $("#sort-bubble-enhanced").css("display", "none");
    $("#sort-bubble-merge-inversion").css("display", "none");
}

// canvas
function hideAllCanvases() {
    $("#viz-canvas").hide();
    $("#viz-counting-sort-secondary-canvas").hide();
    $("#viz-radix-sort-canvas").hide();
}

function showStandardCanvas() {
    $("#viz-canvas").show();
    $("#viz-counting-sort-secondary-canvas").hide();
    $("#viz-radix-sort-canvas").hide();
}
