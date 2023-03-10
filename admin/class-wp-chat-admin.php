<?php

/**
* The admin-specific functionality of the plugin.
*
* @link       https://https://vianneyain.com/
* @since      1.0.0
*
* @package    Wp_Chat
* @subpackage Wp_Chat/admin
*/

/**
* The admin-specific functionality of the plugin.
*
* Defines the plugin name, version, and two examples hooks for how to
* enqueue the admin-specific stylesheet and JavaScript.
*
* @package    Wp_Chat
* @subpackage Wp_Chat/admin
* @author     Vianney AÏN <vianney.iwm@gmail.com>
*/
class Wp_Chat_Admin {

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
	* @param      string    $plugin_name       The name of this plugin.
	* @param      string    $version    The version of this plugin.
	*/
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	* Register the stylesheets for the admin area.
	*
	* @since    1.0.0
	*/
	public function enqueue_styles() {

		/**
		* This function is provided for demonstration purposes only.
		*
		* An instance of this class should be passed to the run() function
		* defined in Wp_Chat_Loader as all of the hooks are defined
		* in that particular class.
		*
		* The Wp_Chat_Loader will then create the relationship
		* between the defined hooks and the functions defined in this
		* class.
		*/
		/*if ( 'tools_page_wp-chat' != $hook ) {return;}*/
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-chat-admin.css', array(), $this->version, 'all' );

	}

	/**
	* Register the JavaScript for the admin area.
	*
	* @since    1.0.0
	*/
	public function enqueue_scripts() {

		/**
		* This function is provided for demonstration purposes only.
		*
		* An instance of this class should be passed to the run() function
		* defined in Wp_Chat_Loader as all of the hooks are defined
		* in that particular class.
		*
		* The Wp_Chat_Loader will then create the relationship
		* between the defined hooks and the functions defined in this
		* class.
		*/
		/*if ( 'tools_page_wp-chat' != $hook ) {return;}*/
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-chat-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	* Register the settings page for the admin area.
	*
	* @since    1.0.0
	*/
	public function register_settings_page() {

		add_menu_page(
			__( 'Home', $this->plugin_name ),//page title
			__( 'WP Chat', $this->plugin_name ), //menu title
			'manage_options',//capability
			$this->plugin_name,//menu slug
			array( $this, 'display_general_settings_page' ), // callable function
			plugins_url( '/wp-chat/public/img/wp-chat.png' ),//icon url
			999//position
		);

		// Create our settings page as a submenu page.
		add_submenu_page(
			$this->plugin_name,                            // parent slug
			__( 'Theme', $this->plugin_name ),      				// page title
			__( 'Theme', $this->plugin_name ),     			  // menu title
			'manage_options',                       // capability
			$this->plugin_name.'-theme',                              // menu_slug
			array( $this, 'display_theme_settings_page' ) // callable function
		);
	}

	public function display_general_settings_page() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/wp-chat-admin-general-display.php';
	}

	public function display_theme_settings_page() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/wp-chat-admin-theme-display.php';
	}

	public function register_settings() {
		$this->register_general_settings();
		$this->register_theme_settings();
	}

	public function register_general_settings(){

		// Here we are going to register our setting.
		register_setting(
			$this->plugin_name . '-general-settings', // option_group, a setting group name
			$this->plugin_name . '-general-settings', // option_name
			array( $this, 'sandbox_register_setting' ) // type, sanitize_callback
		);

		// Here we are going to add a section for our setting.
		add_settings_section(
			$this->plugin_name . '-general-settings-section', // id
			__( 'Settings', $this->plugin_name ), // title
			array( $this, 'sandbox_add_settings_section' ), // type, sanitize_callback
			$this->plugin_name . '-general-settings' // page, the slug-name of the settings page on which to show the section
		);

		add_settings_field(
			'wp-chat-disable-plugin', // slug
			__( 'Disable WP-Chat', $this->plugin_name ), // title
			array( $this, 'sandbox_add_settings_field_single_checkbox' ), // callback, sanitize function
			$this->plugin_name . '-general-settings', // page setting slug
			$this->plugin_name . '-general-settings-section', // setting section slug
			array( //extra parameters
				'label_for' => 'disable-wp-chat', // label for
				'section_slug' => '-general-settings',
				'description' => __( 'If checked, it will turn off the WP Chat plugin.', 'wp-chat' ) // description
			)
		);

		add_settings_field(
			'wp-chat-refresh-rate',
			__( 'WP Chat refresh rate (in milliseconds)', $this->plugin_name ),
			array( $this, 'sandbox_add_settings_field_input_text' ),
			$this->plugin_name . '-general-settings',
			$this->plugin_name . '-general-settings-section',
			array(
				'label_for' => 'wp-chat-refresh-rate',
				'section_slug' => '-general-settings',
				'default'   => __( '1000', 'wp-chat' )
			)
		);

	}
	
	public function register_theme_settings(){

		// Here we are going to register our setting.
		register_setting(
			$this->plugin_name . '-theme-settings', // option_group, a setting group name
			$this->plugin_name . '-theme-settings', // option_name
			array( $this, 'sandbox_register_setting' ) // type, sanitize_callback
		);

		// Here we are going to add a section for our setting.
		add_settings_section(
			$this->plugin_name . '-theme-settings-section', // id
			__( 'Settings', $this->plugin_name ), // title
			array( $this, 'sandbox_add_settings_section' ), // type, sanitize_callback
			$this->plugin_name . '-theme-settings' // page, the slug-name of the settings page on which to show the section
		);

		add_settings_field(
			'wp-chat-disable-plugin', // slug
			__( 'Disable WP-Chat', $this->plugin_name ), // title
			array( $this, 'sandbox_add_settings_field_single_checkbox' ), // callback, sanitize function
			$this->plugin_name . '-theme-settings', // page setting slug
			$this->plugin_name . '-theme-settings-section', // setting section slug
			array( //extra parameters
				'label_for' => 'disable-wp-chat', // label for
				'section_slug' => '-theme-settings',
				'description' => __( 'If checked, it will turn off the WP Chat plugin.', 'wp-chat' ) // description
			)
		);

		add_settings_field(
			'wp-chat-refresh-rate',
			__( 'WP Chat refresh rate (in milliseconds)', $this->plugin_name ),
			array( $this, 'sandbox_add_settings_field_input_text' ),
			$this->plugin_name . '-theme-settings',
			$this->plugin_name . '-general-settings-section',
			array(
				'label_for' => 'wp-chat-refresh-rate',
				'section_slug' => '-theme-settings',
				'default'   => __( '1000', 'wp-chat' )
			)
		);

	}

	/**
	* Sandbox our settings.
	*
	* @since    1.0.0
	*/
	public function sandbox_register_setting( $input ) {
		$new_input = array();

		if ( isset( $input ) ) {
			// Loop trough each input and sanitize the value if the input id isn't post-types
			foreach ( $input as $key => $value ) {
				if ( $key == 'post-types' ) {
					$new_input[ $key ] = $value;
				} else {
					$new_input[ $key ] = sanitize_text_field( $value );
				}
			}
		}

		return $new_input;

	}

	public function sandbox_add_settings_section() {

		return;

	}

	public function sandbox_add_settings_field_single_checkbox( $args ) {
		$field_id = $args['label_for'];
		$field_description = $args['description'];
		$section = $args['section_slug'];

		$options = get_option( $this->plugin_name . $section );
		$option = 0;

		if ( ! empty( $options[ $field_id ] ) ) {

			$option = $options[ $field_id ];

		}

		?>

		<label for="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>">
			<input type="checkbox" name="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" id="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" <?php checked( $option, true, 1 ); ?> value="1" />
			<span class="description"><?php echo esc_html( $field_description ); ?></span>
		</label>

		<?php

	}

	public function sandbox_add_settings_field_input_text( $args ) {

		$field_id = $args['label_for'];
		$field_default = $args['default'];
		$section = $args['section_slug'];

		$options = get_option( $this->plugin_name . $section );
		$option = $field_default;

		if ( ! empty( $options[ $field_id ] ) ) {

			$option = $options[ $field_id ];

		}

		?>

		<input type="text" name="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" id="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" value="<?php echo esc_attr( $option ); ?>" class="regular-text" />

		<?php

	}

}
