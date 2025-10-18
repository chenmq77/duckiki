"""
健身房回本计划 - 数据库模型

定义数据库表结构（使用 SQLAlchemy ORM）

表：
1. Expense - 支出记录
2. Activity - 活动记录

为什么用 ORM？
- 不需要写 SQL 语句
- Python 对象 ↔ 数据库记录 自动转换
- 类型安全，减少错误
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# 从 app.py 导入 db 实例
# 注意：这里会有循环导入问题，所以我们需要重构
# 先创建 db 实例，再在 app.py 中初始化

db = SQLAlchemy()

# ========================================
# Expense 模型（支出表）
# ========================================
class Expense(db.Model):
    """
    支出记录表

    用途：记录健身房会员费、装备等支出

    字段说明：
    - id: 主键（自增）
    - type: 支出类型（membership=会员卡, equipment=装备）
    - category: 分类（如"年卡"、"游泳装备"）
    - amount: 金额
    - currency: 货币（NZD 或 RMB）
    - date: 支出日期
    - note: 备注
    - created_at: 创建时间（自动生成）
    """

    __tablename__ = 'expenses'  # 表名

    # 主键（自增整数）
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 支出类型（不能为空）
    # 'membership': 会员卡
    # 'equipment': 装备
    type = db.Column(db.String(50), nullable=False)

    # 分类（可选）
    category = db.Column(db.String(100))

    # 金额（不能为空）
    amount = db.Column(db.Float, nullable=False)

    # 货币（默认 NZD）
    currency = db.Column(db.String(10), default='NZD')

    # 支出日期（不能为空）
    date = db.Column(db.Date, nullable=False)

    # 备注（可选）
    note = db.Column(db.Text)

    # 创建时间（自动生成）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        将数据库记录转换为 Python 字典（方便转 JSON）

        返回:
        {
          "id": 1,
          "type": "membership",
          "category": "年卡",
          "amount": 816.0,
          "currency": "NZD",
          "date": "2025-10-17",
          "note": "周扣费年卡",
          "created_at": "2025-10-18T10:30:15"
        }
        """
        return {
            'id': self.id,
            'type': self.type,
            'category': self.category,
            'amount': self.amount,
            'currency': self.currency,
            'date': self.date.isoformat() if self.date else None,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        打印对象时的显示格式（方便调试）

        示例：<Expense #1: 年卡 $816 NZD>
        """
        return f'<Expense #{self.id}: {self.category} ${self.amount} {self.currency}>'


# ========================================
# Activity 模型（活动表）
# ========================================
class Activity(db.Model):
    """
    活动记录表

    用途：记录游泳、团课、私教等健身活动

    字段说明：
    - id: 主键（自增）
    - type: 活动类型（swimming=游泳）
    - date: 活动日期
    - distance: 游泳距离（米）
    - calculated_weight: 计算出的权重（基于高斯函数）
    - note: 备注
    - created_at: 创建时间（自动生成）
    """

    __tablename__ = 'activities'  # 表名

    # 主键（自增整数）
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 活动类型（不能为空）
    # MVP 阶段只支持 'swimming'
    type = db.Column(db.String(50), nullable=False)

    # 活动日期（不能为空）
    date = db.Column(db.Date, nullable=False)

    # 游泳距离（米）
    distance = db.Column(db.Integer)

    # 计算出的权重（由后端自动计算）
    calculated_weight = db.Column(db.Float)

    # 备注（可选）
    note = db.Column(db.Text)

    # 创建时间（自动生成）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        将数据库记录转换为 Python 字典

        返回:
        {
          "id": 1,
          "type": "swimming",
          "date": "2025-10-17",
          "distance": 1500,
          "calculated_weight": 1.64,
          "note": "状态不错",
          "created_at": "2025-10-18T10:30:15"
        }
        """
        return {
            'id': self.id,
            'type': self.type,
            'date': self.date.isoformat() if self.date else None,
            'distance': self.distance,
            'calculated_weight': self.calculated_weight,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        打印对象时的显示格式

        示例：<Activity #1: swimming 1500m weight=1.64>
        """
        return f'<Activity #{self.id}: {self.type} {self.distance}m weight={self.calculated_weight}>'
