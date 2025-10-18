/**
 * 支出录入表单组件
 *
 * 用于添加新的健身房支出记录
 * 支持全额支付和分期付款两种模式
 */

import { useState, useEffect } from 'react';
import api from '../api/client';
import ContractFormFields from './ContractFormFields';

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
    periodType: 'weekly',  // 'weekly' 或 'monthly'
    periodCount: '',       // 分期数
    perPeriodAmount: '',   // 每期金额
    dayOfWeek: 0,          // 每周: 0=周一, 6=周日
    dayOfMonth: 1,         // 每月: 1-28号
    endDate: '',           // 自动计算的结束日期
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 智能默认值：当选择会员类型时，自动填充分期参数
    if (name === 'category' && formData.type === 'membership' && paymentMode === 'installment') {
      applyMembershipDefaults(value);
    }
  };

  // 应用会员类型的智能默认值
  const applyMembershipDefaults = (membershipType) => {
    const defaults = {
      '年卡': { periodType: 'weekly', periodCount: 52 },
      '季卡': { periodType: 'weekly', periodCount: 13 },
      '月卡': { periodType: 'weekly', periodCount: 4 },
      '周卡': {}, // 留空
      '次卡': {}, // 留空
      '其他': {}, // 留空
    };

    const config = defaults[membershipType];
    if (config && Object.keys(config).length > 0) {
      setInstallmentData(prev => ({
        ...prev,
        periodType: config.periodType,
        periodCount: config.periodCount,
      }));
    } else {
      // 清空默认值
      setInstallmentData(prev => ({
        ...prev,
        periodCount: '',
        perPeriodAmount: '',
      }));
    }
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
        if (!installmentData.perPeriodAmount || installmentData.perPeriodAmount <= 0) {
          setError('请输入有效的每期金额');
          setLoading(false);
          return;
        }
        if (!installmentData.periodCount || installmentData.periodCount <= 0) {
          setError('请输入有效的期数');
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
          period_amount: parseFloat(installmentData.perPeriodAmount),
          period_type: installmentData.periodType,  // 'weekly' 或 'monthly'
          currency: formData.currency,
          day_of_week: installmentData.periodType === 'weekly' ? parseInt(installmentData.dayOfWeek) : null,
          day_of_month: installmentData.periodType === 'monthly' ? parseInt(installmentData.dayOfMonth) : null,
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
        periodType: 'weekly',
        periodCount: '',
        perPeriodAmount: '',
        dayOfWeek: 0,
        dayOfMonth: 1,
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
            <option value="equipment">运动装备</option>
            <option value="additional">附加消费</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 分类 - 会员费显示下拉框，其他类型显示文本输入 */}
        <div style={styles.field}>
          <label style={styles.label}>分类</label>
          {formData.type === 'membership' ? (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">请选择会员类型</option>
              <option value="年卡">年卡</option>
              <option value="季卡">季卡</option>
              <option value="月卡">月卡</option>
              <option value="周卡">周卡</option>
              <option value="次卡">次卡</option>
              <option value="其他">其他</option>
            </select>
          ) : (
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="如：游泳装备、能量棒等"
              style={styles.input}
            />
          )}
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

        {/* 分期付款额外字段 */}
        {paymentMode === 'installment' && (
          <ContractFormFields
            formData={formData}
            installmentData={installmentData}
            onFormChange={setFormData}
            onInstallmentChange={setInstallmentData}
            mode="create"
          />
        )}

        {/* 日期（仅全额模式显示，分期模式已在上面） */}
        {paymentMode === 'full' && (
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
        )}

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
    // boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    // border: '1px solid #dadce0',
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
    padding: '10px 32px 10px 12px',
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
    padding: '8px 28px 8px 10px',
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
