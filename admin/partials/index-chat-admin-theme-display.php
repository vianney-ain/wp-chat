<?php ?>

<div id="wrap">
	<form method="post" action="options.php">
		<?php
			settings_fields( 'index-chat-theme-settings' );
			do_settings_sections( 'index-chat-theme-settings' );
			submit_button();
		?>
	</form>
</div>
