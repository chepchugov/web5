M.AutoInit();
updateSessionStatus();
initNavbar();

const clearTasks = () => {
    $('#task-collection').empty();
};

const addTask = task => {
    $('#task-collection').append(`
        <li class="collection-item" data-task-id="${task._id}" data-task-title="${task.title}">
            <div>
                <a href="javascript:void(0)" class="route-task" data-query="${task._id}">
                    ${truncate(task.title, 20)}
                </a>
                <label class="right">
                    <input type="checkbox" ${task.isDone ? 'checked' : ''}>
                    <span>Done</span>
                </label>
            </div>
        </li>
    `);
};

const filterTasks = () => {
    const title = $("#task-search-title").val();

    const option = $("select option:selected").text();
    let isDone;
    if (option === 'Yes') {
        isDone = true;
    } else if (option === 'No') {
        isDone = false;
    }

    $('.collection-item').show();

    if (title.length > 0) {
        $(`.collection-item:not([data-task-title^="${title}"])`).hide();
    }

    if (isDone === true) {
        $('.collection-item input:not(:checked)').closest('.collection-item').hide();
    } else if (isDone === false) {
        $('.collection-item input:checked').closest('.collection-item').hide();
    }
};

const resetTaskForm = () => {
    $('#task-title').val('').prop('disabled', true).prop('disabled', true);
    $('#task-description').val('').prop('disabled', true);
    $('#task-is-done').prop('checked', false).prop('disabled', true);
    $('#task-form button[value=update]').prop('disabled', true);
    $('#task-form button[value=delete]').prop('disabled', true);
};

const fillTaskForm = task => {
    $('#task-form').data('task-id', task._id);
    $('#task-title').val(task.title).prop('disabled', false);
    $('#task-description').val(task.description).prop('disabled', false);
    $('#task-is-done').prop('checked', task.isDone).prop('disabled', false);
    $('#task-form button[value=update]').prop('disabled', false);
    $('#task-form button[value=delete]').prop('disabled', false);
};

const listTasks = onsuccess => {
    const request = $.ajax({
        url: '/api/tasks',
        type: 'get'
    });
    request.done(function (result) {
        if (result.success) {
            onsuccess(result.tasks);
        } else {
            switch (result.reason) {
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
};

const getTask = (id, onsuccess) => {
    const request = $.ajax({
        url: `/api/tasks/${id}`,
        type: 'get'
    });
    request.done(function (result) {
        if (result.success) {
            onsuccess(result.task);
        } else {
            switch (result.reason) {
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
};

Router.add('route-index', {
    url: '/',
    title: 'Home',
    view: 'view-index',
    action: () => {
        initNavbar();
    }
});
Router.add('route-tasks', {
    url: '/tasks',
    title: 'Tasks',
    view: 'view-tasks',
    validators: [isLoggedIn],
    action: () => {
        clearTasks();
        listTasks(tasks => {
            for (const task of tasks) {
                addTask(task);
            }
            filterTasks();
        });
    }
});
Router.add('route-task', {
    url: '/task',
    title: 'Task',
    view: 'view-task',
    validators: [isLoggedIn],
    action: (id) => {
        resetTaskForm();
        getTask(id, task => {
            fillTaskForm(task);
        });
    }
});
Router.add('route-login', {
    url: '/login',
    title: 'Log in',
    view: 'view-login',
    validators: [isNotLoggedIn]
});
Router.add('route-signup', {
    url: '/signup',
    title: 'Sign up',
    view: 'view-signup',
    validators: [isNotLoggedIn]
});
Router.add('route-notfound', {
    url: '/notfound',
    title: 'Not found',
    view: 'view-notfound'
});

// /login
$('#login-form').submit(function (event) {
    event.preventDefault();
    const request = $.ajax({
        url: '/api/login',
        type: 'post',
        data: $(this).serialize()
    });
    request.done(function (result) {
        if (result.success) {
            success('You are logged in');
            sessionStorage.setItem('status', 'loggedIn');
            Router.go("route-index");
        } else {
            switch (result.reason) {
                case 'IncorrectCredentials':
                    fail('Username or password is incorrect');
                    break;
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
});

// /signup
$('#signup-form').submit(function (e) {
    e.preventDefault();
    const request = $.ajax({
        url: '/api/signup',
        type: 'post',
        data: $(this).serialize()
    });
    request.done(function (result) {
        if (result.success) {
            success('You are signed up');
            sessionStorage.setItem('status', 'loggedIn');
            Router.go('route-index');
        } else {
            switch (result.reason) {
                case 'UserExists':
                    fail('A user with the given username is already registered');
                    break;
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
});

// /tasks
$('#task-search-title').on('keyup', function () {
    filterTasks();
});
$('select').change(function () {
    filterTasks();
});
$(document).on('change', '.collection-item input[type=checkbox]', function () {
    const collectionItem = $(this).closest('.collection-item');
    const id = collectionItem.data('task-id');
    const isDone = this.checked;
    const request = $.ajax({
        url: `/api/tasks/${id}`,
        type: 'patch',
        contentType: 'application/json',
        data: JSON.stringify({isDone: isDone})
    });
    request.done(function (result) {
        if (result.success) {
            if (result.task.isDone) {
                success('Task successfully marked as done');
            } else {
                success('Task successfully marked as not done');
            }
        } else {
            fail('Oops! Something went wrong');
        }
    });
});
$('#add-task-form').submit(function (event) {
    event.preventDefault();
    const request = $.ajax({
        url: '/api/tasks',
        type: 'post',
        data: $(this).serialize()
    });
    request.done(function (result) {
        if (result.success) {
            success('Task successfully added')
            addTask(result.task);
        } else {
            switch (result.reason) {
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
});

// /task?...
$('#task-form button[value=update]').click(function (e) {
    e.preventDefault();
    const form = $(this).closest('form');
    const id = form.data('task-id');
    const request = $.ajax({
        url: `/api/tasks/${id}`,
        type: 'put',
        data: form.serialize()
    });
    request.done(function (result) {
        if (result.success) {
            success('Task successfully updated');
        } else {
            switch (result.reason) {
                case 'EmptyTitle':
                    fail('Title can not be empty');
                    break;
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
});
$('#task-form button[value=delete]').click(function (e) {
    e.preventDefault();
    const form = $(this).closest('form');
    const id = form.data('task-id');
    const request = $.ajax({
        url: `/api/tasks/${id}`,
        type: 'delete'
    });
    request.done(function (result) {
        if (result.success) {
            Router.go('route-tasks');
            success('Task successfully deleted');
        } else {
            switch (result.reason) {
                default:
                    fail('Oops! Something went wrong');
            }
        }
    });
});