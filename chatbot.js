jQuery(document).ready(function($) {
    $('#chatbot-send').on('click', function() {
        sendMessage();
    });

    $('#chatbot-input').on('keypress', function(e) {
        if (e.which == 13) { // Nhấn Enter
            sendMessage();
        }
    });

    function sendMessage() {
        let message = $('#chatbot-input').val();
        if (message.trim() === '') return;

        $('#chatbot-messages').append('<p class="user-message">Bạn: ' + message + '</p>');
        $('#chatbot-input').val('');

        $.ajax({
            url: chatbotAjax.ajaxurl,
            method: 'POST',
            data: {
                action: 'chatbot_question',
                question: message
            },
            success: function(response) {
                let data = JSON.parse(response);
                $('#chatbot-messages').append('<p class="bot-message">Bot: ' + data.response + '</p>');
                $('#chatbot-messages').scrollTop($('#chatbot-messages')[0].scrollHeight);
            },
            error: function() {
                $('#chatbot-messages').append('<p class="bot-message">Bot: Có lỗi xảy ra, vui lòng thử lại.</p>');
            }
        });
    }
});