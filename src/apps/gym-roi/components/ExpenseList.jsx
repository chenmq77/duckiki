/**
 * 支出列表组件
 *
 * 展示所有支出记录，支持 inline 编辑和删除操作
 * 支持分期合同的父子显示
 */

import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ExpenseList({ refreshTrigger, onDelete }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // 加载支出列表
  useEffect(() => {
    loadExpenses();
  }, [refreshTrigger]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.expenses.getAll();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑
  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditData({
      amount: expense.amount,
      date: expense.date,
      category: expense.category || '',
      note: expense.note || '',
    });
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // 保存编辑
  const saveEdit = async (id) => {
    try {
      const updated = await api.expenses.update(id, editData);
      setExpenses(prev => prev.map(item => item.id === id ? updated : item));
      setEditingId(null);
      setEditData({});
      if (onDelete) onDelete(); // 刷新 ROI
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
  };

  // 删除支出
  const handleDelete = async (id, expense) => {
    // 如果是分期合同父支出，提示会删除所有关联记录
    if (expense.is_installment && !expense.parent_expense_id) {
      if (!window.confirm('删除分期合同将删除所有相关扣费记录，确定继续吗？')) {
        return;
      }
    } else {
      if (!window.confirm('确定要删除这条支出记录吗？')) {
        return;
      }
    }

    try {
      await api.expenses.delete(id);
      setExpenses(prev => prev.filter(item => item.id !== id));
      if (onDelete) onDelete();
    } catch (err) {
      alert(`删除失败: ${err.message}`);
    }
  };

  // 格式化类型
  const formatType = (type) => {
    const typeMap = {
      'membership': '会员费',
      'equipment': '固定资产',
      'other': '其他',
    };
    return typeMap[type] || type;
  };

  // 计算分期信息（第几期）
  const getInstallmentInfo = (expense) => {
    if (!expense.parent_expense_id) return null;

    // 在所有支出中找到同一父支出的子支出
    const siblings = expenses.filter(e => e.parent_expense_id === expense.parent_expense_id);
    // 按日期排序
    siblings.sort((a, b) => new Date(a.date) - new Date(b.date));
    // 找到当前支出的序号
    const index = siblings.findIndex(e => e.id === expense.id);

    return index >= 0 ? index + 1 : null;
  };

  // 格式化显示名称
  const formatDisplayName = (expense) => {
    if (expense.is_installment && !expense.parent_expense_id) {
      // 分期合同父支出
      const childrenCount = expenses.filter(e => e.parent_expense_id === expense.id).length;
      return `${expense.category || '分期合同'} (共${childrenCount}期)`;
    } else if (expense.parent_expense_id) {
      // 分期子支出
      const installmentNum = getInstallmentInfo(expense);
      const parent = expenses.find(e => e.id === expense.parent_expense_id);
      const parentCategory = parent?.category || '分期';
      return `${parentCategory} - 第${installmentNum}期`;
    } else {
      // 普通全额支出
      return expense.category || formatType(expense.type);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>支出记录</h3>
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>支出记录</h3>
        <div style={styles.error}>加载失败: {error}</div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>支出记录</h3>
        <div style={styles.empty}>暂无支出记录</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>支出记录 ({expenses.length})</h3>

      <div style={styles.list}>
        {expenses.map((expense) => {
          const isEditing = editingId === expense.id;
          const displayName = formatDisplayName(expense);

          return (
            <div key={expense.id} style={styles.item} className="expense-item">
              {isEditing ? (
                // 编辑模式
                <div style={styles.editRow}>
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                    style={styles.editInput}
                    placeholder="金额"
                    step="0.01"
                  />
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    style={styles.editInput}
                  />
                  <input
                    type="text"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    style={styles.editInput}
                    placeholder="分类"
                  />
                  <input
                    type="text"
                    value={editData.note}
                    onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                    style={styles.editInput}
                    placeholder="备注"
                  />
                  <div style={styles.editActions}>
                    <button onClick={() => saveEdit(expense.id)} style={styles.saveButton}>
                      保存
                    </button>
                    <button onClick={cancelEdit} style={styles.cancelButton}>
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                // 显示模式 - 单行布局
                <div style={styles.displayRow}>
                  <span style={styles.type}>{formatType(expense.type)}</span>
                  <span style={{
                    ...styles.category,
                    fontWeight: expense.is_installment && !expense.parent_expense_id ? '600' : 'normal'
                  }}>
                    {displayName}
                  </span>
                  <span style={styles.amount}>
                    ${expense.amount.toFixed(2)} {expense.currency}
                  </span>
                  <span style={styles.date}>{new Date(expense.date).toLocaleDateString('zh-CN')}</span>
                  {expense.note && <span style={styles.note}>{expense.note}</span>}

                  <div style={styles.actions}>
                    <button
                      onClick={() => startEdit(expense)}
                      style={styles.iconButton}
                      title="编辑"
                      className="edit-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id, expense)}
                      style={styles.iconButton}
                      title="删除"
                      className="delete-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .expense-item .edit-btn,
        .expense-item .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .expense-item:hover .edit-btn,
        .expense-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
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
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#202124',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e8eaed',
    transition: 'background 0.2s',
  },
  // 显示模式 - 单行布局
  displayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
  },
  type: {
    color: '#5f6368',
    fontWeight: '500',
    minWidth: '60px',
  },
  category: {
    fontSize: '13px',
    color: '#202124',
    minWidth: '120px',
  },
  amount: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#202124',
    minWidth: '100px',
  },
  date: {
    fontSize: '12px',
    color: '#5f6368',
    minWidth: '90px',
  },
  note: {
    fontSize: '12px',
    color: '#5f6368',
    fontStyle: 'italic',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // 操作按钮区域
  actions: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background 0.2s, color 0.2s',
  },
  // 编辑模式
  editRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  editInput: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    flex: 1,
  },
  editActions: {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto',
  },
  saveButton: {
    padding: '6px 12px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  cancelButton: {
    padding: '6px 12px',
    background: '#f8f9fa',
    color: '#5f6368',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368',
    fontSize: '14px',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#d93025',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368',
    fontSize: '14px',
  },
};
