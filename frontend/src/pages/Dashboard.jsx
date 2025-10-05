import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { policyAPI, moderationAPI } from '../services/api';
import { Upload, FileText, History, AlertCircle, CheckCircle, Clock, Shield, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [policyFiles, setPolicyFiles] = useState([]);
  const [moderateFile, setModerateFile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [history, setHistory] = useState([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [viewingFile, setViewingFile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [moderationResult, setModerationResult] = useState(null);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    totalViolations: 0,
    totalReviews: 0,
    totalClean: 0,
  });

  useEffect(() => {
    loadPolicies();
    loadHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      const violations = history.filter(h => h.verdict === 'violation_found').length;
      const clean = history.filter(h => h.verdict === 'clean').length;
      const reviews = history.reduce((acc, h) => acc + h.review_chunks, 0);
      
      setStats({
        totalPolicies: policies.length,
        totalViolations: violations,
        totalReviews: reviews,
        totalClean: clean,
      });
    }
  }, [history, policies]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadPolicies = async () => {
    try {
      const response = await policyAPI.listPolicies();
      setPolicies(response.data.policies);
    } catch (error) {
      console.error('Failed to load policies');
    }
  };

  const loadHistory = async () => {
    try {
      const response = await moderationAPI.getHistory();
      setHistory(response.data.results);
    } catch (error) {
      console.error('Failed to load history');
    }
  };

  const handlePolicyUpload = async (e) => {
    e.preventDefault();
    if (!policyFiles.length) {
      showMessage('error', 'Please select at least one policy file');
      return;
    }

    setPolicyLoading(true);
    try {
      await policyAPI.uploadPolicies(policyFiles);
      showMessage('success', 'Policies uploaded successfully!');
      setPolicyFiles([]);
      e.target.reset();
      loadPolicies();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to upload policies');
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleModeration = async (e) => {
    e.preventDefault();
    if (!moderateFile) {
      showMessage('error', 'Please select a file to moderate');
      return;
    }

    setModerationLoading(true);
    setModerationResult(null);
    try {
      const response = await moderationAPI.moderateFile(moderateFile);
      setModerationResult(response.data);
      showMessage('success', 'File moderated successfully!');
      setModerateFile(null);
      e.target.reset();
      loadHistory();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to moderate file');
    } finally {
      setModerationLoading(false);
    }
  };

  const handleClearPolicies = async () => {
    if (!window.confirm('Are you sure you want to clear all policies?')) return;

    setPolicyLoading(true);
    try {
      await policyAPI.clearPolicies();
      showMessage('success', 'All policies cleared!');
      setPolicies([]);
      loadPolicies();
    } catch (error) {
      showMessage('error', 'Failed to clear policies');
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleFinalVerdict = async (resultId, verdict) => {
    try {
      await moderationAPI.updateFinalVerdict(resultId, verdict);
      showMessage('success', `File marked as ${verdict === 'approved' ? 'Clean' : 'Violation'}`);
      loadHistory();
      if (selectedResult && selectedResult.id === resultId) {
        setSelectedResult(null);
      }
      if (moderationResult && moderationResult.id === resultId) {
        setModerationResult(null);
      }
    } catch (error) {
      showMessage('error', 'Failed to update verdict');
    }
  };

  const handleViewDetails = async (resultId) => {
    try {
      const response = await moderationAPI.getDetail(resultId);
      setSelectedResult(response.data);
      setViewingFile(true);
    } catch (error) {
      showMessage('error', 'Failed to load result details');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbarWrapper}>
        <Navbar />
      </div>
      
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

        {activeTab === 'main' && (
          <>
            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <div style={styles.statIcon}><CheckCircle size={32} /></div>
                <div style={styles.statContent}>
                  <div style={styles.statValue}>{stats.totalClean}</div>
                  <div style={styles.statLabel}>Clean Files</div>
                </div>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                <div style={styles.statIcon}><AlertCircle size={32} /></div>
                <div style={styles.statContent}>
                  <div style={styles.statValue}>{stats.totalViolations}</div>
                  <div style={styles.statLabel}>Violations Found</div>
                </div>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                <div style={styles.statIcon}><Clock size={32} /></div>
                <div style={styles.statContent}>
                  <div style={styles.statValue}>{stats.totalReviews}</div>
                  <div style={styles.statLabel}>Needs Review</div>
                </div>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                <div style={styles.statIcon}><Shield size={32} /></div>
                <div style={styles.statContent}>
                  <div style={styles.statValue}>{stats.totalPolicies}</div>
                  <div style={styles.statLabel}>Active Policies</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div style={styles.contentGrid}>
              {/* Policy Upload Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <FileText size={24} style={{color: '#8b5cf6'}} />
                  <h2 style={styles.cardTitle}>Policy Document</h2>
                </div>
                <p style={styles.cardSubtitle}>Upload your content moderation policy to use as the AI reference</p>
                
                <div style={styles.uploadArea}>
                  {policies.length === 0 ? (
                    <>
                      <FileText size={64} style={{color: '#9ca3af', marginBottom: '1rem'}} />
                      <p style={styles.emptyText}>No active policy uploaded</p>
                    </>
                  ) : (
                    <>
                      <Shield size={64} style={{color: '#8b5cf6', marginBottom: '1rem'}} />
                      <p style={styles.emptyText}>{policies.length} policy file(s) active</p>
                    </>
                  )}
                </div>

                <form onSubmit={handlePolicyUpload}>
                  <label style={styles.fileLabel}>
                    <Upload size={16} />
                    <span>Choose file</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={(e) => setPolicyFiles(Array.from(e.target.files))}
                      style={styles.hiddenInput}
                    />
                  </label>
                  {policyFiles.length > 0 && (
                    <p style={styles.fileCount}>{policyFiles.length} file(s) selected</p>
                  )}
                  <div style={styles.buttonGroup}>
                    <button type="submit" disabled={policyLoading} style={styles.primaryButton}>
                      Upload Policy
                    </button>
                    {policies.length > 0 && (
                      <button 
                        type="button" 
                        onClick={handleClearPolicies} 
                        style={styles.dangerButtonSmall}
                        disabled={policyLoading}
                      >
                        <Trash2 size={16} />
                        Clear All
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Moderation Section */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <FileText size={24} style={{color: '#8b5cf6'}} />
                  <h2 style={styles.cardTitle}>Submit Content for Review</h2>
                </div>
                <p style={styles.cardSubtitle}>Upload content to moderate against your policy</p>
                
                <form onSubmit={handleModeration}>
                  <div style={styles.uploadAreaClickable}>
                    <label style={styles.uploadLabel}>
                      <Upload size={48} style={{color: '#9ca3af', marginBottom: '1rem'}} />
                      <p style={styles.uploadText}>Click to upload content</p>
                      <p style={styles.uploadHint}>PDF or DOC files only</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setModerateFile(e.target.files[0])}
                        style={styles.hiddenInput}
                      />
                    </label>
                  </div>
                  {moderateFile && (
                    <p style={styles.fileCount}>{moderateFile.name}</p>
                  )}
                  <button type="submit" disabled={moderationLoading} style={styles.primaryButton}>
                    {moderationLoading ? 'Analyzing...' : 'Submit for Moderation'}
                  </button>
                </form>
              </div>
            </div>

            {/* Moderation Results */}
            {moderationResult && (
              <div style={styles.resultsSection}>
                <h2 style={styles.sectionTitle}>Moderation Results</h2>
                <div style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <div style={{
                      ...styles.verdictBadge,
                      backgroundColor: moderationResult.verdict === 'clean' ? '#d1fae5' : '#fee2e2',
                      color: moderationResult.verdict === 'clean' ? '#065f46' : '#991b1b',
                    }}>
                      {moderationResult.verdict === 'clean' ? (
                        <><CheckCircle size={20} /> Clean</>
                      ) : (
                        <><AlertCircle size={20} /> Violations Found</>
                      )}
                    </div>
                    <span style={styles.filename}>{moderationResult.filename}</span>
                  </div>

                  <div style={styles.resultStats}>
                    <div style={styles.resultStat}>
                      <span style={styles.resultStatLabel}>Total Chunks</span>
                      <span style={styles.resultStatValue}>{moderationResult.total_chunks}</span>
                    </div>
                    <div style={styles.resultStat}>
                      <span style={styles.resultStatLabel}>Allowed</span>
                      <span style={{...styles.resultStatValue, color: '#10b981'}}>{moderationResult.allowed_chunks}</span>
                    </div>
                    <div style={styles.resultStat}>
                      <span style={styles.resultStatLabel}>Review</span>
                      <span style={{...styles.resultStatValue, color: '#f59e0b'}}>{moderationResult.review_chunks}</span>
                    </div>
                    <div style={styles.resultStat}>
                      <span style={styles.resultStatLabel}>Violations</span>
                      <span style={{...styles.resultStatValue, color: '#ef4444'}}>{moderationResult.violation_chunks}</span>
                    </div>
                  </div>

                  {moderationResult.violations && moderationResult.violations.length > 0 && (
                    <div style={styles.violationsSection}>
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
                          </div>
                          <p style={styles.chunkText}>{violation.chunk_text}</p>
                          <p style={styles.explanation}>{violation.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={styles.tabHeader}>
              <History size={32} style={{color: '#8b5cf6'}} />
              <h2 style={styles.tabTitle}>Moderation History</h2>
            </div>
            
            {history.length === 0 ? (
              <div style={styles.emptyState}>
                <History size={64} style={{color: '#d1d5db'}} />
                <p style={styles.emptyStateText}>No submissions yet</p>
                <p style={styles.emptyStateHint}>Submit content to see moderation results</p>
              </div>
            ) : (
              <div style={styles.historyGrid}>
                {history.map((item) => (
                  <div key={item.id} style={styles.historyCard}>
                    <div style={styles.historyCardHeader}>
                      <FileText size={20} style={{color: '#8b5cf6'}} />
                      <span style={styles.historyFilename}>{item.filename}</span>
                    </div>
                    <div style={{
                      ...styles.historyVerdict,
                      backgroundColor: item.verdict === 'clean' ? '#d1fae5' : '#fee2e2',
                      color: item.verdict === 'clean' ? '#065f46' : '#991b1b',
                    }}>
                      {item.verdict === 'clean' ? 'Clean' : 'Violations Found'}
                    </div>
                    {item.final_verdict !== 'pending' && (
                      <div style={{
                        ...styles.finalVerdictSmall,
                        backgroundColor: item.final_verdict === 'approved' ? '#d1fae5' : '#fee2e2',
                        color: item.final_verdict === 'approved' ? '#065f46' : '#991b1b',
                      }}>
                        Final: {item.final_verdict === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                    <div style={styles.historyStats}>
                      <div style={styles.historyStat}>
                        <span style={styles.historyStatValue}>{item.total_chunks}</span>
                        <span style={styles.historyStatLabel}>Total</span>
                      </div>
                      <div style={styles.historyStat}>
                        <span style={{...styles.historyStatValue, color: '#10b981'}}>{item.allowed_chunks}</span>
                        <span style={styles.historyStatLabel}>Allowed</span>
                      </div>
                      <div style={styles.historyStat}>
                        <span style={{...styles.historyStatValue, color: '#f59e0b'}}>{item.review_chunks}</span>
                        <span style={styles.historyStatLabel}>Review</span>
                      </div>
                      <div style={styles.historyStat}>
                        <span style={{...styles.historyStatValue, color: '#ef4444'}}>{item.violation_chunks}</span>
                        <span style={styles.historyStatLabel}>Violations</span>
                      </div>
                    </div>
                    <div style={styles.historyDate}>
                      <Clock size={14} />
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleViewDetails(item.id)}
                      style={styles.viewDetailsButton}
                    >
                      View Details & Make Decision
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setActiveTab(activeTab === 'main' ? 'history' : 'main')}
          style={styles.fab}
        >
          {activeTab === 'main' ? <History size={24} /> : <Shield size={24} />}
        </button>

        {/* Detail View Modal */}
        {viewingFile && selectedResult && (
          <div style={styles.modal} onClick={() => setViewingFile(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{selectedResult.filename}</h2>
                <button onClick={() => setViewingFile(false)} style={styles.closeButton}>×</button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.resultHeader}>
                  <div style={{
                    ...styles.verdictBadge,
                    backgroundColor: selectedResult.verdict === 'clean' ? '#d1fae5' : '#fee2e2',
                    color: selectedResult.verdict === 'clean' ? '#065f46' : '#991b1b',
                  }}>
                    {selectedResult.verdict === 'clean' ? (
                      <><CheckCircle size={20} /> Clean</>
                    ) : (
                      <><AlertCircle size={20} /> Violations Found</>
                    )}
                  </div>
                </div>

                <div style={styles.resultStats}>
                  <div style={styles.resultStat}>
                    <span style={styles.resultStatLabel}>Total</span>
                    <span style={styles.resultStatValue}>{selectedResult.total_chunks}</span>
                  </div>
                  <div style={styles.resultStat}>
                    <span style={styles.resultStatLabel}>Allowed</span>
                    <span style={{...styles.resultStatValue, color: '#10b981'}}>{selectedResult.allowed_chunks}</span>
                  </div>
                  <div style={styles.resultStat}>
                    <span style={styles.resultStatLabel}>Review</span>
                    <span style={{...styles.resultStatValue, color: '#f59e0b'}}>{selectedResult.review_chunks}</span>
                  </div>
                  <div style={styles.resultStat}>
                    <span style={styles.resultStatLabel}>Violations</span>
                    <span style={{...styles.resultStatValue, color: '#ef4444'}}>{selectedResult.violation_chunks}</span>
                  </div>
                </div>

                {selectedResult.violations && selectedResult.violations.length > 0 && (
                  <div style={styles.violationsSection}>
                    <h4 style={styles.violationsTitle}>Issues Found</h4>
                    {selectedResult.violations.map((violation, idx) => (
                      <div key={idx} style={styles.violationCard}>
                        <div style={styles.violationHeader}>
                          <span style={{
                            ...styles.violationBadge,
                            backgroundColor: violation.verdict === 'violation' ? '#fee2e2' : '#fef3c7',
                            color: violation.verdict === 'violation' ? '#991b1b' : '#92400e',
                          }}>
                            {violation.verdict.toUpperCase()}
                          </span>
                        </div>
                        <p style={styles.chunkText}>{violation.chunk_text}</p>
                        <p style={styles.explanation}>{violation.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedResult.final_verdict === 'pending' && (
                  <div style={styles.finalVerdictSection}>
                    <h4 style={styles.finalVerdictTitle}>Make Final Decision</h4>
                    {selectedResult.file_url && (
                      <a 
                        href={selectedResult.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.viewFileButton}
                      >
                        <FileText size={18} />
                        View Original File
                      </a>
                    )}
                    <div style={styles.verdictButtons}>
                      <button
                        onClick={() => {
                          handleFinalVerdict(selectedResult.id, 'approved');
                          setViewingFile(false);
                        }}
                        style={styles.approveButton}
                      >
                        <CheckCircle size={20} />
                        Approve as Clean
                      </button>
                      <button
                        onClick={() => {
                          handleFinalVerdict(selectedResult.id, 'rejected');
                          setViewingFile(false);
                        }}
                        style={styles.rejectButton}
                      >
                        <AlertCircle size={20} />
                        Reject as Violation
                      </button>
                    </div>
                  </div>
                )}

                {selectedResult.final_verdict !== 'pending' && (
                  <div style={styles.finalVerdictSection}>
                    <div style={{
                      ...styles.finalVerdictBadge,
                      backgroundColor: selectedResult.final_verdict === 'approved' ? '#d1fae5' : '#fee2e2',
                      color: selectedResult.final_verdict === 'approved' ? '#065f46' : '#991b1b',
                    }}>
                      {selectedResult.final_verdict === 'approved' ? (
                        <><CheckCircle size={20} /> Final Decision: Approved</>
                      ) : (
                        <><AlertCircle size={20} /> Final Decision: Rejected</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  navbarWrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '1rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  statIcon: {
    opacity: 0.9,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    fontWeight: '500',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  uploadArea: {
    border: '2px dashed #e5e7eb',
    borderRadius: '0.75rem',
    padding: '3rem 1rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    backgroundColor: '#fafafa',
  },
  uploadAreaClickable: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.75rem',
    padding: '3rem 1rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    backgroundColor: '#fef6e7',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  uploadText: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    margin: '0.5rem 0 0.25rem 0',
  },
  uploadHint: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    margin: 0,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    margin: 0,
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '1rem',
    transition: 'all 0.2s',
  },
  hiddenInput: {
    display: 'none',
  },
  fileCount: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    color: 'white',
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  dangerButtonSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.875rem 1.25rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  verdictBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  filename: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  resultStatLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  resultStatValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  violationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  violationCard: {
    padding: '1rem',
    backgroundColor: '#fafafa',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  violationHeader: {
    marginBottom: '0.75rem',
  },
  violationBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  chunkText: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  explanation: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  tabTitle: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  emptyStateText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#6b7280',
    margin: '1rem 0 0.5rem 0',
  },
  emptyStateHint: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    margin: 0,
  },
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  historyCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  historyFilename: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  historyVerdict: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  historyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  historyStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  historyStatLabel: {
    fontSize: '0.625rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  historyDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
};

export default Dashboard;