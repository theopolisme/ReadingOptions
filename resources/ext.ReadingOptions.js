( function ( $ ) {
	var DEFAULTS = {
			'color-mode': -1, // no styles applied
			'font-size': false // uses current size
		},

		// Prefix for localStorage keys
		lsPrefix = 'readingoptions-',

		// Main body content area. If on mobile, $main is page-center so
		// that styles/positions won't mess with the left navigation drawer.
		$main = $( '#mw-mf-page-center' ).length ? $( '#mw-mf-page-center' ) : $( 'body' ),

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
						$( '<div class="color-mode">' )
							.append( $( '<span>' ) )
					)
			),

		// setTimeout id used to prevent hiding the box; see showBox
		wTimeout = -1,

		// Box state
		boxShown = false,
		boxOpen = false;

	// Sets an option to localStorage.
	function setOption ( key, value ) {
		if ( window.localStorage ) {
			window.localStorage[lsPrefix + key] = $.toJSON( value );
		}
	}

	// Gets an option. Uses localStorage or fallback if not set/available.
	function getOption ( key, fallback ) {
		if ( window.localStorage && window.localStorage[lsPrefix + key] !== undefined ) {
			return $.evalJSON( window.localStorage[lsPrefix + key] );
		}
		return fallback;
	}

	function openBox () {
		// Die if already open
		if ( boxOpen ) {
			return;
		}

		$optionsBox.addClass( 'revealed' );

		// Opens the box. `fadeTo( 0, 1 )` ensures the box regains full opacity if,
		// for example, the user taps it while it is in the process of fading out
		$optionsBox.stop().fadeTo( 0, 1 ).animate( { width: '100px' }, 150, 'swing', function () {
			boxOpen = true;
			// jQuery sets this to hidden for the reveal to work; we need
			// to show overflow so that popups work correctly
			$optionsBox.css( 'overflow', 'visible' );
		} );
	}

	function closeBox () {
		// Die if already closed
		if ( !boxOpen ) {
			return;
		}
		$optionsBox.removeClass( 'revealed' );

		// Close popups
		$optionsBox.find( '.options > div .popup' ).fadeOut();

		$optionsBox.stop().animate( { width: '25px' }, 100, 'swing', function () {
			boxOpen = false;
		} );
	}

	function hideBox ( delayed ) {
		var hide = function () {
			closeBox();
			$optionsBox.fadeOut( 400, function () {
				boxShown = false;
			} );
		};

		// Already hidden
		if ( !boxShown ) {
			return;
		}

		// Cancel any previously scheduled fade outs
		clearTimeout( wTimeout );

		if ( delayed ) {
			wTimeout = setTimeout( hide, 2000 );
		} else {
			hide();
		}
	}

	function showBox () {
		// Box is already shown, do nothing
		if ( boxShown ) {
			return;
		}

		// Fade in
		$optionsBox.fadeIn();
		
		boxShown = true;

		// Set up the delay to auto-hide the box in the future
		hideBox( /* delayed */ true );
	}

	function setupBox () {
		// First, add the box to the page
		$main.prepend( $optionsBox );

		// Show box when the user starts to scroll and 1 second after initial load
		$( document ).on( 'scroll touchmove', showBox );
		$( document ).ready( function () {
			setTimeout( showBox, 1000 );
		} );

		// Set up main trigger to open the box on click
		$optionsBox.find( '.trigger' ).click( function () {
			if ( boxOpen ) {
				// Close box and hide it
				closeBox();
				hideBox( /* delayed */ true );
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
				if ( popupRevealed ) {
					$popup.fadeOut( 150 );
				} else {
					$popup.fadeIn( 150 );
				}
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
			currentSize = getOption( 'font-size' );

		// Just use current font size if none set (slice removes 'px')
		if ( !currentSize ) {
			currentSize = parseFloat( $content.css( 'font-size' ).slice( 0, -2 ) );
		}

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

	function setupColorMode () {
		var states = [ 'inverted-color', 'sepia-color' ],

			// Cached for when removing classes
			statesClasses = states.join( ' ' ),

			// Used to iterate through state list
			maxIndex = states.length - 1,

			// Get previous user setting. If not set, defaults
			// to -1 (no styles applied).
			state = getOption( 'color-mode', DEFAULTS['color-mode'] );

		function changeState ( state ) {
			// Remove old styles
			$main.removeClass( statesClasses );

			// If an actual state is specified, apply it
			if ( state !== -1 ) {
				$main.addClass( states[state] );
			}
		}

		$optionsBox.find( '.color-mode span' ).click( function () {
			state += 1;

			// Loop back to "no styles applied" state if necessary
			if ( state > maxIndex ) {
				state = -1;
			}

			changeState( state );
			setOption( 'color-mode', state );
		} );

		// Set state to previous user preference
		changeState( state );
	}

	setupBox();
	setupFontScale();
	setupColorMode();

}( jQuery ) );
