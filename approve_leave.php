<?php
header("Content-Type: application/json");
include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$action = $data['action'];

$status = ($action == "approve") ? "approved" : "rejected";

mysqli_query($conn,
"UPDATE leaves SET status='$status' WHERE id='$id'");

echo json_encode(["message" => "done"]);