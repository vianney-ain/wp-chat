<?php

/**
 *
 * @wordpress-plugin
 * Plugin Name:       WP-Chat
 * Plugin URI:        https://indexwebmarketing.com/
 * Description:       Allow WordPress users to start instant messaging.
 * Version:           0.2.23
 * Author:            Vianney AÏN
 * Author URI:        https://vianneyain.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       wp-chat
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Current plugin version.
 */
define( 'WP_CHAT_VERSION', '0.2.23' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wp-chat-activator.php
 */
function activate_wp_chat() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-chat-activator.php';
	Wp_Chat_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-wp-chat-deactivator.php
 */
function deactivate_wp_chat() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-chat-deactivator.php';
	Wp_Chat_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_chat' );
register_deactivation_hook( __FILE__, 'deactivate_wp_chat' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-chat.php';

/**
 * Begins execution of the plugin.
 */
function run_wp_chat() {
	$plugin = new Wp_Chat();
	$plugin->run();
}

add_action('init', function() {
	if (is_user_logged_in()) {
		run_wp_chat();
	}
});

add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), 'add_action_links' );

function add_action_links ( $links ) {
	// Build and escape the URL.
	$url = esc_url( add_query_arg(
		'page',
		'wp-chat',
		get_admin_url() . 'admin.php'
	) );
	// Create the link.
	$settings_link = "<a href='$url'>" . __( 'Settings', 'wp-chat' ) . '</a>';
	// Adds the link to the end of the array.
	array_push(
		$links,
		$settings_link
	);
	return $links;
}