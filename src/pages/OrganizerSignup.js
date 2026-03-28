import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrganizerSignup.css';

export default function OrganizerSignup({ onLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    businessPartners: [],
    businessDetails: {
      country: 'Ghana',
      city: '',
      address: '',
      zipCode: '',
    },
    email: '',
    businessName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addBusinessPartner = () => {
    setFormData(prev => ({
      ...prev,
      businessPartners: [...prev.businessPartners, { firstName: '', lastName: '', phone: '' }]
    }));
  };

  const updateBusinessPartner = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessPartners: prev.businessPartners.map((partner, i) =>
        i === index ? { ...partner, [field]: value } : partner
      )
    }));
  };

  const removeBusinessPartner = (index) => {
    setFormData(prev => ({
      ...prev,
      businessPartners: prev.businessPartners.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password match
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'organizer',
        businessName: formData.businessName,
        contactNumber: formData.contactNumber,
        businessPartners: formData.businessPartners.filter(partner =>
          partner.firstName || partner.lastName || partner.phone
        ),
        businessDetails: formData.businessDetails,
        termsAccepted: formData.termsAccepted,
      };

      const response = await axios.post('https://reektickets-production.up.railway.app/api/auth/signup', submitData);

      if (response.data.token) {
        localStorage.setItem('reek_token', response.data.token);
        localStorage.setItem('reek_user', JSON.stringify(response.data.user));
        onLogin(response.data.user);
        navigate('/dashboard/organizer');
      } else {
        setErrors({ submit: response.data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organizer-signup">
      {/* Background Split */}
      <div className="signup-background">
        <div className="left-bg"></div>
        <div className="right-bg"></div>
      </div>

      {/* Form Container */}
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Join ReekTickets</h1>
            <p>Create your organizer account</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Name Row */}
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* Add Business Partners Button */}
            <button
              type="button"
              className="add-partner-btn"
              onClick={addBusinessPartner}
            >
              Add More Business Partners
            </button>

            {/* Business Partners */}
            {formData.businessPartners.map((partner, index) => (
              <div key={index} className="partner-row">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={partner.firstName}
                    onChange={(e) => updateBusinessPartner(index, 'firstName', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={partner.lastName}
                    onChange={(e) => updateBusinessPartner(index, 'lastName', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={partner.phone}
                    onChange={(e) => updateBusinessPartner(index, 'phone', e.target.value)}
                  />
                  <button
                    type="button"
                    className="remove-partner-btn"
                    onClick={() => removeBusinessPartner(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Business Details Section */}
            <div className="section-header">
              <h3>Business Details</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <select
                  name="businessDetails.country"
                  value={formData.businessDetails.country}
                  onChange={handleInputChange}
                >
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="businessDetails.city"
                  value={formData.businessDetails.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                name="businessDetails.address"
                value={formData.businessDetails.address}
                onChange={handleInputChange}
                placeholder="Address"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="businessDetails.zipCode"
                value={formData.businessDetails.zipCode}
                onChange={handleInputChange}
                placeholder="Zip Code"
              />
            </div>

            {/* Account Details Section */}
            <div className="section-header">
              <h3>Account Details</h3>
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Business Name"
                className={errors.businessName ? 'error' : ''}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Contact Number"
                className={errors.contactNumber ? 'error' : ''}
              />
              {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
            </div>

            <div className="form-group">
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Terms Checkbox */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                I agree to all <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
              </label>
              {errors.termsAccepted && <span className="error-text">{errors.termsAccepted}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && <div className="error-message">{errors.submit}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create'}
            </button>

            {/* Login Link */}
            <div className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Login</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}