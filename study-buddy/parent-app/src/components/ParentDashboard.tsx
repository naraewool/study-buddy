import React, { useState, useEffect } from 'react';
import { User, StudyPlan, StudyRecord } from '../types';
import { studyPlanAPI, studyRecordAPI, reportAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, TrendingUp, CheckCircle, Clock, Plus, Eye } from 'lucide-react';
import CreateStudyPlanModal from './CreateStudyPlanModal';
import StudyRecordDetailModal from './StudyRecordDetailModal';

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [children] = useState<User[]>([
    // Mock data - 실제로는 API에서 가져올 데이터
    { id: '1', name: '김철수', email: 'student@example.com', role: 'student' }
  ]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, [children]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild]);

  const fetchChildData = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 오늘의 학습 계획
      const plansResponse = await studyPlanAPI.getStudyPlans({ 
        studentId: selectedChild.id,
        date: today 
      });
      setStudyPlans(plansResponse.data.studyPlans);

      // 최근 학습 기록
      const recordsResponse = await studyRecordAPI.getRecords({ 
        studentId: selectedChild.id 
      });
      setStudyRecords(recordsResponse.data.studyRecords.slice(0, 5));

      // 주간 통계
      const statsResponse = await reportAPI.getStatistics({ 
        studentId: selectedChild.id,
        period: 'week' 
      });
      setStatistics(statsResponse.data.statistics);

    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayStats = {
    total: studyPlans.length,
    completed: studyPlans.filter(p => p.status === 'completed').length,
    inProgress: studyPlans.filter(p => p.status === 'in_progress').length,
    pending: studyPlans.filter(p => p.status === 'pending').length,
  };

  const completionRate = todayStats.total > 0 
    ? Math.round((todayStats.completed / todayStats.total) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
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
              <p className="text-gray-600">자녀의 학습 현황을 확인해보세요</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value);
                  setSelectedChild(child || null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
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
        {/* 오늘의 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-emerald-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">오늘 계획</p>
                <p className="text-2xl font-semibold text-gray-900">{todayStats.total}개</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">완료</p>
                <p className="text-2xl font-semibold text-gray-900">{todayStats.completed}개</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">진행중</p>
                <p className="text-2xl font-semibold text-gray-900">{todayStats.inProgress}개</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">완료율</p>
                <p className="text-2xl font-semibold text-gray-900">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 오늘의 학습 계획 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">오늘의 학습 계획</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  계획 추가
                </button>
              </div>
            </div>
            <div className="p-6">
              {studyPlans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">오늘 계획된 학습이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {studyPlans.map((plan) => (
                    <div key={plan._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          <p className="text-sm text-gray-600">{plan.subject}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(plan.dueDate).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.status === 'completed' ? '완료' :
                           plan.status === 'in_progress' ? '진행중' : '대기중'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 최근 학습 기록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">최근 학습 기록</h2>
            </div>
            <div className="p-6">
              {studyRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">최근 학습 기록이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {studyRecords.map((record) => (
                    <div key={record._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {(record as any).planId?.title || '학습 기록'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            학습시간: {record.actualDuration}분
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="flex items-center px-2 py-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 주간 통계 */}
        {statistics && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">이번 주 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {Math.round(statistics.totalStudyTime / 60)}시간
                </p>
                <p className="text-sm text-gray-600">총 학습 시간</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {statistics.totalPlansCompleted}개
                </p>
                <p className="text-sm text-gray-600">완료한 계획</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {statistics.averageSatisfaction?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">평균 만족도</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 학습 계획 생성 모달 */}
      {showCreateModal && selectedChild && (
        <CreateStudyPlanModal
          studentId={selectedChild.id}
          onClose={() => setShowCreateModal(false)}
          onSubmit={() => {
            setShowCreateModal(false);
            fetchChildData();
          }}
        />
      )}

      {/* 학습 기록 상세 모달 */}
      {selectedRecord && (
        <StudyRecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default ParentDashboard;