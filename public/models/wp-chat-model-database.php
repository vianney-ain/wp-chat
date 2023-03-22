<?php

class Wp_Chat_Model_Database {

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

	}


  public function check_tables(){
    if ($this->create_room_table() && $this->create_participants_table() && $this->create_messages_table()){
      return true;
    }
    return false;
  }


  //if two users already have a room (where they are 2)
  //return the room id
  //else, return false
  public function has_solo_room($to, $from){
    global $wpdb;
    $wpdb->show_errors( true );
    //get rooms user "to" participate in
    $results_to = $this->get_participant($to);
    //get rooms user "from" participate in
    $results_from = $this->get_participant($from);

    $common_rooms = array();
    if (isset($results_to) && !empty($results_to) && isset($results_from) && !empty($results_from)){
      foreach ($results_to as $k1 => $result_to){
        foreach ($results_from as $k2 => $result_from){
          if ($result_to->roomID == $result_from->roomID){
            array_push($common_rooms, $result_to->roomID);
          }
        }
      }
    }
    $has_solo_room = false;
    //for each rooms they have in common, we check if they are only 2 inside
    if (isset($common_rooms) && !empty($common_rooms)){
      foreach($common_rooms as $kr => $common_room){
        if ($this->is_room_grouped($common_room)){
        }
        else {
          $has_solo_room = $common_room;
        }
      }
    }
    return $has_solo_room;
  }

  /**
  * If more than 2 users in the same room, considered as grouped room
  **/
  public function is_room_grouped($room_id){
    global $wpdb;
    $results = $wpdb->get_results("SELECT count(*) as total FROM {$wpdb->prefix}chat_participant WHERE roomID='{$room_id}'");
    if (isset($results) && !empty($results)){
      if (array_values($results)[0]->total > 2){
        return true;
      }
      else {
        return false;
      }
    }
    return false;
  }

  public function get_user_by_id($user_id){
    $user = get_user_by('id', $user_id);
    if (isset($user) && !empty($user)){
			if ( metadata_exists( 'user', $user->data->ID, 'avatar' ) ) {
				$avatar = get_user_meta($user->data->ID, 'avatar', true );
			}
			if (!isset($avatar) || empty($avatar)){
				$avatar = get_avatar_url($user->ID);
			}
      return array(
        'id' => $user->data->ID,
        'avatar' => $avatar,
        'display_name' => $user->data->display_name,
      );
    }
    return null;
  }
  /***
  *** SEND MESSAGE TO ROOM
  *** TYPE must be empty or "system"
  ***/
  public function send_message($room_id, $user_id, $message){
    global $wpdb;
    $table = $wpdb->prefix.'chat_message';
    $data = array('userID' => $user_id, 'roomID' => $room_id, 'message' => $message, 'created' => current_time('mysql', 1), 'type' => '');
    $format = array('%d','%d','%s','%s', '%s');
    $result = $wpdb->insert($table,$data,$format);
    $message_id = $wpdb->insert_id;
    $this->update_room_last_message($room_id);
    return $message_id;
  }

    /***
  *** SEND SYSTEM MESSAGE TO ROOM
  *** TYPE must be empty or "system"
  ***/
  public function send_system_message($room_id, $message){
    global $wpdb;
    $table = $wpdb->prefix.'chat_message';
    $data = array('userID' => -1, 'roomID' => $room_id, 'message' => $message, 'created' => current_time('mysql', 1), 'type' => 'system');
    $format = array('%d','%d','%s','%s', '%s');
    $result = $wpdb->insert($table,$data,$format);
    $message_id = $wpdb->insert_id;
    $this->update_room_last_message($room_id);
    return $message_id;
  }

  public function update_room_last_message($room_id){
    global $wpdb;
    $table = $wpdb->prefix.'chat_room';
    $data = array('lastMessage' => current_time('mysql', 1));
    $where = array('id' => $room_id);
    $format = array('%s');
    $where_format = array('%d');
    $wpdb->update($table,$data,$where,$format,$where_format);
    if ($wpdb->rows_affected == 1){
      return true;
    }
    return false;
  }

  public function get_message_by_room($room_id){
    global $wpdb;
    $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_message WHERE roomID='{$room_id}' ORDER BY created DESC");
    if (isset($results) && !empty($results) && is_array($results)){
      foreach($results as $key => $result){
        $results[$key]->user = $this->get_user_by_id($result->userID);
      }
    }
    return array_reverse($results);
  }

  public function get_room_details_by_id($room_id, $user_from_id){
    global $wpdb;
    $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE userID <> '{$user_from_id}' AND roomID = '{$room_id}'");
    $user_names = array();
    $thumbnails = array();
    if (isset($results) && !empty($results)){
      foreach($results as $k => $result){
        $user = $this->get_user_by_id($result->userID);
        array_push($thumbnails, $user['avatar']);
        array_push($user_names, $user['display_name']);
      }
      return array(
        'room_name' => $this->generate_room_name($user_names),
        'room_thumbnails' => $thumbnails,
      );
    }
    else {
      return array(
        'room_name' => __( 'Nameless chat' , 'wp-chat' ),
        'room_thumbnails' => array(),
      );
    }
  }

  public function get_room_participants($room_id, $user_from_id, $include_current = false){
    global $wpdb;
    if (!$include_current){
      $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE userID <> '{$user_from_id}' AND roomID = '{$room_id}'");
    }
    else {
      $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE roomID = '{$room_id}'");
    }
    $users = array();
    if (isset($results) && !empty($results)){
      foreach($results as $k => $result){
        $user = $this->get_user_by_id($result->userID);
        array_push($users, $user);
      }
    }
    return $users;
  }

  public function generate_room_name($user_names){
    if (isset($user_names) && !empty($user_names) && is_array($user_names)){
      if (sizeof($user_names) == 1){
        return $user_names[0];
      }
      else if (sizeof($user_names) == 2){
        return $user_names[0].' '.__( 'and', 'wp-chat' ).' '.$user_names[1];
      }
      else if (sizeof($user_names) > 2){
        return $user_names[0].' '.__( 'and', 'wp-chat' ).' '.(sizeof($user_names)-1).' '.__( 'others', 'wp-chat' );
      }
    }
    else {
      return __( 'Nameless chat', 'wp-chat' );
    }
  }

  public function remove_participant_from_room($room_id, $user_id){
    $room = $this->get_room_by_id($room_id);
    if (isset($room) && !empty($room)){
      if ($room->ownerID == $user_id){
      }
      global $wpdb;
      $table = $wpdb->prefix.'chat_participant';
      $where = array('roomID' => $room_id, 'userID' => $user_id);
      $format = array('%d','%d');
      $result = $wpdb->delete($table,$where,$format);
      if ($result){
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  public function get_single_room_participant_by_user_id($room_id, $user_id){
    global $wpdb;
    $result = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}chat_participant WHERE roomID='{$room_id}' AND userID='{$user_id}'");
    return $result;
  }

  public function get_room_by_id($room_id, $user_to_id = null){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_room WHERE id='{$room_id}'");
    if ( empty(array_values($result)[0]->name) && isset($user_to_id)){
      $user = get_user_by_id($user_to_id);
      array_values($result)[0]->name = $user['display_name'];
    }
    return array_values($result)[0];
  }

  //Return any room the current user is in
  public function get_user_rooms($user_id){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant as Participant INNER JOIN {$wpdb->prefix}chat_room as Room ON Participant.roomID = Room.id WHERE Participant.userID = '{$user_id}'");
    return $result;
  }

  //Return only privates rooms user is in
  public function get_user_private_rooms($user_id){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant as Participant INNER JOIN {$wpdb->prefix}chat_room as Room ON Participant.roomID = Room.id WHERE Participant.userID = '{$user_id}' AND Room.public = 0");
    return $result;
  }

  //Return all publics rooms, no parameters needed
  public function get_public_rooms(){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_room as Room WHERE Room.public = '1'");
    return $result;
  }

  //Return all publics rooms the current user is in
  public function get_user_public_rooms($user_id){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant as Participant INNER JOIN {$wpdb->prefix}chat_room as Room ON Participant.roomID = Room.id WHERE Participant.userID = '{$user_id}' AND Room.public = 1");
    return $result;
  }

  public function get_participants_by_user($user_id){
    global $wpdb;
    $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE userID='{$user_id}'");
    return $results;
  }

  public function get_participant($user_id){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE userID='{$user_id}'");
    return $result;
  }

  public function is_participant_in_room($room_id, $user_id){
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}chat_participant WHERE roomID='{$room_id}' AND userID='{$user_id}'");
    if (empty($result)){
      return false;
    }
    return true;
  }

  public function create_room($to, $from){
    global $wpdb;
    $table = $wpdb->prefix.'chat_room';
    $data = array('name' => '', 'created' => current_time('mysql', 1), 'ownerID' => $from, 'public' => false, 'archived' => false);
    $format = array('%s','%s','%d', '%d', '%d');
    $wpdb->insert($table,$data,$format);
    $room_id = $wpdb->insert_id;
    if (isset($room_id) && !empty($room_id)){
      $this->send_system_message($room_id, __( 'This is the beginning of the conversation', 'wp-chat').'.' );
      $this->create_participant($room_id, $to);
      $this->create_participant($room_id, $from);
    }
    return $room_id;
  }

  public function create_participant($room_id, $user_id){
    global $wpdb;
    $table = $wpdb->prefix.'chat_participant';
    $data = array('userID' => $user_id, 'roomID' => $room_id);
    $format = array('%d','%d');
    $wpdb->insert($table,$data,$format);
    $participant_id = $wpdb->insert_id;
    return $participant_id;
  }

  public function edit_room_details($room_id, $room_name, $public, $archived){
    global $wpdb;
    $table = $wpdb->prefix.'chat_room';
    $data = array('name' => $room_name, 'public' => $public, 'archived' => $archived);
    $where = array('id' => $room_id);
    $format = array('%s', '%d', '%d');
    $where_format = array('%d');
    $result = $wpdb->update($table,$data,$where,$format,$where_format);
    if ($wpdb->last_error !== ''){
      return false;
    }
    return true;
  }


  public function create_room_table(){
    global $wpdb;
    // set the default character set and collation for the table
    $charset_collate = $wpdb->get_charset_collate();
    // Check that the table does not already exist before continuing
    $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->base_prefix}chat_room` (
      id bigint(20) NOT NULL UNIQUE AUTO_INCREMENT,
      name varchar(200),
      created datetime,
      ownerID bigint(20),
      lastMessage datetime,
      public BOOLEAN,
      archived BOOLEAN,
      PRIMARY KEY (id),
      FOREIGN KEY (ownerID) REFERENCES {$wpdb->base_prefix}users.id
    )";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
    $is_error = empty( $wpdb->last_error );
    if (isset($wpdb->last_error) && !empty($wpdb->last_error)){
      var_dump($wpdb->last_error);
    }
    return $is_error;
  }

  public function create_participants_table(){
    global $wpdb;
    // set the default character set and collation for the table
    $charset_collate = $wpdb->get_charset_collate();
    // Check that the table does not already exist before continuing
    $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->base_prefix}chat_participant` (
      id bigint(20) NOT NULL UNIQUE AUTO_INCREMENT,
      userID bigint(20) NOT NULL,
      roomID bigint(20) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (userID) REFERENCES {$wpdb->base_prefix}users.id,
      FOREIGN KEY (roomID) REFERENCES {$wpdb->base_prefix}chat_room.id
    )";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
    $is_error = empty( $wpdb->last_error );
    if (isset($wpdb->last_error) && !empty($wpdb->last_error)){
      var_dump($wpdb->last_error);
    }
    return $is_error;
  }

  public function create_messages_table(){
    global $wpdb;
    // set the default character set and collation for the table
    $charset_collate = $wpdb->get_charset_collate();
    // Check that the table does not already exist before continuing
    $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->base_prefix}chat_message` (
      id bigint(20) NOT NULL UNIQUE AUTO_INCREMENT,
      userID bigint(20) NOT NULL,
      roomID bigint(20) NOT NULL,
      message text NOT NULL,
      created datetime,
      type varchar(200),
      PRIMARY KEY (id),
      FOREIGN KEY (userID) REFERENCES {$wpdb->base_prefix}users.id,
      FOREIGN KEY (roomID) REFERENCES {$wpdb->base_prefix}chat_room.id
    )";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
    $is_error = empty( $wpdb->last_error );
    if (isset($wpdb->last_error) && !empty($wpdb->last_error)){
      var_dump($wpdb->last_error);
    }
    return $is_error;
  }

  public function create_read_table(){
    global $wpdb;
    // set the default character set and collation for the table
    $charset_collate = $wpdb->get_charset_collate();
    // Check that the table does not already exist before continuing
    $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->base_prefix}chat_read` (
      id bigint(20) NOT NULL UNIQUE AUTO_INCREMENT,
      participantID bigint(20) NOT NULL,
      roomID bigint(20) NOT NULL,
      messageID bigint(20) NOT NULL,
      created datetime NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (participantID) REFERENCES {$wpdb->base_prefix}chat_participant.id,
      FOREIGN KEY (roomID) REFERENCES {$wpdb->base_prefix}chat_room.id,
      FOREIGN KEY (messageID) REFERENCES {$wpdb->base_prefix}messageID.id
    )";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
    $is_error = empty( $wpdb->last_error );
    if (isset($wpdb->last_error) && !empty($wpdb->last_error)){
      var_dump($wpdb->last_error);
    }
    return $is_error;
  }


}

?>
