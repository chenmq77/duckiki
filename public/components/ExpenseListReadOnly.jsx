/**
 * 支出列表组件 - 只读版本
 *
 * 从静态数据展示支出记录
 */
import { baseCard, typography } from '../styles/commonStyles';

export default function ExpenseListReadOnly({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>支出记录</h3>
        <div style={styles.empty}>暂无支出记录</div>
      </div>
    );
  }

  // 格式化类型
  const formatType = (type) => {
    const typeMap = {
      'membership': '会员费',
      'equipment': '固定资产',
      'other': '其他',
    };
    return typeMap[type] || type;
  };

  // 格式化显示名称
  const formatDisplayName = (expense) => {
    if (expense.is_installment && !expense.parent_expense_id) {
      const totalPeriods = expense.contract_info?.total_periods || 0;
      return `${expense.category || '分期合同'}（共${totalPeriods}期）`;
    } else if (expense.parent_expense_id) {
      const installmentNum = expense.installment_number || '?';
      const parentCategory = expense.parent_category || '分期';
      return `${parentCategory} - 第${installmentNum}期`;
    } else {
      return expense.category || formatType(expense.type);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>支出记录 ({expenses.length})</h3>

      <div style={styles.list}>
        {expenses.map((expense, index) => {
          const displayName = formatDisplayName(expense);

          return (
            <div key={index} style={styles.item}>
              <div style={styles.displayRow}>
                <span style={styles.type}>{formatType(expense.type)}</span>
                <span style={{
                  ...styles.category,
                  fontWeight: expense.is_installment && !expense.parent_expense_id ? '600' : 'normal'
                }}>
                  {displayName}
                </span>
                <span style={styles.amount}>
                  ${expense.amount.toFixed(2)} {expense.currency || 'USD'}
                </span>
                <span style={styles.date}>{new Date(expense.date).toLocaleDateString('zh-CN')}</span>
                {expense.note && <span style={styles.note}>{expense.note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 样式 - Flat Design (扁平化设计)
const styles = {
  container: {
    ...baseCard,
    minWidth: 0,
    overflow: 'hidden',
  },
  title: typography.title,
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
  displayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
  },
  type: {
    color: '#5f6368',
    fontWeight: '500',
    width: '60px',
    minWidth: '60px',
    maxWidth: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  category: {
    fontSize: '13px',
    color: '#202124',
    width: '140px',
    minWidth: '140px',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  amount: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#202124',
    width: '110px',
    minWidth: '110px',
    maxWidth: '110px',
  },
  date: {
    fontSize: '12px',
    color: '#5f6368',
    width: '90px',
    minWidth: '90px',
    maxWidth: '90px',
  },
  note: {
    fontSize: '12px',
    color: '#5f6368',
    fontStyle: 'italic',
    flex: 1,
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368',
    fontSize: '14px',
  },
};
