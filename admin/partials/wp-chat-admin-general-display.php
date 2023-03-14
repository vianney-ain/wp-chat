<?php ?>
<div id="wrap">
	<form method="post" action="options.php">
		<?php
			settings_fields( 'wp-chat-general-settings' );
			do_settings_sections( 'wp-chat-general-settings' );
			submit_button();
		?>
	</form>
</div>
