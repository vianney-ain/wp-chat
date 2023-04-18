(function ($) {
  "use strict";
  const { __, _x, _n, _nx } = wp.i18n;

  jQuery(document).ready(function () {

    jQuery("body").on(
      "click",
      "#index-chat-window .index-chat-icon.new",
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
      ".index-chat-dialog.blank .index-chat-new-dialog-add-participant-input",
      function () {
        let search = jQuery(this).val();
        clearTimeout(search_users_timeout);
        search_users_timeout = setTimeout(function () {
          $.ajax({
            type: "POST",
            dataType: "json",
            url: index_chat_datas.ajax_url,
            data: {
              action: "index_chat_search_users",
              search: search,
            },
            beforeSend: function (jqXHR, settings) {
              let url = settings.url + "?" + settings.data;
            },
            success: function (data) {
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
      ".index-chat-dialog.blank .participant_remove",
      function () {
        $(this).closest(".index-chat-participant-selected").remove();
      }
    );

    //Updating users matching to input
    function update_user_search_results(matches) {
      var limit = 999;
      jQuery(
        ".index-chat-dialog.blank .index-chat-new-dialog-participant-search-results ul"
      ).empty();
      if (matches != null && matches.length > 0) {
        $.each(matches, function (k, v) {
          if (k < limit) {
            jQuery(
              ".index-chat-dialog.blank .index-chat-new-dialog-participant-search-results ul"
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

    jQuery("body").on("click", ".index-chat-dialog.blank .index-chat-new-dialog-participant-search-results ul li", function () {
        var participant_id = $(this).data("id");
        var participant_name = $(this).text();
        var participant_html = "";
        participant_html +=
          '<div class="index-chat-participant-selected" data-id="' +
          participant_id +
          '">';
        participant_html +=
          '<span class="participant_name">' + participant_name + "</span>";
        participant_html +=
          '<span class="participant_remove"><div class="index-chat-icon close"></div></span>';
        participant_html += "</div>";
        if (
          $(this)
            .closest(".index-chat-dialog.blank")
            .find(
              '.index-chat-participants-selected .index-chat-participant-selected[data-id="' +
                participant_id +
                '"]'
            ).length == 0
        ) {
          $(this)
            .closest(".index-chat-dialog.blank")
            .find(".index-chat-participants-selected")
            .append(participant_html);
          $(this)
            .closest(".index-chat-dialog.blank")
            .find(".index-chat-new-dialog-add-participant-input")
            .val("");
          $(this)
            .closest(".index-chat-dialog.blank")
            .find(".index-chat-new-dialog-participant-search-results ul")
            .empty();
          $(this).remove();
        } else {
          alert(__("This user is already selected.", "index-chat"));
        }
      }
    );

    jQuery('body').on('click', '.index-chat-dialog.blank .index-chat-new-dialog-create-dialog', function(){
        let dialog = jQuery(this).closest('.index-chat-dialog.blank');
        let room_name = dialog.find('.index-chat-dialog-title input').val();
        let room_public = dialog.find('input[name="room-public-checkbox"]').is(':checked');
        var participants = [];
        dialog.find('.index-chat-add-participant-content .index-chat-participants-selected .index-chat-participant-selected').each(function(){
            participants.push(jQuery(this).data('id'));
        });
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: index_chat_datas.ajax_url,
            data: {
                'action': 'index_chat_create_room',
                'participants' : participants,
                'room_name': room_name,
                'room_public': room_public
            },
            beforeSend: function (jqXHR, settings) {
                    let url = settings.url + "?" + settings.data;
            },
            success: function(data) {
                if (data.success == true){
                    jQuery('.index-chat-dialog.blank').remove();
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
    url: index_chat_datas.ajax_url,
    data: {
      action: "index_chat_get_blank_dialog",
    },
    beforeSend: function (jqXHR, settings) {
      let url = settings.url + "?" + settings.data;
    },
    success: function (data) {
      if (!jQuery(".index-chat-dialog.blank").length) {
        jQuery("#index-chat-dialogs").prepend(data);
      }
      jQuery("#index-chat-window").removeClass("active");
      jQuery(".index-chat-dialog.blank input").focus();
    },
    error: function (error) {
      console.error(error);
    },
  });
}
