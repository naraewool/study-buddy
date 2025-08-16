const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const notificationService = require("./services/notificationService");
const demoData = require("./services/demoData");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (이미지 업로드용)
app.use("/uploads", express.static("uploads"));

// MongoDB 연결 (선택사항)
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/studybuddy";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB에 연결되었습니다.");
  })
  .catch((err) => {
    console.warn("MongoDB 연결 실패 (데모 모드로 실행):", err.message);
    console.log("📝 메모리 모드로 실행 중입니다. 데이터는 저장되지 않습니다.");
  });

// 라우트 설정
const authRoutes = require("./routes/auth");
const studyPlanRoutes = require("./routes/studyPlans");
const studyRecordRoutes = require("./routes/studyRecords");
const notificationRoutes = require("./routes/notifications");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/study-records", studyRecordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "학습 도우미 API 서버가 실행 중입니다!" });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({ error: "요청한 경로를 찾을 수 없습니다." });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);

  // 데모 데이터 초기화
  try {
    demoData.initializeDemoData();
    console.log("📊 데모 데이터가 초기화되었습니다.");
  } catch (error) {
    console.error("데모 데이터 초기화 실패:", error);
  }
});
