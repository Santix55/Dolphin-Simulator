const pressedKeys = {};

document.addEventListener('keydown', function(event) {
  pressedKeys[event.key] = true;
});

document.addEventListener('keyup', function(event) {
  pressedKeys[event.key] = false;
});