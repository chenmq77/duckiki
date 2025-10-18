/**
 * ROI 进度卡片组件 - 只读版本
 *
 * 从静态数据展示健身房回本进度
 */
import { useState } from 'react';
import { baseCard, baseMetric, typography } from '../styles/commonStyles';

export default function ROICardReadOnly({ roiData }) {
  const [mode, setMode] = useState('paid'); // 'paid' 或 'planned'

  if (!roiData) return null;

  const { paid, planned, weighted_total, market_reference_price } = roiData;

  // 计算回本进度
  const calculateBreakEvenProgress = (roiStats) => {
    if (!roiStats) return 0;
    const { roi_percentage } = roiStats;
    const progress = Math.min(100, Math.max(0, ((roi_percentage + 100) / 100) * 100));
    return progress;
  };

  // 计算还需多少次才能回本
  const calculateRemainingActivities = (roiStats) => {
    if (!roiStats) return 0;
    const { total_expense } = roiStats;
    const targetActivities = total_expense / market_reference_price;
    const remaining = targetActivities - weighted_total;
    return Math.max(remaining, 0);
  };

  const currentStats = mode === 'paid' ? paid : planned;
  const progress = calculateBreakEvenProgress(currentStats);
  const remaining = calculateRemainingActivities(currentStats);
  const isBreakEven = currentStats.roi_percentage > 0;

  return (
    <div style={styles.card}>
      {/* 标题和切换按钮 */}
      <div style={styles.header}>
        <h2 style={styles.title}>回本进度</h2>
        <div style={styles.toggleContainer}>
          <button
            onClick={() => setMode('paid')}
            style={{
              ...styles.toggleButton,
              ...(mode === 'paid' ? styles.toggleButtonActive : {}),
            }}
          >
            已付
          </button>
          <button
            onClick={() => setMode('planned')}
            style={{
              ...styles.toggleButton,
              ...(mode === 'planned' ? styles.toggleButtonActive : {}),
            }}
          >
            计划
          </button>
        </div>
      </div>

      {/* ROI 状态 */}
      <div style={styles.roiStatus}>
        <div style={{
          ...styles.roiPercentage,
          color: isBreakEven ? '#10b981' : '#ef4444'
        }}>
          ROI: {currentStats.roi_percentage.toFixed(1)}%
        </div>
        <div style={styles.roiMessage}>
          {isBreakEven
            ? '恭喜回本！'
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
            ${currentStats.total_expense.toFixed(2)}
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>活动次数</div>
          <div style={styles.metricValue}>
            {weighted_total.toFixed(1)}
            <span style={styles.metricUnit}>（加权）</span>
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>平均成本</div>
          <div style={styles.metricValue}>
            ${currentStats.average_cost.toFixed(2)}
            <span style={styles.metricUnit}>/次</span>
          </div>
        </div>

        <div style={styles.metric}>
          <div style={styles.metricLabel}>市场价</div>
          <div style={styles.metricValue}>
            ${market_reference_price.toFixed(2)}
            <span style={styles.metricUnit}>/次</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 样式 - Flat Design (扁平化设计)
const styles = {
  card: baseCard,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: typography.title,
  toggleContainer: {
    display: 'flex',
    gap: '0',
    background: '#f1f3f4',
    borderRadius: '6px',
    padding: '4px',
  },
  toggleButton: {
    padding: '6px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '400',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleButtonActive: {
    background: 'white',
    color: '#1a73e8',
    fontWeight: '500',
  },
  roiStatus: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  roiPercentage: {
    fontSize: '36px',
    fontWeight: '400',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  roiMessage: {
    fontSize: '14px',
    color: '#5f6368',
  },
  progressContainer: {
    background: '#e8eaed',
    borderRadius: '4px',
    height: '6px',
    marginBottom: '16px',
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
    gap: '12px',
  },
  metric: baseMetric,
  metricLabel: typography.metricLabel,
  metricValue: typography.metricValue,
  metricUnit: typography.metricUnit,
};
