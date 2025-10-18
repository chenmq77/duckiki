"""
数据导出路由

提供数据导出功能，生成静态 JSON 文件供 Public 前端使用
"""

from flask import Blueprint, jsonify, request
import json
import os
from datetime import datetime
from models import db, Expense, Activity, Setting, MembershipContract, WeeklyCharge

export_bp = Blueprint('export', __name__, url_prefix='/api/export')

@export_bp.route('/json', methods=['POST'])
def export_to_json():
    """
    导出数据为 JSON 文件

    生成 summary.json 文件到 data/ 目录，包含：
    - ROI 数据（已付 vs 计划）
    - 支出列表
    - 活动列表
    - 最后更新时间

    返回：
    {
      "success": true,
      "file_path": "/data/summary.json",
      "timestamp": "2025-10-19T10:30:00"
    }
    """
    try:
        # 1. 计算 ROI 数据（复用 roi.py 的逻辑）
        setting = Setting.query.filter_by(key='market_reference_price').first()
        market_reference_price = float(setting.value) if setting else 50.0

        activities = Activity.query.all()
        total_activities = len(activities)
        weighted_total = sum(activity.calculated_weight for activity in activities)

        # 已付 ROI
        paid_expenses = Expense.query.filter(
            db.or_(
                db.and_(Expense.is_installment == False, Expense.parent_expense_id == None),
                db.and_(Expense.parent_expense_id != None)
            )
        ).all()

        paid_total = 0.0
        for expense in paid_expenses:
            if expense.parent_expense_id is None:
                paid_total += expense.amount
            else:
                charge = WeeklyCharge.query.filter_by(expense_id=expense.id, status='paid').first()
                if charge:
                    paid_total += expense.amount

        if weighted_total > 0:
            paid_average_cost = paid_total / weighted_total
            paid_money_saved = (market_reference_price - paid_average_cost) * weighted_total
        else:
            paid_average_cost = 0.0
            paid_money_saved = 0.0

        paid_roi_percentage = (paid_money_saved / paid_total * 100) if paid_total > 0 else 0.0

        # 计划 ROI
        all_expenses = Expense.query.filter(
            db.or_(
                db.and_(Expense.is_installment == True, Expense.parent_expense_id == None),
                db.and_(Expense.is_installment == False, Expense.parent_expense_id == None)
            )
        ).all()

        planned_total = sum(expense.amount for expense in all_expenses)

        if weighted_total > 0:
            planned_average_cost = planned_total / weighted_total
            planned_money_saved = (market_reference_price - planned_average_cost) * weighted_total
        else:
            planned_average_cost = 0.0
            planned_money_saved = 0.0

        planned_roi_percentage = (planned_money_saved / planned_total * 100) if planned_total > 0 else 0.0

        roi_summary = {
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
        }

        # 2. 获取所有支出
        expenses = Expense.query.order_by(Expense.date.desc()).all()
        expenses_data = []

        for expense in expenses:
            expense_dict = {
                'id': expense.id,
                'amount': float(expense.amount),
                'currency': expense.currency,
                'date': expense.date.isoformat() if hasattr(expense.date, 'isoformat') else str(expense.date),
                'type': expense.type,
                'category': expense.category,
                'note': expense.note,
                'is_installment': expense.is_installment,
                'parent_expense_id': expense.parent_expense_id
            }

            # 如果是分期合同，添加合同信息
            if expense.is_installment and not expense.parent_expense_id:
                contract = MembershipContract.query.filter_by(expense_id=expense.id).first()
                if contract:
                    charges = WeeklyCharge.query.filter_by(contract_id=contract.id).all()
                    expense_dict['contract_info'] = {
                        'total_periods': len(charges),
                        'paid_periods': len([c for c in charges if c.status == 'paid'])
                    }

            # 如果是分期子支出，添加期数信息
            if expense.parent_expense_id:
                # 找到同父支出的所有子支出
                siblings = Expense.query.filter_by(parent_expense_id=expense.parent_expense_id).order_by(Expense.date).all()
                for idx, sibling in enumerate(siblings):
                    if sibling.id == expense.id:
                        expense_dict['installment_number'] = idx + 1
                        break

                # 找到父支出的类别
                parent = Expense.query.get(expense.parent_expense_id)
                if parent:
                    expense_dict['parent_category'] = parent.category

            expenses_data.append(expense_dict)

        # 3. 获取所有活动
        activities = Activity.query.order_by(Activity.date.desc()).all()
        activities_data = [
            {
                'id': activity.id,
                'distance': activity.distance,
                'date': activity.date.isoformat() if hasattr(activity.date, 'isoformat') else str(activity.date),
                'calculated_weight': float(activity.calculated_weight),
                'note': activity.note
            }
            for activity in activities
        ]

        # 4. 组装完整数据
        export_data = {
            'roi': roi_summary,
            'expenses': expenses_data,
            'activities': activities_data,
            'lastUpdated': datetime.now().isoformat()
        }

        # 5. 确保目录存在并写入文件
        # 获取项目根目录（backend的上上一级）
        # __file__ -> routes/export.py
        # dirname -> routes/
        # dirname -> backend/
        # dirname -> project_root/
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        project_root = os.path.dirname(backend_dir)

        # 6. 只导出到 public-static/data/ 目录（统一位置）
        # - 开发环境: Vite 通过 publicDir 直接访问
        # - 生产构建: vite-plugin-static-copy 会复制到 dist/
        # - Git 提交: 只提交这一个文件
        data_dir = os.path.join(project_root, 'public-static', 'data')
        os.makedirs(data_dir, exist_ok=True)
        file_path = os.path.join(data_dir, 'summary.json')
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)

        return jsonify({
            'success': True,
            'file_path': '/data/summary.json',
            'timestamp': datetime.now().isoformat(),
            'stats': {
                'expenses_count': len(expenses_data),
                'activities_count': len(activities_data),
                'roi_percentage': roi_summary['paid']['roi_percentage']
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
