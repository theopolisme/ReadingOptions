<?php

class ReadingOptionsHooks {
	/**
	 * Handler for BeforePageDisplay hook
	 * FIXME: BetaFeatures?
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 */
	public static function onBeforePageDisplay( $out, $skin ) {
		if ( $out->isArticle() ) {
			$out->addModules( 'ext.ReadingOptions' );
		}
		return true;
	}

	/**
	 * Handler for EnableMobileModules hook
	 * FIXME: BetaFeatures?
	 * @param OutputPage $out
	 * @param String $mode
	 * @return bool
	 */
	public static function onEnableMobileModules( $out, $mode ) {
		if ( $out->isArticle() && $mode !== 'stable' ) {
			$out->addModules( 'ext.ReadingOptions.mobile' );
		}
		return true;
	}
}
