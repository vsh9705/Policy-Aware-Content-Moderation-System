import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { policyAPI, moderationAPI } from '../services/api';
import { Upload, FileText, History, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload-policy');
  const [policyFiles, setPolicyFiles] = useState([]);
  const [moderateFile, setModerateFile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [moderationResult, setModerationResult] = useState(null);

  useEffect(() => {
    if (activeTab === 'view-policies') {
      loadPolicies();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadPolicies = async () => {
    try {
      const response = await policyAPI.listPolicies();
      setPolicies(response.data.policies);
    } catch (error) {
      showMessage('error', 'Failed to load policies');
    }
  };

  const loadHistory = async () => {
    try {
      const response = await moderationAPI.getHistory();
      setHistory(response.data.results);
    } catch (error) {
      showMessage('error', 'Failed to load history');
    }
  };

  const handlePolicyUpload = async (e) => {
    e.preventDefault();
    if (!policyFiles.length) {
      showMessage('error', 'Please select at least one policy file');
      return;
    }

    setLoading(true);
    try {
      await policyAPI.uploadPolicies(policyFiles);
      showMessage('success', 'Policies uploaded successfully!');
      setPolicyFiles([]);
      e.target.reset();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to upload policies');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (e) => {
    e.preventDefault();
    if (!moderateFile) {
      showMessage('error', 'Please select a file to moderate');
      return;
    }

    setLoading(true);
    setModerationResult(null);
    try {
      const response = await moderationAPI.moderateFile(moderateFile);
      setModerationResult(response.data);
      showMessage('success', 'File moderated successfully!');
      setModerateFile(null);
      e.target.reset();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to moderate file');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPolicies = async () => {
    if (!window.confirm('Are you sure you want to clear all policies?')) return;

    setLoading(true);
    try {
      await policyAPI.clearPolicies();
      showMessage('success', 'All policies cleared!');
      setPolicies([]);
    } catch (error) {
      showMessage('error', 'Failed to clear policies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.main}>
        {message.text && (
          <div style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('upload-policy')}
            style={{
              ...styles.tab,
              ...(activeTab === 'upload-policy' ? styles.activeTab : {}),
            }}
          >
            <Upload size={18} />
            Upload Policies
          </button>
          <button
            onClick={() => setActiveTab('moderate')}
            style={{
              ...styles.tab,
              ...(activeTab === 'moderate' ? styles.activeTab : {}),
            }}
          >
            <FileText size={18} />
            Moderate File
          </button>
          <button
            onClick={() => setActiveTab('view-policies')}
            style={{
              ...styles.tab,
              ...(activeTab === 'view-policies' ? styles.activeTab : {}),
            }}
          >
            <FileText size={18} />
            View Policies
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              ...styles.tab,
              ...(activeTab === 'history' ? styles.activeTab : {}),
            }}
          >
            <History size={18} />
            History
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'upload-policy' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Upload Policy Documents</h2>
              <form onSubmit={handlePolicyUpload}>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => setPolicyFiles(Array.from(e.target.files))}
                  style={styles.fileInput}
                />
                {policyFiles.length > 0 && (
                  <p style={styles.fileCount}>{policyFiles.length} file(s) selected</p>
                )}
                <button type="submit" disabled={loading} style={styles.button}>
                  {loading ? 'Uploading...' : 'Upload Policies'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'moderate' && (
            <div>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Moderate a Document</h2>
                <form onSubmit={handleModeration}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setModerateFile(e.target.files[0])}
                    style={styles.fileInput}
                  />
                  {moderateFile && (
                    <p style={styles.fileCount}>{moderateFile.name}</p>
                  )}
                  <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Moderating...' : 'Moderate File'}
                  </button>
                </form>
              </div>

              {moderationResult && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Moderation Result</h3>
                  <div style={styles.resultHeader}>
                    <div style={styles.statCard}>
                      <p style={styles.statLabel}>Verdict</p>
                      <p style={{
                        ...styles.statValue,
                        color: moderationResult.verdict === 'clean' ? '#059669' : '#dc2626',
                      }}>
                        {moderationResult.verdict === 'clean' ? (
                          <><CheckCircle size={20} /> Clean</>
                        ) : (
                          <><AlertCircle size={20} /> Violations Found</>
                        )}
                      </p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statLabel}>Total Chunks</p>
                      <p style={styles.statValue}>{moderationResult.total_chunks}</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statLabel}>Allowed</p>
                      <p style={styles.statValue}>{moderationResult.allowed_chunks}</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statLabel}>Review</p>
                      <p style={styles.statValue}>{moderationResult.review_chunks}</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statLabel}>Violations</p>
                      <p style={styles.statValue}>{moderationResult.violation_chunks}</p>
                    </div>
                  </div>

                  {moderationResult.violations && moderationResult.violations.length > 0 && (
                    <div style={styles.violationsSection}>
                      <h4 style={styles.violationsTitle}>Violations & Reviews</h4>
                      {moderationResult.violations.map((violation, idx) => (
                        <div key={idx} style={styles.violationCard}>
                          <div style={styles.violationHeader}>
                            <span style={{
                              ...styles.violationBadge,
                              backgroundColor: violation.verdict === 'violation' ? '#fee2e2' : '#fef3c7',
                              color: violation.verdict === 'violation' ? '#991b1b' : '#92400e',
                            }}>
                              {violation.verdict.toUpperCase()}
                            </span>
                            <span style={styles.chunkId}>{violation.chunk_id}</span>
                          </div>
                          <p style={styles.chunkText}>{violation.chunk_text}</p>
                          <p style={styles.explanation}><strong>Explanation:</strong> {violation.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'view-policies' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Policy Documents</h2>
                {policies.length > 0 && (
                  <button onClick={handleClearPolicies} style={styles.dangerButton}>
                    Clear All Policies
                  </button>
                )}
              </div>
              {policies.length === 0 ? (
                <p style={styles.emptyState}>No policies uploaded yet.</p>
              ) : (
                <div style={styles.policyList}>
                  {policies.map((policy) => (
                    <div key={policy.id} style={styles.policyItem}>
                      <FileText size={20} style={styles.policyIcon} />
                      <div style={styles.policyInfo}>
                        <p style={styles.policyName}>{policy.filename}</p>
                        <p style={styles.policyMeta}>
                          {(policy.file_size / 1024).toFixed(2)} KB • {new Date(policy.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Moderation History</h2>
              {history.length === 0 ? (
                <p style={styles.emptyState}>No moderation history yet.</p>
              ) : (
                <div style={styles.historyList}>
                  {history.map((item) => (
                    <div key={item.id} style={styles.historyItem}>
                      <div style={styles.historyHeader}>
                        <div style={styles.historyInfo}>
                          <FileText size={18} />
                          <span style={styles.historyFilename}>{item.filename}</span>
                        </div>
                        <span style={{
                          ...styles.historyVerdict,
                          backgroundColor: item.verdict === 'clean' ? '#d1fae5' : '#fee2e2',
                          color: item.verdict === 'clean' ? '#065f46' : '#991b1b',
                        }}>
                          {item.verdict === 'clean' ? 'Clean' : 'Violations'}
                        </span>
                      </div>
                      <div style={styles.historyStats}>
                        <span>Total: {item.total_chunks}</span>
                        <span>Allowed: {item.allowed_chunks}</span>
                        <span>Review: {item.review_chunks}</span>
                        <span>Violations: {item.violation_chunks}</span>
                      </div>
                      <p style={styles.historyDate}>
                        <Clock size={14} />
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    minHeight: '400px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 1rem 0',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    border: '2px dashed #d1d5db',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  fileCount: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  resultHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  violationsSection: {
    marginTop: '1.5rem',
  },
  violationsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  violationCard: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    border: '1px solid #e5e7eb',
  },
  violationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  violationBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  chunkId: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  chunkText: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  explanation: {
    fontSize: '0.875rem',
    color: '#4b5563',
    marginTop: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '2rem',
  },
  policyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  policyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
  },
  policyIcon: {
    color: '#3b82f6',
  },
  policyInfo: {
    flex: 1,
  },
  policyName: {
    fontWeight: '500',
    color: '#1f2937',
    margin: '0 0 0.25rem 0',
  },
  policyMeta: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  historyItem: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  historyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  historyFilename: {
    fontWeight: '500',
    color: '#1f2937',
  },
  historyVerdict: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  historyStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  historyDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: 0,
  },
};

export default Dashboard;