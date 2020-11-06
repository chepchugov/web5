(function () {
    const Router = {
        routes: new Map(),
        getByName: name => Router.routes.get(name),
        add: (name, route) => {
            Router.routes.set(name, route);
        },
        go: (route, query, doNotPush) => {
            if (typeof route === "string") {
                route = Router.getByName(route);
            }
            if (route) {
                if (route.validators) {
                    for (const validator of route.validators) {
                        if (!validator()) {
                            Router.go('route-index');
                            return;
                        }
                    }
                }
                $('div[class^="view-"]').hide();
                $(`div.${route.view}`).show();
                if (!doNotPush) {
                    history.pushState(null, document.title, route.url + (query ? '?' + query : ''));
                }
                document.title = route.title;
                if (route.action) {
                    route.action(query);
                }
            } else {
                Router.go('route-notfound');
            }
        }
    };

    const parseRoute = url => {
        url = url.split('?')[0];
        return [...Router.routes.values()].find(it => it.url === url);
    }

    const routeOf = a => {
        const classes = $(a).attr('class').split(' ');
        const name = classes.find(it => it.startsWith('route-'));
        return Router.getByName(name);
    }

    $(document).ready(function () {
        const url = document.location;
        const query = decodeURI(url.search.substr(1));
        Router.go(parseRoute(url.pathname), query);
    });
    $(window).on('popstate', function () {
        const url = document.location;
        const query = decodeURI(url.search.substr(1));
        Router.go(parseRoute(url.pathname), query, true);

        console.log(url + ", " + query);

    });
    $(document).on('click', 'a[class^="route-"]', function () {
        const query = $(this).data('query');
        Router.go(routeOf(this), query);
    });

    window.Router = Router;
})();