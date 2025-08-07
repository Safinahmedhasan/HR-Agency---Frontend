// components/Admin/WhyChooseUsFormModal/WhyChooseUsFormModal.jsx
import React, { useState, useEffect } from "react";
import { X, Save, Plus, Star } from "lucide-react";

// Available icons for WhyChooseUs
const AVAILABLE_ICONS = [
  "Shield", "Lightbulb", "Award", "TrendingUp", "Globe", "Clock",
  "Users", "Heart", "Target", "Zap", "Star", "CheckCircle",
  "Database", "Settings", "BarChart3", "Crown", "Rocket", "Trophy"
];

// Available colors
const AVAILABLE_COLORS = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Cyan", value: "cyan" },
  { name: "Red", value: "red" },
  { name: "Pink", value: "pink" },
  { name: "Indigo", value: "indigo" },
  { name: "Yellow", value: "yellow" },
  { name: "Emerald", value: "emerald" },
];

const WhyChooseUsFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "Star",
    highlight: "",
    stats: "",
    color: "blue",
    isHighlighted: false,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        icon: initialData.icon || "Star",
        highlight: initialData.highlight || "",
        stats: initialData.stats || "",
        color: initialData.color || "blue",
        isHighlighted: initialData.isHighlighted || false,
        sortOrder: initialData.sortOrder || 0,
      });
    } else if (!isEditing) {
      // Reset form for new reason
      setFormData({
        title: "",
        description: "",
        icon: "Star",
        highlight: "",
        stats: "",
        color: "blue",
        isHighlighted: false,
        sortOrder: 0,
      });
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (!formData.highlight.trim()) {
      newErrors.highlight = "Highlight text is required";
    } else if (formData.highlight.length < 2) {
      newErrors.highlight = "Highlight text must be at least 2 characters";
    } else if (formData.highlight.length > 50) {
      newErrors.highlight = "Highlight text cannot exceed 50 characters";
    }

    if (!formData.stats.trim()) {
      newErrors.stats = "Stats text is required";
    } else if (formData.stats.length < 2) {
      newErrors.stats = "Stats text must be at least 2 characters";
    } else if (formData.stats.length > 100) {
      newErrors.stats = "Stats text cannot exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      highlight: formData.highlight.trim(),
      stats: formData.stats.trim(),
    };

    onSubmit(submitData);
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              {isEditing ? (
                <>
                  <Star className="h-5 w-5 text-orange-600 mr-2" />
                  Edit Why Choose Us Reason
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-blue-600 mr-2" />
                  Create New Reason
                </>
              )}
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., Dedicated Partnership"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon *
              </label>
              <select
                value={formData.icon}
                onChange={(e) => handleInputChange("icon", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Describe why customers should choose you..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Highlight & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Highlight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Text *
              </label>
              <input
                type="text"
                value={formData.highlight}
                onChange={(e) => handleInputChange("highlight", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.highlight ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., 24/7 Support"
                maxLength={50}
                disabled={isLoading}
              />
              {errors.highlight && (
                <p className="mt-1 text-sm text-red-600">{errors.highlight}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.highlight.length}/50 characters
              </p>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stats Text *
              </label>
              <input
                type="text"
                value={formData.stats}
                onChange={(e) => handleInputChange("stats", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.stats ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., 500+ Happy Clients"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.stats && (
                <p className="mt-1 text-sm text-red-600">{errors.stats}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.stats.length}/100 characters
              </p>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-5 gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  disabled={isLoading}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.color === color.value
                      ? "border-blue-500 ring-2 ring-blue-500/20 scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  <div className="w-full h-6 rounded-lg mb-2" style={{
                    backgroundColor: 
                      color.value === 'blue' ? '#3b82f6' :
                      color.value === 'green' ? '#10b981' :
                      color.value === 'purple' ? '#8b5cf6' :
                      color.value === 'orange' ? '#f97316' :
                      color.value === 'cyan' ? '#06b6d4' :
                      color.value === 'red' ? '#ef4444' :
                      color.value === 'pink' ? '#ec4899' :
                      color.value === 'indigo' ? '#6366f1' :
                      color.value === 'yellow' ? '#eab308' :
                      color.value === 'emerald' ? '#059669' : '#3b82f6'
                  }}></div>
                  <div className="text-xs text-gray-600 text-center font-medium">
                    {color.name}
                  </div>
                  {formData.color === color.value && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange("sortOrder", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
                min="0"
                max="1000"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* Highlighted */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Featured Reason
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark as a highlighted/featured reason
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHighlighted}
                  onChange={(e) =>
                    handleInputChange("isHighlighted", e.target.checked)
                  }
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="p-6 rounded-2xl border-2" style={{
              backgroundImage: `linear-gradient(to bottom right, ${
                formData.color === 'blue' ? '#dbeafe, #bfdbfe' :
                formData.color === 'green' ? '#d1fae5, #a7f3d0' :
                formData.color === 'purple' ? '#e9d5ff, #ddd6fe' :
                formData.color === 'orange' ? '#fed7aa, #fdba74' :
                formData.color === 'cyan' ? '#cffafe, #a5f3fc' :
                formData.color === 'red' ? '#fee2e2, #fecaca' :
                formData.color === 'pink' ? '#fce7f3, #fbcfe8' :
                formData.color === 'indigo' ? '#e0e7ff, #c7d2fe' :
                formData.color === 'yellow' ? '#fef3c7, #fde68a' :
                formData.color === 'emerald' ? '#d1fae5, #a7f3d0' : '#dbeafe, #bfdbfe'
              })`,
              borderColor: 
                formData.color === 'blue' ? '#93c5fd' :
                formData.color === 'green' ? '#6ee7b7' :
                formData.color === 'purple' ? '#c4b5fd' :
                formData.color === 'orange' ? '#fdba74' :
                formData.color === 'cyan' ? '#67e8f9' :
                formData.color === 'red' ? '#f87171' :
                formData.color === 'pink' ? '#f472b6' :
                formData.color === 'indigo' ? '#a5b4fc' :
                formData.color === 'yellow' ? '#fbbf24' :
                formData.color === 'emerald' ? '#34d399' : '#93c5fd'
            }}>
              <div className="p-3 rounded-xl mb-4 w-fit text-white" style={{
                backgroundColor: 
                  formData.color === 'blue' ? '#3b82f6' :
                  formData.color === 'green' ? '#10b981' :
                  formData.color === 'purple' ? '#8b5cf6' :
                  formData.color === 'orange' ? '#f97316' :
                  formData.color === 'cyan' ? '#06b6d4' :
                  formData.color === 'red' ? '#ef4444' :
                  formData.color === 'pink' ? '#ec4899' :
                  formData.color === 'indigo' ? '#6366f1' :
                  formData.color === 'yellow' ? '#eab308' :
                  formData.color === 'emerald' ? '#059669' : '#3b82f6'
              }}>
                <div className="w-8 h-8 flex items-center justify-center font-bold">
                  {formData.icon.charAt(0)}
                </div>
              </div>
              
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{
                backgroundColor: `${
                  formData.color === 'blue' ? '#3b82f6' :
                  formData.color === 'green' ? '#10b981' :
                  formData.color === 'purple' ? '#8b5cf6' :
                  formData.color === 'orange' ? '#f97316' :
                  formData.color === 'cyan' ? '#06b6d4' :
                  formData.color === 'red' ? '#ef4444' :
                  formData.color === 'pink' ? '#ec4899' :
                  formData.color === 'indigo' ? '#6366f1' :
                  formData.color === 'yellow' ? '#eab308' :
                  formData.color === 'emerald' ? '#059669' : '#3b82f6'
                }15`,
                color: 
                  formData.color === 'blue' ? '#1e40af' :
                  formData.color === 'green' ? '#065f46' :
                  formData.color === 'purple' ? '#5b21b6' :
                  formData.color === 'orange' ? '#c2410c' :
                  formData.color === 'cyan' ? '#0e7490' :
                  formData.color === 'red' ? '#b91c1c' :
                  formData.color === 'pink' ? '#be185d' :
                  formData.color === 'indigo' ? '#3730a3' :
                  formData.color === 'yellow' ? '#a16207' :
                  formData.color === 'emerald' ? '#047857' : '#1e40af',
                border: `1px solid ${
                  formData.color === 'blue' ? '#93c5fd' :
                  formData.color === 'green' ? '#6ee7b7' :
                  formData.color === 'purple' ? '#c4b5fd' :
                  formData.color === 'orange' ? '#fdba74' :
                  formData.color === 'cyan' ? '#67e8f9' :
                  formData.color === 'red' ? '#f87171' :
                  formData.color === 'pink' ? '#f472b6' :
                  formData.color === 'indigo' ? '#a5b4fc' :
                  formData.color === 'yellow' ? '#fbbf24' :
                  formData.color === 'emerald' ? '#34d399' : '#93c5fd'
                }`
              }}>
                <div className="w-3 h-3 flex items-center justify-center">⚡</div>
                <span>{formData.highlight || "Highlight text"}</span>
              </div>

              <h3 className="text-xl font-bold mb-2" style={{
                color: 
                  formData.color === 'blue' ? '#2563eb' :
                  formData.color === 'green' ? '#059669' :
                  formData.color === 'purple' ? '#7c3aed' :
                  formData.color === 'orange' ? '#ea580c' :
                  formData.color === 'cyan' ? '#0891b2' :
                  formData.color === 'red' ? '#dc2626' :
                  formData.color === 'pink' ? '#db2777' :
                  formData.color === 'indigo' ? '#4f46e5' :
                  formData.color === 'yellow' ? '#ca8a04' :
                  formData.color === 'emerald' ? '#059669' : '#2563eb'
              }}>
                {formData.title || "Reason Title"}
              </h3>
              
              <p className="text-gray-700 mb-4 text-sm">
                {formData.description || "Reason description will appear here..."}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{
                  color: 
                    formData.color === 'blue' ? '#2563eb' :
                    formData.color === 'green' ? '#059669' :
                    formData.color === 'purple' ? '#7c3aed' :
                    formData.color === 'orange' ? '#ea580c' :
                    formData.color === 'cyan' ? '#0891b2' :
                    formData.color === 'red' ? '#dc2626' :
                    formData.color === 'pink' ? '#db2777' :
                    formData.color === 'indigo' ? '#4f46e5' :
                    formData.color === 'yellow' ? '#ca8a04' :
                    formData.color === 'emerald' ? '#059669' : '#2563eb'
                }}>
                  {formData.stats || "Stats will appear here"}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 text-yellow-400">⭐</div>
                  ))}
                </div>
              </div>

              {formData.isHighlighted && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <div className="w-3 h-3 mr-1">⭐</div>
                    Featured
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? "Update Reason" : "Create Reason"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhyChooseUsFormModal;