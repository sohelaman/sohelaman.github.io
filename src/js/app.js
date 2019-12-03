/* app.js */

let quasiWeirdObject = {
  /**
   * Initialize.
   */
  init: function () {
    console.log('Silence is golden.');
    $(document).foundation();
    this.bindings();

    if (Cookies.get('visited') === 'yes')
      this.cutTheBeep();
    else
      this.theaterize();
  }, // end of init()

  /**
   * Bind events.
   */
  bindings: function () {
    this.catchMe();

    $('#shout-send').on('click', () => {
      this.validate();
    });

    $('#shout-reset').on('click', () => {
      let form = $('#msgModal form');
      form[0].reset();
    });
  }, // end of bindings()

  /**
   * Show instantly
   */
  cutTheBeep: function () {
    $('#line1').hide().html('Hi, there! <strong>Welcome!</strong>').fadeIn();
    $('#line2').hide().html('I am <strong>Sohel</strong>. Feel free to send me a message.').fadeIn();
    $('.subtext').slideDown();
  }, // end of cutTheBeep()

  /**
   * Check if mobile devices.
   */
  isMobile: function () {
    return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Chameleon
   */
  catchMe: function () {
    let $elmAvatar = $('#my-avatar');
    $elmAvatar.fadeIn();

    if (this.isMobile()) {
      $elmAvatar.on('click', function () {
        let $el = $(this);
        let borderColor = '#' + ((1 << 24) * Math.random() | 0).toString(16);
        $el.css('border-color', borderColor);
      });
    } else {
      $elmAvatar.on('mouseover', function () {
        let $el = $(this);
        let borderColor = '#' + ((1 << 24) * Math.random() | 0).toString(16);
        $el.css('border-color', borderColor);

        if (!$el.hasClass('absolute')) $el.addClass('absolute');
        $('.my-avatar-proxy').removeClass('hide');

        if ($(".main #my-avatar").length) {
          let element = $el.detach();
          $('body').append(element);
        }

        let threshold = 6;
        let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - threshold - $el.width();
        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - threshold - $el.height();

        let left = Math.floor(Math.random() * w);
        let top = Math.floor(Math.random() * h);

        $el.animate({ left: left, top: top }, 100);
      });
    }
  }, // end of catchMe()

  /**
   * TheaterJS
   */
  theaterize: function () {
    let theater = theaterJS()

    theater
      .on('type:start, erase:start', function () {
        // add a class to actor's dom element when he starts typing/erasing
        let actor = theater.getCurrentActor();
        actor.$element.classList.add('is-typing');
      })
      .on('type:end, erase:end', function () {
        // and then remove it when he's done
        let actor = theater.getCurrentActor();
        actor.$element.classList.remove('is-typing');
      })

    theater
      .addActor('line1', { speed: 0.8, accuracy: 0.6 })
      .addActor('line2', { speed: 1, accuracy: 0.6 })

    theater
      .addScene(800)
      .addScene('line1:...', 900)
      .addScene('line1:Hi, there!', 700, ' <strong>Welcome!</strong>', 400)
      .addScene('line2:I am <strong>Sohel</strong>.', 1000)
      .addScene('line2:Feel free to send me a message.', 600)
      .addScene((setVisible) => {
        $('.subtext').slideDown();
        setVisible();
        let inAnHour = new Date(new Date().getTime() + 3600 * 1000);
        Cookies.set('visited', 'yes', { expires: inAnHour });
      })
      .addScene(theater.play.bind(theater))
  }, // end of theaterize()

  /**
   * Shout to me
   * @param {object} data 
   */
  shout: function (data) {
    let modTitle = $('#msgModal #modalTitle');
    $('body').addClass('waiting');
    $('.form-buttons').slideUp();
    $('form .form-input').prop("disabled", true);
    $.ajax({
      url: 'https://dev-lehos.pantheonsite.io/shout/',
      type: 'POST',
      data: data,
      headers: {
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': location.origin,
        'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Access-Control-Request-Origin',
      },
      success: result => {
        // console.log(result);
        modTitle.html('Thank you! <span class="fa fa-heart"></span>');
        setTimeout(() => { $('#msgModal form').slideUp(600); }, 1000);
        setTimeout(() => { $('#msgModal').foundation('close'); }, 3000);
        $('body').removeClass('waiting');
      }, error: () => {
        modTitle.html('<span class="err">Couldn\'t send! Please try again.</span>');
        $('body').removeClass('waiting');
        $('.form-buttons').slideDown();
        $('form .form-input').prop("disabled", false);
      }
    });
  }, // end of shout()

  /**
   * Validate
   */
  validate: function () {
    let nameField = $('form.shout input[name="name"]');
    let emailField = $('form.shout input[name="email"]');
    let msgField = $('form.shout textarea[name="message"]');

    let isValid = (str, type) => {
      if (!str) return false;
      str = str.trim();
      if (type == 'email') {
        let emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return (str != "" && str.length >= 6 && emailRegex.test(str));
      }
      return (str != "" && str.length >= 3);
    };

    let fields = [
      { target: nameField, type: 'text', valid: true },
      { target: msgField, type: 'text', valid: true },
      { target: emailField, type: 'email', valid: true }
    ];

    $.each(fields, (index, value) => {
      if (!isValid(value.target.val(), value.type)) {
        let errClass = value.class ? value.class : 'input-err';
        fields[index].valid = false;
        if (!value.target.hasClass(errClass)) {
          value.target.addClass(errClass);
          value.target.on('keyup blur', () => {
            if (!isValid(value.target.val(), value.type)) {
              value.target.addClass(errClass);
              fields[index].valid = false;
            } else {
              value.target.removeClass(errClass);
              fields[index].valid = true;
            }
          });
        }
      }
    });

    let isAllValid = true;
    $.each(fields, (index, value) => {
      isAllValid = isAllValid && value.valid;
    });

    if (isAllValid) {
      let data = { name: nameField.val(), email: emailField.val(), msg: msgField.val() };
      this.shout(data);
      $('span.sarcasm').fadeOut();
      $('form-input').removeClass('input-err');
    } else {
      $('span.sarcasm').fadeIn();
    }

    return isAllValid;
  }, // end of validate()

}; // end of quasiWeirdObject {}

/**
 * Bootup.
 */
(function () {
  quasiWeirdObject.init();
})();
