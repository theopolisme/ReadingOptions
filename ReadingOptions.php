<?php

/**
 * Reading Options
 *
 * Provides a small floating box that offers users
 * control over their reading experience.
 *
 * @license GPL v3+
 * @author Theopolisme <theopolismewiki@gmail.com>
 */

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'ReadingOptions',
	'author' => 'Theopolisme',
	'url' => '',
	'descriptionmsg' => 'readingoptions-desc',
	'version' => '0.1.0',
);

$wgResourceModules['ext.ReadingOptions'] = array(
	'scripts' => 'resources/ext.ReadingOptions.js',
	'styles' => 'resources/ext.ReadingOptions.css',

	'messages' => array(),

	'localBasePath' => __DIR__,
	'remoteExtPath' => 'ReadingOptions'
);

$wgResourceModules['ext.ReadingOptions.mobile'] = $wgResourceModules['ext.ReadingOptions'] + array(
	'targets' => 'mobile'
);

$wgMessagesDirs['ReadingOptions'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['ReadingOptions'] = __DIR__ . '/ReadingOptions.i18n.php';

$wgAutoloadClasses['ReadingOptionsHooks'] = __DIR__ . '/ReadingOptionsHooks.php';

# Not really hooked up for desktop at the moment.
#$wgHooks['BeforePageDisplay'][] = 'ReadingOptionsHooks::onBeforePageDisplay';

$wgHooks['EnableMobileModules'][] = 'ReadingOptionsHooks::onEnableMobileModules';
