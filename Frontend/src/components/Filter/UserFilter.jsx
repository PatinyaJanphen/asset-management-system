import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BaseFilter from './BaseFilter';
import { AppContent } from '../../context/AppContext';

const UserFilter = ({ selectedUsers = [], onUserChange, className = "" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(AppContent);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/user/all-data`);
      
      if (response.data.success) {
        const formattedUsers = response.data.userData.map(user => ({
          id: user.id,
          name: `${user.firstname} ${user.lastname}`,
          code: user.email,
          description: user.role,
          email: user.email,
          phone: user.phone,
          role: user.role
        }));
        setUsers(formattedUsers);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserChange = (newSelectedUserIds) => {
    // แปลง ID เป็น user objects ที่สมบูรณ์
    const selectedUserObjects = newSelectedUserIds.map(id => 
      users.find(user => user.id === id)
    ).filter(user => user !== undefined);
    
    onUserChange(selectedUserObjects);
  };

  return (
    <BaseFilter
      title="กรองตามผู้ใช้"
      options={users}
      selectedValues={selectedUsers.map(user => user.id)}
      onSelectionChange={handleUserChange}
      multiple={true}
      placeholder={loading ? "กำลังโหลด..." : "เลือกผู้ใช้..."}
      className={className}
    />
  );
};

export default UserFilter;
