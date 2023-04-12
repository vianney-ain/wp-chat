(function( $ ) {
	'use strict';
	const { __, _x, _n, _nx } = wp.i18n;

	var isTabActive = true;

	window.onfocus = function () { 
		isTabActive = true; 
	  }; 
	  
	window.onblur = function () { 
	isTabActive = false; 
	}; 
	  

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
				if(!$target.closest('#wp-chat-window').length && $('#wp-chat-window').hasClass("active") && !$target.hasClass('wp-chat-menu-btn')) {
					wp_chat_toggle_menu_window();
				}
				if (!$target.hasClass('wp-chat-window-archive-actions')){
					jQuery('.wp-chat-window-archive-actions').each(function(){$(this).removeClass('active')});
				}
			});

			$('body').on('click', '#wp-chat-window .wp-chat-window-archives .wp-chat-window-archive .wp-chat-window-archive-actions', function(){
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
				$('.wp-chat-window-archives .wp-chat-window-archives-section').each(function(){
					$(this).removeClass('active');
					if ($(this).data('section') == section){
						$(this).addClass('active');
					}
				});
			});
	

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
						url: wp_chat_datas.ajax_url,
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
								refresh_view(function(response){});
								return true;
							}
							else {
								console.warn(data.message);
								alert(data.message);
							}
						},
						error: function(error) {
							console.error(error);
						}
					});
				}
			}

			function get_active_rooms(){
				var rooms = [];

				jQuery('.wp-chat-window-archive').each(function(){
					var room = {
						id : jQuery(this).data('room-id'),
						is_open : false,
						offset : 0,
						is_active : false,
					};

					if (jQuery('.wp-chat-dialog[data-room-id="'+room['id']+'"]').length > 0){
						room.is_open = true;
						room.offset = jQuery('.wp-chat-dialog[data-room-id="'+room['id']+'"]').data('room-offset');
						if (!jQuery('.wp-chat-dialog[data-room-id="'+room['id']+'"]').hasClass('scrolling') && 
							!jQuery('.wp-chat-dialog[data-room-id="'+room['id']+'"]').hasClass('reduced') && 
							isTabActive ){
							room.is_active = true;
						}
					}

					rooms.push(room);
				});

				return rooms;
			}

			if (wp_chat_datas.wp_chat_options['wp-chat-disable-ajax-checkbox'] != '1'){
				var refresh_room_interval = setInterval(function(){
					refresh_view(function(response){});
				}, wp_chat_datas.wp_chat_options['wp-chat-refresh-rate-input']);
			}
			refresh_view(function(response){});
			
			function refresh_view(refreshCallback){
				var rooms = get_active_rooms();
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_refresh_view',
						'rooms': rooms
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							refresh_chat_window(data.content);
							refresh_chat_dialogs(data.content);
							refreshCallback(true);
						}
						else {
							console.error(data.message);
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
									if (val.userID == wp_chat_datas.user_id){
										messages += '<div data-id="'+val.id+'" class="wp-chat-message self"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
									}
									else {
										messages += '<div data-id="'+val.id+'" class="wp-chat-message"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
									}
								}
								else {
									messages += '<div data-id="'+val.id+'" class="wp-chat-message system"><div class="wp-chat-message-content"><div class="wp-chat-message-text">'+val.message+'</div></div></div></div>';
								}

							});

							that.find('.wp-chat-dialog-content').append(messages);
							
							if (room.messages.length > 0){
								that.attr('data-last-message', room.messages.at(-1).id);
								that.attr('data-first-message', room.messages.at(0).id);
							}
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
				if (jQuery('#wp-chat-window').length == 0) return;
				if (!data) {
					return;
				}
				//
				var user_in_room_count = 0;
				//jQuery('#wp-chat-window').find('.wp-chat-window-archives ul').empty();
				$.each(data, function (key, room){
					//if room has been loaded already
					if ($('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').length > 0){

						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').addClass('newMessage');

						var room_status_label = '';
						var room_status_class = '';
						if (room.public == '1'){
							room_status_label = __( 'public', 'wp-chat');
							room_status_class = 'public';
						}
						if (room.archived == '1'){
							room_status_label = __( 'archived', 'wp-chat');
							room_status_class = 'archived';
						}
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').addClass('updated');

						var room_section = 'general';
						if (room.is_user_in){
							room_section = 'own';
							user_in_room_count++;
						}
						
						if ( 
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').data('room-section') != room_section
						){
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').appendTo(jQuery('#wp-chat-window').find('.wp-chat-window-archives .wp-chat-window-archives-section[data-section="'+room_section+'"]>ul'));
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
						if (room.messages[room.messages.length - 1].message.length > wp_chat_datas.text_extract_length){
							message = room.messages[room.messages.length - 1].message.substring(0,wp_chat_datas.text_extract_length)+'...';
						}
						else {
							message = room.messages[room.messages.length - 1].message;
						}

						var has_unread_message = false;
						var unread_message_count = 0;
						if (room.messages.length > 0){
							jQuery.each(room.messages, function(key, message){
								//if not one of current user message, and not a system message
								if (message.type != 'system' && message.userID != wp_chat_datas.user_id && message.read.length > 0){
									var is_message_read = false;
									jQuery.each(message.read, function (rkey, read){
										if (read.userID == wp_chat_datas.user_id){
											is_message_read = true;
										}
									});
									if (!is_message_read){
										unread_message_count++;
										has_unread_message = true;
									}
								}
							});
						}

						if (has_unread_message){
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').addClass('newMessage');
							//$('.wp-chat-dialog[data-room-id='+room.room_id+']').addClass('newMessage');
						}
						else {
							$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').removeClass('newMessage');
							//$('.wp-chat-dialog[data-room-id='+room.room_id+']').removeClass('newMessage');
						}
						
						$('#wp-chat-window').find('.wp-chat-window-archive[data-room-id='+room.room_id+']').data('unread-message', unread_message_count);

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
							if (room.messages[room.messages.length - 1].message.length > wp_chat_datas.text_extract_length){
								message = room.messages[room.messages.length - 1].message.substring(0,wp_chat_datas.text_extract_length)+'...';
							}
							else {
								message = room.messages[room.messages.length - 1].message;
							}

							var has_unread_message = false;
							var unread_message_count = 0;
							if (room.messages.length > 0){
								jQuery.each(room.messages, function(key, message){
									//if not one of current user message, and not a system message
									if (message.type != 'system' && message.userID != wp_chat_datas.user_id && message.read.length > 0){
										var is_message_read = false;
										jQuery.each(message.read, function (rkey, read){
											if (read.userID == wp_chat_datas.user_id){
												is_message_read = true;
											}
										});
										if (!is_message_read){
											unread_message_count++;
											has_unread_message = true;
										}
									}
								});
							}

							var room_status_label = '';
							var room_status_class = '';
							if (room.public == '1'){
								room_status_label = __( 'public', 'wp-chat');
								room_status_class = 'public';
							}
							if (room.archived == '1'){
								room_status_label = __( 'archived', 'wp-chat');
								room_status_class = 'archived';
							}
							var room_section = 'general';
							if (room.is_user_in){
								room_section = 'own';
								user_in_room_count++;
							}
							var remove_room_html = '';
							if (room.is_owner){
								remove_room_html = '<li class="wp-chat-window-archive-action wp-chat-remove-room-action">Supprimer la conversation</li>';
							}

							var newMessageClass = '';
							if (has_unread_message){
								newMessageClass = 'newMessage';
							}

							jQuery('#wp-chat-window').find('.wp-chat-window-archives .wp-chat-window-archives-section[data-section="'+room_section+'"]>ul').append('<li class="wp-chat-window-archive updated '+newMessageClass+'" data-room-id="'+room.room_id+'" data-room-last-message="'+room.last_message+'" data-room-section="'+room_section+'" data-unread-message="'+unread_message_count+'"><div class="wp-chat-window-archive-avatar '+group+'">'+display_room_thumbnail(room.room_id, room.room_thumbnails)+'</div><div class="wp-chat-window-archive-content"><div class="wp-chat-window-archive-title" title="'+room.room_fullname+'">'+room.room_name+'<span class="wp-chat-window-archive-status '+room_status_class+'">'+room_status_label+'</span></div><div class="wp-chat-window-archive-last-comment">'+message+'</div></div><div class="wp-chat-window-archive-actions"><div class="wp-chat-icon dots-v"></div><ul><li class="wp-chat-window-archive-action wp-chat-leave-room-action">Quitter la conversation</li>'+remove_room_html+'</ul></div></li>');					
						}
					}
				});
				if (user_in_room_count > 0){
					jQuery('#wp-chat-window .wp-chat-window-archives .wp-chat-empty-archive').hide();
				}
				else {
					jQuery('#wp-chat-window .wp-chat-window-archives .wp-chat-empty-archive').show();
				}
				$('#wp-chat-window').find('.wp-chat-window-archive').each(function(){
					if (!$(this).hasClass('updated')){
						$(this).remove();
					}
					$(this).removeClass('updated');
				});
				wp_chat_order_archives_list();
				wp_chat_check_new_message();
			}

			function wp_chat_order_archives_list(){
				$('#wp-chat-window .wp-chat-window-archives .wp-chat-window-archives-section>ul').each(function(){
					jQuery(this).find('.wp-chat-window-archive').sort(function(a, b) {
						var upA = $(a).data('room-last-message');
						var upB = $(b).data('room-last-message');
						return (upA > upB) ? -1 : (upA < upB) ? 1 : 0;
					}).appendTo(jQuery(this));
				});
			}

			function wp_chat_check_new_message(){
				var new_message_count = 0;
				jQuery('.wp-chat-menu-toggler').removeClass('newMessage');
				jQuery('.wp-chat-menu-toggler').find('.wp-chat-menu-toggler-new-message').remove();
				$('#wp-chat-window .wp-chat-window-archives .wp-chat-window-archives-section[data-section="own"] .wp-chat-window-archive').each(function(){
					jQuery('.wp-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').find('.wp-chat-dialog-new-message').remove();
					if (jQuery(this).hasClass('newMessage')){
						new_message_count += parseInt(jQuery(this).data('unread-message'));
						jQuery('.wp-chat-menu-toggler').addClass('newMessage');
						jQuery('.wp-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"] .wp-chat-dialog-reduced').append('<div class="wp-chat-dialog-new-message">'+parseInt(jQuery(this).data('unread-message'))+'</div>');
						jQuery('.wp-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').addClass('newMessage');
					}
					else {
						jQuery('.wp-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').removeClass('newMessage');
					}
				});
				if (new_message_count > 0){
					if (new_message_count > 99){
						new_message_count = '99+';
					}
					jQuery('.wp-chat-menu-toggler').append('<div class="wp-chat-menu-toggler-new-message">'+new_message_count+'</div>');
				}

			}

			
			$('body').on('click', '.wp-chat-leave-room-action', function(){
				var room_id;
				if ($(this).closest('.wp-chat-window-archive').length > 0){
					room_id = $(this).closest('.wp-chat-window-archive').attr('data-room-id');
				}
				if (room_id == 'undefined' || room_id == null){
					room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				}
				
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_leave_room',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							refresh_view(function(response){});
						}
						else {
							console.warn(data.message);
							alert(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});
			});

			$('body').on('click', '.wp-chat-remove-room-action', function(){
				var room_id;
				if ($(this).closest('.wp-chat-window-archive').length > 0){
					room_id = $(this).closest('.wp-chat-window-archive').attr('data-room-id');
				}
				if (room_id == 'undefined' || room_id == null){
					room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				}
				remove_room(room_id);
			});

			$('body').on('click', '.wp-chat-dialog .wp-chat-popup-content-remove-room-btn', function(){
				var room_id;
				if ($(this).closest('.wp-chat-dialog').length > 0){
					room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				}
				remove_room(room_id);
			});

			function remove_room(room_id){
				if (room_id == 'undefined' || room_id == null){
					alert(__("An error occured.", 'wp-chat'));
				}
				if (confirm(__("Are you sure you want to delete this conversation ?", 'wp-chat')) == true) {
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: wp_chat_datas.ajax_url,
						data: {
							'action': 'wp_chat_remove_room',
							'room_id': room_id
						},
						beforeSend: function (jqXHR, settings) {
								let url = settings.url + "?" + settings.data;
						},
						success: function(data) {
							if (data.success == true){
								refresh_view(function(response){});
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
				} else {
					return;
				}
				
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
					url: wp_chat_datas.ajax_url,
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
							refresh_view(function(response){});
						}
						else {
							console.warn(data.message);
							alert(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});
			});


			//allow user to see new message if he's not scrolling in the conversation
			$("body").on("dialog-scroll", ".wp-chat-dialog-content", function(){
				var that = $(this)
				if ($(this).height() + $(this).scrollTop()+50 > $(this)[0].scrollHeight){
					$(this).closest('.wp-chat-dialog').removeClass('scrolling');
				}
				else {
					$(this).closest('.wp-chat-dialog').addClass('scrolling');
				}

				if ($(this).scrollTop() == 0){
					//TODO - load more messages
					console.log('...Loading more messages...');
					var offset = $(this).closest('.wp-chat-dialog').data('room-offset');
					$(this).closest('.wp-chat-dialog').data('room-offset', parseInt(offset) + parseInt(wp_chat_datas.message_amount));
					
					var old_scroll_height = that[0].scrollHeight;

					refresh_view(function(response){
						if (response){
							that.scrollTop(that[0].scrollHeight - old_scroll_height);
						}
					});
				}
			});

			$('body').on('click', '.wp-chat-dialog .wp-chat-dialog-thumbnail', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				show_manage_participant_popup(room_id);
			});

			function show_manage_participant_popup(room_id){
				$.ajax({
					type: 'post',
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_get_participant_popup'
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
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
					url: wp_chat_datas.ajax_url,
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
						 refresh_view(function(response){});
						}
						else {
							console.warn(data.message);
							alert(data.message);
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
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_remove_room_participant',
						'room_id': room_id,
						'removed_user_id': participant_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							update_room_participants_list_view(room_id);
						}
						else {
							console.warn(data.message);
							alert(data.message);
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
				var room_id = jQuery(this).closest('.wp-chat-dialog').data('room-id');
				clearTimeout(search_participants_timeout);
				search_participants_timeout = setTimeout(function(){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: wp_chat_datas.ajax_url,
						data: {
							'action': 'wp_chat_search_users',
							'search': search,
							'room_id': room_id
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
					url: wp_chat_datas.ajax_url,
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
							console.warn(data.message);
							alert(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});
			});

			$('body').on('click', '.wp-chat-dialog:not(.blank) .wp-chat-dialog-title', function(){
				var room_id = $(this).closest('.wp-chat-dialog').attr('data-room-id');
				show_room_details_popup(room_id);
			});

			function show_room_details_popup(room_id){
				$.ajax({
					type: 'post',
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_get_room_details_popup',
						'room': room_id
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
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_get_room_details',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
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
							console.warn(data.message);
							alert(data.message);
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
					url: wp_chat_datas.ajax_url,
					data: {
						'action': 'wp_chat_edit_room_details',
						'room_name': room_name,
						'room_id': room_id,
						'public': public_checkbox,
						'archived': archived_checkbox
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							refresh_view(function(response){});
							jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-popup.popup-room').remove();
						}
						else {
							console.warn(data.message);
							alert(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});
			}


		});
})( jQuery );


function create_empty_room(room_id){
	let html = '<div class="wp-chat-dialog" data-room-offset="0" data-room-id="'+room_id+'" data-first-message="-1" data-last-message="-1"><div class="wp-chat-dialog-reduced"> <img src="'+wp_chat_datas.default_img+'" alt=""> </div><div class="wp-chat-dialog-header"> <div class="wp-chat-dialog-thumbnail"> <img src="'+wp_chat_datas.default_img+'" alt=""> </div><div class="wp-chat-dialog-title">Conversation sans nom</div><div class="wp-chat-dialog-header-actions"> <div class="wp-chat-dialog-header-action reduce-dialog"> <div class="wp-chat-icon reduce"></div></div><div class="wp-chat-dialog-header-action close-dialog"> <div class="wp-chat-icon close"></div></div></div></div><div class="wp-chat-dialog-content"></div><div class="wp-chat-dialog-footer"> <input type="text"> <div class="send-btn"> <div class="wp-chat-icon send"></div></div></div></div>';
	jQuery('#wp-chat-dialogs').prepend(html);
	listenForScrollEvent(jQuery(".wp-chat-dialog[data-room-id="+room_id+"] .wp-chat-dialog-content"));
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

function update_room_messages(room_id, messages, first_message_id, last_message_id){
	if (room_id){
		jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content').empty().append(messages);
		//scroll back to bottom
		jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content').scrollTop(jQuery('.wp-chat-dialog[data-room-id='+room_id+']').find('.wp-chat-dialog-content')[0].scrollHeight);
		jQuery('.wp-chat-dialog[data-room-id='+room_id+']').attr('data-first-message', first_message_id);
		jQuery('.wp-chat-dialog[data-room-id='+room_id+']').attr('data-last-message', last_message_id);
	}
}

function format_messages(messages){
	var messages_html = '';
	if (messages){
		jQuery.each(messages, function(key, val){
			if (val.type == ''){
				//self
				if (val.userID == wp_chat_datas.user_id){
					messages_html += '<div data-id="'+val.id+'" class="wp-chat-message self"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
				}
				//other participants
				else {
					messages_html += '<div data-id="'+val.id+'" class="wp-chat-message"><div class="wp-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="wp-chat-message-content"><div class="wp-chat-message-details"><div class="wp-chat-message-from">'+val.user.display_name+'</div> - <div class="wp-chat-message-time">'+val.created+'</div></div><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
				}
			}
			else if (val.type=='system'){
				messages_html += '<div data-id="'+val.id+'" class="wp-chat-message system"><div class="wp-chat-message-content"><div class="wp-chat-message-text">'+val.message+'</div></div></div>';
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
		create_empty_room(data.room_id);
		update_room_informations(data);
		var first_message_id = -1;
		var last_message_id = -1;
		if (data.messages.length > 0){
			first_message_id = data.messages.at(0).id;
			last_message_id = data.messages.at(-1).id;
		}
		update_room_messages(data.room_id, format_messages(data.messages), first_message_id, last_message_id);
	}

}

function wp_chat_toggle_menu_window(){
	if (!jQuery('#wp-chat-window').length){
	  console.warn( __( 'WP-Chat window is not enabled', 'wp-chat') );
	  return false;
	}
	if (jQuery('#wp-chat-window').hasClass('active')){
	  jQuery('#wp-chat-window').removeClass('active');
	}
	else {
	  jQuery('#wp-chat-window').addClass('active');
	}
}

function listenForScrollEvent(el){
	el.on("scroll", function(){
		el.trigger("dialog-scroll");
	});
}

function display_room_thumbnail(room_id, thumbnails){
	var thumbnails_html = '<div class="wp-chat-room-thumbnail-image"><img src="'+wp_chat_datas.default_img+'" alt=""></div>';
	if (thumbnails != undefined && thumbnails.length > 0){
		thumbnails_html = '';
		jQuery.each(thumbnails, function(key, val){
			thumbnails_html += '<div class="wp-chat-room-thumbnail-image"><img src="'+val+'" alt=""></div>';

		});
	}
	return thumbnails_html;
}