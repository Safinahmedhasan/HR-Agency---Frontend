// components/Admin/TestimonialFormModal/TestimonialFormModal.jsx
import React, { useState, useEffect } from "react";
import { X, Save, Plus, Star } from "lucide-react";

// Available industries
const AVAILABLE_INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Startup",
  "Consulting",
  "Real Estate",
  "Marketing",
  "Non-profit",
  "Government",
  "Other",
];

// Available approval statuses
const APPROVAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TestimonialFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    company: "",
    email: "",
    testimonialText: "",
    rating: 5,
    industry: "Technology",
    location: "",
    results: "",
    projectType: "",
    isHighlighted: false,
    isFeatured: false,
    sortOrder: 0,
    approvalStatus: "approved",
  });

  const [errors, setErrors] = useState({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name || "",
        position: initialData.position || "",
        company: initialData.company || "",
        email: initialData.email || "",
        testimonialText: initialData.testimonialText || "",
        rating: initialData.rating || 5,
        industry: initialData.industry || "Technology",
        location: initialData.location || "",
        results: initialData.results || "",
        projectType: initialData.projectType || "",
        isHighlighted: initialData.isHighlighted || false,
        isFeatured: initialData.isFeatured || false,
        sortOrder: initialData.sortOrder || 0,
        approvalStatus: initialData.approvalStatus || "approved",
      });
    } else if (!isEditing) {
      // Reset form for new testimonial
      setFormData({
        name: "",
        position: "",
        company: "",
        email: "",
        testimonialText: "",
        rating: 5,
        industry: "Technology",
        location: "",
        results: "",
        projectType: "",
        isHighlighted: false,
        isFeatured: false,
        sortOrder: 0,
        approvalStatus: "approved",
      });
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    } else if (formData.position.length < 2) {
      newErrors.position = "Position must be at least 2 characters";
    } else if (formData.position.length > 100) {
      newErrors.position = "Position cannot exceed 100 characters";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    } else if (formData.company.length < 2) {
      newErrors.company = "Company name must be at least 2 characters";
    } else if (formData.company.length > 100) {
      newErrors.company = "Company name cannot exceed 100 characters";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.testimonialText.trim()) {
      newErrors.testimonialText = "Testimonial text is required";
    } else if (formData.testimonialText.length < 20) {
      newErrors.testimonialText =
        "Testimonial text must be at least 20 characters";
    } else if (formData.testimonialText.length > 1000) {
      newErrors.testimonialText =
        "Testimonial text cannot exceed 1000 characters";
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = "Location cannot exceed 100 characters";
    }

    if (formData.results && formData.results.length > 200) {
      newErrors.results = "Results cannot exceed 200 characters";
    }

    if (formData.projectType && formData.projectType.length > 100) {
      newErrors.projectType = "Project type cannot exceed 100 characters";
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

    console.log("🔍 Form data before validation:", formData); // Debug log

    if (!validateForm()) {
      console.log("❌ Validation failed. Errors:", errors); // Debug log
      return;
    }

    // Clean up features
    const cleanedFeatures = formData.features
      ? formData.features
          .filter((f) => f.trim().length > 0)
          .map((f) => f.trim())
      : [];

    const submitData = {
      ...formData,
      features: cleanedFeatures,
      name: formData.name.trim(),
      position: formData.position.trim(),
      company: formData.company.trim(),
      email: formData.email?.trim() || "",
      testimonialText: formData.testimonialText.trim(),
      location: formData.location?.trim() || "",
      results: formData.results?.trim() || "",
      projectType: formData.projectType?.trim() || "",
    };

    console.log("📤 Submitting data:", submitData); // Debug log

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
                  Edit Client Testimonial
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-blue-600 mr-2" />
                  Create New Testimonial
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
          {/* Client Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., Sarah Johnson"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.position
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., CEO"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.position.length}/100 characters
              </p>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.company
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., TechGlobal Inc."
                maxLength={100}
                disabled={isLoading}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.company.length}/100 characters
              </p>
            </div>
          </div>

          {/* Email and Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., sarah@techglobal.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    handleInputChange("rating", parseInt(e.target.value) || 5)
                  }
                  className={`w-20 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.rating
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange("rating", star)}
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      } hover:text-yellow-400 transition-colors`}
                      disabled={isLoading}
                    >
                      <Star className="w-full h-full" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {formData.rating}/5
                </span>
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Testimonial Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial Text *
            </label>
            <textarea
              value={formData.testimonialText}
              onChange={(e) =>
                handleInputChange("testimonialText", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.testimonialText
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Write the client's testimonial here..."
              rows={4}
              maxLength={1000}
              disabled={isLoading}
            />
            {errors.testimonialText && (
              <p className="mt-1 text-sm text-red-600">
                {errors.testimonialText}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.testimonialText.length}/1000 characters
            </p>
          </div>

          {/* Industry and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                {AVAILABLE_INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.location
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., San Francisco, CA"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.location.length}/100 characters
              </p>
            </div>
          </div>

          {/* Results and Project Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results Achieved (Optional)
              </label>
              <input
                type="text"
                value={formData.results}
                onChange={(e) => handleInputChange("results", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.results
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., 40% faster hiring process"
                maxLength={200}
                disabled={isLoading}
              />
              {errors.results && (
                <p className="mt-1 text-sm text-red-600">{errors.results}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.results.length}/200 characters
              </p>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type (Optional)
              </label>
              <input
                type="text"
                value={formData.projectType}
                onChange={(e) =>
                  handleInputChange("projectType", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.projectType
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., Remote Workforce Management"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.projectType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.projectType}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.projectType.length}/100 characters
              </p>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Approval Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Status
              </label>
              <select
                value={formData.approvalStatus}
                onChange={(e) =>
                  handleInputChange("approvalStatus", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                {APPROVAL_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Features
              </label>

              {/* Featured */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Featured Testimonial
                  </label>
                  <p className="text-xs text-gray-500">
                    Show in featured section
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleInputChange("isFeatured", e.target.checked)
                    }
                    className="sr-only peer"
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Highlighted */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Highlighted
                  </label>
                  <p className="text-xs text-gray-500">Special highlighting</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(formData.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg text-gray-800 mb-6 leading-relaxed italic">
                "
                {formData.testimonialText ||
                  "Testimonial text will appear here..."}
                "
              </blockquote>

              {/* Results Badge */}
              {formData.results && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-sm font-medium text-green-700 mb-4">
                  <span>✨ {formData.results}</span>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(formData.name || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {formData.name || "Client Name"}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.position || "Position"}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">
                    {formData.company || "Company Name"}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 mt-4">
                {formData.isFeatured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </span>
                )}
                {formData.isHighlighted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Highlighted
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    formData.approvalStatus === "approved"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : formData.approvalStatus === "rejected"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {formData.approvalStatus}
                </span>
              </div>
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
                  <span>
                    {isEditing ? "Update Testimonial" : "Create Testimonial"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormModal;
