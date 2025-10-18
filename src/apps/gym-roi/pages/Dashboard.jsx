/**
 * 健身房回本计划 - Dashboard 页面
 *
 * 主要功能：
 * - 显示 ROI 进度卡片
 * - 提供支出和活动录入表单
 * - 实时更新数据
 */

import { useState } from 'react';
import ROICard from '../components/ROICard';
import ExpenseForm from '../components/ExpenseForm';
import ActivityForm from '../components/ActivityForm';
import ExpenseList from '../components/ExpenseList';
import ActivityList from '../components/ActivityList';

export default function Dashboard() {
  // 用于触发 ROI 卡片刷新
  const [refreshKey, setRefreshKey] = useState(0);
  // 用于触发列表刷新
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleDataChange = () => {
    // 数据变化时，触发 ROI 卡片和列表刷新
    setRefreshKey(prev => prev + 1);
    setListRefreshKey(prev => prev + 1);
  };

  return (
    <div style={styles.container}>
      {/* 页面标题 */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.pageTitle}>
            <span>健身房回本计划</span>
          </h1>
          <p style={styles.subtitle}>
            记录支出和活动，追踪回本进度
          </p>
        </div>
      </header>

      {/* ROI 进度卡片 */}
      <section style={styles.section}>
        <ROICard key={refreshKey} />
      </section>

      {/* 数据录入区 */}
      <section style={styles.section}>
        <div style={styles.formsGrid}>
          {/* 支出录入表单 */}
          <ExpenseForm onSuccess={handleDataChange} />

          {/* 活动录入表单 */}
          <ActivityForm onSuccess={handleDataChange} />
        </div>
      </section>

      {/* 数据列表区 */}
      <section style={styles.section}>
        <div style={styles.listsGrid}>
          {/* 支出列表 */}
          <ExpenseList
            refreshTrigger={listRefreshKey}
            onDelete={handleDataChange}
          />

          {/* 活动列表 */}
          <ActivityList
            refreshTrigger={listRefreshKey}
            onDelete={handleDataChange}
          />
        </div>
      </section>

      {/* 页脚 */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          提示：每次添加活动后，权重会自动计算并更新 ROI 进度
        </p>
        <p style={styles.footerText}>
          权重算法：高斯惩罚（少游）+ 对数奖励（多游）
        </p>
      </footer>
    </div>
  );
}

// 样式 - Google News 风格
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',  // Google News 浅灰背景
    padding: '0',
  },
  header: {
    background: 'white',
    borderBottom: '1px solid #dadce0',
    padding: '12px 40px',  // 减小 padding
    marginBottom: '16px',   // 减小间距
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '22px',      // 减小标题
    fontWeight: '500',
    color: '#202124',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  subtitle: {
    fontSize: '13px',      // 减小副标题
    color: '#5f6368',
  },
  section: {
    maxWidth: '1400px',
    margin: '0 auto 16px auto',  // 减小间距
    padding: '0 40px',
  },
  formsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',  // 减小间距
  },
  listsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',  // 减小间距
    width: '100%',
    overflow: 'hidden',  // 防止子元素溢出
  },
  footer: {
    maxWidth: '1400px',
    margin: '40px auto 0 auto',
    padding: '20px 40px',
    textAlign: 'center',
    color: '#5f6368',
    background: 'white',
    borderTop: '1px solid #dadce0',
  },
  footerText: {
    fontSize: '13px',
    marginBottom: '8px',
  },
};
