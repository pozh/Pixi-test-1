import * as PIXI from "pixi.js-legacy";
import Game from './components/Game';

// Settings
const type = PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas";
PIXI.utils.sayHello(type);

const game = new Game(180, 125, 13, 11);
const app = new PIXI.Application({
  width: 1024,
  height: 768
});
const loader = app.loader;
document.body.appendChild(app.view);
app.renderer.view.id = "game";
app.renderer.view.style.display = "block";
app.renderer.backgroundColor = 0x2B3056;
loader.load(setup);

function setup() {
  const bg = new PIXI.Sprite.from("./assets/images/bg2b.jpg");
  app.stage.addChild(bg);
  game.setup();
  app.stage.addChild(game);
  game.start();
}
