<?php
/*
Plugin Name: AI Chatbot Support
Plugin URI: https://yourwebsite.com
Description: Hộp chat hỗ trợ khách hàng dựa trên Dialogflow AI.
Version: 1.2
Author: Your Name
Author URI: https://yourwebsite.com
License: GPL2
*/

// Đảm bảo không truy cập trực tiếp
if (!defined('ABSPATH')) {
    exit;
}

// Thêm script và style cho chatbot
function chatbot_enqueue_scripts() {
    wp_enqueue_style('chatbot-style', plugins_url('style.css', __FILE__));
    wp_enqueue_script('chatbot-script', plugins_url('chatbot.js', __FILE__), array('jquery'), '1.2', true);
    wp_localize_script('chatbot-script', 'chatbotAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'dialogflow_project_id' => get_option('chatbot_dialogflow_project_id', ''),
        'dialogflow_token' => get_option('chatbot_dialogflow_token', '')
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
    $project_id = get_option('chatbot_dialogflow_project_id', ''); // Lấy từ cài đặt
    $access_token = get_option('chatbot_dialogflow_token', '');   // Lấy từ cài đặt
    $session_id = uniqid(); // Tạo session ID duy nhất cho mỗi phiên chat

    if (empty($project_id) || empty($access_token)) {
        echo json_encode(array('response' => 'Vui lòng cấu hình Project ID và Access Token trong cài đặt plugin.'));
        wp_die();
    }

    // Gửi yêu cầu tới Dialogflow API
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
        $response_body = array('response' => 'Có lỗi khi kết nối với AI.');
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
        'Cài đặt AI Chatbot', // Tiêu đề trang
        'AI Chatbot',         // Tên menu
        'manage_options',     // Quyền truy cập
        'ai-chatbot-settings', // Slug
        'chatbot_settings_page' // Hàm hiển thị trang
    );
}
add_action('admin_menu', 'chatbot_admin_menu');

// Đăng ký các tùy chọn cài đặt
function chatbot_register_settings() {
    register_setting('chatbot_settings_group', 'chatbot_dialogflow_project_id');
    register_setting('chatbot_settings_group', 'chatbot_dialogflow_token');
}
add_action('admin_init', 'chatbot_register_settings');

// Hiển thị trang cài đặt
function chatbot_settings_page() {
    ?>
    <div class="wrap">
        <h1>Cài đặt AI Chatbot Support</h1>
        <form method="post" action="options.php">
            <?php settings_fields('chatbot_settings_group'); ?>
            <?php do_settings_sections('chatbot_settings_group'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="chatbot_dialogflow_project_id">Dialogflow Project ID</label></th>
                    <td>
                        <input type="text" name="chatbot_dialogflow_project_id" id="chatbot_dialogflow_project_id" value="<?php echo esc_attr(get_option('chatbot_dialogflow_project_id')); ?>" class="regular-text">
                        <p class="description">Nhập Project ID từ Dialogflow Console.</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="chatbot_dialogflow_token">Client Access Token</label></th>
                    <td>
                        <input type="text" name="chatbot_dialogflow_token" id="chatbot_dialogflow_token" value="<?php echo esc_attr(get_option('chatbot_dialogflow_token')); ?>" class="regular-text">
                        <p class="description">Nhập Client Access Token từ Dialogflow Console.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}