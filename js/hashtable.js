var HashTable = function() {
  var self = this;
  var graphWidget = new GraphWidget();
  var activeStatus = "LP"; // default Linear Probing
  var maxHashTableSize = 17; // we only allow primes up to 17
  var primes = [3, 5, 7, 11, 13, 17]; // OK, only these 5 primes are actually within our range of allowed Hash Table size
  var EMPTY = -2; // use -2 to indicate EMPTY element
  var DELETED = -1; // use -1 to indicate DELETED element
  var HT = [14, 21, 1, EMPTY, 18, EMPTY, EMPTY];  // HT: the Array that represents the state of the Hash Table
  var N = 4; // number of elements actually present in the hash table

  init(HT);

  this.setActiveStatus = function(newActiveStatus) {
    if (activeStatus != newActiveStatus) {
      activeStatus = newActiveStatus;
      if (activeStatus == "LP") {
        HT = [14, 21, 1, EMPTY, 18, EMPTY, EMPTY];
        N = 4;
      }
      else if (activeStatus == "QP") {
        HT = [38, EMPTY, EMPTY, 3, 18, EMPTY, EMPTY];
        N = 3;
      }
      else if (activeStatus == "DH") {
        HT = [14, EMPTY, EMPTY, 7, 18, EMPTY, EMPTY];
        N = 3;
      }
      init(HT);
    }
  }

  this.getActiveStatus = function() { return activeStatus; }

  this.getGraphWidget = function() { return graphWidget; }

  this.createTable = function(sz) {
    if (activeStatus != "SC") { // NOT Separate Chaining means Open Addressing where we cannot have big table
      if (sz > maxHashTableSize) {
        $('#create-err').html("哈希表最大为 " + maxHashTableSize);
        return false;
      }
      else if (sz < 5) {
        $('#create-err').html("哈希表最小为 5");
        return false;
      }
    }

    var newHT = new Array(sz);
    for (var i = 0; i < sz; i++)
      newHT[i] = 0;
    N = 0;

    init(newHT);
  };

  this.generate = function(ht) {
    if (ht.length > maxHashTableSize) {
      $('#create-err').html("哈希表最大为 " + maxHashTableSize);
      return;
    }
    if (ht.length < 5) {
      $('#create-err').html("哈希表最小为 5");
      return;
    }

    for (var i = 0; i < ht.length; i++) {
      ht[i] = parseInt(ht[i]);
      if (ht[i] < EMPTY)
        return; // can't create this hashtable
    }
    init(ht);
  };

  function init(initArr) {
    var scale = (900-100) / initArr.length;

    // remove old ones first (if exist)
    try {
      for (var i = 0; i < 20; i++) // I don't record how many but not more than 20
        graphWidget.removeVertex(i);
    }
    catch (e) { // do nothing if that vertex actually not yet exist

    }

    HT = new Array(); // destroy previous content first...
    for (var i = 0; i < initArr.length; i++) {
      HT[i] = initArr[i];
      graphWidget.addVertex(50 + i * scale, 100, (HT[i] == EMPTY ? '' : HT[i]), i, true, "i:" + i);
    }
  }

  this.search = function(key) {
    var stateList = [];
    var vertexTraversed = {};
    var edgeTraversed = {};
    var cs;

    if (key < 0 || key > 99) {
        cs = createState(vertexTraversed, edgeTraversed);
        cs["status"] = "key = " + key + " 错误, 请输入0-99的整数。";
        stateList.push(cs);
    }
    else {
      var i = key % (HT.length), base = i;
      var i_next;
      var jump = 1;
      var step = 1;
      var k = 5, smallerPrime = primes[k]; // start from 17
      while (smallerPrime >= HT.length)
        smallerPrime = primes[k--];
      var secondary = smallerPrime - key % smallerPrime; // so it will always be positive
      var strategy = "线性探查法"

      cs = createState(vertexTraversed, edgeTraversed);
      cs["status"] = "key = " + key + "， 其存储位置应为 " + key + "%" + HT.length + " = " + i + "。";
      cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
      cs["lineNo"] = 1;
      stateList.push(cs);
      vertexTraversed[i] = true; // this is traversed in future iteration

      while (true) {
        if (HT[i] == EMPTY) { // Not Found
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] 为空<br>key = " + key + " 查找失败。";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 3;
          stateList.push(cs);
          break;
        }
        else if (HT[i] == key) { // Found
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] = " + key + "<br>key = " + key + "查找成功，其存储位置为" + i + "。";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 4;
          stateList.push(cs);
          break;
        }
        else {
          if (activeStatus == "LP") {
            jump = 1;
            strategy = "线性探查法"
          }
          else if (activeStatus == "QP") {
            jump = step;
            strategy = "二次探查法";
          }
          else if (activeStatus == "DH") {
            jump = secondary;
            strategy = "双重散列法";
          }

          i_next = (base + step * jump) % HT.length;

          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] = " + HT[i] + " != key<br>通过" + strategy + "查找i.next = (" + base + "+" + step + "*" + jump + ")%" + HT.length + " = " + i_next + "。";
          cs["vl"][i_next]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 5;
          stateList.push(cs);
          vertexTraversed[i_next] = true; // this is traversed in future iteration
          i = i_next;
          step++;
        }
      }
    }

    graphWidget.startAnimation(stateList);
    populatePseudocode(0);

    return true;
  }

  this.insert = function(keys) {
    var stateList = [];
    var vertexTraversed = {};
    var edgeTraversed = {};
    var cs;

    var the_keys = keys.split(",");
    for (idx in the_keys) {
      key = parseInt(the_keys[idx]);

      if (key < 0 || key > 99) {
        cs = createState(vertexTraversed, edgeTraversed);
        cs["status"] = "key = " + key + " 错误, 请输入0-99的整数。";
        stateList.push(cs);
      }
      else {
        if (N+1 == HT.length) { // one item before full (if we allow full, our search can get into infinite loop)
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "哈希表已满，无法继续插入";
          cs["lineNo"] = 1;
          stateList.push(cs);
        }
        else { // not yet full, do the insertion
          var i = key % (HT.length), base = i;
          var i_next;
          var jump = 1;
          var step = 1;
          var k = 5, smallerPrime = primes[k]; // start from 17
          while (smallerPrime >= HT.length)
              smallerPrime = primes[k--];
          var secondary = smallerPrime - key % smallerPrime; // so it will always be positive
          var strategy = "线性探查法"

          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "哈希表未满<br>key = " + key + " ，其存储位置应为 " + key + "%" + HT.length + " = " + i + ".";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 2;
          stateList.push(cs);
          vertexTraversed[i] = true; // this is traversed in future iteration

          while (HT[i] > 0 && step < HT.length) {
            if (activeStatus == "LP") {
              jump = 1;
              strategy = "线性探查法"
            }
            else if (activeStatus == "QP") {
              jump = step;
              strategy = "二次探查法";
            }
            else if (activeStatus == "DH") {
              jump = secondary;
              strategy = "双重散列法";
            }

            i_next = (base + step * jump) % HT.length;

            var special = (HT[i] == key ? " (actually a duplicate key)" : "");
            cs = createState(vertexTraversed, edgeTraversed);
            cs["status"] = "HT[" + i + "] = " + HT[i] + " 已被占用" + special + "<br>通过" + strategy + "探查i.next = (" + base + "+" + step + "*" + jump + ")%" + HT.length + " = " + i_next + ".";
            cs["vl"][i_next]["state"] = VERTEX_HIGHLIGHTED;
            cs["lineNo"] = 3;
            stateList.push(cs);
            vertexTraversed[i_next] = true; // this is traversed in future iteration
            i = i_next;
            step++;
          }

          if (step == HT.length) {
            cs = createState(vertexTraversed, edgeTraversed);
            cs["status"] = "通过 " + step + " 次探查, 无法找到插入点.<br>插入失败...";
            stateList.push(cs);
          }
          else {
            HT[i] = key;
            N++;
            cs = createState(vertexTraversed, edgeTraversed);
            cs["status"] = "找到插入点: 将 " + key + " 插入HT[" + i + "].<br>现在哈希表中有 " + N + " 个元素。";
            cs["vl"][i]["state"] = VERTEX_TRAVERSED;
            cs["lineNo"] = 4;
            stateList.push(cs);
          }
        }
      }
    }

    graphWidget.startAnimation(stateList);
    populatePseudocode(1);

    return true;
  }

  this.remove = function(key) {
    var stateList = [];
    var vertexTraversed = {};
    var edgeTraversed = {};
    var cs;

    if (key < 0 || key > 99) {
      cs = createState(vertexTraversed, edgeTraversed);
      cs["status"] = "key = " + key + " 错误, 请输入0-99的整数。";
      stateList.push(cs);
    }
    else {
      var i = key % (HT.length), base = i;
      var i_next;
      var jump = 1;
      var step = 1;
      var k = 5, smallerPrime = primes[k]; // start from 17
      while (smallerPrime >= HT.length)
        smallerPrime = primes[k--];
      var secondary = smallerPrime - key % smallerPrime; // so it will always be positive
      var strategy = "线性探查法"

      cs = createState(vertexTraversed, edgeTraversed);
      cs["status"] = "key = " + key + " ，其存储位置应为 " + key + "%" + HT.length + " = " + i + ".";
      cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
      cs["lineNo"] = 1;
      stateList.push(cs);
      vertexTraversed[i] = true; // this is traversed in future iteration

      while (true) {
        if (HT[i] == EMPTY) { // Not Found
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] 为空<br>key = " + key + " 查找失败。";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 3;
          stateList.push(cs);
          break;
        }
        else if (HT[i] == key) { // Found
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] = " + key + "<br>查找key = " + key + " 成功，其存储位置为 " + i + "。";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 4;
          stateList.push(cs);

          HT[i] = DELETED;
          N--;
          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "将 HT[" + i + "] 标记为删除<br>现在哈希表中有 " + N + " 个元素。";
          cs["vl"][i]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 5;
          stateList.push(cs);
          break;
        }
        else {
          if (activeStatus == "LP") {
            jump = 1;
            strategy = "线性探查法"
          }
          else if (activeStatus == "QP") {
            jump = step;
            strategy = "二次探查法";
          }
          else if (activeStatus == "DH") {
            jump = secondary;
            strategy = "双重散列法";
          }

          i_next = (base + step * jump) % HT.length;

          cs = createState(vertexTraversed, edgeTraversed);
          cs["status"] = "HT[" + i + "] = " + HT[i] + " != key<br>通过" + strategy + "探查i.next = (" + base + "+" + step + "*" + jump + ")%" + HT.length + " = " + i_next + ".";
          cs["vl"][i_next]["state"] = VERTEX_HIGHLIGHTED;
          cs["lineNo"] = 6;
          stateList.push(cs);
          vertexTraversed[i_next] = true; // this is traversed in future iteration
          i = i_next;
          step++;
        }
      }
    }

    graphWidget.startAnimation(stateList);
    populatePseudocode(2);

    return true;
  }

  /*
   * vertexTraversed: JS object with the vertexes of the List which are to be marked as traversed as the key
   * edgeTraversed: JS object with the edges of the List which are to be marked as traversed as the key
   */

  function createState(vertexTraversed, edgeTraversed) {
    if (vertexTraversed == null || vertexTraversed == undefined || !(vertexTraversed instanceof Object))
      vertexTraversed = {};
    if (edgeTraversed == null || edgeTraversed == undefined || !(edgeTraversed instanceof Object))
      edgeTraversed = {};

    var scale = (900 - 100) / HT.length;

    var state = {
      "vl": {},
      "el": {}
    };

    for (var i = 0; i < HT.length; i++) {
      state["vl"][i] = {};
      state["vl"][i]["cx"] = 50 + i * scale;
      state["vl"][i]["cy"] = 100;
      state["vl"][i]["text"] = (HT[i] == EMPTY ? '' : (HT[i] == DELETED ? 'DEL' : HT[i]));
      state["vl"][i]["extratext"] = "i:" + i; // exist in newest GraphWidget
      state["vl"][i]["state"] = VERTEX_DEFAULT;
    }

    for (var key in vertexTraversed)
      state["vl"][key]["state"] = VERTEX_TRAVERSED;

    return state;
  }

  function populatePseudocode(act) {
    var jump = '1';
    if (activeStatus == "LP")
      jump = '1';
    else if (activeStatus == "QP")
      jump = 'step';
    else if (activeStatus == "DH")
      jump = 'sec';

    switch (act) {
      case 0: // search
        $('#code1').html('int i=key%HT.length//get hashed index;');
        $('#code2').html('while (true){');
        $('#code3').html('&nbsp&nbsp if(HT[i]==null){return "not found"}');
        $('#code4').html('&nbsp&nbspelse else if(HT[i]==key){return "found at index"+i}');
        $('#code5').html('&nbsp&nbspelse else {i = (i+step*1)%HT.length}');
        $('#code6').html('}');
        $('#code7').html('');
        break;
      case 1: // insert
        $('#code1').html('if(!HT.isFull){');
        $('#code2').html('int i = key%HT.length;// get hashed index');
        $('#code3').html('while(HT[i]!=null){');
        $('#code4').html('&nbsp;&nbsp;i = (key+step*1)%HT.length;');
        $('#code5').html('}');
        $('#code6').html('HT[i]=key;//insert key at HT[i]');
        $('#code7').html('}');
        break;
      case 2: // remove
        $('#code1').html('int i=key%HT.length//get hashed index;');
        $('#code2').html('while (true){');
        $('#code3').html('&nbsp&nbspif(HT[i]==null){return "key not found"}');
        $('#code4').html('&nbsp&nbsp  else if(HT[i]==key){');
        $('#code5').html('&nbsp&nbsp&nbsp&nbspHT[i]==null}');
        $('#code6').html('&nbsp&nbspelse {i = (i+step*x)%HT.length}/*x在线性探查为1，');
        $('#code7').html('二次探查为step，双重散列为sec,sec = prime - key%prime*/');
        break;
      }
  }
}



// HashTable_action.js
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

function hideEntireActionsPanel() {
  closeCreate();
  closeSearch();
  closeInsert();
  closeRemove();
  hideActionsPanel();
}



// local
$('#play').hide();
var hashtableWidget = new HashTable();
var gw = hashtableWidget.getGraphWidget();
hashtableWidget.setActiveStatus("LP");

$(function() {
  var hashMode = getQueryVariable("mode");
  if (hashMode.length > 0) {
    $('#title-'+hashMode).click();
  }
  var createHT = getQueryVariable("create");
  if (createHT.length > 0) {
    var newHT = createHT.split(",");
    if (newHT.length == 1)
      hashtableWidget.createTable(createHT);
    else
      hashtableWidget.generate(newHT);
  }
  var insert = getQueryVariable("insert");
  if (insert.length > 0) {
    $('#v-insert').val(insert);
    openInsert();
  }
  var remove = getQueryVariable("remove");
  if (remove.length > 0) {
    $('#v-remove').val(remove);
    openRemove();
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

});


// title changing
$('#title-LP').click(function() {
  if (isPlaying) stop();
  hideEntireActionsPanel();
  showActionsPanel();
  hideStatusPanel();
  hideCodetracePanel();
  hashtableWidget.setActiveStatus("LP");
});

$('#title-QP').click(function() {
  if (isPlaying) stop();
  hideEntireActionsPanel();
  showActionsPanel();
  hideStatusPanel();
  hideCodetracePanel();
  hashtableWidget.setActiveStatus("QP");
});

$('#title-DH').click(function() {
  if (isPlaying) stop();
  hideEntireActionsPanel();
  showActionsPanel();
  hideStatusPanel();
  hideCodetracePanel();
  hashtableWidget.setActiveStatus("DH");
});

function createTable() {
  if (isPlaying) stop();
  setTimeout(function() {
    var input = $('#v-create').val();
    input = parseInt(input);
    if ((mode == "exploration") && hashtableWidget.createTable(input)) {
      $('#progress-bar').slider("option", "max", 0);
      closeCreate();
      isPlaying = false;
    }
  }, 500)
  hideStatusPanel();
  hideCodetracePanel();
}

function insertInteger() {
  if (isPlaying) stop();
  setTimeout(function() {
    var input = $('#v-insert').val();
    if ((mode == "exploration") && hashtableWidget.insert(input)) {
      $('#current-action').show();
      $('#current-action p').html("Insert key = " + input);
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function searchInteger() {
  if (isPlaying) stop();
  setTimeout(function() {
    var input = $('#v-search').val();
    input = parseInt(input);
    if ((mode == "exploration") && hashtableWidget.search(input)) {
      $('#current-action').show();
      $('#current-action p').html("查找 key = " + input);
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500)
}

function removeInteger() {
  if (isPlaying) stop();
  setTimeout(function() {
    var input = $('#v-remove').val();
    input = parseInt(input);
    if ((mode == "exploration") && hashtableWidget.remove(input)) {
      $('#current-action').show();
      $('#current-action p').html("Remove key = " + input);
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
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
