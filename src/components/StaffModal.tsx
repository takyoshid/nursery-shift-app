import React, { useState, useEffect } from 'react';
import type { Staff, EmploymentType } from '../types';

interface Props {
  staff: Staff | null;
  onSave: (staff: Omit<Staff, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

const ROLES = ['保育士', '主任保育士', '園長', '補助スタッフ', 'その他'];

const StaffModal: React.FC<Props> = ({ staff, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('保育士');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('fulltime');

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setRole(staff.role);
      setEmploymentType(staff.employmentType);
    } else {
      setName('');
      setRole('保育士');
      setEmploymentType('fulltime');
    }
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: staff?.id,
      name: name.trim(),
      role,
      employmentType,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-pink-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-pink-800">
            {staff ? 'スタッフ編集' : 'スタッフ追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-pink-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：山田 花子"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">雇用形態</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="employmentType"
                  value="fulltime"
                  checked={employmentType === 'fulltime'}
                  onChange={() => setEmploymentType('fulltime')}
                  className="accent-pink-500"
                />
                <span className="text-sm text-gray-700">正職員</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="employmentType"
                  value="parttime"
                  checked={employmentType === 'parttime'}
                  onChange={() => setEmploymentType('parttime')}
                  className="accent-pink-500"
                />
                <span className="text-sm text-gray-700">パート</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 transition font-medium"
            >
              {staff ? '更新する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
