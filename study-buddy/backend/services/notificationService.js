const { Notification, StudyPlan, User } = require('../models/schemas');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.initializeScheduler();
  }

  // 스케줄러 초기화
  initializeScheduler() {
    // 매 분마다 알림 확인 (실제 운영에서는 5분 또는 10분 간격 권장)
    cron.schedule('* * * * *', () => {
      this.checkAndSendNotifications();
    });

    // 매일 저녁 8시에 일일 요약 알림 생성
    cron.schedule('0 20 * * *', () => {
      this.createDailySummaryNotifications();
    });
  }

  // 예정된 알림 확인 및 전송
  async checkAndSendNotifications() {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // 아직 전송되지 않은 알림 중 전송 시간이 된 것들
      const pendingNotifications = await Notification.find({
        scheduledTime: { $lte: fiveMinutesFromNow },
        sentAt: { $exists: false }
      }).populate('planId').populate('userId');

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error('알림 확인 중 오류:', error);
    }
  }

  // 학습 알림 생성
  async createStudyReminder(studyPlan) {
    try {
      const reminderTime = new Date(studyPlan.dueDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30분 전 알림

      // 이미 알림이 존재하는지 확인
      const existingNotification = await Notification.findOne({
        planId: studyPlan._id,
        type: 'study_reminder'
      });

      if (existingNotification) {
        return existingNotification;
      }

      const notification = new Notification({
        userId: studyPlan.studentId,
        planId: studyPlan._id,
        type: 'study_reminder',
        title: '📚 학습 시간 알림',
        message: `"${studyPlan.title}" 학습 시간이 30분 후입니다!`,
        scheduledTime: reminderTime
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('학습 알림 생성 오류:', error);
      throw error;
    }
  }

  // 완료 알림 생성 (부모에게)
  async createCompletionNotice(studyPlan, studentName) {
    try {
      const parentUser = await User.findById(studyPlan.parentId);
      if (!parentUser) return;

      const notification = new Notification({
        userId: studyPlan.parentId,
        planId: studyPlan._id,
        type: 'completion_notice',
        title: '✅ 학습 완료 알림',
        message: `${studentName}이(가) "${studyPlan.title}" 학습을 완료했습니다!`,
        sentAt: new Date()
      });

      await notification.save();
      
      // 실시간 알림 전송 (웹소켓이나 푸시 알림)
      await this.sendNotification(notification);
      
      return notification;
    } catch (error) {
      console.error('완료 알림 생성 오류:', error);
      throw error;
    }
  }

  // 일일 요약 알림 생성
  async createDailySummaryNotifications() {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // 모든 부모 계정 조회
      const parents = await User.find({ role: 'parent' });

      for (const parent of parents) {
        // 해당 부모의 자녀들 조회
        const children = await User.find({ parentId: parent._id });
        
        for (const child of children) {
          // 오늘의 학습 통계 계산
          const todayPlans = await StudyPlan.find({
            studentId: child._id,
            dueDate: { $gte: startOfDay, $lte: endOfDay }
          });

          const completedPlans = todayPlans.filter(plan => plan.status === 'completed');
          const completionRate = todayPlans.length > 0 
            ? Math.round((completedPlans.length / todayPlans.length) * 100) 
            : 0;

          let message = `${child.name}의 오늘 학습 요약:\n`;
          message += `📝 총 계획: ${todayPlans.length}개\n`;
          message += `✅ 완료: ${completedPlans.length}개\n`;
          message += `📊 완료율: ${completionRate}%`;

          const notification = new Notification({
            userId: parent._id,
            type: 'daily_summary',
            title: '📊 일일 학습 요약',
            message: message,
            sentAt: new Date()
          });

          await notification.save();
          await this.sendNotification(notification);
        }
      }
    } catch (error) {
      console.error('일일 요약 알림 생성 오류:', error);
    }
  }

  // 알림 전송 (실제 구현에서는 푸시 알림, 이메일, 웹소켓 등)
  async sendNotification(notification) {
    try {
      // 여기서는 콘솔 로그로 대체 (실제로는 푸시 알림 서비스 연동)
      console.log('🔔 알림 전송:', {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type
      });

      // 전송 시간 업데이트
      notification.sentAt = new Date();
      await notification.save();

      // 웹소켓을 통한 실시간 알림 전송 (구현 시)
      // this.sendWebSocketNotification(notification);

      // 푸시 알림 전송 (구현 시)
      // this.sendPushNotification(notification);

    } catch (error) {
      console.error('알림 전송 오류:', error);
    }
  }

  // 웹소켓을 통한 실시간 알림 (향후 구현)
  sendWebSocketNotification(notification) {
    // WebSocket 구현
  }

  // 푸시 알림 전송 (향후 구현)
  sendPushNotification(notification) {
    // Firebase Cloud Messaging 등을 이용한 푸시 알림
  }

  // 특정 사용자의 읽지 않은 알림 개수
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        userId,
        isRead: false
      });
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 오류:', error);
      return 0;
    }
  }

  // 사용자별 알림 조회
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        isRead,
        type,
        limit = 50,
        skip = 0
      } = options;

      let query = { userId };

      if (isRead !== undefined) {
        query.isRead = isRead;
      }

      if (type) {
        query.type = type;
      }

      return await Notification.find(query)
        .populate('planId', 'title subject')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      console.error('사용자 알림 조회 오류:', error);
      return [];
    }
  }
}

module.exports = new NotificationService();