import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Cpu,
  BarChart3,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Server
} from 'lucide-react';

export default function AuditLogPage() {
  const [logsData, setLogsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAILogs();
      if (res.success) {
        setLogsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading && !logsData) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading AI gateway audit logs...</p>
      </div>
    );
  }

  const { stats, logs } = logsData || { stats: {}, logs: [] };

  return (
    <div className="main-content">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-primary">Admin Control Center</span>
              <span className="badge badge-info">Zero-PII Compliance</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>AI Gateway Transparency & Audit Log</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Real-time audit telemetry tracking LLM model invocations, latency, tokens, and fallback engine triggers.
            </p>
          </div>

          <button onClick={fetchLogs} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total AI Invocations</span>
              <Cpu size={18} color="var(--primary-light)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalCalls}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gateway throughput</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Average Latency</span>
              <Clock size={18} color="var(--accent-teal)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
              {stats.avgLatencyMs} ms
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Response benchmark</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Tokens Synthesized</span>
              <Zap size={18} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
              {stats.totalTokens}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cost control managed</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Fallback Engine Ratio</span>
              <Shield size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
              {stats.fallbackRate}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>100% Zero-crash uptime</div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Server size={18} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Telemetry Event Stream</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>TIME</th>
                  <th style={{ padding: '0.75rem 1rem' }}>ENDPOINT</th>
                  <th style={{ padding: '0.75rem 1rem' }}>ACTIVE MODEL</th>
                  <th style={{ padding: '0.75rem 1rem' }}>LATENCY</th>
                  <th style={{ padding: '0.75rem 1rem' }}>TOKENS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>MODE</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SANITIZED CONTEXT (PII STRIPPED)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {log.endpoint}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--primary-light)' }}>
                      {log.model}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-teal)' }}>
                      {log.latency_ms} ms
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {log.tokens_count}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {log.is_fallback ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          Offline Fallback
                        </span>
                      ) : (
                        <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                          Cloud LLM
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.prompt_sanitized}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
