$("#speed-up").click(function () {
  if (DEFAULT_SPEED <= 300) {
    alert("已达到最快速度");
  } else {
    DEFAULT_SPEED -= 100;
  }
});

$("#speed-down").click(function () {
  DEFAULT_SPEED += 100;
});

$("#speed-default").click(function () {
  DEFAULT_SPEED = 800;
});

$(".speed, .click")
  .mousedown(function () {
    $(this).css("background-color", "rgb(201, 49, 85)");
  })
  .mouseup(function () {
    $(this).css("background-color", "rgb(214, 87, 117)");
  });

$("#code")
  .mouseover(function () {
    $(this).css("color", "#FFFFFF");
  })
  .mouseleave(function () {
    $(this).css("color", "#000000");
  });
