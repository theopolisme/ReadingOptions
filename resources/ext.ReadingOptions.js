( function ( $, mw ) {
	var DEFAULTS = {
			'invert-color': false,
			'font-size': false // inherits
		},

		// Strings used internally
		lsPrefix = 'readingoptions-',

		// Assemble the box
		$optionsBox = $( '<div class="reading-options">' )
			.append( 
				$( '<div class="trigger">' ),
				$( '<div class="options">' )
					.append(
						$( '<div class="fontscale">' )
							.append(
								$( '<span>' ),
								$( '<div class="popup">' )
									.append(
										$( '<span class="up">' ).text( '+' ),
										$( '<span class="down">' ).text( '-' )
									)
							),
						$( '<div class="invert-color">' )
							.append( $( '<span>' ) )
					)
			),

		// setTimeout id used to prevent hiding the box; see showBox
		wTimeout = -1,

		// Whether or not the box is open and options are visible
		boxOpen = false;

	// Sets an option to localStorage and, if the user is
	// logged in, to mw.user.options as well.
	function setOption ( key, value ) {
		if ( window.localStorage ) {
			window.localStorage[lsPrefix + key] = JSON.stringify( value );
		}
	}

	// Gets an option. Uses localStorage or falls back on
	// mw.user.options if localStorage is not set.
	function getOption ( key, fallback ) {
		return JSON.parse( window.localStorage && localStorage[lsPrefix + key] ) || fallback;
	}

	function openBox () {
		$optionsBox.addClass( 'revealed' );
		$optionsBox.show().stop().animate( { width: '100px' }, 150, 'swing', function () {
			boxOpen = true;
			// jQuery sets this to hidden for the reveal to work; we need
			// to show overflow so that popups work correctly
			$optionsBox.css( 'overflow', 'visible' );
		} );
	}

	function closeBox () {
		$optionsBox.removeClass( 'revealed' );
		$optionsBox.stop().animate( { width: '25px' }, 100, 'swing', function () {
			boxOpen = false;
			// Close popups too
			$optionsBox.find( '.options > div .popup' ).fadeOut();
		} );
	}

	function showBox () {
		// Cancel any previously scheduled fade outs
		clearTimeout( wTimeout );

		// Fade in to 0.6 opacity
		$optionsBox.fadeIn();

		// Set up fade out after 2 seconds
		wTimeout = setTimeout( function () {
			closeBox();
			$optionsBox.fadeOut();
		}, 2000  );
	}

	function setupBox () {
		// First, add the box to the page. If on mobile, add it to page-center
		// so that it won't overlap with the left navigation drawer when opened
		( $( '#mw-mf-page-center' ).length ? $( '#mw-mf-page-center' ) : $( 'body' ) )
			.prepend( $optionsBox );

		// Show box when the user starts to scroll and 2 seconds after initial load
		$( document ).on( 'scroll touchmove', showBox );
		$( document ).ready( function () {
			setTimeout( showBox, 2000 );
		} );

		// Set up main trigger to open the box on click
		$optionsBox.find( '.trigger' ).click( function () {
			// Ensure it is shown
			$optionsBox.stop().show();
			if ( boxOpen ) {
				// Close box and prepare to hide it by restarting showBox timer
				closeBox();
				showBox();
			} else {
				openBox();
				// Don't hide since the user has opened it
				clearTimeout( wTimeout );
			}
		} );

		// Set up popups which open when title is pressed
		$optionsBox.find( '.options > div .popup' ).each( function () {
			var $popup = $( this ),
				$trigger = $popup.siblings( 'span' ),
				popupRevealed = false;

			$trigger.click( function () {
				$popup.toggle( !popupRevealed );
				popupRevealed = !popupRevealed;
			} );
		} );
	}

	function setupFontScale () {
		var sizeIncrement = 1,
			$content = $( '#mw-content-text' ).length ? $( '#mw-content-text' ) : $( '#content' ),
			$fontBox = $optionsBox.find( '.fontscale' ),
			$increase = $fontBox.find( '.up' ),
			$decrease = $fontBox.find( '.down' ),
			currentSize = getOption( 'font-size', $content.css( 'font-size' ) );

		function setSize ( size ) {
			$content.css( 'font-size', size + 'px' );
			currentSize = size;
		}

		function changeSize ( increase ) {
			var newSize;
	
			if ( increase ) {
				newSize = currentSize + sizeIncrement;
			} else {
				newSize = currentSize - sizeIncrement;
			}

			// Die early if bad size, hopefully the user will figure it out ^.^
			if ( newSize <= 0 ) {
				return;
			}

			setSize( newSize );
			setOption( 'font-size', newSize );
		}

		// On button pushes, increase or decrease the size appropriately
		$increase.click( function () { changeSize( true ); } );
		$decrease.click( function () { changeSize( false ); } );

		// Set size to previous user preference
		setSize( currentSize );
	}

	function setupInvertColor () {
		function changeInvertedState ( invert ) {
			$( 'body' ).toggleClass( 'inverted-color', invert );
		}

		// On click, if body is currently inverted, uninvert and set pref...
		// otherwise, do the oppose (invert + set pref)
		$optionsBox.find( '.invert-color span' ).click( function () {
			var invert = !$( 'body' ).hasClass( 'inverted-color' );
			changeInvertedState( invert );
			setOption( 'invert-color', invert );
		} );

		// Set state to previous user preference
		changeInvertedState( getOption( 'invert-color', DEFAULTS['invert-color'] ) );
	}

	setupBox();
	setupFontScale();
	setupInvertColor();

}( jQuery, mediaWiki ) );
