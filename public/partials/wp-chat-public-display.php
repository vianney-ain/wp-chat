<?php

 class Wp_Chat_Public_View {

  	/**
	 * The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 */
	private $version;

  
	/**
	 * Initialize the class and set its properties.
	 */
  public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

   public function blank_dialog_view(){
     ?>
     <div class="wp-chat-dialog blank">
       <div class="wp-chat-dialog-header">
         <div class="wp-chat-dialog-title"><input type="text" placeholder="<?php _e( 'Conversation title' , 'wp-chat' ); ?>" value=""></div>
         <div class="wp-chat-dialog-header-actions">
           <div class="wp-chat-dialog-header-action close-dialog">
             <div class="wp-chat-icon close"></div>
           </div>
         </div>
       </div>
       <div class="wp-chat-dialog-content">
       <div class="wp-chat-new-dialog-row">
         <div class="wp-chat-new-dialog-row-label"><?php _e( 'Public conversation' , 'wp-chat' ); ?> :</div><label class="wp-chat-switch"><input type="checkbox" name="room-public-checkbox" /><span></span></label>
        </div>
        <div class="wp-chat-new-dialog-row">
          <div class="wp-chat-add-participant-pre">À :</div>
          <div class="wp-chat-add-participant-content">
            <div class="wp-chat-participants-selected">
              
            </div>
            <div class="wp-chat-new-dialog-add-participant-container">
              <input placeholder="<?php _e( 'Add participants' , 'wp-chat' ); ?>" class="wp-chat-new-dialog-add-participant-input" type="text">
            </div>
          </div>
        </div>
        <div class="wp-chat-new-dialog-row wp-chat-new-dialog-participant-search-results">
          <ul></ul>
        </div>
       </div>
       <div class="wp-chat-dialog-footer">
          <button class="wp-chat-new-dialog-create-dialog"><?php _e( 'Start chatting' , 'wp-chat' ); ?></button>
       </div>
     </div>
     <?php
   }
   
   public function participant_popup_view(){
     ?>
     <div class="wp-chat-dialog-popup popup-participants">
       <div class="wp-chat-dialog-popup-header">
         <div class="wp-chat-dialog-header-popup-actions">
           <div class="wp-chat-dialog-header-popup-action close-popup">
             <div class="wp-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="wp-chat-dialog-popup-title"><?php _e( 'Participants' , 'wp-chat' ); ?></div>
       </div>
       <div class="wp-chat-dialog-popup-content">
         <ul class="wp-chat-dialog-popup-participants-list">
         </ul>
       </div>
       <div class="wp-chat-dialog-popup-footer">
         <input class="wp-chat-add-participant-input" placeholder="<?php _e( 'Add a participant' , 'wp-chat' ); ?>" type="text">
       </div>
     </div>
     <?php
   }

   public function room_details_popup_view($isOwner = false){
    if ($isOwner){
      ?>
      <div class="wp-chat-dialog-popup popup-room">
       <div class="wp-chat-dialog-popup-header">
         <div class="wp-chat-dialog-header-popup-actions">
           <div class="wp-chat-dialog-header-popup-action close-popup">
             <div class="wp-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="wp-chat-dialog-popup-title"><input type="text" placeholder="<?php _e( 'Conversation title' , 'wp-chat' ); ?>"></div>
       </div>
       <div class="wp-chat-dialog-popup-content">
        <ul>
          <li class="wp-chat-dialog-popup-property change-room-public" data-value="0"><div class="wp-chat-icon"></div><span><?php _e( 'Private conversation' , 'wp-chat' ); ?></span></li>
          <li class="wp-chat-dialog-popup-property change-room-archive" data-value="0"><div class="wp-chat-icon"></div><span><?php _e( 'Archive conversation' , 'wp-chat' ); ?></span></li>
          <li class="wp-chat-dialog-popup-property delete-room"><div class="wp-chat-icon bin"></div><span><?php _e( 'Delete conversation' , 'wp-chat' ); ?></span></li>
        </ul>
       </div>
       <div class="wp-chat-dialog-popup-footer">
         <button><?php _e( 'Save' , 'wp-chat' ); ?></button>
       </div>
     </div>
      <?php
    }
    else {
      ?>
      <div class="wp-chat-dialog-popup popup-room">
       <div class="wp-chat-dialog-popup-header">
         <div class="wp-chat-dialog-header-popup-actions">
           <div class="wp-chat-dialog-header-popup-action close-popup">
             <div class="wp-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="wp-chat-dialog-popup-title"><label for="" class="wp-chat-dialog-popup-title-label"><?php _e( 'Conversation title' , 'wp-chat' ); ?></label></div>
       </div>
       <div class="wp-chat-dialog-popup-content">
          <ul>
            <li class="wp-chat-dialog-popup-property wp-chat-leave-room-action"><div class="wp-chat-icon exit"></div><?php _e( 'Leave conversation' , 'wp-chat' ); ?></li>
          </ul>
       </div>
     </div>

      <?php
    }
   }

   public function default_view(){
     ?>
     <div id="wp-chat">
       <div class="wp-chat-menu-toggler">
         <div class="wp-chat-icon chat"></div>
       </div>
       <div id="wp-chat-menu-archives"></div>
       <div id="wp-chat-window" class="active">
         <div class="wp-chat-window-header">
           <h3 class="wp-chat-title"><?php _e( 'Conversations' , 'wp-chat' ); ?></h3>
           <div class="wp-chat-window-close">
             <span></span>
             <span></span>
           </div>
         </div>
         <div class="wp-chat-window-menu">
           <div class="wp-chat-icon new"></div>
           <div class="wp-chat-search">
             <input type="text" placeholder="<?php _e( 'Search' , 'wp-chat' ); ?>">
           </div>
         </div>
         <div class="wp-chat-window-archives-menu">
          <div class="wp-chat-window-archives-menu-item active" data-section="own"><?php _e( 'Your conversations' , 'wp-chat' ); ?></div>
          <div class="wp-chat-window-archives-menu-item" data-section="general"><?php _e( 'Public conversations' , 'wp-chat' ); ?></div>
         </div>
         <div class="wp-chat-window-archives">
          <div class="wp-chat-window-archives-section active" data-section="own">
            <ul>
              <li data-room-section="own" class="wp-chat-empty-archive"><?php _e( 'You are not participating to any conversation for now.' , 'wp-chat' ); ?></li>
              <li data-room-section="own" class="wp-chat-empty-archive"><button class="create_new_conversation_button"><?php _e( 'Create one !' , 'wp-chat' ); ?></button></li>
            </ul>
          </div>
          <div class="wp-chat-window-archives-section" data-section="general">
            <ul></ul>
          </div>
         </div>
       </div>
       <div id="wp-chat-dialogs">

       </div>
     </div>
     <?php
   }
 }
?>
