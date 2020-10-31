var op, value;

const numberTable = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const opTable = { "#": 0, "+": 1, "-": 1, "*": 2, "/": 2, "(": 0, ")": 0 };

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
    $("#container").append(elem);

    this.items.push(elem);
    this.length = this.items.length;
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
  value = new Stack("value");
}

function calc(a, op, b) {
  a = parseInt(a);
  b = parseInt(b);
  return eval(`${a}${op}${b}`);
}

function itemDisplay(value) {
  const item = document.createElement("div");
  item.innerText = value;
  item.className = "stack-item";
  item.style.left = "calc(10% + 25px)";
  item.style.top = "25px";
  $("#container").append(item);
  setTimeout(() => {
    item.style.opacity = 0;
  }, DEFAULT_SPEED / 4);
}

function resume() {
  if (CURRENT_STATUS == "ING") {
    if (expression.length > 0) {
      const current = expression.shift();

      if (numberTable.indexOf(current) >= 0) {
        value.push(current);
      } else if (Object.keys(opTable).indexOf(current) >= 0) {
        itemDisplay(current);
        const a = value.pop();
        const b = value.pop();
        setTimeout(() => {
          value.push(calc(b, current, a));
        }, 500);
      }
    }

    if (expression.length === 0) {
      // 结束了
      _setBtn("重新开始");
      CURRENT_STATUS = "STOP";
      window.setTimeout(stop, 300);
    } else {
      window.setTimeout(resume, DEFAULT_SPEED);
    }
  }
}
