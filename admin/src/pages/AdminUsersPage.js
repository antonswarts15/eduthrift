import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import UserDetailsModal from '../components/UserDetailsModal';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [changingRole, setChangingRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `/admin/users?role=${roleFilter}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await api.get(url);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole, currentRole) => {
    if (newRole === currentRole) return;

    const confirmMessage = newRole === 'buyer'
      ? 'Are you sure you want to change this user to Buyer only? If they have active listings, this will fail.'
      : `Change user role to ${newRole}?`;

    if (!window.confirm(confirmMessage)) return;

    setChangingRole(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { userType: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.error || 'Failed to update user role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;

    const loadingToast = toast.loading('Resetting password...');
    try {
      const response = await api.put(`/admin/users/${id}/reset-password`, {});
      toast.dismiss(loadingToast);

      const tempPassword = response.data.tempPassword;
      toast.success('Password reset successful!', { duration: 5000 });

      // Copy to clipboard if available
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(tempPassword);
        alert(`Password reset successful!\n\nTemporary Password: ${tempPassword}\n\n(Password has been copied to clipboard)`);
      } else {
        alert(`Password reset successful!\n\nTemporary Password: ${tempPassword}\n\nPlease copy this password and send it to the user.`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this user? They will no longer be able to log in.')) return;

    const loadingToast = toast.loading('Suspending user...');
    try {
      await api.put(`/admin/users/${id}/suspend`, {});
      toast.dismiss(loadingToast);
      toast.success('User suspended successfully');
      fetchUsers();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm('Are you sure you want to reactivate this user?')) return;

    const loadingToast = toast.loading('Reactivating user...');
    try {
      await api.put(`/admin/users/${id}/reactivate`, {});
      toast.dismiss(loadingToast);
      toast.success('User reactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>User Management</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Filter by Role:</label>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="seller">Sellers</option>
            <option value="buyer">Buyers</option>
          </select>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ width: 'auto', padding: '8px 16px' }}>Search</button>
        </form>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>User</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Role</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Status</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Joined</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold' }}>{user.first_name} {user.last_name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <select
                      value={user.user_type}
                      onChange={(e) => handleRoleChange(user.id, e.target.value, user.user_type)}
                      disabled={changingRole === user.id}
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        cursor: changingRole === user.id ? 'wait' : 'pointer',
                        textTransform: 'capitalize',
                        minWidth: '100px'
                      }}
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="both">Both</option>
                      <option value="admin">Admin</option>
                    </select>
                    {changingRole === user.id && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                        Updating...
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      backgroundColor: user.status === 'active' ? '#e8f5e9' : '#ffebee',
                      color: user.status === 'active' ? '#2e7d32' : '#c62828',
                      textTransform: 'capitalize'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{
                          width: 'auto',
                          backgroundColor: '#3498db',
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        title="View Complete Details"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => handleResetPassword(user.id)}
                        style={{
                          width: 'auto',
                          backgroundColor: '#f39c12',
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        title="Reset Password"
                      >
                        Reset Pwd
                      </button>

                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          style={{
                            width: 'auto',
                            backgroundColor: '#e74c3c',
                            padding: '6px 12px',
                            fontSize: '12px'
                          }}
                          title="Suspend User"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(user.id)}
                          style={{
                            width: 'auto',
                            backgroundColor: '#27ae60',
                            padding: '6px 12px',
                            fontSize: '12px'
                          }}
                          title="Reactivate User"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
