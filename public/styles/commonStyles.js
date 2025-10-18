/**
 * 通用样式定义 - Flat Design (扁平化设计)
 *
 * 所有组件共享的基础样式，确保设计一致性
 * 特点：无阴影、无边框、简约扁平
 */

// ========================================
// 基础容器样式
// ========================================

export const baseCard = {
  background: 'white',
  borderRadius: '8px',
  padding: '20px',
  // 扁平化设计：无阴影、无边框
};

export const baseMetric = {
  textAlign: 'center',
  padding: '12px 8px',
  background: '#f8f9fa',
  borderRadius: '8px',
  minHeight: '80px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  // 扁平化设计：无边框
};

// ========================================
// 文字样式
// ========================================

export const typography = {
  title: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#202124',
    margin: 0,
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
};

// ========================================
// 按钮样式
// ========================================

export const buttons = {
  primary: {
    padding: '8px 16px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondary: {
    padding: '8px 16px',
    background: '#f8f9fa',
    color: '#5f6368',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  danger: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

// ========================================
// 表单样式
// ========================================

export const form = {
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#5f6368',
    marginBottom: '4px',
  },
};

// ========================================
// 布局样式
// ========================================

export const layout = {
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
};

// ========================================
// 状态样式
// ========================================

export const states = {
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
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af',
    fontSize: '16px',
  },
};

// ========================================
// 颜色主题
// ========================================

export const colors = {
  primary: '#1a73e8',
  secondary: '#5f6368',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8f9fa',
  border: '#dadce0',
  text: {
    primary: '#202124',
    secondary: '#5f6368',
    tertiary: '#9ca3af',
  },
};
