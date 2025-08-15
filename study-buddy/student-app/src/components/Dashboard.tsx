import React, { useState, useEffect } from 'react';
import { StudyPlan, Notification } from '../types';
import { studyPlanAPI, notificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import StudyPlanCard from './StudyPlanCard';
import StudyRecordModal from './StudyRecordModal';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchData();
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await studyPlanAPI.getStudyPlans({ date: today });
      setStudyPlans(response.data.studyPlans);
    } catch (error) {
      console.error('학습 계획 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications({ isRead: false });
      setNotifications(response.data.notifications.slice(0, 3)); // 최근 3개만
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  };

  const handleStatusUpdate = async (planId: string, status: string) => {
    try {
      await studyPlanAPI.updateStatus(planId, status);
      await fetchData();
      
      if (status === 'completed') {
        const plan = studyPlans.find(p => p._id === planId);
        if (plan) {
          setSelectedPlan(plan);
          setShowRecordModal(true);
        }
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };

  const filteredPlans = studyPlans.filter(plan => 
    filter === 'all' || plan.status === filter
  );

  const todayStats = {
    total: studyPlans.length,
    completed: studyPlans.filter(p => p.status === 'completed').length,
    inProgress: studyPlans.filter(p => p.status === 'in_progress').length,
    pending: studyPlans.filter(p => p.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {user?.name}님!</h1>
              <p className="text-gray-600">오늘도 열심히 공부해볼까요?</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            {/* 오늘의 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">전체</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayStats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">완료</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayStats.completed}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">진행중</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayStats.inProgress}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">대기중</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayStats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 필터 */}
            <div className="flex space-x-2 mb-6">
              {[
                { key: 'all', label: '전체' },
                { key: 'pending', label: '대기중' },
                { key: 'in_progress', label: '진행중' },
                { key: 'completed', label: '완료' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 학습 계획 목록 */}
            <div className="space-y-4">
              {filteredPlans.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-500">오늘 할 공부가 없어요! 😊</p>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <StudyPlanCard
                    key={plan._id}
                    plan={plan}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 최근 알림 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">최근 알림</h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">새로운 알림이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="border-l-4 border-indigo-400 pl-3">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 오늘의 격려 메시지 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
              <h3 className="text-lg font-medium mb-2">오늘의 한마디</h3>
              <p className="text-sm">
                "꾸준함이 재능을 이긴다! 오늘도 차근차근 해나가세요! 💪"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 기록 모달 */}
      {showRecordModal && selectedPlan && (
        <StudyRecordModal
          plan={selectedPlan}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedPlan(null);
          }}
          onSubmit={() => {
            setShowRecordModal(false);
            setSelectedPlan(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;