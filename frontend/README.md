# Disease Network Visualization - Frontend

这是一个基于 React 和 Cytoscape.js 的疾病网络可视化前端应用。

## 🚀 技术栈

- **React 18.3.1** - 现代化的 UI 框架
- **Vite 5.4.10** - 快速的构建工具
- **Cytoscape.js 3.30.2** - 强大的网络图可视化库
- **Axios 1.7.7** - HTTP 客户端
- **Cola & COSE Bilkent** - 高级图布局算法

## 📦 安装与运行

### 方式 1: 使用启动脚本（推荐）

**Windows:**
```bash
.\start_frontend.bat
```

**Linux/Mac:**
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

### 方式 2: 手动启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🌐 访问地址

- 前端应用: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 🎨 功能特性

### 1. 网络可视化
- ✅ Cytoscape.js 网络渲染
- ✅ 多种布局算法（COSE Bilkent, Cola, Circle, Grid）
- ✅ 节点着色（绿色=可解释，灰色=不可解释）
- ✅ 边宽度基于权重的 log 变换
- ✅ 缩放、平移、拖拽交互
- ✅ 导出为 PNG 图片

### 2. 交互功能
- ✅ 节点点击显示连接疾病和统计信息
- ✅ 边点击显示共享基因、通路和 GPT-4o 解释
- ✅ 高亮邻居节点和边
- ✅ 点击空白处取消选择

### 3. 过滤和搜索
- ✅ 权重阈值滑块（0-1）
- ✅ 快速过滤按钮（全部/中等/较高/很高）
- ✅ 可解释性过滤（全部/YES/NO）
- ✅ 显示数量限制（100-5000 条边）
- ✅ 疾病名称搜索（防抖、自动完成）

### 4. 详情面板
- ✅ 节点详情：基本信息、连接统计、连接的疾病列表
- ✅ 边详情：连接信息、共享基因列表、共享通路列表
- ✅ **GPT-4o 解释高亮显示**
- ✅ 实时数据加载

### 5. 用户体验
- ✅ 响应式布局（支持移动端）
- ✅ 加载状态指示器
- ✅ 深色/浅色主题自适应
- ✅ 自定义滚动条样式
- ✅ 平滑动画和过渡效果

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── NetworkVisualization.jsx   # 网络可视化主组件
│   │   ├── NetworkVisualization.css
│   │   ├── DetailPanel.jsx            # 详情面板组件
│   │   ├── DetailPanel.css
│   │   ├── FilterPanel.jsx            # 过滤控制组件
│   │   └── FilterPanel.css
│   ├── services/            # API 服务层
│   │   └── api.js          # Axios 实例和 API 封装
│   ├── App.jsx             # 主应用组件
│   ├── App.css             # 主应用样式
│   ├── main.jsx            # 应用入口
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
├── package.json           # 依赖配置
├── start_frontend.bat     # Windows 启动脚本
└── start_frontend.sh      # Unix 启动脚本
```

## 🔌 API 集成

前端通过 Vite 代理连接到后端 API：

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

使用的 API 端点：
- `GET /network` - 获取网络数据（支持过滤）
- `GET /disease/{id}` - 获取特定疾病的边
- `GET /edge/{id}` - 获取边的详细信息
- `GET /search` - 搜索疾病
- `GET /stats` - 获取统计信息
- `GET /health` - 健康检查

## 🎯 使用说明

### 基本操作

1. **查看网络**
   - 启动应用后，网络会自动加载并显示
   - 默认过滤：权重 ≥ 0.75（75th percentile）
   - 默认显示：500 条边

2. **浏览网络**
   - 鼠标拖拽：平移视图
   - 滚轮：缩放视图
   - 点击节点/边：查看详情
   - 点击空白：取消选择

3. **应用过滤器**
   - 左侧面板调整权重阈值
   - 选择可解释性过滤
   - 调整显示数量限制
   - 点击"重置过滤器"恢复默认

4. **搜索疾病**
   - 在搜索框输入疾病名称
   - 从下拉列表选择结果
   - 自动高亮相关节点

5. **查看详情**
   - **节点详情**：疾病名称、连接统计、相关疾病列表
   - **边详情**：共享基因、共享通路、GPT-4o 解释

6. **导出图片**
   - 点击"📷 导出"按钮
   - 自动下载 PNG 图片（2倍分辨率）

### 高级功能

- **切换布局算法**：顶部下拉菜单选择不同布局
- **适应视图**：点击"🔍 适应视图"自动调整缩放
- **重置缩放**：点击"⟲ 重置"恢复默认视图

## 🐛 故障排除

### 前端无法连接到后端

1. 确认后端服务已启动：
```bash
cd ../backend
python main.py
```

2. 检查后端地址：http://localhost:8000/health

3. 检查浏览器控制台错误信息

### 网络无法显示

1. 检查后端数据是否已处理：
```bash
cd ../backend
python data_processor.py
```

2. 确认 `backend/data/processed_network.json` 文件存在

3. 清除浏览器缓存并刷新

### 性能问题

1. 减少显示的边数量（左侧面板）
2. 提高权重阈值过滤
3. 使用更快的布局算法（Grid 或 Circle）

## 📊 数据说明

### 节点（疾病）
- **ID**: 疾病唯一标识符
- **Label**: 疾病名称
- **Interpretable**: 是否有 GPT-4o 解释

### 边（疾病关系）
- **Weight**: 疾病相似度（0-1）
- **Shared Genes**: 共享的差异表达基因
- **Shared Pathways**: 共享的信号通路
- **Reason (GPT-4o)**: AI 生成的关系解释

## 🔄 开发模式

### 热重载
Vite 提供快速的热模块替换（HMR），修改代码后自动刷新。

### ESLint
运行代码检查：
```bash
npm run lint
```

### 构建生产版本
```bash
npm run build
```
输出到 `dist/` 目录。

## 📝 依赖版本（2025年10月最新）

| 包名 | 版本 | 用途 |
|------|------|------|
| react | 18.3.1 | UI 框架 |
| react-dom | 18.3.1 | React DOM 渲染 |
| cytoscape | 3.30.2 | 网络图可视化 |
| cytoscape-cola | 2.5.1 | Cola 布局算法 |
| cytoscape-cose-bilkent | 4.1.0 | COSE Bilkent 布局 |
| axios | 1.7.7 | HTTP 客户端 |
| vite | 5.4.10 | 构建工具 |
| @vitejs/plugin-react | 4.3.3 | React 插件 |
| eslint | 9.13.0 | 代码检查 |

## 🎨 自定义样式

### 修改主题颜色
编辑 `src/index.css` 中的 CSS 变量：
```css
:root {
  --primary-color: #646cff;
  --success-color: #4CAF50;
  --background-color: #242424;
}
```

### 修改节点样式
编辑 `src/components/NetworkVisualization.jsx` 中的 Cytoscape 样式配置。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**🎉 享受探索疾病网络的乐趣！**
