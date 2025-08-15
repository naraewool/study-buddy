import React, { useState } from 'react';
import { studyPlanAPI } from '../services/api';
import { X } from 'lucide-react';

interface CreateStudyPlanModalProps {
  studentId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateStudyPlanModal: React.FC<CreateStudyPlanModalProps> = ({ 
  studentId, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    dueTime: '',
    estimatedDuration: 30,
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      
      await studyPlanAPI.createStudyPlan({
        title: formData.title,
        description: formData.description,
        studentId,
        subject: formData.subject,
        dueDate: dueDateTime.toISOString(),
        estimatedDuration: formData.estimatedDuration,
        priority: formData.priority
      });
      
      onSubmit();
    } catch (error: any) {
      setError(error.response?.data?.error || '학습 계획 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">새 학습 계획</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="예: 수학 숙제하기"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="학습 내용에 대한 자세한 설명..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              과목
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">선택하세요</option>
              <option value="국어">국어</option>
              <option value="수학">수학</option>
              <option value="영어">영어</option>
              <option value="과학">과학</option>
              <option value="사회">사회</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 *
              </label>
              <input
                type="date"
                required
                min={today}
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시간 *
              </label>
              <input
                type="time"
                required
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예상 소요시간 (분)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyPlanModal;