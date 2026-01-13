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
  IonSelectOption
} from '@ionic/react';
import { lockClosedOutline, banOutline, trashOutline, searchOutline } from 'ionicons/icons';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
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

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, filterRole]);

  const loadUsers = () => {
    setUsers([
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+27 82 123 4567',
        role: 'seller',
        status: 'active',
        joinedAt: '2024-01-15T10:30:00Z',
        lastLogin: '2024-01-20T14:20:00Z'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+27 83 987 6543',
        role: 'buyer',
        status: 'active',
        joinedAt: '2024-01-10T09:15:00Z',
        lastLogin: '2024-01-19T16:45:00Z'
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.w@email.com',
        phone: '+27 84 555 1234',
        role: 'seller',
        status: 'suspended',
        joinedAt: '2024-01-05T11:00:00Z',
        lastLogin: '2024-01-18T10:30:00Z'
      }
    ]);
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

  const resetPassword = (user: User) => {
    setAlertConfig({
      header: 'Reset Password',
      message: `Reset password for ${user.name}? A new temporary password will be sent to ${user.email}.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          handler: () => {
            setToastMessage(`Password reset email sent to ${user.email}`);
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
          handler: () => {
            setUsers(prev => prev.map(u => 
              u.id === user.id ? { ...u, status: 'suspended' as const } : u
            ));
            setToastMessage(`${user.name} has been suspended`);
            setShowToast(true);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const reactivateUser = (user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: 'active' as const } : u
    ));
    setToastMessage(`${user.name} has been reactivated`);
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
          handler: () => {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setToastMessage(`${user.name} has been deleted`);
            setShowToast(true);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const formatDate = (dateString: string) => {
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
      default: return 'medium';
    }
  };

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