<?php
/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 */
class Wp_Chat_Public {

	/**
	 * The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 */
	private $version;

	private $options;

	private $user_id;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct( $plugin_name, $version, $options ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		$this->options = $options;

		$this->message_amount = 50;

		$this->user_id = get_current_user_id();

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/models/wp-chat-model-database.php';
		$this->model = new Wp_Chat_Model_Database($this->plugin_name, $this->version);

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/partials/wp-chat-public-display.php';
		$this->view = new Wp_Chat_Public_View($this->plugin_name, $this->version);

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-chat-public.css', array(), $this->version, 'all' );
		wp_enqueue_style( $this->plugin_name.'-dialog-blank', plugin_dir_url( __FILE__ ) . 'css/wp-chat-public-dialog-blank.css', array(), $this->version, 'all' );
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-chat-public.js', array( 'wp-i18n', 'jquery' ), $this->version, false );
		wp_enqueue_script( $this->plugin_name.'-dialog-blank', plugin_dir_url( __FILE__ ) . 'js/wp-chat-public-dialog-blank.js', array( 'wp-i18n', 'jquery' ), $this->version, false );
		
		wp_set_script_translations( $this->plugin_name, $this->plugin_name, plugin_dir_path(__DIR__).'languages/' );

		wp_localize_script(
			$this->plugin_name,
			'wp_chat_datas',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'plugin_name' => $this->plugin_name,
				'user_id' => get_current_user_id(),
				'default_img' => plugin_dir_url( __FILE__ ).'img/default.png',
				'text_extract_length' => 40,
				'wp_chat_options' => $this->wp_chat_get_admin_options(),
				'message_amount' => $this->message_amount,
			)
		);
	}

	private function error_message($e){
		$response = array(
			'success' => false,
			'message' => $e->getMessage()
		);
		die(json_encode($response));
	}
	
	/**
	 * Load translations
	 */
	public function wp_chat_load_textdomain() {
		load_plugin_textdomain( 'wp-chat', FALSE, plugin_dir_path(__DIR__).'languages/' );
	}

	private function wp_chat_get_admin_options(){
		$general_settings_defaults = $this->options['wp-chat-general-settings-default'];
		$options = wp_parse_args(get_option('wp-chat-general-settings'), $general_settings_defaults);
		return $options;
	}

	private function is_user_logged_in(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			throw new Exception(__( 'You must be connected to be able to do that' , 'wp-chat' ));
		}
		return $this->user_id;
	}

	public function wp_chat_search_users(){
		try {
			$this->is_user_logged_in();
			
			//prevent empty search query (possibly too many results)
			if (isset($_REQUEST['search']) && !empty($_REQUEST['search'])){
				$search = $_REQUEST['search'];
			}
			else {
				$response = array(
					'success' => true,
					'matches' => array()
				);
				die( json_encode($response) );
			}

			$room_id = null;
			if (isset($_REQUEST['room_id']) && !empty($_REQUEST['room_id']) && !empty(intval($_REQUEST['room_id'])) ){
				$room_id = esc_attr(intval($_REQUEST['room_id']));
			}
	
			$search_matches = $this->model->search_users_matches($search);
			
			if (isset($search_matches) && !empty($search_matches) && is_array($search_matches)){
				//check if user is not already in list if room is already created
				if (isset($room_id) && !empty($room_id)){
					foreach ($search_matches as $key => $match){
						if ($this->model->is_participant_in_room($room_id, $match['ID'])){
							unset($search_matches[$key]);
						}
					}
				}
				$response = array(
					'success' => true,
					'matches' => $search_matches
				);
				die( json_encode($response) );
			}
	
			$response = array(
				'success' => true,
				'matches' => array()
			);
			die( json_encode($response) );
		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function wp_chat_get_blank_dialog(){
		$this->view->blank_dialog_view();
		die();
	}
	public function wp_chat_get_participant_popup(){
		$this->view->participant_popup_view();
		die();
	}
	public function wp_chat_get_room_details_popup(){
		try {
			$this->is_user_logged_in();

			if (!isset($_REQUEST['room']) || empty($_REQUEST['room'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room']));
	
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}
	
			if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
				throw new Exception(__( 'You are not in this conversation' , 'wp-chat' ).'.');
			}
			
			$isOwner = false;
			if (isset($room->ownerID) && !empty($room->ownerID)){
				if ($room->ownerID == $this->user_id){
					$isOwner = true;
				}
			}
			
			$this->view->room_details_popup_view($isOwner);
			die();
		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function add_chat_section(){
		$this->view->default_view();
	}

	public function wp_chat_send_message(){
		try {
			$this->is_user_logged_in();

			if (!isset($_REQUEST['room']) || empty($_REQUEST['room'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['message']) || empty($_REQUEST['message'])){
				throw new Exception(__( 'Message cannot be empty' , 'wp-chat' ).'.');
			}

			$from = $this->model->get_user_by_id($this->user_id);

			if (!isset($from) || empty($from)){
				throw new Exception(__( 'User cannot be found' , 'wp-chat' ).'.');
			}

			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room']));

			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}

			if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
				throw new Exception(__( 'You are not in this conversation' , 'wp-chat' ).'.');
			}

			if($this->model->send_message($room->id, $from['id'], stripcslashes($_REQUEST['message']), '')){
				$response = array(
					'success' => true,
					'message' => __( 'Message sent' , 'wp-chat' ).'.',
				);
			}
			else {
				throw new Exception(__( 'An error occured, please try again' , 'wp-chat' ).'.');
			}
			die(json_encode($response));
		}
		catch (Exception $e){
			$this->error_message($e);
		}

	}

	public function wp_chat_create_room(){
		try {
			$this->is_user_logged_in();

			$room_params = array(
				'success' => true,
				'room_id' => null,
				'room_participants' => array(),
				'room_name' => '',
				'room_public' => '',
				'room_thumbnails' => array(),
				'messages' => array(),
			);
	
			if (isset($_REQUEST['room_name']) && !empty($_REQUEST['room_name']) ){
				$room_name = trim(esc_attr($_REQUEST['room_name']));
				$room_params['room_name'] = $room_name;
			}
	
			if (isset($_REQUEST['participants']) && !empty($_REQUEST['participants']) ){
				$participants = $_REQUEST['participants'];
				if (isset($participants) && !empty($participants) && is_array($participants)){
					foreach($participants as $pkey => $participant_id){
						$participant_id = intval($participant_id);
	
						$to = $this->model->get_user_by_id($participant_id);
	
						if (!isset($to) || empty($to)){
							throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
						};
	
						array_push( $room_params['room_participants'], intval($to['id']) );
						array_push( $room_params['room_thumbnails'], $to['avatar']);
					}
				}
			}
	
			if (isset($_REQUEST['room_public']) && !empty($_REQUEST['room_public']) ){
				$room_public = esc_attr($_REQUEST['room_public']);
				if ($room_public === 'true' ){
					$room_params['room_public'] = true;
				}
				else {
					$room_params['room_public'] = false;
				}
			}
	
			if ($this->model->check_tables()){
	
				//if there's only 1 participant and the room is PRIVATE, we search for an existing room
				if (isset($room_params['room_participants']) && !empty($room_params['room_participants']) && sizeof($room_params['room_participants']) == 1 && !$room_params['room_public']){
					$room_id = $this->model->is_room_between(esc_attr($room_params['room_participants'][0]), $this->user_id);
					$room_params['room_id'] = $room_id;
				}
				
				//if there's NO PARTICIPANT and the room is PRIVATE, we cannot create the room
				if (sizeof($room_params['room_participants']) == 0 && !$room_params['room_public']){
					throw new Exception(__( "You must add at least 1 participant to create a private room" , 'wp-chat' ).'.');
				}
	
				if (!isset($room_id) || empty($room_id)){
					$room_id = $this->model->create_room_2($room_params, $this->user_id);
					$room_params['room_id'] = $room_id;
				}
	
				$room = $this->model->get_room_details_by_id($room_id, $this->user_id);
	
				if (isset($room) && !empty($room)){
					if (isset($room['room_name']) && !empty($room['room_name'])){
						$room_params['room_name'] = $room['room_name'];
					}
					if (isset($room['room_thumbnails']) && !empty($room['room_thumbnails'])){
						$room_params['room_thumbnails'] = $room['room_thumbnails'];
					}
				}
	
				$room_params['messages'] = $this->model->get_message_by_room($room_id, $this->message_amount);
	
				die(json_encode($room_params));
			}
	
	
			$response = array(
				'success' => false,
				'message' => __( 'An error occured, please try again' , 'wp-chat' ).'.',
			);
			die(json_encode($response));

		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function wp_chat_get_room_participants(){
		try {
			$this->is_user_logged_in();

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			$user = $this->model->get_user_by_id($this->user_id);
	
			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}
	
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}
	
			$isOwner = false;
			if ($room->ownerID == $this->user_id){
				$isOwner = true;
			}
	
			$participants = $this->model->get_room_participants(esc_attr($_REQUEST['room_id']), $this->user_id, true);
			if (isset($participants) && !empty($participants) && is_array($participants)){
				foreach($participants as $kp => $participant){
					if ($participant['id'] == $room->ownerID){
						$participants[$kp]['owner'] = true;
					}
					else {
						$participants[$kp]['owner'] = false;
					}
				}
			}
	
			$response = array(
				'success' => true,
				'participants' => $participants,
				'isOwner' => $isOwner,
			);
			die(json_encode($response));
		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function wp_chat_add_room_participant(){
		try {
			$this->is_user_logged_in();

			$user = $this->model->get_user_by_id($this->user_id);
			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['added_user_id']) || empty($_REQUEST['added_user_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}

			$added_user = $this->model->get_user_by_id($_REQUEST['added_user_id']);
			if (!isset($added_user) || empty($added_user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}

			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));

			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}

			if ( $this->model->is_participant_in_room($room->id, esc_attr($_REQUEST['added_user_id']) ) ){
				throw new Exception(__('This user is already in this conversation', 'wp-chat').'.');
			}

			if ( $this->model->create_participant($room->id, esc_attr($_REQUEST['added_user_id']) ) ){
				$message = '';
				if (isset($added_user) && !empty($added_user) && isset($user) && !empty($user)){
					$message = sprintf(__('%1$s has been added to the conversation by %2$s', 'wp-chat'), $added_user['display_name'], $user['display_name']).'.';
				}
				else if (isset($added_user) && !empty($added_user)){
					$message = sprintf(__('%s has been added to the conversation', 'wp-chat'), $added_user['display_name']).'.';
				}
				else if (isset($user) && !empty($user)) {
					$message = sprintf(__( 'Somebody has been added to the conversation by %s' , 'wp-chat' ), $user['display_name']).'.';
				}
				else {
					$message = __( 'Somebody has been added to the conversation' , 'wp-chat' ).'.';
				}
				$this->model->send_system_message($room->id, $message);

				$response = array(
					'success' => true,
				);
				die(json_encode($response));
			}
			else {
				throw new Exception(__( 'An error occured, please try again' , 'wp-chat' ).'.');
			}

		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function wp_chat_remove_room_participant(){
		try {
			$this->is_user_logged_in();

			$user = $this->model->get_user_by_id($this->user_id);

			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['removed_user_id']) || empty($_REQUEST['removed_user_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			$removed_user = $this->model->get_user_by_id($_REQUEST['removed_user_id']);
			if (!isset($removed_user) || empty($removed_user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}

			if ($room->ownerID != $this->user_id){
				throw new Exception(__( 'You are not the owner of this conversation' , 'wp-chat' ).'.');
			}

			if ($room->ownerID == esc_attr($_REQUEST['removed_user_id'])){
				throw new Exception(__( 'The owner of the conversation cannot be removed from it' , 'wp-chat' ).'.');
			}

			if ($this->model->remove_participant_from_room($room->id, esc_attr($_REQUEST['removed_user_id']))){
				$message = '';
				if (isset($removed_user) && !empty($removed_user) && isset($user) && !empty($user)){
					$message = sprintf(__('%1$s has been removed from the conversation by %2$s', 'wp-chat'), $removed_user['display_name'], $user['display_name']).'.';
				}
				else if (isset($removed_user) && !empty($removed_user)){
					$message = sprintf(__('%s has been removed from the conversation', 'wp-chat'), $removed_user['display_name']).'.';
				}
				else if (isset($user) && !empty($user)) {
					$message = sprintf(__( 'Somebody has been removed from the conversation by %s' , 'wp-chat' ), $user['display_name']).'.';
				}
				else {
					$message = __( 'Somebody has been removed from the conversation' , 'wp-chat' ).'.';
				}
				$this->model->send_system_message($room->id, $message);
				$response = array(
					'success' => true,
				);
			}
			else {
				throw new Exception(__( 'An error occured, please try again' , 'wp-chat' ).'.');
			}

			die(json_encode($response));

		}
		catch (Exception $e){
			$this->error_message($e);
		}

	}

	public function wp_chat_open_room(){
		try {
			$this->is_user_logged_in();

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
	
			$user = $this->model->get_user_by_id($this->user_id);
	
			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}
	
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
	
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}
	
			if ($room->public == '0'){
				if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
					throw new Exception(__( 'You are not allowed to see this conversation' , 'wp-chat' ).'.');
				}
			}
			else {
				if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
					$this->model->create_participant($room->id, $this->user_id);
					$user = get_user_by('id', $this->user_id);
					$message = sprintf(__( '%s joined the room' , 'wp-chat' ), $user->data->display_name).'.';
					$this->model->send_system_message($room->id, $message);
				}
			}		
	
			$room_details = $this->model->get_room_details_by_id($room->id, $this->user_id);
	
			$response = array(
				'success' => true,
				'room_id' => $room->id,
				'room_name' => $room_details['room_name'],
				'room_thumbnails' => $room_details['room_thumbnails'],
				'messages' => array(),
			);
	
			if (isset($room->name) && !empty($room->name))
				$response['room_name'] = $room->name;
	
			$response['messages'] = $this->model->get_message_by_room($room->id, $this->message_amount);
			die(json_encode($response));
		}
		catch (Exception $e){
			$this->error_message($e);
		}

	}

	public function wp_chat_leave_room(){
		try {
			$this->is_user_logged_in();

			$user = $this->model->get_user_by_id($this->user_id);

			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}

			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}

			if ($this->model->is_participant_in_room($room->id, $this->user_id)){
				if ($this->model->remove_participant_from_room($room->id, $this->user_id)){
					$message = '';
					if (isset($user) && !empty($user)){
						$message = sprintf(__( '%s left the conversation' , 'wp-chat' ), $user['display_name']).'.';
					}
					else {
						$message = __( 'Somebody left the conversation' , 'wp-chat' ).'.';
					}
					$message.= '.';
					$this->model->send_system_message($room->id, $message);
					$response = array(
						'success' => true,
					);
				}
				else {
					throw new Exception(__( 'An error occured, please try again' , 'wp-chat' ).'.');
				}

			}
			else {
				throw new Exception(__( 'You are not in this conversation' , 'wp-chat' ).'.');
			}
			die(json_encode($response));

		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function wp_chat_remove_room(){
		try {
			$this->is_user_logged_in();

			$user = $this->model->get_user_by_id($this->user_id);
			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}

			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}

			if ($this->model->is_room_owner($room->id, $this->user_id)){
				if ($this->model->remove_room($room->id)){
					$response = array(
						'success' => true,
						'message' => __( "Room removed successfully." , 'wp-chat' ).'.',
					);
				}
				else {
					throw new Exception(__( "Failed to remove the room. Please try again." , 'wp-chat' ).'.');
				}
			}
			else {
				throw new Exception(__( "You must be the owner of the conversation to do this." , 'wp-chat' ).'.');
			}
			die(json_encode($response));

		}
		catch (Exception $e){
			$this->error_message($e);
		}
	}

	public function randomPassword() {
		$alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		$pass = array(); //remember to declare $pass as an array
		$alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
		for ($i = 0; $i < 8; $i++) {
			$n = rand(0, $alphaLength);
			$pass[] = $alphabet[$n];
		}
		return implode($pass); //turn the array into a string
	}

	private function update_read_messages($rooms){
		try {
			if (!isset($rooms) || empty($rooms) || sizeof($rooms) == 0){
				return;
			}
			foreach($rooms as $key => $room_data){
				$room = $this->model->get_room_by_id(intval($room_data['id']));
	
				if (!isset($room) || empty($room)){
					return;
				}

				if (isset($room_data['is_active']) && !empty($room_data['is_active']) && $room_data['is_active'] == 'true'){
					
					$nb_message_to_load = $this->message_amount;

					$nb_message_to_load+= intval($room_data['offset']);
	
					$this->model->update_room_message_read_status($room->id, $this->user_id, $nb_message_to_load);
				}
			}

		}
		catch (Exception $e) {
			$this->error_message($e);
		}
	}

	public function wp_chat_refresh_view(){
		try {
			$this->model->check_tables();
			$this->user_id = get_current_user_id();
			
			if (!isset($this->user_id) || empty($this->user_id)){
				$response = array(
					'success' => false,
					'message' => __( 'You must be connected to be able to do that', 'wp-chat' ).'.',
				);
				die(json_encode($response));
			}

			$rooms_datas = null;
			if (isset($_REQUEST['rooms']) && !empty($_REQUEST['rooms'])){
				$rooms_datas = $_REQUEST['rooms'];
				$this->update_read_messages($rooms_datas);
			}
	
			$user_rooms = $this->model->get_user_private_rooms($this->user_id);
			$public_rooms = $this->model->get_public_rooms($this->user_id);
			$found_rooms = array_merge($user_rooms, $public_rooms);
	
			$rooms = array();
	
			if (isset($found_rooms) && !empty($found_rooms) && is_array($found_rooms)){
				foreach($found_rooms as $kr => $room){
					$isOwner = false;
					if (isset($room->ownerID) && !empty($room->ownerID)){
						if ($room->ownerID == $this->user_id){
							$isOwner = true;
						}
					}
					$current_room = array(
						'is_user_in' => false,
						'room_id' => $room->id,
						'ownerID' => $room->ownerID,
						'last_message' => strtotime($room->lastMessage),
						'public' => $room->public,
						'archived' => $room->archived,
						'created' => $room->created,
						'is_owner' => $isOwner,
						'is_open' => false,
						'is_active' => false,
						'is_reduced' => false,
					);

					if ($this->model->is_participant_in_room($room->id, $this->user_id)){
						$current_room['is_user_in'] = true;
					}
					$room_details = $this->model->get_room_details_by_id($room->id, $this->user_id);
					if (isset($room->name) && !empty($room->name)){
						$current_room['room_name'] = $room->name;
						$current_room['room_fullname'] = $room->name;
					}
					else {
						$current_room['room_name'] = $room_details['room_name'];
						$current_room['room_fullname'] = $room_details['room_name'];
					}
					if (strlen($current_room['room_name']) > 20){
						$current_room['room_name'] = substr($current_room['room_name'], 0, 20).'...';
					}
					$current_room['room_thumbnails'] = $room_details['room_thumbnails'];

					$nb_message_to_load = $this->message_amount;

					if (isset($rooms_datas) && !empty($rooms_datas) && sizeof($rooms_datas) > 0){
						foreach ($rooms_datas as $key => $room_data){
							if ($room_data['id'] == $current_room['room_id']){
								$nb_message_to_load+= intval($room_data['offset']);
								$current_room['is_open'] = filter_var($room_data['is_open'], FILTER_VALIDATE_BOOLEAN);
								$current_room['is_active'] = filter_var($room_data['is_active'], FILTER_VALIDATE_BOOLEAN);
								$current_room['is_reduced'] = filter_var($room_data['is_reduced'], FILTER_VALIDATE_BOOLEAN);
							}
						}
					}

					$current_room['messages'] = $this->model->get_message_by_room($room->id, $nb_message_to_load);
	
					array_push($rooms, $current_room);
	
				}
			}
			$response = array(
				'success' => true,
				'content' => $rooms,
			);
			die(json_encode($response));
		}
		catch (Exception $e) {
			$this->error_message($e);
		}
	}

	public function wp_chat_get_room_details(){
		try {
			$this->is_user_logged_in();
			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}
			if (!isset($room->name) || empty($room->name)){
				$room_details = $this->model->get_room_details_by_id(esc_attr($_REQUEST['room_id']), $this->user_id);
				$room->name = $room_details['room_name'];
				$room->thumbnails = $room_details['room_thumbnails'];
			}
			$response = array(
				'success' => true,
				'room' => $room,
			);
			die(json_encode($response));
		}
		catch (Exception $e){
			$this->error_message($e);
		}


	}

	public function wp_chat_edit_room_details(){
		try {
			$this->is_user_logged_in();

			$user = $this->model->get_user_by_id($this->user_id);

			if (!isset($user) || empty($user)){
				throw new Exception(__( 'User is not existing' , 'wp-chat' ).'.');
			}
	
			if (!isset($_REQUEST['room_name'])){
				throw new Exception(__( 'Conversation name is required' , 'wp-chat' ).'.');
			}

			if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
				throw new Exception(__( 'Missing informations' , 'wp-chat' ).'.');
			}
			
			$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
			$participants = $this->model->get_room_participants(esc_attr($_REQUEST['room_id']), $this->user_id, true);
	
			//if there is more than 2 participants, we check if current user is owner
			// if (sizeof($participants) > 2){
			// 	if ($this->user_id != $room->ownerID){
			// 		$response = array(
			// 			'success' => false,
			// 			'message' => "You don't have the permission to do that."
			// 		);
			// 		die(json_encode($response));
			// 	}
			// }
	
			if (!isset($room) || empty($room)){
				throw new Exception(__( 'Conversation cannot be found' , 'wp-chat' ).'.');
			}
	
			$public = '0';
			$archived = '0';
			
			if ( esc_attr($_REQUEST['public']) == 'true' || esc_attr($_REQUEST['public']) == '1' ){
				$public = '1';
			}

			if ( esc_attr($_REQUEST['archived']) == 'true' || esc_attr($_REQUEST['archived']) == '1' ){
				$archived = '1';
			}

			$this->model->edit_room_details($room->id, stripcslashes($_REQUEST['room_name']), $public, $archived );
		
			if (empty($_REQUEST['room_name'])){
				$message = sprintf(__( '%s has removed the title of this conversation' , 'wp-chat' ), $user['display_name']).'.';
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->name != esc_attr($_REQUEST['room_name'])){
				$message = sprintf(__('%1$s has changed the title of this conversation for "%2$s"', 'wp-chat'), $user['display_name'], $_REQUEST['room_name']).'.';
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->public != $public){
				if ($room->public == '0'){
					$message = __( 'This conversation is now public' , 'wp-chat' ).'.';
				}
				if ($room->public == '1'){
					$message = __( 'This conversation is now private' , 'wp-chat' ).'.';
				}
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->archived != $archived){
				if ($room->archived == '0'){
					$message = sprintf(__( 'This conversation has been archived by %s' , 'wp-chat' ), $user['display_name']).'.';
				}
				if ($room->archived == '1'){
					$message = __( 'This conversation is no longer archived' , 'wp-chat' );
				}
				$this->model->send_system_message($room->id, $message);
			}
			
			$response = array(
				'success' => true,
				'room' => $room,
			);

			die(json_encode($response));

		}
		catch (Exception $e){
			$this->error_message($e);
		}

	}


}
