function Node(data, id) {
  this.moveTo = (left, top, step) => {
    this.elem.style.left = `${left}px`;
    this.elem.style.top = `${top * 100}px`;
    if (this.left !== null) {
      this.left.moveTo(left - 0.5 * step * 0.8, top + 1, step * 0.5);
      this.pointTo("left", left - 0.5 * step * 0.8, top + 1);
    }
    if (this.right !== null) {
      this.right.moveTo(left + 0.5 * step * 0.8, top + 1, step * 0.5);
      this.pointTo("right", left + 0.5 * step * 0.8, top + 1);
    }
    if (this.leftLine !== null) {
      this.leftLine.style.top = `${top * 100 + 12.5}px`;
      this.leftLine.style.left = `${left + 12.5}px`;
    }
    if (this.rightLine !== null) {
      this.rightLine.style.top = `${top * 100 + 12.5}px`;
      this.rightLine.style.left = `${left + 12.5}px`;
    }
  };
  this.pointTo = (type, left, top) => {
    const width = Math.sqrt(
      Math.pow(left - parseFloat(this.elem.style.left), 2) + Math.pow(100, 2)
    );
    let deg = Math.atan(100 / (left - parseFloat(this.elem.style.left)));
    if (type === "left") {
      deg += Math.PI;
    }
    console.log(deg, left - parseFloat(this.elem.style.left));
    this[`${type}Line`].style.width = `${width}px`;
    this[`${type}Line`].style[`transform`] = `rotate(${deg}rad)`;
    // this[`${type}Line`].style["-ms-transform"] = `rotate(-${deg}rad)`;
    // this[`${type}Line`].style["-moz-transform"] = `rotate(-${deg}rad)`;
    // this[`${type}Line`].style["-webkit-transform"] = `rotate(-${deg}rad)`;
    // this[`${type}Line`].style["-o-transform"] = `rotate(-${deg}rad)`;
  };
  this.addLeft = (left) => {
    this.left = left;
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = this.elem.style.left;
    line.style.top = this.elem.style.top;
    this.leftLine = line;
    $("#container").append(line);
  };
  this.addRight = (right) => {
    this.right = right;
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = this.elem.style.left;
    line.style.top = this.elem.style.top;
    this.rightLine = line;
    $("#container").append(line);
  };
  if (data instanceof Node) {
    this.data = data.data;
    this.left = data.left;
    this.right = data.right;
    this.leftLine = data.leftLine;
    this.rightLine = data.rightLine;
  } else {
    const elem = document.createElement("div");
    elem.className = "circle";
    elem.innerText = data;
    elem.style.top = "100px";
    elem.style.left = "150px";
    $("#container").append(elem);
    this.data = data;
    this.id = id;
    this.left = null;
    this.right = null;
    this.elem = elem;
    this.leftLine = null;
    this.rightLine = null;
  }
}

function nodeInit() {
  $("#container").empty();
  nodes = Array(8)
    .fill(0)
    .map((item) => Math.round(Math.random() * 9 + 1))
    .sort((a, b) => a - b)
    .map((item, index) => new Node(item, index));
  const clientWidth = $("#container")[0].clientWidth;

  const begin = clientWidth / (nodes.length + 1);

  const step = clientWidth / (nodes.length + 1);
  nodes.forEach((item, index) => {
    item.elem.style.background = "#333";
    item.elem.style.color = "#fff";
    item.moveTo(begin + step * index, 1, step);
  });
  // $("#container").append(nodes.map((item) => item.elem));
}

function resume() {
  if (CURRENT_STATUS == "ING" && nodes.length > 1) {
    // CURRENT_STEP += 1;
    // step(CURRENT_STEP);
    nodes.sort(function (a, b) {
      return a.data - b.data;
    });
    const left = nodes.shift();
    const right = nodes.shift();
    console.log(left);
    /*构造结点*/
    const root = new Node(left.data + right.data);
    root.addLeft(left);
    root.addRight(right);
    nodes.unshift(root);

    const clientWidth = $("#container")[0].clientWidth;
    const begin = clientWidth / (nodes.length + 1);
    const step = clientWidth / (nodes.length + 1);

    nodes.forEach((item, index) => {
      item.moveTo(begin + step * index, 1, step);
    });

    if (nodes.length === 1) {
      // 结束了
      _setBtn("重新开始");
      CURRENT_STATUS = "STOP";
      window.setTimeout(stop, 300);
    } else {
      window.setTimeout(resume, DEFAULT_SPEED);
    }
  }
}
