"""
健身房回本计划 - 数据库模型

定义数据库表结构（使用 SQLAlchemy ORM）

表：
1. Expense - 支出记录
2. Activity - 活动记录
3. Setting - 系统设置（如市场参考价）

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

    # 父子关联（支持分期付款）
    parent_expense_id = db.Column(db.Integer, db.ForeignKey('expenses.id'), nullable=True)
    is_installment = db.Column(db.Boolean, default=False)  # 是否为分期合同

    # 关系定义
    children = db.relationship('Expense', backref=db.backref('parent', remote_side=[id]), lazy=True)

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
          "created_at": "2025-10-18T10:30:15",
          "contract_info": {  // 如果是分期合同父记录，包含合同信息
            "total_periods": 52
          }
        }
        """
        result = {
            'id': self.id,
            'type': self.type,
            'category': self.category,
            'amount': self.amount,
            'currency': self.currency,
            'date': self.date.isoformat() if self.date else None,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'parent_expense_id': self.parent_expense_id,
            'is_installment': self.is_installment
        }

        # 如果是分期合同父记录，加入合同信息
        if self.is_installment and not self.parent_expense_id:
            # 查询关联的合同
            try:
                contract = MembershipContract.query.filter_by(expense_id=self.id).first()
                if contract:
                    # 获取合同关联的所有扣费记录数量作为总期数
                    total_periods = WeeklyCharge.query.filter_by(contract_id=contract.id).count()
                    result['contract_info'] = {
                        'total_periods': total_periods
                    }
            except:
                pass  # 如果查询失败，就不添加 contract_info

        return result

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


# ========================================
# Setting 模型（系统设置表）
# ========================================
class Setting(db.Model):
    """
    系统设置表

    用途：存储可配置的系统参数（如市场参考价）

    字段说明：
    - id: 主键（自增）
    - key: 设置键（唯一）
    - value: 设置值（字符串存储，使用时转换）
    - description: 设置说明
    - updated_at: 更新时间（自动更新）
    """

    __tablename__ = 'settings'  # 表名

    # 主键（自增整数）
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 设置键（唯一，不能为空）
    key = db.Column(db.String(100), unique=True, nullable=False)

    # 设置值（字符串存储）
    value = db.Column(db.String(255), nullable=False)

    # 设置说明
    description = db.Column(db.Text)

    # 更新时间（自动更新）
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """
        将数据库记录转换为 Python 字典

        返回:
        {
          "id": 1,
          "key": "market_reference_price",
          "value": "50.0",
          "description": "市场参考价格（游泳单次）",
          "updated_at": "2025-10-18T10:30:15"
        }
        """
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        """
        打印对象时的显示格式

        示例：<Setting market_reference_price=50.0>
        """
        return f'<Setting {self.key}={self.value}>'


# ========================================
# MembershipContract 模型（分期合同表）
# ========================================
class MembershipContract(db.Model):
    """
    分期合同表

    用途：记录分期付款的会员合同信息

    字段说明：
    - id: 主键（自增）
    - expense_id: 关联的父支出 ID
    - total_amount: 合同总金额
    - period_amount: 每期扣费金额
    - period_type: 分期类型（'weekly'=每周 或 'monthly'=每月）
    - day_of_week: 每周扣费日（0=周一, 6=周日，仅 weekly 模式）
    - day_of_month: 每月扣费日（1-28号，仅 monthly 模式）
    - start_date: 合同开始日期
    - end_date: 合同结束日期
    - created_at: 创建时间（自动生成）
    """

    __tablename__ = 'membership_contracts'  # 表名

    # 主键（自增整数）
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 关联父支出（外键）
    expense_id = db.Column(db.Integer, db.ForeignKey('expenses.id'), nullable=False)

    # 合同总金额
    total_amount = db.Column(db.Float, nullable=False)

    # 每期扣费金额（取代 weekly_amount，兼容周/月）
    period_amount = db.Column(db.Float, nullable=False)

    # 分期类型（'weekly' 或 'monthly'）
    period_type = db.Column(db.String(20), default='weekly', nullable=False)

    # 每周扣费日（0=周一, 6=周日）- 仅 period_type='weekly' 时有效
    day_of_week = db.Column(db.Integer, nullable=True)

    # 每月扣费日（1-28号）- 仅 period_type='monthly' 时有效
    day_of_month = db.Column(db.Integer, nullable=True)

    # 合同起止日期
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    # 创建时间（自动生成）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关系定义
    parent_expense = db.relationship('Expense', foreign_keys=[expense_id], backref='contract')
    charges = db.relationship('WeeklyCharge', backref='contract', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """
        将数据库记录转换为 Python 字典

        返回:
        {
          "id": 1,
          "expense_id": 1,
          "total_amount": 916.0,
          "weekly_amount": 17.0,
          "day_of_week": 0,
          "start_date": "2025-01-01",
          "end_date": "2025-12-31",
          "created_at": "2025-10-18T10:30:15"
        }
        """
        return {
            'id': self.id,
            'expense_id': self.expense_id,
            'total_amount': self.total_amount,
            'period_amount': self.period_amount,
            'period_type': self.period_type,
            'day_of_week': self.day_of_week,
            'day_of_month': self.day_of_month,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        打印对象时的显示格式

        示例：<MembershipContract #1: $916 total, $17/week>
        """
        return f'<MembershipContract #{self.id}: ${self.total_amount} total, ${self.period_amount}/{self.period_type}>'


# ========================================
# WeeklyCharge 模型（周扣费记录表）
# ========================================
class WeeklyCharge(db.Model):
    """
    周扣费记录表

    用途：记录每周的扣费详情

    字段说明：
    - id: 主键（自增）
    - contract_id: 关联的合同 ID
    - expense_id: 关联的子支出 ID（已生成的支出记录）
    - charge_date: 扣费日期
    - amount: 扣费金额
    - status: 扣费状态（paid=已付, pending=待付）
    - created_at: 创建时间（自动生成）
    """

    __tablename__ = 'weekly_charges'  # 表名

    # 主键（自增整数）
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 关联合同（外键）
    contract_id = db.Column(db.Integer, db.ForeignKey('membership_contracts.id'), nullable=False)

    # 关联子支出（外键，可为空，待付款时为 NULL）
    expense_id = db.Column(db.Integer, db.ForeignKey('expenses.id'), nullable=True)

    # 扣费日期
    charge_date = db.Column(db.Date, nullable=False)

    # 扣费金额
    amount = db.Column(db.Float, nullable=False)

    # 扣费状态（paid=已付, pending=待付）
    status = db.Column(db.String(20), default='pending', nullable=False)

    # 创建时间（自动生成）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关系定义
    child_expense = db.relationship('Expense', foreign_keys=[expense_id], backref='weekly_charge')

    def to_dict(self):
        """
        将数据库记录转换为 Python 字典

        返回:
        {
          "id": 1,
          "contract_id": 1,
          "expense_id": 2,
          "charge_date": "2025-01-06",
          "amount": 17.0,
          "status": "paid",
          "created_at": "2025-10-18T10:30:15"
        }
        """
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'expense_id': self.expense_id,
            'charge_date': self.charge_date.isoformat() if self.charge_date else None,
            'amount': self.amount,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        打印对象时的显示格式

        示例：<WeeklyCharge #1: $17 on 2025-01-06 (paid)>
        """
        return f'<WeeklyCharge #{self.id}: ${self.amount} on {self.charge_date} ({self.status})>'
