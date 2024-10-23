(function() {

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
	
	function saveNameToLocalStorage() {
		const nameInput = document.getElementById('name');
		localStorage.setItem('playerName', nameInput.value);
	}
	
	// Функция для загрузки значения из localStorage при загрузке страницы
	function loadNameFromLocalStorage() {
		const nameInput = document.getElementById('name');
		const savedName = localStorage.getItem('playerName');
	
		if (savedName) {
			nameInput.value = savedName; // Устанавливаем сохраненное значение
		}
	}
	
	// Добавляем события
	document.addEventListener('DOMContentLoaded', loadNameFromLocalStorage); // Загружаем значение при загрузке страницы
	document.getElementById('name').addEventListener('input', saveNameToLocalStorage); // Сохраняем при вводе
	
	document.addEventListener('DOMContentLoaded', function () {
		const startButton = document.getElementById('start-button');
		if (startButton) {
			startButton.addEventListener('click', function () {
				const nameInput = document.getElementById('name');
				const playerName = nameInput.value.trim(); // Получаем значение и убираем лишние пробелы
				
				// Проверяем условия: имя не пустое и не больше 10 символов
				if (playerName === '' || playerName.length > 10) {
					alert('Пожалуйста, введите корректное имя (максимум 10 символов).');
					return; // Если условия не выполнены, выходим из функции
				}
	
				console.log('Кнопка нажата, игра начинается');
				Game.fruitsMerged = Array.apply(null, Array(Game.fruitSizes.length)).map(() => 0);  // Обнуляем счётчики объединённых фруктов
				Game.startGame();
			});
		} else {
			console.error('Кнопка старта не найдена!');
		}
	});
	
	
	
				//Game
	
	
	
	const Game = {
		width: 640,
		height: 960,
		
		elements: {
			canvas: document.getElementById('game-canvas'),
			ui: document.getElementById('game-ui'),
			score: document.getElementById('game-score'),
			gameStrat: document.getElementById('game-start-container'),
			gameStatus: document.getElementById('game-status'),
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
		
			// Сохраняем хайскор в локальном хранилище
			localStorage.setItem('suika-game-cache', JSON.stringify(Game.cache));
		
			// Отправляем хайскор на сервер
			const playerName = document.getElementById('name').value;
			if (playerName) {
				const xhr = new XMLHttpRequest();
				xhr.open("POST", "save_score.php", true); // Путь к PHP-скрипту для сохранения
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
				// Отправляем имя и хайскор
				xhr.send(`name=${encodeURIComponent(playerName)}&score=${Game.score}`);
		
				// Обработка ответа сервера (опционально)
				xhr.onload = function() {
					if (xhr.status === 200) {
						console.log("Score saved successfully!");
					} else {
						console.error("Failed to save score");
					}
				};
			}
		},
	
		
	
		initGame: function () {
			// Инициализация рендера и движка
			Render.run(render);
			Runner.run(runner, engine);
		
			// Добавляем физические объекты в мир
			Game.loadHighscore();
		
			// Скрываем элементы интерфейса до начала игры
			Game.elements.score.style.display = 'none';
			Game.elements.end.style.display = 'none';
			Game.fruitsMerged = Array.apply(null, Array(Game.fruitSizes.length)).map(() => 0);  // Обнуляем счётчики объединённых фруктов
			
			// Замораживаем массив, чтобы предотвратить изменения
			Object.freeze(Game.fruitsMerged);
		},
		
		
		startGame: function () {
			Game.sounds.click.play();  // Звук клика при старте
		
			// Убираем меню и добавляем игровые элементы
			Composite.remove(engine.world, menuStatics);
			Composite.add(engine.world, gameStatics);
		
			Game.calculateScore();  // Вычисляем начальный счёт
			Game.elements.ui.style.pointerEvents = 'none';
			Game.elements.gameStrat.style.display = 'none';  // Скрываем меню старта игры
			Game.elements.score.style.display = 'flex';  // Показываем счёт игры
			Game.elements.gameStatus.style.display = 'flex';  
			Game.elements.endTitle.innerText = 'Game Over!';
			Game.elements.end.style.display = 'none';
		
			// Создаём стартовый фрукт
			Game.elements.previewBall = Game.generateFruitBody(Game.width / 2, previewBallHeight, 0, { isStatic: true });
			Composite.add(engine.world, Game.elements.previewBall);
		
			// Тайм-аут для плавного перехода к состоянию READY
			setTimeout(() => {
				Game.stateIndex = GameStates.READY;
			}, 250);
		
			// Обработчик событий при отпускании мыши
			Events.on(mouseConstraint, 'mouseup', function (e) {
				Game.addFruit(e.mouse.position.x);
			});
		
			// Обработчик событий при перемещении мыши
			Events.on(mouseConstraint, 'mousemove', function (e) {
				if (Game.stateIndex !== GameStates.READY) return;
				if (Game.elements.previewBall === null) return;
		
				// Перемещение стартового фрукта за курсором
				Game.elements.previewBall.position.x = e.mouse.position.x;
			});
		
			// Обработчик событий столкновений
			Events.on(engine, 'collisionStart', function (e) {
				for (let i = 0; i < e.pairs.length; i++) {
					const { bodyA, bodyB } = e.pairs[i];
		
					// Пропуск стенок
					if (bodyA.isStatic || bodyB.isStatic) continue;
		
					const aY = bodyA.position.y + bodyA.circleRadius;
					const bY = bodyB.position.y + bodyB.circleRadius;
		
					// Проверка на слишком высокое положение
					if (aY < loseHeight || bY < loseHeight) {
						Game.loseGame();
						return;
					}
		
					// Пропуск объектов разных размеров
					if (bodyA.sizeIndex !== bodyB.sizeIndex) continue;
		
					// Пропуск уже слияных объектов
					if (bodyA.popped || bodyB.popped) continue;
		
					let newSize = bodyA.sizeIndex + 1;
		
					// Объект достиг максимального размера, возвращаем к самому маленькому
					if (bodyA.circleRadius >= Game.fruitSizes[Game.fruitSizes.length - 1].radius) {
						newSize = 0;
					}
		
					Game.fruitsMerged[bodyA.sizeIndex] += 1;
		
					// Слияние двух объектов
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
			background: '#a9cdd4'
		}
	});
	
	const menuStatics = [
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
	

	
	})();
	  
	
	