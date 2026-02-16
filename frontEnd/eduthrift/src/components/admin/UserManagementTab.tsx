import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonItem,
  IonLabel,
  IonToast,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/react';
import { lockClosedOutline, banOutline, trashOutline, swapHorizontalOutline } from 'ionicons/icons';
import { adminApi } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  joinedAt: string;
  lastLogin: string;
}

const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showRoleAlert, setShowRoleAlert] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      const data = response.data;
      setUsers((Array.isArray(data) ? data : data.users || []).map((u: any) => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        email: u.email,
        phone: u.phone || '',
        role: (u.user_type || u.role || 'buyer').toLowerCase() as User['role'],
        status: (u.status || 'active').toLowerCase() as User['status'],
        joinedAt: u.created_at || '',
        lastLogin: u.last_login || ''
      })));
    } catch (err: any) {
      console.error('Error loading users:', err);
      setToastMessage(err.response?.data?.message || 'Failed to load users');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchText) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleChangeRole = (user: User) => {
    setRoleChangeUser(user);
    setShowRoleAlert(true);
  };

  const confirmRoleChange = async (newRole: string) => {
    if (!roleChangeUser || !newRole) return;
    try {
      await adminApi.updateUserRole(roleChangeUser.id, newRole);
      setUsers(prev => prev.map(u =>
        u.id === roleChangeUser.id ? { ...u, role: newRole as User['role'] } : u
      ));
      setToastMessage(`${roleChangeUser.name}'s role changed to ${newRole}`);
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to change role');
      setShowToast(true);
    }
    setRoleChangeUser(null);
  };

  const resetPassword = (user: User) => {
    setAlertConfig({
      header: 'Reset Password',
      message: `Reset password for ${user.name}? A new temporary password will be sent to ${user.email}.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          handler: async () => {
            try {
              await adminApi.resetPassword(user.id);
              setToastMessage(`Password reset email sent to ${user.email}`);
            } catch (err: any) {
              setToastMessage(err.response?.data?.message || 'Failed to reset password');
            }
            setShowToast(true);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const suspendUser = (user: User) => {
    setAlertConfig({
      header: 'Suspend User',
      message: `Suspend ${user.name}? They will not be able to access the app until reactivated.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Suspend',
          handler: async () => {
            try {
              await adminApi.suspendUser(user.id);
              setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, status: 'suspended' as const } : u
              ));
              setToastMessage(`${user.name} has been suspended`);
            } catch (err: any) {
              setToastMessage(err.response?.data?.message || 'Failed to suspend user');
            }
            setShowToast(true);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const reactivateUser = async (user: User) => {
    try {
      await adminApi.reactivateUser(user.id);
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, status: 'active' as const } : u
      ));
      setToastMessage(`${user.name} has been reactivated`);
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to reactivate user');
    }
    setShowToast(true);
  };

  const deleteUser = (user: User) => {
    setAlertConfig({
      header: 'Delete User',
      message: `Permanently delete ${user.name}? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await adminApi.deleteUser(user.id);
              setUsers(prev => prev.filter(u => u.id !== user.id));
              setToastMessage(`${user.name} has been deleted`);
            } catch (err: any) {
              setToastMessage(err.response?.data?.message || 'Failed to delete user');
            }
            setShowToast(true);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'deleted': return 'danger';
      default: return 'medium';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'seller': return 'secondary';
      case 'buyer': return 'tertiary';
      case 'both': return 'success';
      default: return 'medium';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <IonSpinner />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <h3>User Management ({filteredUsers.length} users)</h3>

      <div style={{ marginBottom: '16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={e => setSearchText(e.detail.value!)}
          placeholder="Search users by name or email"
        />

        <IonItem>
          <IonLabel>Filter by Role:</IonLabel>
          <IonSelect value={filterRole} onIonChange={e => setFilterRole(e.detail.value)}>
            <IonSelectOption value="all">All Roles</IonSelectOption>
            <IonSelectOption value="buyer">Buyers</IonSelectOption>
            <IonSelectOption value="seller">Sellers</IonSelectOption>
            <IonSelectOption value="both">Both</IonSelectOption>
            <IonSelectOption value="admin">Admins</IonSelectOption>
          </IonSelect>
        </IonItem>
      </div>

      {filteredUsers.map(user => (
        <IonCard key={user.id}>
          <IonCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle>{user.name}</IonCardTitle>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IonBadge color={getRoleColor(user.role)}>
                  {user.role.toUpperCase()}
                </IonBadge>
                <IonBadge color={getStatusColor(user.status)}>
                  {user.status.toUpperCase()}
                </IonBadge>
              </div>
            </div>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Joined:</strong> {formatDate(user.joinedAt)}</p>
                <p><strong>Last Login:</strong> {formatDate(user.lastLogin)}</p>
              </IonLabel>
            </IonItem>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <IonButton
                size="small"
                fill="outline"
                color="primary"
                onClick={() => handleChangeRole(user)}
              >
                <IonIcon icon={swapHorizontalOutline} slot="start" />
                Change Role
              </IonButton>

              <IonButton
                size="small"
                fill="outline"
                onClick={() => resetPassword(user)}
              >
                <IonIcon icon={lockClosedOutline} slot="start" />
                Reset Password
              </IonButton>

              {user.status === 'active' ? (
                <IonButton
                  size="small"
                  color="warning"
                  fill="outline"
                  onClick={() => suspendUser(user)}
                >
                  <IonIcon icon={banOutline} slot="start" />
                  Suspend
                </IonButton>
              ) : user.status === 'suspended' ? (
                <IonButton
                  size="small"
                  color="success"
                  fill="outline"
                  onClick={() => reactivateUser(user)}
                >
                  Reactivate
                </IonButton>
              ) : null}

              <IonButton
                size="small"
                color="danger"
                fill="outline"
                onClick={() => deleteUser(user)}
              >
                <IonIcon icon={trashOutline} slot="start" />
                Delete
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      ))}

      {filteredUsers.length === 0 && (
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
            <p>No users found</p>
          </IonCardContent>
        </IonCard>
      )}

      <IonAlert
        isOpen={showRoleAlert}
        onDidDismiss={() => setShowRoleAlert(false)}
        header="Change Role"
        message={`Select a new role for ${roleChangeUser?.name}`}
        inputs={[
          { label: 'Buyer', type: 'radio', value: 'buyer', checked: roleChangeUser?.role === 'buyer' },
          { label: 'Seller', type: 'radio', value: 'seller', checked: roleChangeUser?.role === 'seller' },
          { label: 'Both', type: 'radio', value: 'both', checked: roleChangeUser?.role === 'both' },
          { label: 'Admin', type: 'radio', value: 'admin', checked: roleChangeUser?.role === 'admin' },
        ]}
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Update', handler: (value: string) => confirmRoleChange(value) }
        ]}
      />

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={alertConfig.header}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default UserManagementTab;
