/**
 * 分期合同表单字段组件（共享）
 *
 * 用于创建和编辑分期合同
 * 支持双向计算和自动日期计算
 */

import { useEffect } from 'react';

export default function ContractFormFields({
  formData,
  installmentData,
  onFormChange,
  onInstallmentChange,
  mode = 'create', // 'create' 或 'edit'
}) {
  // 双向计算：当总金额或期数改变时，更新每期金额
  useEffect(() => {
    if (formData.amount && installmentData.periodCount) {
      const total = parseFloat(formData.amount);
      const count = parseInt(installmentData.periodCount);
      if (!isNaN(total) && !isNaN(count) && count > 0) {
        const perPeriod = total / count;
        const newPerPeriod = perPeriod.toFixed(2);

        // 只有当计算出的值与当前值不同时才更新，避免无限循环
        if (newPerPeriod !== installmentData.perPeriodAmount) {
          onInstallmentChange({
            ...installmentData,
            perPeriodAmount: newPerPeriod
          });
        }
      }
    }
  }, [formData.amount, installmentData.periodCount, installmentData.perPeriodAmount, installmentData, onInstallmentChange]);

  // 双向计算：当每期金额改变时，更新总金额
  const handlePerPeriodAmountChange = (value) => {
    const perPeriod = value;
    onInstallmentChange({
      ...installmentData,
      perPeriodAmount: perPeriod
    });

    // 如果有期数，自动计算总金额
    if (installmentData.periodCount && perPeriod) {
      const count = parseInt(installmentData.periodCount);
      const amount = parseFloat(perPeriod);
      if (!isNaN(count) && !isNaN(amount)) {
        const total = amount * count;
        onFormChange({
          ...formData,
          amount: total.toFixed(2)
        });
      }
    }
  };

  // 自动计算结束日期
  useEffect(() => {
    if (formData.date && installmentData.periodCount && installmentData.periodType) {
      const startDate = new Date(formData.date);
      const count = parseInt(installmentData.periodCount);

      if (!isNaN(count) && count > 0) {
        let endDate = new Date(startDate);

        if (installmentData.periodType === 'weekly') {
          // 每周：最后一期是开始日期 + (期数-1) × 7天，结束日期要再加1天
          // 例如：53期，第53期 = 开始日期 + 52周，结束日期 = 第53期 + 1天
          endDate.setDate(endDate.getDate() + (count - 1) * 7 + 1);
        } else if (installmentData.periodType === 'monthly') {
          // 每月：最后一期是开始日期 + (期数-1) 个月，结束日期要再加1天
          endDate.setMonth(endDate.getMonth() + (count - 1));
          endDate.setDate(endDate.getDate() + 1);
        }

        const newEndDate = endDate.toISOString().split('T')[0];

        // 只有当计算出的值与当前值不同时才更新，避免无限循环
        if (newEndDate !== installmentData.endDate) {
          onInstallmentChange({
            ...installmentData,
            endDate: newEndDate
          });
        }
      }
    }
  }, [formData.date, installmentData.periodCount, installmentData.periodType, installmentData.endDate, installmentData, onInstallmentChange]);

  return (
    <div style={styles.installmentFields}>
      {/* 第1行：分期方式 + 期数 + 扣费日 */}
      <div style={styles.compactRow}>
        <div style={styles.compactField}>
          <label style={styles.smallLabel}>分期方式 *</label>
          <select
            value={installmentData.periodType}
            onChange={(e) => onInstallmentChange({
              ...installmentData,
              periodType: e.target.value
            })}
            style={styles.smallSelect}
          >
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </select>
        </div>

        <div style={styles.compactField}>
          <label style={styles.smallLabel}>分期数 *</label>
          <input
            type="number"
            value={installmentData.periodCount}
            onChange={(e) => onInstallmentChange({
              ...installmentData,
              periodCount: e.target.value
            })}
            placeholder="52"
            min="1"
            style={styles.smallInput}
            required
          />
        </div>

        <div style={styles.compactField}>
          <label style={styles.smallLabel}>扣费日 *</label>
          {installmentData.periodType === 'weekly' ? (
            <select
              value={installmentData.dayOfWeek}
              onChange={(e) => onInstallmentChange({
                ...installmentData,
                dayOfWeek: e.target.value
              })}
              style={styles.smallSelect}
            >
              <option value="0">周一</option>
              <option value="1">周二</option>
              <option value="2">周三</option>
              <option value="3">周四</option>
              <option value="4">周五</option>
              <option value="5">周六</option>
              <option value="6">周日</option>
            </select>
          ) : (
            <select
              value={installmentData.dayOfMonth}
              onChange={(e) => onInstallmentChange({
                ...installmentData,
                dayOfMonth: e.target.value
              })}
              style={styles.smallSelect}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}号</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 第2行：总金额 ↔ 每期金额 */}
      <div style={styles.bidirectionalRow}>
        <div style={styles.bidirectionalField}>
          <label style={styles.smallLabel}>总金额 *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange({
              ...formData,
              amount: e.target.value
            })}
            placeholder="916.00"
            step="0.01"
            min="0"
            style={styles.smallInput}
            required
          />
        </div>

        <div style={styles.bidirectionalArrow}>↔</div>

        <div style={styles.bidirectionalField}>
          <label style={styles.smallLabel}>每期金额 *</label>
          <input
            type="number"
            value={installmentData.perPeriodAmount}
            onChange={(e) => handlePerPeriodAmountChange(e.target.value)}
            placeholder="17.62"
            step="0.01"
            min="0"
            style={styles.smallInput}
            required
          />
        </div>
      </div>

      {/* 第3行：开始日期 → 结束日期 */}
      <div style={styles.dateRow}>
        <div style={styles.dateField}>
          <label style={styles.smallLabel}>开始日期 *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onFormChange({
              ...formData,
              date: e.target.value
            })}
            style={styles.smallInput}
            required
          />
        </div>

        <div style={styles.dateArrow}>→</div>

        <div style={styles.dateField}>
          <label style={styles.smallLabel}>结束日期（自动）</label>
          <input
            type="date"
            value={installmentData.endDate}
            style={{ ...styles.smallInput, background: '#f9fafb', color: '#6b7280' }}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

// 样式
const styles = {
  installmentFields: {
    background: '#f9fafb',
    borderRadius: '6px',
    padding: '14px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  compactRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  compactField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bidirectionalRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
  },
  bidirectionalField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bidirectionalArrow: {
    fontSize: '20px',
    color: '#3b82f6',
    fontWeight: 'bold',
    paddingBottom: '6px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
  },
  dateField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateArrow: {
    fontSize: '20px',
    color: '#10b981',
    fontWeight: 'bold',
    paddingBottom: '6px',
  },
  smallLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
  },
  smallInput: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
  },
  smallSelect: {
    padding: '6px 28px 6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
};
