import React from 'react';
import { StudyPlan } from '../types';
import { Clock, Calendar, Star, Play, CheckCircle } from 'lucide-react';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onStatusUpdate: (planId: string, status: string) => void;
}

const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ plan, onStatusUpdate }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in_progress': return '진행중';
      case 'pending': return '대기중';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleActionClick = () => {
    if (plan.status === 'pending') {
      onStatusUpdate(plan._id, 'in_progress');
    } else if (plan.status === 'in_progress') {
      onStatusUpdate(plan._id, 'completed');
    }
  };

  const getActionButton = () => {
    if (plan.status === 'completed') {
      return (
        <button
          disabled
          className="flex items-center px-4 py-2 bg-green-100 text-green-600 rounded-md cursor-not-allowed"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          완료됨
        </button>
      );
    }

    if (plan.status === 'in_progress') {
      return (
        <button
          onClick={handleActionClick}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          완료하기
        </button>
      );
    }

    return (
      <button
        onClick={handleActionClick}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Play className="h-4 w-4 mr-2" />
        시작하기
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(plan.priority)}`}>
              {plan.priority === 'high' ? '높음' : plan.priority === 'medium' ? '보통' : '낮음'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
              {getStatusText(plan.status)}
            </span>
          </div>
          {plan.description && (
            <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {plan.subject && (
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {plan.subject}
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatTime(plan.dueDate)}
          </div>
          {plan.estimatedDuration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {plan.estimatedDuration}분
            </div>
          )}
        </div>
        
        {getActionButton()}
      </div>
    </div>
  );
};

export default StudyPlanCard;