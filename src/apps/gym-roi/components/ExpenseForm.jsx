/**
 * 支出录入表单组件
 *
 * 用于添加新的健身房支出记录
 */

import { useState } from 'react';
import api from '../api/client';

export default function ExpenseForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'membership',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // 今天
    currency: 'NZD',
    note: '',
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

      // 转换数据类型
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      await api.expenses.create(data);

      // 清空表单
      setFormData({
        type: 'membership',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'NZD',
        note: '',
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
      <h3 style={styles.title}>📝 添加支出</h3>

      {error && (
        <div style={styles.error}>
          ❌ {error}
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

        {/* 金额 */}
        <div style={styles.field}>
          <label style={styles.label}>金额 *</label>
          <div style={styles.amountContainer}>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              style={styles.input}
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
          </div>
        </div>

        {/* 日期 */}
        <div style={styles.field}>
          <label style={styles.label}>日期 *</label>
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
          {loading ? '添加中...' : '✅ 添加支出'}
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
    padding: '20px',  // 减小 padding
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    border: '1px solid #dadce0',
    height: 'fit-content',
  },
  title: {
    fontSize: '16px',  // 减小标题
    fontWeight: '500',
    marginBottom: '16px',  // 减小间距
    color: '#202124',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',  // 减小间距
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',  // 减小字号
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '8px 10px',  // 减小 padding
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',  // 减小字号
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
  amountContainer: {
    display: 'flex',
    gap: '8px',
  },
  currencySelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    minWidth: '80px',
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
