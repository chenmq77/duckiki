/**
 * 活动列表组件
 *
 * 展示所有活动记录，支持 inline 编辑和删除操作
 */

import { useState, useEffect } from 'react';
import api from '../api/client';
import { baseCard, typography, buttons } from '../styles/commonStyles';

export default function ActivityList({ refreshTrigger, onDelete }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // 加载活动列表
  useEffect(() => {
    loadActivities();
  }, [refreshTrigger]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.activities.getAll();
      // 按日期倒序排列（最新的在最上面）
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑
  const startEdit = (activity) => {
    setEditingId(activity.id);
    setEditData({
      distance: activity.distance,
      date: activity.date,
      note: activity.note || '',
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
      const updated = await api.activities.update(id, editData);
      setActivities(prev => prev.map(item => item.id === id ? updated : item));
      setEditingId(null);
      setEditData({});
      if (onDelete) onDelete(); // 刷新 ROI
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
  };

  // 删除活动
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条活动记录吗？')) {
      return;
    }

    try {
      await api.activities.delete(id);
      setActivities(prev => prev.filter(item => item.id !== id));
      if (onDelete) onDelete();
    } catch (err) {
      alert(`删除失败: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>活动记录</h3>
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>活动记录</h3>
        <div style={styles.error}>加载失败: {error}</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>活动记录</h3>
        <div style={styles.empty}>暂无活动记录</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>活动记录 ({activities.length})</h3>

      <div style={styles.list}>
        {activities.map((activity) => {
          const isEditing = editingId === activity.id;

          return (
            <div key={activity.id} style={styles.item} className="activity-item">
              {isEditing ? (
                // 编辑模式
                <div style={styles.editRow}>
                  <input
                    type="number"
                    value={editData.distance}
                    onChange={(e) => setEditData({ ...editData, distance: parseInt(e.target.value) })}
                    style={styles.editInput}
                    placeholder="距离(m)"
                  />
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    style={styles.editInput}
                  />
                  <input
                    type="text"
                    value={editData.note}
                    onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                    style={styles.editInput}
                    placeholder="备注"
                  />
                  <div style={styles.editActions}>
                    <button onClick={() => saveEdit(activity.id)} style={styles.saveButton}>
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
                  <span style={styles.type}>游泳</span>
                  <span style={styles.distance}>{activity.distance}m</span>
                  <span style={styles.weight}>权重: <strong>{activity.calculated_weight}</strong></span>
                  <span style={styles.date}>{new Date(activity.date).toLocaleDateString('zh-CN')}</span>
                  {activity.note && <span style={styles.note}>{activity.note}</span>}

                  <div style={styles.actions}>
                    <button
                      onClick={() => startEdit(activity)}
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
                      onClick={() => handleDelete(activity.id)}
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
        .activity-item .edit-btn,
        .activity-item .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .activity-item:hover .edit-btn,
        .activity-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// 样式 - Flat Design (扁平化设计)
const styles = {
  container: {
    ...baseCard,  // 使用共享样式（扁平化：无阴影、无边框）
    minWidth: 0,  // 允许 flex 子元素收缩
    overflow: 'hidden',  // 防止内容溢出
  },
  title: typography.title,  // 使用共享样式
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '4px',
    // 扁平化设计：无边框
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
    maxWidth: '200px',  // 限制最大宽度
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
