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

ga('create', 'UA-68861516-1', 'auto');
ga('send', 'pageview');

var PD = {
    promprtForId: function promprtForId() {
        var local = window.localStorage
        if (!local.getItem('student-id')) {
            var id = prompt("please enter your guc student id: 37-*****")
            local.setItem('student-id', id);
        }
    },
    sendActivity: function sendActivity(activity) {
        var local = window.localStorage
        if (!local.getItem('student-id')) {
            var id = prompt("please enter your guc student id: 37-*****")
            local.setItem('student-id', id);
        }
        activity.meta = activity.meta || {};
        activity.meta['student-id'] = local.getItem('student-id');
        activity.event = activity.event || 'python-debugger.editor';
        activity.action = activity.action || 'run';

        $.post('http://www.kodr.in/api/activity', activity).done(function() {
            console.log('sucess');
        }).fail(function(xhr) {
            console.log('could not send', xhr);
        });

    },
    logout: function logout() {
        var local = window.localStorage
        if (local.getItem('student-id')) {
            local.removeItem('student-id');
        }
    }
}

PD.promprtForId();
