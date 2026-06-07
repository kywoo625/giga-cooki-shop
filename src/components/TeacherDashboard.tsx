import React, { useState } from "react";
import { Student, ShopItem } from "../types";
import { 
  Cookie, 
  Check, 
  X, 
  Search, 
  Users, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Minus, 
  Bell, 
  Filter 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeacherDashboardProps {
  students: Student[];
  shopItems: ShopItem[];
  fetchState: () => void;
}

export function TeacherDashboard({ students, shopItems, fetchState }: TeacherDashboardProps) {
  const [selectedClass, setSelectedClass] = useState<number | "all">("all");
  const [searchName, setSearchName] = useState<string>("");
  const [onlyPending, setOnlyPending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const currentClassStudents = students.filter((student) => {
    const matchClass = selectedClass === "all" || student.classNo === selectedClass;
    const matchSearch = student.name.includes(searchName);
    const matchPending = !onlyPending || student.activeExchange !== null;
    return matchClass && matchSearch && matchPending;
  });

  // Calculate stats
  const totalCookies = students.reduce((sum, s) => sum + s.cookies, 0);
  const pendingCount = students.filter((s) => s.activeExchange !== null).length;
  const classesWithRequests = Array.from(
    new Set(students.filter((s) => s.activeExchange !== null).map((s) => s.classNo))
  );

  const handleApprove = async (studentId: string, name: string, itemName: string) => {
    try {
      const res = await fetch("/api/teacher/approve-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        showToast(`${name} 학생의 '${itemName}' 교환 승인이 완료되었습니다. 쿠키 10개가 차감되었습니다!`);
        fetchState();
      } else {
        const err = await res.json();
        showToast(err.error || "승인 처리에 실패했습니다.", "error");
      }
    } catch {
      showToast("서버 통신 오류가 발생했습니다.", "error");
    }
  };

  const handleReject = async (studentId: string, name: string) => {
    try {
      const res = await fetch("/api/teacher/reject-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        showToast(`${name} 학생의 교환 요청이 반려되었습니다.`, "error");
        fetchState();
      }
    } catch {
      showToast("서버 통신 오류가 발생했습니다.", "error");
    }
  };

  const handleAdjustCookie = async (studentId: string, delta: number) => {
    try {
      const res = await fetch("/api/teacher/adjust-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, delta }),
      });
      if (res.ok) {
        fetchState();
      }
    } catch {
      showToast("서버 통신 오류가 발생했습니다.", "error");
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("정말로 모든 학생의 쿠키 개수와 요청 내역을 초기화하시겠습니까?")) {
      return;
    }
    try {
      const res = await fetch("/api/teacher/reset", {
        method: "POST",
      });
      if (res.ok) {
        showToast("모든 학급 데이터가 성공적으로 초기 설정 상태로 복원되었습니다.");
        fetchState();
      }
    } catch {
      showToast("서버 통신 오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="space-y-6" id="teacher-dashboard-container">
      {/* Toast Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-md ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className={`p-2 rounded-full ${message.type === "success" ? "bg-green-100" : "bg-amber-100"}`}>
              {message.type === "success" ? (
                <Sparkles className="w-5 h-5 text-green-600" />
              ) : (
                <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
              )}
            </div>
            <p className="font-medium text-sm leading-relaxed">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="teacher-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="stat-total-cookies">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">누적 쿠키 발행량</span>
            <h3 className="text-3xl font-black text-slate-800 flex items-center gap-2">
              {totalCookies}
              <span className="text-sm font-normal text-slate-500">개</span>
            </h3>
          </div>
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <Cookie className="w-6 h-6 animate-spin-slow" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="stat-pending-requests">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">승인 대기 요청</span>
            <h3 className="text-3xl font-black text-amber-600 flex items-center gap-2 animate-pulse">
              {pendingCount}
              <span className="text-sm font-normal text-slate-500">건</span>
            </h3>
          </div>
          <div className={`p-3 rounded-full ${pendingCount > 0 ? "bg-amber-100 text-amber-600 animate-bounce" : "bg-slate-100 text-slate-400"}`}>
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between" id="stat-reset">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-sans">실습 데모 리셋</span>
            <p className="text-xs text-slate-500 py-1">원활한 반복 테스트를 위한 초기화</p>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
            id="reset-db-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 데이터 리셋
          </button>
        </div>
      </div>

      {/* Main Board Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden" id="teacher-control-board">
        {/* Board Tab Filter Header */}
        <div className="bg-slate-50/50 p-5 border-b border-slate-100 space-y-4" id="board-filters-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                다했니? 교사용 승인 대시보드
              </h2>
              <p className="text-xs text-slate-500 font-medium">1반부터 10반까지 반별 실시간 조회 및 상점 쿠키 정산</p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="학생 이름 검색..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-teal-500 w-44"
                />
                {searchName && (
                  <button onClick={() => setSearchName("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Pending-only Filter */}
              <button
                onClick={() => setOnlyPending(!onlyPending)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  onlyPending
                    ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                교환 요청자만 보기
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none ml-1 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Class Select Tabs (1반 ~ 10반 + 전체) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-thin" id="class-tabs-row">
            <button
              onClick={() => setSelectedClass("all")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              전체 보기
            </button>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const hasPendingRequest = classesWithRequests.includes(num);
              const isSelected = selectedClass === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedClass(num)}
                  className={`relative px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {num}반
                  {hasPendingRequest && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-ping absolute top-1.5 right-1.5" />
                  )}
                  {hasPendingRequest && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student Grid Area */}
        <div className="p-6 bg-slate-50/20">
          {currentClassStudents.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3" id="empty-state-card">
              <Cookie className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
              <p className="text-slate-500 font-bold text-sm">해당 조건의 학생을 찾을 수 없습니다.</p>
              <p className="text-slate-400 text-xs">필터링을 조정하거나 새로운 교환 요청이 올 때까지 기다려 주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="class-student-grid">
              {currentClassStudents.map((student) => {
                const isRequested = student.activeExchange !== null;
                return (
                  <motion.div
                    key={student.id}
                    layoutId={`student-${student.id}`}
                    className={`rounded-2xl border p-4 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden ${
                      isRequested
                        ? "bg-amber-100 border-amber-300 ring-4 ring-amber-400/20 ring-offset-1 animate-pulse-slow"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    id={`student-card-${student.id}`}
                  >
                    {/* Background decor for requested */}
                    {isRequested && (
                      <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                    )}

                    {/* Student Info Top Row */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {student.classNo}반 · 코드: {student.code}
                        </span>
                        <h4 className={`text-base font-black ${isRequested ? "text-amber-900" : "text-slate-800"}`}>
                          {student.name}
                        </h4>
                      </div>

                      {/* Cookie count label */}
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200/80 rounded-xl">
                        <Cookie className="w-4 h-4 text-amber-500 rotate-12" />
                        <span className="text-xs font-black text-amber-800">{student.cookies}개</span>
                      </div>
                    </div>

                    {/* Student state or action divider */}
                    <div className="border-t border-dashed border-slate-100 my-3.5" />

                    {/* Pending Request Details block */}
                    {isRequested ? (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <div className="p-2.5 bg-white/75 border border-amber-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold">
                            <span>교환 요청 상품</span>
                            <span>{student.activeExchange?.requestTime}</span>
                          </div>
                          <p className="font-extrabold text-amber-950 flex items-center gap-1">
                            <span className="text-base">{shopItems.find(i => i.id === student.activeExchange?.itemId)?.icon}</span>
                            {student.activeExchange?.itemName}
                          </p>
                        </div>

                        {/* Approve/Reject Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(student.id, student.name, student.activeExchange!.itemName)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                            title="상점 교환 수락 및 쿠키 10개 즉크 차감"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            교환 완료
                          </button>
                          <button
                            onClick={() => handleReject(student.id, student.name)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs py-2 px-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                            title="교환 요청 반려"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400 font-medium">대기 요청 없음</p>
                        {/* Quick Test: Add/Remove cookies */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-extrabold text-slate-500">테스트용 쿠키</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustCookie(student.id, -1)}
                              disabled={student.cookies === 0}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-slate-50/50 rounded-lg transition-all cursor-pointer"
                              title="쿠키 1개 수동 회수"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAdjustCookie(student.id, 1)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer"
                              title="쿠키 1개 수동 지급"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
