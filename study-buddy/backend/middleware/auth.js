const jwt = require('jsonwebtoken');
const { User } = require('../models/schemas');
const memoryDB = require('../services/memoryDB');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // 메모리 DB에서 사용자 찾기
    const user = await memoryDB.findUserById(decoded.userId);
    let userWithoutPassword = null;
    
    if (user) {
      // 비밀번호 제거
      const { password, ...userData } = user;
      userWithoutPassword = userData;
    }
    
    if (!userWithoutPassword) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = userWithoutPassword;
    next();
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 부모 권한 확인
const parentOnly = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: '부모만 접근할 수 있습니다.' });
  }
  next();
};

// 학생 권한 확인
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: '학생만 접근할 수 있습니다.' });
  }
  next();
};

module.exports = { authMiddleware, parentOnly, studentOnly };