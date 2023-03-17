<?php ?>
<div id="wrap">
    <form method="post" action="options.php">
        <?php
		settings_fields('wp-chat-general-settings');
		do_settings_sections('wp-chat-general-settings');
		submit_button();
		?>
    </form>

    <table class="form-table" role="presentation">
        <tbody>
            <tr>
                <th scope="row">
                    <label
                        for="wp-chat-reset-general-settings-default-button"><?php _e('Reset settings to default', 'wp-chat'); ?></label>
                </th>
                <td>
                    <form method="post" name="" action="">
                        <input type="hidden" name="reset-settings" value="1">
                        <input type="submit" name="" id="" value="<?php _e('Reset', 'wp-chat'); ?>">
                    </form>

                </td>
            </tr>
        </tbody>
    </table>
</div>