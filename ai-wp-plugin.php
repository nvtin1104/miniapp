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
// vendor/autoload.php
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

    if (empty($project_id)) {
        echo json_encode(array('response' => 'Vui lòng cấu hình Project ID trong cài đặt plugin.'));
        wp_die();
    }
    // Hard-code đường dẫn tới file JSON
    $json_file_path = 'C:\\xampp\\htdocs\\ai-plugin\\wp-content\\plugins\\ai-wp-plugin\\service-account.json';
    // $json_file_path = 'D:\\laragon\\www\\ai-wp-plugin-web\\wp-content\\plugins\\ai-wp-plugin\\service-account.json';

    if (!file_exists($json_file_path)) {
        error_log('JSON file does not exist at: ' . $json_file_path);
        echo json_encode(array('response' => 'File JSON không tồn tại. Vui lòng upload lại file trong cài đặt plugin.'));
        wp_die();
    }

    $client = new Google_Client();
    $client->setAuthConfig($json_file_path);
    $client->addScope('https://www.googleapis.com/auth/cloud-platform');
    $access_token = $client->fetchAccessTokenWithAssertion()['access_token'];

    $url = "https://dialogflow.googleapis.com/v2/projects/{$project_id}/agent/sessions/{$session_id}:detectIntent";
    $data = array(
        'query_input' => array(
            'text' => array(
                'text' => $question,
                'language_code' => 'vi'
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
    $final_response = '';

    if (is_wp_error($response) || !isset(json_decode(wp_remote_retrieve_body($response), true)['queryResult']['fulfillmentText'])) {
        // Dialogflow failed or returned "Không có phản hồi từ AI."
        $query_chunks = split_large_query($question);
        foreach ($query_chunks as $chunk) {
            $gemini_response = call_gemini_api($chunk);
            if ($gemini_response !== false) {
                if (strpos($gemini_response, 'GIASANPHAM') === 0) {
                    $parts = explode(', ', $gemini_response);
                    $final_response .= LayGiaSanPham($parts[1]) . "\n";
                } elseif (strpos($gemini_response, 'GH') === 0) {
                    if ($gemini_response === 'GHExcept') {
                        $final_response .= HoiLaiKhachHang() . "\n";
                    } else {
                        $final_response .= ThemSanPhamVaoGioHang($gemini_response) . "\n";
                    }
                } elseif (strpos($gemini_response, 'XOAGIOHANG') === 0) {
                    $parts = explode(', ', $gemini_response);
                    $final_response .= XoaSanPhamKhoiGioHang($parts[1]) . "\n";
                } elseif ($gemini_response === 'XEMGH') {
                    $final_response .= XemGioHang() . "\n";
                } elseif (strpos($gemini_response, 'TRANGTHAIDONHANG') === 0) {
                    $parts = explode(', ', $gemini_response);
                    $final_response .= TrangThaiDonHang($parts[1]) . "\n";
                } elseif (strpos($gemini_response, 'TIMSP') === 0) {
                    $parts = explode(', ', $gemini_response);
                    $final_response .= TimSanPham($parts[1]) . "\n";
                } else {
                    // Handle generic responses from Gemini (e.g., "Không tìm thấy sản phẩm...")
                    $final_response .= $gemini_response . "\n";
                }
            } else {
                $final_response .= "Có lỗi khi kết nối với AI: Không thể kết nối với Gemini.\n";
            }
        }
        $response_body = array('response' => $final_response);
    } else {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $dialogflow_response = $body['queryResult']['fulfillmentText'];
        // Process structured responses from Dialogflow
        if (strpos($dialogflow_response, 'GIASANPHAM') === 0) {
            $parts = explode(', ', $dialogflow_response);
            $final_response = LayGiaSanPham($parts[1]);
        } elseif (strpos($dialogflow_response, 'GH') === 0) {
            if ($dialogflow_response === 'GHExcept') {
                $final_response = HoiLaiKhachHang();
            } else {
                $final_response = ThemSanPhamVaoGioHang($dialogflow_response);
            }
        } elseif (strpos($dialogflow_response, 'XOAGIOHANG') === 0) {
            $parts = explode(', ', $dialogflow_response);
            $final_response = XoaSanPhamKhoiGioHang($parts[1]);
        } elseif ($dialogflow_response === 'XEMGH') {
            $final_response = XemGioHang();
        } elseif (strpos($dialogflow_response, 'TRANGTHAIDONHANG') === 0) {
            $parts = explode(', ', $dialogflow_response);
            $final_response = TrangThaiDonHang($parts[1]);
        } elseif (strpos($dialogflow_response, 'TIMSP') === 0) {
            $parts = explode(', ', $dialogflow_response);
            $final_response = TimSanPham($parts[1]);
        } else {
            $final_response = $dialogflow_response;
        }
        $response_body = array('response' => $final_response);
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
        'permission_callback' => '__return_true', // Public access for Dialogflow webhook
    ));
});

function split_large_query($query, $max_length = 500) {
    if (strlen($query) <= $max_length) {
        return array($query);
    }
    return str_split($query, $max_length);
}
// Get product price
function LayGiaSanPham($product_id) {
    $product = wc_get_product($product_id);
    if ($product) {
        return "Sản phẩm {$product->get_name()} giá " . $product->get_price() . " VNĐ.";
    }
    return "Không tìm thấy sản phẩm với mã {$product_id}.";
}

//add to cart
function ThemSanPhamVaoGioHang($response) {
    $parts = explode(', ', $response);
    $product_id = $parts[1];
    $quantity = isset($parts[2]) ? (int) $parts[2] : 1;
    $product = wc_get_product($product_id);
    if ($product && $product->is_in_stock() && $product->has_enough_stock($quantity)) {
        $added = WC()->cart->add_to_cart($product_id, $quantity);
        if ($added) {
            return "Đã thêm sản phẩm {$product->get_name()} vào giỏ hàng.";
        }
        return "Không thể thêm sản phẩm vào giỏ hàng.";
    }
    return "Sản phẩm không có sẵn hoặc không đủ số lượng.";
}
// Remove from cart
function XoaSanPhamKhoiGioHang($product_id) {
    $product = wc_get_product($product_id);
    if ($product) {
        $cart = WC()->cart->get_cart();
        foreach ($cart as $cart_item_key => $cart_item) {
            if ($cart_item['product_id'] == $product->get_id()) {
                WC()->cart->remove_cart_item($cart_item_key);
                return "Đã xóa {$product->get_name()} khỏi giỏ hàng!";
            }
        }
        return "Không tìm thấy {$product->get_name()} trong giỏ hàng.";
    }
    return "Không tìm thấy sản phẩm với mã {$product_id}.";
}
// View cart
function XemGioHang() {
    $cart = WC()->cart->get_cart();
    if (empty($cart)) {
        return "Giỏ hàng của bạn trống.";
    }
    $response = "Giỏ hàng của bạn có: ";
    foreach ($cart as $cart_item) {
        $product = wc_get_product($cart_item['product_id']);
        $response .= "{$product->get_name()} ({$cart_item['quantity']}), ";
    }
    $response .= "Tổng: " . WC()->cart->get_cart_total() . ".";
    return $response;
}

// Check order status
function TrangThaiDonHang($order_id) {
    $order = wc_get_order($order_id);
    if ($order) {
        return "Đơn hàng #{$order_id} đang {$order->get_status()}.";
    }
    return "Không tìm thấy đơn hàng #{$order_id}.";
}

// Search products
function TimSanPham($search_term) {
    $products = wc_get_products(array(
        's' => $search_term, // WooCommerce search parameter
        'limit' => 5
    ));
    if ($products) {
        $response = "Đây là các sản phẩm phù hợp: ";
        foreach ($products as $product) {
            $response .= "{$product->get_name()} ({$product->get_price()} VNĐ), ";
        }
        return $response;
    }
    return "Không tìm thấy sản phẩm phù hợp với '$search_term'.";
}
function HoiLaiKhachHang() {
    return "Sản phẩm bạn yêu cầu không có. Bạn muốn thêm sản phẩm nào khác không?";
}

function chatbot_webhook_callback($request) {
    $data = json_decode($request->get_body(), true);
    $intent = $data['queryResult']['intent']['displayName'];
    $parameters = $data['queryResult']['parameters'];
    $query_text = $data['queryResult']['queryText'] ?? '';

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
            WC()->cart->add_to_cart(product_id: $products[0]->get_id());
            $response = "Đã thêm {$products[0]->get_name()} vào giỏ hàng!";
        } else {
            $response = "Không tìm thấy sản phẩm {$product_name}.";
        }
    } else {
        // Try Gemini for advisory response
        $gemini_response = call_gemini_api($query_text);
        if ($gemini_response !== false) {
            $response = $gemini_response;
        } else {
            // Fallback to Dialogflow default message if Gemini is unavailable
            $response = "Tôi chưa hiểu ý bạn, bạn có thể nói rõ hơn không?";
        }
    }

    return array('fulfillmentText' => $response);
}

function call_gemini_api($query) {
    $gemini_api_key = 'gemini_api_key'; // Replace with your key when online
    $gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $gemini_api_key;
    $prompt = "You are an e-commerce chatbot. Respond with structured commands for the following actions:
        - Product price: 'GIASANPHAM, [product_id]'
        - Add to cart: 'GH, [product_id], [quantity]' or 'GHExcept' if the product is not found
        - Remove from cart: 'XOAGIOHANG, [product_id]'
        - View cart: 'XEMGH'
        - Check order status: 'TRANGTHAIDONHANG, [order_id]'
        - Search products: 'TIMSP, [search_term]'
        For other queries, provide a helpful response. Query: $query";
    $gemini_data = array(
        'contents' => array(
            array(
                'parts' => array(
                    array('text' => $prompt)
                )
            )
        )
    );
    $gemini_args = array(
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($gemini_data),
        'timeout' => 15
    );

    // Mock response for offline testing using real WooCommerce products
    $find_product = function($product_name, $search_by_sku = false) {
        // Trim whitespace
        $product_name = trim($product_name);
    
        if ($search_by_sku) {
            // Direct SKU search
            $products = wc_get_products(array(
                'meta_key' => '_sku',
                'meta_value' => $product_name,
                'limit' => 1,
                'status' => 'publish'
            ));
            if ($products) {
                return $products[0];
            }
            return null;
        }
    
        // Existing name-based search
        $normalized_name = strtolower(str_replace('-', ' ', $product_name));
    
        // First attempt: normalize diacritics (for Vietnamese queries)
        $simple_name = str_replace(
            array('á', 'à', 'ả', 'ã', 'ạ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'đ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'),
            array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'y', 'y', 'y', 'y', 'y'),
            $normalized_name
        );
    
        // Define the filter callback
        $filter_callback = function($where, $wp_query) use ($simple_name) {
            global $wpdb;
            $where .= " AND REPLACE(LOWER({$wpdb->posts}.post_title), 'á', 'a')";
            $where = str_replace(
                array('à', 'ả', 'ã', 'ạ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'đ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'),
                array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'y', 'y', 'y', 'y', 'y'),
                $where
            );
            return $where;
        };
    
        // Add the filter
        add_filter('posts_where', $filter_callback, 10, 2);
    
        $query = new WP_Query(array(
            'post_type' => 'product',
            'post_status' => 'publish',
            's' => $simple_name,
            'posts_per_page' => 1,
            'cache_results' => false,
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_visibility',
                    'field' => 'name',
                    'terms' => array('exclude-from-catalog', 'exclude-from-search'),
                    'operator' => 'NOT IN',
                ),
            ),
        ));
    
        // Remove the filter to avoid affecting other queries
        remove_filter('posts_where', $filter_callback, 10);
    
        if ($query->have_posts()) {
            $query->the_post();
            $product = wc_get_product(get_the_ID());
            if ($product) {
                wp_reset_postdata();
                return $product;
            }
            wp_reset_postdata();
        }
    
        // Second attempt: search by original normalized name
        $products = wc_get_products(array(
            's' => $normalized_name,
            'limit' => 1,
            'status' => 'publish'
        ));
        if ($products) {
            return $products[0];
        }
    
        return null;
    };
// Product Inquiry (e.g., "SP,tên sản phẩm" like "SP,quần", "SP,mã sản phẩm" like "SP,A001", or "áo quần giá bao nhiêu?")
if (stripos($query, 'giá') !== false || stripos($query, 'SP,') === 0) {
    if (stripos($query, 'SP,') === 0) {
        preg_match('/SP,\s*(.+)/', $query, $matches);
        if (!isset($matches[1])) {
            return "Không tìm thấy sản phẩm.";
        }
        $identifier = trim($matches[1]); // Could be tên sản phẩm (e.g., "quần") or mã sản phẩm (e.g., "A001")

        // Check if the identifier looks like an SKU (e.g., starts with a letter followed by numbers)
        if (preg_match('/^[A-Za-z][A-Za-z0-9]*$/', $identifier)) {
            // Treat as SKU (mã sản phẩm)
            $product = $find_product($identifier, true); // Search by SKU
            if ($product) {
                return "GIASANPHAM, {$product->get_id()}";
            }
            return "Không tìm thấy sản phẩm $identifier.";
        } else {
            // Treat as product name (tên sản phẩm)
            $product = $find_product($identifier); // Search by name
            if ($product) {
                return "GIASANPHAM, {$product->get_id()}";
            }
            return "Không tìm thấy sản phẩm $identifier.";
        }
    } else {
        preg_match('/(.+?) giá bao nhiêu/', $query, $matches);
        if (!isset($matches[1])) {
            return "Không tìm thấy sản phẩm.";
        }
        $ten_san_pham = trim($matches[1]); // Tên sản phẩm, e.g., "áo quần"
        $product = $find_product($ten_san_pham);
        if ($product) {
            return "GIASANPHAM, {$product->get_id()}";
        }
        return "Không tìm thấy sản phẩm $ten_san_pham.";
    }
}
    // Add to Cart (e.g., "Thêm áo thun vào giỏ")
    elseif (stripos($query, 'GH,') === 0 || (stripos($query, 'Thêm') !== false && stripos($query, 'giỏ') !== false)) {
        if (stripos($query, 'GH,') === 0) {
            // New format: GH,mã sản phẩm,số lượng (e.g., GH,A001,1)
            preg_match('/GH,\s*([^,]+),\s*(\d+)/', $query, $matches);
            if (!isset($matches[1]) || !isset($matches[2])) {
                return "GHExcept"; // Invalid format
            }
            $sku = trim($matches[1]); // SKU, e.g., "A001"
            $quantity = (int) trim($matches[2]); // Quantity, e.g., 1
            if ($quantity < 1) {
                return "GHExcept"; // Invalid quantity
            }
            $product = $find_product($sku, true); // Search by SKU
            if ($product) {
                return "GH, {$product->get_id()}, $quantity";
            }
            return "GHExcept"; // Product not found
        } else {
            // Existing format: Thêm [tên sản phẩm] vào giỏ
            preg_match('/Thêm (.+?) vào giỏ/', $query, $matches);
            if (!isset($matches[1])) {
                return "Không tìm thấy sản phẩm.";
            }
            $product_name = trim($matches[1]);
            $product = $find_product($product_name);
            if ($product) {
                return "GH, {$product->get_id()}, 1";
            }
            return "GHExcept"; // Simulate product not found
        }
    }
    // Remove from Cart (e.g., "Xóa áo thun khỏi giỏ")
    elseif (stripos($query, 'Xóa') !== false && stripos($query, 'giỏ') !== false) {
        preg_match('/Xóa (.+?) khỏi giỏ/', $query, $matches);
        if (!isset($matches[1])) {
            return "Không tìm thấy sản phẩm.";
        }
        $product_name = trim($matches[1]);
        $product = $find_product($product_name);
        if ($product) {
            return "XOAGIOHANG, {$product->get_id()}";
        }
        return "Không tìm thấy sản phẩm $product_name.";
    }
    // View Cart (e.g., "Xem giỏ hàng")
    elseif (stripos($query, 'Xem giỏ hàng') !== false) {
        return "XEMGH";
    }
    // Order Status (e.g., "Đơn hàng #123")
    elseif (stripos($query, 'Đơn hàng') !== false) {
        preg_match('/Đơn hàng #?(\d+)/', $query, $matches);
        $order_id = $matches[1] ?? '123';
        return "TRANGTHAIDONHANG, $order_id";
    }
    // Product Search (e.g., "Tìm áo thun màu đỏ")
    elseif (stripos($query, 'Tìm') !== false) {
        preg_match('/Tìm (.+)/', $query, $matches);
        if (!isset($matches[1])) {
            return "Không tìm thấy sản phẩm.";
        }
        $search_term = trim($matches[1]);
        return "TIMSP, $search_term";
    }
    // Default response for other queries
    return "Cửa hàng mở từ 9h sáng đến 9h tối.";
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
    error_log('chatbot_handle_json_upload called with old_value: ' . print_r($old_value, true) . ', new_value: ' . print_r($new_value, true));

    // Lưu thông tin $new_value để hiển thị trên giao diện
    set_transient('chatbot_last_new_value', $new_value, 60);

    if (!empty($_FILES['chatbot_service_account_json']['name'])) {
        $file = $_FILES['chatbot_service_account_json'];
        error_log('Uploading file: ' . print_r($file, true));

        // Lưu thông tin $_FILES để hiển thị trên giao diện
        set_transient('chatbot_last_uploaded_file', $file, 60);

        // Kiểm tra lỗi upload từ $_FILES
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $upload_errors = array(
                UPLOAD_ERR_INI_SIZE => 'File vượt quá giới hạn kích thước upload (upload_max_filesize).',
                UPLOAD_ERR_FORM_SIZE => 'File vượt quá giới hạn kích thước form (MAX_FILE_SIZE).',
                UPLOAD_ERR_PARTIAL => 'File chỉ được upload một phần.',
                UPLOAD_ERR_NO_FILE => 'Không có file được upload.',
                UPLOAD_ERR_NO_TMP_DIR => 'Thiếu thư mục tạm để upload.',
                UPLOAD_ERR_CANT_WRITE => 'Không thể ghi file lên đĩa.',
                UPLOAD_ERR_EXTENSION => 'Tiện ích PHP đã chặn upload.'
            );
            $error_message = $upload_errors[$file['error']] ?? 'Lỗi upload không xác định.';
            error_log('Upload error: ' . $error_message);
            add_settings_error('chatbot_settings_group', 'upload_error', $error_message, 'error');
            return $new_value;
        }

        $upload_dir = wp_upload_dir();
        $target_dir = $upload_dir['basedir'] . '/ai-wp-plugin/';
        $target_file = $target_dir . 'service-account.json';

        // Kiểm tra và tạo thư mục
        if (!file_exists($target_dir)) {
            if (!wp_mkdir_p($target_dir)) {
                error_log('Failed to create directory: ' . $target_dir);
                add_settings_error('chatbot_settings_group', 'dir_error', 'Không thể tạo thư mục để lưu file JSON: ' . $target_dir, 'error');
                return $new_value;
            }
        }

        // Kiểm tra quyền ghi của thư mục
        if (!is_writable($target_dir)) {
            error_log('Directory is not writable: ' . $target_dir);
            add_settings_error('chatbot_settings_group', 'dir_permission_error', 'Thư mục ' . $target_dir . ' không có quyền ghi. Vui lòng kiểm tra quyền thư mục.', 'error');
            return $new_value;
        }

        // Thử upload file
        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $new_url = $upload_dir['baseurl'] . '/ai-wp-plugin/service-account.json';
            update_option('chatbot_service_account_json', $new_url);
            error_log('File uploaded successfully. New URL: ' . $new_url);
            add_settings_error('chatbot_settings_group', 'upload_success', 'File JSON đã được upload thành công.', 'success');
        } else {
            error_log('Failed to move uploaded file to: ' . $target_file);
            add_settings_error('chatbot_settings_group', 'upload_error', 'Không thể upload file JSON. Kiểm tra quyền thư mục hoặc cấu hình server.', 'error');
        }
    } else {
        error_log('No file uploaded in $_FILES[chatbot_service_account_json]');
        set_transient('chatbot_last_uploaded_file', 'No file selected', 60);
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
            echo "Last uploaded file info (from \$_FILES):\n";
            print_r(get_transient('chatbot_last_uploaded_file'));
            echo "\nLast new_value:\n";
            print_r(get_transient('chatbot_last_new_value'));
            ?>
        </pre>
    </div>
    <?php
}