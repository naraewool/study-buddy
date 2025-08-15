const mongoose = require('mongoose');

// 사용자 스키마 (부모 및 학생)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['parent', 'student'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 학생의 경우 부모 ID
  createdAt: { type: Date, default: Date.now }
});

// 학습 계획 스키마
const studyPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  subject: { type: String }, // 과목 (수학, 영어, 국어 등)
  estimatedDuration: { type: Number }, // 예상 소요 시간 (분)
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// 학습 기록 스키마
const studyRecordSchema = new mongoose.Schema({
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  actualDuration: { type: Number }, // 실제 소요 시간 (분)
  summary: { type: String }, // 학습 내용 요약
  images: [{ type: String }], // 이미지 URL 배열
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  satisfaction: { type: Number, min: 1, max: 5 }, // 만족도 (1-5)
  createdAt: { type: Date, default: Date.now }
});

// 알림 스키마
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' },
  type: { type: String, enum: ['study_reminder', 'completion_notice', 'daily_summary'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  scheduledTime: { type: Date },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 일일 리포트 스키마
const dailyReportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  completedPlans: { type: Number, default: 0 },
  totalPlans: { type: Number, default: 0 },
  totalStudyTime: { type: Number, default: 0 }, // 총 학습 시간 (분)
  subjects: [{ 
    name: String, 
    timeSpent: Number, 
    plansCompleted: Number 
  }],
  overallSatisfaction: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  StudyPlan: mongoose.model('StudyPlan', studyPlanSchema),
  StudyRecord: mongoose.model('StudyRecord', studyRecordSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  DailyReport: mongoose.model('DailyReport', dailyReportSchema)
};