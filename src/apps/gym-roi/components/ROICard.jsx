/**
 * ROI 进度卡片组件
 *
 * 显示健身房回本进度的核心数据：
 * - 总支出
 * - 当前活动次数
 * - 平均单次成本
 * - ROI 百分比
 * - 回本进度条
 */

import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ROICard() {
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载 ROI 数据
  useEffect(() => {
    loadROIData();
  }, []);

  const loadROIData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.roi.getSummary();
      setRoiData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 计算回本进度
  const calculateBreakEvenProgress = () => {
    if (!roiData) return 0;

    const { total_expense, weighted_total, market_reference_price } = roiData;

    // 回本目标：total_expense / weighted_total <= market_price
    // 即：weighted_total >= total_expense / market_price
    const targetActivities = total_expense / market_reference_price;
    const progress = (weighted_total / targetActivities) * 100;

    return Math.min(progress, 100); // 最大 100%
  };

  // 计算还需多少次才能回本
  const calculateRemainingActivities = () => {
    if (!roiData) return 0;

    const { total_expense, weighted_total, market_reference_price } = roiData;
    const targetActivities = total_expense / market_reference_price;
    const remaining = targetActivities - weighted_total;

    return Math.max(remaining, 0);
  };

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.error}>
          ❌ 加载失败: {error}
          <button onClick={loadROIData} style={styles.retryButton}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!roiData) return null;

  const progress = calculateBreakEvenProgress();
  const remaining = calculateRemainingActivities();
  const isBreakEven = roiData.roi_percentage >= 0;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>💰 回本进度</h2>

      {/* ROI 状态 */}
      <div style={styles.roiStatus}>
        <div style={{
          ...styles.roiPercentage,
          color: isBreakEven ? '#10b981' : '#ef4444'
        }}>
          {isBreakEven ? '✅' : '⏳'} ROI: {roiData.roi_percentage.toFixed(1)}%
        </div>
        <div style={styles.roiMessage}>
          {isBreakEven
            ? '🎉 恭喜回本！'
            : `还需 ${remaining.toFixed(1)} 次（加权）`
          }
        </div>
      </div>

      {/* 进度条 */}
      <div style={styles.progressContainer}>
        <div style={{
          ...styles.progressBar,
          width: `${progress}%`,
          background: isBreakEven
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
        }}>
          <span style={styles.progressText}>
            {progress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 关键指标 */}
      <div style={styles.metrics}>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>总支出</div>
          <div style={styles.metricValue}>
            ${roiData.total_expense.toFixed(2)}
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>活动次数</div>
          <div style={styles.metricValue}>
            {roiData.weighted_total.toFixed(1)}
            <span style={styles.metricUnit}>（加权）</span>
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>平均成本</div>
          <div style={styles.metricValue}>
            ${roiData.average_cost.toFixed(2)}
            <span style={styles.metricUnit}>/次</span>
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>市场价</div>
          <div style={styles.metricValue}>
            ${roiData.market_reference_price.toFixed(2)}
            <span style={styles.metricUnit}>/次</span>
          </div>
        </div>
      </div>

      {/* 刷新按钮 */}
      <button onClick={loadROIData} style={styles.refreshButton}>
        🔄 刷新数据
      </button>
    </div>
  );
}

// 样式 - Google News 风格
const styles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',  // 减小 padding
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    border: '1px solid #dadce0',
  },
  title: {
    fontSize: '16px',  // 减小标题
    fontWeight: '500',
    marginBottom: '16px',  // 减小间距
    color: '#202124',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  roiStatus: {
    textAlign: 'center',
    marginBottom: '16px',  // 减小间距
  },
  roiPercentage: {
    fontSize: '36px',  // 减小字号
    fontWeight: '400',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  roiMessage: {
    fontSize: '14px',  // 减小字号
    color: '#5f6368',
  },
  progressContainer: {
    background: '#e8eaed',
    borderRadius: '4px',
    height: '6px',  // 减小高度
    marginBottom: '16px',  // 减小间距
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: '4px',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    right: '-50px',
    top: '-20px',
    color: '#5f6368',
    fontWeight: '500',
    fontSize: '13px',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',  // 减小间距
    marginBottom: '16px',  // 减小间距
  },
  metric: {
    textAlign: 'center',
    padding: '12px 8px',  // 减小 padding
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dadce0',
  },
  metricLabel: {
    fontSize: '11px',  // 减小字号
    color: '#5f6368',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: '18px',  // 减小字号
    fontWeight: '500',
    color: '#202124',
  },
  metricUnit: {
    fontSize: '15px',
    fontWeight: 'normal',
    color: '#9ca3af',
    marginLeft: '4px',
  },
  refreshButton: {
    width: '100%',
    padding: '8px',  // 减小 padding
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',  // 减小字号
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textTransform: 'none',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '18px',
  },
  error: {
    textAlign: 'center',
    padding: '60px',
    color: '#ef4444',
    fontSize: '18px',
  },
  retryButton: {
    marginTop: '16px',
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};
