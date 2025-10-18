"""
支出管理 API

提供 CRUD 操作（创建、读取、更新、删除）

接口：
- GET    /api/expenses       - 获取所有支出
- POST   /api/expenses       - 创建新支出
- PUT    /api/expenses/<id>  - 更新指定支出
- DELETE /api/expenses/<id>  - 删除指定支出
"""

from flask import Blueprint, request, jsonify
from models import db, Expense
from datetime import datetime

# 创建蓝图（Blueprint）
# 蓝图是 Flask 中组织路由的方式，类似于"子应用"
expenses_bp = Blueprint('expenses', __name__)


# ========================================
# GET /api/expenses - 获取所有支出
# ========================================
@expenses_bp.route('/api/expenses', methods=['GET'])
def get_expenses():
    """
    获取所有支出记录

    返回:
    [
      {
        "id": 1,
        "type": "membership",
        "category": "年卡",
        "amount": 816.0,
        "currency": "NZD",
        "date": "2025-10-17",
        "note": "周扣费年卡"
      },
      ...
    ]
    """
    try:
        # 查询所有支出，按日期倒序排列（最新的在前）
        expenses = Expense.query.order_by(Expense.date.desc()).all()

        # 将数据库对象转换为字典列表
        return jsonify([expense.to_dict() for expense in expenses]), 200

    except Exception as e:
        # 如果发生错误，返回 500 错误
        return jsonify({'error': str(e)}), 500


# ========================================
# POST /api/expenses - 创建新支出
# ========================================
@expenses_bp.route('/api/expenses', methods=['POST'])
def create_expense():
    """
    创建新的支出记录

    请求体（JSON）:
    {
      "type": "membership",         # 必填
      "category": "年卡",           # 可选
      "amount": 816,                # 必填
      "currency": "NZD",            # 可选，默认 NZD
      "date": "2025-10-17",         # 必填
      "note": "周扣费年卡"          # 可选
    }

    返回:
    {
      "id": 1,
      "type": "membership",
      ...
    }
    """
    try:
        # 获取请求体中的 JSON 数据
        data = request.get_json()

        # 验证必填字段
        if not data.get('type'):
            return jsonify({'error': '缺少必填字段：type'}), 400

        if not data.get('amount'):
            return jsonify({'error': '缺少必填字段：amount'}), 400

        if not data.get('date'):
            return jsonify({'error': '缺少必填字段：date'}), 400

        # 创建 Expense 对象
        expense = Expense(
            type=data['type'],
            category=data.get('category'),  # get() 获取可选字段，如果不存在返回 None
            amount=float(data['amount']),
            currency=data.get('currency', 'NZD'),  # 默认值 NZD
            date=datetime.fromisoformat(data['date']),  # 将字符串转为日期对象
            note=data.get('note')
        )

        # 添加到数据库会话
        db.session.add(expense)

        # 提交事务（真正写入数据库）
        db.session.commit()

        # 返回创建的对象，HTTP 状态码 201（Created）
        return jsonify(expense.to_dict()), 201

    except ValueError as e:
        # 数据格式错误（如日期格式不对）
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        # 其他错误，回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# PUT /api/expenses/<id> - 更新支出
# ========================================
@expenses_bp.route('/api/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    """
    更新指定的支出记录

    路径参数:
        id (int): 支出记录的 ID

    请求体（JSON）:
    {
      "type": "membership",         # 可选
      "category": "年卡",           # 可选
      "amount": 900,                # 可选
      "currency": "NZD",            # 可选
      "date": "2025-10-18",         # 可选
      "note": "更新备注"            # 可选
    }

    返回:
        200 OK - 更新成功，返回更新后的数据
        404 Not Found - 找不到该记录
    """
    try:
        # 根据 ID 查询支出记录
        expense = Expense.query.get_or_404(id)

        # 获取请求体中的 JSON 数据
        data = request.get_json()

        # 更新字段（只更新提供的字段）
        if 'type' in data:
            expense.type = data['type']
        if 'category' in data:
            expense.category = data['category']
        if 'amount' in data:
            expense.amount = float(data['amount'])
        if 'currency' in data:
            expense.currency = data['currency']
        if 'date' in data:
            expense.date = datetime.fromisoformat(data['date'])
        if 'note' in data:
            expense.note = data['note']

        # 提交事务
        db.session.commit()

        # 返回更新后的数据
        return jsonify(expense.to_dict()), 200

    except ValueError as e:
        # 数据格式错误
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        # 其他错误，回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# DELETE /api/expenses/<id> - 删除支出
# ========================================
@expenses_bp.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    """
    删除指定的支出记录

    路径参数:
        id (int): 支出记录的 ID

    返回:
        204 No Content (删除成功，无返回内容)
        404 Not Found (找不到该记录)
    """
    try:
        # 根据 ID 查询支出记录
        # get_or_404: 如果找不到，自动返回 404 错误
        expense = Expense.query.get_or_404(id)

        # 删除记录
        db.session.delete(expense)

        # 提交事务
        db.session.commit()

        # 返回 204 No Content（删除成功，无返回内容）
        return '', 204

    except Exception as e:
        # 其他错误，回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
