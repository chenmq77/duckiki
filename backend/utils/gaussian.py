"""
游泳距离动态权重计算（高斯惩罚 + 对数奖励）

算法说明：
- 基于需求文档 3.2.2 节的权重计算公式
- 目的：鼓励多游泳，但避免过度（边际收益递减）

公式：
    weight(distance) = {
        exp(-(distance - baseline)² / (2σ²))    if distance ≤ baseline (高斯惩罚)
        1.0 + log(1 + (distance-baseline)/baseline)  if distance > baseline (对数奖励)
    }

参数：
    baseline: 基准距离（默认 1000m）
    sigma: 标准差（默认 550，控制惩罚曲线陡峭程度）

示例：
    500m  → 0.66 (少游，惩罚)
    1000m → 1.0  (基准)
    1100m → 1.10 (多游100m，线性增长)
    1500m → 1.41 (多游500m，对数增长)
    2000m → 1.69 (多游1000m，边际收益递减)
"""

import math


def calculate_swimming_weight(distance, baseline=1000, sigma=550):
    """
    计算游泳距离的动态权重

    参数:
        distance (int): 游泳距离（米）
        baseline (int): 基准距离，默认 1000m
        sigma (int): 标准差，默认 550

    返回:
        float: 权重系数（保留2位小数）

    异常:
        ValueError: 如果 distance < 0

    示例:
        >>> calculate_swimming_weight(500)
        0.66
        >>> calculate_swimming_weight(1000)
        1.0
        >>> calculate_swimming_weight(1100)
        1.10
        >>> calculate_swimming_weight(1500)
        1.41
        >>> calculate_swimming_weight(2000)
        1.69
    """

    # 边界条件：距离必须 >= 0
    if distance < 0:
        raise ValueError(f"游泳距离不能为负数：{distance}m")

    # 距离为 0 时，权重为 0
    if distance == 0:
        return 0.0

    # 计算偏离值（deviation）
    deviation = distance - baseline

    # 计算高斯权重
    # exp(-(deviation²) / (2 × sigma²))
    gaussian_weight = math.exp(-(deviation ** 2) / (2 * sigma ** 2))

    # 非对称奖励机制
    if distance <= baseline:
        # 少于或等于基准：高斯惩罚
        final_weight = gaussian_weight
    else:
        # 多于基准：对数奖励（边际收益递减）
        extra_ratio = (distance - baseline) / baseline
        bonus = math.log(1 + extra_ratio)
        final_weight = 1.0 + bonus

    # 返回结果，保留2位小数
    return round(final_weight, 2)


# ========================================
# 测试函数（可选）
# ========================================
if __name__ == '__main__':
    """
    直接运行此文件时，执行测试

    运行方法：
        python utils/gaussian.py
    """
    print("游泳权重计算测试\n" + "=" * 50)

    # 测试用例（基于对数奖励曲线的实际计算值）
    test_cases = [
        (0, 0.0, "距离为0"),
        (500, 0.66, "少游500m，高斯惩罚"),
        (750, 0.90, "略少于基准"),
        (1000, 1.0, "基准距离"),
        (1100, 1.10, "多游100m，线性增长"),
        (1500, 1.41, "多游500m，对数增长"),
        (2000, 1.69, "多游1000m，边际收益递减"),
        (3000, 2.10, "多游2000m，继续递减")
    ]

    print(f"{'距离 (m)':<12} {'预期权重':<12} {'实际权重':<12} {'状态':<10} {'说明'}")
    print("-" * 70)

    for distance, expected, description in test_cases:
        actual = calculate_swimming_weight(distance)
        status = "✅ PASS" if abs(actual - expected) < 0.01 else "❌ FAIL"
        print(f"{distance:<12} {expected:<12} {actual:<12} {status:<10} {description}")

    print("\n测试完成！")
