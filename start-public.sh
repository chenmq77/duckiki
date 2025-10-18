#!/bin/bash

# 健身房回本计划 - 启动公开展示页
# 用法: ./start-public.sh

echo "🚀 启动健身房回本计划公开展示页..."
echo ""

# 杀掉已有的进程
echo "📦 清理旧进程..."
lsof -ti:5002 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null
sleep 1

# 启动后端
echo "🔧 启动后端 API (端口 5002)..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端
echo "⚛️  启动公开前端 (端口 5173)..."
npm run dev:public &
FRONTEND_PID=$!

echo ""
echo "✅ 启动完成!"
echo ""
echo "📍 访问地址:"
echo "   公开展示页: http://localhost:5174/public.html"
echo "   后端 API: http://localhost:5002/"
echo ""
echo "💡 按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 停止所有服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 保持脚本运行
wait
