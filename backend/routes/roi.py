"""
ROI 计算 API

提供健身房投资回报率的统计计算

接口：
- GET /api/roi/summary         - 获取 ROI 摘要统计
- PUT /api/roi/market-price    - 更新市场参考价
"""

from flask import Blueprint, request, jsonify
from models import db, Expense, Activity, Setting

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
        # 1. 市场参考价（从数据库读取，默认 $50 NZD）
        setting = Setting.query.filter_by(key='market_reference_price').first()
        market_reference_price = float(setting.value) if setting else 50.0

        # 2. 获取所有活动并计算加权总次数
        activities = Activity.query.all()
        total_activities = len(activities)
        weighted_total = sum(activity.calculated_weight for activity in activities)

        # 3. 计算两种 ROI：已付 vs 计划

        # 3.1 已付 ROI（仅计算非分期合同父支出 + 已付的分期子支出）
        paid_expenses = Expense.query.filter(
            db.or_(
                db.and_(Expense.is_installment == False, Expense.parent_expense_id == None),  # 全额支出
                db.and_(Expense.parent_expense_id != None)  # 分期子支出（含已付和待付，后续过滤）
            )
        ).all()

        # 过滤出真正已付的支出（通过 WeeklyCharge 的 status）
        from models import WeeklyCharge
        paid_total = 0.0
        for expense in paid_expenses:
            if expense.parent_expense_id is None:
                # 全额支出，直接计入
                paid_total += expense.amount
            else:
                # 分期子支出，检查是否有对应的 paid 状态 charge
                charge = WeeklyCharge.query.filter_by(expense_id=expense.id, status='paid').first()
                if charge:
                    paid_total += expense.amount

        # 计算已付 ROI
        if weighted_total > 0:
            paid_average_cost = paid_total / weighted_total
            paid_money_saved = (market_reference_price - paid_average_cost) * weighted_total
        else:
            paid_average_cost = 0.0
            paid_money_saved = 0.0

        if paid_total > 0:
            paid_roi_percentage = (paid_money_saved / paid_total) * 100
        else:
            paid_roi_percentage = 0.0

        # 3.2 计划 ROI（包含所有支出：已付 + 待付）
        all_expenses = Expense.query.filter(
            db.or_(
                db.and_(Expense.is_installment == True, Expense.parent_expense_id == None),  # 分期合同父支出
                db.and_(Expense.is_installment == False, Expense.parent_expense_id == None)  # 全额支出
            )
        ).all()

        planned_total = sum(expense.amount for expense in all_expenses)

        # 计算计划 ROI
        if weighted_total > 0:
            planned_average_cost = planned_total / weighted_total
            planned_money_saved = (market_reference_price - planned_average_cost) * weighted_total
        else:
            planned_average_cost = 0.0
            planned_money_saved = 0.0

        if planned_total > 0:
            planned_roi_percentage = (planned_money_saved / planned_total) * 100
        else:
            planned_roi_percentage = 0.0

        # 返回 JSON 响应（双重数据）
        return jsonify({
            'total_activities': total_activities,
            'weighted_total': round(weighted_total, 2),
            'market_reference_price': market_reference_price,
            'paid': {
                'total_expense': round(paid_total, 2),
                'average_cost': round(paid_average_cost, 2),
                'money_saved': round(paid_money_saved, 2),
                'roi_percentage': round(paid_roi_percentage, 2)
            },
            'planned': {
                'total_expense': round(planned_total, 2),
                'average_cost': round(planned_average_cost, 2),
                'money_saved': round(planned_money_saved, 2),
                'roi_percentage': round(planned_roi_percentage, 2)
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========================================
# PUT /api/roi/market-price - 更新市场参考价
# ========================================
@roi_bp.route('/api/roi/market-price', methods=['PUT'])
def update_market_price():
    """
    更新市场参考价

    请求体（JSON）:
    {
      "price": 60.0    // 新的市场参考价
    }

    返回:
    {
      "market_reference_price": 60.0,
      "message": "市场参考价更新成功"
    }
    """
    try:
        # 获取请求体数据
        data = request.get_json()

        # 验证必填字段
        if 'price' not in data:
            return jsonify({'error': '缺少必填字段：price'}), 400

        new_price = float(data['price'])

        # 验证价格有效性
        if new_price <= 0:
            return jsonify({'error': '价格必须大于 0'}), 400

        # 查询或创建设置记录
        setting = Setting.query.filter_by(key='market_reference_price').first()

        if setting:
            # 更新现有设置
            setting.value = str(new_price)
        else:
            # 创建新设置
            setting = Setting(
                key='market_reference_price',
                value=str(new_price),
                description='市场参考价格（游泳单次，NZD）'
            )
            db.session.add(setting)

        # 提交事务
        db.session.commit()

        # 返回成功响应
        return jsonify({
            'market_reference_price': new_price,
            'message': '市场参考价更新成功'
        }), 200

    except ValueError as e:
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
