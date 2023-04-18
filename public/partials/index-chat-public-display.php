<?php

 class index_chat_Public_View {

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
     <div class="index-chat-dialog blank">
       <div class="index-chat-dialog-header">
         <div class="index-chat-dialog-title"><input type="text" placeholder="<?php _e( 'Conversation title' , 'index-chat' ); ?>" value=""></div>
         <div class="index-chat-dialog-header-actions">
           <div class="index-chat-dialog-header-action close-dialog">
             <div class="index-chat-icon close"></div>
           </div>
         </div>
       </div>
       <div class="index-chat-dialog-content">
       <div class="index-chat-new-dialog-row">
         <div class="index-chat-new-dialog-row-label"><?php _e( 'Public conversation' , 'index-chat' ); ?> :</div><label class="index-chat-switch"><input type="checkbox" name="room-public-checkbox" /><span></span></label>
        </div>
        <div class="index-chat-new-dialog-row">
          <div class="index-chat-add-participant-pre">À :</div>
          <div class="index-chat-add-participant-content">
            <div class="index-chat-participants-selected">
              
            </div>
            <div class="index-chat-new-dialog-add-participant-container">
              <input placeholder="<?php _e( 'Add participants' , 'index-chat' ); ?>" class="index-chat-new-dialog-add-participant-input" type="text">
            </div>
          </div>
        </div>
        <div class="index-chat-new-dialog-row index-chat-new-dialog-participant-search-results">
          <ul></ul>
        </div>
       </div>
       <div class="index-chat-dialog-footer">
          <button class="index-chat-new-dialog-create-dialog"><?php _e( 'Start chatting' , 'index-chat' ); ?></button>
       </div>
     </div>
     <?php
   }
   
   public function participant_popup_view(){
     ?>
     <div class="index-chat-dialog-popup popup-participants">
       <div class="index-chat-dialog-popup-header">
         <div class="index-chat-dialog-header-popup-actions">
           <div class="index-chat-dialog-header-popup-action close-popup">
             <div class="index-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="index-chat-dialog-popup-title"><?php _e( 'Participants' , 'index-chat' ); ?></div>
       </div>
       <div class="index-chat-dialog-popup-content">
         <ul class="index-chat-dialog-popup-participants-list">
         </ul>
       </div>
       <div class="index-chat-dialog-popup-footer">
         <input class="index-chat-add-participant-input" placeholder="<?php _e( 'Add a participant' , 'index-chat' ); ?>" type="text">
       </div>
     </div>
     <?php
   }

   public function room_details_popup_view($isOwner = false){
    if ($isOwner){
      ?>
      <div class="index-chat-dialog-popup popup-room">
       <div class="index-chat-dialog-popup-header">
         <div class="index-chat-dialog-header-popup-actions">
           <div class="index-chat-dialog-header-popup-action close-popup">
             <div class="index-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="index-chat-dialog-popup-title"><input type="text" placeholder="<?php _e( 'Conversation title' , 'index-chat' ); ?>"></div>
       </div>
       <div class="index-chat-dialog-popup-content">
        <ul>
          <li class="index-chat-dialog-popup-property change-room-public" data-value="0"><div class="index-chat-icon"></div><span><?php _e( 'Private conversation' , 'index-chat' ); ?></span></li>
          <li class="index-chat-dialog-popup-property change-room-archive" data-value="0"><div class="index-chat-icon"></div><span><?php _e( 'Archive conversation' , 'index-chat' ); ?></span></li>
          <li class="index-chat-dialog-popup-property delete-room"><div class="index-chat-icon bin"></div><span><?php _e( 'Delete conversation' , 'index-chat' ); ?></span></li>
        </ul>
       </div>
       <div class="index-chat-dialog-popup-footer">
         <button><?php _e( 'Save' , 'index-chat' ); ?></button>
       </div>
     </div>
      <?php
    }
    else {
      ?>
      <div class="index-chat-dialog-popup popup-room">
       <div class="index-chat-dialog-popup-header">
         <div class="index-chat-dialog-header-popup-actions">
           <div class="index-chat-dialog-header-popup-action close-popup">
             <div class="index-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="index-chat-dialog-popup-title"><label for="" class="index-chat-dialog-popup-title-label"><?php _e( 'Conversation title' , 'index-chat' ); ?></label></div>
       </div>
       <div class="index-chat-dialog-popup-content">
          <ul>
            <li class="index-chat-dialog-popup-property index-chat-leave-room-action"><div class="index-chat-icon exit"></div><?php _e( 'Leave conversation' , 'index-chat' ); ?></li>
          </ul>
       </div>
     </div>

      <?php
    }
   }

   public function default_view(){
     ?>
     <div id="index-chat">
       <div class="index-chat-menu-toggler">
         <div class="index-chat-icon chat"></div>
       </div>
       <div id="index-chat-menu-archives"></div>
       <div id="index-chat-window" class="active">
         <div class="index-chat-window-header">
           <h3 class="index-chat-title"><?php _e( 'Conversations' , 'index-chat' ); ?></h3>
           <div class="index-chat-window-close">
             <span></span>
             <span></span>
           </div>
         </div>
         <div class="index-chat-window-menu">
           <div class="index-chat-icon new"></div>
           <div class="index-chat-search">
             <input type="text" placeholder="<?php _e( 'Search' , 'index-chat' ); ?>">
           </div>
         </div>
         <div class="index-chat-window-archives-menu">
          <div class="index-chat-window-archives-menu-item active" data-section="own"><?php _e( 'Your conversations' , 'index-chat' ); ?></div>
          <div class="index-chat-window-archives-menu-item" data-section="general"><?php _e( 'Public conversations' , 'index-chat' ); ?></div>
         </div>
         <div class="index-chat-window-archives">
          <div class="index-chat-window-archives-section active" data-section="own">
            <ul>
              <li data-room-section="own" class="index-chat-empty-archive"><?php _e( 'You are not participating to any conversation for now.' , 'index-chat' ); ?></li>
              <li data-room-section="own" class="index-chat-empty-archive"><button class="create_new_conversation_button"><?php _e( 'Create one !' , 'index-chat' ); ?></button></li>
            </ul>
          </div>
          <div class="index-chat-window-archives-section" data-section="general">
            <ul></ul>
          </div>
         </div>
       </div>
       <div id="index-chat-dialogs">

       </div>
     </div>
     <?php
   }
 }
?>
