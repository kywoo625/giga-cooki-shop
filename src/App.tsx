import React, { useState, useEffect, useCallback } from "react";
import { Student, ShopItem } from "./types";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { 
  Cookie, 
  GraduationCap, 
  User, 
  Sparkles, 
  HelpCircle, 
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  Globe,
  Key,
  Home,
  CheckCircle,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [role, setRole] = useState<"select" | "teacher" | "student">("select");
  const [students, setStudents] = useState<Student[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Teacher Security & API States
  const [teacherPassword, setTeacherPassword] = useState<string>(() => {
    return localStorage.getItem("teacher_password") || "";
  });
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");
  
  // API Integration Configuration States
  const [apiEndpoint, setApiEndpoint] = useState<string>(() => {
    return localStorage.getItem("dahaenni_api_endpoint") || "https://api.dahaenni.net/v1";
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("dahaenni_api_key") || "dh_live_k82ja0smd93ka";
  });
  const [apiSetupComplete, setApiSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem("dahaenni_api_active") === "true";
  });

  const [portalError, setPortalError] = useState<string | null>(null);
  const [portalSuccess, setPortalSuccess] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setShopItems(data.shopItems);
        setLastSyncTime(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.error("Error syncing student cookie states:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll full state every 5 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      fetchState();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Handle setting new password and API configuration
  const handleTeacherSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError(null);
    setPortalSuccess(null);

    if (!newPasswordInput) {
      setPortalError("교사 비밀번호를 입력해 주세요.");
      return;
    }

    if (newPasswordInput !== newPasswordConfirm) {
      setPortalError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (newPasswordInput.length < 4) {
      setPortalError("비밀번호는 최소 4자리 이상이어야 합니다.");
      return;
    }

    // Save and auth immediately
    localStorage.setItem("teacher_password", newPasswordInput);
    localStorage.setItem("dahaenni_api_endpoint", apiEndpoint);
    localStorage.setItem("dahaenni_api_key", apiKey);
    localStorage.setItem("dahaenni_api_active", "true");

    setTeacherPassword(newPasswordInput);
    setApiSetupComplete(true);
    setIsTeacherAuthenticated(true);
    setPortalSuccess("교사용 비밀번호와 다했니 Open API 연동 설정이 완벽히 저장되었습니다!");
    
    // Clear inputs
    setNewPasswordInput("");
    setNewPasswordConfirm("");
  };

  // Handle teacher unlocking
  const handleTeacherUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError(null);

    if (passwordInput === teacherPassword) {
      setIsTeacherAuthenticated(true);
      setPasswordInput("");
      setPortalSuccess("교사용 대시보드가 인증되었습니다.");
      setTimeout(() => setPortalSuccess(null), 3000);
    } else {
      setPortalError("비밀번호가 일치하지 않습니다. 다시 입력해 주세요.");
    }
  };

  // Update existing API configurations in live panel
  const handleSaveAPIConfig = () => {
    localStorage.setItem("dahaenni_api_endpoint", apiEndpoint);
    localStorage.setItem("dahaenni_api_key", apiKey);
    setPortalSuccess("다했니 API 연동 정보가 성공적으로 업데이트되었습니다.");
    setTimeout(() => setPortalSuccess(null), 3000);
  };

  // Switch role and automatically check auth requirements
  const selectRole = (targetRole: "teacher" | "student") => {
    setPortalError(null);
    setPortalSuccess(null);
    if (targetRole === "teacher") {
      setRole("teacher");
    } else {
      setRole("student");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800 antialiased" id="app-root-container">
      {/* Top decorative gradient bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-teal-500 to-orange-400 z-50" />

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm" id="main-navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setRole("select")} 
            className="flex items-center gap-3 select-none cursor-pointer group"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md shadow-yellow-105 group-hover:scale-105 transition-transform">
              <Cookie className="w-5 h-5 text-stone-900 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 leading-none">
                다했니? 쿠키교환소
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 text-yellow-500" />
              </h1>
              <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 font-mono">
                DAHAENNI OPEN API INTEGRATION PORTAL
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            {role !== "select" && (
              <button
                onClick={() => setRole("select")}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                메인 홈으로
              </button>
            )}

            {/* Role quick selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200" id="role-selector-control">
              <button
                onClick={() => selectRole("teacher")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  role === "teacher"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                선생님 (다했니)
              </button>
              <button
                onClick={() => selectRole("student")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                학생 (다했어요)
              </button>
            </div>
          </div>

          {/* Real-time Status Sync */}
          <div className="hidden md:flex items-center gap-2 text-right">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[10px] text-slate-400 font-bold">
              <p className="text-slate-500 leading-none">Open API 실시간 수신 중</p>
              <p className="font-mono text-[9px] flex items-center gap-1 mt-1 justify-end">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-300" />
                동기화: {lastSyncTime || "전송 대기"}
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content-layout">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4" id="global-loading">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-105 border-t-teal-500 rounded-full animate-spin" />
              <Cookie className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 font-bold">다했니 API 연결 상태를 초기 확인하는 중입니다...</p>
          </div>
        ) : (
          <div id="content-container-switch">
            
            {/* 1. SELECTION MAIN GATEWAY */}
            {role === "select" && (
              <div className="space-y-10 py-4 max-w-4xl mx-auto" id="portal-landing">
                
                {/* Hero Greeting Panel */}
                <div className="bg-gradient-to-br from-yellow-400/10 via-amber-550/5 to-slate-200/5 rounded-[2.5rem] border border-yellow-200/50 p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
                  <div className="absolute left-6 bottom-4 w-28 h-28 bg-teal-400/5 rounded-full blur-2xl" />

                  <div className="space-y-4 max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-black rounded-full shadow-sm">
                      <Sparkles className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500 animate-pulse text-yellow-500" />
                      다했니 Open API 공식 연동 에디션
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                      다했니? 쿠키 10개 모으면 <br />
                      <span className="text-amber-600 font-black underline decoration-yellow-400/80 underline-offset-4">학급 보상 상점</span>으로 실시간 교환!
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      학생들이 칭찬과 성실함으로 모은 쿠키 10개를 상점의 기발하고 보람찬 보상 상품과 안전하게 실시간 교환해 주는 시스템입니다. 역할을 선택해 참여해 보세요.
                    </p>
                  </div>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="portal-role-cards">
                  
                  {/* Student Card Block */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => selectRole("student")}
                    className="bg-white rounded-3xl border-2 border-slate-100 hover:border-amber-400 text-left p-8 shadow-md hover:shadow-xl cursor-pointer relative overflow-hidden group flex flex-col justify-between h-[17.5rem]"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100/80 transition-colors flex items-center justify-center text-amber-600 border border-amber-100">
                        <User className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                          학생용 쿠키 교환소
                          <span className="text-xs bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full font-bold">다했어요 코드</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-normal font-bold">
                          본인의 4자리 고유 코드로 접속하여 보유 쿠키를 확인하고, 자유이행이나 상점 쿠폰 교환 신청을 진행합니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-amber-600 border-t border-slate-50 pt-4">
                      <span>내 칭찬 쿠키 교환 신청하러 가기</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </motion.div>

                  {/* Teacher Card Block */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => selectRole("teacher")}
                    className="bg-white rounded-3xl border-2 border-slate-100 hover:border-teal-500 text-left p-8 shadow-md hover:shadow-xl cursor-pointer relative overflow-hidden group flex flex-col justify-between h-[17.5rem]"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100/80 transition-colors flex items-center justify-center text-teal-600 border border-teal-100">
                        <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                          교사용 쿠키 상점 보드
                          <span className="text-xs bg-teal-100 text-teal-800 py-0.5 px-2 rounded-full font-bold">잠금 장치</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-normal font-bold">
                          1반~10반까지 학생들의 쿠키 상황을 실시간 모니터링하며, 신청 요청 수집 알림을 확인하고 10쿠키 단위로 맞춤 결제/차감 승인해 줍니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-teal-600 border-t border-slate-50 pt-4">
                      <span>교사 비밀번호 및 API 관리 대시보드</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </motion.div>

                </div>

                {/* Info Tip block */}
                <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-205 flex items-center gap-3 text-slate-500 text-xs font-bold leading-normal">
                  <span className="text-xl animate-pulse">💡</span>
                  <p>
                    <strong>비밀번호 보안:</strong> 학생의 무단 대시보드 조작과 API 설정 변조를 방지하기 위해, 최초 선생님 화면 선택 시 비밀번호 설정을 요구하는 "교사 전용 안전 통제 잠금 게이트"가 안전하고 유연하게 설계되어 가동됩니다.
                  </p>
                </div>

              </div>
            )}

            {/* 2. ROLE == STUDENT */}
            {role === "student" && (
              <StudentDashboard 
                students={students} 
                shopItems={shopItems} 
                fetchState={fetchState} 
              />
            )}

            {/* 3. ROLE == TEACHER BOARD (With Passcode Verification + API Integration Panels) */}
            {role === "teacher" && (
              <div className="space-y-6" id="teacher-section">
                
                {/* Check if teacher needs to set up a password first */}
                {!teacherPassword ? (
                  <div className="max-w-xl mx-auto" id="teacher-password-setup-view">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <Settings className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">최초 교사용 비밀번호 & API 설정</h3>
                        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-normal">
                          선생님 대시보드를 타인으로부터 안전하게 지키기 위해 첫 비밀번호와 다했니 Open API 키를 설정해 주세요.
                        </p>
                      </div>

                      <form onSubmit={handleTeacherSetup} className="space-y-4">
                        {portalError && (
                          <div className="p-3 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl text-center">
                            ⚠️ {portalError}
                          </div>
                        )}

                        <div className="space-y-4 border-b border-dashed border-slate-100 pb-5">
                          {/* Code inputs */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-600 block pl-1">
                              🔐 교사용 비밀번호 입력
                            </label>
                            <input
                              type="password"
                              placeholder="원하는 비밀번호를 입력해 주세요 (4자리 이상)"
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              className="w-full text-center font-bold px-4 py-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm placeholder:text-slate-300"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-600 block pl-1">
                              🔐 비밀번호 다시 입력 (확인)
                            </label>
                            <input
                              type="password"
                              placeholder="확인을 위해 한번 더 입력해 주세요"
                              value={newPasswordConfirm}
                              onChange={(e) => setNewPasswordConfirm(e.target.value)}
                              className="w-full text-center font-bold px-4 py-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm placeholder:text-slate-300"
                            />
                          </div>
                        </div>

                        {/* API Config Blocks */}
                        <div className="space-y-4 pt-1">
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-600 flex items-center gap-1.5 pl-1">
                              <Globe className="w-3.5 h-3.5 text-teal-600" />
                              다했니 Open API Endpoint 주소
                            </label>
                            <input
                              type="url"
                              value={apiEndpoint}
                              onChange={(e) => setApiEndpoint(e.target.value)}
                              placeholder="https://api.dahaenni.net/v1"
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-xs text-slate-600 font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-600 flex items-center gap-1.5 pl-1">
                              <Key className="w-3.5 h-3.5 text-teal-600" />
                              다했니 클라이언트 연동 API 비밀키 (API Key)
                            </label>
                            <input
                              type="text"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="dh_live_... 형식을 입력하세요"
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-xs text-slate-600 font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase"
                        >
                          설정 승인 및 잠금 활성화
                        </button>
                      </form>
                    </div>
                  </div>
                ) : !isTeacherAuthenticated ? (
                  /* If a password exists, but they haven't authenticated yet */
                  <div className="max-w-md mx-auto" id="teacher-password-unlock-view">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm ring-4 ring-amber-50">
                          <Lock className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">교사 안전 잠금 보호</h3>
                        <p className="text-xs text-slate-500 font-medium leading-normal leading-relaxed px-4">
                          본 화면은 학생의 비인가 사용을 제어합니다. <br />
                          대시보드를 진입하려면 설정한 비밀번호를 제공해 주세요.
                        </p>
                      </div>

                      <form onSubmit={handleTeacherUnlock} className="space-y-4">
                        {portalError && (
                          <div className="p-3 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl text-center">
                            ⚠️ {portalError}
                          </div>
                        )}

                        <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
                          <input
                            type="password"
                            placeholder="보안 비밀번호 입력"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onFocus={() => setPortalError(null)}
                            className="w-full text-center font-black tracking-widest text-2xl py-3 border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-2xl outline-none"
                            autoFocus
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!passwordInput}
                          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          보안 대시보드 잠금 해제
                        </button>
                      </form>

                      {/* Info on resetting */}
                      <button
                        onClick={() => {
                          if (window.confirm("비밀번호 및 API 연동 내역을 전격 포맷하고 초기 설정을 다시 진행하겠습니까?")) {
                            localStorage.removeItem("teacher_password");
                            localStorage.removeItem("dahaenni_api_endpoint");
                            localStorage.removeItem("dahaenni_api_key");
                            localStorage.removeItem("dahaenni_api_active");
                            setTeacherPassword("");
                            setIsTeacherAuthenticated(false);
                            setPortalError(null);
                          }
                        }}
                        className="w-full text-center text-slate-400 hover:text-red-500 font-bold transition-all text-[11px] block text-center"
                      >
                        ⚡ 교사용 비밀번호가 기억나지 않나요? (초기화)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Authenticated Dashboard Screen */
                  <div className="space-y-5" id="teacher-dashboard-view">
                    
                    {/* Collapsible API configuration manager top banner */}
                    <div className="bg-slate-800 text-slate-200 rounded-3xl p-5 border border-slate-700 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-slate-700 text-teal-400 rounded-2xl">
                          <ShieldCheck className="w-6 h-6 shrink-0" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-teal-500/10 text-teal-400 py-0.5 px-2 rounded font-extrabold border border-teal-500/20">
                              🔒 교사 보안 인증 활성화됨
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 py-0.5 px-1.5 rounded font-black font-mono">
                              ONLINE
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1">
                            다했니 Open API 연동 관리 설정
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold truncate max-w-md">
                            연동 끝점: {apiEndpoint} | 키: {apiKey.substring(0, 8)}********
                          </p>
                        </div>
                      </div>

                      {/* Tiny settings inputs widget directly editable on dashboard */}
                      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700">
                        <input
                          type="text"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          title="Endpoint 주소 수정"
                          placeholder="API Endpoint 주소"
                          className="bg-slate-800 border border-slate-700 text-[10px] text-slate-350 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-slate-500 w-36"
                        />
                        <input
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          title="Secret Key 수"
                          placeholder="API Key"
                          className="bg-slate-800 border border-slate-700 text-[10px] text-slate-350 font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-slate-500 w-28"
                        />
                        <button
                          onClick={handleSaveAPIConfig}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          연동 수정 저장
                        </button>
                        <button
                          onClick={() => {
                            setIsTeacherAuthenticated(false);
                            setPortalSuccess("대시보드를 다시 잠궜습니다.");
                            setTimeout(() => setPortalSuccess(null), 3000);
                          }}
                          className="bg-slate-700 hover:bg-slate-650 text-slate-250 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          title="대시보드 화면 잠그기"
                        >
                          화면 잠금
                        </button>
                      </div>
                    </div>

                    {/* True Student Table */}
                    <TeacherDashboard 
                      students={students} 
                      shopItems={shopItems} 
                      fetchState={fetchState} 
                    />

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer Instructions block */}
      <footer className="border-t border-slate-200 mt-12 bg-white" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
            <p className="text-[11px] leading-relaxed font-semibold">
              <strong className="text-slate-600">💡 스마트 시뮬레이션 팁:</strong> 브라우저 탭을 하나 더 열어 하나는 <strong className="text-teal-600">선생님(다했니)</strong>, 하나는 <strong className="text-amber-600">학생(다했어요)</strong>으로 접속하면, 실시간 요청-승인-차감 동작을 완벽히 모니터링할 수 있습니다!
            </p>
          </div>
          <p className="font-medium text-[11px] shrink-0 font-mono">
            © 2026 다했니 쿠키 상점 시스템. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
