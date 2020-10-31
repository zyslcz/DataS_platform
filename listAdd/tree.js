function lightCircle(char) {
  _highLight(getCircle(char));
}

function doneCircle(char) {
  _done(getCircle(char));
}

function deLightCircle(char) {
  _deLight(getCircle(char));
}

function lightLine(char) {
  _highLight(getLine(char));
}

function deLightLine(char) {
  _deLight(getLine(char));
}

function getCircle(char) {
  return $("#c-" + char.toLowerCase());
}

function getLine(char) {
  return $("#l-" + char.toLowerCase());
}

function _highLight(object) {
  if (object.hasClass("circle")) {
    object
      .css("border-color", "rgb(255, 138, 39)")
      .css("background-color", "#FFFFFFFF")
      .css("color", "rgb(255, 138, 39)");
  } else {
    object.css("background-color", "rgb(255, 138, 39)");
  }
}

function _done(object) {
  if (object.hasClass("circle")) {
    object
      .css("border-color", "rgb(255, 138, 39)")
      .css("background-color", "rgb(255, 138, 39)")
      .css("color", "#FFFFFF");
  }
}

function _deLight(object) {
  if (object.hasClass("circle")) {
    object
      .css("border-color", "#000000")
      .css("background-color", "rgba(0,0,0,0)")
      .css("color", "#000000");
  } else {
    object.css("background-color", "#000000");
  }
}

function setText(str) {
  $("#info-p").html(str);
}

function setCode(line) {
  __heightLightCode(line);
}

function __heightLightCode(line) {
  $("#code-" + line)
    .css("background-color", "#000000")
    .css("color", "#FFFFFF")
    .siblings()
    .css("background-color", "rgb(217, 81, 60)")
    .css("color", "#000000");
}

function _setBtn(str) {
  $("#start-p").html(str);
}

function addResult(char) {
  $("#result-container").append(
    '<div id="cr-' + char + '" class="circle circle-r">' + char + "</div>"
  );
}
