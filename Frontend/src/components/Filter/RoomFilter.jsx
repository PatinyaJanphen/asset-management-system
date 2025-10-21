import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BaseFilter from './BaseFilter';
import { AppContent } from '../../context/AppContext';

const RoomFilter = ({ selectedRooms = [], onRoomChange, className = "" }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(AppContent);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/room/all`);
      
      if (response.data.success) {
        setRooms(response.data.data || []);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลห้องได้');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomChange = (newSelectedRooms) => {
    onRoomChange(newSelectedRooms);
  };

  return (
    <BaseFilter
      title="กรองตามห้อง"
      options={rooms}
      selectedValues={selectedRooms}
      onSelectionChange={handleRoomChange}
      multiple={true}
      placeholder={loading ? "กำลังโหลด..." : "เลือกห้อง..."}
      className={className}
    />
  );
};

export default RoomFilter;
