import React, { useState } from 'react';

interface Props {
  onReset: () => void;
}

const Settings: React.FC<Props> = ({ onReset }) => {
  const [confirm, setConfirm] = useState(false);

  const handleReset = () => {
    onReset();
    setConfirm(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-pink-800 mb-6">設定</h2>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">データ管理</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">データリセット</p>
              <p className="text-xs text-gray-400 mt-0.5">
                スタッフ情報・シフトデータをすべて削除し、初期状態に戻します。
              </p>
            </div>
            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="shrink-0 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition font-medium"
              >
                リセット
              </button>
            ) : (
              <div className="shrink-0 flex flex-col items-end gap-2">
                <p className="text-xs text-red-600 font-medium">本当にリセットしますか？</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(false)}
                    className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-xs bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition font-medium"
                  >
                    リセット実行
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
