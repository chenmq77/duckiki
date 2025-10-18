# 健身房回本计划 - 本地启动指南

## 🚀 最简单的方式(推荐)

在项目根目录 `/Users/chenmq/Documents/gym-roi-tracker` 执行:

```bash
./gym
```

这会同时启动管理后台和公开展示页，浏览器会自动打开两个页面。

或者单独启动某个服务:
```bash
./gym admin    # 只启动管理后台
./gym public   # 只启动公开展示页
```

按 `Ctrl+C` 可以停止所有服务。

---

## 其他启动方式

### 方式一:使用独立脚本

#### 启动管理后台
```bash
./start-admin.sh
```
然后访问: http://localhost:5173/

#### 启动公开展示页
```bash
./start-public.sh
```
然后访问: http://localhost:5174/public.html

---

### 方式二:手动启动

#### 1. 启动后端 API
```bash
cd backend
python app.py
```
后端将运行在: http://localhost:5002/

#### 2. 启动管理前端(新终端)
```bash
npm run dev:admin
# 或者
npm run dev
```
管理后台将运行在: http://localhost:5173/

#### 3. 启动公开前端(新终端)
```bash
npm run dev:public
```
公开页将运行在: http://localhost:5174/public.html

---

## 可用的 NPM 脚本

- `npm run dev` - 启动管理端(默认)
- `npm run dev:admin` - 启动管理端
- `npm run dev:public` - 启动公开展示页
- `npm run build` - 构建生产版本到 docs/
- `npm run preview` - 预览构建后的项目

---

## 端口说明

- **5173** - 管理前端开发服务器(Vite)
- **5174** - 公开前端开发服务器(Vite)
- **5002** - 后端 API 服务器(Flask)

---

## 访问地址

### 本地开发
- 管理后台: http://localhost:5173/
- 公开展示页: http://localhost:5174/public.html
- 后端 API: http://localhost:5002/

### 生产环境
- 公开展示页: https://chenmq77.github.io/gym-roi-tracker/

---

## 故障排除

### 端口被占用
如果提示端口被占用,可以手动杀掉进程:
```bash
# 杀掉 5173 端口（管理端）
lsof -ti:5173 | xargs kill -9

# 杀掉 5174 端口（公开端）
lsof -ti:5174 | xargs kill -9

# 杀掉 5002 端口（后端）
lsof -ti:5002 | xargs kill -9
```

### 权限问题
如果启动脚本提示权限不足:
```bash
chmod +x start-admin.sh start-public.sh
```

---

## 部署到 GitHub Pages

### 1. 导出数据
在管理后台点击"导出数据"按钮,数据会保存到 `public-static/data/summary.json`

### 2. 构建项目
```bash
npm run build
```

### 3. 重命名并复制数据
```bash
cd docs
mv public.html index.html
cp -r public-static/* .
cd ..
```

### 4. 提交并推送
```bash
git add -A
git commit -m "Update deployment"
git push
```

GitHub Actions 会自动部署到: https://chenmq77.github.io/gym-roi-tracker/
