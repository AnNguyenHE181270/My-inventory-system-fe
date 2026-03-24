import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/auth-context';

function ProfilePage() {
  const auth = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Lỗi lấy thông tin');
        setProfile(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (auth.token) fetchProfile();
  }, [auth.token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đổi mật khẩu thất bại');
      setPasswordMsg(data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordErr(err.message);
    }
  };

  if (loading) return <div className="p-6 text-white text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
          <i className="fa-solid fa-user-circle mr-2 text-red-500"></i>
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Họ & Tên</label>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] px-4 py-3 text-white font-medium">
              {profile.name}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] px-4 py-3 text-white font-medium">
              {profile.email}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vai trò</label>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] px-4 py-3 text-white font-medium capitalize">
              {profile.role}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Trạng thái</label>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] px-4 py-3 text-white font-medium capitalize">
              <span className={`px-2 py-1 rounded text-xs ${profile.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
          <i className="fa-solid fa-lock mr-2 text-red-500"></i>
          Đổi mật khẩu
        </h2>
        
        {passwordMsg && <div className="mb-4 rounded-xl bg-green-500/20 p-3 text-green-400 text-sm mt-4">{passwordMsg}</div>}
        {passwordErr && <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-red-400 text-sm mt-4">{passwordErr}</div>}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
              placeholder="Nhập mật khẩu hiện tại..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1f1f1f] px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
              placeholder="Tối thiểu 6 ký tự..."
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#E50914] px-6 py-3 font-semibold text-white transition hover:bg-red-700 shadow-lg shadow-red-900/20"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
