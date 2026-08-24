"use client";

import { useEffect, useRef } from "react";

/** 面料色调 → 预览图用色 */
const TONE_COLORS: Record<string, string> = {
  navy: "#1e3a56",
  charcoal: "#3c4650",
  bluecheck: "#2c4a66",
  brown: "#6b4a2f",
  stripe: "#41566b",
  beige: "#c9bda6",
  herring: "#4a443e",
  ivory: "#efe9dc",
  gold: "#b78a43",
  burgundy: "#6d2430",
  greycheck: "#6a6f74",
  white: "#f5f2ec",
  sky: "#8fb3cc",
  shirtstripe: "#a9bfd0",
  shirtcheck: "#7d93a8",
  pink: "#d9a8b0",
};

export type PreviewItem = {
  key: string;
  kind: "product" | "fabric";
  title: string;
  subtitle: string;
  fabricCode?: string;
  fabricName?: string;
  fabricMill?: string;
  tone?: string;
  meters?: number;
  options: Array<{ group: string; item: string }>;
  measurements: Array<{ field: string; net: string; finished: string }>;
  amount: number;
};

export type PreviewCustomer = {
  name: string;
  height: string;
  weight: string;
  avatarUrl?: string;
};

function toneColor(tone?: string): string {
  return (tone && TONE_COLORS[tone]) || "#334c64";
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function PreviewCanvas({
  item,
  customer,
}: {
  item: PreviewItem | null;
  customer: PreviewCustomer;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // 头像异步加载完成后重绘
    if (customer.avatarUrl) {
      const img = new Image();
      img.onload = () => {
        avatarImgRef.current = img;
        draw();
      };
      img.src = customer.avatarUrl;
    } else {
      avatarImgRef.current = null;
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, customer.name, customer.avatarUrl]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 560;
    canvas.width = W;
    canvas.height = H;

    if (!item) {
      // 空态：引导加入 PI
      ctx.fillStyle = "#f4f6f4";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#8a9691";
      ctx.font = "22px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("点击「加入 PI」生成面料加款式预览效果图", W / 2, H / 2 - 10);
      ctx.font = "14px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "#a8b2ad";
      ctx.fillText("结合客户量体数据与头像，未上传头像则生成无头像版本", W / 2, H / 2 + 26);
      return;
    }

    const fabricColor = toneColor(item.tone);

    // 背景
    ctx.fillStyle = "#fbfcfb";
    ctx.fillRect(0, 0, W, H);

    // 顶部条（深绿）
    ctx.fillStyle = "#143f35";
    ctx.fillRect(0, 0, W, 92);
    // 面料色带
    const grad = ctx.createLinearGradient(0, 92, W, 92);
    grad.addColorStop(0, fabricColor);
    grad.addColorStop(0.5, fabricColor);
    grad.addColorStop(1, "#102d27");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 92, W, 26);

    // 顶部文字
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "28px Georgia, 'Microsoft YaHei', serif";
    ctx.fillText(item.title, 42, 50);
    ctx.font = "12px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#bcd0c9";
    ctx.fillText(item.subtitle, 42, 74);
    // 金额
    ctx.textAlign = "right";
    ctx.font = "24px Georgia, sans-serif";
    ctx.fillStyle = "#e0c28b";
    ctx.fillText(`¥${item.amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`, W - 42, 54);
    ctx.font = "10px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#9db3ab";
    ctx.fillText(item.fabricCode ? `面料 ${item.fabricCode}` : "", W - 42, 74);

    // ===== 左侧：客户与量体 =====
    const LX = 42;
    // 头像
    const avatarSize = 96;
    const avatarY = 150;
    ctx.save();
    ctx.beginPath();
    ctx.arc(LX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#143f35";
    ctx.fill();
    ctx.clip();
    if (avatarImgRef.current) {
      ctx.drawImage(avatarImgRef.current, LX, avatarY, avatarSize, avatarSize);
    } else {
      // 无头像占位：人形剪影 + 首字母
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.beginPath();
      ctx.arc(LX + avatarSize / 2, avatarY + 34, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(LX + avatarSize / 2, avatarY + 92, 40, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(LX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    // 姓名 + 身高体重
    ctx.fillStyle = "#17201d";
    ctx.font = "20px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(customer.name || "未填写姓名", LX, avatarY + 130);
    ctx.fillStyle = "#75807b";
    ctx.font = "13px 'Microsoft YaHei', sans-serif";
    ctx.fillText(
      `${customer.height || "—"} cm · ${customer.weight || "—"} kg`,
      LX,
      avatarY + 154
    );

    // 量体数据
    ctx.fillStyle = "#977748";
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.fillText("量体数据（净体 / 成衣）", LX, avatarY + 192);
    ctx.strokeStyle = "#e3e9e5";
    ctx.beginPath();
    ctx.moveTo(LX, avatarY + 202);
    ctx.lineTo(LX + 316, avatarY + 202);
    ctx.stroke();
    const mRows = item.measurements.slice(0, 7);
    mRows.forEach((m, i) => {
      const y = avatarY + 228 + i * 26;
      ctx.fillStyle = "#5c6a64";
      ctx.font = "13px 'Microsoft YaHei', sans-serif";
      ctx.fillText(m.field, LX, y);
      ctx.fillStyle = "#17201d";
      ctx.font = "13px Georgia, 'Microsoft YaHei', serif";
      ctx.textAlign = "right";
      ctx.fillText(`${m.net || "—"} / ${m.finished || "—"} cm`, LX + 316, y);
      ctx.textAlign = "left";
    });

    // ===== 右侧：款式配置 =====
    const RX = 392;
    const RW = W - RX - 42;
    ctx.fillStyle = "#977748";
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.fillText(item.kind === "fabric" ? "面料明细" : "款式配置", RX, 138);
    ctx.strokeStyle = "#e3e9e5";
    ctx.beginPath();
    ctx.moveTo(RX, 148);
    ctx.lineTo(RX + RW, 148);
    ctx.stroke();

    if (item.kind === "fabric") {
      ctx.fillStyle = "#17201d";
      ctx.font = "15px 'Microsoft YaHei', sans-serif";
      ctx.fillText(`${item.fabricName || item.fabricCode}`, RX, 182);
      ctx.fillStyle = "#75807b";
      ctx.font = "12px 'Microsoft YaHei', sans-serif";
      ctx.fillText(`${item.fabricMill || ""} · ${item.fabricCode}`, RX, 206);
      ctx.fillStyle = "#143f35";
      ctx.font = "17px Georgia, sans-serif";
      ctx.fillText(`购买 ${item.meters ?? 0} 米`, RX, 240);
    } else {
      const colWidth = RW / 2 - 16;
      item.options.forEach((opt, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = RX + col * (colWidth + 20);
        const y = 178 + row * 44;
        if (y > 440) return;
        // 组名
        ctx.fillStyle = "#9aa6a0";
        ctx.font = "10px 'Microsoft YaHei', sans-serif";
        ctx.fillText(opt.group, x, y);
        // 选项
        ctx.fillStyle = "#17201d";
        ctx.font = "13px 'Microsoft YaHei', sans-serif";
        const text = opt.item;
        ctx.fillText(text.length > 18 ? text.slice(0, 17) + "…" : text, x, y + 20);
        // 分隔
        ctx.strokeStyle = "#edf1ee";
        ctx.beginPath();
        ctx.moveTo(x, y + 30);
        ctx.lineTo(x + colWidth, y + 30);
        ctx.stroke();
      });
    }

    // ===== 底部条 =====
    ctx.fillStyle = "#102d27";
    ctx.fillRect(0, H - 52, W, 52);
    ctx.fillStyle = "#8fd0a6";
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("MADE-TO-MEASURE", 42, H - 24);
    ctx.fillStyle = "#9db3ab";
    ctx.fillText("ATELIER OS · PREVIEW", 42, H - 8);
    ctx.textAlign = "right";
    ctx.fillStyle = "#e0c28b";
    ctx.font = "13px Georgia, sans-serif";
    ctx.fillText(
      `${item.subtitle} · ¥${item.amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`,
      W - 42,
      H - 16
    );
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", maxWidth: 860, height: "auto", borderRadius: 10, display: "block", boxShadow: "0 8px 24px rgba(16,45,39,.12)" }}
    />
  );
}
