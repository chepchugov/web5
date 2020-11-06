const express = require('express');
const {ensureLoggedIn} = require('connect-ensure-login');

const {User} = require('../database');

const router = express.Router();
router.post('/', ensureLoggedIn('/'), (req, res) => {
    const title = req.body.title;
    const description = req.body.description || '';
    const isDone = req.body.isDone || false;

    if (title.length === 0) {
        return res.json({success: false, reason: 'EmptyTitle'});
    }

    const user = req.user;
    const tasks = user.tasks;

    const task = tasks.create({
        title: title,
        description: description,
        isDone: isDone
    });

    tasks.push(task);

    user.save();

    return res.json({success: true, task: task});
});
router.delete('/:id', ensureLoggedIn('/'), async (req, res) => {
    /* TODO */
    await User.updateOne({_id: req.user._id}, {
        $pull: {
            tasks: {_id: req.params.id}
        }
    });
    return res.json({success: true});
});
router.get('/:id', ensureLoggedIn('/'), (req, res) => {
    const id = req.params.id;

    const user = req.user;
    const tasks = user.tasks;

    const task = tasks.id(id);

    return res.json({success: true, task: task.toObject()})
});
router.put('/:id', ensureLoggedIn('/'), (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const isDone = req.body.isDone === 'on';

    console.log("isDone = " + isDone);

    if (title.length === 0) {
        return res.json({success: false, reason: 'EmptyTitle'});
    }

    const user = req.user;
    const tasks = user.tasks;

    const task = tasks.id(id);
    task.title = title;
    task.description = description;
    task.isDone = isDone;

    user.save();

    return res.json({success: true});
});
router.patch('/:id', ensureLoggedIn('/'), (req, res) => {
    const user = req.user;
    const tasks = user.tasks;

    const task = tasks.id(req.params.id);
    task.isDone = req.body.isDone;

    user.save();

    return res.json({success: true, task: task});
});
router.get('/', ensureLoggedIn('/'), (req, res) => {
    const user = req.user;
    const tasks = user.tasks;

    return res.json({success: true, tasks: tasks.toObject()});
});

module.exports = router;
