<?php

$servername = "localhost:3306";
$username = "Aresus";
$password = "oxe4601K*";
$dbname = "SuikaTop";

// Создание соединения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL-запрос для получения топ-10 наибольших значений Score
$sql = "SELECT Name, Score FROM Top ORDER BY Score DESC LIMIT 10"; // Замените "Top" на имя вашей таблицы
$result = $conn->query($sql);

// Проверка наличия результатов
if ($result->num_rows > 0) {
    echo "<div class=\"TopList\">
    <p1 class=\"TopName\">Top 10</p1>
    <table>";
    
    // Вывод данных для каждой строки
    while($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>" . htmlspecialchars($row["Name"]) . "</td>
                <td>" . htmlspecialchars($row["Score"]) . "</td>
              </tr>";
    }
    
    echo "</table></div>";
} else {
    echo "Нет результатов";
}


// Закрытие соединения
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" integrity="sha384-tViUnnbYAV00FLIhhi3v/dWt3Jxw4gZQcNoSCxCIFNJVCx7/D55/wXsrNIRANwdD" crossorigin="anonymous">
  <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>
  
  <link rel="stylesheet" href="./game.css">
  <link rel="stylesheet" href="./option.css">
  
  <title>SuikaShield</title>
  
</head>
<body>
  <div class="container">
    <div id="game-canvas">
      <div id="game-ui">

        <div id="game-start-container">
          <div id="game-start">
            <img src="./assets/img/bg-menu.png" class="logo">
            <input id="name" class="menu-elements" placeholder="NAME">
            <button id="start-button" class="menu-elements">PLAY</button>
          </div>
        </div>

        <p id="game-score"></p>

        <div id="game-end-container">
          <div id="game-end">
            <div id="game-end-title">Game Over!</div>
            <a id="game-end-link" href="">Try Again</a>
          </div>

        </div>

        <div id="game-status">

          <div class="game-status-item">
            <div class="game-status-label">Highscore</div>
            <div id="game-highscore-value">0</div>
          </div>

          <div class="game-status-item">
            <div class="game-status-label">Next</div>
            <img id="game-next-fruit" src="./assets/img/circle0.png" />
            <div class="game-status-label"></div>
          </div>

        </div>

      </div>
    </div>

    <div class="menu">


      <div class="settings">
        <div class="icon-size">
          <i class="bi bi-moon-fill" aria-hidden="true" id="theme-switcher"></i>
        </div>
      </div>

      <div class="settings">
        <input type="range" min="0" max="100" value="50" class="volume-range">
        <div class="icon">
          <i class="fa fa-volume-up icon-size" aria-hidden="true"></i>
        </div>
        <div class="bar-hoverbox">
          <div class="bar">
            <div class="bar-fill"></div>
          </div>
        </div>
      </div>

      <div class="settings">
        <div class="icon-size">
          <a href="https://t.me/AresusMemecus" target="_blank">
            <i class="bi bi-telegram" herf=""></i>
          </a>
        </div>
      </div>
      

    </div>
  </div>
  
  <script type="text/javascript" src="./private/matter.js"></script>

  <script type="text/javascript" src="./private/game.js"></script>
  <script type="text/javascript" src="./private/option.js"></script>

</body>
</html>

