var List_A, List_B;
var List_C;
var visiter_A, visiter_B;
var current_A, current_B;
var index_A = 0,
  index_B = 0;
var temp = 0;
function ListNode(value, extra) {
  this.value = value;
  this.next = undefined;
  this.extra = extra;
  this.update = (value) => {
    this.value = value;
    try {
      this.extra.item.innerText = value;
    } catch (error) {
      console.log(e);
    }
  };
}

function List(index) {
  this.index = index;
  this.value = new ListNode(undefined);
  this.end = undefined;
  this.length = 0;
  this.step = 100;

  this.generate = (length) => {
    const step = Math.min(
      (parseInt($("#container")[0].clientWidth) - 200) / (length + 1),
      100
    );
    this.step = step;

    let pointer = this.value;
    let temp = 0;
    while (length--) {
      let value;
      // if (length === 0) {
      //   value = Math.floor(Math.random() * 8) + 1;
      // } else {
      //   value = Math.floor(Math.random() * 9);
      // }
      temp = value = Math.round(Math.random() * 5) + temp;

      const elem = this.itemMaker(value, this.length, this.index, step);

      pointer.next = new ListNode(value, { item: elem, arrow: undefined });
      if (length > 0) {
        pointer.next.extra.arrow = this.arrowMaker(
          this.length,
          this.index,
          step
        );
      }
      pointer = pointer.next;
      this.end = pointer;
      this.length += 1;
    }
  };

  this.append = (value) => {
    if (this.end) {
      this.end.extra.arrow = this.arrowMaker(
        this.length - 1,
        this.index,
        this.step
      );
      this.end.next = new ListNode(
        value,
        this.itemMaker(value, this.length++, this.index, this.step)
      );
    } else {
      this.value.next = new ListNode(
        value,
        this.itemMaker(value, this.length++, this.index, this.step)
      );
      this.end = this.value.next;
    }
  };

  this.createVisit = () => {
    let pointer = this.value.next;

    return () => {
      let current = pointer;
      let index = 0;

      pointer = current ? current.next : undefined;
      return { elem: current, index: index++ };
    };
  };

  this.itemMaker = (value, x, y, step) => {
    const elem = document.createElement("div");
    elem.className = "circle";
    elem.style.left = `${x * step + 100}px`;
    elem.style.top = `${100 + y * 150}px`;
    elem.innerText = value;
    $("#container").append(elem);
    setTimeout(() => {
      elem.style.opacity = 1;
    }, 100);
    return elem;
  };

  this.arrowMaker = (x, y, step) => {
    const elem = document.createElement("div");
    elem.className = "arrow";
    elem.style.left = `${x * step + 100 + 30}px`;
    elem.style.width = `${step - 35}px`;
    elem.style.top = `${100 + y * 150 + 12.5}px`;
    $("#container").append(elem);

    setTimeout(() => {
      elem.style.opacity = 1;
    }, 100);
    return elem;
  };

  this.insert = (x, node) => {
    console.log(x, this.length);
    if (x === this.length) {
      let pointer = this.value;

      while (pointer.next !== undefined) pointer = pointer.next;
      pointer.next = node;

      pointer.extra.arrow = this.arrowMaker(x - 1, this.index, this.step);

      node.extra.item.style.left = `${x * this.step + 100}px`;
      node.extra.item.style.top = `${100 + this.index * 150}px`;

      node.next = undefined;
      this.length++;
      return;
    }

    let aim, pointer;
    aim = this.value;
    let loop = 0;
    while (loop++ < x) aim = aim.next;

    if (aim === undefined) {
      console.log("here");
    }

    pointer = aim.next;
    while (pointer !== undefined) {
      pointer.extra.item.style.left = `${
        parseFloat(pointer.extra.item.style.left) + this.step
      }px`;
      if (pointer.extra.arrow !== undefined) {
        pointer.extra.arrow.style.left = `${
          parseFloat(pointer.extra.arrow.style.left) + this.step
        }px`;
      }

      pointer = pointer.next;
    }

    if (aim.next !== undefined) {
      node.next = aim.next;
    }
    aim.next = node;

    node.extra.item.style.left = `${x * this.step + 100}px`;
    node.extra.item.style.top = `${100 + this.index * 150}px`;

    node.extra.arrow = this.arrowMaker(x, this.index, this.step);
    this.length++;
  };

  this.break = (x) => {
    let aim = this.value;
    let elem;
    let loop = 0;
    while (loop++ < x) aim = aim.next;
    elem = aim.next;

    if (elem === undefined) {
      return;
    }

    aim.next = aim.next.next;

    if (elem.next === undefined) {
      if (aim.extra !== undefined && aim.extra.arrow !== undefined)
        aim.extra.arrow.style.opacity = 0;
    }
    // if (aim.next.next === undefined) {
    //   aim.extra.arrow.style.opacity = 0;
    // }

    elem.extra.item.style.top = `${
      parseFloat(elem.extra.item.style.top) + 75
    }px`;

    if (elem.extra.arrow !== undefined) {
      elem.extra.arrow.style.opacity = 0;
      elem.extra.arrow = undefined;
    }

    aim = aim.next;
    while (aim !== undefined) {
      console.log(aim);
      aim.extra.item.style.left = `${
        parseFloat(aim.extra.item.style.left) - this.step
      }px`;
      if (aim.extra.arrow !== undefined) {
        aim.extra.arrow.style.left = `${
          parseFloat(aim.extra.arrow.style.left) - this.step
        }px`;
      }
      aim = aim.next;
    }

    elem.next = undefined;
    this.length--;
    return elem;
  };
}

function nodeInit() {
  $("#container").empty();
  // createTemp();
  List_A = new List(1);
  List_A.generate(Math.ceil(Math.random() * 5));
  // List_A.generate(Math.ceil(Math.random() * 7));

  List_B = new List(2);
  List_B.generate(Math.ceil(Math.random() * 5));
  index_B = index_A = 0;
  // List_A.generate(Math.ceil(1));

  // visiter_A = List_A.createVisit();
  // visiter_B = List_B.createVisit();

  current_A = List_A.value.next;
  current_B = List_B.value.next;
}

function createTemp() {
  const elem = document.createElement("div");
  elem.id = "temp";
  elem.innerText = "0";
  $("#container").append(elem);
}

function updateTemp(value) {
  temp = parseInt(value);
  $("#temp")[0].innerText = value;
}

function ligthNode(current) {
  if (current) {
    current.extra.item.style["border-color"] = "rgb(255,138,39)";
    current.extra.item.style["color"] = "rgb(255,138,39)";

    setTimeout(() => {
      console.log("here");
      current.extra.item.style["border-color"] = "rgb(0,0,0)";
      current.extra.item.style["color"] = "rgb(0,0,0)";
    }, DEFAULT_SPEED / 2);
  }
}

function resume() {
  if (
    CURRENT_STATUS == "ING" &&
    (current_A !== undefined || current_B !== undefined)
  ) {
    ligthNode(current_A);
    ligthNode(current_B);
    if (current_A === undefined) {
      current_B = current_B.next;
      index_B++;
    } else if (current_B === undefined) {
      current_A = current_A.next;
      const elem = List_A.break(index_A);

      console.log(elem, current_A);
      List_B.insert(index_B, elem);
      index_B++;
      current_B = elem.next;
    } else if (current_A.value <= current_B.value) {
      current_A = current_A.next;
      let elem = List_A.break(index_A);

      List_B.insert(index_B++, elem);
    } else if (current_B.value < current_A.value) {
      current_B = current_B.next;
      index_B++;
    }

    // current_A = visiter_A();
    // current_B = visiter_B();
    // console.log(
    //   current_A ? current_A.value : 0,
    //   current_B ? current_B.value : 0,
    //   temp
    // );
    // const sum =
    //   (current_A ? current_A.value : 0) +
    //   (current_B ? current_B.value : 0) +
    //   temp;
    // updateTemp(sum / 10 >= 1 ? Math.floor(sum / 10) : 0);

    // // if (sum > 0) List_C.append(parseInt(sum % 10));
    // if (sum > 0) {
    //   if (current_B) {
    //     current_B.update(parseInt(sum % 10));
    //   } else {
    //     List_B.append(parseInt(sum % 10));
    //     // current_B
    //   }
    // }

    // current_B.value = parseInt(sum % 10);
    if (current_A === undefined && current_B === undefined) {
      // 结束了
      _setBtn("重新开始");
      CURRENT_STATUS = "STOP";
      window.setTimeout(stop, 300);
    } else {
      window.setTimeout(resume, DEFAULT_SPEED);
    }
  }
}
