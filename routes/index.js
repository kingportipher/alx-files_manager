// Import required modules and controllers
import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UtilController from '../controllers/UtilController';

// Create a new router instance
const router = Router();

// Middleware to handle authorization for specific routes
router.use((req, res, next) => {
  const protectedPaths = ['/connect'];
  if (protectedPaths.includes(req.path) && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Middleware to validate token headers on certain endpoints
router.use((req, res, next) => {
  const tokenRequiredPaths = ['/disconnect', '/users/me', '/files'];
  if (tokenRequiredPaths.includes(req.path) && !req.headers['x-token']) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Define API endpoints
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

// Export the router
export default router;

