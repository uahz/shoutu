const fs = require("fs");
const code = fs.readFileSync(__dirname + "/index.html", "utf8").match(/<script>([\s\S]*?)<\/script>/)[1];

const stub = `
function fe(){return{innerHTML:"",textContent:"",style:{},dataset:{},value:"",onclick:null,
 classList:{add(){},remove(){},contains(){return false},toggle(){}},
 appendChild(){},remove(){},addEventListener(){},closest(){return null},
 querySelectorAll(){return []},querySelector(){return fe()}};}
globalThis.document={querySelector:()=>fe(),querySelectorAll:()=>[],createElement:()=>fe(),getElementById:()=>null,
 addEventListener(){},body:{appendChild(){}}};
const _ls={}; globalThis.localStorage={getItem:k=>(k in _ls?_ls[k]:null),setItem:(k,v)=>{_ls[k]=String(v)},removeItem:k=>{delete _ls[k]}};
globalThis.pending=[];
globalThis.setTimeout=f=>{pending.push(f);return 0;};
`;

const harness = `
const POLICY = process.argv[2] || "random";
// 覆写：事件自动决策（原 fireEvent 依赖 DOM 弹窗）
fireEvent = function(){
  let ev;
  if(EVENTS.length > S.used.length){ let i; do{ i=ri(0,EVENTS.length-1);}while(S.used.includes(i)); S.used.push(i); ev=EVENTS[i]; }
  else ev = makeDynamic();
  let idx;
  if(POLICY === "random") idx = Math.floor(Math.random()*ev.o.length);
  else {
    let bs=-1e9; idx=0;
    ev.o.forEach((o,i)=>{ const e=o.e||{};
      const s=(e.int||0)*3+(e.mor||0)*1.2+(e.edu||0)*0.5+(e.med||0)*0.5+(e.liv||0)*0.8
        +(e.cash||0)*0.008-(e.clue||0)*12-(e.hidden||0)*0.008-(e.debt||0)*0.004;
      if(s>bs){bs=s;idx=i;} });
  }
  choose(ev, idx);
};
endGame = function(k){ S.ended = k; };
modal = function(){ BUSY = false; };   // 弹窗在模拟中自动关闭

const TYPES = ["comm","flat","villa","street","plaza","mall","light","heavy","hitech","park","wet","school","hospital"];
const out = [];
for(let run=0; run<40; run++){
  newGame(); BUSY=false;
  let steps=0;
  while(!S.ended && steps<400){
    steps++;
    nextMonth();
    let g=0; while(pending.length && g++<30) pending.shift()();
    if(S.ended) break;
    const d = D();
    // 建造：找到最缺的东西
    if(POLICY !== "random"){
      let want = null;
      if(d.dHouse.t === "不足" || d.dHouse.t === "严重不足") want = "comm";
      else if(d.dJob.t === "不足" || d.dJob.t === "严重不足") want = "heavy";
      else if(d.edu < 55) want = "school";
      else if(d.med < 55) want = "hospital";
      else if(d.livable < 48) want = "park";
      else if(S.cash > 4000 && d.c.built < 120) want = d.dHouse.t === "充足" ? "comm" : "plaza";
      else want = null;
      if(!want) { /* 什么都不缺，攒钱 */ }
      const cost = want ? Math.round(CELLS[want].cost * d.buildMul) : 0;
      if(want && S.cash > cost + 1200){
        const em=[]; for(let i=0;i<S.grid.length;i++) if(S.grid[i]==="empty") em.push(i);
        if(em.length){ S.cash -= cost; S.grid[em[Math.floor(Math.random()*em.length)]] = want; }
      }
      if(S.cash > 2600 && Math.random()<0.25) doAct("attract",{i: Math.random()<0.6?0:1});
      if(S.cash > 2200 && Math.random()<0.25) doAct("hire",{k: Math.random()<0.5?"teacher":"doctor"});
      if(S.hidden > 1200 && S.cash > 1500) doAct("debtdeal",{k:"repay"});
    } else {
      if(Math.random()<0.5){
        const t = TYPES[Math.floor(Math.random()*TYPES.length)];
        const cost = Math.round(CELLS[t].cost * d.buildMul);
        if(S.cash > cost + 200){
          const em=[]; for(let i=0;i<S.grid.length;i++) if(S.grid[i]==="empty") em.push(i);
          if(em.length){ S.cash -= cost; S.grid[em[Math.floor(Math.random()*em.length)]] = t; }
        }
      }
      if(Math.random()<0.2 && S.cash>600) doAct("attract",{i:0});
      if(Math.random()<0.15 && S.cash>600) doAct("hire",{k:"teacher"});
      if(Math.random()<0.12 && S.cash<200) doAct("borrow",{k:"cheng"});
      if(Math.random()<0.06) doAct("grey",{});
    }
  }
  const d = D();
  out.push({end:S.ended||"超时", 年:S.year-2026, 官:RANKS[S.rank].n, 人口:S.pop, 现金:Math.round(S.cash),
    综合债务率:Math.round(d.debtRatio), 隐性:Math.round(d.hiddenRatio), 幸福:Math.round(S.morale),
    教育:Math.round(d.edu), 医疗:Math.round(d.med), 宜居:Math.round(d.livable), 就业:Math.round(d.emp*100),
    末分:S.history.length?S.history[S.history.length-1].total:null});
}
const cnt={}; out.forEach(r=>cnt[r.end]=(cnt[r.end]||0)+1);
console.log("策略:", POLICY, "│ 结局分布:", JSON.stringify(cnt));
const avg=k=>(out.reduce((s,r)=>s+(r[k]||0),0)/out.length).toFixed(1);
console.log("平均 年数",avg("年"),"人口",avg("人口"),"综合债务率",avg("综合债务率"),"隐性",avg("隐性"),
  "幸福",avg("幸福"),"教育",avg("教育"),"医疗",avg("医疗"),"宜居",avg("宜居"),"就业",avg("就业"),"末分",avg("末分"));
// 渲染自检：确保新增的数据面板 / 瀑布 / 预警函数不抛错
try{
  newGame(); const dd=D();
  const a=dataHTML(dd), b=wfSVG(dd), c=sanbaoWarn(dd), e2=deficitAttr(dd);
  console.log("render 自检:", typeof a==="string"&&a.length>50, "| wf:", b.includes("<svg"),
    "| warn:", typeof c==="string", "| def:", typeof e2==="string",
    "| 自动存档:", (saveAuto()?"OK":false), "| 续局检测:", hasAuto());
  // 新机制自检：土地出让 / 舆情 / 调研批示事件
  doAct("sellland",{}); doAct("briefing",{});
  const fin = financeHTML(D());
  console.log("新机制:", "房价指数", Math.round(S.houseIdx), "| 舆情", Math.round(S.opin),
    "| 已出让", S.landSold, "批 | 在建", S.pendingLand, "| 事件池", EVENTS.length, "条 | 动态模板", DYN_TPL.length, "条",
    "| 土地卡", fin.includes("土地财政"), "| 新事件", EVENTS.some(x=>x.t.includes("批示")));
}catch(err){ console.log("自检报错:", err.message); }
`;
eval(stub);
eval(code + harness);
