export type View = "front" | "back" | "inside" | "sleeve" | "detail";
export type Presentation = "3d" | "2d" | "data";
export type Option = { id: string; zh: string; en: string; factory: string };
export type Field = {
  id: string; view: View; zone: string; tier: "基础款式" | "工艺细节" | "生产参数";
  zh: string; en: string; presentation: Presentation; required: boolean;
  source: string; defaultValue: string; asset?: string; options: Option[];
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const opts = (field: string, values: Array<[string, string, string?]>): Option[] =>
  values.map(([zh, en, factory]) => ({ id: `${field}.${slug(en)}`, zh, en, factory: factory ?? zh }));

export const fields: Field[] = [
  { id:"jacket.lapel",view:"front",zone:"领部",tier:"基础款式",zh:"领型",en:"Lapel",presentation:"3d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.lapel.notch",asset:"JKT_LAPEL_*",options:opts("jacket.lapel",[["平驳头","Notch"],["戗驳头","Peak"],["青果领","Shawl"],["立领","Stand collar"],["小翻领","Small turn-down collar"]])},
  { id:"jacket.breast-pocket",view:"front",zone:"胸部",tier:"基础款式",zh:"胸兜",en:"Breast pocket",presentation:"3d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.breast-pocket.welt",asset:"JKT_CHEST_POCKET_*",options:opts("jacket.breast-pocket",[["箱型","Welt"],["弯月","Barchetta"],["明贴","Patch"],["明贴带兜盖","Patch with flap"],["无","None"]])},
  { id:"jacket.lower-pocket",view:"front",zone:"腰部",tier:"基础款式",zh:"腰兜",en:"Lower pocket",presentation:"3d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.lower-pocket.flap",asset:"JKT_WAIST_POCKET_*",options:opts("jacket.lower-pocket",[["无","None"],["单牙1.0","Single welt 1.0"],["单牙1.5","Single welt 1.5"],["双牙直兜","Straight jetted"],["双牙斜兜","Slanted jetted"],["兜盖","Flap"],["明贴兜","Patch"],["明贴带兜盖","Patch with flap"],["大衣斜插兜","Slanted overcoat"],["特殊备注","Special"]])},
  { id:"jacket.front",view:"front",zone:"门襟",tier:"基础款式",zh:"门襟款式",en:"Front closure",presentation:"3d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.front.single-2",asset:"JKT_FRONT_*",options:opts("jacket.front",[["单排1扣","Single 1"],["单排2扣","Single 2"],["单排3扣","Single 3"],["单排4扣","Single 4"],["单排5扣","Single 5"],["双排1×4","Double 1x4"],["双排2×4","Double 2x4"],["双排2×6","Double 2x6"],["双排3×6","Double 3x6"],["对襟无扣","Open no button"],["对襟6扣","Open 6"],["特殊备注","Special"]])},
  { id:"jacket.vent",view:"back",zone:"后背",tier:"基础款式",zh:"开衩",en:"Vent",presentation:"3d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.vent.double",asset:"JKT_VENT_*",options:opts("jacket.vent",[["双开衩","Double"],["单开衩","Single"],["无开衩","None"]])},
  { id:"jacket.lining",view:"inside",zone:"内里",tier:"工艺细节",zh:"里布结构",en:"Lining",presentation:"2d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.lining.full",options:opts("jacket.lining",[["全里","Full"],["半里","Half"],["清凉","Cool"],["内无里","Unlined"]])},
  { id:"jacket.facing",view:"inside",zone:"过面",tier:"工艺细节",zh:"过面",en:"Facing",presentation:"2d",required:true,source:"量体单第2版 G13:U28",defaultValue:"jacket.facing.c-curved",options:opts("jacket.facing",[["宝剑头","Sword point"],["圆过面","Round"],["A弯过面","A curved"],["C弯过面","C curved"],["直过面","Straight"],["拼接耳皮","Pieced ear"]])},
  { id:"jacket.canvas",view:"inside",zone:"胸衬",tier:"工艺细节",zh:"毛衬工艺",en:"Canvas",presentation:"2d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.canvas.machine-half",options:opts("jacket.canvas",[["机器半麻","Machine half"],["手工半麻","Hand half"],["机器全麻","Machine full"],["手工全麻","Hand full"],["轻薄粘合","Light fused"],["无结构","Unstructured"]])},
  { id:"jacket.inside-left",view:"inside",zone:"里兜",tier:"工艺细节",zh:"里兜左",en:"Left inside pocket",presentation:"2d",required:false,source:"量体单第2版 G13:U28",defaultValue:"jacket.inside-left.standard",options:opts("jacket.inside-left",[["标准里大兜","Standard"],["笔兜组合1","Pen set 1"],["笔兜组合2","Pen set 2"],["笔兜组合3","Pen set 3"],["笔兜组合4","Pen set 4"],["笔兜组合5","Pen set 5"],["笔兜组合6","Pen set 6"],["烟兜","Cigarette"],["票兜","Ticket"],["钻石兜组合","Diamond set"]])},
  { id:"jacket.sleeve-button",view:"sleeve",zone:"袖口",tier:"工艺细节",zh:"袖扣",en:"Sleeve buttons",presentation:"2d",required:true,source:"website + 量体单第2版 G13:U28",defaultValue:"jacket.sleeve-button.functional-straight-4",options:opts("jacket.sleeve-button",[["真开衩直扣眼平钉3粒","Functional straight 3"],["真开衩直扣眼平钉4粒","Functional straight 4"],["真开衩斜扣眼叠钉4粒","Functional slanted stacked 4"],["假开衩直扣眼平钉4粒","Mock straight 4"],["假开衩斜扣眼叠钉5粒","Mock slanted stacked 5"],["真开衩直扣眼平钉6粒","Functional straight 6"]])},
  { id:"jacket.lapel-width",view:"detail",zone:"领部",tier:"生产参数",zh:"驳头宽",en:"Lapel width",presentation:"data",required:true,source:"量体单第2版 G13:U28",defaultValue:"jacket.lapel-width.8-5-cm",options:opts("jacket.lapel-width",Array.from({length:20},(_,i)=>{const v=(5.5+i*.5).toFixed(1);return [`${v}cm`,`${v} cm`,v]}))},
  { id:"jacket.shoulder-pad",view:"detail",zone:"肩部",tier:"生产参数",zh:"垫肩",en:"Shoulder pad",presentation:"2d",required:true,source:"量体单第2版 G13:U28",defaultValue:"jacket.shoulder-pad.3-mm",options:opts("jacket.shoulder-pad",[["0毫米","0 mm"],["3毫米","3 mm"],["8毫米","8 mm"],["13毫米","13 mm"],["胸衬连垫肩","Canvas connected"]])},
  { id:"jacket.edge",view:"detail",zone:"外沿",tier:"工艺细节",zh:"外珠边",en:"Edge stitch",presentation:"2d",required:false,source:"量体单第2版 G13:U28",defaultValue:"jacket.edge.none",options:opts("jacket.edge",[["无","None"],["0.15","0.15"],["0.25","0.25"],["0.6","0.6"],["0.8","0.8"]])},
  { id:"jacket.button-material",view:"detail",zone:"纽扣",tier:"工艺细节",zh:"纽扣材质",en:"Button material",presentation:"2d",required:true,source:"量体单第2版 G13:U28",defaultValue:"jacket.button-material.horn",options:opts("jacket.button-material",[["牛角","Horn"],["金属","Metal"],["果实","Corozo"],["木质","Wood"],["尿素","Urea"],["塑料","Plastic"],["树脂","Resin"],["贝壳","Shell"]])},
  { id:"jacket.fit",view:"detail",zone:"整体",tier:"生产参数",zh:"穿着松量",en:"Fit ease",presentation:"data",required:true,source:"量体单第2版 G13:U28",defaultValue:"jacket.fit.standard",options:opts("jacket.fit",[["非常紧身","Very tight"],["紧身","Tight"],["较紧身","Trim"],["修身","Slim"],["标准","Standard"],["舒适","Comfort"],["宽松","Relaxed"],["很宽松","Loose"],["非常宽松","Very loose"]])},
];

export const initialSelection = Object.fromEntries(fields.map((field) => [field.id, field.defaultValue]));

export function applyRules(input: Record<string,string>) {
  const next={...input}; const messages:string[]=[];
  if(next["jacket.front"]==="jacket.front.single-3" && next["jacket.facing"]!=="jacket.facing.c-curved"){next["jacket.facing"]="jacket.facing.c-curved";messages.push("3粒扣只能使用 C弯过面，已自动修正");}
  if(next["jacket.front"]?.includes("double") && next["jacket.facing"]==="jacket.facing.a-curved"){next["jacket.facing"]="jacket.facing.c-curved";messages.push("双排扣没有 A弯过面，已自动修正");}
  return {next,messages};
}

export function orderJson(selection:Record<string,string>){return {schemaVersion:"hongpei-style-v1",garment:"jacket",fabricPolicy:"one-fabric-per-order",options:fields.map(field=>{const option=field.options.find(item=>item.id===selection[field.id]);return {fieldId:field.id,optionId:option?.id,factoryValue:option?.factory,presentation:field.presentation,asset:field.asset??null,source:field.source};})};}
