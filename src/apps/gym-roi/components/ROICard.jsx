/**
 * ROI 进度卡片组件
 *
 * 显示健身房回本进度的核心数据：
 * - 总支出
 * - 当前活动次数
 * - 平均单次成本
 * - ROI 百分比
 * - 回本进度条
 *
 * v3.0: 支持双重 ROI 显示（已付 vs 计划）
 */

import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ROICard() {
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [displayMode, setDisplayMode] = useState('paid'); // 'paid' 或 'planned'

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
  const calculateBreakEvenProgress = (roiStats) => {
    if (!roiStats) return 0;

    const { total_expense, roi_percentage } = roiStats;

    // 回本目标：ROI >= 0%
    // 进度计算：min(100, (roi + 100) / 100 * 100)
    // roi = -80 -> progress = 20%
    // roi = 0 -> progress = 100%
    const progress = Math.min(100, Math.max(0, ((roi_percentage + 100) / 100) * 100));

    return progress;
  };

  // 计算还需多少次才能回本
  const calculateRemainingActivities = (roiStats) => {
    if (!roiData || !roiStats) return 0;

    const { total_expense, average_cost } = roiStats;
    const { weighted_total, market_reference_price } = roiData;

    // 回本目标：total_expense / weighted_total <= market_price
    // 即：weighted_total >= total_expense / market_price
    const targetActivities = total_expense / market_reference_price;
    const remaining = targetActivities - weighted_total;

    return Math.max(remaining, 0);
  };

  // 开始编辑市场价
  const startEditPrice = () => {
    setEditingPrice(true);
    setNewPrice(roiData.market_reference_price.toString());
  };

  // 取消编辑
  const cancelEditPrice = () => {
    setEditingPrice(false);
    setNewPrice('');
  };

  // 保存市场价
  const savePrice = async () => {
    try {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price <= 0) {
        alert('请输入有效的价格');
        return;
      }

      await api.roi.updateMarketPrice(price);
      setEditingPrice(false);
      setNewPrice('');
      loadROIData(); // 重新加载 ROI 数据
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
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
          加载失败: {error}
          <button onClick={loadROIData} style={styles.retryButton}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!roiData) return null;

  // 根据当前模式选择数据
  const currentStats = roiData[displayMode];
  const progress = calculateBreakEvenProgress(currentStats);
  const remaining = calculateRemainingActivities(currentStats);
  const isBreakEven = currentStats.roi_percentage >= 0;

  return (
    <div style={styles.card}>
      {/* 标题 + 模式切换 */}
      <div style={styles.header}>
        <h2 style={styles.title}>回本进度</h2>
        <div style={styles.modeToggle}>
          <button
            onClick={() => setDisplayMode('paid')}
            style={{
              ...styles.modeButton,
              ...(displayMode === 'paid' ? styles.modeButtonActive : {})
            }}
          >
            已付
          </button>
          <button
            onClick={() => setDisplayMode('planned')}
            style={{
              ...styles.modeButton,
              ...(displayMode === 'planned' ? styles.modeButtonActive : {})
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
            {roiData.weighted_total.toFixed(1)}
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

        <div style={styles.metric} className="market-price-metric">
          <div style={styles.metricLabel}>市场价</div>
          {editingPrice ? (
            <div style={styles.priceEditRow}>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                style={styles.priceInput}
                step="0.01"
                autoFocus
              />
              <button onClick={savePrice} style={styles.priceSaveBtn}>✓</button>
              <button onClick={cancelEditPrice} style={styles.priceCancelBtn}>×</button>
            </div>
          ) : (
            <div style={styles.priceDisplayRow}>
              <div style={styles.metricValue}>
                ${roiData.market_reference_price.toFixed(2)}
                <span style={styles.metricUnit}>/次</span>
              </div>
              <button
                onClick={startEditPrice}
                style={styles.editPriceBtn}
                title="编辑市场价"
                className="edit-price-btn"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 刷新按钮 */}
      <button onClick={loadROIData} style={styles.refreshButton}>
        刷新数据
      </button>

      <style>{`
        .market-price-metric .edit-price-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .market-price-metric:hover .edit-price-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// 样式 - Google News 风格
const styles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    border: '1px solid #dadce0',
  },
  // 标题 + 模式切换
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#202124',
    margin: 0,
  },
  modeToggle: {
    display: 'flex',
    gap: '4px',
    background: '#f1f3f4',
    borderRadius: '4px',
    padding: '2px',
  },
  modeButton: {
    padding: '4px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    background: 'white',
    color: '#1a73e8',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
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
    marginBottom: '16px',
  },
  metric: {
    textAlign: 'center',
    padding: '12px 8px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dadce0',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#5f6368',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: '18px',
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
    padding: '8px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
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
  // 市场价编辑
  priceDisplayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  priceEditRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  editPriceBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInput: {
    width: '60px',
    padding: '4px 6px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
  },
  priceSaveBtn: {
    padding: '2px 8px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  priceCancelBtn: {
    padding: '2px 8px',
    background: '#f8f9fa',
    color: '#5f6368',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '18px',
    cursor: 'pointer',
    lineHeight: 1,
  },
};
