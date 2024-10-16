import UtilController from './UtilController';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      const missingField = !email ? 'email' : 'password';
      return res.status(400).json({ error: `Missing ${missingField}` });
    }

    const userAlreadyExists = await dbClient.userExists(email);
    if (userAlreadyExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    try {
      const hashedPassword = UtilController.SHA1(password);
      const newUser = await dbClient.newUser(email, hashedPassword);
      const { _id, email: newEmail } = newUser.ops[0];
      return res.status(201).json({ id: _id, email: newEmail });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getMe(req, res) {
    const { usr } = req;
    const userResponse = { ...usr, id: usr._id };
    delete userResponse._id;
    delete userResponse.password;
    return res.status(200).json(userResponse);
  }
}
