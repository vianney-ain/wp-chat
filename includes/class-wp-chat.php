<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://https://vianneyain.com/
 * @since      1.0.0
 *
 * @package    Wp_Chat
 * @subpackage Wp_Chat/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Wp_Chat
 * @subpackage Wp_Chat/includes
 * @author     Vianney AÏN <vianney.iwm@gmail.com>
 */
class Wp_Chat {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Wp_Chat_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'WP_CHAT_VERSION' ) ) {
			$this->version = WP_CHAT_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'wp-chat';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Wp_Chat_Loader. Orchestrates the hooks of the plugin.
	 * - Wp_Chat_i18n. Defines internationalization functionality.
	 * - Wp_Chat_Admin. Defines all hooks for the admin area.
	 * - Wp_Chat_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-chat-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-chat-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-wp-chat-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-wp-chat-public.php';

		$this->loader = new Wp_Chat_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Wp_Chat_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	public function set_locale() {
		load_plugin_textdomain(
			'wp-chat',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

		/*$plugin_i18n = new Wp_Chat_i18n( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );*/

	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Wp_Chat_Admin( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'admin_menu', $plugin_admin, 'register_settings_page' );
		$this->loader->add_action( 'admin_init', $plugin_admin, 'register_settings' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Wp_Chat_Public( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'wp_head', $plugin_public, 'add_chat_section', 45 );

		/*** AJAX ***/
		$this->loader->add_action( 'wp_ajax_wp_chat_get_blank_dialog', $plugin_public, 'wp_chat_get_blank_dialog' );
		$this->loader->add_action( 'wp_ajax_wp_chat_get_participant_popup', $plugin_public, 'wp_chat_get_participant_popup' );
		$this->loader->add_action( 'wp_ajax_wp_chat_get_room_details_popup', $plugin_public, 'wp_chat_get_room_details_popup' );
		$this->loader->add_action( 'wp_ajax_wp_chat_search_users', $plugin_public, 'wp_chat_search_users' );
		$this->loader->add_action( 'wp_ajax_wp_chat_create_room', $plugin_public, 'wp_chat_create_room' );
		$this->loader->add_action( 'wp_ajax_wp_chat_open_room', $plugin_public, 'wp_chat_open_room' );
		$this->loader->add_action( 'wp_ajax_wp_chat_leave_room', $plugin_public, 'wp_chat_leave_room' );
		$this->loader->add_action( 'wp_ajax_wp_chat_edit_room_details', $plugin_public, 'wp_chat_edit_room_details' );
		$this->loader->add_action( 'wp_ajax_wp_chat_send_message', $plugin_public, 'wp_chat_send_message' );
		$this->loader->add_action( 'wp_ajax_wp_chat_refresh_view', $plugin_public, 'wp_chat_refresh_view' );
		$this->loader->add_action( 'wp_ajax_wp_chat_get_room_participants', $plugin_public, 'wp_chat_get_room_participants' );
		$this->loader->add_action( 'wp_ajax_wp_chat_remove_room_participant', $plugin_public, 'wp_chat_remove_room_participant' );
		$this->loader->add_action( 'wp_ajax_wp_chat_search_participant', $plugin_public, 'wp_chat_search_participant' );
		$this->loader->add_action( 'wp_ajax_wp_chat_add_room_participant', $plugin_public, 'wp_chat_add_room_participant' );
		$this->loader->add_action( 'wp_ajax_wp_chat_get_room_details', $plugin_public, 'wp_chat_get_room_details' );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Wp_Chat_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

}
