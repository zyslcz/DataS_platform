var present = function () {

  var canvas = d3
        .select("#viz-canvas")
        .attr("height", maxHeight * 2 + gapBetweenPrimaryAndSecondaryRows)
        .attr("width", barWidth * maxNumOfElements);

  var drawRect = function(arr) {
    scaler.domain([0, arr.length]);

    centreBarsOffset = (maxNumOfElements - (state.entries.length - state.barsCountOffset)) * barWidth / 2;
    //canvas
    //.transition()
    //.attr("width", barWidth * state.entries.length);

    var canvasData = canvas.selectAll("g").data(arr);

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
          return d;
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

  this.createList = function (type) {

    numArray = $('#input-present').val().split(",");

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

  // $("#create-err").html("");

  issPlaying = false;
  currentStep = 0;

  statelist = [StateHelper.createNewState(numArray)];
  secondaryStatelist = [null]; // the initial secondary state will be an empty state
  drawRect(numArray);
}