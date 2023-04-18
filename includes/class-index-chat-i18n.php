<?php
/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 */
class index_chat_i18n {

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

	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {
		load_plugin_textdomain(
			'index-chat',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);
	}


}
