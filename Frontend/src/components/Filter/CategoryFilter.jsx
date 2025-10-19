import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BaseFilter from './BaseFilter';
import { AppContent } from '../../context/AppContext';

const CategoryFilter = ({ selectedCategories = [], onCategoryChange, className = "" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const {  } = useContext(AppContent);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`/api/category/all`);
      
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (newSelectedCategories) => {
    onCategoryChange(newSelectedCategories);
  };

  return (
    <BaseFilter
      title="กรองตามหมวดหมู่"
      options={categories}
      selectedValues={selectedCategories}
      onSelectionChange={handleCategoryChange}
      multiple={true}
      placeholder={loading ? "กำลังโหลด..." : "เลือกหมวดหมู่..."}
      className={className}
    />
  );
};

export default CategoryFilter;
