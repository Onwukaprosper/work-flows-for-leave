<?php
header("Content-Type: application/json");
include "config.php";

$department = isset($_GET['department'])?$_GET['department']: '';

$query = "SELECT leaves.*, users.name 
          FROM leaves
          JOIN users ON leaves.user_id = users.id
          WHERE users.department = '$department'";

$result = mysqli_query($conn, $query);

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);