/**
 * 衬衫下单表参考图映射：款式配置组 + 选项 → public/garment-options/衬衫/ 分类目录下的图片文件名。
 * 图片来源：门店「衬衫下单表图片」扫描件，人工核对选项与图名对应关系。
 * key 格式为 `${配置组}:${选项}`，避免不同组的同名选项（如「需要」）冲突。
 */
export const shirtOptionImages: Record<string, string> = {
  // 领型
  "领型:标准领": "style-options/shirt/collar-style/classic-point-collar.jpeg",
  "领型:小八领(5.7)": "style-options/shirt/collar-style/narrow-spread-collar-57mm.jpeg",
  "领型:中八领(7.1)": "style-options/shirt/collar-style/medium-spread-collar-71mm.jpeg",
  "领型:大八领(8.0)": "style-options/shirt/collar-style/wide-spread-collar-80mm.jpeg",
  "领型:法式温莎领(8.0)": "style-options/shirt/collar-style/french-cutaway-collar-80mm.jpeg",
  "领型:意式温莎领(8.2)": "style-options/shirt/collar-style/italian-cutaway-collar-82mm.png",
  "领型:雅致一字领(8.5×3.5)": "style-options/shirt/collar-style/extreme-cutaway-collar-85x35mm.jpeg",
  "领型:伊顿领(6.0)": "style-options/shirt/collar-style/eton-rounded-collar-60mm.png",
  "领型:大尖领(8.0)": "style-options/shirt/collar-style/long-point-collar-80mm.jpeg",
  "领型:意式长尖领(10)": "style-options/shirt/collar-style/italian-long-point-collar-100mm.png",
  "领型:古巴领": "style-options/shirt/collar-style/cuban-collar.png",
  "领型:意式一片领(9.5)": "style-options/shirt/collar-style/italian-one-piece-collar-95mm.png",
  "领型:针孔领(11.5)": "style-options/shirt/collar-style/pinhole-collar-115mm.png",
  "领型:燕子领(5.9)": "style-options/shirt/collar-style/swallow-collar-59mm.png",
  "领型:立领圆角带扣(3.4)": "style-options/shirt/collar-style/rounded-tab-band-collar-34mm.jpeg",
  // 领插片
  "领插片:无插片": "style-options/shirt/collar-stays/no-collar-stays.png",
  "领插片:固定内插片": "style-options/shirt/collar-stays/sewn-in-collar-stays.png",
  "领插片:活动外插片": "style-options/shirt/collar-stays/removable-collar-stays.png",
  "领插片:领尖外扣": "style-options/shirt/collar-stays/button-down-collar.png",
  "领插片:领尖底扣": "style-options/shirt/collar-stays/hidden-button-down-collar.png",
  // 袖口折
  "袖口折:单折": "style-options/shirt/cuff-pleats/single-cuff-pleat.jpeg",
  "袖口折:双折": "style-options/shirt/cuff-pleats/double-cuff-pleat.png",
  "袖口折:意式三折": "style-options/shirt/cuff-pleats/italian-triple-cuff-pleat.jpeg",
  "袖口折:意式碎折": "style-options/shirt/cuff-pleats/italian-cuff-gathers.png",
  // 口袋
  "口袋:圆口袋": "style-options/shirt/pocket-style/rounded-pocket.jpeg",
  "口袋:六角袋": "style-options/shirt/pocket-style/six-point-pocket.jpeg",
  "口袋:三角袋": "style-options/shirt/pocket-style/three-point-pocket.jpeg",
  // 袖口
  "袖口:圆角单扣": "style-options/shirt/cuff-style/rounded-one-button-cuff.jpeg",
  "袖口:直角单扣": "style-options/shirt/cuff-style/square-one-button-cuff.jpeg",
  "袖口:斜角单扣": "style-options/shirt/cuff-style/angled-one-button-cuff.jpeg",
  "袖口:圆角双扣": "style-options/shirt/cuff-style/rounded-two-button-cuff.jpeg",
  "袖口:直角双扣": "style-options/shirt/cuff-style/square-two-button-cuff.jpeg",
  "袖口:斜角双扣": "style-options/shirt/cuff-style/angled-two-button-cuff.jpeg",
  "袖口:圆角三扣": "style-options/shirt/cuff-style/rounded-three-button-cuff.png",
  "袖口:直角三扣": "style-options/shirt/cuff-style/square-three-button-cuff.png",
  "袖口:斜角三扣": "style-options/shirt/cuff-style/angled-three-button-cuff.png",
  "袖口:方角月牙袖口": "style-options/shirt/cuff-style/square-crescent-cuff.png",
  "袖口:大圆角": "style-options/shirt/cuff-style/large-rounded-cuff.png",
  "袖口:直角法式袖": "style-options/shirt/cuff-style/square-french-cuff.jpeg",
  "袖口:圆角法式袖口": "style-options/shirt/cuff-style/rounded-french-cuff.jpeg",
  "袖口:斜角法袖": "style-options/shirt/cuff-style/angled-french-cuff.png",
  "袖口:单层圆角法式": "style-options/shirt/cuff-style/single-layer-rounded-french-cuff.jpeg",
  "袖口:意式法式袖3#": "style-options/shirt/cuff-style/italian-french-cuff-style-3.png",
  "袖口:意式法式袖2#": "style-options/shirt/cuff-style/italian-french-cuff-style-2.png",
  // 前幅门襟
  "前幅门襟:明门襟默认3.0": "style-options/shirt/front-placket/front-placket-30mm.jpeg",
  "前幅门襟:明门襟2.5": "style-options/shirt/front-placket/front-placket-25mm.jpeg",
  "前幅门襟:翻门襟": "style-options/shirt/front-placket/french-front.jpeg",
  "前幅门襟:暗门襟": "style-options/shirt/front-placket/concealed-placket.jpeg",
  // 下摆
  "下摆:圆摆": "style-options/shirt/hem-style/shirt-tail-hem.jpeg",
  "下摆:圆摆贴三角": "style-options/shirt/hem-style/shirt-tail-hem-triangle-gusset.png",
  "下摆:圆摆宝剑头贴": "style-options/shirt/hem-style/shirt-tail-hem-pointed-gusset.png",
  "下摆:平摆": "style-options/shirt/hem-style/straight-hem.jpeg",
  // 后担干
  "后担干:正常担干": "style-options/shirt/back-yoke/standard-yoke.jpeg",
  "后担干:担干八字拼接": "style-options/shirt/back-yoke/split-yoke.jpeg",
  // 后幅
  "后幅:无折无省": "style-options/shirt/back-style/plain-back.jpeg",
  "后幅:打双折": "style-options/shirt/back-style/double-back-pleats.png",
  "后幅:后腰收腰省": "style-options/shirt/back-style/back-darts.jpeg",
  "后幅:工字折": "style-options/shirt/back-style/box-pleat.png",
  "后幅:意式后片碎折": "style-options/shirt/back-style/italian-back-gathers.jpeg",
  "后幅:后反字折": "style-options/shirt/back-style/inverted-box-pleat.jpeg",
  "后幅:后工字折到底": "style-options/shirt/back-style/full-length-box-pleat.jpeg",
  // 侧缝工艺
  "侧缝工艺:正常包缝(默认)": "衬衫/侧缝工艺/正常包缝(默认).jpeg",
  "侧缝工艺:手工包缝": "style-options/shirt/side-seam-finish/hand-felled-side-seam.png",
  // 袖山意式碎折
  "袖山意式碎折:袖山意式碎折": "style-options/shirt/spalla-camicia/spalla-camicia-gathers.png",
  // 错位上袖
  "错位上袖:需要": "style-options/shirt/offset-sleeve-setting/required.jpeg",
  // 鸡爪扣钉
  "鸡爪扣钉:需要": "style-options/shirt/crow-foot-button-stitching/crow-foot-button-stitching.jpg",
  // 礼服打条
  "礼服打条:礼服打条": "style-options/shirt/tuxedo-pleats/tuxedo-front-pleats.jpeg",
  // 驼背
  "驼背:正常背": "衬衫/驼背/正常背.jpeg",
  "驼背:背长加1cm": "衬衫/驼背/背长加1cm.jpeg",
  "驼背:背长加长1.5cm": "衬衫/驼背/背长加长1.5cm.jpeg",
  "驼背:背长加长2cm": "衬衫/驼背/背长加长2cm.jpeg",
  "驼背:背长加长2.5cm": "衬衫/驼背/背长加长2.5cm.jpeg",
  // 凸肚
  "凸肚:正常肚": "衬衫/凸肚/正常肚.jpeg",
  "凸肚:前肚围加大1cm": "衬衫/凸肚/前肚围加大1cm.jpeg",
  "凸肚:前肚围加大2cm": "衬衫/凸肚/前肚围加大2cm.jpeg",
  "凸肚:前肚围加大3cm": "衬衫/凸肚/前肚围加大3cm.jpeg",
  "凸肚:前肚围加大4cm": "衬衫/凸肚/前肚围加大4cm.jpeg",
  // 挺胸
  "挺胸:正常胸": "衬衫/挺胸/正常胸.jpeg",
  "挺胸:前腰节长加1cm": "衬衫/挺胸/前腰节长加1cm.jpeg",
  "挺胸:前腰节长加1.5cm": "衬衫/挺胸/前腰节长加1.5cm.jpeg",
  "挺胸:前腰节长加2cm": "衬衫/挺胸/前腰节长加2cm.jpeg",
  "挺胸:前腰节长加2.5cm": "衬衫/挺胸/前腰节长加2.5cm.jpeg",
  // 字体
  "字体:509": "style-options/shirt/monogram-font/font-509.jpeg",
  "字体:511": "style-options/shirt/monogram-font/font-511.jpeg",
  "字体:512": "style-options/shirt/monogram-font/font-512.jpeg",
  "字体:图片": "style-options/shirt/monogram-font/custom-image.jpeg",
  // 文字位置
  "文字位置:左领尖": "style-options/shirt/monogram-position/left-collar-point.jpeg",
  "文字位置:左前胸": "style-options/shirt/monogram-position/left-chest.jpeg",
  "文字位置:口袋": "style-options/shirt/monogram-position/pocket.jpeg",
  "文字位置:领下底门襟": "style-options/shirt/monogram-position/lower-placket-below-collar.jpeg",
  "文字位置:后领中": "style-options/shirt/monogram-position/center-back-collar.jpeg",
  "文字位置:左袖口左": "style-options/shirt/monogram-position/left-side-left-cuff.png",
  "文字位置:左袖口中": "style-options/shirt/monogram-position/center-left-cuff.png",
  // 平溜肩（左/右共用同一参考图）
  "左平溜肩:正常肩": "衬衫/左平溜肩/正常肩.jpeg",
  "右平溜肩:正常肩": "衬衫/右平溜肩/正常肩.jpeg",
  // 左袖口位置
  "左袖口位置:左袖口左": "衬衫/左袖口位置/左袖口左.jpeg",
  "左袖口位置:左袖口中": "衬衫/左袖口位置/左袖口中.jpeg",
};

/** 取某个配置组下某选项的参考图 URL（无图返回 null） */
export function shirtOptionImageUrl(group: string, item: string): string | null {
  const file = shirtOptionImages[`${group}:${item}`];
  if (!file) return null;
  const encoded = file.split("/").map(encodeURIComponent).join("/");
  return file.startsWith("style-options/") ? `/${encoded}` : `/garment-options/${encoded}`;
}
