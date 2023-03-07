
function do_ajax_call(data, type, datatype = null){
  $.ajax({
    type: type,
    dataType: datatype,
    url: wp_chat_ajax.ajax_url,
    data: data,
    beforeSend: function (jqXHR, settings) {
        let url = settings.url + "?" + settings.data;
        console.log(url);
    },
    success: function(data) {
      console.log(data);
      if (data.success == true){
        return data;
      }
      else {
        alert(data.message);
        console.warn(data.message);
      }
    },
    error: function(error) {
      console.err(error);
    }
  });
}

function create_room_box(data){
  var room_open = false;
  jQuery('body').find('.wp-chat-dialog').each(function(){
    if (jQuery(this).attr('data-room-id') == data.room_id){
      room_open = true;
    }
  });
  if (room_open) return;

  var messages = '';
  $.each(data.messages, function(key, val){
    if (val.userID == wp_chat_ajax.user_id){
      messages += '<div class="wp-chat-message self"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
    }
    else {
      messages += '<div class="wp-chat-message"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
    }
  });
  jQuery('.wp-chat-dialog.blank').remove();
  create_empty_dialog(data.room_id);
  /*let html = '<div class="wp-chat-dialog" data-room-id="'+data.room_id+'"><div class="wp-chat-dialog-reduced"> <img src="'+data.room_thumbnail+'" alt=""> </div><div class="wp-chat-dialog-header"> <div class="wp-chat-dialog-thumbnail"> <img src="'+data.room_thumbnail+'" alt=""> </div><div class="wp-chat-dialog-title">'+data.room_name+'</div><div class="wp-chat-dialog-header-actions"> <div class="wp-chat-dialog-header-action reduce-dialog"> <div class="wp-chat-icon reduce"></div></div><div class="wp-chat-dialog-header-action close-dialog"> <div class="wp-chat-icon close"></div></div></div></div><div class="wp-chat-dialog-content">'+messages+'</div><div class="wp-chat-dialog-footer"> <input type="text"> <div class="send-btn"> <div class="wp-chat-icon send"></div></div></div></div>';
  jQuery('#wp-chat-dialogs').prepend(html);*/
  jQuery('.wp-chat-dialog[data-room-id='+data.room_id+']').find('.wp-chat-dialog-content').scrollTop(jQuery('.wp-chat-dialog[data-room-id='+data.room_id+']').find('.wp-chat-dialog-content')[0].scrollHeight);
}
