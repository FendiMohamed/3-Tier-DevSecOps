const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, todoController.list);
router.post('/', verifyToken, todoController.create);
router.put('/:id', verifyToken, todoController.update);
router.delete('/:id', verifyToken, todoController.remove);

module.exports = router;
