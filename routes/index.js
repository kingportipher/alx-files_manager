// routes/index.js
import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UtilController from '../controllers/UtilController';

const router = Router();

// Middleware to handle authorization for specific paths
router.use((req, res, next) => {
  const authPaths = ['/connect'];
  if (authPaths.includes(req.path) && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Middleware to handle token validation for certain paths
router.use((req, res, next) => {
  const tokenPaths = ['/disconnect', '/users/me', '/files'];
  if (tokenPaths.includes(req.path) && !req.headers['x-token']) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Define routes as per the specification
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', UtilController.token, FilesController.putPublish);
router.put('/files/:id/unpublish', UtilController.token, FilesController.putUnpublish);

export default router;

