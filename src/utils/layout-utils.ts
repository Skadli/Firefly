import { backgroundWallpaper } from "../config";

// 从字符串或字符串数组中随机选择一个值
function pickRandom(src: string | string[] | undefined): string {
	if (!src) return "";
	if (typeof src === "string") return src;
	if (src.length === 0) return "";
	return src[Math.floor(Math.random() * src.length)];
}

// 背景图片处理工具函数
export const getBackgroundImages = () => {
	const bgSrc = backgroundWallpaper.src;

	if (
		typeof bgSrc === "object" &&
		bgSrc !== null &&
		!Array.isArray(bgSrc) &&
		("desktop" in bgSrc || "mobile" in bgSrc)
	) {
		const srcObj = bgSrc as {
			desktop?: string | string[];
			mobile?: string | string[];
		};
		const desktop = pickRandom(srcObj.desktop) || pickRandom(srcObj.mobile);
		const mobile = pickRandom(srcObj.mobile) || pickRandom(srcObj.desktop);
		return { desktop, mobile };
	}
	// 如果是字符串或字符串数组，同时用于桌面端和移动端
	const resolved = pickRandom(bgSrc as string | string[]);
	return {
		desktop: resolved,
		mobile: resolved,
	};
};

// 类型守卫函数
export const isBannerSrcObject = (
	src:
		| string
		| string[]
		| { desktop?: string | string[]; mobile?: string | string[] },
): src is { desktop?: string | string[]; mobile?: string | string[] } => {
	return (
		typeof src === "object" &&
		src !== null &&
		!Array.isArray(src) &&
		("desktop" in src || "mobile" in src)
	);
};

// 获取默认背景图片
export const getDefaultBackground = (): string => {
	const src = backgroundWallpaper.src;
	if (typeof src === "string") return src;
	if (Array.isArray(src)) return pickRandom(src);
	if (src && typeof src === "object") {
		return pickRandom(src.desktop) || pickRandom(src.mobile);
	}
	return "";
};

// 检查是否为首页
export const isHomePage = (pathname: string): boolean => {
	// 获取 base URL
	const baseUrl = import.meta.env.BASE_URL || "/";
	const baseUrlNoSlash = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

	if (pathname === baseUrl) return true;
	if (pathname === baseUrlNoSlash) return true;
	if (pathname === "/") return true;

	return false;
};

// 获取横幅偏移量
export const getBannerOffset = (position = "center") => {
	const bannerOffsetByPosition = {
		top: "100vh",
		center: "50vh",
		bottom: "0",
	};
	return (
		bannerOffsetByPosition[position as keyof typeof bannerOffsetByPosition] ||
		"50vh"
	);
};
