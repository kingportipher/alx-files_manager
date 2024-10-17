import { contentType } from 'mime-types';
import dbClient from '../utils/db';
import UtilController from './UtilController';

export default class FilesController {
  static async postUpload(req, res) {
    const userId = req.user.id;
    const { name, type, parentId, isPublic, data } = req.body;

    if (!name || !type || !['folder', 'file', 'image'].includes(type) || (!data && type !== 'folder')) {
      const error = !name ? 'Missing name' : (!type || !['folder', 'file', 'image'].includes(type)) ? 'Missing type' : 'Missing data';
      return res.status(400).send(`error: ${error}`);
    }

    try {
      let isInvalid = false;

      if (parentId) {
        const parent = await dbClient.filterFiles({ _id: parentId });
        if (!parent) {
          res.status(400).json({ error: 'Parent not found' });
          isInvalid = true;
        } else if (parent.type !== 'folder') {
          res.status(400).json({ error: 'Parent is not a folder' });
          isInvalid = true;
        }
      }

      if (!isInvalid) {
        const result = await dbClient.newFile(userId, name, type, isPublic, parentId, data);
        const fileData = result.ops[0];
        delete fileData.localPath;
        fileData.id = fileData._id;
        delete fileData._id;
        res.status(201).json(fileData);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getShow(req, res) {
    const userId = req.user._id;
    const { id } = req.params;

    const file = await dbClient.filterFiles({ _id: id });
    if (!file || String(file.userId) !== String(userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const userId = req.user._id;
    const parentId = req.query.parentId || '0';
    const page = req.query.page || 0;

    const cursor = await dbClient.findFiles(
      { parentId, userId },
      { limit: 20, skip: 20 * page }
    );

    const files = await cursor.toArray();
    files.forEach((file) => {
      file.id = file._id;
      delete file._id;
    });

    res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const userId = req.usr._id;
    const file = await dbClient.filterFiles({ _id: req.params.id });

    if (!file || String(file.userId) !== String(userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: true });
    res.status(200).json(updatedFile);
  }

  static async putUnpublish(req, res) {
    const userId = req.usr._id;
    const file = await dbClient.filterFiles({ _id: req.params.id });

    if (!file || String(file.userId) !== String(userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: false });
    res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const userId = req.usr._id;
    const file = await dbClient.filterFiles({ _id: req.params.id });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    if (String(file.userId) === String(userId) || file.isPublic) {
      try {
        const fileContent = await UtilController.readFile(file.localPath);
        const headers = { 'Content-Type': contentType(file.name) };
        res.set(headers).status(200).send(fileContent);
      } catch (error) {
        res.status(404).json({ error: 'Not found' });
      }
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
}

