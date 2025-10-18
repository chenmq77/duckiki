"""
分期合同 API

提供分期付款合同的 CRUD 操作

接口：
- POST /api/contracts              - 创建分期合同并生成周扣费记录
- GET /api/contracts               - 获取所有合同
- GET /api/contracts/:id           - 获取合同详情及扣费列表
- PUT /api/contracts/:id           - 更新合同并重新生成扣费记录
- PUT /api/contracts/:id/charges/:charge_id  - 更新某期扣费
- DELETE /api/contracts/:id        - 删除合同及所有相关记录
- POST /api/expenses/:id/convert-to-installment  - 将全额支出转为分期
"""

from flask import Blueprint, request, jsonify
from models import db, Expense, MembershipContract, WeeklyCharge
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta, MO, TU, WE, TH, FR, SA, SU

# 创建蓝图
contracts_bp = Blueprint('contracts', __name__)

# 周几映射
WEEKDAY_MAP = {
    0: MO,  # 周一
    1: TU,  # 周二
    2: WE,  # 周三
    3: TH,  # 周四
    4: FR,  # 周五
    5: SA,  # 周六
    6: SU   # 周日
}


def generate_weekly_charge_dates(start_date, end_date, day_of_week):
    """
    生成所有周扣费日期列表

    参数:
    - start_date: 开始日期（Date 对象）
    - end_date: 结束日期（Date 对象）
    - day_of_week: 扣费日（0-6，0=周一）

    返回:
    - 日期列表 [date1, date2, ...]
    """
    dates = []
    current = start_date

    # 找到第一个扣费日
    # 使用 relativedelta 调整到指定的周几
    weekday = WEEKDAY_MAP[day_of_week]
    first_charge_date = current + relativedelta(weekday=weekday)

    # 如果第一个扣费日在开始日期之前，跳到下一周
    if first_charge_date < current:
        first_charge_date += timedelta(weeks=1)

    current = first_charge_date

    # 生成所有扣费日期（不包含 end_date 本身，end_date 是最后一天的上限）
    while current < end_date:
        dates.append(current)
        current += timedelta(weeks=1)

    return dates


def generate_monthly_charge_dates(start_date, end_date, day_of_month):
    """
    生成所有月扣费日期列表

    参数:
    - start_date: 开始日期（Date 对象）
    - end_date: 结束日期（Date 对象）
    - day_of_month: 每月扣费日（1-28）

    返回:
    - 日期列表 [date1, date2, ...]
    """
    dates = []
    current = start_date

    # 找到第一个扣费日期
    # 如果开始日期的日期数 <= 扣费日，使用当月的扣费日
    # 否则使用下个月的扣费日
    if current.day <= day_of_month:
        first_charge_date = current.replace(day=day_of_month)
    else:
        # 下个月
        next_month = current + relativedelta(months=1)
        first_charge_date = next_month.replace(day=day_of_month)

    current = first_charge_date

    # 生成所有扣费日期（不包含 end_date 本身，end_date 是最后一天的上限）
    while current < end_date:
        dates.append(current)
        # 每次加一个月
        current = current + relativedelta(months=1)

    return dates


# ========================================
# POST /api/contracts - 创建分期合同
# ========================================
@contracts_bp.route('/api/contracts', methods=['POST'])
def create_contract():
    """
    创建分期合同并自动生成周扣费记录

    请求体（JSON）:
    {
      "type": "membership",        // 支出类型
      "category": "年卡",           // 分类
      "total_amount": 916.0,       // 合同总金额
      "weekly_amount": 17.0,       // 每周扣费金额
      "currency": "NZD",           // 货币
      "day_of_week": 0,            // 扣费日（0=周一, 6=周日）
      "start_date": "2025-01-01",  // 开始日期
      "end_date": "2025-12-31",    // 结束日期
      "note": "备注"
    }

    返回:
    {
      "contract": {...},
      "charges_count": 52,
      "paid_count": 10,
      "pending_count": 42
    }
    """
    try:
        # 获取请求体数据
        data = request.get_json()

        # 验证必填字段
        required_fields = ['type', 'total_amount', 'period_amount', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必填字段：{field}'}), 400

        # 获取分期类型（默认为 weekly）
        period_type = data.get('period_type', 'weekly')

        # 根据分期类型验证扣费日字段
        if period_type == 'weekly':
            if 'day_of_week' not in data:
                return jsonify({'error': '周扣费模式需要提供 day_of_week'}), 400
        elif period_type == 'monthly':
            if 'day_of_month' not in data:
                return jsonify({'error': '月扣费模式需要提供 day_of_month'}), 400
        else:
            return jsonify({'error': f'不支持的分期类型：{period_type}'}), 400

        # 解析日期
        start_date = datetime.fromisoformat(data['start_date']).date()
        end_date = datetime.fromisoformat(data['end_date']).date()

        # 验证日期合法性
        if start_date >= end_date:
            return jsonify({'error': '开始日期必须早于结束日期'}), 400

        # 1. 创建父支出记录
        parent_expense = Expense(
            type=data['type'],
            category=data.get('category', ''),
            amount=float(data['total_amount']),
            currency=data.get('currency', 'NZD'),
            date=start_date,
            note=data.get('note', ''),
            is_installment=True
        )
        db.session.add(parent_expense)
        db.session.flush()  # 获取 parent_expense.id

        # 2. 创建合同记录
        contract = MembershipContract(
            expense_id=parent_expense.id,
            total_amount=float(data['total_amount']),
            period_amount=float(data['period_amount']),
            period_type=period_type,
            day_of_week=int(data['day_of_week']) if period_type == 'weekly' else None,
            day_of_month=int(data['day_of_month']) if period_type == 'monthly' else None,
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(contract)
        db.session.flush()  # 获取 contract.id

        # 3. 生成所有扣费日期（根据分期类型）
        if period_type == 'weekly':
            charge_dates = generate_weekly_charge_dates(start_date, end_date, contract.day_of_week)
        else:  # monthly
            charge_dates = generate_monthly_charge_dates(start_date, end_date, contract.day_of_month)

        today = datetime.now().date()
        paid_count = 0
        pending_count = 0

        # 4. 为每个扣费日生成记录
        for charge_date in charge_dates:
            # 判断状态：过去的日期 = 已付，未来的日期 = 待付
            if charge_date <= today:
                status = 'paid'
                paid_count += 1

                # 创建子支出记录（已付）
                child_expense = Expense(
                    type=data['type'],
                    category=data.get('category', ''),
                    amount=contract.period_amount,
                    currency=data.get('currency', 'NZD'),
                    date=charge_date,
                    note=f"{data.get('category', '分期')} - 第 {paid_count} 期",
                    parent_expense_id=parent_expense.id,
                    is_installment=False
                )
                db.session.add(child_expense)
                db.session.flush()

                # 创建扣费记录（关联子支出）
                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=child_expense.id,
                    charge_date=charge_date,
                    amount=contract.period_amount,
                    status=status
                )
            else:
                status = 'pending'
                pending_count += 1

                # 创建扣费记录（待付，不创建子支出）
                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=None,  # 待付款时没有支出记录
                    charge_date=charge_date,
                    amount=contract.period_amount,
                    status=status
                )

            db.session.add(weekly_charge)

        # 5. 提交所有事务
        db.session.commit()

        # 6. 返回结果
        return jsonify({
            'contract': contract.to_dict(),
            'parent_expense': parent_expense.to_dict(),
            'charges_count': len(charge_dates),
            'paid_count': paid_count,
            'pending_count': pending_count,
            'message': '合同创建成功'
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# GET /api/contracts - 获取所有合同
# ========================================
@contracts_bp.route('/api/contracts', methods=['GET'])
def get_all_contracts():
    """
    获取所有合同列表

    返回:
    [
      {
        "id": 1,
        "total_amount": 916.0,
        "weekly_amount": 17.0,
        ...
      }
    ]
    """
    try:
        contracts = MembershipContract.query.all()
        return jsonify([contract.to_dict() for contract in contracts]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========================================
# GET /api/contracts/:id - 获取合同详情
# ========================================
@contracts_bp.route('/api/contracts/<int:id>', methods=['GET'])
def get_contract(id):
    """
    获取合同详情及所有扣费记录

    返回:
    {
      "contract": {...},
      "charges": [...]
    }
    """
    try:
        contract = MembershipContract.query.get_or_404(id)
        charges = WeeklyCharge.query.filter_by(contract_id=id).order_by(WeeklyCharge.charge_date).all()

        return jsonify({
            'contract': contract.to_dict(),
            'charges': [charge.to_dict() for charge in charges]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========================================
# PUT /api/contracts/:id/charges/:charge_id - 更新扣费记录
# ========================================
@contracts_bp.route('/api/contracts/<int:id>/charges/<int:charge_id>', methods=['PUT'])
def update_charge(id, charge_id):
    """
    更新某期扣费记录（金额、状态等）

    请求体（JSON）:
    {
      "amount": 15.0,      // 可选：修改金额
      "status": "paid"     // 可选：修改状态
    }

    返回:
    {
      "charge": {...},
      "message": "更新成功"
    }
    """
    try:
        charge = WeeklyCharge.query.get_or_404(charge_id)

        # 验证 charge 属于该合同
        if charge.contract_id != id:
            return jsonify({'error': '扣费记录不属于该合同'}), 400

        data = request.get_json()

        # 更新金额
        if 'amount' in data:
            charge.amount = float(data['amount'])

        # 更新状态
        if 'status' in data:
            new_status = data['status']

            # 如果从 pending 变为 paid，需要创建子支出
            if charge.status == 'pending' and new_status == 'paid':
                contract = MembershipContract.query.get(charge.contract_id)
                parent_expense = Expense.query.get(contract.expense_id)

                # 创建子支出
                child_expense = Expense(
                    type=parent_expense.type,
                    category=parent_expense.category,
                    amount=charge.amount,
                    currency=parent_expense.currency,
                    date=charge.charge_date,
                    note=f"{parent_expense.category} - 补录",
                    parent_expense_id=parent_expense.id,
                    is_installment=False
                )
                db.session.add(child_expense)
                db.session.flush()

                charge.expense_id = child_expense.id

            # 如果从 paid 变为 pending，删除子支出
            elif charge.status == 'paid' and new_status == 'pending':
                if charge.expense_id:
                    child_expense = Expense.query.get(charge.expense_id)
                    if child_expense:
                        db.session.delete(child_expense)
                    charge.expense_id = None

            charge.status = new_status

        db.session.commit()

        return jsonify({
            'charge': charge.to_dict(),
            'message': '更新成功'
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# PUT /api/contracts/:id - 更新合同
# ========================================
@contracts_bp.route('/api/contracts/<int:id>', methods=['PUT'])
def update_contract(id):
    """
    更新合同并重新生成扣费记录

    请求体（JSON）:
    {
      "total_amount": 916.0,
      "period_amount": 17.0,
      "period_type": "weekly",
      "day_of_week": 0,
      "day_of_month": null,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31"
    }

    返回:
    {
      "contract": {...},
      "charges_count": 52,
      "message": "合同更新成功"
    }
    """
    try:
        contract = MembershipContract.query.get_or_404(id)
        parent_expense = Expense.query.get(contract.expense_id)

        if not parent_expense:
            return jsonify({'error': '未找到关联的父支出'}), 404

        data = request.get_json()

        # 更新合同字段
        if 'total_amount' in data:
            contract.total_amount = float(data['total_amount'])
            parent_expense.amount = float(data['total_amount'])

        if 'period_amount' in data:
            contract.period_amount = float(data['period_amount'])

        if 'period_type' in data:
            contract.period_type = data['period_type']

        if 'day_of_week' in data:
            contract.day_of_week = int(data['day_of_week']) if data['day_of_week'] is not None else None

        if 'day_of_month' in data:
            contract.day_of_month = int(data['day_of_month']) if data['day_of_month'] is not None else None

        if 'start_date' in data:
            contract.start_date = datetime.fromisoformat(data['start_date']).date()
            parent_expense.date = contract.start_date

        if 'end_date' in data:
            contract.end_date = datetime.fromisoformat(data['end_date']).date()

        # 验证日期合法性
        if contract.start_date >= contract.end_date:
            return jsonify({'error': '开始日期必须早于结束日期'}), 400

        # 1. 保存已付款期的状态（日期 -> 是否已付）
        old_charges = WeeklyCharge.query.filter_by(contract_id=id).all()
        paid_dates = set()
        for charge in old_charges:
            if charge.status == 'paid':
                paid_dates.add(charge.charge_date)

        # 2. 删除所有旧的子支出记录
        for charge in old_charges:
            if charge.expense_id:
                child_expense = Expense.query.get(charge.expense_id)
                if child_expense:
                    db.session.delete(child_expense)

        # 3. 删除所有旧的扣费记录
        WeeklyCharge.query.filter_by(contract_id=id).delete()

        # 4. 重新生成扣费日期（根据新的分期类型）
        if contract.period_type == 'weekly':
            if contract.day_of_week is None:
                return jsonify({'error': '周扣费模式需要提供 day_of_week'}), 400
            charge_dates = generate_weekly_charge_dates(
                contract.start_date,
                contract.end_date,
                contract.day_of_week
            )
        elif contract.period_type == 'monthly':
            if contract.day_of_month is None:
                return jsonify({'error': '月扣费模式需要提供 day_of_month'}), 400
            charge_dates = generate_monthly_charge_dates(
                contract.start_date,
                contract.end_date,
                contract.day_of_month
            )
        else:
            return jsonify({'error': f'不支持的分期类型：{contract.period_type}'}), 400

        today = datetime.now().date()
        paid_count = 0
        pending_count = 0

        # 5. 创建新的扣费记录
        for charge_date in charge_dates:
            # 如果这个日期之前已经支付过，或者日期在今天之前，标记为已付
            if charge_date in paid_dates or charge_date <= today:
                status = 'paid'
                paid_count += 1

                # 创建新的子支出
                child_expense = Expense(
                    type=parent_expense.type,
                    category=parent_expense.category,
                    amount=contract.period_amount,
                    currency=parent_expense.currency,
                    date=charge_date,
                    note=f"{parent_expense.category} - 第 {paid_count} 期",
                    parent_expense_id=parent_expense.id,
                    is_installment=False
                )
                db.session.add(child_expense)
                db.session.flush()

                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=child_expense.id,
                    charge_date=charge_date,
                    amount=contract.period_amount,
                    status=status
                )
            else:
                status = 'pending'
                pending_count += 1

                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=None,
                    charge_date=charge_date,
                    amount=contract.period_amount,
                    status=status
                )

            db.session.add(weekly_charge)

        # 6. 提交所有更改
        db.session.commit()

        return jsonify({
            'contract': contract.to_dict(),
            'charges_count': len(charge_dates),
            'paid_count': paid_count,
            'pending_count': pending_count,
            'message': '合同更新成功'
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# DELETE /api/contracts/:id - 删除合同
# ========================================
@contracts_bp.route('/api/contracts/<int:id>', methods=['DELETE'])
def delete_contract(id):
    """
    删除合同及所有相关记录（级联删除）

    删除内容：
    - 合同记录
    - 所有周扣费记录
    - 所有子支出记录
    - 父支出记录
    """
    try:
        contract = MembershipContract.query.get_or_404(id)
        parent_expense_id = contract.expense_id

        # 1. 删除所有已付的子支出
        charges = WeeklyCharge.query.filter_by(contract_id=id).all()
        for charge in charges:
            if charge.expense_id:
                child_expense = Expense.query.get(charge.expense_id)
                if child_expense:
                    db.session.delete(child_expense)

        # 2. 删除合同（会级联删除所有 weekly_charges）
        db.session.delete(contract)

        # 3. 删除父支出
        parent_expense = Expense.query.get(parent_expense_id)
        if parent_expense:
            db.session.delete(parent_expense)

        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========================================
# POST /api/expenses/:id/convert-to-installment - 转换为分期
# ========================================
@contracts_bp.route('/api/expenses/<int:id>/convert-to-installment', methods=['POST'])
def convert_to_installment(id):
    """
    将已有的全额支出转换为分期合同

    请求体（JSON）:
    {
      "weekly_amount": 17.0,
      "day_of_week": 0,
      "end_date": "2025-12-31"
    }

    返回:
    {
      "contract": {...},
      "charges_count": 52
    }
    """
    try:
        # 查找原支出
        expense = Expense.query.get_or_404(id)

        # 验证是否已经是分期
        if expense.is_installment:
            return jsonify({'error': '该支出已经是分期合同'}), 400

        data = request.get_json()

        # 验证必填字段
        required_fields = ['weekly_amount', 'day_of_week', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必填字段：{field}'}), 400

        start_date = expense.date
        end_date = datetime.fromisoformat(data['end_date']).date()

        # 将原支出标记为分期合同
        expense.is_installment = True

        # 创建合同记录
        contract = MembershipContract(
            expense_id=expense.id,
            total_amount=expense.amount,
            weekly_amount=float(data['weekly_amount']),
            day_of_week=int(data['day_of_week']),
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(contract)
        db.session.flush()

        # 生成周扣费记录（逻辑同上）
        charge_dates = generate_weekly_charge_dates(start_date, end_date, contract.day_of_week)

        today = datetime.now().date()
        paid_count = 0

        for charge_date in charge_dates:
            if charge_date <= today:
                status = 'paid'
                paid_count += 1

                child_expense = Expense(
                    type=expense.type,
                    category=expense.category,
                    amount=contract.weekly_amount,
                    currency=expense.currency,
                    date=charge_date,
                    note=f"{expense.category} - 第 {paid_count} 期",
                    parent_expense_id=expense.id,
                    is_installment=False
                )
                db.session.add(child_expense)
                db.session.flush()

                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=child_expense.id,
                    charge_date=charge_date,
                    amount=contract.weekly_amount,
                    status=status
                )
            else:
                status = 'pending'
                weekly_charge = WeeklyCharge(
                    contract_id=contract.id,
                    expense_id=None,
                    charge_date=charge_date,
                    amount=contract.weekly_amount,
                    status=status
                )

            db.session.add(weekly_charge)

        db.session.commit()

        return jsonify({
            'contract': contract.to_dict(),
            'charges_count': len(charge_dates),
            'message': '成功转换为分期合同'
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'数据格式错误：{str(e)}'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
