import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	// 头像
	avatar: "/assets/images/avatar.png",

	// 名字
	name: "skad",

	// 个人签名
	bio: "Hello, I'm skad.",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		// {
		// 	name: "Bilibli",
		// 	icon: "fa7-brands:bilibili",
		// 	url: "https://space.bilibili.com/38932988",
		// 	showName: false,
		// },
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/Skadli",
			showName: false,
		},
		{
			name: "Email",
			icon: "fa7-solid:envelope",
			url: "mailto:skaduv@gmail.com",
			showName: false,
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			showName: false,
		},
	],
};
