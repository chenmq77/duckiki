/**
 * 健身房回本计划 - 配置文件
 */

export const config = {
  // 活动类型权重配置
  weights: {
    swimming: 1.0,         // 游泳基础权重
    group_class: 1.5,      // 团课权重（相当于 1.5 次游泳）
    personal_training: 3.0 // 私教权重（相当于 3 次游泳）
  },

  // 市场参考价格（人民币）
  referencePrices: {
    swimming: 50,          // 单次游泳市场价
    group_class: 80,       // 单次团课市场价
    personal_training: 300 // 单次私教市场价
  },

  // 团课强度系数（可选，用于更精细的计算）
  intensityMultiplier: {
    low: 0.8,    // 低强度团课权重 × 0.8
    medium: 1.0, // 中等强度团课权重 × 1.0
    high: 1.2    // 高强度团课权重 × 1.2
  },

  // 支出类型定义
  expenseTypes: {
    membership: {
      label: '会员费用',
      categories: ['周卡', '月卡', '季卡', '年卡', '次卡']
    },
    equipment: {
      label: '固定资产',
      categories: ['游泳装备', '健身服', '鞋', '锁', '其他装备']
    },
    others: {
      label: '其他费用',
      categories: ['储物柜', '毛巾', '淋浴用品', '其他']
    }
  },

  // 活动类型定义
  activityTypes: {
    swimming: {
      label: '游泳',
      icon: '🏊',
      fields: ['distance'] // 距离（米）
    },
    group_class: {
      label: '团课',
      icon: '🧘',
      fields: ['className', 'intensity'], // 课程名称、强度
      intensityOptions: ['low', 'medium', 'high']
    },
    personal_training: {
      label: '私教',
      icon: '💪',
      fields: ['topic', 'duration', 'trainer', 'noteFile'] // 主题、时长、教练、笔记
    }
  },

  // 团课类型列表
  groupClassTypes: [
    '瑜伽',
    '普拉提',
    '动感单车',
    '搏击操',
    '有氧舞蹈',
    'HIIT',
    '核心训练',
    '其他'
  ]
};

export default config;
