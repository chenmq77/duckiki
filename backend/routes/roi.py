"""
ROI 计算 API

提供健身房投资回报率的统计计算

接口：
- GET /api/roi/summary  - 获取 ROI 摘要统计
"""

from flask import Blueprint, jsonify
from models import db, Expense, Activity

# 创建蓝图
roi_bp = Blueprint('roi', __name__)


# ========================================
# GET /api/roi/summary - ROI 摘要统计
# ========================================
@roi_bp.route('/api/roi/summary', methods=['GET'])
def get_roi_summary():
    """
    获取 ROI 摘要统计

    返回:
    {
      "total_expense": 916.0,           // 总支出（NZD）
      "total_activities": 4,            // 活动总数（未加权）
      "weighted_total": 5.66,           // 加权总次数
      "average_cost": 161.84,           // 平均单次成本（总支出 ÷ 加权次数）
      "market_reference_price": 50.0,   // 市场参考价（游泳）
      "money_saved": -447.36,           // 节省金额（负数表示还没回本）
      "roi_percentage": -323.68         // ROI 百分比
    }

    计算逻辑：
    - total_expense: 所有支出的总和
    - weighted_total: 所有活动的加权次数总和
    - average_cost: total_expense ÷ weighted_total
    - money_saved: (market_price - average_cost) × weighted_total
    - roi_percentage: (money_saved / total_expense) × 100
    """
    try:
        # 1. 计算总支出
        expenses = Expense.query.all()
        total_expense = sum(expense.amount for expense in expenses)

        # 2. 获取所有活动并计算加权总次数
        activities = Activity.query.all()
        total_activities = len(activities)
        weighted_total = sum(activity.calculated_weight for activity in activities)

        # 3. 计算平均单次成本
        if weighted_total > 0:
            average_cost = total_expense / weighted_total
        else:
            average_cost = 0.0

        # 4. 市场参考价（MVP 阶段：游泳为主，参考价 $50 NZD）
        market_reference_price = 50.0

        # 5. 计算节省金额
        # money_saved = (市场价 - 实际成本) × 加权次数
        if weighted_total > 0:
            money_saved = (market_reference_price - average_cost) * weighted_total
        else:
            money_saved = 0.0

        # 6. 计算 ROI 百分比
        # ROI% = (节省金额 / 总投入) × 100
        if total_expense > 0:
            roi_percentage = (money_saved / total_expense) * 100
        else:
            roi_percentage = 0.0

        # 返回 JSON 响应
        return jsonify({
            'total_expense': round(total_expense, 2),
            'total_activities': total_activities,
            'weighted_total': round(weighted_total, 2),
            'average_cost': round(average_cost, 2),
            'market_reference_price': market_reference_price,
            'money_saved': round(money_saved, 2),
            'roi_percentage': round(roi_percentage, 2)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
