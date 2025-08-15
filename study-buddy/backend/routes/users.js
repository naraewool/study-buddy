const express = require('express');
const { User } = require('../models/schemas');
const { authMiddleware, parentOnly } = require('../middleware/auth');

const router = express.Router();

// 부모의 자녀 목록 조회
router.get('/children', authMiddleware, parentOnly, async (req, res) => {
  try {
    const children = await User.find({ 
      parentId: req.user._id 
    }).select('-password');

    res.json({ children });
  } catch (error) {
    console.error('자녀 목록 조회 오류:', error);
    res.status(500).json({ error: '자녀 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 자녀 계정 생성 (부모가 자녀 계정 생성)
router.post('/children', authMiddleware, parentOnly, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 기존 사용자 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // 비밀번호 해시화
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 자녀 계정 생성
    const child = new User({
      email,
      password: hashedPassword,
      name,
      role: 'student',
      parentId: req.user._id
    });

    await child.save();

    res.status(201).json({
      message: '자녀 계정이 생성되었습니다.',
      child: {
        id: child._id,
        email: child.email,
        name: child.name,
        role: child.role
      }
    });
  } catch (error) {
    console.error('자녀 계정 생성 오류:', error);
    res.status(500).json({ error: '자녀 계정 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;