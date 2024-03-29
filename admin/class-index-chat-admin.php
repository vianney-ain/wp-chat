<?php
/**
* The admin-specific functionality of the plugin.
*
* Defines the plugin name, version, and two examples hooks for how to
* enqueue the admin-specific stylesheet and JavaScript.
*/
class index_chat_Admin {

	/**
	* The ID of this plugin.
	*/
	private $plugin_name;

	/**
	* The version of this plugin.
	*/
	private $version;

	private $options;

	/**
	* Initialize the class and set its properties.
	*/
	public function __construct( $plugin_name, $version, $options ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		$this->options = $options;

	}

	/**
	* Register the stylesheets for the admin area.
	*/
	public function enqueue_styles() {
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/index-chat-admin.css', array(), $this->version, 'all' );
	}

	/**
	* Register the JavaScript for the admin area.
	*/
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/index-chat-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	* Register the settings page for the admin area.
	*/
	public function register_settings_page() {
		add_menu_page(
			__( 'Home', 'index-chat' ),//page title
			__( 'Index Chat', 'index-chat' ), //menu title
			'manage_options',//capability
			$this->plugin_name,//menu slug
			array( $this, 'display_general_settings_page' ), // callable function
			plugins_url( '/index-chat/public/img/index-chat.png' ),//icon url
			999//position
		);

		// Create our settings page as a submenu page.
		add_submenu_page(
			$this->plugin_name,                            // parent slug
			__( 'Theme', 'index-chat' ),      				// page title
			__( 'Theme', 'index-chat' ),     			  // menu title
			'manage_options',                       // capability
			$this->plugin_name.'-theme',                              // menu_slug
			array( $this, 'display_theme_settings_page' ) // callable function
		);
	}

	public function display_general_settings_page() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/index-chat-admin-general-display.php';
	}

	public function display_theme_settings_page() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/index-chat-admin-theme-display.php';
	}

	public function register_settings() {
		$this->register_general_settings();
		$this->register_theme_settings();
	}

	public function register_general_settings(){
		$general_settings_defaults = $this->options['index-chat-general-settings-default'];
		if (isset($_POST['reset-settings']) && !empty($_POST['reset-settings'])){
			delete_option($this->plugin_name .'-general-settings');
		}

		// Here we are going to register our setting.
		register_setting(
			$this->plugin_name . '-general-settings', // option_group, a setting group name
			$this->plugin_name . '-general-settings', // option_name
			array( $this, 'sandbox_register_setting' ) // type, sanitize_callback
		);

		// Here we are going to add a section for our setting.
		add_settings_section(
			$this->plugin_name . '-general-settings-section', // id
			__( 'Settings', 'index-chat' ), // title
			array( $this, 'sandbox_add_settings_section' ), // type, sanitize_callback
			$this->plugin_name . '-general-settings' // page, the slug-name of the settings page on which to show the section
		);

		add_settings_field(
			'index-chat-disable-plugin', // slug
			__( 'Disable index-chat', 'index-chat' ), // title
			array( $this, 'sandbox_add_settings_field_single_checkbox' ), // callback, sanitize function
			$this->plugin_name . '-general-settings', // page setting slug
			$this->plugin_name . '-general-settings-section', // setting section slug
			array( //extra parameters
				'label_for' => 'index-chat-disable-plugin-checkbox', // label for
				'section_slug' => '-general-settings',
				'description' => __( 'If checked, it will turn off the WP Chat plugin.', $this->plugin_name ), // description
				'options_defaults' => $general_settings_defaults
			)
		);

		add_settings_field(
			'index-chat-disable-ajax', // slug
			__( 'Disable Ajax refresh', 'index-chat' ), // title
			array( $this, 'sandbox_add_settings_field_single_checkbox' ), // callback, sanitize function
			$this->plugin_name . '-general-settings', // page setting slug
			$this->plugin_name . '-general-settings-section', // setting section slug
			array( //extra parameters
				'label_for' => 'index-chat-disable-ajax-checkbox', // label for
				'section_slug' => '-general-settings',
				'description' => __( 'If checked, will no longer allow plugin to refresh conversations with ajax.', $this->plugin_name ), // description
				'options_defaults' => $general_settings_defaults,
			)
		);

		add_settings_field(
			'index-chat-refresh-rate',
			__( 'Ajax refresh rate (in milliseconds)', 'index-chat' ),
			array( $this, 'sandbox_add_settings_field_input_number' ),
			$this->plugin_name . '-general-settings',
			$this->plugin_name . '-general-settings-section',
			array(
				'label_for' => 'index-chat-refresh-rate-input',
				'section_slug' => '-general-settings',
				'options_defaults' => $general_settings_defaults,
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
			__( 'Settings', 'index-chat' ), // title
			array( $this, 'sandbox_add_settings_section' ), // type, sanitize_callback
			$this->plugin_name . '-theme-settings' // page, the slug-name of the settings page on which to show the section
		);

		add_settings_field(
			'index-chat-disable-plugin', // slug
			__( 'Disable index-chat', 'index-chat' ), // title
			array( $this, 'sandbox_add_settings_field_single_checkbox' ), // callback, sanitize function
			$this->plugin_name . '-theme-settings', // page setting slug
			$this->plugin_name . '-theme-settings-section', // setting section slug
			array( //extra parameters
				'label_for' => 'disable-index-chat', // label for
				'section_slug' => '-theme-settings',
				'description' => __( 'If checked, it will turn off the WP Chat plugin.', 'index-chat' ) // description
			)
		);

		add_settings_field(
			'index-chat-refresh-rate',
			__( 'WP Chat refresh rate (in milliseconds)', 'index-chat' ),
			array( $this, 'sandbox_add_settings_field_input_text' ),
			$this->plugin_name . '-theme-settings',
			$this->plugin_name . '-general-settings-section',
			array(
				'label_for' => 'index-chat-refresh-rate',
				'section_slug' => '-theme-settings',
				'default'   => 1000,
			)
		);

	}

	/**
	* Sandbox our settings.
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

		if (isset($options[$field_id]) && !empty($options[$field_id])){
			$option = $options[ $field_id ];
		}
		else if ( isset($args['options_defaults']) && is_array($args['options_defaults']) ){
			$options_defaults = $args['options_defaults'];
			$option = $options_defaults[$field_id];
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
		if (isset($args['options_defaults']) && is_array($args['options_defaults'])){
			$options_defaults = $args['options_defaults'];
			$field_default = $options_defaults[$field_id];
		}
		$option = $field_default;

		$section = $args['section_slug'];

		$options = get_option( $this->plugin_name . $section );

		if ( ! empty( $options[ $field_id ] ) ) {
			$option = $options[ $field_id ];
		}
		?>
		<input type="text" name="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" id="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" value="<?php echo esc_attr( $option ); ?>" class="regular-text" />
		<?php
	}

	public function sandbox_add_settings_field_input_number( $args ) {
		$field_id = $args['label_for'];
		if (isset($args['options_defaults']) && is_array($args['options_defaults'])){
			$options_defaults = $args['options_defaults'];
			$field_default = $options_defaults[$field_id];
		}
		$option = $field_default;

		$section = $args['section_slug'];

		$options = get_option( $this->plugin_name . $section );

		if ( ! empty( $options[ $field_id ] ) ) {
			$option = $options[ $field_id ];
		}

		?>
		<input type="number" name="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" id="<?php echo $this->plugin_name . $section . '[' . $field_id . ']'; ?>" value="<?php echo esc_attr( $option ); ?>" class="small-text" min="500" max="3600000" />
		<?php
	}

}
