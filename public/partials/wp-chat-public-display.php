<?php

/**
 * Provide a public-facing view for the plugin
 *
 * This file is used to markup the public-facing aspects of the plugin.
 *
 * @link       https://https://vianneyain.com/
 * @since      1.0.0
 *
 * @package    Wp_Chat
 * @subpackage Wp_Chat/public/partials
 */

 class Wp_Chat_Public_View {
   public function blank_dialog_view(){
     ?>
     <div class="wp-chat-dialog blank">
       <div class="wp-chat-dialog-header">
         <div class="wp-chat-dialog-title">Nouveau message</div>
         <div class="wp-chat-dialog-header-actions">
           <div class="wp-chat-dialog-header-action close-dialog">
             <div class="wp-chat-icon close"></div>
           </div>
         </div>
       </div>
       <div class="wp-chat-dialog-content">
         <div class="new_dialog_search">
           <div class="new_dialog_search_container">
             <input placeholder="Chercher un utilisateur" class="new_dialog_search_input" type="text">
             <div class="dialog_search_results">
               <ul>
               </ul>
             </div>
           </div>
         </div>
       </div>
       <div class="wp-chat-dialog-footer">
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
         <div class="wp-chat-dialog-popup-title">Participants</div>
       </div>
       <div class="wp-chat-dialog-popup-content">
         <ul class="wp-chat-dialog-popup-participants-list">
         </ul>
       </div>
       <div class="wp-chat-dialog-popup-footer">
         <input class="wp-chat-add-participant-input" placeholder="Ajouter un participant" type="text">
       </div>
     </div>
     <?php
   }

   public function room_details_popup_view(){
     ?>
     <div class="wp-chat-dialog-popup popup-room">
       <div class="wp-chat-dialog-popup-header">
         <div class="wp-chat-dialog-header-popup-actions">
           <div class="wp-chat-dialog-header-popup-action close-popup">
             <div class="wp-chat-icon chevron_left"></div>
           </div>
         </div>
         <div class="wp-chat-dialog-popup-title"><input type="text" placeholder="Titre de la conversation"></div>
       </div>
       <div class="wp-chat-dialog-popup-content">
        <div class="wp-chat-dialog-popup-content-row">
          Conversation publique : <label class="wp-chat-switch"><input type="checkbox" name="room-public-checkbox" /><span></span></label>
        </div>
        <div class="wp-chat-dialog-popup-content-row">
          Archiver la conversation : <label class="wp-chat-switch"><input type="checkbox" name="room-archived-checkbox" /><span></span></label>
        </div>
       </div>
       <div class="wp-chat-dialog-popup-footer">
         <button>Enregistrer les modifications</button>
       </div>
     </div>
     <?php
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
           <h3 class="wp-chat-title">Discussions</h3>
           <div class="wp-chat-window-close">
             <span></span>
             <span></span>
           </div>
         </div>
         <div class="wp-chat-window-menu">
           <div class="wp-chat-icon new"></div>
           <div class="wp-chat-search">
             <input type="text">
           </div>
         </div>
         <div class="wp-chat-window-archives-menu">
          <div class="wp-chat-window-archives-menu-item active" data-section="own">Vos discussions</div>
          <div class="wp-chat-window-archives-menu-item" data-section="general">Discussions publiques</div>
         </div>
         <div class="wp-chat-window-archives">
          <ul>
            <li class="wp-chat-empty-archive">Vous ne participez à aucune discussion pour le moment.</li>
            <li class="wp-chat-empty-archive"><button class="create_new_conversation_button">Créez-en une !</button></li>
          </ul>
         </div>
       </div>
       <div id="wp-chat-dialogs">

       </div>
     </div>
     <?php
   }
 }
?>
