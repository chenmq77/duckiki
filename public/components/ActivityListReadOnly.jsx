/**
 * 活动列表组件 - 只读版本
 *
 * 从静态数据展示活动记录
 */
import { baseCard, typography } from '../styles/commonStyles';

export default function ActivityListReadOnly({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>活动记录</h3>
        <div style={styles.empty}>暂无活动记录</div>
      </div>
    );
  }

  // 按日期倒序排列（最新的在最上面）
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>活动记录 ({sortedActivities.length})</h3>

      <div style={styles.list}>
        {sortedActivities.map((activity, index) => (
          <div key={index} style={styles.item}>
            <div style={styles.displayRow}>
              <span style={styles.type}>游泳</span>
              <span style={styles.distance}>{activity.distance}m</span>
              <span style={styles.weight}>权重: <strong>{activity.calculated_weight}</strong></span>
              <span style={styles.date}>{new Date(activity.date).toLocaleDateString('zh-CN')}</span>
              {activity.note && <span style={styles.note}>{activity.note}</span>}
            </div>
          </div>
        ))}
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
    minWidth: '40px',
  },
  distance: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#202124',
    minWidth: '60px',
  },
  weight: {
    fontSize: '13px',
    color: '#1a73e8',
    fontWeight: '500',
    minWidth: '80px',
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
    maxWidth: '200px',
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
