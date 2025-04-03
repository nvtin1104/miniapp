jQuery(document).ready(function($) {
    // Xử lý sự kiện khi người dùng nhấn nút "Gửi"
    $('#chatbot-send').on('click', function() {
        var userMessage = $('#chatbot-input').val().trim();

        if (userMessage === '') {
            return; // Không gửi nếu input rỗng
        }

        // Hiển thị tin nhắn của người dùng
        $('#chatbot-messages').append('<div class="user-message">' + userMessage + '</div>');

        // Xóa input sau khi gửi
        $('#chatbot-input').val('');

        // Gửi request AJAX tới server
        $.ajax({
            url: chatbotAjax.ajaxurl, // URL AJAX được localize từ PHP
            type: 'POST',
            data: {
                action: 'chatbot_question', // Tên action để gọi hàm chatbot_handle_question
                question: userMessage // Câu hỏi của người dùng
            },
            success: function(response) {
                // Parse JSON phản hồi
                var data = JSON.parse(response);
                var botResponse = data.response;

                // Hiển thị phản hồi của chatbot
                $('#chatbot-messages').append('<div class="bot-message">' + botResponse + '</div>');

                // Cuộn xuống tin nhắn mới nhất
                $('#chatbot-messages').scrollTop($('#chatbot-messages')[0].scrollHeight);
            },
            error: function(xhr, status, error) {
                // Hiển thị thông báo lỗi nếu AJAX thất bại
                $('#chatbot-messages').append('<div class="bot-message error">Có lỗi xảy ra: ' + error + '</div>');
                $('#chatbot-messages').scrollTop($('#chatbot-messages')[0].scrollHeight);
            }
        });
    });

    // Cho phép gửi tin nhắn bằng phím Enter
    $('#chatbot-input').on('keypress', function(e) {
        if (e.which === 13) { // Phím Enter
            $('#chatbot-send').click();
        }
    });
});