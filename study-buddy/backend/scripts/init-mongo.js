// MongoDB 초기화 스크립트

// 데이터베이스 생성
db = db.getSiblingDB('studybuddy');

// 테스트 사용자 생성 (부모)
db.users.insertOne({
  email: 'parent@example.com',
  password: '$2a$10$E8VQ5Q5Q5Q5Q5Q5Q5Q5Q5uZHx3Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', // 'password123' 해시
  name: '김부모',
  role: 'parent',
  createdAt: new Date()
});

// 테스트 사용자 생성 (학생)
const parentId = db.users.findOne({email: 'parent@example.com'})._id;

db.users.insertOne({
  email: 'student@example.com',
  password: '$2a$10$E8VQ5Q5Q5Q5Q5Q5Q5Q5Q5uZHx3Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', // 'password123' 해시
  name: '김학생',
  role: 'student',
  parentId: parentId,
  createdAt: new Date()
});

// 인덱스 생성
db.users.createIndex({ email: 1 }, { unique: true });
db.studyplans.createIndex({ studentId: 1, dueDate: 1 });
db.studyrecords.createIndex({ studentId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.dailyreports.createIndex({ studentId: 1, date: 1 });

print('Database initialized successfully!');