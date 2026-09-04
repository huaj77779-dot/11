"use client";
import { PointerEvent, useMemo, useState } from "react";
import { applyRules, fields, initialSelection, orderJson, View } from "./catalog";

const views:View[]=["front","back","inside","sleeve","detail"];
const names:Record<View,string>={front:"正面",back:"背面",inside:"内里",sleeve:"袖子",detail:"局部"};

export default function Page(){
  const [active,setActive]=useState("jacket.lapel"); const [view,setView]=useState<View>("front");
  const [selected,setSelected]=useState<Record<string,string>>(initialSelection); const [rotation,setRotation]=useState(0); const [zoom,setZoom]=useState(1);
  const [drag,setDrag]=useState<{x:number;r:number}|null>(null); const [notice,setNotice]=useState(""); const [copied,setCopied]=useState(false);
  const field=fields.find(item=>item.id===active)??fields[0]; const option=field.options.find(item=>item.id===selected[field.id]);
  const front=selected["jacket.front"]??""; const count=front.includes("single-1")?1:front.includes("single-3")?3:front.includes("single-4")?4:front.includes("single-5")?5:front.includes("x6")||front.endsWith("open-6")?6:front.includes("x4")?4:2;
  const summary=useMemo(()=>fields.filter(item=>item.view===view).slice(0,4),[view]);
  function choose(id:string){const result=applyRules({...selected,[field.id]:id});setSelected(result.next);setNotice(result.messages.join("；"));setView(field.view);if(field.presentation==="3d")setZoom(1.12);}
  function move(event:PointerEvent<HTMLDivElement>){if(drag)setRotation(drag.r+(event.clientX-drag.x)*.45);}
  async function copy(){await navigator.clipboard?.writeText(JSON.stringify(orderJson(selected),null,2));setCopied(true);setTimeout(()=>setCopied(false),1400);}
  return <main className="lab">
    <header className="top"><a href="/" className="brand"><i>VS</i><span>VEROSUITS <b>LAB</b></span></a><div><small>EXPERIMENT 3001</small><strong>工厂款式配置实验室</strong></div><p><i/>主数据已连接 · {fields.length}字段</p></header>
    <div className="workspace">
      <aside className="rail"><div className="category"><small>品类 CATEGORY</small><b>西装上衣</b><span>JACKET / C</span></div>{views.map(v=><section key={v}><h3>{names[v]}<small>{fields.filter(f=>f.view===v).length}</small></h3>{fields.filter(f=>f.view===v).map(f=><button key={f.id} className={active===f.id?"on":""} onClick={()=>{setActive(f.id);setView(f.view)}}><i>{f.presentation.toUpperCase()}</i><span><b>{f.zh}</b><small>{f.options.find(o=>o.id===selected[f.id])?.zh}</small></span></button>)}</section>)}</aside>
      <section className="stage"><div className="stage-head"><div><small>HYBRID GARMENT PREVIEW</small><h1>看得懂，也做得准。</h1><p>拖动旋转 · 滚轮缩放 · 点击部件配置</p></div><nav>{views.map(v=><button key={v} className={view===v?"on":""} onClick={()=>setView(v)}>{names[v]}</button>)}</nav></div>
        <div className={`canvas view-${view}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,r:rotation})}} onPointerMove={move} onPointerUp={()=>setDrag(null)} onWheel={e=>setZoom(z=>Math.max(.72,Math.min(1.5,z-e.deltaY*.001)))}>
          <div className="turntable" style={{transform:`scale(${zoom}) rotateY(${rotation}deg)`}}><div className={`jacket ${selected["jacket.lapel"]?.split(".").at(-1)} ${selected["jacket.lower-pocket"]?.split(".").at(-1)} ${front.includes("double")?"double":"single"}`}><div className="neck"/><div className="body left"><div className="lapel"/></div><div className="body right"><div className="lapel"/></div><div className="sleeve left"/><div className="sleeve right"/><button className={`hotspot chest ${active==="jacket.breast-pocket"?"on":""}`} onClick={()=>setActive("jacket.breast-pocket")} aria-label="配置胸兜"/><div className={`chest-pocket ${selected["jacket.breast-pocket"]?.endsWith("barchetta")?"curved":""}`}/><button className={`hotspot waist ${active==="jacket.lower-pocket"?"on":""}`} onClick={()=>setActive("jacket.lower-pocket")} aria-label="配置腰兜"/><div className="lower-pocket left"/><div className="lower-pocket right"/><div className="buttons">{Array.from({length:count},(_,i)=><i key={i}/>)}</div><div className="callout"><b>{field.zh}</b><small>{field.presentation==="3d"?"实时外观部件":"工艺数据层"}</small></div></div></div>
          {field.presentation!=="3d"&&<article className="craft"><i>{field.presentation.toUpperCase()}</i><div><b>{field.zh}工艺卡</b><span>{option?.zh}</span><small>此项目不伪装成外观效果；写入二维工艺图、订单 JSON 与生产单。</small></div></article>}
          <div className="fabric"><i/><span><small>面料材质</small><b>Midnight Navy · S110</b></span></div><div className="controls"><button onClick={()=>setRotation(r=>r-45)}>↶ 旋转</button><button onClick={()=>setZoom(z=>Math.min(1.5,z+.12))}>＋ 放大</button><button onClick={()=>{setRotation(0);setZoom(1)}}>复位</button></div>
        </div>
      </section>
      <aside className="panel"><div className="kicker"><i>{field.presentation.toUpperCase()}</i><span>{field.tier} · {field.zone}</span></div><h2>{field.zh}</h2><p>{field.en}<br/>来源：{field.source}</p>{notice&&<div className="notice">规则引擎：{notice}</div>}<div className="options">{field.options.map(o=><button key={o.id} className={selected[field.id]===o.id?"on":""} onClick={()=>choose(o.id)}><i>{selected[field.id]===o.id?"✓":""}</i><span><b>{o.zh}</b><small>{o.en}</small></span></button>)}</div><div className="mapping"><small>PRODUCTION MAPPING</small><code>{option?.id}</code><p><b>工厂值</b><span>{option?.factory}</span></p><p><b>资产节点</b><span>{field.asset??"二维/数据"}</span></p><p><b>是否必选</b><span>{field.required?"是":"否"}</span></p></div></aside>
    </div>
    <footer className="summary"><label>当前 {names[view]}</label>{summary.map(f=><div key={f.id}><small>{f.zh}</small><b>{f.options.find(o=>o.id===selected[f.id])?.zh}</b></div>)}<button onClick={copy}>{copied?"已复制 ✓":"复制工厂 JSON"}</button></footer>
  </main>;
}
