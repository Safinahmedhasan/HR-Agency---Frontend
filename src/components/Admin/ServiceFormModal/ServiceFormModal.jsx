// components/Admin/ServiceFormModal/ServiceFormModal.jsx - MISSING COMPONENT
import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Star } from "lucide-react";

// Available icons for services
const AVAILABLE_ICONS = [
  "Search",
  "Users",
  "FileText",
  "BarChart3",
  "GraduationCap",
  "Heart",
  "Shield",
  "UserCheck",
  "Database",
  "Award",
  "Zap",
  "Globe",
  "TrendingUp",
  "Settings",
  "Star",
  "CheckCircle",
  "Clock",
  "Mail",
  "Phone",
  "Calendar",
];

// Color schemes
const COLOR_SCHEMES = {
  bgGradients: [
    "from-blue-50 to-blue-100",
    "from-green-50 to-green-100",
    "from-purple-50 to-purple-100",
    "from-orange-50 to-orange-100",
    "from-red-50 to-red-100",
    "from-indigo-50 to-indigo-100",
    "from-pink-50 to-pink-100",
    "from-teal-50 to-teal-100",
    "from-cyan-50 to-cyan-100",
    "from-emerald-50 to-emerald-100",
    "from-violet-50 to-violet-100",
    "from-yellow-50 to-yellow-100",
  ],
  iconBgs: [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-yellow-500",
  ],
  borderColors: [
    "border-blue-200",
    "border-green-200",
    "border-purple-200",
    "border-orange-200",
    "border-red-200",
    "border-indigo-200",
    "border-pink-200",
    "border-teal-200",
    "border-cyan-200",
    "border-emerald-200",
    "border-violet-200",
    "border-yellow-200",
  ],
  hoverShadows: [
    "hover:shadow-blue-200/50",
    "hover:shadow-green-200/50",
    "hover:shadow-purple-200/50",
    "hover:shadow-orange-200/50",
    "hover:shadow-red-200/50",
    "hover:shadow-indigo-200/50",
    "hover:shadow-pink-200/50",
    "hover:shadow-teal-200/50",
    "hover:shadow-cyan-200/50",
    "hover:shadow-emerald-200/50",
    "hover:shadow-violet-200/50",
    "hover:shadow-yellow-200/50",
  ],
  accents: [
    "text-blue-600",
    "text-green-600",
    "text-purple-600",
    "text-orange-600",
    "text-red-600",
    "text-indigo-600",
    "text-pink-600",
    "text-teal-600",
    "text-cyan-600",
    "text-emerald-600",
    "text-violet-600",
    "text-yellow-600",
  ],
};

const ServiceFormModal = ({
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
    features: [""],
    bgGradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-200",
    hoverShadow: "hover:shadow-blue-200/50",
    accent: "text-blue-600",
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
        features: initialData.features || [""],
        bgGradient: initialData.bgGradient || "from-blue-50 to-blue-100",
        iconBg: initialData.iconBg || "bg-blue-500",
        borderColor: initialData.borderColor || "border-blue-200",
        hoverShadow: initialData.hoverShadow || "hover:shadow-blue-200/50",
        accent: initialData.accent || "text-blue-600",
        isHighlighted: initialData.isHighlighted || false,
        sortOrder: initialData.sortOrder || 0,
      });
    } else if (!isEditing) {
      // Reset form for new service
      setFormData({
        title: "",
        description: "",
        icon: "Star",
        features: [""],
        bgGradient: "from-blue-50 to-blue-100",
        iconBg: "bg-blue-500",
        borderColor: "border-blue-200",
        hoverShadow: "hover:shadow-blue-200/50",
        accent: "text-blue-600",
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
      newErrors.title = "Service title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Service description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    const validFeatures = formData.features.filter((f) => f.trim().length > 0);
    if (validFeatures.length === 0) {
      newErrors.features = "At least one feature is required";
    } else if (validFeatures.length > 6) {
      newErrors.features = "Maximum 6 features allowed";
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

  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
    if (errors.features) {
      setErrors((prev) => ({
        ...prev,
        features: "",
      }));
    }
  };

  // Add new feature
  const addFeature = () => {
    if (formData.features.length < 6) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, ""],
      }));
    }
  };

  // Remove feature
  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        features: newFeatures,
      }));
    }
  };

  // Handle color scheme change
  const handleColorSchemeChange = (schemeIndex) => {
    setFormData((prev) => ({
      ...prev,
      bgGradient: COLOR_SCHEMES.bgGradients[schemeIndex],
      iconBg: COLOR_SCHEMES.iconBgs[schemeIndex],
      borderColor: COLOR_SCHEMES.borderColors[schemeIndex],
      hoverShadow: COLOR_SCHEMES.hoverShadows[schemeIndex],
      accent: COLOR_SCHEMES.accents[schemeIndex],
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Clean up features
    const cleanedFeatures = formData.features
      .filter((f) => f.trim().length > 0)
      .map((f) => f.trim());

    const submitData = {
      ...formData,
      features: cleanedFeatures,
      title: formData.title.trim(),
      description: formData.description.trim(),
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
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              {isEditing ? (
                <>
                  <Star className="h-5 w-5 text-orange-600 mr-2" />
                  Edit HR Service
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-blue-600 mr-2" />
                  Create New HR Service
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
                Service Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., Recruitment & Talent Acquisition"
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
                Service Icon *
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
              Service Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Describe what this HR service offers..."
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

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Features * (1-6 features)
            </label>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={`Feature ${index + 1}`}
                    maxLength={100}
                    disabled={isLoading}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.features && (
              <p className="mt-1 text-sm text-red-600">{errors.features}</p>
            )}
            {formData.features.length < 6 && (
              <button
                type="button"
                onClick={addFeature}
                disabled={isLoading}
                className="mt-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Add Feature</span>
              </button>
            )}
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {COLOR_SCHEMES.bgGradients.map((gradient, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorSchemeChange(index)}
                  disabled={isLoading}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.bgGradient === gradient
                      ? "border-blue-500 ring-2 ring-blue-500/20 scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  } bg-gradient-to-br ${gradient} disabled:opacity-50`}
                >
                  <div
                    className={`w-6 h-6 ${COLOR_SCHEMES.iconBgs[index]} rounded-lg mx-auto mb-2`}
                  ></div>
                  <div className="text-xs text-gray-600 text-center">
                    Scheme {index + 1}
                  </div>
                  {formData.bgGradient === gradient && (
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
                  Featured Service
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark as a highlighted/featured service
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
            <div
              className={`p-6 rounded-2xl border-2 bg-gradient-to-br ${formData.bgGradient} ${formData.borderColor}`}
            >
              <div
                className={`${formData.iconBg} text-white p-3 rounded-xl mb-4 w-fit`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold">
                  {formData.icon.charAt(0)}
                </div>
              </div>
              <h3 className={`text-xl font-bold ${formData.accent} mb-2`}>
                {formData.title || "Service Title"}
              </h3>
              <p className="text-gray-700 mb-4 text-sm">
                {formData.description ||
                  "Service description will appear here..."}
              </p>
              <ul className="space-y-1">
                {formData.features
                  .filter((f) => f.trim())
                  .map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>
              {formData.isHighlighted && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
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
                  <span>{isEditing ? "Update Service" : "Create Service"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
