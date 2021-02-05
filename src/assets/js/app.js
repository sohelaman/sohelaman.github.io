/* app.js */

import $ from 'jquery';
import theaterJS from 'theaterjs';
import Cookies from 'js-cookie';
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/firestore";

let quasiWeirdObject = {
    /**
     * Initialize.
     */
    init: function () {
        console.log('Silence is golden.');
        this.bindings();
        this.setupFirebase();
        this.theaterize();
    }, // end of init()

    /**
     * Bind events.
     */
    bindings: function () {
        this.catchMe();
    }, // end of bindings()

    /**
     * Firebase.
     */
    setupFirebase: function () {
        let that = this;

        let firebaseConfig = {
            apiKey: "AIzaSyBtgGtB8g78yWR0EFHe-OmCcU-HPL1N18Q",
            authDomain: "whoami-101.firebaseapp.com",
            projectId: "whoami-101",
            storageBucket: "whoami-101.appspot.com",
            messagingSenderId: "338439278754",
            appId: "1:338439278754:web:49a075fdc0709a85a347fb",
            measurementId: "G-9B92YMWG9H"
        };

        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        // const analytics = firebase.analytics;

        let db = firebase.firestore();

        db.collection("config").doc('ui').get().then(doc => {
            // console.log('config.ui', doc.data());
            if (doc.exists) {
                $('#my-avatar').attr('src', doc.data().avatar);
                /* $('#my-avatar').animate({opacity: 0}, 500, () => {
                    $('#my-avatar').attr('src', doc.data().avatar);
                    $('#my-avatar').animate({opacity: 1}, 500);
                }); */
                $('.design-credit').fadeIn();
            }
        });

        db.collection("pages").get().then((querySnapshot) => {
            // console.log('querySnapshot', querySnapshot);
            let pages = [];
            querySnapshot.forEach((doc) => {
                // console.log(doc.id, doc.data());
                pages.push(doc.data());
            });

            // console.log('pages', pages);

            pages.forEach(item => {
                let $elmPage = $('#' + item.slug);
                if ($elmPage.length) {
                    /* if (typeof item.active != undefined && item.active) {
                        $('.menu-item-' + item.slug).slideDown();
                    } */
                    if (typeof item.banner != undefined && item.banner) {
                        let $elBanner = $elmPage.find('img.page-banner');
                        if ($elBanner.length) {
                            $elBanner.attr('src', item.banner);
                        }
                    }
                    if (typeof item.body != undefined && item.body) {
                        $elmPage.find('p.page-body').html(item.body);
                    }
                }
            });
        });

        $('#contact-form').submit(function (e) {
            e.preventDefault();

            // $(this).find('input,textarea').attr('disabled', true);
            that.showLoader();

            firebase.analytics().logEvent('screen_view', { screen_name: 'contact-form-submission' });

            let data = $(this).serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});

            data.date = (new Date()).toISOString();
            // console.log('form', data);

            db.collection("submissions").add(data)
                .then((docRef) => {
                    console.log("Submission ID: ", docRef.id);
                    $(this).unbind('submit').submit();
                    that.hideLoader();
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });
        });
    }, // end of setupFirebase()

    /**
     * Check if mobile devices.
     */
    isMobile: function () {
        return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    showLoader: function () {
        $("#spinner-back").addClass("show");
        $("#spinner-front").addClass("show");
    },

    hideLoader: function () {
        $("#spinner-back").removeClass("show");
        $("#spinner-front").removeClass("show");
    },

    /**
     * Chameleon
     */
    catchMe: function () {
        let $elmAvatar = $('#my-avatar');

        $elmAvatar.on('click', function () {
            let $el = $(this);
            let borderColor = '#' + ((1 << 24) * Math.random() | 0).toString(16);
            $el.css('border-color', borderColor);
        });
    }, // end of catchMe()

    /**
     * TheaterJS
     */
    theaterize: function () {
        let theater = theaterJS()

        theater
            .on('type:start, erase:start', function () {
                let actor = theater.getCurrentActor();
                actor.$element.classList.add('is-typing');
            })
            .on('type:end, erase:end', function () {
                let actor = theater.getCurrentActor();
                actor.$element.classList.remove('is-typing');
            })

        theater
            .addActor('line1', { speed: 0.8, accuracy: 0.6 })
            .addActor('line2', { speed: 1, accuracy: 0.6 })

        theater
            // .addScene('line1:...', 900)
            // .addScene('line1:Hello, World!', 700)
            .addScene("line2:&nbsp;", 2500, ".", 300, ".", 300, ".", 900, '',
                -3, 900,
                'You have found me!', 900,
                -18,
                'Feel free to leave a message.', 900
            )
            .addScene((setVisible) => {
                setVisible();
                let inAnHour = new Date(new Date().getTime() + 3600 * 1000);
                Cookies.set('visited', 'yes', { expires: inAnHour });
            })
            .addScene(theater.play.bind(theater))
    } // end of theaterize()

}; // end of quasiWeirdObject {}

/**
 * Bootup.
 */
(function () {
    quasiWeirdObject.init();
})();
