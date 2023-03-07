<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://https://vianneyain.com/
 * @since      1.0.0
 *
 * @package    Wp_Chat
 * @subpackage Wp_Chat/admin/partials
 */
?>

<!-- This file should primarily consist of HTML with a little bit of PHP. -->

<div id="wrap">
	<form method="post" action="options.php">
		<?php
			settings_fields( 'wp-chat-settings' );
			do_settings_sections( 'wp-chat-settings' );
			submit_button();
		?>
	</form>
</div>
