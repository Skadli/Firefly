// 字体配置
export const fontConfig = {
	// 是否启用自定义字体功能
	enable: true,
	// 是否预加载字体文件
	preload: true,
	// 当前选择的字体，支持多个字体组合
	selected: ["lxgw-wenkai", "lato"],

	// 字体列表
	fonts: {
		// 系统字体
		system: {
			id: "system",
			name: "系统字体",
			src: "", // 系统字体无需 src
			family:
				"system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
		},

		// Google Fonts - Zen Maru Gothic
		"zen-maru-gothic": {
			id: "zen-maru-gothic",
			name: "Zen Maru Gothic",
			src: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap",
			family: "Zen Maru Gothic",
			display: "swap" as const,
		},

		// --- 方案一：霞鹜文楷 (屏幕阅读优化版) ---
		"lxgw-wenkai": {
			id: "lxgw-wenkai",
			name: "LXGW WenKai Screen",
			// 使用 npm CDN 加载，速度通常比 Google Fonts 快
			src: "https://npm.elemecdn.com/lxgw-wenkai-screen-webfont/style.css",
			family: "LXGW WenKai Screen",
			display: "swap" as const,
		},

		// --- 方案二：思源宋体 (Google Fonts) ---
		"noto-serif-sc": {
			id: "noto-serif-sc",
			name: "Noto Serif SC",
			src: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap",
			family: "Noto Serif SC",
			display: "swap" as const,
		},

		// --- 方案三：Lato (非常优雅的英文字体，建议搭配中文字体使用) ---
		lato: {
			id: "lato",
			name: "Lato",
			src: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
			family: "Lato",
			display: "swap" as const,
		},
	},

	// 全局字体回退
	fallback: [
		"LXGW WenKai Screen", // 如果你选了方案一，把这个放在最前面
		"-apple-system",
		"BlinkMacSystemFont",
		"PingFang SC", // 苹果默认中文字体
		"Hiragino Sans GB",
		"Microsoft YaHei", // Windows 默认
		"sans-serif",
	],
};
