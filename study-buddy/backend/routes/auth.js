const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/schemas');
const { authMiddleware } = require('../middleware/auth');
const memoryDB = require('../services/memoryDB');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, parentId, parentEmail } = req.body;

    // 기존 사용자 확인
    const existingUser = await memoryDB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // 부모 이메일로 부모 ID 찾기 (학생인 경우)
    let finalParentId = parentId;
    if (role === 'student' && parentEmail && !parentId) {
      const parentUser = await memoryDB.findUserByEmail(parentEmail);
      if (parentUser && parentUser.role === 'parent') {
        finalParentId = parentUser._id;
      }
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const userData = {
      email,
      password: hashedPassword,
      name,
      role,
      parentId: role === 'student' ? finalParentId : undefined
    };

    const user = await memoryDB.createUser(userData);

    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 메모리 DB에서 사용자 찾기
    const user = await memoryDB.findUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        parentId: user.parentId
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 프로필 조회
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        parentId: req.user.parentId
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;