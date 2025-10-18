/**
 * 活动录入表单组件
 *
 * 用于添加新的健身活动记录
 * 自动调用后端计算权重
 */

import { useState } from 'react';
import api from '../api/client';

export default function ActivityForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'swimming',
    distance: '',
    date: new Date().toISOString().split('T')[0], // 今天
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastWeight, setLastWeight] = useState(null);

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
    if (!formData.distance || formData.distance <= 0) {
      setError('请输入有效距离');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 转换数据类型
      const data = {
        ...formData,
        distance: parseInt(formData.distance),
      };

      const result = await api.activities.create(data);

      // 显示计算结果
      setLastWeight(result.calculated_weight);

      // 清空表单
      setFormData({
        type: 'swimming',
        distance: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });

      // 通知父组件
      if (onSuccess) onSuccess();

      // 3秒后隐藏成功提示
      setTimeout(() => setLastWeight(null), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 根据距离给出提示
  const getDistanceHint = () => {
    const distance = parseInt(formData.distance);
    if (!distance) return null;

    if (distance < 1000) {
      return { text: '少于基准，权重会降低', color: '#f59e0b' };
    } else if (distance === 1000) {
      return { text: '基准距离，权重 1.0', color: '#10b981' };
    } else if (distance <= 1500) {
      return { text: '不错！权重会增加', color: '#10b981' };
    } else {
      return { text: '很棒！但边际收益递减', color: '#3b82f6' };
    }
  };

  const hint = getDistanceHint();

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>添加活动</h3>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {lastWeight && (
        <div style={styles.success}>
          添加成功！权重: <strong>{lastWeight}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* 活动类型 */}
        <div style={styles.field}>
          <label style={styles.label}>活动类型 *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="swimming">游泳</option>
          </select>
          <div style={styles.helpText}>
            MVP 阶段仅支持游泳，未来会添加团课、私教等
          </div>
        </div>

        {/* 游泳距离 */}
        <div style={styles.field}>
          <label style={styles.label}>游泳距离 (米) *</label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            placeholder="1000"
            step="50"
            min="0"
            style={styles.input}
            required
          />
          {hint && (
            <div style={{ ...styles.hint, color: hint.color }}>
              {hint.text}
            </div>
          )}
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
            placeholder="状态、感受等..."
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
          {loading ? '添加中...' : '添加活动'}
        </button>
      </form>

      {/* 权重说明 */}
      <div style={styles.weightInfo}>
        <div style={styles.weightTitle}>权重计算规则</div>
        <ul style={styles.weightList}>
          <li>基准距离：1000m = 权重 1.0</li>
          <li>少于基准：权重降低（高斯惩罚）</li>
          <li>多于基准：权重增加（对数奖励）</li>
          <li>示例：1100m ≈ 1.10, 1500m ≈ 1.41, 2000m ≈ 1.69</li>
        </ul>
      </div>
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
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  hint: {
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px',
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
  success: {
    padding: '12px',
    background: '#e6f4ea',
    color: '#137333',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '13px',
    border: '1px solid #ceead6',
  },
  weightInfo: {
    marginTop: '20px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  weightTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  weightList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
  },
};
