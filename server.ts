import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Student, ShopItem } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initial in-memory database of students (Classes 1 to 10)
let students: Student[] = [
  // Class 1
  { id: "s-1-1", name: "김도윤", classNo: 1, code: "1001", cookies: 12, activeExchange: null, lastExchangeResult: null },
  { id: "s-1-2", name: "이서아", classNo: 1, code: "1002", cookies: 8, activeExchange: null, lastExchangeResult: null },
  { id: "s-1-3", name: "박시우", classNo: 1, code: "1003", cookies: 15, activeExchange: null, lastExchangeResult: null },
  { id: "s-1-4", name: "정지유", classNo: 1, code: "1004", cookies: 9, activeExchange: null, lastExchangeResult: null },

  // Class 2
  { id: "s-2-1", name: "최하준", classNo: 2, code: "2001", cookies: 11, activeExchange: null, lastExchangeResult: null },
  { id: "s-2-2", name: "윤아윤", classNo: 2, code: "2002", cookies: 6, activeExchange: null, lastExchangeResult: null },
  { id: "s-2-3", name: "강지호", classNo: 2, code: "2003", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-2-4", name: "조서현", classNo: 2, code: "2004", cookies: 14, activeExchange: null, lastExchangeResult: null },

  // Class 3
  { id: "s-3-1", name: "장준우", classNo: 3, code: "3001", cookies: 7, activeExchange: null, lastExchangeResult: null },
  { id: "s-3-2", name: "임지우", classNo: 3, code: "3002", cookies: 13, activeExchange: null, lastExchangeResult: null },
  { id: "s-3-3", name: "한민우", classNo: 3, code: "3003", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-3-4", name: "오하은", classNo: 3, code: "3004", cookies: 5, activeExchange: null, lastExchangeResult: null },

  // Class 4
  { id: "s-4-1", name: "서지민", classNo: 4, code: "4001", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-4-2", name: "신건우", classNo: 4, code: "4002", cookies: 12, activeExchange: null, lastExchangeResult: null },
  { id: "s-4-3", name: "권유나", classNo: 4, code: "4003", cookies: 4, activeExchange: null, lastExchangeResult: null },
  { id: "s-4-4", name: "황도현", classNo: 4, code: "4004", cookies: 16, activeExchange: null, lastExchangeResult: null },

  // Class 5
  { id: "s-5-1", name: "안서연", classNo: 5, code: "5001", cookies: 11, activeExchange: null, lastExchangeResult: null },
  { id: "s-5-2", name: "송우진", classNo: 5, code: "5002", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-5-3", name: "전민지", classNo: 5, code: "5003", cookies: 14, activeExchange: null, lastExchangeResult: null },
  { id: "s-5-4", name: "홍성민", classNo: 5, code: "5004", cookies: 8, activeExchange: null, lastExchangeResult: null },

  // Class 6
  { id: "s-6-1", name: "유채원", classNo: 6, code: "6001", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-6-2", name: "고예준", classNo: 6, code: "6002", cookies: 12, activeExchange: null, lastExchangeResult: null },
  { id: "s-6-3", name: "문수빈", classNo: 6, code: "6003", cookies: 7, activeExchange: null, lastExchangeResult: null },
  { id: "s-6-4", name: "양주원", classNo: 6, code: "6004", cookies: 13, activeExchange: null, lastExchangeResult: null },

  // Class 7
  { id: "s-7-1", name: "손지연", classNo: 7, code: "7001", cookies: 9, activeExchange: null, lastExchangeResult: null },
  { id: "s-7-2", name: "배준호", classNo: 7, code: "7002", cookies: 15, activeExchange: null, lastExchangeResult: null },
  { id: "s-7-3", name: "백다은", classNo: 7, code: "7003", cookies: 5, activeExchange: null, lastExchangeResult: null },
  { id: "s-7-4", name: "허태현", classNo: 7, code: "7004", cookies: 11, activeExchange: null, lastExchangeResult: null },

  // Class 8
  { id: "s-8-1", name: "노예은", classNo: 8, code: "8001", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-8-2", name: "남지철", classNo: 8, code: "8002", cookies: 12, activeExchange: null, lastExchangeResult: null },
  { id: "s-8-3", name: "심하영", classNo: 8, code: "8003", cookies: 6, activeExchange: null, lastExchangeResult: null },
  { id: "s-8-4", name: "유재희", classNo: 8, code: "8004", cookies: 14, activeExchange: null, lastExchangeResult: null },

  // Class 9
  { id: "s-9-1", name: "하서진", classNo: 9, code: "9001", cookies: 15, activeExchange: null, lastExchangeResult: null },
  { id: "s-9-2", name: "곽도경", classNo: 9, code: "9002", cookies: 8, activeExchange: null, lastExchangeResult: null },
  { id: "s-9-3", name: "성지후", classNo: 9, code: "9003", cookies: 10, activeExchange: null, lastExchangeResult: null },
  { id: "s-9-4", name: "차아인", classNo: 9, code: "9004", cookies: 12, activeExchange: null, lastExchangeResult: null },

  // Class 10
  { id: "s-10-1", name: "구민하", classNo: 10, code: "1011", cookies: 13, activeExchange: null, lastExchangeResult: null },
  { id: "s-10-2", name: "우동현", classNo: 10, code: "1012", cookies: 9, activeExchange: null, lastExchangeResult: null },
  { id: "s-10-3", name: "주소율", classNo: 10, code: "1013", cookies: 18, activeExchange: null, lastExchangeResult: null },
  { id: "s-10-4", name: "민지안", classNo: 10, code: "1014", cookies: 5, activeExchange: null, lastExchangeResult: null },
];

const shopItems: ShopItem[] = [
  { id: "item-1", name: "1일 자유 좌석 이용권", cost: 10, icon: "🎟️", description: "하루 동안 내가 원하는 자리에 앉을 수 있는 쿠폰" },
  { id: "item-2", name: "급식 1등 하이패스권", cost: 10, icon: "🍱", description: "오늘 급식 줄을 가장 먼저 설 수 있는 고속 입장 쿠폰" },
  { id: "item-3", name: "일일 숙제 면제권", cost: 10, icon: "📝", description: "하루 숙제를 시원하게 면제해 주는 마법쿠폰" },
  { id: "item-4", name: "컴퓨터 교실 자유 이용권", cost: 10, icon: "🎮", description: "자유 컴퓨터 시간에 원하는 활동을 할 수 있는 티켓" },
  { id: "item-5", name: "모둠 랜덤 과자 상자", cost: 10, icon: "🍿", description: "우리 모둠원들과 함께 나눠 먹을 수 있는 달콤 과자 박스" },
  { id: "item-6", name: "선생님과의 1:1 대화권", cost: 10, icon: "💭", description: "선생님과 따뜻한 코코아를 마시며 수다 떨 수 있는 대화권" }
];

// Reference backup for resetting
const initialStudentsBackup = JSON.parse(JSON.stringify(students));

// --- API Endpoints ---

// 1. Get entire state (for both student and teacher sync)
app.get("/api/state", (req, res) => {
  res.json({
    students,
    shopItems,
  });
});

// 2. Student login using 4-digit code
app.post("/api/student/login", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "코드 번호를 입력해 주세요." });
  }

  const student = students.find(s => s.code === code);
  if (!student) {
    return res.status(404).json({ error: "해당 다했어요 코드가 존재하지 않습니다. (예: 1001 ~ 1004 등)" });
  }

  res.json(student);
});

// 3. Student requests reward exchange (Requires >= 10 cookies)
app.post("/api/student/request-exchange", (req, res) => {
  const { studentId, itemId } = req.body;

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
  }

  const item = shopItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "선택한 보상 상품이 존재하지 않습니다." });
  }

  if (student.cookies < 10) {
    return res.status(400).json({ error: `쿠키가 부족합니다. 교환에는 쿠키 10개가 필요하지만, 현재 ${student.cookies}개만 보유 중입니다.` });
  }

  if (student.activeExchange) {
    return res.status(400).json({ error: "이미 승인 대기 중인 교환 요청이 있습니다. 선생님의 확인을 기다려 주세요." });
  }

  // Set active exchange request
  student.activeExchange = {
    itemId: item.id,
    itemName: item.name,
    requestTime: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
  student.lastExchangeResult = null; // Clear old outcome

  res.json({ success: true, student });
});

// 4. Teacher approves reward exchange (Deducts 10 cookies)
app.post("/api/teacher/approve-exchange", (req, res) => {
  const { studentId } = req.body;

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
  }

  const exchange = student.activeExchange;
  if (!exchange) {
    return res.status(400).json({ error: "진행 중인 교환 요청이 없습니다." });
  }

  if (student.cookies < 10) {
    return res.status(400).json({ error: "학생의 쿠키가 10개 미만으로 부족하여 교환할 수 없습니다." });
  }

  // Deduct 10 cookies
  student.cookies -= 10;
  student.lastExchangeResult = {
    itemId: exchange.itemId,
    itemName: exchange.itemName,
    status: "approved",
    timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
  student.activeExchange = null; // Clear active request

  res.json({ success: true, student });
});

// 5. Teacher rejects/cancels exchange
app.post("/api/teacher/reject-exchange", (req, res) => {
  const { studentId } = req.body;

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
  }

  const exchange = student.activeExchange;
  if (!exchange) {
    return res.status(400).json({ error: "진행 중인 교환 요청이 없습니다." });
  }

  student.lastExchangeResult = {
    itemId: exchange.itemId,
    itemName: exchange.itemName,
    status: "rejected",
    timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  };
  student.activeExchange = null; // Reset request without cookie deduction

  res.json({ success: true, student });
});

// 6. Manual Adjustment (Teacher awards or removes cookie)
app.post("/api/teacher/adjust-cookie", (req, res) => {
  const { studentId, delta } = req.body; // delta is 1 or -1

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
  }

  student.cookies = Math.max(0, student.cookies + (delta || 0));

  res.json({ success: true, student });
});

// 7. Reset State (Restore defaults for testing)
app.post("/api/teacher/reset", (req, res) => {
  students = JSON.parse(JSON.stringify(initialStudentsBackup));
  res.json({ success: true, students });
});

// 8. Clear a student's last exchange result toast
app.post("/api/student/ack-result", (req, res) => {
  const { studentId } = req.body;
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.lastExchangeResult = null;
    res.json({ success: true, student });
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[다했니 쿠키 교환서] Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
