const updateSessionStatus = () => {
    const request = $.ajax({
        url: '/api/auth',
        type: 'get'
    });
    request.done(function (result) {
        if (result.success) {
            sessionStorage.setItem('status', 'loggedIn');
        }
    });
};

const isLoggedIn = () => sessionStorage.getItem('status') === 'loggedIn';

const isNotLoggedIn = () => !isLoggedIn();

const initNavbar = () => {
    $('.route-tasks').show();
    $('.route-login').show();
    $('.route-signup').show();
    $('._route-logout').show();

    if (isLoggedIn()) {
        $('.route-login').hide();
        $('.route-signup').hide();
    } else {
        $('.route-tasks').hide();
        $('._route-logout').hide();
    }
};

const logout = () => {
    const request = $.ajax({
        url: '/api/logout',
        type: 'get'
    });
    request.done(function (result) {
        if (result.success) {
            success('You are logged out');
            sessionStorage.removeItem('status');
            Router.go("route-index");
            initNavbar();
        }
    });
};