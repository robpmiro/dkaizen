/**
 * Record Lead
 */
function wpsl_record_lead( source ){

	FB.api('/me', {fields: 'email,first_name,last_name'}, function(response) {
		jQuery.ajax({
			method: "POST",
			url: wpsl_ajax.ajaxurl,
			timeout: 0,
			data: {
				'action': 'wpsl_collect_lead',
				'data': response,
				'source': source
			}
		});
	});

}

/**
 * Record stats
 */
function wpsl_record_stat( widget_id, widget_type, source, action_type ){

	jQuery.ajax({
		method: "POST",
		url: wpsl_ajax.ajaxurl,
		timeout: 0,
		data: {
			'action': 'wpsl_add_stats',
			'widget_id': widget_id,
			'widget_type': widget_type,
			'source': source,
			'action_type': action_type
		}
	});

}

/**
 * Share on FB
 */
function wpsl_fb_share( url, content_hash, uniqid ){

	FB.ui({
		method: 'share',
		href: url
	}, function(response){

		if( typeof response.error_message == 'undefined' ){
			wpsl_send_ajax( wpsl_ajax, content_hash, uniqid );
			wpsl_record_lead('facebook');
			wpsl_record_stat( uniqid, 'share', 'facebook_share', 'impression' );
		}

	});

}

/**
 * Like on FB
 *
 * @deprecated since 0.6
 */
function wpsl_fb_like( url, content_hash, uniqid ){

	FB.api(
		"/me/og.likes",
		"POST",
		{ "object": url },
		function (response) {
			console.log(response);
			if( ( response && ! response.error ) || response.error.code == 3501 ){ // If not error OR error is that user already liked it
				wpsl_send_ajax( wpsl_ajax, content_hash, uniqid );
				wpsl_record_lead('facebook');
				wpsl_record_stat( uniqid, 'share', 'facebook_like', 'impression' );
			}
		}
	);

}

/**
 * Unlock after Instagram Follow
 */
function wpsl_insta_follow( url, content_hash, uniqid ){

	var insta_win = window.open( url, '_blank' );

	wpsl_send_ajax( wpsl_ajax, content_hash, uniqid );
	/*wpsl_record_lead('facebook');*/
	wpsl_record_stat( uniqid, 'share', 'facebook_like', 'impression' );

}

/**
 * Unlock after youtube subscribe
 */
function wpsl_youtube_sub( channel_id, url, content_hash, uniqid ){

	var channel_sub_url = 'http://www.youtube.com/channel/'+channel_id+'?sub_confirmation=1';
	var yt_sub_win = window.open( channel_sub_url, 'yt_sub_win_'+Math.floor((Math.random() * 10) + 1), 'height=300,width=400' );

	// TODO: onbeforeunload not working on chrome
	// yt_sub_win.onbeforeunload = function(){*/
		wpsl_send_ajax( wpsl_ajax, content_hash, uniqid );
		wpsl_record_stat( uniqid, 'share', 'facebook_like', 'impression' );
	// };

}


/**
 * Send Ajax Data
 */
function wpsl_send_ajax( wpsl_ajax, data, uniqid, wid_id ){

	uniqid = typeof uniqid !== 'undefined' ? uniqid : 0;
	wid_id = typeof wid_id !== 'undefined' ? wid_id : 0;

	jQuery.ajax({
		method: "POST",
		url: wpsl_ajax.ajaxurl,
		timeout: 0,
		data: {
			'action': wpsl_ajax.action,
			'data': data,
			'etu_widget_id': wid_id
		},
		beforeSend: function( xhr ) {
			// TODO
		}
	}).done(function( content ) {

		if( uniqid > 0 ){

			jQuery('#wpsl_cont_'+uniqid).empty();
			jQuery('#wpsl_cont_'+uniqid).addClass('wpsl_unlocked_content');
			jQuery('#wpsl_cont_'+uniqid).removeClass('wpsl_locked_widget');

			jQuery('#wpsl_cont_'+uniqid).html(content);

		}

	});

}


jQuery(document).ready(function(){

	jQuery('.close_floting_widget').click(function(e){
		e.preventDefault();
		jQuery(this).parent().hide();
	});

	jQuery('.wpsl_unlock_form').each(function( i, el ){

		if( jQuery(el).data('uniqid') == 'ImageBG' ){
			if( jQuery(el).find('.wpsl_text_input').length > 1 ){
				var ismobb = jQuery(el).parents('.wpsl_email_widget').outerWidth() < 610;
				jQuery(el).find('.wpsl_text_input:first').css('width', ( ismobb ? '47%' : '49%')).css('margin-left', 0).css('margin-right', '1%');
				jQuery(el).find('.wpsl_text_input:last').css('width', '49%').css('margin-left', 0).css('margin-right', 0);
			}else{
				jQuery(el).find('.wpsl_text_input').css('width', '100%');
			}
			jQuery(el).find('.wpsl_submit_button').css('width', '100%').css('max-width', 'none').css('margin-top', '10px');
		}else if( jQuery(el).find('.wpsl_text_input').length > 1 ){
			jQuery(el).find('.wpsl_text_input').css('width', '29%');
		}

	});

	jQuery('#wpsl_facebook_like').click(function(e){
		e.preventDefault();

		var url						=	jQuery(this).data('post_url');
		var content_hash	=	jQuery(this).data('hash');
		var uniqid				=	jQuery(this).data('uniqid');

		FB.getLoginStatus(function(response) {

			if( response.status === 'connected' ){
				wpsl_fb_like( url, content_hash, uniqid );
			}else{
				FB.login(function(response) {
			    if( response.authResponse ){
						wpsl_fb_like( url, content_hash, uniqid );
					}else{
						console.log('User cancelled login or did not fully authorize.');
			    }
				}, {scope: 'email'});
			}

		});

	});

	jQuery('#wpsl_instagram_follow').click(function(e){
		e.preventDefault();

		var url						=	jQuery(this).data('post_url');
		var content_hash	=	jQuery(this).data('hash');
		var uniqid				=	jQuery(this).data('uniqid');

		wpsl_insta_follow( url, content_hash, uniqid );

	});

	jQuery('#wpsl_youtube_subscribe').click(function(e){
		e.preventDefault();

		var channel_id		=	jQuery(this).data('cnc_channel_id');
		var url						=	jQuery(this).data('post_url');
		var content_hash	=	jQuery(this).data('hash');
		var uniqid				=	jQuery(this).data('uniqid');

		wpsl_youtube_sub( channel_id, url, content_hash, uniqid );

	});

	jQuery('#wpsl_facebook_share').click(function(e){
		e.preventDefault();

		var url						=	jQuery(this).data('post_url');
		var content_hash	=	jQuery(this).data('hash');
		var uniqid				=	jQuery(this).data('uniqid');

		FB.getLoginStatus(function(response) {

			if( response.status === 'connected' ){
				wpsl_fb_share( url, content_hash, uniqid );
			}else{
				FB.login(function(response) {
			    if( response.authResponse ){
						wpsl_fb_share( url, content_hash, uniqid );
					}else{
						console.log('User cancelled login or did not fully authorize.');
			    }
				}, {scope: 'email'});
			}

		});

	});

	jQuery('.wpsl_unlock_form').on('submit', function(e){
		e.preventDefault();

		// Validate email. Courtesy of https://stackoverflow.com/a/46181/1541016
		email = jQuery(this).find('[name=email_address]').val();
  	if( ! /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) ){
			alert('Please provide a valid email address.');
			return false;
		}

		var values = {};

		jQuery.each(jQuery(this).serializeArray(), function(i, field) {
		    values[field.name] = field.value;
		});

		var uniqid		=	jQuery(this).find('#uniqid').val();
		var wid_id		=	jQuery(this).find('.widget_id').val();

		jQuery(this).find('input').prop('disabled', true);
		jQuery(this).append('<span class="wpslcnc_loading_gif"></span>');
		buttonEl = jQuery(this).find('.wpsl_submit_button');
		topP = buttonEl.position().top - 8 + (buttonEl.outerHeight()/2);
		leftP= buttonEl.position().left + 15;
		jQuery('.wpslcnc_loading_gif').css({
			'top': topP,
			'left': leftP
		});

		wpsl_send_ajax( wpsl_ajax, values, uniqid, wid_id );

	});

	jQuery('.wpsl_widget_bg').click(function(){
		jQuery('.wpsl_widget_bg').hide();
	});

});

function wpsl_responsive_widgets_hnd(){

	jQuery('.wpsl_locker_widget_cont').each(function( i, el ) {

		if( jQuery(el).outerWidth() > 850 ){
			jQuery(el).removeClass('res470').removeClass('res600').removeClass('res760').removeClass('res850');
		}else if( jQuery(el).outerWidth() > 760 ){
			jQuery(el).removeClass('res470').removeClass('res600').removeClass('res760').addClass('res850');
		}else if( jQuery(el).outerWidth() > 600 ){
			jQuery(el).removeClass('res470').removeClass('res600').addClass('res760').addClass('res850');
		}else if( jQuery(el).outerWidth() > 470 ){
			jQuery(el).removeClass('res470').addClass('res600').addClass('res760').addClass('res850');
		}else{
			jQuery(el).addClass('res470').addClass('res600').addClass('res760').addClass('res850');
		}

		if( jQuery(el).outerWidth() > 850 ){
			if( jQuery(el).find('.wpsl_email_locker_icon.dashicons').length ){
				jQuery(el).find('.wpsl_left_icon').css('height', '');
				jQuery(el).find('.wpsl_email_locker_icon.dashicons').css('font-size', '').css('line-height', '');
			}
		}else{
			if( jQuery(el).find('.wpsl_email_locker_icon.dashicons').length ){

				var iwid = jQuery(el).find('.wpsl_left_icon').outerWidth();

				if( iwid ){
					jQuery(el).find('.wpsl_left_icon').css('height', iwid+'px');
					jQuery(el).find('.wpsl_email_locker_icon.dashicons').css('font-size', iwid*0.66+'px').css('line-height', iwid+'px');
				}else{
					var iwid = jQuery(el).find('.wpsl_email_locker_icon.dashicons').outerWidth();
					var ifns = parseInt(jQuery(el).find('.wpsl_email_locker_icon.dashicons').css('font-size'));
					if( iwid != ifns ){
						jQuery(el).find('.wpsl_email_locker_icon.dashicons').css('font-size', iwid+'px');
					}
				}

			}
		}

	});

}

jQuery(window).on('resize', wpsl_responsive_widgets_hnd );

jQuery(window).on('load resize', function() {

	wpsl_responsive_widgets_hnd();

});

jQuery(window).on('scroll', function(){

	if( jQuery('.wpsl_locked_widget.blurred').length ){

		jQuery('.wpsl_locked_widget.blurred').each(function(i, el){

			var scr_top = jQuery(window).scrollTop();
			var w_toffs = jQuery(el).offset().top;

			var s_top = scr_top - w_toffs + 40;

			if( s_top > 0 && scr_top < w_toffs + jQuery(el).height() - jQuery(el).find('.wpsl_locker_widget_cont').height() ){
				jQuery(el).find('.wpsl_locker_widget_cont').css('top', s_top);
			}

		});

	}

});
