


            //Valume



document.addEventListener("DOMContentLoaded", () => {
    const range = document.querySelector(".settings input[type=range]");
  
    const barHoverBox = document.querySelector(".settings .bar-hoverbox");
    const fill = document.querySelector(".settings .bar .bar-fill");
    
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
      const range = document.querySelector(".settings input[type=range]");
    
      const barHoverBox = document.querySelector(".settings .bar-hoverbox");
      const fill = document.querySelector(".settings .bar .bar-fill");
    
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
      const range = document.querySelector(".settings input[type=range]");
      const barHoverBox = document.querySelector(".settings .bar-hoverbox");
      const fill = document.querySelector(".settings .bar .bar-fill");
  
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
  
  
              //THEME
  
  
  
      // Функция для изменения фона
      function changeBackgroundColor() {
          // Проверяем текущий цвет и переключаем
          if (render.options.background === '#a9cdd4') {
            render.options.background = '#303030'; // Темный фон
          } else {
            render.options.background = '#a9cdd4'; // Светлый фон
          }
    
        }
    
        // Получаем элемент иконки по ID
        const themeSwitcherIcon = document.getElementById('theme-switcher');
    
        // Добавляем событие клика
        themeSwitcherIcon.addEventListener('click', function() {
          changeBackgroundColor(); // Меняем фон
  
          // Дополнительно можно обновить иконку
          if (render.options.background === '#303030') {
            themeSwitcherIcon.classList.add('bi-brightness-high-fill');
            themeSwitcherIcon.classList.remove('bi-moon-fill'); 
            
          } else {
            themeSwitcherIcon.classList.add('bi-moon-fill');
            themeSwitcherIcon.classList.remove('bi-brightness-high-fill');  // Иконка "Солнце" для светлой темы
          }
        });
  
        const themeSwitcher = document.getElementById('theme-switcher');
        const gameCanvas = document.getElementById('game-canvas');
        const gameScore = document.getElementById('game-score');
  
  
        themeSwitcher.addEventListener('click', function() {
          const rootStyles = document.documentElement.style;
          const currentBgColor = getComputedStyle(document.documentElement).getPropertyValue('--col-bg').trim();
      
          if (currentBgColor === '#477a91') {
            // Темная тема
            rootStyles.setProperty('--col-bg', '#141414');        // Темный фон
            rootStyles.setProperty('--col-primary-light', '#555'); // Темный цвет для элементов
            rootStyles.setProperty('--col-white', '#eee');     // Светлый текст
            gameCanvas.style.boxShadow = '0px 0px 20px 20px #5757573f';
            gameScore.style.borderBottom = '3px dotted #575757	';
          } else {
            // Светлая тема (по умолчанию)
            rootStyles.setProperty('--col-bg', '#477a91');     // Оригинальный фон
            rootStyles.setProperty('--col-primary-light', '#FF8800'); // Оригинальный цвет
            rootStyles.setProperty('--col-white', '#fff');     // Оригинальный текст
            gameCanvas.style.boxShadow = '0px 0px 15px 15px #e1ebf03f'; // Оригинальный box-shadow
            gameScore.style.borderBottom = '3px dotted #477a91';
          }
  
          
      });
  