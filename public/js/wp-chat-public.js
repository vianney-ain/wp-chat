(function( $ ) {
	'use strict';

	 	jQuery(document).ready(function(){

			$('body').on('keyup', '#wp-chat-window .wp-chat-search input', function(){
				var rex = new RegExp($(this).val(), 'i');
				$('#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive').hide();
				$('#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive').filter(function () {
						return rex.test($(this).text());
				}).show();
			});

			//Detect click Outstide WP Chat Menu Window
			$(document).click(function(event) {
				var $target = $(event.target);
				if ($target.hasClass('wp-chat-menu-toggler') || $target.hasClass('wp-chat-icon')){
					return;
				}
				if(!$target.closest('#wp-chat-window').length && $('#wp-chat-window').hasClass("active")) {
					wp_chat_toggle_menu_window();
				}
				if (!$target.hasClass('wp-chat-window-archive-actions')){
					jQuery('.wp-chat-window-archive-actions').each(function(){$(this).removeClass('active')});
				}
			});

			$('body').on('click', '#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive .wp-chat-window-archive-actions', function(){
				console.log('Clicking menu');
				if ($(this).hasClass('active')){
					$(this).removeClass('active');
				}
				else {
					$(this).addClass('active');
				}
			});

			//Click on WP Chat Menu Toggler
			jQuery('body').on('click','.wp-chat-menu-toggler', function(){
				wp_chat_toggle_menu_window();
			});

			//Click on WP Chat Close Menu Icon
			jQuery('body').on('click','.wp-chat-window-close', function(){
				wp_chat_toggle_menu_window();
			});

			//Click on WP Chat Dialog Box Close Icon
			jQuery('body').on('click','.wp-chat-dialog-header-action.close-dialog', function(){
				jQuery(this).closest('.wp-chat-dialog').remove();
			});

			//Click on WP Chat Dialog Box Reduce Icon
			jQuery('body').on('click','.wp-chat-dialog-header-action.reduce-dialog', function(){
				jQuery(this).closest('.wp-chat-dialog').addClass('reduced');
				jQuery(this).closest('.wp-chat-dialog').appendTo('#wp-chat-menu-archives');
			});

			//Click on WP Chat Dialog Box Reduced Thumbnail
			jQuery('body').on('click','.wp-chat-dialog.reduced', function(){
				var room_id = jQuery(this).attr('data-room-id');
				jQuery(this).removeClass('reduced');
				jQuery(this).prependTo('#wp-chat-dialogs');
				jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content').scrollTop(jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content')[0].scrollHeight);
			});

			jQuery('body').on('click', '.wp-chat-window-archives-menu .wp-chat-window-archives-menu-item', function(){
				let section = $(this).data('section');
				$('.wp-chat-window-archives-menu .wp-chat-window-archives-menu-item').each(function(){
					$(this).removeClass('active');
				});
				$(this).addClass('active');
				wp_chat_filter_archives();
			});

			/*** FUNCTIONS ***/
			function wp_chat_filter_archives(){
				var section = 'own';
				$('#wp-chat-window .wp-chat-window-archives-menu .wp-chat-window-archives-menu-item').each(function(){
					if ($(this).hasClass('active')){
						section = $(this).data('section');
					}
				});
				$('#wp-chat-window .wp-chat-window-archives ul li.wp-chat-window-archive').each(function(){
					if ($(this).hasClass('wp-chat-empty-archive')){
						return;
					}
					if ($(this).data('room-section') == section){
						$(this).show();
					}
					else {
						$(this).hide();
					}
				});
			}

			function wp_chat_toggle_menu_window(){
			  if (!jQuery('#wp-chat-window').length){
			    console.warn('WP Chat Windows is not enabled');
			    return false;
			  }
			  if (jQuery('#wp-chat-window').hasClass('active')){
			    jQuery('#wp-chat-window').removeClass('active');
			  }
			  else {
			    jQuery('#wp-chat-window').addClass('active');
			  }
			}

			jQuery('body').on('click', '#wp-chat-window .wp-chat-icon.new', function(){
				open_new_dialog_window();
			});
			jQuery('body').on('click', '.create_new_conversation_button', function(){
				open_new_dialog_window();
			});

			function open_new_dialog_window(){
				$.ajax({
					type: 'post',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_get_blank_dialog'
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (!jQuery('.wp-chat-dialog.blank').length){
							jQuery('#wp-chat-dialogs').prepend(data);
						}
						jQuery('#wp-chat-window').removeClass('active');
						jQuery('.wp-chat-dialog.blank input').focus();
					},
					error: function(error) {
						console.error(error);
					}
				});
			}

			let search_users_timeout = null;

			//Searching for users to write to in new dialog box input
			jQuery('body').on('input', '.wp-chat-dialog.blank .new_dialog_search_input', function(){
				let search = jQuery(this).val();
				clearTimeout(search_users_timeout);
				search_users_timeout = setTimeout(function(){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: wp_chat_ajax.ajax_url,
						data: {
							'action': 'wp_chat_search_users',
							'search': search
						},
						beforeSend: function (jqXHR, settings) {
								let url = settings.url + "?" + settings.data;
						},
						success: function(data) {
							if (data.success == true){
								update_user_search_results(data.matches);
							}
						},
						error: function(error) {
							console.error(error);
						}
					});
				}, 500);
			});

			//Updating users matching to input
			function update_user_search_results(matches){
				var limit = 5;
				jQuery('.wp-chat-dialog.blank .dialog_search_results ul').empty();
				if (matches != null && matches.length > 0 ){
					$.each(matches, function (k, v){
						if (k < 5){
							jQuery('.wp-chat-dialog.blank .dialog_search_results ul').append('<li class="new_dialog_user_select" data-id="'+v.ID+'">'+v.display_name+'</li>');
						}
					});
				}
			}

			jQuery('body').on('click', '.wp-chat-dialog.blank .dialog_search_results ul li', function(){
				var user_id = jQuery(this).data('id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
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
				});
			});

			function create_empty_room(room_id){
				let html = '<div class="wp-chat-dialog" data-room-id="'+room_id+'"><div class="wp-chat-dialog-reduced"> <img src="'+wp_chat_ajax.default_img+'" alt=""> </div><div class="wp-chat-dialog-header"> <div class="wp-chat-dialog-thumbnail"> <img src="'+wp_chat_ajax.default_img+'" alt=""> </div><div class="wp-chat-dialog-title">Conversation sans nom</div><div class="wp-chat-dialog-header-actions"> <div class="wp-chat-dialog-header-action reduce-dialog"> <div class="wp-chat-icon reduce"></div></div><div class="wp-chat-dialog-header-action close-dialog"> <div class="wp-chat-icon close"></div></div></div></div><div class="wp-chat-dialog-content"></div><div class="wp-chat-dialog-footer"> <input type="text"> <div class="send-btn"> <div class="wp-chat-icon send"></div></div></div></div>';
				jQuery('#wp-chat-dialogs').prepend(html);
				listenForScrollEvent($(".wp-chat-dialog[data-room-id="+room_id+"] .wp-chat-dialog-content"));
			}

			function update_room_informations(room){
				if (room.room_id){
					if (room.room_thumbnails.length > 1){
						jQuery('.wp-chat-dialog[data-room-id='+room.room_id+']').find('.wp-chat-dialog-header .wp-chat-dialog-thumbnail').addClass('grouped');
					}
					jQuery('.wp-chat-dialog[data-room-id='+room.room_id+']').find('.wp-chat-dialog-header .wp-chat-dialog-thumbnail').empty();
					jQuery('.wp-chat-dialog[data-room-id='+room.room_id+']').find('.wp-chat-dialog-header .wp-chat-dialog-thumbnail').append(display_room_thumbnail(room.room_id, room.room_thumbnails));
					jQuery('.wp-chat-dialog[data-room-id='+room.room_id+']').find('.wp-chat-dialog-header .wp-chat-dialog-title').text(room.room_name);
					jQuery('.wp-chat-dialog[data-room-id='+room.room_id+']').find('.wp-chat-dialog-header .wp-chat-dialog-title').attr('title', room.room_fullname);
				}
			}

			function update_room_messages(room_id, messages){
				if (room_id){
					jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content').empty().append(messages);
					//scroll back to bottom
					jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content').scrollTop(jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content')[0].scrollHeight);
				}
			}

			function format_messages(messages){
				var messages_html = '';
				if (messages){
					$.each(messages, function(key, val){
						if (val.type == ''){
							//self
							if (val.userID == wp_chat_ajax.user_id){
								messages_html += '<div class="wp-chat-message self"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
							}
							//other participants
							else {
								messages_html += '<div class="wp-chat-message"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
							}
						}
						else if (val.type=='system'){
							messages_html += '<div class="wp-chat-message system"><div class="wp-chat-message-content"><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
						}

					});
				}
				return messages_html;
			}

			function create_room_box(data){
				var room_open = false;
				var room_reduced = false;
				jQuery('body').find('.wp-chat-dialog').each(function(){
					if (jQuery(this).attr('data-room-id') == data.room_id){
						room_open = true;
						if (jQuery(this).hasClass('reduced')){
							room_reduced = true;
						}
					}
				});

				if (room_open){
					if (room_reduced) {
						var room = jQuery('.wp-chat-dialog[data-room-id='+data.room_id+']');
						room.removeClass('reduced');
						room.prependTo('#wp-chat-dialogs');
					}
				}
				else {
					jQuery('.wp-chat-dialog.blank').remove();
					create_empty_room(data.room_id);
					update_room_informations(data);
					update_room_messages(data.room_id, format_messages(data.messages));
				}

			}

			jQuery('body').on('keypress', '.wp-chat-dialog .wp-chat-dialog-footer input', function(event){
				var that = jQuery(this);
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					var room_id = jQuery(this).closest('.wp-chat-dialog').data('room-id');
					var message = jQuery(this).closest('.wp-chat-dialog').find('.wp-chat-dialog-footer input').val();
					that.closest('.wp-chat-dialog').find('.wp-chat-dialog-footer input').val('');
					send_message(room_id, message);
				}
			});

			jQuery('body').on('click', '.wp-chat-dialog .wp-chat-dialog-footer .send-btn', function(){
				var that = jQuery(this);
				var room_id = jQuery(this).closest('.wp-chat-dialog').data('room-id');
				var message = jQuery(this).closest('.wp-chat-dialog').find('.wp-chat-dialog-footer input').val();
				that.closest('.wp-chat-dialog').find('.wp-chat-dialog-footer input').val('');
				send_message(room_id, message);
			});

			function send_message(room_id, message){
				if (message.trim() != ''){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: wp_chat_ajax.ajax_url,
						data: {
							'action': 'wp_chat_send_message',
							'room': room_id,
							'message': message
						},
						beforeSend: function (jqXHR, settings) {
								let url = settings.url + "?" + settings.data;
						},
						success: function(data) {
							if (data.success == true){
								refresh_view();
								return true;
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
				}
			}



			var refresh_room_interval = setInterval(function(){
				refresh_view();
			}, 1000);
			refresh_view();

			function refresh_view(){
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_refresh_view',
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							refresh_chat_window(data.content);
							refresh_chat_dialogs(data.content);
							wp_chat_filter_archives();
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
				jQuery('#wp-chat-dialogs .wp-chat-dialog').each(function(){
					if (jQuery(this).attr('data-room-id') != '' && jQuery(this).attr('data-room-id') != null){

					}
				});
			}

			function refresh_chat_dialogs(data){
				jQuery('body').find('.wp-chat-dialog').each(function(){

					var that = jQuery(this);
					var room_id = jQuery(this).data('room-id');
					if (room_id == undefined){
						return;
					}
					that.find('.wp-chat-dialog-content').empty();
					that.find('.wp-chat-dialog-title').empty();
					that.find('.wp-chat-dialog-thumbnail').removeClass('grouped').empty();
					$.each(data, function (key, room){
						if (room.room_id == room_id){
							if (!room.is_user_in){
								that.remove();
								return;
							}
							if (room.room_thumbnails.length > 1){ that.find('.wp-chat-dialog-thumbnail').addClass('grouped'); }
							that.find('.wp-chat-dialog-thumbnail').append(display_room_thumbnail(room.room_id, room.room_thumbnails));
							that.find('.wp-chat-dialog-title').text(room.room_name);
							that.find('.wp-chat-dialog-title').attr('title', room.room_fullname);
							var messages = '';
							$.each(room.messages, function (mk, val){
								if (val.type != 'system'){
									if (val.userID == wp_chat_ajax.user_id){
										messages += '<div class="wp-chat-message self"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
									}
									else {
										messages += '<div class="wp-chat-message"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
									}
								}
								else {
									messages += '<div class="wp-chat-message system"><div class="wp-chat-message-content"><div class="wp-chat-message-text">'+val.message+'</div></div></div></div>';
								}

							});
							that.find('.wp-chat-dialog-content').append(messages);
							that.addClass('updated');
						}
					});
					if (!that.hasClass('scrolling')){
						that.find('.wp-chat-dialog-content').scrollTop(that.find('.wp-chat-dialog-content')[0].scrollHeight);
					}

					if (!that.hasClass('updated')){
						that.remove();
					}
					that.removeClass('updated');
				});

			}

			function refresh_chat_window(data){
				if (!data) return;
				if (jQuery('#wp-chat-window').length == 0) return;
				//jQuery('#wp-chat-window').find('.wp-chat-window-archives ul').empty();
				$.each(data, function (key, room){
					jQuery('#wp-chat-window .wp-chat-window-archives .wp-chat-empty-archive').remove();
					//if room has been loaded already
					if ($('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').length > 0){
						var room_status_label = '';
						var room_status_class = '';
						if (room.public == '1'){
							room_status_label = 'publique';
							room_status_class = 'public';
						}
						if (room.archived == '1'){
							room_status_label = 'archivée';
							room_status_class = 'archived';
						}
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').addClass('updated');

						var room_section = 'general';
						if (room.is_user_in){
							room_section = 'own';
						}
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').data('room-section', room_section);

						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').data('room-last-message', room.last_message);

						var group = '';
						if (room.room_thumbnails.length > 1){
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-avatar').addClass('grouped');
						}
						else {
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-avatar').removeClass('grouped');
						}
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-avatar').empty().append(display_room_thumbnail(room.room_id, room.room_thumbnails));
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-content .wp-chat-window-archive-title').text(room.room_name);
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-content .wp-chat-window-archive-title').attr('title', room.room_fullname);

						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-content .wp-chat-window-archive-title').append('<span class="wp-chat-window-archive-status '+room_status_class+'">'+room_status_label+'</span>');

						var message = '';
						if (room.messages[room.messages.length - 1].message.length > wp_chat_ajax.text_extract_length){
							message = room.messages[room.messages.length - 1].message.substring(0,wp_chat_ajax.text_extract_length)+'...';
						}
						else {
							message = room.messages[room.messages.length - 1].message;
						}
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+'] .wp-chat-window-archive-content .wp-chat-window-archive-last-comment').text(message);
					}
					//if not loaded, we create the layout
					else {
						if (room.messages.length > 0){
							var group = '';
							if (room.room_thumbnails.length > 1){
								group = 'grouped';
							}
							var message = '';
							if (room.messages[room.messages.length - 1].message.length > wp_chat_ajax.text_extract_length){
								message = room.messages[room.messages.length - 1].message.substring(0,wp_chat_ajax.text_extract_length)+'...';
							}
							else {
								message = room.messages[room.messages.length - 1].message;
							}
							var room_status_label = '';
							var room_status_class = '';
							if (room.public == '1'){
								room_status_label = 'publique';
								room_status_class = 'public';
							}
							if (room.archived == '1'){
								room_status_label = 'archivée';
								room_status_class = 'archived';
							}
							var room_section = 'general';
							if (room.is_user_in){
								room_section = 'own';
							}
							jQuery('#wp-chat-window').find('.wp-chat-window-archives>ul').append('<li class="wp-chat-window-archive updated" data-room-id="'+room.room_id+'" data-room-last-message="'+room.last_message+'" data-room-section="'+room_section+'"><div class="wp-chat-window-archive-avatar '+group+'">'+display_room_thumbnail(room.room_id, room.room_thumbnails)+'</div><div class="wp-chat-window-archive-content"><div class="wp-chat-window-archive-title" title="'+room.room_fullname+'">'+room.room_name+'<span class="wp-chat-window-archive-status '+room_status_class+'">'+room_status_label+'</span></div><div class="wp-chat-window-archive-last-comment">'+message+'</div></div><div class="wp-chat-window-archive-actions"><div class="wp-chat-icon dots-v"></div><ul><li class="wp-chat-window-archive-action leave-room-action">Quitter la conversation</li></ul></div></li>');
						}
					}
				});
				$('#wp-chat-window').find('.wp-chat-window-archive').each(function(){
					if (!$(this).hasClass('updated')){
						$(this).remove();
					}
					$(this).removeClass('updated');
				});
				wp_chat_order_archives_list();
			}

			function wp_chat_order_archives_list(){
				$('#wp-chat-window .wp-chat-window-archives>ul .wp-chat-window-archive').sort(function(a, b) {
					var upA = $(a).data('room-last-message');
					var upB = $(b).data('room-last-message');
					return (upA > upB) ? -1 : (upA < upB) ? 1 : 0;
				}).appendTo('#wp-chat-window .wp-chat-window-archives>ul');
			}


			$('body').on('click', '#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive .wp-chat-window-archive-actions li.leave-room-action', function(){
				let room_id = $(this).closest('.wp-chat-window-archive').attr('data-room-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_leave_room',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log(url);
					},
					success: function(data) {
						if (data.success == true){
							refresh_view();
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

			function display_room_thumbnail(room_id, thumbnails){
				var thumbnails_html = '<div class="wp-chat-room-thumbnail-image"><img src="'+wp_chat_ajax.default_img+'" alt=""></div>';
				if (thumbnails != undefined && thumbnails.length > 0){
					thumbnails_html = '';
					$.each(thumbnails, function(key, val){
						thumbnails_html += '<div class="wp-chat-room-thumbnail-image"><img src="'+val+'" alt=""></div>';

					});
				}
				return thumbnails_html;
			}

			jQuery('body').on('click', '#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive', function(event){
				var $target = $(event.target);
				if ($target.hasClass('wp-chat-window-archive-actions') || $target.hasClass('wp-chat-window-archive-action') || $target.parent().hasClass('wp-chat-window-archive-actions')){
					return;
				}
				var room_id = jQuery(this).closest('.wp-chat-window-archive').attr('data-room-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_open_room',
						'room_id': room_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
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
				});
			});


			$("body").on("dialog-scroll", ".wp-chat-dialog-content", function(){
					if ($(this).height() + $(this).scrollTop()+50 > $(this)[0].scrollHeight){
						$(this).closest('.wp-chat-dialog').removeClass('scrolling');
					}
					else {
						$(this).closest('.wp-chat-dialog').addClass('scrolling');
					}

					if ($(this).scrollTop() == 0){
						//TODO - load more messages
					}
			});

			function listenForScrollEvent(el){
			    el.on("scroll", function(){
			        el.trigger("dialog-scroll");
			    });
			}

			$('body').on('click', '.wp-chat-dialog .wp-chat-dialog-thumbnail', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				show_manage_participant_popup(room_id);
			});

			function show_manage_participant_popup(room_id){
				$.ajax({
					type: 'post',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_get_participant_popup'
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log('url');
					},
					success: function(data) {
						$('.wp-chat-dialog[data-room-id='+room_id+']').append(data);
						update_room_participants_list_view(room_id);
					},
					error: function(error) {
						console.error(error);
					}
				});
			}

			function update_room_participants_list_view(room_id){
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_get_room_participants',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
						 $('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-participants').find('.wp-chat-dialog-popup-participants-list').empty();
						 if (data.participants && data.participants.length > 0){
							 $.each(data.participants, function (key, participant){
								 if (data.isOwner){
									 if (participant.owner){
										 $('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-participants').find('.wp-chat-dialog-popup-participants-list').append('<li class="wp-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="ownership"><div class="wp-chat-icon crown icon-blue"></div></div></li>');
									 }
									 else {
										 $('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-participants').find('.wp-chat-dialog-popup-participants-list').append('<li class="wp-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="delete"><div class="wp-chat-icon close"></div></div></li>');
									 }

								 }
								 else {
									 if (participant.owner){
											$('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-participants').find('.wp-chat-dialog-popup-participants-list').append('<li class="wp-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="ownership"><div class="wp-chat-icon crown icon-blue"></div></div></li>');
									 }
									 else {
	 									 	$('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-participants').find('.wp-chat-dialog-popup-participants-list').append('<li class="wp-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span></li>');
									 }
								 }
							 });
						 }
						 refresh_view();
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
			}

			$('body').on('click', '.wp-chat-dialog-popup .close-popup', function(){
				jQuery(this).closest('.wp-chat-dialog-popup').remove();
			});

			$('body').on('click', '.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-participant .delete', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				var participant_id = $(this).closest('.wp-chat-dialog-popup-participant').attr('data-participant-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_remove_room_participant',
						'room_id': room_id,
						'removed_user_id': participant_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log(url);
					},
					success: function(data) {
						if (data.success == true){
							update_room_participants_list_view(room_id);
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


			let search_participants_timeout = null;
			jQuery('body').on('input', '.wp-chat-dialog .wp-chat-dialog-popup.popup-participants .wp-chat-add-participant-input', function(){
				let search = jQuery(this).val();
				clearTimeout(search_participants_timeout);
				search_participants_timeout = setTimeout(function(){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: wp_chat_ajax.ajax_url,
						data: {
							'action': 'wp_chat_search_participant',
							'search': search
						},
						beforeSend: function (jqXHR, settings) {
								let url = settings.url + "?" + settings.data;
						},
						success: function(data) {
							if (data.success == true){
								update_participant_search_results(data.matches)
							}
						},
						error: function(error) {
							console.error(error);
						}
					});
				}, 500);
			});

			//Updating users matching to input
			function update_participant_search_results(matches){
				var limit = 5;
				if (jQuery('.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer .participants_search_results').length > 0){
					jQuery('.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer .participants_search_results').remove();
				}
				jQuery('.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer').append('<div class="participants_search_results"><ul></ul></div>');
				if (matches != null && matches.length > 0 ){
					$.each(matches, function (k, v){
						if (k < 5){
							jQuery('.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer .participants_search_results ul').append('<li class="new_participant_select" data-id="'+v.ID+'">'+v.display_name+'</li>');
						}
					});
				}
			}

			$('body').on('click', '.wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer .participants_search_results ul li', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				var user_id = $(this).attr('data-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_add_room_participant',
						'room_id': room_id,
						'added_user_id': user_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							$('.wp-chat-dialog[data-room-id='+room_id+'] .wp-chat-dialog-popup.popup-participants .wp-chat-add-participant-input').val('');
							$('.wp-chat-dialog[data-room-id='+room_id+'] .wp-chat-dialog-popup.popup-participants .wp-chat-dialog-popup-footer .participants_search_results').remove();
							update_room_participants_list_view(room_id);
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

			$('body').on('click', '.wp-chat-dialog .wp-chat-dialog-title', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				show_room_details_popup(room_id);
			});

			function show_room_details_popup(room_id){
				$.ajax({
					type: 'post',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_get_room_details_popup'
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						$('.wp-chat-dialog[data-room-id='+room_id+']').append(data);
						update_room_details_view(room_id);
					},
					error: function(error) {
						console.error(error);
					}
				});
			}

			function update_room_details_view(room_id){
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_get_room_details',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log(url);
					},
					success: function(data) {
						console.log(data);
						if (data.success == true){
							jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room .wp-chat-dialog-popup-title input').val(data.room.name);
							if (data.room.public == "1"){
								jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-public-checkbox"]').prop( "checked", true );
							}
							if (data.room.archived == "1"){
								jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-archived-checkbox"]').prop( "checked", true );
							}
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
			}


			jQuery('body').on('click', '.wp-chat-dialog-popup.popup-room .wp-chat-dialog-popup-footer button', function(){
				let room_id = jQuery(this).closest('.wp-chat-dialog').attr('data-room-id');
				let room_name = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room .wp-chat-dialog-popup-title input').val();
				let public_checkbox = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-public-checkbox"]').is(':checked');
				let archived_checkbox = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-archived-checkbox"]').is(':checked');
				console.log(public_checkbox);
				edit_room_details(room_id, room_name, public_checkbox, archived_checkbox);
			});

			jQuery('body').on('keypress', '.wp-chat-dialog-popup.popup-room .wp-chat-dialog-popup-title input', function(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					let room_id = jQuery(this).closest('.wp-chat-dialog').data('room-id');
					let room_name = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room .wp-chat-dialog-popup-title input').val();
					let public_checkbox = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-public-checkbox"]').is(':checked');
					let archived_checkbox = jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room input[name="room-archived-checkbox"]').is(':checked');
					edit_room_details(room_id, room_name, public_checkbox, archived_checkbox);
				}
			});

			function edit_room_details(room_id, room_name, public_checkbox, archived_checkbox){
				if (!room_id){
					console.warn('Warn room cannot be found.');
					return;
				}
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_ajax.ajax_url,
					data: {
						'action': 'wp_chat_edit_room_details',
						'room_name': room_name,
						'room_id': room_id,
						'public': public_checkbox,
						'archived': archived_checkbox
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
							console.log(url);
					},
					success: function(data) {
						console.log(data);
						if (data.success == true){
							refresh_view();
							jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room').remove();
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
			}


		});
})( jQuery );
