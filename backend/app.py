"""
健身房回本计划 - Flask API 主应用

这个文件是 Flask 应用的入口点，负责：
1. 初始化 Flask 应用
2. 配置数据库连接
3. 注册 API 路由
4. 启动开发服务器
"""

from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import os

# ========================================
# 创建 Flask 应用实例
# ========================================
app = Flask(__name__)

# ========================================
# 配置数据库
# ========================================
# SQLite 数据库文件路径
# 使用 os.path.abspath 确保路径正确
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "gym_roi.db")}'

# 关闭 SQLAlchemy 的事件监听（减少内存消耗）
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask 密钥（用于 session 加密）
# 生产环境应该从环境变量读取
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# ========================================
# 配置 CORS（跨域资源共享）
# ========================================
# 允许前端（React）从不同端口访问 API
# 开发环境：http://localhost:5173 (Vite 默认端口)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# ========================================
# 初始化数据库
# ========================================
# 导入 db 和模型
from models import db, Expense, Activity

# 将 db 绑定到 Flask 应用
db.init_app(app)

# ========================================
# 注册 API 路由（蓝图）
# ========================================
from routes.expenses import expenses_bp
from routes.activities import activities_bp

app.register_blueprint(expenses_bp)
app.register_blueprint(activities_bp)

# ========================================
# 健康检查接口
# ========================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查接口

    用途：
    - 测试 API 是否正常运行
    - 检查数据库连接是否正常
    - 前端健康检查

    返回：
    {
      "status": "ok",
      "message": "Backend is running!",
      "timestamp": "2025-10-18T10:30:15"
    }
    """
    return jsonify({
        'status': 'ok',
        'message': 'Backend is running!',
        'timestamp': datetime.now().isoformat()
    })

# ========================================
# 根路由（欢迎页面）
# ========================================
@app.route('/', methods=['GET'])
def index():
    """
    API 根路由

    返回 API 文档链接和可用接口列表
    """
    return jsonify({
        'name': '健身房回本计划 API',
        'version': 'v1.0 (MVP)',
        'endpoints': {
            'health': '/api/health',
            'expenses': '/api/expenses',
            'activities': '/api/activities',
            'roi': '/api/roi/summary'
        },
        'docs': 'https://github.com/chenmq77/duckiki/blob/main/backend/README.md'
    })

# ========================================
# 创建数据库表（首次运行时）
# ========================================
with app.app_context():
    db.create_all()
    print("✅ 数据库表创建成功！")

# ========================================
# 启动开发服务器
# ========================================
if __name__ == '__main__':
    # debug=True: 代码改动时自动重启，显示详细错误信息
    # host='0.0.0.0': 允许局域网访问（开发时可选）
    # port=5000: 默认端口
    app.run(
        debug=True,
        host='0.0.0.0',  # 允许 localhost 和 127.0.0.1 都能访问
        port=5002  # 使用 5002 端口
    )
