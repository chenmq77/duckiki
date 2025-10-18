"""
活动管理 API

提供 CRUD 操作（创建、读取、删除）

特殊功能：
- 创建活动时，自动调用高斯函数计算游泳权重

接口：
- GET    /api/activities       - 获取所有活动
- POST   /api/activities       - 创建新活动（自动计算权重）
- DELETE /api/activities/<id>  - 删除指定活动
"""

from flask import Blueprint, request, jsonify
from models import db, Activity
from utils.gaussian import calculate_swimming_weight
from datetime import datetime

# 创建蓝图
activities_bp = Blueprint('activities', __name__)


# ========================================
# GET /api/activities - 获取所有活动
# ========================================
@activities_bp.route('/api/activities', methods=['GET'])
def get_activities():
    """
    获取所有活动记录

    返回:
    [
      {
        "id": 1,
        "type": "swimming",
        "date": "2025-10-17",
        "distance": 1500,
        "calculated_weight": 1.64,
        "note": "状态不错"
      },
      ...
    ]
    """
    try:
        # 查询所有活动，按日期倒序排列
        activities = Activity.query.order_by(Activity.date.desc()).all()

        # 转换为字典列表
        return jsonify([activity.to_dict() for activity in activities]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========================================
# POST /api/activities - 创建新活动
# ========================================
@activities_bp.route('/api/activities', methods=['POST'])
def create_activity():
    """
    创建新的活动记录

    ⭐ 核心功能：自动计算游泳权重

    请求体（JSON）:
    {
      "type": "swimming",           # 必填（MVP只支持swimming）
      "date": "2025-10-17",         # 必填
      "distance": 1500,             # 必填（游泳距离，米）
      "note": "状态不错"            # 可选
    }

    返回:
    {
      "id": 1,
      "type": "swimming",
      "date": "2025-10-17",
      "distance": 1500,
      "calculated_weight": 1.64,    # ⭐ 自动计算！
      "note": "状态不错"
    }
    """
    try:
        # 获取请求体数据
        data = request.get_json()

        # 验证必填字段
        if not data.get('type'):
            return jsonify({'error': '缺少必填字段：type'}), 400

        if not data.get('date'):
            return jsonify({'error': '缺少必填字段：date'}), 400

        # MVP 阶段只支持游泳
        if data['type'] != 'swimming':
            return jsonify({'error': 'MVP 阶段只支持 swimming 类型'}), 400

        # 验证游泳距离
        if not data.get('distance'):
            return jsonify({'error': '游泳活动缺少必填字段：distance'}), 400

        # ⭐ 核心逻辑：调用高斯函数计算权重
        distance = int(data['distance'])
        calculated_weight = calculate_swimming_weight(distance)

        # 创建 Activity 对象
        activity = Activity(
            type=data['type'],
            date=datetime.fromisoformat(data['date']),
            distance=distance,
            calculated_weight=calculated_weight,  # 存储计算结果
            note=data.get('note')
        )

        # 添加到数据库
        db.session.add(activity)
        db.session.commit()

        # 返回创建的对象
        return jsonify(activity.to_dict()), 201

    except ValueError as e:
        # 数据格式错误（如距离不是数字、日期格式不对）
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        # 其他错误，回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# DELETE /api/activities/<id> - 删除活动
# ========================================
@activities_bp.route('/api/activities/<int:id>', methods=['DELETE'])
def delete_activity(id):
    """
    删除指定的活动记录

    路径参数:
        id (int): 活动记录的 ID

    返回:
        204 No Content (删除成功)
        404 Not Found (找不到该记录)
    """
    try:
        # 查询活动记录
        activity = Activity.query.get_or_404(id)

        # 删除
        db.session.delete(activity)
        db.session.commit()

        # 返回 204 No Content
        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
