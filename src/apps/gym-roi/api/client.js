/**
 * 健身房回本计划 - API 客户端
 *
 * 提供统一的后端 API 调用接口
 *
 * 功能：
 * - 统一的错误处理
 * - 自动 JSON 序列化/反序列化
 * - 支持所有 HTTP 方法（GET, POST, DELETE）
 */

// API 基础 URL
// 开发环境：http://localhost:5002
// 生产环境：可配置为云服务器地址
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

/**
 * 通用 fetch 封装
 * @param {string} endpoint - API 端点（如 '/api/health'）
 * @param {object} options - fetch 选项
 * @returns {Promise<object>} - 返回 JSON 数据
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // 检查 HTTP 状态码
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.error || '请求失败');
    }

    // 204 No Content（删除成功）
    if (response.status === 204) {
      return null;
    }

    // 返回 JSON 数据
    return await response.json();

  } catch (error) {
    console.error(`API 请求失败 [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * API 客户端对象
 * 提供所有后端接口的调用方法
 */
const api = {
  // ========================================
  // 健康检查
  // ========================================
  health: {
    /**
     * 检查后端服务是否运行
     * @returns {Promise<object>} { status: 'ok', message: '...', timestamp: '...' }
     */
    check: () => request('/api/health'),
  },

  // ========================================
  // 支出管理
  // ========================================
  expenses: {
    /**
     * 获取所有支出记录
     * @returns {Promise<Array>} 支出列表
     */
    getAll: () => request('/api/expenses'),

    /**
     * 创建新支出
     * @param {object} data - 支出数据
     * @param {string} data.type - 支出类型（membership | equipment | other）
     * @param {number} data.amount - 金额
     * @param {string} data.date - 日期（YYYY-MM-DD）
     * @param {string} [data.category] - 分类
     * @param {string} [data.currency] - 币种（默认 NZD）
     * @param {string} [data.note] - 备注
     * @returns {Promise<object>} 创建的支出记录
     */
    create: (data) => request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    /**
     * 更新支出
     * @param {number} id - 支出 ID
     * @param {object} data - 要更新的数据
     * @returns {Promise<object>} 更新后的支出记录
     */
    update: (id, data) => request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    /**
     * 删除支出
     * @param {number} id - 支出 ID
     * @returns {Promise<null>} 删除成功返回 null
     */
    delete: (id) => request(`/api/expenses/${id}`, {
      method: 'DELETE',
    }),
  },

  // ========================================
  // 活动管理
  // ========================================
  activities: {
    /**
     * 获取所有活动记录
     * @returns {Promise<Array>} 活动列表
     */
    getAll: () => request('/api/activities'),

    /**
     * 创建新活动（自动计算权重）
     * @param {object} data - 活动数据
     * @param {string} data.type - 活动类型（swimming）
     * @param {number} data.distance - 游泳距离（米）
     * @param {string} data.date - 日期（YYYY-MM-DD）
     * @param {string} [data.note] - 备注
     * @returns {Promise<object>} 创建的活动记录（包含 calculated_weight）
     */
    create: (data) => request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    /**
     * 更新活动（如果距离改变会重新计算权重）
     * @param {number} id - 活动 ID
     * @param {object} data - 要更新的数据
     * @returns {Promise<object>} 更新后的活动记录
     */
    update: (id, data) => request(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    /**
     * 删除活动
     * @param {number} id - 活动 ID
     * @returns {Promise<null>} 删除成功返回 null
     */
    delete: (id) => request(`/api/activities/${id}`, {
      method: 'DELETE',
    }),
  },

  // ========================================
  // ROI 统计
  // ========================================
  roi: {
    /**
     * 获取 ROI 摘要统计（双重计算）
     * @returns {Promise<object>} ROI 统计数据
     * {
     *   total_activities: number,
     *   weighted_total: number,
     *   market_reference_price: number,
     *   paid: { total_expense, average_cost, money_saved, roi_percentage },
     *   planned: { total_expense, average_cost, money_saved, roi_percentage }
     * }
     */
    getSummary: () => request('/api/roi/summary'),

    /**
     * 更新市场参考价
     * @param {number} price - 新的市场参考价
     * @returns {Promise<object>} 更新结果
     */
    updateMarketPrice: (price) => request('/api/roi/market-price', {
      method: 'PUT',
      body: JSON.stringify({ price }),
    }),
  },

  // ========================================
  // 分期合同管理
  // ========================================
  contracts: {
    /**
     * 创建分期合同
     * @param {object} data - 合同数据
     * @param {string} data.type - 支出类型
     * @param {string} [data.category] - 分类
     * @param {number} data.total_amount - 合同总金额
     * @param {number} data.weekly_amount - 每周扣费金额
     * @param {string} [data.currency] - 货币（默认 NZD）
     * @param {number} data.day_of_week - 扣费日（0=周一, 6=周日）
     * @param {string} data.start_date - 开始日期（YYYY-MM-DD）
     * @param {string} data.end_date - 结束日期（YYYY-MM-DD）
     * @param {string} [data.note] - 备注
     * @returns {Promise<object>} 创建的合同记录
     */
    create: (data) => request('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    /**
     * 获取所有合同
     * @returns {Promise<Array>} 合同列表
     */
    getAll: () => request('/api/contracts'),

    /**
     * 获取合同详情
     * @param {number} id - 合同 ID
     * @returns {Promise<object>} 合同详情及扣费列表
     */
    getById: (id) => request(`/api/contracts/${id}`),

    /**
     * 更新某期扣费记录
     * @param {number} contractId - 合同 ID
     * @param {number} chargeId - 扣费记录 ID
     * @param {object} data - 要更新的数据
     * @param {number} [data.amount] - 扣费金额
     * @param {string} [data.status] - 扣费状态（paid/pending）
     * @returns {Promise<object>} 更新后的扣费记录
     */
    updateCharge: (contractId, chargeId, data) => request(`/api/contracts/${contractId}/charges/${chargeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    /**
     * 删除合同
     * @param {number} id - 合同 ID
     * @returns {Promise<null>} 删除成功返回 null
     */
    delete: (id) => request(`/api/contracts/${id}`, {
      method: 'DELETE',
    }),

    /**
     * 将已有支出转换为分期
     * @param {number} expenseId - 支出 ID
     * @param {object} data - 转换参数
     * @param {number} data.weekly_amount - 每周扣费金额
     * @param {number} data.day_of_week - 扣费日（0=周一, 6=周日）
     * @param {string} data.end_date - 结束日期（YYYY-MM-DD）
     * @returns {Promise<object>} 转换后的合同记录
     */
    convertFromExpense: (expenseId, data) => request(`/api/expenses/${expenseId}/convert-to-installment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};

export default api;
