import React, { useState } from 'react';
import type { Staff, StaffGroup } from '../types';
import { GROUP_STYLES } from '../types';
import StaffModal from './StaffModal';

interface Props {
  staffList: Staff[];
  onAdd: (staff: Omit<Staff, 'id'>) => void;
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  fulltime: '正職員',
  parttime: 'パート',
};

const StaffManager: React.FC<Props> = ({ staffList, onAdd, onEdit, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Staff, 'id'> & { id?: string }) => {
    if (data.id) {
      onEdit(data as Staff);
    } else {
      onAdd({ name: data.name, role: data.role, employmentType: data.employmentType, group: data.group });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-pink-800">スタッフ管理</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> スタッフを追加
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center">
          <div className="text-4xl mb-3">👶</div>
          <p className="text-gray-500 text-sm">スタッフがまだ登録されていません</p>
          <p className="text-gray-400 text-xs mt-1">「スタッフを追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pink-50 text-pink-700">
                <th className="text-left px-4 py-3 font-medium">名前</th>
                <th className="text-left px-4 py-3 font-medium">グループ</th>
                <th className="text-left px-4 py-3 font-medium">役職</th>
                <th className="text-left px-4 py-3 font-medium">雇用形態</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, idx) => (
                <tr
                  key={staff.id}
                  className={`border-t border-pink-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'} hover:bg-pink-50/60 transition`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{staff.name}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const gs = GROUP_STYLES[staff.group as StaffGroup] ?? GROUP_STYLES['その他'];
                      return (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${gs.headerBg} ${gs.headerText}`}>
                          {staff.group}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{staff.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        staff.employmentType === 'fulltime'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {EMPLOYMENT_LABEL[staff.employmentType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        編集
                      </button>
                      {deleteConfirmId === staff.id ? (
                        <>
                          <button
                            onClick={() => {
                              onDelete(staff.id);
                              setDeleteConfirmId(null);
                            }}
                            className="text-xs bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition"
                          >
                            削除確認
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(staff.id)}
                          className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-pink-50/50 text-xs text-gray-400 border-t border-pink-50">
            合計 {staffList.length} 名
          </div>
        </div>
      )}

      {modalOpen && (
        <StaffModal
          staff={editingStaff}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StaffManager;
