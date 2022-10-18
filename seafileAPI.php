<?php

header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");

$json = file_get_contents('php://input');
$data = (array)json_decode($json);


$time = date('Y-m-d H:i:s');
$content =  <<<STR
========= $time =====================
STR;


// file_put_contents("debug.log", $content);



if (isset($data) && isset($data['method'])) {

    triggerCurl($data);
} else {

    //Upload Files here
    if ($_FILES['file']) {

        $file = $_FILES['file'];
        $post_fields = [
            'file' => new CURLFile($file['tmp_name'], $file['type'], $file['name'])
        ];
        if ($_POST['parent_dir']) {
            $post_fields['parent_dir'] = $_POST['parent_dir'];
        }
        if ($_POST['replace']) {
            $post_fields['replace'] = $_POST['replace'];
        }
        $token = $_POST['token'];
        $url = $_POST['url'];
        $method = $_POST['method'];

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $post_fields,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Token ' . $token
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);
        echo $response;

        // $response = json_encode($response);

        // $content .= "\nToken is $token\n";
        // $content .= $response + "\n";

        // file_put_contents("/var/www/html/debug.log", $content, FILE_APPEND);
    }
}
function triggerCurl($data)
{
    $headers = [];
    $urlencoded = false;
    foreach ($data['headers'] as $key => $value) {
        $headers[] = $key . ": " . $value;
        if ($value == "application/x-www-form-urlencoded") $urlencoded = true;
    }

    $curl = curl_init();
    $curl_setting = [
        CURLOPT_URL => $data['url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $data['method'],
        CURLOPT_HTTPHEADER => $headers,
    ];
    if ($data['method'] == 'POST') {
        if ($urlencoded)
            $curl_setting[CURLOPT_POSTFIELDS] = http_build_query($data['data']);
    }
    if (!empty($data['body'])) {
        $curl_setting[CURLOPT_POSTFIELDS] = json_encode($data['body']);
    }
    curl_setopt_array($curl, $curl_setting);
    $response = curl_exec($curl);

    curl_close($curl);
    echo $response;

    // global $content;
    // $headers = json_encode($headers);
    // $response = json_encode($response);

    // $content .= "\nHeaders are $headers\n";
    // $content .= $response + "\n";

    // file_put_contents("/var/www/html/debug.log", $content, FILE_APPEND);
}
