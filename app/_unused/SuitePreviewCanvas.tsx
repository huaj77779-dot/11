"use client";

import { useEffect, useRef } from "react";

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

export type SuiteGarment = {
  key: string;
  name: string;
  en: string;
  fabricCode?: string;
  fabricName?: string;
  fabricMill?: string;
  tone?: string;
  options: Array<{ group: string; item: string }>;
  measures: Array<{ field: string; net: string; finished: string }>;
  amount: number;
};

export type SuiteCustomer = {
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

export function SuitePreviewCanvas({
  garments,
  customer,
}: {
  garments: SuiteGarment[];
  customer: SuiteCustomer;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
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
  }, [garments, customer.name, customer.avatarUrl]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 820;
    const H = 660;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = "#fbfcfb";
    ctx.fillRect(0, 0, W, H);

    // ===== 顶部客户条 =====
    ctx.fillStyle = "#143f35";
    ctx.fillRect(0, 0, W, 62);
    // 头像
    const ax = 26;
    const ay = 11;
    const asize = 40;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + asize / 2, ay + asize / 2, asize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fill();
    ctx.clip();
    if (avatarImgRef.current) {
      ctx.drawImage(avatarImgRef.current, ax, ay, asize, asize);
    } else {
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.beginPath();
      ctx.arc(ax + asize / 2, ay + 14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ax + asize / 2, ay + 38, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "15px 'Microsoft YaHei', sans-serif";
    ctx.fillText(customer.name || "未填写姓名", ax + asize + 12, 27);
    ctx.fillStyle = "#9db3ab";
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.fillText(`${customer.height || "—"} cm · ${customer.weight || "—"} kg`, ax + asize + 12, 46);

    ctx.textAlign = "right";
    ctx.fillStyle = "#e0c28b";
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.fillText("MADE-TO-MEASURE · 四件套效果展示", W - 24, 26);
    ctx.fillStyle = "#9db3ab";
    ctx.font = "10px 'Microsoft YaHei', sans-serif";
    ctx.fillText("西装上衣 · 西裤 · 马甲 · 衬衫", W - 24, 46);

    // ===== 2x2 网格 =====
    const gap = 12;
    const ml = 14;
    const mt = 78;
    const cw = (W - ml * 2 - gap) / 2;
    const ch = (H - mt - 48 - gap) / 2;

    garments.slice(0, 4).forEach((g, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = ml + col * (cw + gap);
      const y = mt + row * (ch + gap);
      const color = toneColor(g.tone);

      // 卡片
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#e3e9e5";
      ctx.lineWidth = 1;
      roundedRect(ctx, x, y, cw, ch, 10);
      ctx.fill();
      ctx.stroke();

      // 卡片顶部色带
      ctx.fillStyle = color;
      roundedRect(ctx, x, y, cw, 46, 10);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(x, y + 30, cw, 16);

      // 色带文字
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = "bold 14px 'Microsoft YaHei', sans-serif";
      ctx.fillText(g.name, x + 14, y + 24);
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.font = "9px 'Microsoft YaHei', sans-serif";
      ctx.fillText(g.en.toUpperCase(), x + 14, y + 40);

      // 面料色块 + 编号
      const sw = 26;
      const sy = y + 54;
      ctx.fillStyle = color;
      roundedRect(ctx, x + cw - 14 - sw, sy, sw, sw, 5);
      ctx.fill();
      ctx.fillStyle = "#977748";
      ctx.font = "bold 11px 'Microsoft YaHei', sans-serif";
      ctx.fillText(g.fabricCode || "待选择面料", x + 14, sy + 17);

      let yy = sy + 34;
      // 面料名
      if (g.fabricName) {
        ctx.fillStyle = "#75807b";
        ctx.font = "10px 'Microsoft YaHei', sans-serif";
        ctx.fillText(g.fabricName, x + 14, yy);
        yy += 17;
      }
      // 款式
      ctx.strokeStyle = "#edf1ee";
      ctx.beginPath();
      ctx.moveTo(x + 14, yy + 2);
      ctx.lineTo(x + cw - 14, yy + 2);
      ctx.stroke();
      yy += 15;
      g.options.slice(0, 4).forEach((opt) => {
        ctx.fillStyle = "#5c6a64";
        ctx.font = "10px 'Microsoft YaHei', sans-serif";
        ctx.fillText(opt.group, x + 14, yy);
        ctx.fillStyle = "#17201d";
        ctx.font = "bold 10px 'Microsoft YaHei', sans-serif";
        ctx.fillText(opt.item, x + 92, yy);
        yy += 15;
      });
      // 量体
      g.measures.slice(0, 2).forEach((m) => {
        ctx.fillStyle = "#9aa6a0";
        ctx.font = "9px 'Microsoft YaHei', sans-serif";
        ctx.fillText(`${m.field} ${m.net || "—"}/${m.finished || "—"}cm`, x + 14, yy);
        yy += 13;
      });
      // 金额
      ctx.fillStyle = "#143f35";
      ctx.font = "bold 14px Georgia, 'Microsoft YaHei', serif";
      ctx.textAlign = "right";
      ctx.fillText(`¥${g.amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`, x + cw - 14, y + ch - 12);
      ctx.textAlign = "left";
    });

    // ===== 底部条 =====
    ctx.fillStyle = "#102d27";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "#8fd0a6";
    ctx.font = "10px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ATELIER OS · SUITE PREVIEW", 24, H - 14);
    ctx.textAlign = "right";
    ctx.fillStyle = "#9db3ab";
    ctx.fillText("面料 + 款式 + 量体合成预览", W - 24, H - 14);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", borderRadius: 10, display: "block", boxShadow: "0 8px 24px rgba(16,45,39,.12)" }}
    />
  );
}
