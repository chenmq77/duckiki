/**
 * 支出录入表单组件
 *
 * 用于添加新的健身房支出记录
 * 支持全额支付和分期付款两种模式
 */

import { useState } from 'react';
import api from '../api/client';

export default function ExpenseForm({ onSuccess }) {
  // 支付模式：full = 全额，installment = 分期
  const [paymentMode, setPaymentMode] = useState('full');

  // 全额支付表单数据
  const [formData, setFormData] = useState({
    type: 'membership',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // 今天
    currency: 'NZD',
    note: '',
  });

  // 分期付款额外字段
  const [installmentData, setInstallmentData] = useState({
    weeklyAmount: '',
    dayOfWeek: 0,  // 0=周一
    endDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInstallmentChange = (e) => {
    const { name, value } = e.target;
    setInstallmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.amount || formData.amount <= 0) {
      setError('请输入有效金额');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (paymentMode === 'full') {
        // 全额支付：调用 expenses API
        const data = {
          ...formData,
          amount: parseFloat(formData.amount),
        };
        await api.expenses.create(data);

      } else {
        // 分期付款：调用 contracts API
        if (!installmentData.weeklyAmount || installmentData.weeklyAmount <= 0) {
          setError('请输入有效的每周金额');
          setLoading(false);
          return;
        }
        if (!installmentData.endDate) {
          setError('请选择截止日期');
          setLoading(false);
          return;
        }

        const contractData = {
          type: formData.type,
          category: formData.category,
          total_amount: parseFloat(formData.amount),
          weekly_amount: parseFloat(installmentData.weeklyAmount),
          currency: formData.currency,
          day_of_week: parseInt(installmentData.dayOfWeek),
          start_date: formData.date,
          end_date: installmentData.endDate,
          note: formData.note,
        };

        await api.contracts.create(contractData);
      }

      // 清空表单
      setFormData({
        type: 'membership',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'NZD',
        note: '',
      });
      setInstallmentData({
        weeklyAmount: '',
        dayOfWeek: 0,
        endDate: '',
      });

      // 通知父组件
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>添加支出</h3>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* 支出类型 */}
        <div style={styles.field}>
          <label style={styles.label}>支出类型 *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="membership">会员费</option>
            <option value="equipment">固定资产</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 分类 */}
        <div style={styles.field}>
          <label style={styles.label}>分类</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="如：年卡、游泳装备等"
            style={styles.input}
          />
        </div>

        {/* 金额 + 支付模式切换 */}
        <div style={styles.field}>
          <label style={styles.label}>金额 *</label>
          <div style={styles.amountRow}>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              style={styles.amountInput}
              required
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={styles.currencySelect}
            >
              <option value="NZD">NZD</option>
              <option value="RMB">RMB</option>
              <option value="USD">USD</option>
            </select>

            {/* 支付模式切换 */}
            <div style={styles.paymentModeToggle}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="full"
                  checked={paymentMode === 'full'}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={styles.radio}
                />
                <span>全额</span>
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="installment"
                  checked={paymentMode === 'installment'}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={styles.radio}
                />
                <span>分期</span>
              </label>
            </div>
          </div>
        </div>

        {/* 分期付款额外字段（仅在分期模式下显示） */}
        {paymentMode === 'installment' && (
          <div style={styles.installmentFields}>
            <div style={styles.installmentRow}>
              <div style={styles.installmentField}>
                <label style={styles.smallLabel}>每周金额 *</label>
                <input
                  type="number"
                  name="weeklyAmount"
                  value={installmentData.weeklyAmount}
                  onChange={handleInstallmentChange}
                  placeholder="17.00"
                  step="0.01"
                  min="0"
                  style={styles.smallInput}
                  required={paymentMode === 'installment'}
                />
              </div>

              <div style={styles.installmentField}>
                <label style={styles.smallLabel}>扣费日 *</label>
                <select
                  name="dayOfWeek"
                  value={installmentData.dayOfWeek}
                  onChange={handleInstallmentChange}
                  style={styles.smallSelect}
                  required={paymentMode === 'installment'}
                >
                  <option value="0">周一</option>
                  <option value="1">周二</option>
                  <option value="2">周三</option>
                  <option value="3">周四</option>
                  <option value="4">周五</option>
                  <option value="5">周六</option>
                  <option value="6">周日</option>
                </select>
              </div>

              <div style={styles.installmentField}>
                <label style={styles.smallLabel}>截止日期 *</label>
                <input
                  type="date"
                  name="endDate"
                  value={installmentData.endDate}
                  onChange={handleInstallmentChange}
                  style={styles.smallInput}
                  required={paymentMode === 'installment'}
                />
              </div>
            </div>
          </div>
        )}

        {/* 日期 */}
        <div style={styles.field}>
          <label style={styles.label}>
            {paymentMode === 'full' ? '日期 *' : '开始日期 *'}
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {/* 备注 */}
        <div style={styles.field}>
          <label style={styles.label}>备注</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="补充说明..."
            rows="2"
            style={styles.textarea}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '添加中...' : (paymentMode === 'full' ? '添加支出' : '创建分期合同')}
        </button>
      </form>
    </div>
  );
}

// 样式 - Google News 风格
const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    border: '1px solid #dadce0',
    height: 'fit-content',
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#202124',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },
  // 金额行（包含金额、货币、支付模式）
  amountRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  },
  currencySelect: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    minWidth: '70px',
  },
  // 支付模式切换按钮组
  paymentModeToggle: {
    display: 'flex',
    gap: '12px',
    marginLeft: '8px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#374151',
    cursor: 'pointer',
  },
  radio: {
    cursor: 'pointer',
  },
  // 分期付款额外字段
  installmentFields: {
    background: '#f9fafb',
    borderRadius: '6px',
    padding: '12px',
    border: '1px solid #e5e7eb',
  },
  installmentRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  installmentField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  submitButton: {
    padding: '10px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '8px',
    cursor: 'pointer',
  },
  error: {
    padding: '12px',
    background: '#fce8e6',
    color: '#d93025',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '13px',
    border: '1px solid #f4c7c3',
  },
};
