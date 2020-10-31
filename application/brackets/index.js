var op, value;

const leftBrackets = ["(", "[", "{"];
const rightBrackets = [")", "]", "}"];

const isLeft = (item) => leftBrackets.indexOf(item) >= 0;
const isRight = (item) => rightBrackets.indexOf(item) >= 0;
const match = (left, right) => {
  console.log(left, right);
  let leftPos = leftBrackets.indexOf(left);
  let rightPos = rightBrackets.indexOf(right);
  return leftPos === rightPos;
};

const appear = (value) => {
  let elem = document.querySelector("#current-one");
  if (elem === null) {
    elem = document.createElement("div");
    elem.className = "stack-item";
    elem.id = "current-one";
    elem.innerText = value;

    $("#container").append(elem);
  } else {
    elem.innerText = value;
  }
};

function Stack(type = "value") {
  this.value = [];
  this.items = [];
  this.length = 0;
  this.top = "#";

  const elem = document.createElement("div");
  elem.className = "stack";
  if (type === "value") {
    elem.style.top = "100px";
  } else if (type === "op") {
    elem.style.top = "300px";
  }
  $("#container").append(elem);
  this.elem = elem;

  this.push = (item) => {
    this.value.push(item);
    const elem = document.createElement("div");
    elem.className = "stack-item";
    elem.innerText = item;
    this.items.push(elem);
    this.length = this.items.length;
    console.log(this.value, item);
    $("#container").append(elem);
    this.top = item;
    setTimeout(() => {
      elem.style.left = `calc(10% + ${25 + (this.value.length - 1) * 75}px)`;
      elem.style.top = `${parseInt(this.elem.style.top) + 25}px`;
    });
  };

  this.pop = () => {
    const value = this.value.pop();
    const elem = this.items.pop();
    this.length = this.value.length;
    if (this.length === 0) {
      this.top = "#";
    } else {
      this.top = this.value[this.length - 1];
    }
    elem.style.top = `${parseInt(elem.style.top) + 100}px`;
    setTimeout(() => (elem.style.opacity = "0"), 200);
    return [value, elem];
  };
}

function layoutInit() {
  op = new Stack("op");
}

function resume() {
  if (CURRENT_STATUS == "ING" && expression.length > 0) {
    const current = expression.shift();
    appear(current);
    let endflag = false;
    if (isLeft(current)) {
      op.push(current);
    } else if (isRight(current)) {
      if (match(op.value[op.length - 1], current)) {
        op.pop();
      } else {
        endflag = true;
      }
    }

    if ((expression.length === 0 && op.length === 0) || endflag === true) {
      // 结束了
      _setBtn("重新开始");
      CURRENT_STATUS = "STOP";
      window.setTimeout(stop, 300);
    } else {
      window.setTimeout(resume, DEFAULT_SPEED);
    }
  }
}
