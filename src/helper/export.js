/** @format */

// export.js 封装图片导出相关的 Canvas 处理逻辑。
// 主要负责：DOM 截图、SVG 转换、圆角裁剪、阴影包装。

import html2canvas from "html2canvas";
import canvg from "canvg";

let TARGET_WIDTH = 960;
let TARGET_HEIGHT = 800;

const MARGIN_WIDTH = 50;
const MARGIN_HEIGHT = 80;
const RADIUS = 6;

const SHADOW_X = 0;
const SHADOW_Y = 40;
const SHADOW_BLUR = 50;
const SHADOW_COLOR = "rgba(0, 0, 0, 0.21)";

// 给 Canvas 添加圆角效果
function drawRoundedRec(origCanvas, scale) {
  const roundCanvas = document.createElement("canvas");
  roundCanvas.width = TARGET_WIDTH * scale;
  roundCanvas.height = TARGET_HEIGHT * scale;

  const roundCtx = roundCanvas.getContext("2d");
  const roundRadius = RADIUS * scale;

  const x1 = roundRadius;
  const y1 = 0;
  const x2 = x1 + roundCanvas.width - 2 * roundRadius;
  const y2 = y1;
  const x3 = x2 + roundRadius;
  const y3 = roundRadius;
  const x4 = x3;
  const y4 = y3 + roundCanvas.height - 2 * roundRadius;
  const x5 = x2;
  const y5 = y4 + roundRadius;
  const x6 = x1;
  const y6 = y5;
  const x7 = x6 - roundRadius;
  const y7 = y4;
  const x8 = x7;
  const y8 = y3;

  roundCtx.beginPath();
  roundCtx.moveTo(x1, y1);
  roundCtx.lineTo(x2, y2);
  roundCtx.quadraticCurveTo(x3, y2, x3, y3);
  roundCtx.lineTo(x4, y4);
  roundCtx.quadraticCurveTo(x4, y5, x5, y5);
  roundCtx.lineTo(x6, y6);
  roundCtx.quadraticCurveTo(x7, y6, x7, y7);
  roundCtx.lineTo(x8, y8);
  roundCtx.quadraticCurveTo(x8, y1, x1, y1);

  roundCtx.clip();
  roundCtx.drawImage(origCanvas, 0, 0);
  return roundCanvas;
}

// 给 Canvas 添加阴影效果
function drawShadow(origCanvas) {
  const bgdCanvas = document.createElement("canvas");
  bgdCanvas.width = origCanvas.width + MARGIN_WIDTH;
  bgdCanvas.height = origCanvas.height + MARGIN_HEIGHT;
  const ctx = bgdCanvas.getContext("2d");

  ctx.shadowOffsetX = SHADOW_X;
  ctx.shadowOffsetY = SHADOW_Y;
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowColor = SHADOW_COLOR;
  ctx.drawImage(origCanvas, MARGIN_WIDTH / 2, 0);
  return bgdCanvas;
}

// 处理 SVG 兼容性：html2canvas 对 SVG 支持不好，先用 canvg 转成 Canvas
const handleCaptureSvg = (targetElem) => {
  const nodesToRecover = [];
  const nodesToRemove = [];
  const svgElem = targetElem.querySelectorAll("svg");

  for (let key = 0, len = svgElem.length; key < len; key++) {
    const node = svgElem[key];
    const parentNode = node.parentNode;

    try {
      const svgXml = new XMLSerializer().serializeToString(node);
      const canvas = document.createElement("canvas");
      const svgRect = node.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;

      const ctx = canvas.getContext("2d");
      canvg(canvas, svgXml, {
        ignoreMouse: true,
        ignoreAnimation: true,
        ignoreDimensions: false,
        ignoreClear: true,
      });

      nodesToRecover.push({
        parent: parentNode,
        child: node,
      });

      parentNode.removeChild(node);

      nodesToRemove.push({
        parent: parentNode,
        child: canvas,
      });
      parentNode.appendChild(canvas);
    } catch (error) {
      console.error("处理SVG时出错:", error);
    }
  }

  return { nodesToRecover, nodesToRemove };
};

// 生成截图（主入口函数）
export const generateScreenshot = async (targetDom) => {
  const { nodesToRecover, nodesToRemove } = handleCaptureSvg(targetDom);
  try {
    const domStyleObj = getComputedStyle(targetDom);
    TARGET_WIDTH = +domStyleObj.width.replace(`px`, "");
    TARGET_HEIGHT = +domStyleObj.height.replace(`px`, "");

    const scale = window.devicePixelRatio;
    const options = {
      scale,
      allowTaint: true,
      useCORS: true,
      backgroundColor: "#fefefe",
      imageTimeout: 0,
      logging: false,
    };

    const origCanvas = await html2canvas(targetDom, options);
    const roundCanvas = drawRoundedRec(origCanvas, scale);
    return drawShadow(roundCanvas);
  } finally {
    // 无论成功失败都要恢复原始 DOM
    nodesToRemove.forEach(({ parent, child }) => {
      if (parent && child.parentNode === parent) parent.removeChild(child);
    });
    nodesToRecover.forEach(({ parent, child }) => {
      if (parent && child) parent.appendChild(child);
    });
  }
};
