import React from 'react';
import { StudyRecord } from '../types';
import { X, Clock, Star, Image as ImageIcon } from 'lucide-react';

interface StudyRecordDetailModalProps {
  record: StudyRecord;
  onClose: () => void;
}

const StudyRecordDetailModal: React.FC<StudyRecordDetailModalProps> = ({ 
  record, 
  onClose 
}) => {
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">학습 기록 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {(record as any).planId?.title || '학습 기록'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">과목: </span>
                <span className="text-gray-900">
                  {(record as any).planId?.subject || '정보 없음'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">학습 날짜: </span>
                <span className="text-gray-900">
                  {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* 학습 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {record.actualDuration || 0}분
              </p>
              <p className="text-sm text-blue-700">학습 시간</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getDifficultyColor(record.difficulty || '')
                }`}>
                  {getDifficultyText(record.difficulty || '')}
                </div>
              </div>
              <p className="text-sm text-purple-700">난이도</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (record.satisfaction || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-yellow-700">만족도</p>
            </div>
          </div>

          {/* 학습 요약 */}
          {record.summary && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">학습 내용 요약</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{record.summary}</p>
              </div>
            </div>
          )}

          {/* 학습 사진 */}
          {record.images && record.images.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                학습 사진 ({record.images.length}개)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {record.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`http://localhost:3000${image}`}
                      alt={`학습 사진 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 학습 시간 정보 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">학습 시간 정보</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">시작 시간: </span>
                  <span className="text-gray-900">
                    {new Date(record.startTime).toLocaleString('ko-KR')}
                  </span>
                </div>
                {record.endTime && (
                  <div>
                    <span className="text-gray-500">종료 시간: </span>
                    <span className="text-gray-900">
                      {new Date(record.endTime).toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyRecordDetailModal;