const express = require('express');
const { DailyReport, StudyPlan, StudyRecord, User } = require('../models/schemas');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 일일 리포트 생성/업데이트
router.post('/daily', authMiddleware, async (req, res) => {
  try {
    const { studentId, date } = req.body;
    
    // 권한 확인
    if (req.user.role === 'student') {
      if (studentId !== req.user._id.toString()) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
      }
    } else if (req.user.role === 'parent') {
      const student = await User.findById(studentId);
      if (!student || student.parentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
      }
    }

    const reportDate = new Date(date);
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 해당 날짜의 학습 계획들 조회
    const allPlans = await StudyPlan.find({
      studentId,
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const completedPlans = allPlans.filter(plan => plan.status === 'completed');

    // 해당 날짜의 학습 기록들 조회
    const studyRecords = await StudyRecord.find({
      studentId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('planId');

    // 총 학습 시간 계산
    const totalStudyTime = studyRecords.reduce((total, record) => {
      return total + (record.actualDuration || 0);
    }, 0);

    // 과목별 통계
    const subjectStats = {};
    studyRecords.forEach(record => {
      const subject = record.planId?.subject || '기타';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { timeSpent: 0, plansCompleted: 0 };
      }
      subjectStats[subject].timeSpent += record.actualDuration || 0;
      subjectStats[subject].plansCompleted += 1;
    });

    const subjects = Object.keys(subjectStats).map(subject => ({
      name: subject,
      timeSpent: subjectStats[subject].timeSpent,
      plansCompleted: subjectStats[subject].plansCompleted
    }));

    // 전체 만족도 평균
    const satisfactionRecords = studyRecords.filter(record => record.satisfaction);
    const overallSatisfaction = satisfactionRecords.length > 0
      ? satisfactionRecords.reduce((sum, record) => sum + record.satisfaction, 0) / satisfactionRecords.length
      : null;

    // 기존 리포트 확인 및 업데이트/생성
    let dailyReport = await DailyReport.findOne({
      studentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const reportData = {
      studentId,
      parentId: req.user.role === 'parent' ? req.user._id : (await User.findById(studentId)).parentId,
      date: reportDate,
      completedPlans: completedPlans.length,
      totalPlans: allPlans.length,
      totalStudyTime,
      subjects,
      overallSatisfaction
    };

    if (dailyReport) {
      Object.assign(dailyReport, reportData);
      await dailyReport.save();
    } else {
      dailyReport = new DailyReport(reportData);
      await dailyReport.save();
    }

    res.json({
      message: '일일 리포트가 생성/업데이트되었습니다.',
      dailyReport
    });
  } catch (error) {
    console.error('일일 리포트 생성 오류:', error);
    res.status(500).json({ error: '리포트 생성 중 오류가 발생했습니다.' });
  }
});

// 일일 리포트 조회
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      if (studentId) {
        const student = await User.findById(studentId);
        if (!student || student.parentId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        query.studentId = studentId;
      } else {
        query.parentId = req.user._id;
      }
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    const reports = await DailyReport.find(query)
      .populate('studentId', 'name')
      .sort({ date: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('일일 리포트 조회 오류:', error);
    res.status(500).json({ error: '리포트 조회 중 오류가 발생했습니다.' });
  }
});

// 주간/월간 통계
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const { studentId, period = 'week' } = req.query;
    
    // 권한 확인
    if (req.user.role === 'student') {
      if (studentId && studentId !== req.user._id.toString()) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
      }
    } else if (req.user.role === 'parent' && studentId) {
      const student = await User.findById(studentId);
      if (!student || student.parentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
      }
    }

    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let query = {
      date: { $gte: startDate, $lte: now }
    };

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      if (studentId) {
        query.studentId = studentId;
      } else {
        query.parentId = req.user._id;
      }
    }

    const reports = await DailyReport.find(query);

    // 통계 계산
    const statistics = {
      period,
      totalDays: reports.length,
      totalStudyTime: reports.reduce((sum, report) => sum + report.totalStudyTime, 0),
      totalPlansCompleted: reports.reduce((sum, report) => sum + report.completedPlans, 0),
      totalPlansAssigned: reports.reduce((sum, report) => sum + report.totalPlans, 0),
      averageSatisfaction: null,
      subjectBreakdown: {},
      dailyAverages: {
        studyTime: 0,
        plansCompleted: 0
      }
    };

    if (reports.length > 0) {
      // 평균 만족도 계산
      const satisfactionReports = reports.filter(report => report.overallSatisfaction);
      if (satisfactionReports.length > 0) {
        statistics.averageSatisfaction = satisfactionReports.reduce((sum, report) => 
          sum + report.overallSatisfaction, 0) / satisfactionReports.length;
      }

      // 과목별 통계
      reports.forEach(report => {
        report.subjects.forEach(subject => {
          if (!statistics.subjectBreakdown[subject.name]) {
            statistics.subjectBreakdown[subject.name] = {
              totalTime: 0,
              totalPlans: 0
            };
          }
          statistics.subjectBreakdown[subject.name].totalTime += subject.timeSpent;
          statistics.subjectBreakdown[subject.name].totalPlans += subject.plansCompleted;
        });
      });

      // 일일 평균
      statistics.dailyAverages.studyTime = statistics.totalStudyTime / reports.length;
      statistics.dailyAverages.plansCompleted = statistics.totalPlansCompleted / reports.length;
    }

    res.json({ statistics });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;