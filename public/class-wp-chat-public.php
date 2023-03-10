<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://https://vianneyain.com/
 * @since      1.0.0
 *
 * @package    Wp_Chat
 * @subpackage Wp_Chat/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Wp_Chat
 * @subpackage Wp_Chat/public
 * @author     Vianney AÏN <vianney.iwm@gmail.com>
 */
class Wp_Chat_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	private $user_id;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

		$this->user_id = get_current_user_id();

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/models/wp-chat-model-database.php';
		$this->model = new Wp_Chat_Model_Database($this->plugin_name, $this->version);

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/partials/wp-chat-public-display.php';
		$this->view = new Wp_Chat_Public_View($this->plugin_name, $this->version);

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Chat_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Chat_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-chat-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-chat-public.js', array( 'wp-i18n', 'jquery' ), $this->version, false );
		
		wp_set_script_translations( $this->plugin_name, $this->plugin_name, plugin_dir_path(__DIR__).'languages/' );

		wp_localize_script(
			$this->plugin_name,
			'wp_chat_ajax',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'plugin_name' => $this->plugin_name,
				'user_id' => get_current_user_id(),
				'default_img' => plugin_dir_url( __FILE__ ).'img/default.png',
				'text_extract_length' => 40
			)
		);
	}
	
	/**
	 * Load translations
	 */
	public function wp_chat_load_textdomain() {
		load_plugin_textdomain( 'wp-chat', FALSE, plugin_dir_path(__DIR__).'languages/' );
	}

	public function wp_chat_search_users(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
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
		$users = new WP_User_Query( array(
		    'search'         => '*'.esc_attr( $search ).'*',
		    'search_columns' => array(
		        'user_login',
		        'user_nicename',
		        'user_firstname',
				'user_lastname',
		        'user_email',
		        'user_display_name',
		    ),
		) );
		$users_found = $users->get_results();
		//$users_found = get_users( array( 'search' => esc_attr( $search ) ) );

		$matches = array();
		foreach($users_found as $key => $user){
			$match = array(
				'ID' => $user->data->ID,
				'display_name' => $user->data->display_name
			);
			array_push($matches, $match);
		}
		$response = array(
			'success' => true,
			'matches' => $matches
		);
		die( json_encode($response) );
	}

	public function wp_chat_search_participant(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
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
		$users = new WP_User_Query( array(
		    'search'         => '*'.esc_attr( $search ).'*',
		    'search_columns' => array(
		        'user_login',
		        'user_nicename',
		        'user_firstname',
				'user_lastname',
		        'user_email',
		        'user_display_name',
		    ),
		) );
		$users_found = $users->get_results();

		$matches = array();
		foreach($users_found as $key => $user){
			$match = array(
				'ID' => $user->data->ID,
				'display_name' => $user->data->display_name
			);
			array_push($matches, $match);
		}
		$response = array(
			'success' => true,
			'matches' => $matches
		);
		die( json_encode($response) );
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
		$this->view->room_details_popup_view();
		die();
	}

	public function add_chat_section(){
		$this->view->default_view();
	}

	public function wp_chat_send_message(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room']) || empty($_REQUEST['room'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['message']) || empty($_REQUEST['message'])){
			$response = array(
				'success' => false,
				'message' => __( 'Message cannot be empty' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$from = $this->model->get_user_by_id($this->user_id);

		if (!isset($from) || empty($from)){
			$response = array(
				'success' => false,
				'message' => __( 'User cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room']));

		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You are not in this conversation' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if($this->model->send_message($room->id, $from['id'], stripcslashes($_REQUEST['message']), '')){
			$response = array(
				'success' => true,
				'message' => __( 'Message sent' , $this->plugin_name ).'.',
			);

		}
		else {
			$response = array(
				'success' => false,
				'message' => __( 'An error occured, please try again' , $this->plugin_name ).'.',
			);
		}
		die(json_encode($response));
	}

	public function wp_chat_create_room(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['to']) || empty($_REQUEST['to'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($_REQUEST['to'] == $this->user_id){
			$response = array(
				'success' => false,
				'message' => __( 'Cannot create conversation for yourself' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$to = $this->model->get_user_by_id(esc_attr($_REQUEST['to']));

		if (!isset($to) || empty($to)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$response = array(
			'success' => true,
			'room_id' => null,
			'room_thumbnails' => array(0 => $to['avatar']),
			'room_name' => $to['display_name'],
			'messages' => array(),
		);
		
		if ($this->model->check_tables()){
			if (isset($_REQUEST['to']) && !empty($_REQUEST['to']) ){
				$room_id = $this->model->has_solo_room(esc_attr($_REQUEST['to']), $this->user_id);
				if (!isset($room_id) || empty($room_id)){
					$room_id = $this->model->create_room(esc_attr($_REQUEST['to']), $this->user_id);
				}
				$response['room_id'] = $room_id;
				$room = $this->model->get_room_by_id($room_id);
				if (isset($room->name) && !empty($room->name))
					$response['room_name'] = $room->name;
				$response['messages'] = $this->model->get_message_by_room($room_id);
				die(json_encode($response));
			}
		}
		$response = array(
			'success' => false,
			'message' => __( 'An error occured, please try again' , $this->plugin_name ).'.',
		);
		die(json_encode($response));
	}

	public function wp_chat_get_room_participants(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$user = $this->model->get_user_by_id($this->user_id);

		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
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

	public function wp_chat_add_room_participant(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$user = $this->model->get_user_by_id($this->user_id);
		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['added_user_id']) || empty($_REQUEST['added_user_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$added_user = $this->model->get_user_by_id($_REQUEST['added_user_id']);
		if (!isset($added_user) || empty($added_user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ( $this->model->is_participant_in_room($room->id, esc_attr($_REQUEST['added_user_id']) ) ){
			$response = array(
				'success' => false,
				'message' => __('This user is already in this conversation', $this->plugin_name).'.',
			);
			die(json_encode($response));
		}

		if ( $this->model->create_participant($room->id, esc_attr($_REQUEST['added_user_id']) ) ){
			$message = '';
			if (isset($added_user) && !empty($added_user) && isset($user) && !empty($user)){
				$message = sprintf(__('%1$s has been added to the conversation by %2$s', $this->plugin_name), $added_user['display_name'], $user['display_name']).'.';
			}
			else if (isset($added_user) && !empty($added_user)){
				$message = sprintf(__('%s has been added to the conversation', $this->plugin_name), $added_user['display_name']).'.';
			}
			else if (isset($user) && !empty($user)) {
				$message = sprintf(__( 'Somebody has been added to the conversation by %s' , $this->plugin_name ), $user['display_name']).'.';
			}
			else {
				$message = __( 'Somebody has been added to the conversation' , $this->plugin_name ).'.';
			}
			$this->model->send_system_message($room->id, $message);

			$response = array(
				'success' => true,
			);
			die(json_encode($response));
		}
		else {
			$response = array(
				'success' => false,
				'message' => __( 'An error occured, please try again' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

	}

	public function wp_chat_remove_room_participant(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$user = $this->model->get_user_by_id($this->user_id);

		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['removed_user_id']) || empty($_REQUEST['removed_user_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$removed_user = $this->model->get_user_by_id($_REQUEST['removed_user_id']);
		if (!isset($removed_user) || empty($removed_user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($room->ownerID != $this->user_id){
			$response = array(
				'success' => false,
				'message' => __( 'You are not the owner of this conversation' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($room->ownerID == esc_attr($_REQUEST['removed_user_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'The owner of the conversation cannot be removed from it' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($this->model->remove_participant_from_room($room->id, esc_attr($_REQUEST['removed_user_id']))){
			$message = '';
			if (isset($removed_user) && !empty($removed_user) && isset($user) && !empty($user)){
				$message = sprintf(__('%1$s has been removed from the conversation by %2$s', $this->plugin_name), $removed_user['display_name'], $user['display_name']).'.';
			}
			else if (isset($removed_user) && !empty($removed_user)){
				$message = sprintf(__('%s has been removed from the conversation', $this->plugin_name), $removed_user['display_name']).'.';
			}
			else if (isset($user) && !empty($user)) {
				$message = sprintf(__( 'Somebody has been removed from the conversation by %s' , $this->plugin_name ), $user['display_name']).'.';
			}
			else {
				$message = __( 'Somebody has been removed from the conversation' , $this->plugin_name ).'.';
			}
			$this->model->send_system_message($room->id, $message);
			$response = array(
				'success' => true,
			);
		}
		else {
			$response = array(
				'success' => false,
				'message' => __( 'An error occured, please try again' , $this->plugin_name ).'.',
			);
		}


		die(json_encode($response));
	}

	public function wp_chat_open_room(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$user = $this->model->get_user_by_id($this->user_id);

		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));

		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($room->public == '0'){
			if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
				$response = array(
					'success' => false,
					'message' => __( 'You are not allowed to see this conversation' , $this->plugin_name ).'.',
				);
				die(json_encode($response));
			}
		}
		else {
			if (!$this->model->is_participant_in_room($room->id, $this->user_id)){
				$this->model->create_participant($room->id, $this->user_id);
				$user = get_user_by('id', $this->user_id);
				$message = sprintf(__( '%s joined the room' , $this->plugin_name ), $user->data->display_name).'.';
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

		$response['messages'] = $this->model->get_message_by_room($room->id);
		die(json_encode($response));
	}

	public function wp_chat_leave_room(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$user = $this->model->get_user_by_id($this->user_id);
		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if ($this->model->is_participant_in_room($room->id, $this->user_id)){
			if ($this->model->remove_participant_from_room($room->id, $this->user_id)){
				$message = '';
				if (isset($user) && !empty($user)){
					$message = sprintf(__( '%s left the conversation' , $this->plugin_name ), $user['display_name']).'.';
				}
				else {
					$message = __( 'Somebody left the conversation' , $this->plugin_name ).'.';
				}
				$message.= '.';
				$this->model->send_system_message($room->id, $message);
				$response = array(
					'success' => true,
				);
			}
			else {
				$response = array(
					'success' => false,
					'message' => __( 'An error occured, please try again' , $this->plugin_name ).'.',
				);
			}

		}
		else {
			$response = array(
				'success' => false,
				'message' => __( 'You are not in this conversation' , $this->plugin_name ).'.',
			);
		}
		die(json_encode($response));
	}

	public function wp_chat_refresh_view(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$user_rooms = $this->model->get_user_private_rooms($this->user_id);
		$public_rooms = $this->model->get_public_rooms($this->user_id);
		$found_rooms = array_merge($user_rooms, $public_rooms);

		$rooms = array();

		if (isset($found_rooms) && !empty($found_rooms) && is_array($found_rooms)){
			foreach($found_rooms as $kr => $room){
				$current_room = array(
					'is_user_in' => false,
					'room_id' => $room->id,
					'ownerID' => $room->ownerID,
					'last_message' => strtotime($room->lastMessage),
					'public' => $room->public,
					'archived' => $room->archived,
					'created' => $room->created
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
				$current_room['messages'] = $this->model->get_message_by_room($room->id);

				//if user participate to the room
				if ($this->model->is_participant_in_room($room->id, $this->user_id)){
					$current_room['is_user_in'] = true;
				}
				array_push($rooms, $current_room);
			}
		}
		$response = array(
			'success' => true,
			'content' => $rooms,
		);
		die(json_encode($response));
	}

	public function wp_chat_get_room_details(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
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

	public function wp_chat_edit_room_details(){
		$this->user_id = get_current_user_id();
		if (!isset($this->user_id) || empty($this->user_id)){
			$response = array(
				'success' => false,
				'message' => __( 'You must be connected to be able to do that', $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		$user = $this->model->get_user_by_id($this->user_id);

		if (!isset($user) || empty($user)){
			$response = array(
				'success' => false,
				'message' => __( 'User is not existing' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		if (!isset($_REQUEST['room_name'])){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation name is required' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		if (!isset($_REQUEST['room_id']) || empty($_REQUEST['room_id'])){
			$response = array(
				'success' => false,
				'message' => __( 'Missing informations' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}
		
		$room = $this->model->get_room_by_id(esc_attr($_REQUEST['room_id']));
		$participants = $this->model->get_room_participants(esc_attr($_REQUEST['room_id']), $this->user_id, true);

		//if there is more than 2 participants, we check if current user is owner
		/*if (sizeof($participants) > 2){
			if ($this->user_id != $room->ownerID){
				$response = array(
					'success' => false,
					'message' => "You don't have the permission to do that."
				);
				die(json_encode($response));
			}
		}*/

		if (!isset($room) || empty($room)){
			$response = array(
				'success' => false,
				'message' => __( 'Conversation cannot be found' , $this->plugin_name ).'.',
			);
			die(json_encode($response));
		}

		$public = '0';
		$archived = '0';
		
		if (esc_attr($_REQUEST['public']) == 'true'){
			$public = '1';
		}
		if (esc_attr($_REQUEST['archived']) == 'true'){
			$archived = '1';
		}

		if ($this->model->edit_room_details($room->id, stripcslashes($_REQUEST['room_name']), $public, $archived ) ){
			if (empty($_REQUEST['room_name'])){
				$message = sprintf(__( '%s has removed the title of this conversation' , $this->plugin_name ), $user['display_name']).'.';
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->name != esc_attr($_REQUEST['room_name'])){
				$message = sprintf(__('%1$s has changed the title of this conversation for "%2$s"', $this->plugin_name), $user['display_name'], $_REQUEST['room_name']).'.';
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->public != $public){
				if ($room->public == '0'){
					$message = __( 'This conversation is now public' , $this->plugin_name ).'.';
				}
				if ($room->public == '1'){
					$message = __( 'This conversation is now private' , $this->plugin_name ).'.';
				}
				$this->model->send_system_message($room->id, $message);
			}

			if ($room->archived != $archived){
				if ($room->archived == '0'){
					$message = sprintf(__( 'This conversation has been archived by %s' , $this->plugin_name ), $user['display_name']).'.';
				}
				if ($room->archived == '1'){
					$message = __( 'This conversation is no longer archived' , $this->plugin_name );
				}
				$this->model->send_system_message($room->id, $message);
			}
			
			$response = array(
				'success' => true,
				'room' => $room,
			);
		}
		else {
			$response = array(
				'success' => false,
				'message' => __( 'Failed to change conversation details' , $this->plugin_name ).'.',
			);
		}
		die(json_encode($response));
	}


}
