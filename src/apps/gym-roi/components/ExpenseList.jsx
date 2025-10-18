/**
 * 支出列表组件
 *
 * 展示所有支出记录，支持 inline 编辑和删除操作
 * 支持分期合同的父子显示
 */

import { useState, useEffect } from 'react';
import api from '../api/client';
import ContractFormFields from './ContractFormFields';

export default function ExpenseList({ refreshTrigger, onDelete }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showContractEditModal, setShowContractEditModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [editContractData, setEditContractData] = useState(null);
  const [savingContract, setSavingContract] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [editChargeData, setEditChargeData] = useState({});

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

  // 打开编辑合同模态框
  const openContractEditModal = async (expense) => {
    setSelectedContract(expense);
    setShowContractEditModal(true);
    setLoadingContract(true);

    try {
      // 通过 expense ID 查找关联的合同
      const contracts = await api.contracts.getAll();
      const contract = contracts.find(c => c.expense_id === expense.id);

      if (contract) {
        // 获取合同详情
        const details = await api.contracts.getById(contract.id);

        // 计算期数
        const totalPeriods = details.charges.length;

        // 设置编辑数据 - 使用 ContractFormFields 期望的数据结构
        setEditContractData({
          contract_id: contract.id,
          // formData 部分
          formData: {
            amount: details.contract.total_amount.toString(),
            date: details.contract.start_date,
          },
          // installmentData 部分
          installmentData: {
            periodType: details.contract.period_type,
            periodCount: totalPeriods.toString(),
            perPeriodAmount: details.contract.period_amount.toString(),
            dayOfWeek: details.contract.day_of_week ?? 0,
            dayOfMonth: details.contract.day_of_month ?? 1,
            endDate: details.contract.end_date || '',
          }
        });
      }
    } catch (err) {
      alert(`加载合同信息失败: ${err.message}`);
    } finally {
      setLoadingContract(false);
    }
  };

  // 保存合同编辑
  const saveContractEdit = async () => {
    if (!editContractData) return;

    const { formData, installmentData } = editContractData;

    // 表单验证
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('请输入有效的合同总金额');
      return;
    }
    if (!installmentData.perPeriodAmount || parseFloat(installmentData.perPeriodAmount) <= 0) {
      alert('请输入有效的每期金额');
      return;
    }
    if (!installmentData.periodCount || parseInt(installmentData.periodCount) <= 0) {
      alert('请输入有效的期数');
      return;
    }
    if (!formData.date) {
      alert('请选择合同开始日期');
      return;
    }

    // 结束日期已经在 installmentData.endDate 中自动计算好了
    setSavingContract(true);
    try {
      // 调用后端 API 更新合同
      await api.contracts.update(editContractData.contract_id, {
        total_amount: parseFloat(formData.amount),
        period_amount: parseFloat(installmentData.perPeriodAmount),
        period_type: installmentData.periodType,
        day_of_week: installmentData.dayOfWeek,
        day_of_month: installmentData.dayOfMonth,
        start_date: formData.date,
        end_date: installmentData.endDate,
      });

      // 关闭模态框并重新加载数据
      setShowContractEditModal(false);
      setEditContractData(null);
      loadExpenses();
      if (onDelete) onDelete(); // 刷新 ROI
      alert('合同更新成功');
    } catch (err) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSavingContract(false);
    }
  };

  // 开始编辑扣费记录
  const startEditCharge = (charge) => {
    setEditingChargeId(charge.id);
    setEditChargeData({
      amount: charge.amount,
      status: charge.status,
    });
  };

  // 取消编辑扣费记录
  const cancelEditCharge = () => {
    setEditingChargeId(null);
    setEditChargeData({});
  };

  // 保存扣费记录编辑
  const saveEditCharge = async (contractId, chargeId) => {
    try {
      await api.contracts.updateCharge(contractId, chargeId, editChargeData);

      setEditingChargeId(null);
      setEditChargeData({});

      // 重新加载合同详情和支出列表
      await Promise.all([
        api.contracts.getById(contractId).then(details => setContractDetails(details)),
        loadExpenses()
      ]);

      // 刷新 ROI
      if (onDelete) onDelete();
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
  };

  // 切换扣费状态
  const toggleChargeStatus = async (contractId, chargeId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    try {
      await api.contracts.updateCharge(contractId, chargeId, { status: newStatus });

      // 重新加载合同详情和支出列表（确保同步）
      await Promise.all([
        api.contracts.getById(contractId).then(details => setContractDetails(details)),
        loadExpenses()
      ]);

      // 刷新 ROI
      if (onDelete) onDelete();
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
  };

  // 打开查看明细模态框
  const openChargesModal = async (expense) => {
    setSelectedContract(expense);
    setShowChargesModal(true);
    setLoadingContract(true);

    try {
      // 通过 expense ID 查找关联的合同
      const contracts = await api.contracts.getAll();
      const contract = contracts.find(c => c.expense_id === expense.id);

      if (contract) {
        // 获取合同详情（包含所有扣费记录）
        const details = await api.contracts.getById(contract.id);
        setContractDetails(details);
      }
    } catch (err) {
      alert(`加载合同明细失败: ${err.message}`);
    } finally {
      setLoadingContract(false);
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
      // 分期合同父支出 - 使用合同的总期数
      const totalPeriods = expense.contract_info?.total_periods || 0;
      return `${expense.category || '分期合同'}（共${totalPeriods}期）`;
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
                // 编辑模式 - 双行布局避免溢出
                <div style={styles.editContainer}>
                  <div style={styles.editRow}>
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                      style={styles.editInputHalf}
                      placeholder="金额"
                      step="0.01"
                    />
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      style={styles.editInputHalf}
                    />
                  </div>
                  <div style={styles.editRow}>
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      style={styles.editInputHalf}
                      placeholder="分类"
                    />
                    <input
                      type="text"
                      value={editData.note}
                      onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                      style={styles.editInputHalf}
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
                    {expense.is_installment && !expense.parent_expense_id ? (
                      // 分期合同父记录：显示"编辑合同"和"查看明细"按钮
                      <>
                        <button
                          onClick={() => openContractEditModal(expense)}
                          style={styles.iconButton}
                          title="编辑合同"
                          className="edit-btn"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => openChargesModal(expense)}
                          style={styles.iconButton}
                          title="查看明细"
                          className="view-btn"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
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
                      </>
                    ) : (
                      // 普通支出：显示"编辑"和"删除"按钮
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 编辑合同模态框 */}
      {showContractEditModal && (
        <div style={styles.modalOverlay} onClick={() => {
          if (!savingContract) {
            setShowContractEditModal(false);
            setEditContractData(null);
          }
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>
              编辑分期合同 - {selectedContract?.category}
            </h3>

            {loadingContract ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368' }}>加载中...</div>
            ) : editContractData ? (
              <>
                {/* 合同编辑表单 */}
                <ContractFormFields
                  formData={editContractData.formData}
                  installmentData={editContractData.installmentData}
                  onFormChange={(newFormData) => setEditContractData({
                    ...editContractData,
                    formData: newFormData
                  })}
                  onInstallmentChange={(newInstallmentData) => setEditContractData({
                    ...editContractData,
                    installmentData: newInstallmentData
                  })}
                  mode="edit"
                />

                {/* 操作按钮 */}
                <div style={styles.modalActions}>
                  <button
                    onClick={saveContractEdit}
                    disabled={savingContract}
                    style={{
                      ...styles.saveButton,
                      opacity: savingContract ? 0.6 : 1,
                      cursor: savingContract ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {savingContract ? '保存中...' : '保存更改'}
                  </button>
                  <button
                    onClick={() => {
                      if (!savingContract) {
                        setShowContractEditModal(false);
                        setEditContractData(null);
                      }
                    }}
                    disabled={savingContract}
                    style={{
                      ...styles.cancelButton,
                      opacity: savingContract ? 0.6 : 1,
                      cursor: savingContract ? 'not-allowed' : 'pointer',
                    }}
                  >
                    取消
                  </button>
                </div>

                {/* 提示信息 */}
                <div style={styles.warningBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    注意：修改合同参数将重新生成所有扣费记录，已支付的记录会被保留，但日期和金额可能会改变。
                  </span>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                未找到合同信息
              </div>
            )}
          </div>
        </div>
      )}

      {/* 查看明细模态框 */}
      {showChargesModal && (
        <div style={styles.modalOverlay} onClick={() => setShowChargesModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>
              付款明细 - {selectedContract?.category}
            </h3>

            {loadingContract ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368' }}>加载中...</div>
            ) : contractDetails ? (
              <>
                {/* 合同信息卡片 */}
                <div style={styles.contractInfoCard}>
                  <div style={styles.contractInfoRow}>
                    <span style={styles.contractInfoLabel}>合同总金额：</span>
                    <span style={styles.contractInfoValue}>${contractDetails.contract.total_amount.toFixed(2)}</span>
                  </div>
                  <div style={styles.contractInfoRow}>
                    <span style={styles.contractInfoLabel}>每期金额：</span>
                    <span style={styles.contractInfoValue}>${contractDetails.contract.period_amount.toFixed(2)}</span>
                  </div>
                  <div style={styles.contractInfoRow}>
                    <span style={styles.contractInfoLabel}>分期方式：</span>
                    <span style={styles.contractInfoValue}>
                      {contractDetails.contract.period_type === 'weekly' ? '每周' : '每月'}扣费
                    </span>
                  </div>
                  <div style={styles.contractInfoRow}>
                    <span style={styles.contractInfoLabel}>合同期限：</span>
                    <span style={styles.contractInfoValue}>
                      {contractDetails.contract.start_date} 至 {contractDetails.contract.end_date}
                    </span>
                  </div>
                </div>

                {/* 扣费记录表格 */}
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#202124' }}>
                    扣费记录（共 {contractDetails.charges.length} 期）
                  </h4>
                  <div style={styles.chargesTable}>
                    {contractDetails.charges.map((charge, index) => {
                      const isEditingCharge = editingChargeId === charge.id;

                      return (
                        <div key={charge.id} style={styles.chargeRow} className="charge-row-item">
                          {isEditingCharge ? (
                            // 编辑模式
                            <>
                              <span style={styles.chargePeriod}>第 {index + 1} 期</span>
                              <span style={styles.chargeDate}>{charge.charge_date}</span>
                              <input
                                type="number"
                                value={editChargeData.amount}
                                onChange={(e) => setEditChargeData({
                                  ...editChargeData,
                                  amount: parseFloat(e.target.value) || 0
                                })}
                                style={styles.chargeAmountInput}
                                step="0.01"
                                min="0"
                              />
                              <select
                                value={editChargeData.status}
                                onChange={(e) => setEditChargeData({
                                  ...editChargeData,
                                  status: e.target.value
                                })}
                                style={styles.chargeStatusSelect}
                              >
                                <option value="paid">已付</option>
                                <option value="pending">待付</option>
                              </select>
                              <div style={styles.chargeActions}>
                                <button
                                  onClick={() => saveEditCharge(contractDetails.contract.id, charge.id)}
                                  style={styles.chargeActionBtn}
                                  title="保存"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEditCharge}
                                  style={styles.chargeActionBtn}
                                  title="取消"
                                >
                                  ×
                                </button>
                              </div>
                            </>
                          ) : (
                            // 显示模式
                            <>
                              <span style={styles.chargePeriod}>第 {index + 1} 期</span>
                              <span style={styles.chargeDate}>{charge.charge_date}</span>
                              <span style={styles.chargeAmount}>${charge.amount.toFixed(2)}</span>
                              <button
                                onClick={() => toggleChargeStatus(contractDetails.contract.id, charge.id, charge.status)}
                                style={{
                                  ...styles.chargeStatusButton,
                                  background: charge.status === 'paid' ? '#d1fae5' : '#fee2e2',
                                  color: charge.status === 'paid' ? '#065f46' : '#991b1b',
                                  border: `1px solid ${charge.status === 'paid' ? '#10b981' : '#ef4444'}`,
                                }}
                                title="点击切换状态"
                              >
                                {charge.status === 'paid' ? '已付' : '待付'}
                              </button>
                              <div style={styles.chargeActions}>
                                <button
                                  onClick={() => startEditCharge(charge)}
                                  style={styles.chargeEditBtn}
                                  className="charge-edit-btn"
                                  title="编辑"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 统计信息 */}
                <div style={styles.summaryCard}>
                  <div style={styles.summaryRow}>
                    <span>已付总额：</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>
                      ${contractDetails.charges
                        .filter(c => c.status === 'paid')
                        .reduce((sum, c) => sum + c.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>待付总额：</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>
                      ${contractDetails.charges
                        .filter(c => c.status === 'pending')
                        .reduce((sum, c) => sum + c.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>已付期数：</span>
                    <span style={{ fontWeight: '600' }}>
                      {contractDetails.charges.filter(c => c.status === 'paid').length} / {contractDetails.charges.length}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                未找到合同信息
              </div>
            )}

            <button onClick={() => {
              setShowChargesModal(false);
              setContractDetails(null);
            }} style={styles.closeButton}>
              关闭
            </button>
          </div>
        </div>
      )}

      <style>{`
        .expense-item .edit-btn,
        .expense-item .view-btn,
        .expense-item .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .expense-item:hover .edit-btn,
        .expense-item:hover .view-btn,
        .expense-item:hover .delete-btn {
          opacity: 1;
        }
        .charge-row-item .charge-edit-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .charge-row-item:hover .charge-edit-btn {
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
    minWidth: 0,  // 允许 flex 子元素收缩
    overflow: 'hidden',  // 防止内容溢出
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
    maxWidth: '300px',  // 限制最大宽度
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
  // 编辑模式 - 双行布局
  editContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  editInputHalf: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    flex: 1,
    minWidth: 0,  // 允许收缩
  },
  editActions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,  // 按钮不收缩
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
  // 模态框样式
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    marginTop: '16px',
    padding: '8px 16px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  // 合同信息卡片
  contractInfoCard: {
    background: '#f8f9fa',
    borderRadius: '6px',
    padding: '16px',
    border: '1px solid #e8eaed',
  },
  contractInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e8eaed',
  },
  contractInfoLabel: {
    fontSize: '13px',
    color: '#5f6368',
  },
  contractInfoValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#202124',
  },
  // 扣费记录表格
  chargesTable: {
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #e8eaed',
    borderRadius: '4px',
  },
  chargeRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid #f1f3f4',
    fontSize: '13px',
  },
  chargePeriod: {
    width: '80px',
    color: '#5f6368',
    fontWeight: '500',
  },
  chargeDate: {
    flex: 1,
    color: '#202124',
  },
  chargeAmount: {
    width: '100px',
    textAlign: 'right',
    fontWeight: '500',
    color: '#202124',
  },
  chargeStatus: {
    width: '60px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '500',
  },
  chargeActions: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  chargeEditBtn: {
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
  chargeActionBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    color: '#5f6368',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '4px',
    transition: 'background 0.2s, color 0.2s',
  },
  chargeAmountInput: {
    width: '100px',
    padding: '4px 8px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'right',
  },
  chargeStatusSelect: {
    width: '80px',
    padding: '4px 8px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '12px',
    outline: 'none',
  },
  chargeStatusButton: {
    width: '70px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  // 统计信息
  summaryCard: {
    marginTop: '16px',
    background: '#e3f2fd',
    borderRadius: '6px',
    padding: '12px 16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    color: '#202124',
  },
  // 合同编辑表单
  contractEditForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#5f6368',
  },
  formInput: {
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  warningBox: {
    marginTop: '16px',
    padding: '12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    fontSize: '13px',
    color: '#991b1b',
  },
};
