import React, { useState } from 'react';
import { StudyPlan } from '../types';
import { studyRecordAPI } from '../services/api';
import { X, Upload, Star } from 'lucide-react';

interface StudyRecordModalProps {
  plan: StudyPlan;
  onClose: () => void;
  onSubmit: () => void;
}

const StudyRecordModal: React.FC<StudyRecordModalProps> = ({ plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    summary: '',
    difficulty: '',
    satisfaction: 0,
    actualDuration: plan.estimatedDuration || 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // 최대 5개
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const recordFormData = new FormData();
      recordFormData.append('planId', plan._id);
      recordFormData.append('startTime', new Date().toISOString());
      recordFormData.append('endTime', new Date().toISOString());
      recordFormData.append('actualDuration', formData.actualDuration.toString());
      recordFormData.append('summary', formData.summary);
      recordFormData.append('difficulty', formData.difficulty);
      recordFormData.append('satisfaction', formData.satisfaction.toString());

      images.forEach((image) => {
        recordFormData.append('images', image);
      });

      await studyRecordAPI.createRecord(recordFormData);
      onSubmit();
    } catch (error: any) {
      setError(error.response?.data?.error || '학습 기록 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">학습 기록 작성</h2>
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">{plan.title}</h3>
            <p className="text-sm text-gray-600">{plan.subject}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              실제 학습 시간 (분)
            </label>
            <input
              type="number"
              min="1"
              value={formData.actualDuration}
              onChange={(e) => setFormData({ ...formData, actualDuration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              학습 내용 요약
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="오늘 무엇을 공부했나요? 어떤 내용이 어려웠나요?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              난이도
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">선택하세요</option>
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              만족도 (1-5점)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData({ ...formData, satisfaction: score })}
                  className={`p-1 ${
                    formData.satisfaction >= score ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              학습 사진 (선택사항, 최대 5개)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>사진 업로드</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`업로드 이미지 ${index + 1}`}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyRecordModal;