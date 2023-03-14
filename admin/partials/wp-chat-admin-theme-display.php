<?php ?>

<div id="wrap">
	<form method="post" action="options.php">
		<?php
			settings_fields( 'wp-chat-theme-settings' );
			do_settings_sections( 'wp-chat-theme-settings' );
			submit_button();
		?>
	</form>
</div>
