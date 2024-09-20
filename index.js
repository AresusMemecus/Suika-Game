// const Matter = require('matter-js');

function mulberry32(a) {
	return function() {
		let t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}

const rand = mulberry32(Date.now());

const {
	Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse,
	Composite, Bodies, Events,
} = Matter;

const wallPad = 64;
const loseHeight = 84;
const statusBarHeight = 48;
const previewBallHeight = 32;
const friction = {
	friction: 0.006,
	frictionStatic: 0.006,
	frictionAir: 0,
	restitution: 0.1
};

const GameStates = {
	MENU: 0,
	READY: 1,
	DROP: 2,
	LOSE: 3,
};



			//Game



const Game = {
	width: 640,
	height: 960,
	elements: {
		canvas: document.getElementById('game-canvas'),
		ui: document.getElementById('game-ui'),
		score: document.getElementById('game-score'),
		end: document.getElementById('game-end-container'),
		endTitle: document.getElementById('game-end-title'),
		statusValue: document.getElementById('game-highscore-value'),
		nextFruitImg: document.getElementById('game-next-fruit'),
		previewBall: null,
	},
	cache: { highscore: 0 },
	sounds: {
		click: new Audio('./assets/click.mp3'),
		pop0: new Audio('./assets/pop0.mp3'),
		pop1: new Audio('./assets/pop1.mp3'),
		pop2: new Audio('./assets/pop2.mp3'),
		pop3: new Audio('./assets/pop3.mp3'),
		pop4: new Audio('./assets/pop4.mp3'),
		pop5: new Audio('./assets/pop5.mp3'),
		pop6: new Audio('./assets/pop6.mp3'),
		pop7: new Audio('./assets/pop7.mp3'),
		pop8: new Audio('./assets/pop8.mp3'),
		pop9: new Audio('./assets/pop9.mp3'),
		pop10: new Audio('./assets/pop10.mp3'),
	},
	

	stateIndex: GameStates.MENU,

	score: 0,
	fruitsMerged: [],
	calculateScore: function () {
		const score = Game.fruitsMerged.reduce((total, count, sizeIndex) => {
			const value = Game.fruitSizes[sizeIndex].scoreValue * count;
			return total + value;
		}, 0);

		Game.score = score;
		Game.elements.score.innerText = Game.score;
	},

	fruitSizes: [
		{ radius: 24,  scoreValue: 1,  img: './assets/img/circle0.png'  },
		{ radius: 32,  scoreValue: 3,  img: './assets/img/circle1.png'  },
		{ radius: 40,  scoreValue: 6,  img: './assets/img/circle2.png'  },
		{ radius: 56,  scoreValue: 10, img: './assets/img/circle3.png'  },
		{ radius: 64,  scoreValue: 15, img: './assets/img/circle4.png'  },
		{ radius: 72,  scoreValue: 21, img: './assets/img/circle5.png'  },
		{ radius: 84,  scoreValue: 28, img: './assets/img/circle6.png'  },
		{ radius: 96,  scoreValue: 36, img: './assets/img/circle7.png'  },
		{ radius: 128, scoreValue: 45, img: './assets/img/circle8.png'  },
		{ radius: 160, scoreValue: 55, img: './assets/img/circle9.png'  },
		{ radius: 192, scoreValue: 66, img: './assets/img/circle10.png' },
	],
	currentFruitSize: 0,
	nextFruitSize: 0,
	setNextFruitSize: function () {
		Game.nextFruitSize = Math.floor(rand() * 5);
		Game.elements.nextFruitImg.src = `./assets/img/circle${Game.nextFruitSize}.png`;
	},

	showHighscore: function () {
		Game.elements.statusValue.innerText = Game.cache.highscore;
	},
	loadHighscore: function () {
		const gameCache = localStorage.getItem('suika-game-cache');
		if (gameCache === null) {
			Game.saveHighscore();
			return;
		}

		Game.cache = JSON.parse(gameCache);
		Game.showHighscore();
	},
	saveHighscore: function () {
		Game.calculateScore();
		if (Game.score < Game.cache.highscore) return;

		Game.cache.highscore = Game.score;
		Game.showHighscore();
		Game.elements.endTitle.innerText = 'New Highscore!';

		localStorage.setItem('suika-game-cache', JSON.stringify(Game.cache));
	},

	initGame: function () {
		Render.run(render);
		Runner.run(runner, engine);

		Composite.add(engine.world, menuStatics);

		Game.loadHighscore();
		Game.elements.ui.style.display = 'none';
		Game.fruitsMerged = Array.apply(null, Array(Game.fruitSizes.length)).map(() => 0);

		const menuMouseDown = function () {
			if (mouseConstraint.body === null || mouseConstraint.body?.label !== 'btn-start') {
				return;
			}

			Events.off(mouseConstraint, 'mousedown', menuMouseDown);
			Game.startGame();
		}

		Events.on(mouseConstraint, 'mousedown', menuMouseDown);
	},
	startGame: function () {
		Game.sounds.click.play();

		Composite.remove(engine.world, menuStatics);
		Composite.add(engine.world, gameStatics);

		Game.calculateScore();
		Game.elements.endTitle.innerText = 'Game Over!';
		Game.elements.ui.style.display = 'block';
		Game.elements.end.style.display = 'none';
		Game.elements.previewBall = Game.generateFruitBody(Game.width / 2, previewBallHeight, 0, { isStatic: true });
		Composite.add(engine.world, Game.elements.previewBall);

		setTimeout(() => {
			Game.stateIndex = GameStates.READY;
		}, 250);

		Events.on(mouseConstraint, 'mouseup', function (e) {
			Game.addFruit(e.mouse.position.x);
		});

		Events.on(mouseConstraint, 'mousemove', function (e) {
			if (Game.stateIndex !== GameStates.READY) return;
			if (Game.elements.previewBall === null) return;

			Game.elements.previewBall.position.x = e.mouse.position.x;
		});

		Events.on(engine, 'collisionStart', function (e) {
			for (let i = 0; i < e.pairs.length; i++) {
				const { bodyA, bodyB } = e.pairs[i];

				// Skip if collision is wall
				if (bodyA.isStatic || bodyB.isStatic) continue;

				const aY = bodyA.position.y + bodyA.circleRadius;
				const bY = bodyB.position.y + bodyB.circleRadius;

				// Uh oh, too high!
				if (aY < loseHeight || bY < loseHeight) {
					Game.loseGame();
					return;
				}

				// Skip different sizes
				if (bodyA.sizeIndex !== bodyB.sizeIndex) continue;

				// Skip if already popped
				if (bodyA.popped || bodyB.popped) continue;

				let newSize = bodyA.sizeIndex + 1;

				// Go back to smallest size
				if (bodyA.circleRadius >= Game.fruitSizes[Game.fruitSizes.length - 1].radius) {
					newSize = 0;
				}

				Game.fruitsMerged[bodyA.sizeIndex] += 1;

				// Therefore, circles are same size, so merge them.
				const midPosX = (bodyA.position.x + bodyB.position.x) / 2;
				const midPosY = (bodyA.position.y + bodyB.position.y) / 2;

				bodyA.popped = true;
				bodyB.popped = true;

				Game.sounds[`pop${bodyA.sizeIndex}`].play();
				Composite.remove(engine.world, [bodyA, bodyB]);
				Composite.add(engine.world, Game.generateFruitBody(midPosX, midPosY, newSize));
				Game.addPop(midPosX, midPosY, bodyA.circleRadius);
				Game.calculateScore();
			}
		});
	},

	addPop: function (x, y, r) {
		const circle = Bodies.circle(x, y, r, {
			isStatic: true,
			collisionFilter: { mask: 0x0040 },
			angle: rand() * (Math.PI * 2),
			render: {
				sprite: {
					texture: './assets/img/pop.png',
					xScale: r / 384,
					yScale: r / 384,
				}
			},
		});

		Composite.add(engine.world, circle);
		setTimeout(() => {
			Composite.remove(engine.world, circle);
		}, 100);
	},

	loseGame: function () {
		Game.stateIndex = GameStates.LOSE;
		Game.elements.end.style.display = 'flex';
		runner.enabled = false;
		Game.saveHighscore();
	},

	// Returns an index, or null
	lookupFruitIndex: function (radius) {
		const sizeIndex = Game.fruitSizes.findIndex(size => size.radius == radius);
		if (sizeIndex === undefined) return null;
		if (sizeIndex === Game.fruitSizes.length - 1) return null;

		return sizeIndex;
	},

	generateFruitBody: function (x, y, sizeIndex, extraConfig = {}) {
		const size = Game.fruitSizes[sizeIndex];
		const circle = Bodies.circle(x, y, size.radius, {
			...friction,
			...extraConfig,
			render: { sprite: { texture: size.img, xScale: size.radius / 512, yScale: size.radius / 512 } },
		});
		circle.sizeIndex = sizeIndex;
		circle.popped = false;

		return circle;
	},

	addFruit: function (x) {
		if (Game.stateIndex !== GameStates.READY) return;
		
		Game.sounds.click.play();

		Game.stateIndex = GameStates.DROP;
		const latestFruit = Game.generateFruitBody(x, previewBallHeight, Game.currentFruitSize);
		Composite.add(engine.world, latestFruit);

		Game.currentFruitSize = Game.nextFruitSize;
		Game.setNextFruitSize();
		Game.calculateScore();

		Composite.remove(engine.world, Game.elements.previewBall);
		Game.elements.previewBall = Game.generateFruitBody(render.mouse.position.x, previewBallHeight, Game.currentFruitSize, {
			isStatic: true,
			collisionFilter: { mask: 0x0040 }
		});

		setTimeout(() => {
			if (Game.stateIndex === GameStates.DROP) {
				Composite.add(engine.world, Game.elements.previewBall);
				Game.stateIndex = GameStates.READY;
			}
		}, 500);
	}
}

const engine = Engine.create();
const runner = Runner.create();
const render = Render.create({
	element: Game.elements.canvas,
	engine,
	options: {
		width: Game.width,
		height: Game.height,
		wireframes: false,
		background: '#0e0e10'
	}
});



			//



const menuStatics = [
	Bodies.rectangle(Game.width / 2, Game.height * 0.4, 512, 512, {
		isStatic: true,
		render: { sprite: { texture: './assets/img/bg-menu.png' } },
	}),

	// Add each fruit in a circle
	...Array.apply(null, Array(Game.fruitSizes.length)).map((_, index) => {
		const x = (Game.width / 2) + 192 * Math.cos((Math.PI * 2 * index)/12);
		const y = (Game.height * 0.4) + 192 * Math.sin((Math.PI * 2 * index)/12);
		const r = 64;

		return Bodies.circle(x, y, r, {
			isStatic: true,
			render: {
				sprite: {
					texture: `./assets/img/circle${index}.png`,
					xScale: r / 1024,
					yScale: r / 1024,
				},
			},
		});
	}),

	Bodies.rectangle(Game.width / 2, Game.height * 0.75, 512, 96, {
		isStatic: true,
		label: 'btn-start',
		render: { sprite: { texture: './assets/img/btn-start.png' } },
	}),
];

const wallProps = {
	isStatic: true,
	render: { fillStyle: '#70eeff' },
	...friction,
};

const gameStatics = [
	// Left
	Bodies.rectangle(-(wallPad / 2), Game.height / 2, wallPad, Game.height, wallProps),

	// Right
	Bodies.rectangle(Game.width + (wallPad / 2), Game.height / 2, wallPad, Game.height, wallProps),

	// Bottom
	Bodies.rectangle(Game.width / 2, Game.height + (wallPad / 2) - statusBarHeight, Game.width, wallPad, wallProps),
];

// add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: false,
		},
	},
});
render.mouse = mouse;



Game.initGame();



			//Resize



const resizeCanvas = () => {
	const screenWidth = document.body.clientWidth;
	const screenHeight = document.body.clientHeight;

	let newWidth = Game.width;
	let newHeight = Game.height;
	let scaleUI = 1;

	if (screenWidth * 1.5 > screenHeight) {
		newHeight = Math.min(Game.height, screenHeight);
		newWidth = newHeight / 1.5;
		scaleUI = newHeight / Game.height;
	} else {
		newWidth = Math.min(Game.width, screenWidth);
		newHeight = newWidth * 1.5;
		scaleUI = newWidth / Game.width;
	}

	render.canvas.style.width = `${newWidth}px`;
	render.canvas.style.height = `${newHeight}px`;

	Game.elements.ui.style.width = `${Game.width}px`;
	Game.elements.ui.style.height = `${Game.height}px`;
	Game.elements.ui.style.transform = `scale(${scaleUI})`;
};

document.body.onload = resizeCanvas;
document.body.onresize = resizeCanvas;



			//Valume



document.addEventListener("DOMContentLoaded", () => {
  const range = document.querySelector(".volume input[type=range]");

  const barHoverBox = document.querySelector(".volume .bar-hoverbox");
  const fill = document.querySelector(".volume .bar .bar-fill");
  
  range.addEventListener("change", (e) => {
    console.log("value", e.target.value);
  });
  
  const setValue = (value) => {
    fill.style.width = value + "%";
    range.setAttribute("value", value)
    range.dispatchEvent(new Event("change"))
  }
  
  // Дефолт
  setValue(range.value);
  
  const calculateFill = (e) => {
    // Отнимаем ширину двух 15-пиксельных паддингов из css
    let offsetX = e.offsetX
    
    if (e.type === "touchmove") {
      offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft
    }
    
    const width = e.target.offsetWidth - 30;

    setValue(
      Math.max(
        Math.min(
          // Отнимаем левый паддинг
          (offsetX - 15) / width * 100.0,
          100.0
        ),
        0
      )
    );
  }
  
  let barStillDown = false;

  barHoverBox.addEventListener("touchstart", (e) => {
    barStillDown = true;

    calculateFill(e);
  }, true);
  
  barHoverBox.addEventListener("touchmove", (e) => {
    if (barStillDown) {
      calculateFill(e);
    }
  }, true);
  
  barHoverBox.addEventListener("mousedown", (e) => {
    barStillDown = true;
    
    calculateFill(e);
  }, true);
  
  barHoverBox.addEventListener("mousemove", (e) => {
    if (barStillDown) {
      calculateFill(e);
    }
  });
  
  barHoverBox.addEventListener("wheel", (e) => {
    const newValue = +range.value + e.deltaY * 0.5;
    
    setValue(Math.max(
      Math.min(
        newValue,
        100.0
      ),
      0
    ))
  });
  
  document.addEventListener("mouseup", (e) => {
    barStillDown = false;
  }, true);
  
  document.addEventListener("touchend", (e) => {
    barStillDown = false;
  }, true);
})

document.addEventListener("DOMContentLoaded", () => {
	const range = document.querySelector(".volume input[type=range]");
  
	const barHoverBox = document.querySelector(".volume .bar-hoverbox");
	const fill = document.querySelector(".volume .bar .bar-fill");
  
	range.addEventListener("change", e => {
	  console.log("value", e.target.value);
	});
  
	const setValue = value => {
	  fill.style.width = value + "%";
	  range.setAttribute("value", value);
	  range.dispatchEvent(new Event("change"));
	};
  
	// Дефолт
	setValue(range.value);
  
	const calculateFill = e => {
	  // Отнимаем ширину двух 15-пиксельных паддингов из css
	  let offsetX = e.offsetX;
  
	  if (e.type === "touchmove") {
		offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;
	  }
  
	  const width = e.target.offsetWidth - 30;
  
	  setValue(
	  Math.max(
	  Math.min(
	  // Отнимаем левый паддинг
	  (offsetX - 15) / width * 100.0,
	  100.0),
  
	  0));
  
  
	};
  
	let barStillDown = false;
  
	barHoverBox.addEventListener("touchstart", e => {
	  barStillDown = true;
  
	  calculateFill(e);
	}, true);
  
	barHoverBox.addEventListener("touchmove", e => {
	  if (barStillDown) {
		calculateFill(e);
	  }
	}, true);
  
	barHoverBox.addEventListener("mousedown", e => {
	  barStillDown = true;
  
	  calculateFill(e);
	}, true);
  
	barHoverBox.addEventListener("mousemove", e => {
	  if (barStillDown) {
		calculateFill(e);
	  }
	});
  
	barHoverBox.addEventListener("wheel", e => {
	  const newValue = +range.value + e.deltaY * 0.5;
  
	  setValue(Math.max(
	  Math.min(
	  newValue,
	  100.0),
  
	  0));
  
	});
  
	document.addEventListener("mouseup", e => {
	  barStillDown = false;
	}, true);
  
	document.addEventListener("touchend", e => {
	  barStillDown = false;
	}, true);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const range = document.querySelector(".volume input[type=range]");
    const barHoverBox = document.querySelector(".volume .bar-hoverbox");
    const fill = document.querySelector(".volume .bar .bar-fill");

    const setVolume = (value) => {
        Game.sounds.click.volume = value / 100;
        Game.sounds.pop0.volume = value / 100;
        Game.sounds.pop1.volume = value / 100;
        Game.sounds.pop2.volume = value / 100;
        Game.sounds.pop3.volume = value / 100;
        Game.sounds.pop4.volume = value / 100;
        Game.sounds.pop5.volume = value / 100;
        Game.sounds.pop6.volume = value / 100;
        Game.sounds.pop7.volume = value / 100;
        Game.sounds.pop8.volume = value / 100;
        Game.sounds.pop9.volume = value / 100;
        Game.sounds.pop10.volume = value / 100;

		if (value == 0) {
			icon.classList.remove("fa-volume-up");
			icon.classList.add("fa-volume-mute");
		  } else {
			icon.classList.remove("fa-volume-mute");
			icon.classList.add("fa-volume-up");
		  }
    };

    range.addEventListener("change", (e) => {
        console.log("value", e.target.value);
        setVolume(e.target.value); // Изменение громкости
    });

    const setValue = (value) => {
        fill.style.width = value + "%";
        range.setAttribute("value", value);
        range.dispatchEvent(new Event("change"));
    };

    // Дефолт
    setValue(range.value);

    const calculateFill = (e) => {
        let offsetX = e.offsetX;

        if (e.type === "touchmove") {
            offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;
        }

        const width = e.target.offsetWidth - 30;

        setValue(
            Math.max(
                Math.min((offsetX - 15) / width * 100.0, 100.0),
                0
            )
        );
    };

    let barStillDown = false;

    barHoverBox.addEventListener("touchstart", (e) => {
        barStillDown = true;
        calculateFill(e);
    }, true);

    barHoverBox.addEventListener("touchmove", (e) => {
        if (barStillDown) {
            calculateFill(e);
        }
    }, true);

    barHoverBox.addEventListener("mousedown", (e) => {
        barStillDown = true;
        calculateFill(e);
    }, true);

    barHoverBox.addEventListener("mousemove", (e) => {
        if (barStillDown) {
            calculateFill(e);
        }
    });

    barHoverBox.addEventListener("wheel", (e) => {
        const newValue = +range.value + e.deltaY * 0.5;
        setValue(Math.max(Math.min(newValue, 100.0), 0));
    });

    document.addEventListener("mouseup", (e) => {
        barStillDown = false;
    }, true);

    document.addEventListener("touchend", (e) => {
        barStillDown = false;
    }, true);

	range.addEventListener("input", (e) => {
		const value = e.target.value;
		setVolume(value); 
	  });

});


// Инициализация SQL.js
initSqlJs().then(function(SQL) {
    console.log("SQL.js инициализирован");
    
    // Создаем новую базу данных в памяти
    var db = new SQL.Database();
    
    // Создаем таблицу
    db.run("CREATE TABLE test (score INTEGER, user TEXT);");
    console.log("Таблица создана");
    
    // Вставляем данные в таблицу
    db.run("INSERT INTO test (score, user) VALUES (?, ?), (?, ?);", [1, 'Alice', 2, 'Bob']);
    console.log("Данные вставлены");
    
    // Выполняем запрос на получение данных
    var res = db.exec("SELECT * FROM test");
    
    // Выводим результат запроса
    console.log(res);
    
    // Теперь вы можете обращаться к базе данных через объект db
    window.db = db; // Делаем объект db доступным глобально
}).catch(function(error) {
    console.error("Ошибка инициализации SQL.js:", error);
});
