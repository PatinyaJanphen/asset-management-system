import React, { useState } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const BaseFilter = ({
  title,
  options = [],
  selectedValues = [],
  onSelectionChange,
  multiple = true,
  placeholder = "เลือกตัวกรอง...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option) => {
    if (multiple) {
      const newSelection = selectedValues.includes(option.id)
        ? selectedValues.filter(id => id !== option.id)
        : [...selectedValues, option.id];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([option.id]);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedNames = () => {
    return selectedValues.map(id => {
      const option = options.find(opt => opt.id === id);
      return option ? option.name : '';
    }).filter(name => name !== '');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FiFilter size={16} />
          {title}
        </h3>
        {selectedValues.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <FiX size={12} />
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
        >
          <span className="text-sm text-gray-700">
            {selectedValues.length === 0
              ? placeholder
              : multiple
                ? `${selectedValues.length} รายการที่เลือก`
                : getSelectedNames()[0] || placeholder
            }
          </span>
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  ไม่พบข้อมูล
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      checked={selectedValues.includes(option.id)}
                      onChange={() => handleToggleOption(option)}
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{option.name}</div>
                      {option.code && (
                        <div className="text-xs text-gray-500">รหัส: {option.code}</div>
                      )}
                      {option.description && (
                        <div className="text-xs text-gray-400 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Items Display */}
      {selectedValues.length > 0 && multiple && (
        <div className="mt-2 flex flex-wrap gap-1">
          {getSelectedNames().map((name, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {name}
              <button
                onClick={() => {
                  const option = options.find(opt => opt.name === name);
                  if (option) {
                    const newSelection = selectedValues.filter(id => id !== option.id);
                    onSelectionChange(newSelection);
                  }
                }}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseFilter;
