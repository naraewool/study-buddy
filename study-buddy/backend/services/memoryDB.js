// 간단한 인메모리 데이터베이스 (MongoDB 대신 사용)

class MemoryDB {
  constructor() {
    this.users = [];
    this.studyPlans = [];
    this.studyRecords = [];
    this.notifications = [];
    this.dailyReports = [];
    this.nextId = 1;
  }

  // ID 생성
  generateId() {
    return (this.nextId++).toString();
  }

  // 사용자 관련 메소드
  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }

  async createUser(userData) {
    const newUser = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findUsers(query = {}) {
    let users = [...this.users];
    
    if (query.parentId) {
      users = users.filter(user => user.parentId === query.parentId);
    }
    
    if (query.role) {
      users = users.filter(user => user.role === query.role);
    }
    
    return users;
  }

  // 학습 계획 관련 메소드
  async findStudyPlans(query = {}) {
    let plans = [...this.studyPlans];
    
    if (query.studentId) {
      plans = plans.filter(plan => plan.studentId === query.studentId);
    }
    
    if (query.parentId) {
      plans = plans.filter(plan => plan.parentId === query.parentId);
    }
    
    if (query.status) {
      plans = plans.filter(plan => plan.status === query.status);
    }
    
    if (query.date) {
      const queryDate = new Date(query.date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      plans = plans.filter(plan => {
        const planDate = new Date(plan.dueDate);
        return planDate >= startOfDay && planDate <= endOfDay;
      });
    }
    
    return plans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  async findStudyPlanById(id) {
    return this.studyPlans.find(plan => plan._id === id);
  }

  async createStudyPlan(planData) {
    const newPlan = {
      _id: this.generateId(),
      ...planData,
      status: 'pending',
      createdAt: new Date()
    };
    this.studyPlans.push(newPlan);
    return newPlan;
  }

  async updateStudyPlan(id, updateData) {
    const planIndex = this.studyPlans.findIndex(plan => plan._id === id);
    if (planIndex !== -1) {
      this.studyPlans[planIndex] = { ...this.studyPlans[planIndex], ...updateData };
      return this.studyPlans[planIndex];
    }
    return null;
  }

  async deleteStudyPlan(id) {
    const planIndex = this.studyPlans.findIndex(plan => plan._id === id);
    if (planIndex !== -1) {
      return this.studyPlans.splice(planIndex, 1)[0];
    }
    return null;
  }

  // 학습 기록 관련 메소드
  async findStudyRecords(query = {}) {
    let records = [...this.studyRecords];
    
    if (query.studentId) {
      records = records.filter(record => record.studentId === query.studentId);
    }
    
    if (query.planId) {
      records = records.filter(record => record.planId === query.planId);
    }
    
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createStudyRecord(recordData) {
    const newRecord = {
      _id: this.generateId(),
      ...recordData,
      createdAt: new Date()
    };
    this.studyRecords.push(newRecord);
    return newRecord;
  }

  // 알림 관련 메소드
  async findNotifications(query = {}) {
    let notifications = [...this.notifications];
    
    if (query.userId) {
      notifications = notifications.filter(notif => notif.userId === query.userId);
    }
    
    if (query.isRead !== undefined) {
      notifications = notifications.filter(notif => notif.isRead === query.isRead);
    }
    
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createNotification(notifData) {
    const newNotification = {
      _id: this.generateId(),
      ...notifData,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async updateNotification(id, updateData) {
    const notifIndex = this.notifications.findIndex(notif => notif._id === id);
    if (notifIndex !== -1) {
      this.notifications[notifIndex] = { ...this.notifications[notifIndex], ...updateData };
      return this.notifications[notifIndex];
    }
    return null;
  }

  // 통계
  async countDocuments(collection, query = {}) {
    let data = [];
    
    switch(collection) {
      case 'notifications':
        data = this.notifications;
        break;
      case 'users':
        data = this.users;
        break;
      default:
        return 0;
    }
    
    if (collection === 'notifications' && query.userId && query.isRead !== undefined) {
      data = data.filter(item => item.userId === query.userId && item.isRead === query.isRead);
    }
    
    return data.length;
  }

  // 연결 상태 확인
  isConnected() {
    return true; // 메모리 DB는 항상 연결됨
  }

  // 초기 데이터 생성
  initializeWithSampleData() {
    console.log('📊 샘플 데이터를 생성합니다...');
    
    // 샘플 데이터는 실제 회원가입을 통해 생성되도록 하고
    // 여기서는 빈 상태로 시작
    
    console.log('✅ 메모리 데이터베이스가 초기화되었습니다.');
  }
}

// 싱글톤 인스턴스 생성
const memoryDB = new MemoryDB();
memoryDB.initializeWithSampleData();

module.exports = memoryDB;