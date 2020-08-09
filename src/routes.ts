import express from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import UsersController from './controllers/UsersController';

const authMiddleware = require("./middlewares/auth");
const routes = express.Router();
const usersController = new UsersController();
const classesControllers = new ClassesController();
const connectionsController = new ConnectionsController();

routes.get('/classes', classesControllers.index);
routes.post('/classes', classesControllers.create);

routes.get('/connections', connectionsController.index);
routes.post('/connections', connectionsController.create);

routes.post('/users', (request, response) => {
    usersController.create(request, response);
});
routes.get('/users', (request, response) => {
    usersController.login(request, response);
});
routes.use(authMiddleware);
routes.get('/users/:id', (request, response) => {
    usersController.index(request, response);
});
routes.put('/users/:id', (request, response) => {
    usersController.update(request, response);
});

export default routes;