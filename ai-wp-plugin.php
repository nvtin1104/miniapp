<?php
/*
Plugin Name: FL AI Chatbot Support
Plugin URI: https://github.com/nvtin1104
Description: Hộp chat hỗ trợ khách hàng dựa trên Dialogflow AI.
Version: 1.2
Author: Your Name
Author URI: https://github.com/nvtin1104
License: GPL2
*/

// Đảm bảo không truy cập trực tiếp
if (!defined('ABSPATH')) {
    exit;
}

// Nhúng Google Client Library (giả sử bạn đã cài qua Composer)
require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';

// Thêm script và style cho chatbot
function chatbot_enqueue_scripts() {
    wp_enqueue_style('chatbot-style', plugins_url('style.css', __FILE__));
    wp_enqueue_script('chatbot-script', plugins_url('chatbot.js', __FILE__), array('jquery'), '1.2', true);
    wp_localize_script('chatbot-script', 'chatbotAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'dialogflow_project_id' => get_option('chatbot_dialogflow_project_id', '')
    ));
}
add_action('wp_enqueue_scripts', 'chatbot_enqueue_scripts');

// Thêm box chat vào footer
function chatbot_display() {
    echo '<div id="chatbot-box"> 
            <div id="chatbot-header">Hỗ trợ AI</div>
            <div id="chatbot-messages"></div>
            <input type="text" id="chatbot-input" placeholder="Nhập câu hỏi...">
            <button id="chatbot-send">Gửi</button>
          </div>';
}
add_action('wp_footer', 'chatbot_display');

// Xử lý câu hỏi gửi đến Dialogflow qua AJAX
function chatbot_handle_question() {
    $question = sanitize_text_field($_POST['question']);
    $project_id = get_option('chatbot_dialogflow_project_id', '');
    $json_file_url = get_option('chatbot_service_account_json', '');
    $session_id = uniqid();

    // Debug: Ghi log giá trị của $json_file_url
    error_log('JSON File URL in chatbot_handle_question: ' . $json_file_url);

    if (empty($project_id)) {
        echo json_encode(array('response' => 'Vui lòng cấu hình Project ID và file JSON trong cài đặt plugin.'));
        wp_die();
    }

    // $upload_dir = wp_upload_dir();
    // $json_file_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $json_file_url);

    // // Kiểm tra xem file có tồn tại không
    // if (!file_exists($json_file_path)) {
    //     error_log('JSON file does not exist at: ' . $json_file_path);
    //     echo json_encode(array('response' => 'File JSON không tồn tại. Vui lòng upload lại file trong cài đặt plugin.'));
    //     wp_die();
    // }
    $base_path = 'C:\\xampp\\htdocs\\ai-plugin\\wp-content\\plugins'; // Corrected Windows path

    $json_file_path = $base_path . '/ai-wp-plugin/service-account.json';

    $client = new Google_Client();
    $client->setAuthConfig($json_file_path);
    $client->addScope('https://www.googleapis.com/auth/cloud-platform');
    $access_token = $client->fetchAccessTokenWithAssertion()['access_token'];

    $url = "https://dialogflow.googleapis.com/v2/projects/{$project_id}/agent/sessions/{$session_id}:detectIntent";
    $data = array(
        'queryInput' => array(
            'text' => array(
                'text' => $question,
                'languageCode' => 'vi'
            )
        )
    );

    $args = array(
        'method' => 'POST',
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($data),
        'timeout' => 15
    );

    $response = wp_remote_request($url, $args);

    if (is_wp_error($response)) {
        $response_body = array('response' => 'Có lỗi khi kết nối với AI: ' . $response->get_error_message());
    } else {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $response_body = array('response' => $body['queryResult']['fulfillmentText']);
    }

    echo json_encode($response_body);
    wp_die();
}
add_action('wp_ajax_chatbot_question', 'chatbot_handle_question');
add_action('wp_ajax_nopriv_chatbot_question', 'chatbot_handle_question');

// Đăng ký REST API endpoint cho webhook
add_action('rest_api_init', function () {
    register_rest_route('aichatbot/v1', '/webhook', array(
        'methods' => 'POST',
        'callback' => 'chatbot_webhook_callback',
    ));
});

function chatbot_webhook_callback($request) {
    $data = json_decode($request->get_body(), true);
    $intent = $data['queryResult']['intent']['displayName'];
    $parameters = $data['queryResult']['parameters'];

    if ($intent === 'AskProduct') {
        $product_name = $parameters['product'];
        $products = wc_get_products(array('name' => $product_name, 'limit' => 1));
        if ($products) {
            $response = "Sản phẩm {$products[0]->get_name()} giá " . $products[0]->get_price() . " VNĐ.";
        } else {
            $response = "Không tìm thấy sản phẩm {$product_name}.";
        }
    } elseif ($intent === 'AddToCart') {
        $product_name = $parameters['product'];
        $products = wc_get_products(array('name' => $product_name, 'limit' => 1));
        if ($products) {
            WC()->cart->add_to_cart($products[0]->get_id());
            $response = "Đã thêm {$products[0]->get_name()} vào giỏ hàng!";
        } else {
            $response = "Không tìm thấy sản phẩm {$product_name}.";
        }
    } else {
        $response = "Tôi chưa hiểu ý bạn, bạn có thể nói rõ hơn không?";
    }

    return array('fulfillmentText' => $response);
}

// Thêm menu cài đặt trong admin
function chatbot_admin_menu() {
    add_options_page(
        'Cài đặt FL AI Chatbot', // Tiêu đề trang
        'FL AI Chatbot',         // Tên menu
        'manage_options',        // Quyền truy cập
        'ai-chatbot-settings',   // Slug
        'chatbot_settings_page'  // Hàm hiển thị trang
    );
}
add_action('admin_menu', 'chatbot_admin_menu');

// Đăng ký các tùy chọn cài đặt

function chatbot_register_settings() {
    register_setting('chatbot_settings_group', 'chatbot_dialogflow_project_id', array(
        'sanitize_callback' => 'sanitize_text_field'
    ));
    register_setting('chatbot_settings_group', 'chatbot_service_account_json', array(
        'sanitize_callback' => 'chatbot_sanitize_json'
    ));

    add_settings_section(
        'chatbot_main_section',
        'Cài đặt chính',
        null,
        'ai-chatbot-settings'
    );

    add_settings_field(
        'chatbot_dialogflow_project_id',
        'Dialogflow Project ID',
        'chatbot_project_id_field',
        'ai-chatbot-settings',
        'chatbot_main_section'
    );

    add_settings_field(
        'chatbot_service_account_json',
        'Service Account JSON File',
        'chatbot_service_account_field',
        'ai-chatbot-settings',
        'chatbot_main_section'
    );

    add_action('update_option_chatbot_service_account_json', 'chatbot_handle_json_upload', 10, 3);
}

function chatbot_sanitize_json($value) {
    return $value;
}

function chatbot_project_id_field() {
    $value = get_option('chatbot_dialogflow_project_id', '');
    echo '<input type="text" name="chatbot_dialogflow_project_id" id="chatbot_dialogflow_project_id" value="' . esc_attr($value) . '" class="regular-text">';
    echo '<p class="description">Nhập Project ID từ Dialogflow Console.</p>';
}

function chatbot_service_account_field() {
    $json_file = get_option('chatbot_service_account_json', '');
    echo '<input type="file" name="chatbot_service_account_json" id="chatbot_service_account_json" accept=".json">';
    if ($json_file) {
        echo '<p class="description">File hiện tại: ' . basename($json_file) . ' <a href="' . esc_url($json_file) . '" target="_blank">Xem file</a></p>';
    }
    echo '<p class="description">Upload file JSON Service Account từ Google Cloud Console.</p>';
}

function chatbot_handle_json_upload($old_value, $new_value, $option) {
    // Debug log
    error_log('chatbot_handle_json_upload called with: ' . print_r($new_value, true));

    if (is_array($new_value)) {
        $new_value = json_encode($new_value); // Chuyển mảng thành JSON
    }

    if (!empty($_FILES['chatbot_service_account_json']['name'])) {
        $file = $_FILES['chatbot_service_account_json'];
        error_log('Uploading file: ' . print_r($file, true));

        if ($file['error'] !== UPLOAD_ERR_OK) {
            error_log('Upload error: ' . $file['error']);
            return $new_value;
        }

        $upload_dir = wp_upload_dir();
        $target_dir = $upload_dir['basedir'] . '/ai-wp-plugin/';
        $target_file = $target_dir . 'service-account.json';

        if (!file_exists($target_dir) && !wp_mkdir_p($target_dir)) {
            error_log('Failed to create directory: ' . $target_dir);
            return $new_value;
        }

        if (!is_writable($target_dir)) {
            error_log('Directory is not writable: ' . $target_dir);
            return $new_value;
        }

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $new_url = $upload_dir['baseurl'] . '/ai-wp-plugin/service-account.json';
            update_option('chatbot_service_account_json', $new_url);
            error_log('File uploaded successfully. New URL: ' . $new_url);
        } else {
            error_log('Failed to move uploaded file to: ' . $target_file);
        }
    }

    return $new_value;
}

add_action('admin_init', 'chatbot_register_settings');

// Hiển thị trang cài đặt
function chatbot_settings_page() {
    ?>
    <div class="wrap">
        <h1>Cài đặt FL AI Chatbot Support</h1>
        <form method="post" action="options.php" enctype="multipart/form-data">
            <?php
            settings_fields('chatbot_settings_group');
            do_settings_sections('ai-chatbot-settings');
            submit_button();
            ?>
        </form>

        <!-- Hiển thị thông tin debug -->
        <h2>Debug Information</h2>
        <pre>
            <?php
            // echo "Last uploaded file info (from $_FILES):\n";
            print_r(get_transient('chatbot_last_uploaded_file'));
            echo "\nLast new_value:\n";
            print_r(get_transient('chatbot_last_new_value'));
            ?>
        </pre>
    </div>
    <?php
}