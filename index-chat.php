<?php

/**
 *
 * @wordpress-plugin
 * Plugin Name:       Index Chat
 * Plugin URI:        https://indexwebmarketing.com/
 * Description:       Allow WordPress users to start instant messaging.
 * Version:           0.3.3
 * Author:            Vianney AÏN
 * Author URI:        https://vianneyain.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       index-chat
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Current plugin version.
 */
define( 'INDEX_CHAT_VERSION', '0.3.3' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-index-chat-activator.php
 */
function activate_index_chat() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-index-chat-activator.php';
	index_chat_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-index-chat-deactivator.php
 */
function deactivate_index_chat() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-index-chat-deactivator.php';
	index_chat_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_index_chat' );
register_deactivation_hook( __FILE__, 'deactivate_index_chat' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-index-chat.php';

/**
 * Begins execution of the plugin.
 */
function run_index_chat() {
	$plugin = new index_chat(plugin_basename(__FILE__), plugin_basename( __DIR__ ));
	$plugin->run();
}

add_action('init', function() {
	if (is_user_logged_in()) {
		run_index_chat();
	}
});