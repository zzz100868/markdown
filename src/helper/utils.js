/** @format */

// utils.js 收纳跨页面复用的小工具函数。
// 包括时间戳、导出文件名、HTML 滚动恢复、隐藏 Vditor 编辑区等。

// startsWith 兼容性补丁（IE 不支持）
if (typeof String.prototype.startsWith !== "function") {
  Window.String.prototype.startsWith = function (prefix) {
    return this.slice(0, prefix.length) === prefix;
  };
}

// 数字补零：个位数前面加 0
export const makeUpZero = (num = 0) => {
  return num < 10 ? `0${num}` : `${num}`;
};

// 获取当前时间戳字符串，格式：YY-MM-DD-HHMMSS
export const getTimestamp = () => {
  const date = new Date();
  const y = `${date.getFullYear()}`.replace("20", "");
  let mo = makeUpZero(date.getMonth() + 1);
  const d = makeUpZero(date.getDate());
  const h = makeUpZero(date.getHours());
  const m = makeUpZero(date.getMinutes());
  const s = makeUpZero(date.getSeconds());
  return `${y}-${mo}-${d}-${h}${m}${s}`;
};

// 生成导出文件名，格式：arya-YY-MM-DD-HHMMSS.ext
export const getExportFileName = () => {
  const type = location.pathname.split("/").pop();
  const timestamp = getTimestamp();
  const filename = `arya-${timestamp}.${type}`;
  return filename;
};

// 恢复 HTML 滚动样式（导出页面可能限制了滚动）
export const updateHtmlStyle = () => {
  const htmlNode = document.querySelector("html");
  htmlNode.style.overflow = "auto";
  htmlNode.style.height = "auto";
};

// 隐藏 Vditor 编辑区（预览/导出页面只需要显示预览）
// 通过 MutationObserver 监听 DOM 变化，发现编辑区就隐藏
export const hideVditorTextarea = () => {
  const exportVditorNode = document.getElementById("khaleesi");

  const option = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeFilter: ["class", "style"],
    attributeOldValue: true,
    characterDataOldValue: true,
  };

  const mutationObserver = new MutationObserver(() => {
    const vditorTextarea = document.getElementsByClassName("vditor-textarea");
    if (vditorTextarea && vditorTextarea[0]) {
      vditorTextarea[0].style.display = "none";
      // 已经隐藏，断开监听以节省性能
      mutationObserver.disconnect();
    }
  });

  mutationObserver.observe(exportVditorNode, option);
};
