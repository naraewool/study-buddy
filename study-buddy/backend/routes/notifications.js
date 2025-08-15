const express = require('express');
const { Notification } = require('../models/schemas');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 알림 생성
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, planId, type, title, message, scheduledTime } = req.body;

    const notification = new Notification({
      userId,
      planId,
      type,
      title,
      message,
      scheduledTime
    });

    await notification.save();

    res.status(201).json({
      message: '알림이 생성되었습니다.',
      notification
    });
  } catch (error) {
    console.error('알림 생성 오류:', error);
    res.status(500).json({ error: '알림 생성 중 오류가 발생했습니다.' });
  }
});

// 사용자의 알림 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { isRead, type } = req.query;
    
    let query = { userId: req.user._id };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('planId', 'title subject dueDate')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (error) {
    console.error('알림 조회 오류:', error);
    res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다.' });
  }
});

// 알림 읽음 처리
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: '알림이 읽음 처리되었습니다.',
      notification
    });
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    res.status(500).json({ error: '알림 읽음 처리 중 오류가 발생했습니다.' });
  }
});

// 모든 알림 읽음 처리
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: '모든 알림이 읽음 처리되었습니다.' });
  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error);
    res.status(500).json({ error: '알림 읽음 처리 중 오류가 발생했습니다.' });
  }
});

// 읽지 않은 알림 개수
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 오류:', error);
    res.status(500).json({ error: '알림 개수 조회 중 오류가 발생했습니다.' });
  }
});

// 학습 알림 자동 생성 함수 (스케줄러에서 호출)
const createStudyReminder = async (studyPlan) => {
  try {
    const reminderTime = new Date(studyPlan.dueDate);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1시간 전 알림

    const notification = new Notification({
      userId: studyPlan.studentId,
      planId: studyPlan._id,
      type: 'study_reminder',
      title: '학습 시간 알림',
      message: `"${studyPlan.title}" 학습 시간이 1시간 후입니다!`,
      scheduledTime: reminderTime
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('학습 알림 생성 오류:', error);
  }
};

// 완료 알림 생성 함수
const createCompletionNotice = async (studyPlan, parentId) => {
  try {
    const notification = new Notification({
      userId: parentId,
      planId: studyPlan._id,
      type: 'completion_notice',
      title: '학습 완료 알림',
      message: `자녀가 "${studyPlan.title}" 학습을 완료했습니다.`,
      sentAt: new Date()
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('완료 알림 생성 오류:', error);
  }
};

module.exports = router;
module.exports.createStudyReminder = createStudyReminder;
module.exports.createCompletionNotice = createCompletionNotice;