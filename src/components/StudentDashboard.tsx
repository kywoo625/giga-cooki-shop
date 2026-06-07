import React, { useState, useEffect } from "react";
import { Student, ShopItem } from "../types";
import { 
  Cookie, 
  Key, 
  LogOut, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudentDashboardProps {
  students: Student[];
  shopItems: ShopItem[];
  fetchState: () => void;
}

export function StudentDashboard({ students, shopItems, fetchState }: StudentDashboardProps) {
  const [studentCode, setStudentCode] = useState<string>("");
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    return localStorage.getItem("current_student_id");
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active item they are looking to purchase
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<ShopItem | null>(null);

  // Sync current student state from the incoming students array
  const currentStudent = students.find((s) => s.id === currentStudentId) || null;

  // Track if we celebrated the last approval to prevent double fireworks
  const [celebrationResult, setCelebrationResult] = useState<string | null>(null);

  // If a student is logged in, poll for server state every 2 seconds to capture teacher approvals "real-time"
  useEffect(() => {
    if (!currentStudentId) return;

    const interval = setInterval(() => {
      fetchState();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentStudentId]);

  // Track real-time confirmation from the teacher
  useEffect(() => {
    if (currentStudent && currentStudent.lastExchangeResult) {
      if (currentStudent.lastExchangeResult.status === "approved") {
        setCelebrationResult(currentStudent.lastExchangeResult.itemName);
      }
    }
  }, [currentStudent?.lastExchangeResult]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: studentCode.trim() }),
      });

      if (res.ok) {
        const studentData: Student = await res.json();
        setCurrentStudentId(studentData.id);
        localStorage.setItem("current_student_id", studentData.id);
        setStudentCode("");
        fetchState();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "코드가 맞지 않습니다.");
      }
    } catch {
      setErrorMsg("네트워크 상태를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExchange = async (itemId: string) => {
    if (!currentStudent) return;
    setLoading(true);

    try {
      const res = await fetch("/api/student/request-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: currentStudent.id, itemId }),
      });

      if (res.ok) {
        setSelectedItemForPurchase(null);
        fetchState();
      } else {
        const err = await res.json();
        alert(err.error || "요청에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const clearCelebration = async () => {
    if (!currentStudent) return;
    try {
      await fetch("/api/student/ack-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: currentStudent.id }),
      });
      setCelebrationResult(null);
      fetchState();
    } catch {
      setCelebrationResult(null);
    }
  };

  const handleLogout = () => {
    setCurrentStudentId(null);
    localStorage.removeItem("current_student_id");
  };

  // Helper list of mock codes for quick entry
  const sampleCodes = [
    { classNo: 1, name: "김도윤", code: "1001", cookies: 12 },
    { classNo: 3, name: "임지우", code: "3002", cookies: 13 },
    { classNo: 5, name: "전민지", code: "5003", cookies: 14 },
    { classNo: 10, name: "주소율", code: "1013", cookies: 18 },
  ];

  if (!currentStudent) {
    return (
      <div className="max-w-md mx-auto" id="student-login-gate">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Cookie className="w-9 h-9 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">다했어요! 쿠키 상점</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              선생님께 부여받은 4자리 학생 비밀 코드를 <br />
              입력하여 상점 교환소에 입장해 주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 flex items-center gap-1.5 pl-1">
                <Key className="w-3.5 h-3.5 text-yellow-500" />
                다했어요 4자리 코드
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={4}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="코드 네 자리를 입력하세요"
                className="w-full text-center tracking-widest text-2xl font-black py-3.5 border-2 border-slate-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-2xl outline-none transition-all placeholder:text-slate-300 placeholder:text-sm placeholder:tracking-normal"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-500 text-center bg-red-50 py-2.5 rounded-xl border border-red-100">
                ⚠️ {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || studentCode.length < 4}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-stone-900 font-black py-4 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              상점 확인하러 가기
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Sandbox Help Section */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              테스트용 간편 로그인 코드 추천:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {sampleCodes.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setStudentCode(item.code);
                    setErrorMsg(null);
                  }}
                  className="bg-slate-50 hover:bg-yellow-50 border border-slate-150 rounded-xl p-2.5 text-left transition-all cursor-pointer group"
                >
                  <p className="font-extrabold text-slate-700 group-hover:text-yellow-800">
                    {item.classNo}반 {item.name}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 mt-1">
                    <span>쿠키: {item.cookies}개</span>
                    <span className="bg-white px-1.5 font-bold text-slate-600 rounded border">
                      {item.code}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-normal">
              ※ 선생님 화면에서 다른 학생을 추가하거나 쿠키를 수정하면 실시간 연동되어 테스트할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="student-dashboard-logged-in">
      {/* Celebration Award Overlay Modal (Teacher Approved) */}
      <AnimatePresence>
        {celebrationResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0, type: "spring", bounce: 0.4 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full border border-yellow-200 shadow-2xl text-center space-y-6"
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl animate-bounce">
                  🎉
                </div>
                <div className="absolute -right-2 top-0 text-xl animate-ping">✨</div>
                <div className="absolute -left-2 bottom-0 text-xl animate-pulse">🍭</div>
              </div>

              <div className="space-y-2">
                <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                  교환 승인 완료!
                </span>
                <h3 className="text-xl font-black text-slate-800">
                  쿠키 상점 리워드 지급 완료
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed leading-normal px-2">
                  선생님께서 <span className="font-extrabold text-teal-600">[{celebrationResult}]</span> 교환을 수락하셨습니다! <br />
                  학생 저금통에서 <strong>쿠키 10개</strong>가 정산 차감되었습니다.
                </p>
              </div>

              <button
                onClick={clearCelebration}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-black py-3.5 rounded-2xl transition-all shadow-md cursor-pointer text-xs"
              >
                신나서 확인 완료!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal (Before request) */}
      <AnimatePresence>
        {selectedItemForPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 text-amber-500 bg-amber-50 p-3.5 rounded-2xl border border-amber-100">
                <AlertTriangle className="w-6 h-6 shrink-0 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-amber-900">쿠키 10개 사용 동의</h4>
                  <p className="text-[10px] text-amber-700 font-semibold leading-normal">
                    교환을 한번 더 심사숙고해보고 최종 결정해 주세요.
                  </p>
                </div>
              </div>

              <div className="text-center py-2 space-y-2">
                <span className="text-5xl block">{selectedItemForPurchase.icon}</span>
                <h3 className="text-lg font-black text-slate-800">
                  [{selectedItemForPurchase.name}]
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  교환 신청 즉시 선생님 승인창으로 연동되며, 승인 완료 시 보유한 쿠키 중 <strong>10개</strong>가 소멸됩니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleRequestExchange(selectedItemForPurchase.id)}
                  disabled={loading}
                  className="flex-1 order-2 sm:order-1 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-black py-3.5 rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
                >
                  네, 교환하겠습니다
                </button>
                <button
                  onClick={() => setSelectedItemForPurchase(null)}
                  className="flex-1 order-1 sm:order-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 rounded-2xl transition-all text-xs cursor-pointer"
                >
                  좀 더 생각해볼게요 (돌아가기)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logged in Top Dashboard profile card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6" id="student-header-profile">
        {/* Left student meta */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-2xl font-black text-teal-600">
            {currentStudent.classNo}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              {currentStudent.classNo}반 다했어요
            </span>
            <h3 className="text-lg font-black text-slate-800">
              {currentStudent.name} <span className="font-normal text-slate-500 text-sm">소지 중</span>
            </h3>
          </div>
        </div>

        {/* Middle Cookie Jar */}
        <div className="flex bg-yellow-50/50 border border-yellow-100 rounded-3xl p-4 items-center gap-5 px-6 self-start md:self-center">
          <div className="relative">
            <Cookie className="w-11 h-11 text-amber-500 rotate-12 animate-bounce" />
            <span className="bg-amber-600 text-white font-extrabold rounded-full px-1.5 text-[9px] absolute -right-1 -top-1 ring-2 ring-yellow-50">
              🍪
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-700 block">내 저금통 쿠키</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-900">{currentStudent.cookies}</span>
              <span className="text-xs font-semibold text-amber-700">개 소유 중</span>
            </div>
          </div>
        </div>

        {/* Right Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold self-start md:self-center transition-all cursor-pointer border border-dashed border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50"
        >
          <LogOut className="w-4 h-4" />
          로그아웃하기
        </button>
      </div>

      {/* Progress Warning Box */}
      {currentStudent.cookies < 10 && !currentStudent.activeExchange && (
        <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-center gap-3 text-teal-800 text-xs font-bold leading-normal">
          <Cookie className="w-5 h-5 text-teal-500 animate-spin-slow animate-pulse" />
          <p>
            보상 쿠폰과 교환하려면 <span className="text-teal-900 font-black">쿠키 {10 - currentStudent.cookies}개</span>가 더 필요합니다. 선생님께 퀴즈 정답, 발표 잘하기 등으로 쿠키를 추가 획득해 리워드를 교환해 보세요!
          </p>
        </div>
      )}

      {/* Pending status banner */}
      {currentStudent.activeExchange && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-3 text-amber-800 leading-normal">
            <Clock className="w-5 h-5 text-amber-500 animate-spin-slow shrink-0" />
            <div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black block w-fit mb-1">선생님 결재 승인 대기 중</span>
              <p>
                선생님께 <span className="font-black text-amber-950">[{currentStudent.activeExchange.itemName}]</span> 상품 교환을 요청했습니다. 선생님이 승인하시는 즉시 쿠키 10개가 차감됩니다.
              </p>
            </div>
          </div>
          <div className="text-[10px] text-amber-500 shrink-0 font-mono">
            {currentStudent.activeExchange.requestTime}
          </div>
        </div>
      )}

      {/* Shop items container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm py-1">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-yellow-500" />
            다했어요 쿠키 리워드 교환소
          </h3>
          <span className="text-xs text-slate-400 font-medium">모든 상품 10 쿠키 균일가</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="shop-items-grid">
          {shopItems.map((item) => {
            const canAfford = currentStudent.cookies >= 10;
            const hasPending = currentStudent.activeExchange !== null;
            const isPurchaseItemPending = hasPending && currentStudent.activeExchange?.itemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between relative overflow-hidden transition-all ${
                  isPurchaseItemPending 
                    ? "ring-2 ring-amber-400 bg-amber-50/10" 
                    : ""
                }`}
                id={`shop-item-${item.id}`}
              >
                {/* Visual Accent for pending state on this item */}
                {isPurchaseItemPending && (
                  <span className="absolute right-3 top-3 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    승인 대기 중
                  </span>
                )}

                {/* Card Top Icon + description info */}
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold h-8 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Cost + Action bottom row */}
                <div className="border-t border-slate-50 pt-3.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
                    소모 쿠키: <span className="text-amber-600 font-black">🍪 {item.cost}개</span>
                  </span>

                  {isPurchaseItemPending ? (
                    <button
                      disabled
                      className="px-3.5 py-2 bg-amber-100 text-amber-700 text-xs font-black rounded-xl cursor-not-allowed"
                    >
                      승인 요청됨
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedItemForPurchase(item)}
                      disabled={!canAfford || hasPending}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer ${
                        canAfford && !hasPending
                          ? "bg-yellow-400 hover:bg-yellow-500 text-stone-900"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                      title={!canAfford ? "쿠키가 부족합니다." : hasPending ? "이미 결제가 접수되어 있습니다." : "교환 신청하기"}
                    >
                      교환하기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
