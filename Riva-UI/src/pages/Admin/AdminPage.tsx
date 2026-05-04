import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserStatus, updateUserRole } from '../../api/admin';
import type { UserDto } from '../../api/admin';

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, isActive: boolean) => {
    try {
      await updateUserStatus(id, isActive);
      setUsers(users.map(user =>
        user.id === id ? { ...user, isActive } : user
      ));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUserRole(id, role);
      setUsers(users.map(user =>
        user.id === id ? { ...user, role } : user
      ));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-page p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={user.isActive}
                      onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {/* Additional actions can be added here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;