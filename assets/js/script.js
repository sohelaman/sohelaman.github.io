

$(function() {

	$(document).foundation();
	theaterize();
	catchMe();

});


function theaterize() {
	var theater = theaterJS()

  theater
    .on('type:start, erase:start', function () {
      // add a class to actor's dom element when he starts typing/erasing
      var actor = theater.getCurrentActor()
      actor.$element.classList.add('is-typing')
    })
    .on('type:end, erase:end', function () {
      // and then remove it when he's done
      var actor = theater.getCurrentActor()
      actor.$element.classList.remove('is-typing')
    })

  theater
    .addActor('line1', { speed: 0.8, accuracy: 0.6 })
    .addActor('line2', { speed: 1, accuracy: 0.6 })

  theater
  	.addScene(800)
    .addScene('line1:...', 900)
	  .addScene('line1:Hi, there!', 700,  ' <strong>Welcome!</strong>', 400)
	  .addScene('line2:I am <strong>Sohel</strong>.', 1000)
	  .addScene('line2:Feel free to send me a message.', 600)
	  .addScene(function (setVisible) {
	      $('.subtext').slideDown();
	      setVisible()
	    })
	  .addScene(theater.play.bind(theater))

} // end of theaterize()


function catchMe() {

	$('#my-avatar').mouseover(function() {
		if( ! $(this).hasClass('abs') ) $(this).addClass('abs');
		if( ! $('.greets').hasClass('padded') ) $('.greets').addClass('padded');

		var w = parseInt( Math.random() * ( $(window).width() - 200 ) );
		var h = parseInt( Math.random() * ( $(window).height() - 200 ) );

    $(this).stop().animate({
        left: w,
        top: h,
    }, 60);

    var borderColor = '#' + ( (1<<24) * Math.random() | 0 ).toString(16);
    $(this).css('border-color', borderColor);
	});

} // end of catchMe()


function validate() {

	var nameField = $('form.shout input[name="name"]');
	var emailField = $('form.shout input[name="email"]');
	var msgField = $('form.shout textarea[name="message"]');

	var isValid = function(str, type) {
		if( !str ) return false;
		str = str.trim();
		if( type == 'email' ) {
			var emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return ( str != "" && str.length >= 6 && emailRegex.test(str) );
		}
		return ( str != "" && str.length >= 3 );
	};

	var fields = [ { target: nameField, type: 'text', valid: true },
								 { target: msgField, type: 'text', valid: true },
								 { target: emailField, type: 'email', valid: true } ];

  $.each(fields, function(index, value) {
  	if( !isValid(value.target.val(), value.type) ) {
  		var errClass = value.class ? value.class : 'input-err';
			fields[index].valid = false;
			if( !value.target.hasClass(errClass) ) {
				value.target.addClass(errClass);
				value.target.on('keyup blur', function() {
					if( !isValid(value.target.val(), value.type) ) {
						value.target.addClass(errClass);
						fields[index].valid = false;
					} else {
						value.target.removeClass(errClass);
						fields[index].valid = true;
					}
				});
			}
		}
  })

  var isAllValid = true;
  $.each(fields, function(index, value) {
  	isAllValid = isAllValid && value.valid;
  });

	if( isAllValid ) {
		var data = { name: nameField.val(), email: emailField.val(), msg: msgField.val() };
		shout(data);
		$('span.sarcasm').fadeOut();
	} else {
		$('span.sarcasm').fadeIn();
	}

	return isAllValid;
} // end of validate()


function shout(data) {
	var modTitle = $('#msgModal #modalTitle');
	$.ajax({
		url: "https://lehos.000webhostapp.com/shout.php",
		type: "POST",
		data: data,
		success: function(result) {
			// console.log(result);
			if( result.success == true ) {
    		$('#msgModal form').fadeOut(600);
				modTitle.html('Thank you! <span class="fa fa-heart"></span>');
				setTimeout(function(){
					$('#msgModal').foundation('reveal', 'close');
				}, 3000);
			} else {
				modTitle.html("Something's wrong, I cound't hear you! :(");
			}
  	},
  	error: function() {
    	modTitle.html('Could not send! Please try again.');
    }
	});
}


function resetForm() {
	var form = $('#msgModal form');
	if(form.length > 0) form[0].reset();
}
