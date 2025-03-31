<?php
/*
Plugin Name: WP Fixed Chatbot AI
Description: Chatbot cố định góc phải tích hợp AI để hỗ trợ chăm sóc khách hàng.
Version: 1.0
Author: Your Name
*/

if (!defined('ABSPATH')) {
    exit;
}

// Load Guzzle
require_once __DIR__ . '/vendor/autoload.php';
use GuzzleHttp\Client;

class WPFixedChatbotAI {
    private $options;

    public function __construct() {
        // Lấy cài đặt từ database
        $this->options = get_option('wp_ai_cskh_settings', [
            'api_token' => '',
            'api_endpoint' => 'https://api.gemini.example.com/v1/analyze',
            'prompt' => 'Bạn là chatbot hỗ trợ khách hàng cho cửa hàng mỹ phẩm. Hãy trả lời câu hỏi của khách hàng dựa trên thông tin sản phẩm và cung cấp gợi ý nếu cần.'
        ]);

        // Thêm chatbot vào footer
        add_action('wp_footer', [$this, 'render_chatbot']);
        
        // Đăng ký AJAX
        add_action('wp_ajax_chatbot_ai_request', [$this, 'handle_chatbot_request']);
        add_action('wp_ajax_nopriv_chatbot_ai_request', [$this, 'handle_chatbot_request']);
        
        // Thêm menu cài đặt
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    // Hiển thị chatbot cố định góc phải
    public function render_chatbot() {
        ?>
        <div id="chatbot-ai-container">
            <div id="chatbot-ai-toggle">💬</div>
            <div id="chatbot-ai-box" style="display: none;">
                <div id="chatbot-ai-messages"></div>
                <input type="text" id="chatbot-ai-input" placeholder="Hỏi mình bất cứ điều gì...">
                <button onclick="sendChatbotAIRequest()">Gửi</button>
            </div>
        </div>
        <style>
            #chatbot-ai-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            #chatbot-ai-toggle {
                width: 50px;
                height: 50px;
                background: #0073aa;
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 50px;
                cursor: pointer;
                font-size: 24px;
            }
            #chatbot-ai-box {
                width: 300px;
                height: 400px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 10px;
                overflow-y: auto;
            }
            #chatbot-ai-messages {
                height: 320px;
                overflow-y: auto;
                margin-bottom: 10px;
            }
            #chatbot-ai-input {
                width: 70%;
                padding: 5px;
            }
            #chatbot-ai-box button {
                width: 25%;
                padding: 5px;
            }
        </style>
        <script>
            jQuery(document).ready(function($) {
                $('#chatbot-ai-toggle').click(function() {
                    $('#chatbot-ai-box').toggle();
                });
                $('#chatbot-ai-input').keypress(function(e) {
                    if (e.which == 13) {
                        sendChatbotAIRequest();
                    }
                });
            });

            function sendChatbotAIRequest() {
                const input = document.getElementById('chatbot-ai-input').value;
                const messages = document.getElementById('chatbot-ai-messages');
                
                if (input.trim() === '') return;

                messages.innerHTML += '<p><strong>Bạn:</strong> ' + input + '</p>';
                jQuery.ajax({
                    url: '<?php echo admin_url('admin-ajax.php'); ?>',
                    type: 'POST',
                    data: {
                        action: 'chatbot_ai_request',
                        message: input
                    },
                    success: function(response) {
                        messages.innerHTML += '<p><strong>Chatbot:</strong> ' + response.data + '</p>';
                        messages.scrollTop = messages.scrollHeight;
                        document.getElementById('chatbot-ai-input').value = '';
                    }
                });
            }
        </script>
        <?php
    }

    // Xử lý yêu cầu AJAX
    public function handle_chatbot_request() {
        $message = sanitize_text_field($_POST['message']);
        $response = $this->analyze_with_ai($message);
        wp_send_json_success($response);
    }

    // Gửi yêu cầu tới API AI
    private function call_ai_api($message) {
        $client = new Client();
        try {
            $response = $client->post($this->options['api_endpoint'], [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->options['api_token'],
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'text' => $this->options['prompt'] . ' Câu hỏi: ' . $message,
                    'language' => 'vi'
                ]
            ]);
            return json_decode($response->getBody(), true);
        } catch (Exception $e) {
            return ['error' => 'Không thể kết nối tới API AI: ' . $e->getMessage()];
        }
    }

    // Phân tích tin nhắn với AI và truy vấn database
    private function analyze_with_ai($message) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'cosmetics';

        if (empty($this->options['api_token'])) {
            return "API Token chưa được cấu hình. Vui lòng kiểm tra trong phần cài đặt.";
        }

        $ai_result = $this->call_ai_api($message);

        if (isset($ai_result['error'])) {
            return "Có lỗi xảy ra: " . $ai_result['error'];
        }

        $intent = $ai_result['intent'] ?? 'unknown';
        $entities = $ai_result['entities'] ?? [];

        switch ($intent) {
            case 'ask_price':
                $product = $entities['product'] ?? '';
                if ($product) {
                    $price = $wpdb->get_var($wpdb->prepare(
                        "SELECT price FROM $table_name WHERE product_name = %s",
                        $product
                    ));
                    if ($price) {
                        return "Sản phẩm $product có giá " . number_format($price) . " VNĐ nhé!";
                    }
                    return "Mình không tìm thấy sản phẩm '$product'.";
                }
                break;

            case 'ask_uses':
                $product = $entities['product'] ?? '';
                if ($product) {
                    $uses = $wpdb->get_var($wpdb->prepare(
                        "SELECT uses FROM $table_name WHERE product_name = %s",
                        $product
                    ));
                    if ($uses) {
                        return "$product có công dụng: $uses.";
                    }
                    return "Mình không tìm thấy thông tin về '$product'.";
                }
                break;

            case 'recommend_product':
                $skin_type = $entities['skin_type'] ?? '';
                if ($skin_type === 'da dầu') {
                    $result = $wpdb->get_row(
                        "SELECT product_name, description FROM $table_name WHERE uses LIKE '%giảm dầu thừa%'"
                    );
                    if ($result) {
                        return "Mình gợi ý bạn dùng $result->product_name nhé, sản phẩm này $result->description, rất phù hợp cho da dầu!";
                    }
                }
                break;

            default:
                // Nếu AI không nhận diện intent, trả lời mặc định dựa trên prompt
                return $ai_result['response'] ?? "Mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi lại không?";
        }

        return "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể hỏi rõ hơn không?";
    }

    // Thêm trang cài đặt vào menu admin
    public function add_settings_page() {
        add_options_page(
            'Cài đặt Chatbot AI',
            'Chatbot AI',
            'manage_options',
            'wp-fixed-chatbot-ai',
            [$this, 'render_settings_page']
        );
    }

    // Hiển thị giao diện trang cài đặt
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Cài đặt Chatbot AI</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('wp_ai_cskh_group');
                do_settings_sections('wp-fixed-chatbot-ai');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    // Đăng ký các field cài đặt
    public function register_settings() {
        register_setting('wp_ai_cskh_group', 'wp_ai_cskh_settings');

        add_settings_section(
            'wp_ai_cskh_section',
            'Cấu hình AI',
            function() { echo 'Nhập thông tin API và prompt để chatbot hoạt động.'; },
            'wp-fixed-chatbot-ai'
        );

        add_settings_field(
            'api_token',
            'API Token',
            [$this, 'api_token_field'],
            'wp-fixed-chatbot-ai',
            'wp_ai_cskh_section'
        );

        add_settings_field(
            'api_endpoint',
            'API Endpoint',
            [$this, 'api_endpoint_field'],
            'wp-fixed-chatbot-ai',
            'wp_ai_cskh_section'
        );

        add_settings_field(
            'prompt',
            'Prompt cho AI',
            [$this, 'prompt_field'],
            'wp-fixed-chatbot-ai',
            'wp_ai_cskh_section'
        );
    }

    public function api_token_field() {
        $value = $this->options['api_token'];
        echo "<input type='text' name='wp_ai_cskh_settings[api_token]' value='$value' size='50' />";
    }

    public function api_endpoint_field() {
        $value = $this->options['api_endpoint'];
        echo "<input type='text' name='wp_ai_cskh_settings[api_endpoint]' value='$value' size='50' />";
    }

    public function prompt_field() {
        $value = $this->options['prompt'];
        echo "<textarea name='wp_ai_cskh_settings[prompt]' rows='5' cols='50'>$value</textarea>";
    }
}

new WPFixedChatbotAI();