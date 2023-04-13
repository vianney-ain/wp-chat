<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link             https://vianneyain.com/
 * @since             0.2.21
 * @package           Wp_Chat
 *
 * @wordpress-plugin
 * Plugin Name:       WP-Chat
 * Plugin URI:        https://indexwebmarketing.com/
 * Description:       Allow WordPress users to start instant messaging.
 * Version:           0.2.21
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
 * Currently plugin version.
 * Start at version 0.2.21 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'WP_CHAT_VERSION', '0.2.21' );

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
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
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
