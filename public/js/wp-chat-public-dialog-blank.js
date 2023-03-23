(function ($) {
  "use strict";
  const { __, _x, _n, _nx } = wp.i18n;

  jQuery(document).ready(function () {

    jQuery("body").on(
      "click",
      "#wp-chat-window .wp-chat-icon.new",
      function () {
        open_new_dialog_window();
      }
    );
    jQuery("body").on("click", ".create_new_conversation_button", function () {
      open_new_dialog_window();
    });
    let search_users_timeout = null;

    //Searching for users to write to in new dialog box input
    jQuery("body").on(
      "input",
      ".wp-chat-dialog.blank .wp-chat-new-dialog-add-participant-input",
      function () {
        let search = jQuery(this).val();
        clearTimeout(search_users_timeout);
        search_users_timeout = setTimeout(function () {
          $.ajax({
            type: "POST",
            dataType: "json",
            url: wp_chat_datas.ajax_url,
            data: {
              action: "wp_chat_search_users",
              search: search,
            },
            beforeSend: function (jqXHR, settings) {
              let url = settings.url + "?" + settings.data;
              console.log(url);
            },
            success: function (data) {
              console.log(data);
              if (data.success == true) {
                update_user_search_results(data.matches);
              }
            },
            error: function (error) {
              console.error(error);
            },
          });
        }, 500);
      }
    );

    jQuery("body").on(
      "click",
      ".wp-chat-dialog.blank .participant_remove",
      function () {
        $(this).closest(".wp-chat-participant-selected").remove();
      }
    );

    //Updating users matching to input
    function update_user_search_results(matches) {
      var limit = 999;
      jQuery(
        ".wp-chat-dialog.blank .wp-chat-new-dialog-participant-search-results ul"
      ).empty();
      if (matches != null && matches.length > 0) {
        $.each(matches, function (k, v) {
          if (k < limit) {
            jQuery(
              ".wp-chat-dialog.blank .wp-chat-new-dialog-participant-search-results ul"
            ).append(
              '<li class="new_dialog_user_select" data-id="' +
                v.ID +
                '">' +
                v.display_name +
                "</li>"
            );
          }
        });
      }
    }

    jQuery("body").on("click", ".wp-chat-dialog.blank .wp-chat-new-dialog-participant-search-results ul li", function () {
        var participant_id = $(this).data("id");
        var participant_name = $(this).text();
        var participant_html = "";
        participant_html +=
          '<div class="wp-chat-participant-selected" data-id="' +
          participant_id +
          '">';
        participant_html +=
          '<span class="participant_name">' + participant_name + "</span>";
        participant_html +=
          '<span class="participant_remove"><div class="wp-chat-icon close"></div></span>';
        participant_html += "</div>";
        if (
          $(this)
            .closest(".wp-chat-dialog.blank")
            .find(
              '.wp-chat-participants-selected .wp-chat-participant-selected[data-id="' +
                participant_id +
                '"]'
            ).length == 0
        ) {
          $(this)
            .closest(".wp-chat-dialog.blank")
            .find(".wp-chat-participants-selected")
            .append(participant_html);
          $(this)
            .closest(".wp-chat-dialog.blank")
            .find(".wp-chat-new-dialog-add-participant-input")
            .val("");
          $(this)
            .closest(".wp-chat-dialog.blank")
            .find(".wp-chat-new-dialog-participant-search-results ul")
            .empty();
          $(this).remove();
        } else {
          alert(__("This user is already selected.", "wp-chat"));
        }

        /*var user_id = jQuery(this).data('id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_create_room',
						'to': user_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log(url);
					},
					success: function(data) {
						if (data.success == true){
							create_room_box(data);
						}
						else {
							alert(data.message);
							console.warn(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});*/
      }
    );

    jQuery('body').on('click', '.wp-chat-dialog.blank .wp-chat-new-dialog-create-dialog', function(){
        console.log('ici');
        let dialog = jQuery(this).closest('.wp-chat-dialog.blank');
        let room_name = dialog.find('.wp-chat-dialog-title input').val();
        let room_public = dialog.find('input[name="room-public-checkbox"]').is(':checked');
        var participants = [];
        dialog.find('.wp-chat-add-participant-content .wp-chat-participants-selected .wp-chat-participant-selected').each(function(){
            participants.push(jQuery(this).data('id'));
        });
        console.log(room_name, room_public, participants);
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: wp_chat_datas.ajax_url,
            data: {
                'action': 'wp_chat_create_room',
                'participants' : participants,
                'room_name': room_name,
                'room_public': room_public
            },
            beforeSend: function (jqXHR, settings) {
                    let url = settings.url + "?" + settings.data;
                    console.log(url);
            },
            success: function(data) {
                console.log(data);
                if (data.success == true){
                    create_room_box(data);
                }
                else {
                    alert(data.message);
                    console.warn(data.message);
                }
            },
            error: function(error) {
                console.error(error);
            }
        });
    });



  });

  

})(jQuery);

function open_new_dialog_window() {
  jQuery.ajax({
    type: "post",
    url: wp_chat_datas.ajax_url,
    data: {
      action: "wp_chat_get_blank_dialog",
    },
    beforeSend: function (jqXHR, settings) {
      let url = settings.url + "?" + settings.data;
    },
    success: function (data) {
      if (!jQuery(".wp-chat-dialog.blank").length) {
        jQuery("#wp-chat-dialogs").prepend(data);
      }
      jQuery("#wp-chat-window").removeClass("active");
      jQuery(".wp-chat-dialog.blank input").focus();
    },
    error: function (error) {
      console.error(error);
    },
  });
}
