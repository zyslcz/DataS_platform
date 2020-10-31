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

function toRPN(expression) {
  const s1 = [],
    s2 = [];
  const op = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "(": 0,
    ")": 0,
  };
  while (expression.length > 0) {
    const token = expression.shift();
    // 2*(2+3)+1
    console.log(token, JSON.stringify(s1), JSON.stringify(s2));
    if (Object.keys(op).indexOf(token) >= 0) {
      //
      if (s1.length === 0 || token === "(") {
        s1.push(token);
      } else if (token === ")") {
        // 则将距离S1栈栈顶最近的“（”之间的运算符，逐个出栈，依次送入S2栈，此时抛弃“（”。
        while (true) {
          const current = s1.pop();
          if (current === "(") {
            break;
          } else {
            s2.push(current);
          }
        }
        // 将该运算符与S1栈栈顶元素比较，
        // 如果该运算符优先级(不包括括号运算符)大于S1栈栈顶运算符优先级，
        //   则将该运算符进S1栈，
        // 否则，
        //   将S1栈的栈顶运算符弹出，送入S2栈中
      } else if (s1[s1.length - 1] === "(") {
        s1.push(token);
      } else if (op[token] > op[s1[s1.length - 1]]) {
        s1.push(token);
      } else {
        // 否则情况
        const current = s1.pop();
        s2.push(current);
        expression = [token, ...expression];
      }
    } else {
      s2.push(token);
    }
  }

  return [...s2, ...s1.reverse()];
}
