const express = require('express');
const { StudyPlan } = require('../models/schemas');
const { authMiddleware, parentOnly } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const demoData = require('../services/demoData');

const router = express.Router();

// 학습 계획 생성 (부모만 가능)
router.post('/', authMiddleware, parentOnly, async (req, res) => {
  try {
    const { title, description, studentId, dueDate, subject, estimatedDuration, priority } = req.body;

    const studyPlan = new StudyPlan({
      title,
      description,
      studentId,
      parentId: req.user._id,
      dueDate,
      subject,
      estimatedDuration,
      priority
    });

    await studyPlan.save();
    await studyPlan.populate('studentId', 'name email');

    // 학습 알림 생성
    await notificationService.createStudyReminder(studyPlan);

    res.status(201).json({
      message: '학습 계획이 생성되었습니다.',
      studyPlan
    });
  } catch (error) {
    console.error('학습 계획 생성 오류:', error);
    res.status(500).json({ error: '학습 계획 생성 중 오류가 발생했습니다.' });
  }
});

// 학습 계획 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      query.parentId = req.user._id;
    }

    const { status, date } = req.query;
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.dueDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const studyPlans = await StudyPlan.find(query)
      .populate('studentId', 'name email')
      .populate('parentId', 'name email')
      .sort({ dueDate: 1 });

    res.json({ studyPlans });
  } catch (error) {
    console.error('학습 계획 조회 오류:', error);
    res.status(500).json({ error: '학습 계획 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 학습 계획 조회
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('parentId', 'name email');

    if (!studyPlan) {
      return res.status(404).json({ error: '학습 계획을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user.role === 'student' && studyPlan.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    if (req.user.role === 'parent' && studyPlan.parentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    res.json({ studyPlan });
  } catch (error) {
    console.error('학습 계획 조회 오류:', error);
    res.status(500).json({ error: '학습 계획 조회 중 오류가 발생했습니다.' });
  }
});

// 학습 계획 상태 업데이트 (학생이 시작/완료 표시)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const studyPlan = await StudyPlan.findById(req.params.id);
    
    if (!studyPlan) {
      return res.status(404).json({ error: '학습 계획을 찾을 수 없습니다.' });
    }

    // 학생만 자신의 계획 상태 변경 가능
    if (req.user.role === 'student' && studyPlan.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    studyPlan.status = status;
    if (status === 'completed') {
      studyPlan.completedAt = new Date();
      
      // 부모에게 완료 알림 전송
      const { User } = require('../models/schemas');
      const student = await User.findById(studyPlan.studentId);
      if (student) {
        await notificationService.createCompletionNotice(studyPlan, student.name);
      }
    }

    await studyPlan.save();

    res.json({
      message: '학습 계획 상태가 업데이트되었습니다.',
      studyPlan
    });
  } catch (error) {
    console.error('학습 계획 상태 업데이트 오류:', error);
    res.status(500).json({ error: '상태 업데이트 중 오류가 발생했습니다.' });
  }
});

// 학습 계획 수정 (부모만 가능)
router.put('/:id', authMiddleware, parentOnly, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id);
    
    if (!studyPlan) {
      return res.status(404).json({ error: '학습 계획을 찾을 수 없습니다.' });
    }

    if (studyPlan.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const { title, description, dueDate, subject, estimatedDuration, priority } = req.body;

    studyPlan.title = title || studyPlan.title;
    studyPlan.description = description || studyPlan.description;
    studyPlan.dueDate = dueDate || studyPlan.dueDate;
    studyPlan.subject = subject || studyPlan.subject;
    studyPlan.estimatedDuration = estimatedDuration || studyPlan.estimatedDuration;
    studyPlan.priority = priority || studyPlan.priority;

    await studyPlan.save();

    res.json({
      message: '학습 계획이 수정되었습니다.',
      studyPlan
    });
  } catch (error) {
    console.error('학습 계획 수정 오류:', error);
    res.status(500).json({ error: '학습 계획 수정 중 오류가 발생했습니다.' });
  }
});

// 학습 계획 삭제 (부모만 가능)
router.delete('/:id', authMiddleware, parentOnly, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id);
    
    if (!studyPlan) {
      return res.status(404).json({ error: '학습 계획을 찾을 수 없습니다.' });
    }

    if (studyPlan.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    await StudyPlan.findByIdAndDelete(req.params.id);

    res.json({ message: '학습 계획이 삭제되었습니다.' });
  } catch (error) {
    console.error('학습 계획 삭제 오류:', error);
    res.status(500).json({ error: '학습 계획 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;