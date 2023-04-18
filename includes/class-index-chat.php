<?php

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 */
class index_chat {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 */
	protected $version;

	public function __construct() {
		if ( defined( 'index_chat_VERSION' ) ) {
			$this->version = index_chat_VERSION;
		} 
		$this->plugin_name = 'index-chat';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		if (!isset(get_option('index-chat-general-settings')['index-chat-disable-plugin-checkbox']) || get_option('index-chat-general-settings')['index-chat-disable-plugin-checkbox'] != '1'){
			$this->define_public_hooks();
		}

		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);
				
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - index_chat_Loader. Orchestrates the hooks of the plugin.
	 * - index_chat_i18n. Defines internationalization functionality.
	 * - index_chat_Admin. Defines all hooks for the admin area.
	 * - index_chat_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-index-chat-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-index-chat-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-index-chat-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-index-chat-public.php';

		$this->loader = new index_chat_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the index_chat_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 */
	public function set_locale() {
		load_plugin_textdomain(
			'index-chat',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 */
	private function define_admin_hooks() {
		$plugin_admin = new index_chat_Admin( $this->get_plugin_name(), $this->get_version(), $this->get_options() );
		//add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), array( $plugin_admin, 'add_action_links' ) );
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'register_settings_page' );
		$this->loader->add_action( 'admin_init', $plugin_admin, 'register_settings' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 */
	private function define_public_hooks() {

		$plugin_public = new index_chat_Public( $this->get_plugin_name(), $this->get_version(), $this->get_options());

		$this->loader->add_action( 'wp_head', $plugin_public, 'add_chat_section', 45 );

		/*** AJAX ***/
		$this->loader->add_action( 'wp_ajax_index_chat_get_blank_dialog', $plugin_public, 'index_chat_get_blank_dialog' );
		$this->loader->add_action( 'wp_ajax_index_chat_get_participant_popup', $plugin_public, 'index_chat_get_participant_popup' );
		$this->loader->add_action( 'wp_ajax_index_chat_get_room_details_popup', $plugin_public, 'index_chat_get_room_details_popup' );
		$this->loader->add_action( 'wp_ajax_index_chat_search_users', $plugin_public, 'index_chat_search_users' );
		$this->loader->add_action( 'wp_ajax_index_chat_create_room', $plugin_public, 'index_chat_create_room' );
		$this->loader->add_action( 'wp_ajax_index_chat_open_room', $plugin_public, 'index_chat_open_room' );
		$this->loader->add_action( 'wp_ajax_index_chat_leave_room', $plugin_public, 'index_chat_leave_room' );
		$this->loader->add_action( 'wp_ajax_index_chat_remove_room', $plugin_public, 'index_chat_remove_room' );
		$this->loader->add_action( 'wp_ajax_index_chat_edit_room_details', $plugin_public, 'index_chat_edit_room_details' );
		$this->loader->add_action( 'wp_ajax_index_chat_send_message', $plugin_public, 'index_chat_send_message' );
		$this->loader->add_action( 'wp_ajax_index_chat_refresh_view', $plugin_public, 'index_chat_refresh_view' );
		$this->loader->add_action( 'wp_ajax_index_chat_get_room_participants', $plugin_public, 'index_chat_get_room_participants' );
		$this->loader->add_action( 'wp_ajax_index_chat_remove_room_participant', $plugin_public, 'index_chat_remove_room_participant' );
		$this->loader->add_action( 'wp_ajax_index_chat_search_participant', $plugin_public, 'index_chat_search_participant' );
		$this->loader->add_action( 'wp_ajax_index_chat_add_room_participant', $plugin_public, 'index_chat_add_room_participant' );
		$this->loader->add_action( 'wp_ajax_index_chat_get_room_details', $plugin_public, 'index_chat_get_room_details' );

		/*** ENQUEUE ***/
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );
		$this->loader->add_action( 'plugins_loaded', $plugin_public, 'index_chat_load_textdomain' );

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

	public function get_options() {
		return $options = array(
			'index-chat-general-settings-default' => array(
				'index-chat-disable-plugin-checkbox' => '0',
				'index-chat-disable-ajax-checkbox' => '0',
				'index-chat-refresh-rate-input' => '2500'
			),
			'theme_settings_defaults' => array(

			)
		);
	}

}
