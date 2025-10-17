/**
 * 健身房回本计划 - 配置文件 v2.0
 *
 * 本配置文件包含所有可调整的参数，支持在 Admin 页面动态修改
 */

export const config = {
  // ==================== 货币设置 ====================
  currency: {
    default: 'NZD',                    // 默认货币
    exchangeRates: {
      NZD_TO_RMB: 4.1                  // 汇率：1 NZD = 4.1 RMB
    }
  },

  // ==================== 活动类型配置 ====================
  activityTypes: {
    // 游泳
    swimming: {
      label: '游泳',
      icon: '🏊',
      baseWeight: 1.0,
      dynamicWeight: true,             // 使用距离动态权重
      weightParams: {
        baseline: 1000,                // 基准距离（米）
        sigma: 400                     // 标准差（控制曲线陡峭程度）
      },
      referencePrice: 50,              // 市场参考价（NZD）
      fields: ['distance']
    },

    // 团课
    group_class: {
      label: '团课',
      icon: '🧘',
      baseWeight: 1.5,
      intensityMultiplier: {           // 强度系数
        light: 0.7,                    // 轻松课程
        medium: 1.0,                   // 常规强度
        high: 1.3,                     // 高强度
        extreme: 1.5                   // 极限挑战
      },
      referencePrice: 80,              // 市场参考价（NZD）
      fields: ['className', 'intensity']
    },

    // 私教课
    personal_training: {
      label: '私教',
      icon: '💪',
      baseWeight: 3.0,
      intensityMultiplier: {           // 强度系数
        light: 0.8,                    // 恢复性训练
        medium: 1.0,                   // 常规训练
        hard: 1.3,                     // 大重量训练
        extreme: 1.5                   // 力竭训练
      },
      referencePrice: 300,             // 市场参考价（NZD）
      fields: ['topic', 'duration', 'trainer', 'intensity', 'noteFile']
    },

    // 力量训练日（新增）
    gym_day: {
      label: '力量训练',
      icon: '🏋️',
      baseWeight: 1.2,
      intensityMultiplier: {           // 强度系数
        light: 0.8,                    // 恢复性训练
        medium: 1.0,                   // 常规训练
        hard: 1.2,                     // 大重量训练
        extreme: 1.4                   // 力竭训练
      },
      referencePrice: 0,               // 包含在会员卡内，无额外成本
      fields: ['exercises', 'duration', 'intensity', 'noteFile']
    }
  },

  // ==================== 支出类型配置 ====================
  expenseTypes: {
    // 一次性会员卡
    membership: {
      label: '会员费用',
      categories: ['周卡', '月卡', '季卡', '年卡', '次卡']
    },

    // 周扣费年卡（新增）
    membership_weekly: {
      label: '周扣费年卡',
      categories: ['周扣费年卡']
    },

    // 固定资产
    equipment: {
      label: '固定资产',
      categories: ['游泳装备', '健身服', '鞋', '锁', '其他装备'],
      assetTypes: {
        essential: '必须投入',         // 计入回本成本
        reward: '阶段性奖励'           // 可选是否计入
      },
      defaultType: 'essential'         // 默认为必须投入
    },

    // 其他费用
    others: {
      label: '其他费用',
      categories: ['储物柜', '毛巾', '淋浴用品', '其他']
    }
  },

  // ==================== 回本目标层级 ====================
  roiTargets: {
    breakeven: {
      label: '回本线',
      icon: '📍',
      priceRatio: 1.0,                 // 市场价 100%
      color: '#9E9E9E',
      description: '达到市场价，不亏不赚'
    },
    bronze: {
      label: '铜牌目标',
      icon: '🥉',
      priceRatio: 0.8,                 // 市场价 80%
      color: '#CD7F32',
      description: '比市场价便宜 20%'
    },
    silver: {
      label: '银牌目标',
      icon: '🥈',
      priceRatio: 0.6,                 // 市场价 60%
      color: '#C0C0C0',
      description: '比市场价便宜 40%'
    },
    gold: {
      label: '金牌目标',
      icon: '🥇',
      priceRatio: 0.4,                 // 市场价 40%
      color: '#FFD700',
      description: '比市场价便宜 60%，超值！'
    },
    custom: {
      label: '自定义目标',
      icon: '💜',
      priceRatio: null,                // 用户自定义
      customPrice: null,               // 自定义单次价格
      color: '#9C27B0',
      description: '设置你的专属目标'
    }
  },

  // ==================== 团课类型列表 ====================
  groupClassTypes: [
    '瑜伽',
    '普拉提',
    '动感单车',
    'HIIT',
    '搏击操',
    '有氧舞蹈',
    '核心训练',
    '拉伸放松',
    '其他'
  ],

  // ==================== 强度等级选项 ====================
  intensityLevels: {
    light: { label: '轻松', icon: '⭐' },
    medium: { label: '常规', icon: '⭐⭐⭐' },
    high: { label: '高强度', icon: '⭐⭐⭐⭐' },
    hard: { label: '大重量', icon: '⭐⭐⭐⭐' },
    extreme: { label: '极限', icon: '⭐⭐⭐⭐⭐' }
  }
};

/**
 * 游泳距离动态权重计算函数
 * 使用高斯函数 + 非对称奖励机制
 *
 * @param {number} distance - 游泳距离（米）
 * @param {number} baseline - 基准距离（默认 1000m）
 * @param {number} sigma - 标准差（默认 400）
 * @returns {number} 权重系数
 */
export function calculateSwimmingWeight(
  distance,
  baseline = config.activityTypes.swimming.weightParams.baseline,
  sigma = config.activityTypes.swimming.weightParams.sigma
) {
  if (distance <= 0) return 0;

  const deviation = distance - baseline;

  // 高斯权重（对称）
  const gaussianWeight = Math.exp(
    -(deviation * deviation) / (2 * sigma * sigma)
  );

  if (distance <= baseline) {
    // 小于等于基准：使用高斯权重（惩罚）
    // 500m  → 0.64
    // 750m  → 0.88
    // 1000m → 1.0
    return gaussianWeight;
  } else {
    // 大于基准：高斯权重 + 1.0（奖励）
    // 1500m → 0.64 + 1 = 1.64
    // 2000m → 0.14 + 1 = 1.14
    // 3000m → 0.00 + 1 = 1.0（保底）
    return gaussianWeight + 1.0;
  }
}

/**
 * 计算活动权重（含强度和距离）
 *
 * @param {Object} activity - 活动记录对象
 * @returns {number} 最终权重
 */
export function calculateActivityWeight(activity) {
  const activityConfig = config.activityTypes[activity.type];
  if (!activityConfig) return 1.0;

  let weight = activityConfig.baseWeight;

  // 游泳：距离动态权重
  if (activity.type === 'swimming' && activityConfig.dynamicWeight) {
    weight = calculateSwimmingWeight(activity.data.distance);
  }

  // 其他活动：基础权重 × 强度系数
  if (activity.data.intensity && activityConfig.intensityMultiplier) {
    weight *= activityConfig.intensityMultiplier[activity.data.intensity];
  }

  return weight;
}

export default config;
