import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import DatabaseService from './services/DatabaseService';

const JWT_SECRET: string = process.env.JWT_SECRET!;

export function authRouter() {
  const router = Router();
  const databaseService = new DatabaseService();
  
  router.post('/login', async (req, res) => {
    const { username, password, remember } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, errorMsg: 'Username or password is empty' });
      return;
    }
  
    const userData = await databaseService.getUser(username);
    if (userData === null) {
      res.status(400).json({ success: false, errorMsg: 'User not found' });
      return;
    }
  
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      res.status(400).json({ success: false, errorMsg: 'Invalid password' });
      return;
    }
  
    const user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      companyId: userData.company_id
    };
    const token = jwt.sign(
      { data: user },
      JWT_SECRET,
      { expiresIn: remember ? '30d' : '1h' }
    );
  
    res.json({ success: true, token });
  });

  return router;
}

export function isTokenValid(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return !!decoded;
  } catch (error) {
    return false;
  }
}
