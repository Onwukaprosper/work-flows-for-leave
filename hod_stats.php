<?php
session_start();
header("Content-Type: application/json");
include "config.php";


$_SESSION['role'] = 'hod';
$_SESSION['department'] = 'Computer Science';

// Restrict access
if ($_SESSION['role'] != 'hod') {
    echo json_encode(["error" => "Access denied"]);
    exit();
}

$department = $_SESSION['department'];

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