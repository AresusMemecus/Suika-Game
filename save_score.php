<?php
$servername = "localhost:3306";
$username = "Aresus";
$password = "oxe4601K*";
$dbname = "SuikaTop";

echo "Connect";

// Создание соединения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Получение данных из запроса
$name = isset($_POST['name']) ? $_POST['name'] : '';
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;

// Защита от инъекций
$name = $conn->real_escape_string($name);

// Проверяем, что имя не пустое и счет больше нуля
if (!empty($name) && $score > 0) {
    // SQL-запрос для вставки или обновления с проверкой
    $sql = "INSERT INTO Top (Name, Score) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
            Score = GREATEST(Score, VALUES(Score))";

    // Подготовка запроса
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        // Привязка параметров
        $stmt->bind_param("si", $name, $score);

        // Выполнение запроса
        if ($stmt->execute()) {
            echo "Record inserted/updated successfully";
        } else {
            echo "Error executing query: " . $stmt->error;
        }

        // Закрытие подготовленного запроса
        $stmt->close();
    } else {
        echo "Error preparing statement: " . $conn->error;
    }
} else {
    echo "Invalid data provided";
}

// Закрытие соединения
$conn->close();
?>
