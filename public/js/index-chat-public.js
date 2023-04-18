var user_data_rooms;

var isTabActive = true;

var default_page_title = document.title;
var page_title = default_page_title;

const { __, _x, _n, _nx } = wp.i18n;

window.onfocus = function () { 
	isTabActive = true; 
	wpChatUpdateUserRoomsDatas();
}; 
  
window.onblur = function () { 
	isTabActive = false; 
	wpChatUpdateUserRoomsDatas();
}; 


(function( $ ) {
	'use strict';

	 	jQuery(document).ready(function(){

			$('body').on('keyup', '#index-chat-window .index-chat-search input', function(){
				var rex = new RegExp($(this).val(), 'i');
				$('#index-chat-window .index-chat-window-archives .index-chat-window-archive').hide();
				$('#index-chat-window .index-chat-window-archives .index-chat-window-archive').filter(function () {
						return rex.test($(this).text());
				}).show();
			});

			//Detect click Outstide WP Chat Menu Window
			$(document).click(function(event) {
				var $target = $(event.target);
				if ($target.hasClass('index-chat-menu-toggler') || $target.hasClass('index-chat-icon')){
					return;
				}
				if(!$target.closest('#index-chat-window').length && $('#index-chat-window').hasClass("active") && !$target.hasClass('index-chat-menu-btn')) {
					index_chat_toggle_menu_window();
				}
				if (!$target.hasClass('index-chat-window-archive-actions')){
					jQuery('.index-chat-window-archive-actions').each(function(){$(this).removeClass('active')});
				}
			});

			$('body').on('click', '#index-chat-window .index-chat-window-archives .index-chat-window-archive .index-chat-window-archive-actions', function(){
				if ($(this).hasClass('active')){
					$(this).removeClass('active');
				}
				else {
					$(this).addClass('active');
				}
			});

			//Click on WP Chat Menu Toggler
			jQuery('body').on('click','.index-chat-menu-toggler', function(){
				index_chat_toggle_menu_window();
			});

			//Click on WP Chat Close Menu Icon
			jQuery('body').on('click','.index-chat-window-close', function(){
				index_chat_toggle_menu_window();
			});

			//Click on WP Chat Dialog Box Close Icon
			jQuery('body').on('click','.index-chat-dialog-header-action.close-dialog', function(){
				jQuery(this).closest('.index-chat-dialog').remove();
				wpChatUpdateUserRoomsDatas();
			});

			//Click on WP Chat Dialog Box Reduce Icon
			jQuery('body').on('click','.index-chat-dialog-header-action.reduce-dialog', function(){
				var room_id = jQuery(this).closest('.index-chat-dialog').data('room-id');
				wpChatReduceRoom(room_id);
			});

			//Click on WP Chat Dialog Box Reduced Thumbnail
			jQuery('body').on('click','.index-chat-dialog.reduced', function(){
				var room_id = jQuery(this).attr('data-room-id');
				wpChatUnreduceRoom(room_id);
			});

			jQuery('body').on('click', '.index-chat-window-archives-menu .index-chat-window-archives-menu-item', function(){
				let section = $(this).data('section');
				$('.index-chat-window-archives-menu .index-chat-window-archives-menu-item').each(function(){
					$(this).removeClass('active');
				});
				$(this).addClass('active');
				$('.index-chat-window-archives .index-chat-window-archives-section').each(function(){
					$(this).removeClass('active');
					if ($(this).data('section') == section){
						$(this).addClass('active');
					}
				});
			});
	

			jQuery('body').on('keypress', '.index-chat-dialog .index-chat-dialog-footer input', function(event){
				var that = jQuery(this);
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					var room_id = jQuery(this).closest('.index-chat-dialog').data('room-id');
					var message = jQuery(this).closest('.index-chat-dialog').find('.index-chat-dialog-footer input').val();
					that.closest('.index-chat-dialog').find('.index-chat-dialog-footer input').val('');
					send_message(room_id, message);
				}
			});

			jQuery('body').on('click', '.index-chat-dialog .index-chat-dialog-footer .send-btn', function(){
				var that = jQuery(this);
				var room_id = jQuery(this).closest('.index-chat-dialog').data('room-id');
				var message = jQuery(this).closest('.index-chat-dialog').find('.index-chat-dialog-footer input').val();
				that.closest('.index-chat-dialog').find('.index-chat-dialog-footer input').val('');
				send_message(room_id, message);
			});

			function send_message(room_id, message){
				if (message.trim() != ''){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: index_chat_datas.ajax_url,
						data: {
							'action': 'index_chat_send_message',
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


			if (index_chat_datas.index_chat_options['index-chat-disable-ajax-checkbox'] != '1'){
				var refresh_room_interval = setInterval(function(){
					refresh_view(function(response){});
				}, index_chat_datas.index_chat_options['index-chat-refresh-rate-input']);
			}

			user_data_rooms = JSON.parse(wpChatGetCookie('index-chat-user-cookie-'+index_chat_datas.user_id));

			refresh_view(function(response){});
			
			function refresh_view(refreshCallback){
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_refresh_view',
						'rooms': user_data_rooms
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							if (jQuery('#index-chat-window').length == 0) return;
							if (!data){
								return;
							}
							refresh_chat_window(data.content);
							refresh_chat_dialogs(data.content);
							refreshCallback(true);
						}
						else {
							console.error(data.message);
							refreshCallback(false);
						}
					},
					error: function(error) {
						console.error(error);
						refreshCallback(false);
					}
				});
				jQuery('#index-chat-dialogs .index-chat-dialog').each(function(){
					if (jQuery(this).attr('data-room-id') != '' && jQuery(this).attr('data-room-id') != null){

					}
				});
			}
			

			function refresh_chat_dialogs(data){
				$.each(data, function (key, room){
					//dialog box already exists
					if (jQuery('body').find('.index-chat-dialog[data-room-id="'+room.room_id+'"]').length > 0){
						var that = jQuery('body').find('.index-chat-dialog[data-room-id="'+room.room_id+'"]');
						var room_id = room.room_id;
						if (room_id == undefined){
							return;
						}
						that.find('.index-chat-dialog-content').empty();
						that.find('.index-chat-dialog-title').empty();
						that.find('.index-chat-dialog-thumbnail').removeClass('grouped').empty();
						if (!room.is_user_in){
							that.remove();
							return;
						}
						if (room.room_thumbnails.length > 1){ that.find('.index-chat-dialog-thumbnail').addClass('grouped'); }
						that.find('.index-chat-dialog-thumbnail').append(display_room_thumbnail(room.room_id, room.room_thumbnails));
						that.find('.index-chat-dialog-title').text(room.room_name);
						that.find('.index-chat-dialog-title').attr('title', room.room_fullname);
						if (that.hasClass('reduced')){
							that.attr('title', room.room_fullname);
						}
						else {
							that.attr('title', '');
						}
						var messages = '';
						$.each(room.messages, function (mk, val){
							if (val.type != 'system'){
								if (val.userID == index_chat_datas.user_id){
									messages += '<div data-id="'+val.id+'" class="index-chat-message self"><div class="index-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="index-chat-message-content"><div class="index-chat-message-details"><div class="index-chat-message-from">'+val.user.display_name+'</div> - <div class="index-chat-message-time">'+val.created+'</div></div><div class="index-chat-message-text">'+val.message+'</div></div></div>';
								}
								else {
									messages += '<div data-id="'+val.id+'" class="index-chat-message"><div class="index-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="index-chat-message-content"><div class="index-chat-message-details"><div class="index-chat-message-from">'+val.user.display_name+'</div> - <div class="index-chat-message-time">'+val.created+'</div></div><div class="index-chat-message-text">'+val.message+'</div></div></div>';
								}
							}
							else {
								messages += '<div data-id="'+val.id+'" class="index-chat-message system"><div class="index-chat-message-content"><div class="index-chat-message-text">'+val.message+'</div></div></div></div>';
							}

						});

						that.find('.index-chat-dialog-content').append(messages);
						
						if (room.messages.length > 0){
							that.attr('data-last-message', room.messages.at(-1).id);
							that.attr('data-first-message', room.messages.at(0).id);
						}
						that.addClass('updated');

						
						if (!that.hasClass('scrolling')){
							that.find('.index-chat-dialog-content').scrollTop(that.find('.index-chat-dialog-content')[0].scrollHeight);
						}
					}
					//dialog box not existing yet, we create it
					else {
						if (room.is_open && room.is_user_in){
							create_room_box(room);
							wpChatUpdateUserRoomsDatas();	
						}
					}
				});

				//if the dialog box has not been updated, means it has been removed or user is no longer participating to it
				jQuery('.index-chat-dialog').each(function(){
					if (!jQuery(this).hasClass('blank')){
						if (jQuery(this).hasClass('updated')){
							jQuery(this).removeClass('updated');
						}
						else {
							//removing it;
							jQuery(this).remove();
						}
					}
				});
			}

			function refresh_chat_window(data){
				var user_in_room_count = 0;
				//jQuery('#index-chat-window').find('.index-chat-window-archives ul').empty();
				$.each(data, function (key, room){
					//if room has been loaded already
					if ($('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').length > 0){

						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').addClass('newMessage');

						var room_status_label = '';
						var room_status_class = '';
						if (room.public == '1'){
							room_status_label = __( 'public', 'index-chat');
							room_status_class = 'public';
						}
						if (room.archived == '1'){
							room_status_label = __( 'archived', 'index-chat');
							room_status_class = 'archived';
						}
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').addClass('updated');

						var room_section = 'general';
						if (room.is_user_in){
							room_section = 'own';
							user_in_room_count++;
						}
						
						if ( 
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').data('room-section') != room_section
						){
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').appendTo(jQuery('#index-chat-window').find('.index-chat-window-archives .index-chat-window-archives-section[data-section="'+room_section+'"]>ul'));
						}

						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').data('room-section', room_section);
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').data('room-last-message', room.last_message);
						var group = '';
						if (room.room_thumbnails.length > 1){
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-avatar').addClass('grouped');
						}
						else {
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-avatar').removeClass('grouped');
						}
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-avatar').empty().append(display_room_thumbnail(room.room_id, room.room_thumbnails));
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-content .index-chat-window-archive-title').text(room.room_name);
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-content .index-chat-window-archive-title').attr('title', room.room_fullname);

						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-content .index-chat-window-archive-title').append('<span class="index-chat-window-archive-status '+room_status_class+'">'+room_status_label+'</span>');

						var message = '';
						if (room.messages.length > 0){
							if (room.messages[room.messages.length - 1].message.length > index_chat_datas.text_extract_length){
								message = room.messages[room.messages.length - 1].message.substring(0,index_chat_datas.text_extract_length)+'...';
							}
							else {
								message = room.messages[room.messages.length - 1].message;
							}
						}

						var has_unread_message = false;
						var unread_message_count = 0;
						if (room.messages.length > 0){
							jQuery.each(room.messages, function(key, message){
								//if not one of current user message, and not a system message
								if (message.type != 'system' && message.userID != index_chat_datas.user_id && message.read.length > 0){
									var is_message_read = false;
									jQuery.each(message.read, function (rkey, read){
										if (read.userID == index_chat_datas.user_id){
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
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').addClass('newMessage');
							//$('.index-chat-dialog[data-room-id='+room.room_id+']').addClass('newMessage');
						}
						else {
							$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').removeClass('newMessage');
							//$('.index-chat-dialog[data-room-id='+room.room_id+']').removeClass('newMessage');
						}
						
						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+']').data('unread-message', unread_message_count);

						$('#index-chat-window').find('.index-chat-window-archive[data-room-id='+room.room_id+'] .index-chat-window-archive-content .index-chat-window-archive-last-comment').text(message);

					}
					//if not loaded, we create the layout
					else {
						if (room.messages.length > 0){
							var group = '';
							if (room.room_thumbnails.length > 1){
								group = 'grouped';
							}
							var message = '';
							if (room.messages[room.messages.length - 1].message.length > index_chat_datas.text_extract_length){
								message = room.messages[room.messages.length - 1].message.substring(0,index_chat_datas.text_extract_length)+'...';
							}
							else {
								message = room.messages[room.messages.length - 1].message;
							}

							var has_unread_message = false;
							var unread_message_count = 0;
							if (room.messages.length > 0){
								jQuery.each(room.messages, function(key, message){
									//if not one of current user message, and not a system message
									if (message.type != 'system' && message.userID != index_chat_datas.user_id && message.read.length > 0){
										var is_message_read = false;
										jQuery.each(message.read, function (rkey, read){
											if (read.userID == index_chat_datas.user_id){
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
								room_status_label = __( 'public', 'index-chat');
								room_status_class = 'public';
							}
							if (room.archived == '1'){
								room_status_label = __( 'archived', 'index-chat');
								room_status_class = 'archived';
							}
							var room_section = 'general';
							if (room.is_user_in){
								room_section = 'own';
								user_in_room_count++;
							}
							var remove_room_html = '';
							if (room.is_owner){
								remove_room_html = '<li class="index-chat-window-archive-action index-chat-remove-room-action">Supprimer la conversation</li>';
							}

							var newMessageClass = '';
							if (has_unread_message){
								newMessageClass = 'newMessage';
							}

							jQuery('#index-chat-window').find('.index-chat-window-archives .index-chat-window-archives-section[data-section="'+room_section+'"]>ul').append('<li class="index-chat-window-archive updated '+newMessageClass+'" data-room-id="'+room.room_id+'" data-room-last-message="'+room.last_message+'" data-room-section="'+room_section+'" data-unread-message="'+unread_message_count+'"><div class="index-chat-window-archive-avatar '+group+'">'+display_room_thumbnail(room.room_id, room.room_thumbnails)+'</div><div class="index-chat-window-archive-content"><div class="index-chat-window-archive-title" title="'+room.room_fullname+'">'+room.room_name+'<span class="index-chat-window-archive-status '+room_status_class+'">'+room_status_label+'</span></div><div class="index-chat-window-archive-last-comment">'+message+'</div></div><div class="index-chat-window-archive-actions"><div class="index-chat-icon dots-v"></div><ul><li class="index-chat-window-archive-action index-chat-leave-room-action">Quitter la conversation</li>'+remove_room_html+'</ul></div></li>');					
						}
					}
				});
				if (user_in_room_count > 0){
					jQuery('#index-chat-window .index-chat-window-archives .index-chat-empty-archive').hide();
				}
				else {
					jQuery('#index-chat-window .index-chat-window-archives .index-chat-empty-archive').show();
				}
				$('#index-chat-window').find('.index-chat-window-archive').each(function(){
					if (!$(this).hasClass('updated')){
						$(this).remove();
					}
					$(this).removeClass('updated');
				});
				index_chat_order_archives_list();
				index_chat_check_new_message();
			}

			function index_chat_order_archives_list(){
				$('#index-chat-window .index-chat-window-archives .index-chat-window-archives-section>ul').each(function(){
					jQuery(this).find('.index-chat-window-archive').sort(function(a, b) {
						var upA = $(a).data('room-last-message');
						var upB = $(b).data('room-last-message');
						return (upA > upB) ? -1 : (upA < upB) ? 1 : 0;
					}).appendTo(jQuery(this));
				});
			}

			function index_chat_check_new_message(){
				var new_message_count = 0;
				jQuery('.index-chat-menu-toggler').removeClass('newMessage');
				jQuery('.index-chat-menu-toggler').find('.index-chat-menu-toggler-new-message').remove();
				$('#index-chat-window .index-chat-window-archives .index-chat-window-archives-section[data-section="own"] .index-chat-window-archive').each(function(){
					jQuery('.index-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').find('.index-chat-dialog-new-message').remove();
					if (jQuery(this).hasClass('newMessage')){
						new_message_count += parseInt(jQuery(this).data('unread-message'));
						jQuery('.index-chat-menu-toggler').addClass('newMessage');
						jQuery('.index-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"] .index-chat-dialog-reduced').append('<div class="index-chat-dialog-new-message">'+parseInt(jQuery(this).data('unread-message'))+'</div>');
						jQuery('.index-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').addClass('newMessage');
					}
					else {
						jQuery('.index-chat-dialog[data-room-id="'+jQuery(this).data('room-id')+'"]').removeClass('newMessage');
					}
				});
				if (new_message_count > 0){

					var new_message_title = new_message_count + ' ' +__('new messages', 'index-chat');
					if (new_message_count == 1){
						new_message_title = new_message_count + ' ' +__('new message', 'index-chat');
					}
					if (new_message_count > 99){
						new_message_count = '99+';
						new_message_title = new_message_count + ' ' +__('new message', 'index-chat');
					}

					change_page_title(new_message_title);
					
					jQuery('.index-chat-menu-toggler').append('<div class="index-chat-menu-toggler-new-message">'+new_message_count+'</div>');
				}
				else {
					stop_page_title_change();
				}
			}

			var notification_change_title_interval = null;

			function start_page_title_change(){
				stop_page_title_change();
				notification_change_title_interval = setInterval(function(){
					if (document.title == default_page_title){
						document.title = page_title;
					}
					else {
						document.title = default_page_title;
					}
				}, 2000);
			}

			function change_page_title(title){
				if (notification_change_title_interval == null){
					start_page_title_change();
				}
				page_title = title;
			}


			function stop_page_title_change(){
				clearInterval(notification_change_title_interval);
				notification_change_title_interval = null;
				document.title = default_page_title;
			}

			
			$('body').on('click', '.index-chat-leave-room-action', function(){
				var room_id;
				if ($(this).closest('.index-chat-window-archive').length > 0){
					room_id = $(this).closest('.index-chat-window-archive').attr('data-room-id');
				}
				if (room_id == 'undefined' || room_id == null){
					room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				}
				
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_leave_room',
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

			$('body').on('click', '.index-chat-remove-room-action', function(){
				var room_id;
				if ($(this).closest('.index-chat-window-archive').length > 0){
					room_id = $(this).closest('.index-chat-window-archive').attr('data-room-id');
				}
				if (room_id == 'undefined' || room_id == null){
					room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				}
				remove_room(room_id);
			});

			function remove_room(room_id){
				if (room_id == 'undefined' || room_id == null){
					alert(__("An error occured.", 'index-chat'));
				}
				if (confirm(__("Are you sure you want to delete this conversation ?", 'index-chat')) == true) {
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: index_chat_datas.ajax_url,
						data: {
							'action': 'index_chat_remove_room',
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

			

			jQuery('body').on('click', '#index-chat-window .index-chat-window-archives .index-chat-window-archive', function(event){
				var $target = $(event.target);
				if ($target.hasClass('index-chat-window-archive-actions') || $target.hasClass('index-chat-window-archive-action') || $target.parent().hasClass('index-chat-window-archive-actions')){
					return;
				}
				var room_id = jQuery(this).closest('.index-chat-window-archive').attr('data-room-id');
				wpChatOpenRoom(room_id);			
			});

			function wpChatOpenRoom(room_id){
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_open_room',
						'room_id': room_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							create_room_box(data);
							wpChatUpdateUserRoomsDatas();	
						}
						else {
							removeRoomFromUserData(room_id);
							console.warn(data.message);
						}
					},
					error: function(error) {
						console.error(error);
					}
				});
			}


			//allow user to see new message if he's not scrolling in the conversation
			$("body").on("dialog-scroll", ".index-chat-dialog-content", function(){
				var that = $(this)
				if ($(this).height() + $(this).scrollTop()+50 > $(this)[0].scrollHeight){
					$(this).closest('.index-chat-dialog').removeClass('scrolling');
				}
				else {
					$(this).closest('.index-chat-dialog').addClass('scrolling');
				}

				if ($(this).scrollTop() == 0){
					//TODO - load more messages
					console.log('...Loading more messages...');
					var offset = $(this).closest('.index-chat-dialog').data('room-offset');
					$(this).closest('.index-chat-dialog').data('room-offset', parseInt(offset) + parseInt(index_chat_datas.message_amount));
					
					var old_scroll_height = that[0].scrollHeight;

					refresh_view(function(response){
						if (response){
							that.scrollTop(that[0].scrollHeight - old_scroll_height);
						}
					});
				}
			});

			$('body').on('click', '.index-chat-dialog .index-chat-dialog-thumbnail', function(){
				var room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				show_manage_participant_popup(room_id);
			});

			function show_manage_participant_popup(room_id){
				$.ajax({
					type: 'post',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_get_participant_popup'
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						$('.index-chat-dialog[data-room-id='+room_id+']').append(data);
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
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_get_room_participants',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
						 $('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-participants').find('.index-chat-dialog-popup-participants-list').empty();
						 if (data.participants && data.participants.length > 0){
							 $.each(data.participants, function (key, participant){
								 if (data.isOwner){
									 if (participant.owner){
										 $('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-participants').find('.index-chat-dialog-popup-participants-list').append('<li class="index-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="ownership"><div class="index-chat-icon crown icon-blue"></div></div></li>');
									 }
									 else {
										 $('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-participants').find('.index-chat-dialog-popup-participants-list').append('<li class="index-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="delete"><div class="index-chat-icon close"></div></div></li>');
									 }

								 }
								 else {
									 if (participant.owner){
											$('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-participants').find('.index-chat-dialog-popup-participants-list').append('<li class="index-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span><div class="ownership"><div class="index-chat-icon crown icon-blue"></div></div></li>');
									 }
									 else {
	 									 	$('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-participants').find('.index-chat-dialog-popup-participants-list').append('<li class="index-chat-dialog-popup-participant" data-participant-id='+participant.id+'><span>'+participant.display_name+'</span></li>');
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

			$('body').on('click', '.index-chat-dialog-popup .close-popup', function(){
				jQuery(this).closest('.index-chat-dialog-popup').remove();
			});

			$('body').on('click', '.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-participant .delete', function(){
				var room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				var participant_id = $(this).closest('.index-chat-dialog-popup-participant').attr('data-participant-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_remove_room_participant',
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
			jQuery('body').on('input', '.index-chat-dialog .index-chat-dialog-popup.popup-participants .index-chat-add-participant-input', function(){
				let search = jQuery(this).val();
				var room_id = jQuery(this).closest('.index-chat-dialog').data('room-id');
				clearTimeout(search_participants_timeout);
				search_participants_timeout = setTimeout(function(){
					$.ajax({
						type: 'POST',
						dataType: 'json',
						url: index_chat_datas.ajax_url,
						data: {
							'action': 'index_chat_search_users',
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
				if (jQuery('.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer .participants_search_results').length > 0){
					jQuery('.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer .participants_search_results').remove();
				}
				jQuery('.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer').append('<div class="participants_search_results"><ul></ul></div>');
				if (matches != null && matches.length > 0 ){
					$.each(matches, function (k, v){
						if (k < 5){
							jQuery('.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer .participants_search_results ul').append('<li class="new_participant_select" data-id="'+v.ID+'">'+v.display_name+'</li>');
						}
					});
				}
			}

			$('body').on('click', '.index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer .participants_search_results ul li', function(){
				var room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				var user_id = $(this).attr('data-id');
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_add_room_participant',
						'room_id': room_id,
						'added_user_id': user_id,
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							$('.index-chat-dialog[data-room-id='+room_id+'] .index-chat-dialog-popup.popup-participants .index-chat-add-participant-input').val('');
							$('.index-chat-dialog[data-room-id='+room_id+'] .index-chat-dialog-popup.popup-participants .index-chat-dialog-popup-footer .participants_search_results').remove();
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

			$('body').on('click', '.index-chat-dialog:not(.blank) .index-chat-dialog-title', function(){
				var room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
				show_room_details_popup(room_id);
			});

			function show_room_details_popup(room_id){
				$.ajax({
					type: 'post',
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_get_room_details_popup',
						'room': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						$('.index-chat-dialog[data-room-id='+room_id+']').append(data);
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
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_get_room_details',
						'room_id': room_id
					},
					beforeSend: function (jqXHR, settings) {
							let url = settings.url + "?" + settings.data;
					},
					success: function(data) {
						if (data.success == true){
							if (jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title input').length > 0){
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title input').val(data.room.name);
							}
							if (jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title .index-chat-dialog-popup-title-label').length > 0){
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title .index-chat-dialog-popup-title-label').text(data.room.name);
							}
							jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-public').data('value', 0);
							jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-archive').data('value', 0);
							if (data.room.public == "1"){
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-public').data('value', 1);
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-public').addClass('public');
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-public span').text(__('Public conversation', 'index-chat'));
							}
							if (data.room.archived == "1"){
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-archive').data('value', 1);
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-archive').addClass('archived');
								jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property.change-room-archive span').text(__('Conversation archived' , 'index-chat'));
								
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

			jQuery('body').on('click', '.index-chat-dialog .index-chat-dialog-popup.popup-room .index-chat-dialog-popup-property', function(e){
				if (jQuery(this).hasClass('change-room-public')){
					if (jQuery(this).data('value') == 0){
						jQuery(this).data('value', 1);
						jQuery(this).find('span').text(__('Public conversation', 'index-chat'));
						jQuery(this).addClass('public');
					}
					else {
						jQuery(this).data('value', 0);
						jQuery(this).find('span').text(__('Private conversation', 'index-chat'));
						jQuery(this).removeClass('public');
					}
				}
				if (jQuery(this).hasClass('change-room-archive')){
					if (jQuery(this).data('value') == 0){
						jQuery(this).data('value', 1);
						jQuery(this).find('span').text(__('Conversation archived' , 'index-chat'));
						jQuery(this).addClass('archived');
					}
					else {
						jQuery(this).data('value', 0);
						jQuery(this).find('span').text(__('Archive conversation' , 'index-chat'));
						jQuery(this).removeClass('archived');
					}
				}

				if (jQuery(this).hasClass('delete-room')){
					var room_id;
					if ($(this).closest('.index-chat-dialog').length > 0){
						room_id = $(this).closest('.index-chat-dialog').attr('data-room-id');
					}
					remove_room(room_id);
				}
			});


			jQuery('body').on('click', '.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-footer button', function(){
				let room_id = jQuery(this).closest('.index-chat-dialog').attr('data-room-id');
				let room_name = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title input').val();
				var archived_value = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup .index-chat-dialog-popup-content ul li.change-room-archive').data('value');
				var public_value = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup .index-chat-dialog-popup-content ul li.change-room-public').data('value');
				edit_room_details(room_id, room_name, public_value, archived_value);
			});

			jQuery('body').on('keypress', '.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title input', function(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					let room_id = jQuery(this).closest('.index-chat-dialog').data('room-id');
					let room_name = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room .index-chat-dialog-popup-title input').val();
					let public_checkbox = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room input[name="room-public-checkbox"]').is(':checked');
					let archived_checkbox = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room input[name="room-archived-checkbox"]').is(':checked');
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
					url: index_chat_datas.ajax_url,
					data: {
						'action': 'index_chat_edit_room_details',
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
							jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-popup.popup-room').remove();
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


function create_empty_room(room_id, reduced){
	var reducedClass = '';
	if (reduced){
		reducedClass = 'reduced'
	}
	let html = '<div class="index-chat-dialog updated '+reducedClass+'" data-room-offset="0" data-room-id="'+room_id+'" data-first-message="-1" data-last-message="-1"><div class="index-chat-dialog-reduced"> <img src="'+index_chat_datas.default_img+'" alt=""> </div><div class="index-chat-dialog-header"> <div class="index-chat-dialog-thumbnail"> <img src="'+index_chat_datas.default_img+'" alt=""> </div><div class="index-chat-dialog-title">Conversation sans nom</div><div class="index-chat-dialog-header-actions"> <div class="index-chat-dialog-header-action reduce-dialog"> <div class="index-chat-icon reduce"></div></div><div class="index-chat-dialog-header-action close-dialog"> <div class="index-chat-icon close"></div></div></div></div><div class="index-chat-dialog-content"></div><div class="index-chat-dialog-footer"> <input type="text"> <div class="send-btn"> <div class="index-chat-icon send"></div></div></div></div>';
	if (reduced){
		jQuery('#index-chat-menu-archives').prepend(html);
	}
	else {
		jQuery('#index-chat-dialogs').prepend(html);
	}
	
	listenForScrollEvent(jQuery(".index-chat-dialog[data-room-id="+room_id+"] .index-chat-dialog-content"));
}

function update_room_informations(room){
	if (room.room_id){
		if (room.room_thumbnails.length > 1){
			jQuery('.index-chat-dialog[data-room-id='+room.room_id+']').find('.index-chat-dialog-header .index-chat-dialog-thumbnail').addClass('grouped');
		}
		jQuery('.index-chat-dialog[data-room-id='+room.room_id+']').find('.index-chat-dialog-header .index-chat-dialog-thumbnail').empty();
		jQuery('.index-chat-dialog[data-room-id='+room.room_id+']').find('.index-chat-dialog-header .index-chat-dialog-thumbnail').append(display_room_thumbnail(room.room_id, room.room_thumbnails));
		jQuery('.index-chat-dialog[data-room-id='+room.room_id+']').find('.index-chat-dialog-header .index-chat-dialog-title').text(room.room_name);
		jQuery('.index-chat-dialog[data-room-id='+room.room_id+']').find('.index-chat-dialog-header .index-chat-dialog-title').attr('title', room.room_fullname);
	}
}

function update_room_messages(room_id, messages, first_message_id, last_message_id){
	if (room_id){
		jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-content').empty().append(messages);
		//scroll back to bottom
		jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-content').scrollTop(jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-content')[0].scrollHeight);
		jQuery('.index-chat-dialog[data-room-id='+room_id+']').attr('data-first-message', first_message_id);
		jQuery('.index-chat-dialog[data-room-id='+room_id+']').attr('data-last-message', last_message_id);
	}
}

function format_messages(messages){
	var messages_html = '';
	if (messages){
		jQuery.each(messages, function(key, val){
			if (val.type == ''){
				//self
				if (val.userID == index_chat_datas.user_id){
					messages_html += '<div data-id="'+val.id+'" class="index-chat-message self"><div class="index-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="index-chat-message-content"><div class="index-chat-message-details"><div class="index-chat-message-from">'+val.user.display_name+'</div> - <div class="index-chat-message-time">'+val.created+'</div></div><div class="index-chat-message-text">'+val.message+'</div></div></div>';
				}
				//other participants
				else {
					messages_html += '<div data-id="'+val.id+'" class="index-chat-message"><div class="index-chat-message-avatar"><img src="'+val.user.avatar+'" alt=""></div><div class="index-chat-message-content"><div class="index-chat-message-details"><div class="index-chat-message-from">'+val.user.display_name+'</div> - <div class="index-chat-message-time">'+val.created+'</div></div><div class="index-chat-message-text">'+val.message+'</div></div></div>';
				}
			}
			else if (val.type=='system'){
				messages_html += '<div data-id="'+val.id+'" class="index-chat-message system"><div class="index-chat-message-content"><div class="index-chat-message-text">'+val.message+'</div></div></div>';
			}

		});
	}
	return messages_html;
}

function create_room_box(data){
	var room_open = false;
	var room_reduced = false;
	jQuery('body').find('.index-chat-dialog').each(function(){
		if (jQuery(this).attr('data-room-id') == data.room_id){
			room_open = true;
			if (jQuery(this).hasClass('reduced')){
				room_reduced = true;
			}
		}
	});
	if (room_open){
		if (room_reduced) {
			var room = jQuery('.index-chat-dialog[data-room-id='+data.room_id+']');
			room.removeClass('reduced');
			room.prependTo('#index-chat-dialogs');
		}
	}
	else {
		if (data.is_reduced){
			room_reduced = true;
		}
		create_empty_room(data.room_id, room_reduced);
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

function index_chat_toggle_menu_window(){
	if (!jQuery('#index-chat-window').length){
	  console.warn( __( 'index-chat window is not enabled', 'index-chat') );
	  return false;
	}
	if (jQuery('#index-chat-window').hasClass('active')){
	  jQuery('#index-chat-window').removeClass('active');
	}
	else {
	  jQuery('#index-chat-window').addClass('active');
	}
}

function listenForScrollEvent(el){
	el.on("scroll", function(){
		el.trigger("dialog-scroll");
	});
}

function display_room_thumbnail(room_id, thumbnails){
	var thumbnails_html = '<div class="index-chat-room-thumbnail-image"><img src="'+index_chat_datas.default_img+'" alt=""></div>';
	if (thumbnails != undefined && thumbnails.length > 0){
		thumbnails_html = '';
		jQuery.each(thumbnails, function(key, val){
			thumbnails_html += '<div class="index-chat-room-thumbnail-image"><img src="'+val+'" alt=""></div>';

		});
	}
	return thumbnails_html;
}

function wpChatSetCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function wpChatGetCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function wpChatEraseCookie(name) {   
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function wpChatUpdateUserRoomsDatas(){
	var rooms = [];

	jQuery('.index-chat-window-archive').each(function(){
		var room = {
			id : jQuery(this).data('room-id'),
			is_open : false,
			offset : 0,
			is_active : false,
			is_reduced : false
		};
		if (jQuery('.index-chat-dialog[data-room-id="'+room['id']+'"]').length > 0){
			room.is_open = true;
			room.offset = jQuery('.index-chat-dialog[data-room-id="'+room['id']+'"]').data('room-offset');
			if (!jQuery('.index-chat-dialog[data-room-id="'+room['id']+'"]').hasClass('scrolling') && 
				!jQuery('.index-chat-dialog[data-room-id="'+room['id']+'"]').hasClass('reduced') && 
				isTabActive ){
				room.is_active = true;
			}
			if (jQuery('.index-chat-dialog[data-room-id="'+room['id']+'"]').hasClass('reduced')){
				room.is_reduced = true;
			}
		}

		rooms.push(room);
	});

	if (rooms.length > 0){
		wpChatSetCookie('index-chat-user-cookie-'+index_chat_datas.user_id, JSON.stringify(rooms), 30);
	}			
	user_data_rooms = rooms;
	return rooms;
}

function wpChatReduceRoom(room_id){
	if (!room_id || room_id == 0 || room_id < 0)
		return;
	var title = jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-header .index-chat-dialog-title').attr('title');
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').attr('title', title);
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').addClass('reduced');
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').appendTo('#index-chat-menu-archives');
	wpChatUpdateUserRoomsDatas();
}

function wpChatUnreduceRoom(room_id){
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').removeClass('reduced');
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').prependTo('#index-chat-dialogs');
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-content').scrollTop(jQuery('.index-chat-dialog[data-room-id='+room_id+']').find('.index-chat-dialog-content')[0].scrollHeight);
	jQuery('.index-chat-dialog[data-room-id='+room_id+']').attr('title', '');
	wpChatUpdateUserRoomsDatas();
}

function removeRoomFromUserData(room_id){
	if (user_data_rooms.length > 0){
		jQuery.each(user_data_rooms, function (key, room){
			if (room.id == room_id){
				delete user_data_rooms[key];
			}
		});
	}
}