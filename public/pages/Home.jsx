/**
 * Public 展示页面
 * 只读模式,从静态 JSON 数据展示健身房回本进度
 */
import { useState, useEffect } from 'react';
import ROICardReadOnly from '../components/ROICardReadOnly';
import ExpenseListReadOnly from '../components/ExpenseListReadOnly';
import ActivityListReadOnly from '../components/ActivityListReadOnly';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // 使用 import.meta.env.BASE_URL 来适配不同环境的 base path
      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(`${baseUrl}data/summary.json`);
      if (!response.ok) {
        throw new Error('数据加载失败');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          加载失败: {error}
          <button onClick={loadData} style={styles.retryButton}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>健身房回本计划</h1>
        <p style={styles.subtitle}>数据展示</p>
      </header>

      <div style={styles.content}>
        {/* ROI 进度卡片 */}
        <ROICardReadOnly roiData={data.roi} />

        {/* 支出列表 */}
        <ExpenseListReadOnly expenses={data.expenses} />

        {/* 活动列表 */}
        <ActivityListReadOnly activities={data.activities} />
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          最后更新: {new Date(data.lastUpdated).toLocaleString('zh-CN')}
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  header: {
    background: 'white',
    padding: '24px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '400',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#5f6368',
    margin: 0,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px 24px',
  },
  footer: {
    background: 'white',
    padding: '16px',
    textAlign: 'center',
    marginTop: '24px',
    borderTop: '1px solid #e8eaed',
  },
  footerText: {
    fontSize: '12px',
    color: '#5f6368',
    margin: 0,
  },
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
  retryButton: {
    marginTop: '16px',
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};
