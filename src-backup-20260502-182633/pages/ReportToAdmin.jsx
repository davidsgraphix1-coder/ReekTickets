import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './ReportToAdmin.css';

export default function ReportToAdmin() {
  const navigate = useNavigate();
  const [reportMessage, setReportMessage] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('reek_token')}` };

  const submitReport = async () => {
    if (!reportMessage.trim()) {
      setReportStatus('Please enter a report message.');
      return;
    }

    setLoading(true);
    setReportStatus('');
    try {
      await axios.post(`${API_BASE}/report`, { message: reportMessage.trim() }, { headers });
      setReportMessage('');
      setReportStatus('Report submitted successfully!');
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setReportStatus('');
      }, 5000);
    } catch (err) {
      console.error('Submit report failed:', err);
      setReportStatus('Unable to send report at the moment. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-header">
          <h1>Report to Admin</h1>
          <p>Have an issue or suggestion? Let us know!</p>
        </div>

        <div className="report-form-section">
          <div className="report-card">
            <h2>Send Your Report</h2>
            <p className="form-description">
              Please provide details about your issue, suggestion, or complaint. Our admin team will review and respond soon.
            </p>

            <div className="form-group">
              <label htmlFor="reportMessage">Your Message *</label>
              <textarea
                id="reportMessage"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder="Describe your issue or suggestion in detail..."
                className="report-textarea"
                disabled={loading}
                rows={10}
              />
              <p className="char-count">{reportMessage.length} characters</p>
            </div>

            <div className="button-group">
              <button
                onClick={submitReport}
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading || reportMessage.trim() === ''}
              >
                <FaPaperPlane /> {loading ? 'Sending...' : 'Send Report'}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {reportStatus && (
              <div className={`status-message ${submitSuccess ? 'success' : 'error'}`}>
                {submitSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}
                <span>{reportStatus}</span>
              </div>
            )}
          </div>

          <div className="report-info-section">
            <h3>Tips for Effective Reports</h3>
            <ul>
              <li>
                <strong>Be Clear:</strong> Describe the issue clearly and concisely
              </li>
              <li>
                <strong>Be Specific:</strong> Include relevant details like event names, ticket numbers, or dates
              </li>
              <li>
                <strong>Stay Professional:</strong> Use respectful language
              </li>
              <li>
                <strong>Provide Context:</strong> Explain what you were trying to do when the issue occurred
              </li>
              <li>
                <strong>Attach Screenshots:</strong> If possible, describe visual issues you encountered
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
