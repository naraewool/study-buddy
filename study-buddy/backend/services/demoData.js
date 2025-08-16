// 데모 데이터 서비스 (MongoDB 없이 사용할 수 있는 메모리 저장소)
const memoryDB = require("./memoryDB");

let demoUsers = [];
let demoStudyPlans = [];
let demoStudyRecords = [];
let demoNotifications = [];

// 초기 데모 사용자 생성
const initializeDemoData = () => {
  const bcrypt = require("bcryptjs");

  // 해시된 비밀번호 생성 (password123)
  const hashedPassword = bcrypt.hashSync("password123", 10);

  // 부모 계정
  const parentUser = {
    _id: "parent-001",
    email: "parent@example.com",
    password: hashedPassword,
    name: "김부모",
    role: "parent",
    createdAt: new Date(),
  };

  // 학생 계정
  const studentUser = {
    _id: "student-001",
    email: "student@example.com",
    password: hashedPassword,
    name: "김학생",
    role: "student",
    parentId: "parent-001",
    createdAt: new Date(),
  };

  demoUsers = [parentUser, studentUser];

  // 메모리 DB에 사용자 추가
  memoryDB.users = [...demoUsers];

  // 샘플 학습 계획
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  demoStudyPlans = [
    {
      _id: "plan-001",
      title: "수학 숙제하기",
      description: "2단원 연산 문제 풀기",
      studentId: "student-001",
      parentId: "parent-001",
      dueDate: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2시간 후
      subject: "수학",
      estimatedDuration: 30,
      priority: "high",
      status: "pending",
      createdAt: new Date(),
    },
    {
      _id: "plan-002",
      title: "영어 단어 외우기",
      description: "1-10과 단어 암기",
      studentId: "student-001",
      parentId: "parent-001",
      dueDate: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4시간 후
      subject: "영어",
      estimatedDuration: 20,
      priority: "medium",
      status: "pending",
      createdAt: new Date(),
    },
    {
      _id: "plan-003",
      title: "독서하기",
      description: "어린왕자 3장 읽기",
      studentId: "student-001",
      parentId: "parent-001",
      dueDate: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6시간 후
      subject: "국어",
      estimatedDuration: 25,
      priority: "low",
      status: "completed",
      completedAt: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1시간 전 완료
      createdAt: new Date(),
    },
  ];

  // 샘플 학습 기록
  demoStudyRecords = [
    {
      _id: "record-001",
      planId: "plan-003",
      studentId: "student-001",
      startTime: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      actualDuration: 30,
      summary: "어린왕자 3장을 읽었습니다. 재미있었어요!",
      images: [],
      difficulty: "easy",
      satisfaction: 5,
      createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000),
    },
  ];

  // 메모리 DB에 데이터 추가
  memoryDB.studyPlans = [...demoStudyPlans];
  memoryDB.studyRecords = [...demoStudyRecords];

  console.log("📊 데모 데이터가 초기화되었습니다.");
  console.log(`👤 사용자: ${demoUsers.length}명`);
  console.log(`📚 학습 계획: ${demoStudyPlans.length}개`);
  console.log(`📝 학습 기록: ${demoStudyRecords.length}개`);
};

// 사용자 관련 함수들
const findUserByEmail = (email) => {
  return demoUsers.find((user) => user.email === email);
};

const findUserById = (id) => {
  return demoUsers.find((user) => user._id === id);
};

const createUser = (userData) => {
  const newUser = {
    _id: `user-${Date.now()}`,
    ...userData,
    createdAt: new Date(),
  };
  demoUsers.push(newUser);
  return newUser;
};

// 학습 계획 관련 함수들
const findStudyPlans = (query = {}) => {
  let plans = [...demoStudyPlans];

  if (query.studentId) {
    plans = plans.filter((plan) => plan.studentId === query.studentId);
  }

  if (query.parentId) {
    plans = plans.filter((plan) => plan.parentId === query.parentId);
  }

  if (query.status) {
    plans = plans.filter((plan) => plan.status === query.status);
  }

  if (query.date) {
    const queryDate = new Date(query.date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    plans = plans.filter((plan) => {
      const planDate = new Date(plan.dueDate);
      return planDate >= startOfDay && planDate <= endOfDay;
    });
  }

  return plans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

const findStudyPlanById = (id) => {
  return demoStudyPlans.find((plan) => plan._id === id);
};

const createStudyPlan = (planData) => {
  const newPlan = {
    _id: `plan-${Date.now()}`,
    ...planData,
    status: "pending",
    createdAt: new Date(),
  };
  demoStudyPlans.push(newPlan);
  return newPlan;
};

const updateStudyPlan = (id, updateData) => {
  const planIndex = demoStudyPlans.findIndex((plan) => plan._id === id);
  if (planIndex !== -1) {
    demoStudyPlans[planIndex] = { ...demoStudyPlans[planIndex], ...updateData };
    return demoStudyPlans[planIndex];
  }
  return null;
};

const deleteStudyPlan = (id) => {
  const planIndex = demoStudyPlans.findIndex((plan) => plan._id === id);
  if (planIndex !== -1) {
    return demoStudyPlans.splice(planIndex, 1)[0];
  }
  return null;
};

// 학습 기록 관련 함수들
const findStudyRecords = (query = {}) => {
  let records = [...demoStudyRecords];

  if (query.studentId) {
    records = records.filter((record) => record.studentId === query.studentId);
  }

  if (query.planId) {
    records = records.filter((record) => record.planId === query.planId);
  }

  return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const createStudyRecord = (recordData) => {
  const newRecord = {
    _id: `record-${Date.now()}`,
    ...recordData,
    createdAt: new Date(),
  };
  demoStudyRecords.push(newRecord);
  return newRecord;
};

// 알림 관련 함수들
const findNotifications = (query = {}) => {
  let notifications = [...demoNotifications];

  if (query.userId) {
    notifications = notifications.filter(
      (notif) => notif.userId === query.userId
    );
  }

  if (query.isRead !== undefined) {
    notifications = notifications.filter(
      (notif) => notif.isRead === query.isRead
    );
  }

  return notifications.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

const createNotification = (notifData) => {
  const newNotification = {
    _id: `notif-${Date.now()}`,
    ...notifData,
    isRead: false,
    createdAt: new Date(),
  };
  demoNotifications.push(newNotification);
  return newNotification;
};

// 초기화 실행
initializeDemoData();

module.exports = {
  // 사용자
  findUserByEmail,
  findUserById,
  createUser,

  // 학습 계획
  findStudyPlans,
  findStudyPlanById,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,

  // 학습 기록
  findStudyRecords,
  createStudyRecord,

  // 알림
  findNotifications,
  createNotification,

  // 데이터 접근
  getDemoUsers: () => demoUsers,
  getDemoStudyPlans: () => demoStudyPlans,
  getDemoStudyRecords: () => demoStudyRecords,

  // 데이터베이스 연결 상태 확인
  isConnected: () => false, // 데모 모드이므로 항상 false
};
