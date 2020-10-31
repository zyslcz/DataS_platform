const floorHeight = 100;
const circleRadius = 12.5;

var pointer;
var pre = undefined;
var before = [];
var LINK = 1;
var CHILD = 0;
const delay = (time) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });

const createNullElement = () => {
  const nullElement = document.createElement("div");
  nullElement.classList = "circle";
  nullElement.style.left = `${document.body.clientWidth / 2 - 25}px`;
  nullElement.style.top = "100px";
  nullElement.style.width = "50px";
  nullElement.style.height = "50px";
  nullElement.style.lineHeight = "50px";
  nullElement.innerText = "NA";
  $("#container").append(nullElement);
};

class Tree {
  constructor([value, left, right], x, y, step) {
    this.node = new _TreeNode(value);
    this.value = value;
    this.lines = [];
    this.left = null;
    this.right = null;
    this.node.append(x, y, step);
    if (left !== null && left !== undefined) {
      this.node.addLine(x - 0.5 * step, y + 1);
      this.left = new Tree(left, x - 0.5 * step, y + 1, step / 2);
    }
    if (right !== null && right !== undefined) {
      this.node.addLine(x + 0.5 * step, y + 1);
      this.right = new Tree(right, x + 0.5 * step, y + 1, step / 2);
    }
  }

  append(x, y, step) {
    this.node.append(x, y);
    if (this.left !== null) {
      this.left.append(x - 0.5 * step, y + 1, step / 2);
    }
    if (this.right !== null) {
      this.right.append(x + 0.5 * step, y + 1, step / 2);
    }
  }
  move(y) {
    this.node.move(y);
    if (this.left !== null) {
      this.left.move(y);
    }
    if (this.right !== null) {
      this.right.move(y);
    }
  }

  async inThreading() {
    if (CURRENT_STATUS == "ING") {
      if (this.left !== null) {
        await this.left.inThreading();
      } else {
        // 线索
        await delay(DEFAULT_SPEED);
      }

      if (pre !== undefined && pre.right === null) {
        await delay(DEFAULT_SPEED);
      }

      pre = this;

      if (this.right !== null) {
        await this.right.inThreading();
      }
    }
  }
}

class _TreeNode {
  constructor(data) {
    this.data = data;
    this.lines = [];
    this.type = -1;
    const elem = document.createElement("div");
    elem.id = `c-${data}`;
    elem.className = "circle";
    elem.innerHTML = data;
    this.elem = elem;
  }

  append(x, y) {
    this.x = x;
    this.y = y;
    this.elem.style.left = `${x}px`;
    this.elem.style.top = `${y * floorHeight}px`;
    $("#container").append(this.elem);
  }

  addLine(x, y, className = "line") {
    const elem = document.createElement("div");
    elem.className = className;
    console.log(this.x, this.y);
    elem.style.left = `${this.x + circleRadius}px`;
    elem.style.top = `${this.y * floorHeight + circleRadius}px`;
    elem.style.width = `${Math.sqrt(
      Math.pow(this.x - x, 2) + Math.pow((this.y - y) * floorHeight, 2)
    )}px`;
    const deg =
      (this.x - x < 0 ? 0 : Math.PI) +
      Math.atan(((this.y - y) * 100) / (this.x - x));

    console.log(`rotate(${deg}rad})`);
    elem.style.transform = `rotate(${deg}rad)`;
    this.lines.push(elem);
    $("#container").append(elem);
  }

  move(y) {
    this.elem.style.left = `${parseFloat(this.elem.style.left) + y}px`;
    this.lines.forEach((line) => {
      line.style.left = `${parseFloat(line.style.left) + y}px`;
    });
  }
}
