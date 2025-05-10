window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;

  let nextScene = false;
  let sceneNum = Number(localStorage.getItem("scene") || "1");
  console.log("sceneNum:", sceneNum);

  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && !this.keys.includes(e.key)) this.keys.push(e.key);
      });
      window.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp') this.keys.splice(this.keys.indexOf(e.key), 1);
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 128;
      this.height = 126;
      this.frameX = 1;
      this.maxFrame = 3;
      this.frameY = 0;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 0;

      if (sceneNum === 1) {
        this.x = 150;
        this.y = this.gameHeight - this.height;
        this.image = document.getElementById('playerImage');
      } else if (sceneNum === 2) {
        this.x = 500;
        this.y = 520;
        this.image = document.getElementById('playerImage2');
      } else if (sceneNum === 3) {
        this.x = 150;
        this.y = 400;
        this.image = document.getElementById('playerImage');
      }
    }

    draw(context) {
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
        this.width, this.height, this.x, this.y, this.width, this.height);
    }

    update(input, deltaTime, door) {
      const dx = door.x - this.x;
      const dy = door.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance + 24 < door.width / 2 + this.width / 2) nextScene = true;

      if (input.keys.includes('ArrowUp')) {
        this.speed = 5;
        if (this.frameTimer > this.frameInterval) {
          this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
          this.frameTimer = 0;
        } else {
          this.frameTimer += deltaTime;
        }
      } else {
        this.speed = 0;
      }

      if (sceneNum === 1) this.x += this.speed;
      else if (sceneNum === 2) {
        this.x -= this.speed;
        this.y -= this.speed / 3;
      } else if (sceneNum === 3) {
        this.x += this.speed;
        this.y -= this.speed / 3;
      }

      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById('backgroundImage');
      this.x = -600;
      this.y = -100;
      this.width = 1920;
      this.height = 1080;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  class Door {
    constructor(gameWidth, gameHeight, x, y) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 128;
      this.height = 120;
      this.image = document.getElementById('doorImage');
      this.x = x;
      this.y = y;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  function displayStatusText(context) {
    const text = '위쪽 화살표를 눌러 이동하세요.';
    context.font = 'bold 30px Helvetica';
    context.strokeStyle = 'white';
    context.lineWidth = 4;
    context.strokeText(text, 20, 50);
    context.fillStyle = 'black';
    context.fillText(text, 20, 50);
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);
  const door1 = new Door(canvas.width, canvas.height, 530, 600);
  const door2 = new Door(canvas.width, canvas.height, 145, 410);
  const door3 = new Door(canvas.width, canvas.height, 530, 250);

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    door1.draw(ctx);
    door2.draw(ctx);
    door3.draw(ctx);
    player.draw(ctx);

    if (sceneNum === 1) player.update(input, deltaTime, door1);
    else if (sceneNum === 2) player.update(input, deltaTime, door2);
    else if (sceneNum === 3) player.update(input, deltaTime, door3);

    displayStatusText(ctx);

    if (nextScene) {
      if (sceneNum === 1) window.location.href = 'week1-video.html';
      else if (sceneNum === 2) window.location.href = 'op.html'; // ✅ 바로 op.html로 이동
      else if (sceneNum === 3) window.location.href = 'week3-video.html';
    } else {
      requestAnimationFrame(animate);
    }
  }
  animate(0);
});
