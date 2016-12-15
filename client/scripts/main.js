(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

window.ga('create', 'UA-68861516-1', 'auto');
window.ga('send', 'pageview');

function analyticsEvent(category, action, label) {
        window.ga('send', 'event', category, action, label);
}

var PD = window.PD = {
    constant: {
        student_id_prompt_message: "please enter your guc student id: xx-*****\neg: 40-5610 or 37-12310",
        student_username_prompt_message: "please enter your guc login username\neg: ahmed.mohamed"
    },
    promprtForId: function promprtForId() {
        var storage = window.localStorage
        // if (!storage.getItem('student-username')) {
        //     var id = prompt(PD.constant.student_username_prompt_message)
        //     storage.setItem('student-username', id);
        // }
        if (!storage.getItem('student-id')) {
            var id = prompt(PD.constant.student_id_prompt_message)
            if(id!==null) storage.setItem('student-id', id);
        }
        if (!storage.getItem('user-ip')) {
            PD.getIP(function (ip) {
                storage.setItem('user-ip', ip);
            })
        }
        if(storage.getItem('student-id')){
            window['lougout_btn'].innerHTML = "Logout as "+storage.getItem('student-id')
        } else {
            window['lougout_btn'].innerHTML = "Login"
        }
    },
    sendActivity: function sendActivity(activity) {
        var storage = window.localStorage
        PD.promprtForId();
        activity.meta = activity.meta || {};
        activity.meta['student-id'] = storage.getItem('student-id') || 'anonymous';
        activity.meta['user-ip'] = storage.getItem('user-ip');
        activity.event = activity.event || 'python-debugger.editor';
        activity.action = activity.action || 'run';

        analyticsEvent(activity.event, activity.action, activity.meta['student-id'])

        $.post('http://www.kodr.in/api/activity', activity).done(function() {
            console.log('sucess');
        }).fail(function(xhr) {
            console.log('could not send', xhr);
        });

    },
    getIP: function getIP(cb) {
        $.get('http://jsonip.com').done(function (json) {
            cb(json.ip);
        })
    },
    logout: function logout() {
        var storage = window.localStorage
        if (storage.getItem('student-id')) {
            storage.removeItem('student-id');
            PD.getIP(function (ip) {
                storage.setItem('user-ip', ip);
            })
            window['lougout_btn'].innerHTML = "Login"
        }
    },
    authAction: function authAction() {
        if (localStorage.getItem('student-id')) {
            PD.logout()
        } else {
            PD.promprtForId();
        }
    }
}

PD.promprtForId();
