const express = require('express');
const multer = require('multer');
const path = require('path');
const { StudyRecord, StudyPlan } = require('../models/schemas');
const { authMiddleware, studentOnly } = require('../middleware/auth');

const router = express.Router();

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'study-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 학습 기록 생성 (학생만 가능)
router.post('/', authMiddleware, studentOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { planId, startTime, endTime, actualDuration, summary, difficulty, satisfaction } = req.body;

    // 학습 계획 확인
    const studyPlan = await StudyPlan.findById(planId);
    if (!studyPlan) {
      return res.status(404).json({ error: '학습 계획을 찾을 수 없습니다.' });
    }

    if (studyPlan.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 업로드된 이미지 파일 경로
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const studyRecord = new StudyRecord({
      planId,
      studentId: req.user._id,
      startTime,
      endTime,
      actualDuration,
      summary,
      images,
      difficulty,
      satisfaction
    });

    await studyRecord.save();
    await studyRecord.populate('planId', 'title subject');

    // 학습 계획 상태를 완료로 업데이트
    studyPlan.status = 'completed';
    studyPlan.completedAt = new Date();
    await studyPlan.save();

    res.status(201).json({
      message: '학습 기록이 생성되었습니다.',
      studyRecord
    });
  } catch (error) {
    console.error('학습 기록 생성 오류:', error);
    res.status(500).json({ error: '학습 기록 생성 중 오류가 발생했습니다.' });
  }
});

// 학습 기록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      // 부모는 자신의 자녀들의 기록만 조회 가능
      const { User } = require('../models/schemas');
      const children = await User.find({ parentId: req.user._id });
      const childrenIds = children.map(child => child._id);
      query.studentId = { $in: childrenIds };
    }

    const { planId, date } = req.query;
    
    if (planId) {
      query.planId = planId;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const studyRecords = await StudyRecord.find(query)
      .populate('planId', 'title subject')
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });

    res.json({ studyRecords });
  } catch (error) {
    console.error('학습 기록 조회 오류:', error);
    res.status(500).json({ error: '학습 기록 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 학습 기록 조회
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const studyRecord = await StudyRecord.findById(req.params.id)
      .populate('planId', 'title subject')
      .populate('studentId', 'name');

    if (!studyRecord) {
      return res.status(404).json({ error: '학습 기록을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user.role === 'student' && studyRecord.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    if (req.user.role === 'parent') {
      const { User } = require('../models/schemas');
      const student = await User.findById(studyRecord.studentId._id);
      if (!student || student.parentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
      }
    }

    res.json({ studyRecord });
  } catch (error) {
    console.error('학습 기록 조회 오류:', error);
    res.status(500).json({ error: '학습 기록 조회 중 오류가 발생했습니다.' });
  }
});

// 학습 기록 수정 (학생만 가능)
router.put('/:id', authMiddleware, studentOnly, upload.array('images', 5), async (req, res) => {
  try {
    const studyRecord = await StudyRecord.findById(req.params.id);
    
    if (!studyRecord) {
      return res.status(404).json({ error: '학습 기록을 찾을 수 없습니다.' });
    }

    if (studyRecord.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const { summary, difficulty, satisfaction } = req.body;

    studyRecord.summary = summary || studyRecord.summary;
    studyRecord.difficulty = difficulty || studyRecord.difficulty;
    studyRecord.satisfaction = satisfaction || studyRecord.satisfaction;

    // 새로운 이미지가 업로드된 경우
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      studyRecord.images = [...studyRecord.images, ...newImages];
    }

    await studyRecord.save();

    res.json({
      message: '학습 기록이 수정되었습니다.',
      studyRecord
    });
  } catch (error) {
    console.error('학습 기록 수정 오류:', error);
    res.status(500).json({ error: '학습 기록 수정 중 오류가 발생했습니다.' });
  }
});

module.exports = router;