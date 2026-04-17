import React, { useState, useEffect, useMemo } from "react";

/* ================================================================
 * 律动轻食 Pro Max (2.6 UX修复版)
 * ─────────────────────────────────────────────────
 * 核心升级：
 * 1. 运动记录删除：Dashboard 面板增加运动条目的红色删除(x)按钮。
 * 2. 档案重置优化：重置身体档案时，自动清空今日的流水数据（饮食、饮水、运动），
 * 但保留用户保存的自定义模板。
 * ================================================================ */

const C = {
  bg: "#FAFAFA",
  primary: "#7A9E9F",
  primaryDark: "#5E8485",
  primaryBg: "#EAF2F2",
  secondary: "#8DA3B5",
  secondaryBg: "#EDF2F6",
  text: "#333333",
  textSub: "#555555",
  textMuted: "#999999",
  white: "#FFFFFF",
  border: "#EAEAEA",
  danger: "#C07870",
  dangerBg: "#F8EDEC",
  warn: "#E5A05B",
  warnBg: "#FDF4EC",
  warm: "#C9A87C",
  warmBg: "#F6F0E8",
  purple: "#A898B8",
  purpleBg: "#F0ECF4",
};

const shadowSm = "0 1px 8px rgba(0,0,0,0.04)";
const InputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: `1.5px solid ${C.border}`,
  background: C.white,
  fontSize: 16,
  color: C.text,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 16,
};

const loadData = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

// ── 全食物库 ──
const FOODS = [
  {
    id: 1,
    name: "燕麦片",
    cat: "谷薯类",
    carb: 66,
    pro: 16,
    fat: 6,
    kcal: 377,
    unit: "g",
    meals: ["breakfast", "snack"],
    hint: "约35g / 3瓷汤勺",
    micro: { v: "β-葡聚糖/B族维生素", desc: "平稳血糖，促进肠道蠕动" },
    badges: ["B族维生素"],
  },
  {
    id: 2,
    name: "全麦面包",
    cat: "谷薯类",
    carb: 50,
    pro: 8,
    fat: 0,
    kcal: 232,
    unit: "g",
    meals: ["breakfast", "lunch"],
    fixed: 50,
    hint: "约50g / 标准厚度1片",
    micro: { v: "膳食纤维/钾", desc: "强饱腹感，控制食欲" },
    badges: ["膳食纤维"],
  },
  {
    id: 3,
    name: "糙米饭",
    cat: "谷薯类",
    carb: 23,
    pro: 2.6,
    fat: 0.9,
    kcal: 111,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约200g / 1平碗",
    micro: { v: "镁/磷/维生素B1", desc: "提供持久脑力，缓解疲劳" },
  },
  {
    id: 4,
    name: "红薯",
    cat: "谷薯类",
    carb: 20,
    pro: 1.6,
    fat: 0.1,
    kcal: 86,
    unit: "g",
    meals: ["breakfast", "lunch", "dinner"],
    hint: "约150g / 拳头大小1个",
    micro: { v: "维生素A/胡萝卜素", desc: "保护视力，增强皮肤屏障" },
  },
  {
    id: 5,
    name: "紫薯",
    cat: "谷薯类",
    carb: 25,
    pro: 1.5,
    fat: 0.2,
    kcal: 106,
    unit: "g",
    meals: ["breakfast", "dinner"],
    hint: "约100g / 拳头大小1个",
    micro: { v: "花青素", desc: "高效抗氧化，清除自由基" },
  },
  {
    id: 6,
    name: "玉米",
    cat: "谷薯类",
    carb: 21,
    pro: 3.3,
    fat: 1.2,
    kcal: 112,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约200g / 中等大小1根(带棒骨)",
    micro: { v: "叶黄素/玉米黄质", desc: "抗衰老，保护黄斑区" },
  },
  {
    id: 7,
    name: "荞麦面",
    cat: "谷薯类",
    carb: 70,
    pro: 14,
    fat: 2,
    kcal: 340,
    unit: "g",
    meals: ["lunch"],
    hint: "约50g / 1小把干面",
    micro: { v: "芦丁", desc: "保护心血管，改善微循环" },
  },
  {
    id: 8,
    name: "菠菜",
    cat: "蔬菜类",
    carb: 3.6,
    pro: 2.9,
    fat: 0.4,
    kcal: 23,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约200g / 煮熟后1小盘",
    micro: { v: "维生素K/铁/叶酸", desc: "维持造血功能，强健骨骼" },
    badges: ["铁", "叶酸"],
  },
  {
    id: 9,
    name: "西兰花",
    cat: "蔬菜类",
    carb: 7,
    pro: 2.8,
    fat: 0.4,
    kcal: 34,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约200g / 半个",
    micro: { v: "维生素C/萝卜硫素", desc: "强效抗氧化，增强肝脏排毒" },
    badges: ["维C"],
  },
  {
    id: 10,
    name: "生菜",
    cat: "蔬菜类",
    carb: 2.9,
    pro: 1.4,
    fat: 0.2,
    kcal: 15,
    unit: "g",
    meals: ["breakfast", "lunch", "dinner"],
    hint: "约100g / 几片大叶子",
    micro: { v: "水分/维生素E", desc: "清热解毒，低卡充饥" },
  },
  {
    id: 11,
    name: "番茄",
    cat: "蔬菜类",
    carb: 3.9,
    pro: 0.9,
    fat: 0.2,
    kcal: 18,
    unit: "g",
    meals: ["breakfast", "lunch", "dinner"],
    hint: "约150g / 拳头大小1个",
    micro: { v: "番茄红素/钾", desc: "保护心血管，抗炎防晒" },
    badges: ["维C", "钾"],
  },
  {
    id: 12,
    name: "黄瓜",
    cat: "蔬菜类",
    carb: 3.6,
    pro: 0.6,
    fat: 0.1,
    kcal: 15,
    unit: "g",
    meals: ["lunch", "dinner", "snack"],
    hint: "约150g / 半根",
    micro: { v: "丙醇二酸", desc: "抑制糖类转化为脂肪" },
  },
  {
    id: 13,
    name: "胡萝卜",
    cat: "蔬菜类",
    carb: 9.6,
    pro: 0.9,
    fat: 0.2,
    kcal: 41,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 半根",
    micro: { v: "β-胡萝卜素", desc: "转化为维生素A，防夜盲症" },
  },
  {
    id: 14,
    name: "大白菜",
    cat: "蔬菜类",
    carb: 3.2,
    pro: 1.5,
    fat: 0.1,
    kcal: 16,
    unit: "g",
    meals: ["dinner"],
    hint: "约200g / 3-4片大叶",
    micro: { v: "维生素C/钙", desc: "低卡填胃，促进代谢" },
  },
  {
    id: 15,
    name: "鸡胸肉",
    cat: "畜禽肉类",
    carb: 0,
    pro: 31,
    fat: 3.6,
    kcal: 165,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 1个掌心大小",
    micro: { v: "烟酸/维生素B6", desc: "高效合成肌肉，修复组织" },
  },
  {
    id: 16,
    name: "瘦牛肉",
    cat: "畜禽肉类",
    carb: 0,
    pro: 26,
    fat: 5,
    kcal: 150,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 1个掌心大小",
    micro: { v: "血红素铁/肌酸", desc: "提升运动表现，预防贫血" },
    badges: ["铁", "锌"],
  },
  {
    id: 17,
    name: "去皮鸡腿肉",
    cat: "畜禽肉类",
    carb: 0,
    pro: 24,
    fat: 8,
    kcal: 180,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 1个普通鸡腿去骨",
    micro: { v: "锌/铁", desc: "口感滑嫩，改善免疫功能" },
  },
  {
    id: 18,
    name: "瘦猪肉",
    cat: "畜禽肉类",
    carb: 0,
    pro: 27,
    fat: 6,
    kcal: 160,
    unit: "g",
    meals: ["lunch"],
    hint: "约100g / 1个掌心大小",
    micro: { v: "维生素B1", desc: "参与糖代谢，维持神经系统" },
    badges: ["B族维生素"],
  },
  {
    id: 19,
    name: "三文鱼",
    cat: "水产类",
    carb: 0,
    pro: 20,
    fat: 13,
    kcal: 208,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 1个掌心大小",
    micro: { v: "Omega-3/维生素D", desc: "优质脑黄金，抗炎降脂" },
    badges: ["Omega-3"],
  },
  {
    id: 20,
    name: "鳕鱼",
    cat: "水产类",
    carb: 0,
    pro: 17,
    fat: 0.7,
    kcal: 82,
    unit: "g",
    meals: ["dinner"],
    hint: "约100g / 1小块",
    micro: { v: "碘/优质蛋白", desc: "极低脂肪，高消化率" },
  },
  {
    id: 21,
    name: "青虾仁",
    cat: "水产类",
    carb: 0,
    pro: 24,
    fat: 0.6,
    kcal: 99,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 10-12只",
    micro: { v: "锌/虾青素", desc: "提升免疫，高蛋白极低脂" },
  },
  {
    id: 22,
    name: "龙利鱼",
    cat: "水产类",
    carb: 0,
    pro: 18,
    fat: 1.2,
    kcal: 88,
    unit: "g",
    meals: ["dinner"],
    hint: "约100g / 1小块",
    micro: { v: "镁/磷", desc: "肉质软嫩，保护心血管" },
  },
  {
    id: 23,
    name: "全鸡蛋",
    cat: "蛋奶类",
    carb: 1.1,
    pro: 13,
    fat: 11,
    kcal: 155,
    unit: "g",
    meals: ["breakfast", "lunch", "dinner"],
    hint: "约60g / 1颗带壳",
    micro: { v: "卵磷脂/全谱氨基酸", desc: "吸收率第一的完美蛋白" },
  },
  {
    id: 24,
    name: "蛋白",
    cat: "蛋奶类",
    carb: 0.7,
    pro: 11,
    fat: 0.1,
    kcal: 52,
    unit: "g",
    meals: ["breakfast", "dinner"],
    hint: "约30g / 1颗鸡蛋的蛋白",
    micro: { v: "纯净蛋白", desc: "无胆固醇负担，极速补充" },
  },
  {
    id: 25,
    name: "纯牛奶",
    cat: "蛋奶类",
    carb: 5,
    pro: 3.3,
    fat: 3.6,
    kcal: 64,
    unit: "ml",
    meals: ["breakfast", "snack"],
    fixed: 250,
    hint: "约250ml / 1盒",
    micro: { v: "活性钙/维生素B2", desc: "安神助眠，强健牙齿骨骼" },
    badges: ["钙"],
  },
  {
    id: 26,
    name: "无糖酸奶",
    cat: "蛋奶类",
    carb: 5.5,
    pro: 4.3,
    fat: 2,
    kcal: 57,
    unit: "ml",
    meals: ["breakfast", "snack"],
    hint: "约100ml / 1小杯",
    micro: { v: "益生菌", desc: "调节肠道菌群，促进消化" },
  },
  {
    id: 27,
    name: "嫩豆腐",
    cat: "大豆坚果类",
    carb: 1.9,
    pro: 8,
    fat: 4.8,
    kcal: 76,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约150g / 半块",
    micro: { v: "大豆异黄酮/植物固醇", desc: "调节内分泌，清热润燥" },
  },
  {
    id: 28,
    name: "老豆腐",
    cat: "大豆坚果类",
    carb: 4,
    pro: 15,
    fat: 9,
    kcal: 150,
    unit: "g",
    meals: ["lunch", "dinner"],
    hint: "约100g / 扑克牌大小1块",
    micro: { v: "钙/植物蛋白", desc: "素食者的优质钙源和肉类替代" },
    badges: ["钙"],
  },
  {
    id: 29,
    name: "南瓜子",
    cat: "大豆坚果类",
    carb: 15,
    pro: 30,
    fat: 49,
    kcal: 559,
    unit: "g",
    meals: ["snack"],
    hint: "约15g / 1小把",
    micro: { v: "锌/镁", desc: "维护前列腺健康，抗氧化" },
  },
  {
    id: 30,
    name: "巴旦木",
    cat: "大豆坚果类",
    carb: 21,
    pro: 21,
    fat: 49,
    kcal: 579,
    unit: "g",
    meals: ["snack"],
    hint: "约15g / 10-12颗",
    micro: { v: "维生素E/单不饱和脂肪酸", desc: "优质脂肪，增加饱腹感" },
  },
  {
    id: 31,
    name: "核桃",
    cat: "大豆坚果类",
    carb: 14,
    pro: 15,
    fat: 65,
    kcal: 654,
    unit: "g",
    meals: ["snack"],
    hint: "约15g / 2-3个完整核桃仁",
    micro: { v: "Omega-3/磷脂", desc: "健脑益智，保护神经纤维" },
    badges: ["Omega-3"],
  },
  {
    id: 32,
    name: "无糖豆浆",
    cat: "大豆坚果类",
    carb: 1.5,
    pro: 3,
    fat: 1.6,
    kcal: 31,
    unit: "ml",
    meals: ["breakfast"],
    hint: "约250ml / 1杯",
    micro: { v: "植物蛋白/铁", desc: "不含乳糖，国人早餐佳品" },
  },
  {
    id: 99,
    name: "烹饪用油 (橄榄油/植物油)",
    cat: "油脂类",
    carb: 0,
    pro: 0,
    fat: 99,
    kcal: 890,
    unit: "g",
    meals: ["breakfast", "lunch", "dinner"],
    hint: "约10g / 1白瓷汤勺",
    micro: { v: "必需脂肪酸", desc: "脂溶性维生素吸收的必需媒介" },
  },
  {
    id: 33,
    name: "苹果",
    cat: "水果类",
    carb: 14,
    pro: 0.3,
    fat: 0.2,
    kcal: 52,
    unit: "g",
    meals: ["breakfast", "snack"],
    hint: "约150g / 1个拳头大小",
    micro: { v: "果胶/维生素C", desc: "减缓血糖上升，保护心脑" },
  },
  {
    id: 34,
    name: "蓝莓",
    cat: "水果类",
    carb: 14,
    pro: 0.7,
    fat: 0.3,
    kcal: 57,
    unit: "g",
    meals: ["breakfast", "snack"],
    hint: "约50g / 1小把",
    micro: { v: "花青素", desc: "顶级抗氧化剂，护眼明目" },
  },
  {
    id: 35,
    name: "香蕉",
    cat: "水果类",
    carb: 22,
    pro: 1,
    fat: 0.2,
    kcal: 89,
    unit: "g",
    meals: ["breakfast", "snack"],
    hint: "约100g / 1根中等大小",
    micro: { v: "钾/色氨酸", desc: "缓解肌肉痉挛，制造快乐荷尔蒙" },
  },
  {
    id: 36,
    name: "小番茄",
    cat: "水果类",
    carb: 4,
    pro: 0.9,
    fat: 0.2,
    kcal: 22,
    unit: "g",
    meals: ["snack"],
    hint: "约60g / 5颗",
    micro: { v: "番茄红素/有机酸", desc: "开胃生津，抗氧极佳" },
  },
  {
    id: 37,
    name: "草莓",
    cat: "水果类",
    carb: 7.6,
    pro: 0.6,
    fat: 0.3,
    kcal: 32,
    unit: "g",
    meals: ["snack"],
    hint: "约100g / 6-8颗",
    micro: { v: "维生素C/鞣酸", desc: "强效抗氧化，美白护肤" },
    badges: ["维C"],
  },
];

// ── 独立补剂库 ──
const SUPPLEMENTS = [
  {
    id: 101,
    name: "乳清蛋白粉",
    kcal: 120,
    pro: 24,
    carb: 2,
    fat: 1.5,
    unit: "g",
    hint: "推荐: 30g/平勺",
    editable: true,
    micro: { v: "优质蛋白", desc: "极速吸收，修复受损肌肉" },
  },
  {
    id: 102,
    name: "一水肌酸",
    kcal: 0,
    pro: 0,
    carb: 0,
    fat: 0,
    unit: "g",
    hint: "推荐: 5g/小勺",
    editable: false,
    micro: { v: "肌酸", desc: "提升爆发力，增加肌肉储水" },
  },
  {
    id: 103,
    name: "复合维生素片",
    kcal: 0,
    pro: 0,
    carb: 0,
    fat: 0,
    unit: "粒",
    hint: "推荐: 1粒",
    editable: false,
    micro: { v: "全谱维矿", desc: "弥补饮食结构缺陷" },
    badges: ["维C", "B族维生素", "铁", "锌", "叶酸", "钙"],
  },
  {
    id: 104,
    name: "深海鱼油",
    kcal: 9,
    pro: 0,
    carb: 0,
    fat: 1,
    unit: "粒",
    hint: "推荐: 1粒",
    editable: false,
    micro: { v: "EPA/DHA", desc: "高效抗炎，促进心脑血管健康" },
    badges: ["Omega-3"],
  },
];

const ACT = [
  {
    key: "sedentary",
    label: "久坐不动",
    desc: "办公室工作，基本无额外运动",
    add: 0,
  },
  { key: "light", label: "轻度运动", desc: "散步、瑜伽等，微出汗", add: 200 },
  {
    key: "moderate",
    label: "中度运动",
    desc: "慢跑、普通器械，心率加快",
    add: 350,
  },
  {
    key: "active",
    label: "高强度运动",
    desc: "HIIT、大重量训练，力竭",
    add: 500,
  },
];

const EXERCISE_TYPES = [
  { id: "e1", name: "散步/拉伸", coef: 2.0, placeholder: 30 },
  { id: "e2", name: "力量训练 (无氧)", coef: 6.0, placeholder: 90 },
  { id: "e3", name: "慢跑/游泳 (有氧)", coef: 8.5, placeholder: 45 },
  { id: "e4", name: "高强度 HIIT", coef: 12.0, placeholder: 20 },
];

const MEALS_META = [
  { key: "breakfast", label: "早餐" },
  { key: "lunch", label: "午餐" },
  { key: "snack", label: "加餐" },
  { key: "dinner", label: "晚餐" },
];

const MOCK = {
  gender: "female",
  age: 25,
  height: 160,
  weight: 60,
  activityLevel: "light",
  deficit: 300,
  hasHypertension: false,
  lastPeriodDate: "",
};

const calcBMR = (gender, weight, height, age) => {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
};

const checkIsPeriod = (lastDateStr) => {
  if (!lastDateStr) return false;
  const lastDate = new Date(lastDateStr);
  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays % 28 <= 5;
};

const calcNutrition = (p) => {
  const bmr = calcBMR(p.gender, p.weight, p.height, p.age);
  const exerciseBurn = ACT.find((a) => a.key === p.activityLevel)?.add || 0;
  const tdee = bmr + exerciseBurn;
  let targetKcal = tdee - p.deficit;
  return {
    bmr: Math.round(bmr),
    exerciseBurn,
    targetKcal: Math.round(targetKcal),
    targetCarb: Math.round((targetKcal * 0.45) / 4),
    targetPro: Math.round((targetKcal * 0.3) / 4),
    targetFat: Math.round((targetKcal * 0.25) / 9),
  };
};

const allocateMeal = (selectedFoods, dailyNutrition, mealKey) => {
  const ratio = mealKey === "lunch" ? 0.4 : mealKey === "snack" ? 0.1 : 0.25;
  let rem = {
    carb: dailyNutrition.targetCarb * ratio,
    pro: dailyNutrition.targetPro * ratio,
    fat: dailyNutrition.targetFat * ratio,
  };
  let rec = {};

  selectedFoods.forEach((f) => {
    if (f.fixed) {
      rec[f.id] = f.fixed;
      rem.carb -= (f.fixed / (f.unit === "粒" ? 1 : 100)) * f.carb;
      rem.pro -= (f.fixed / (f.unit === "粒" ? 1 : 100)) * f.pro;
      rem.fat -= (f.fixed / (f.unit === "粒" ? 1 : 100)) * f.fat;
    }
  });

  const flexible = selectedFoods.filter((f) => !f.fixed);
  const carbFoods = flexible.filter(
    (f) => f.cat === "谷薯类" || f.cat === "水果类"
  );
  const proFoods = flexible.filter(
    (f) => f.cat === "畜禽肉类" || f.cat === "水产类" || f.cat === "蛋奶类"
  );
  const fatFoods = flexible.filter(
    (f) => f.cat === "大豆坚果类" || f.cat === "油脂类"
  );
  const vegFoods = flexible.filter((f) => f.cat === "蔬菜类");

  const targetProPerFood =
    proFoods.length > 0 ? Math.max(rem.pro / proFoods.length, 0) : 0;
  const targetCarbPerFood =
    carbFoods.length > 0 ? Math.max(rem.carb / carbFoods.length, 0) : 0;
  const targetFatPerFood =
    fatFoods.length > 0 ? Math.max(rem.fat / fatFoods.length, 0) : 0;

  vegFoods.forEach((f) => {
    rec[f.id] = 150;
  });
  proFoods.forEach((f) => {
    let g = f.pro > 0 ? (targetProPerFood / f.pro) * 100 : 100;
    rec[f.id] = Math.round(Math.min(Math.max(g, 50), 200));
  });
  carbFoods.forEach((f) => {
    let g = f.carb > 0 ? (targetCarbPerFood / f.carb) * 100 : 100;
    rec[f.id] = Math.round(Math.min(Math.max(g, 30), 250));
  });
  fatFoods.forEach((f) => {
    let g = f.fat > 0 ? (targetFatPerFood / f.fat) * 100 : 10;
    rec[f.id] = Math.round(Math.min(Math.max(g, 5), 25));
  });

  const recommendations = selectedFoods.map((f) => ({
    food: f,
    recGrams: rec[f.id] || (f.unit === "粒" ? 1 : 100),
    actualGrams: rec[f.id] || (f.unit === "粒" ? 1 : 100),
  }));
  const targets = {
    targetPro: dailyNutrition.targetPro * ratio,
    targetFat: dailyNutrition.targetFat * ratio,
    targetCarb: dailyNutrition.targetCarb * ratio,
  };

  return { recommendations, targets };
};

function Onboarding({ onComplete, initial }) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);
  const [data, setData] = useState({ ...MOCK, ...initial });

  const go = (next) => {
    setShow(false);
    setTimeout(() => {
      setStep(next);
      setShow(true);
    }, 280);
  };

  const stepsConfig = [
    { id: "welcome", title: "律动轻食 Pro Max" },
    {
      id: "basic",
      title: "基本信息",
      check: () => data.gender && data.age !== "",
    },
    {
      id: "body",
      title: "身体数据",
      check: () => data.height !== "" && data.weight !== "",
    },
    { id: "activity", title: "运动习惯", check: () => data.activityLevel },
    {
      id: "deficit",
      title: "健康目标",
      check: () =>
        data.deficit !== "" && data.deficit >= 100 && data.deficit <= 1000,
    },
    { id: "health", title: "健康状况", check: () => true },
  ];
  if (data.gender === "female" && data.age <= 50)
    stepsConfig.push({ id: "period", title: "生理周期", check: () => true });

  const canNext = stepsConfig[step].check ? stepsConfig[step].check() : true;

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "24px 24px 0", display: "flex", gap: 4 }}>
        {stepsConfig.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= step ? C.primary : C.border,
              transition: "0.3s",
            }}
          />
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          alignItems: "center",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.28s ease",
        }}
      >
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
            }}
          >
            {stepsConfig[step].title}
          </h2>
          {step === 0 && (
            <p style={{ color: C.textSub }}>
              欢迎使用。
              <br />
              精准计算营养需求，为您定制科学饮食。
            </p>
          )}
          {step === 1 && (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
                请选择性别并填写年龄
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setData({ ...data, gender: g })}
                    style={{
                      flex: 1,
                      padding: "16px",
                      borderRadius: 16,
                      border: `2px solid ${
                        data.gender === g ? C.primary : C.border
                      }`,
                      background: data.gender === g ? C.primaryBg : C.white,
                      fontWeight: 600,
                      color: data.gender === g ? C.primaryDark : C.text,
                      cursor: "pointer",
                    }}
                  >
                    {g === "male" ? "👨 男" : "👩 女"}
                  </button>
                ))}
              </div>
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.textSub,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                年龄
              </label>
              <input
                type="number"
                placeholder="例如: 25"
                value={data.age}
                onChange={(e) =>
                  setData({
                    ...data,
                    age: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                style={InputStyle}
              />
            </>
          )}
          {step === 2 && (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
                用于精确计算每日基础热量消耗
              </p>
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.textSub,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                身高 (cm)
              </label>
              <input
                type="number"
                placeholder="例如: 160"
                value={data.height}
                onChange={(e) =>
                  setData({
                    ...data,
                    height: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                style={InputStyle}
              />
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.textSub,
                  marginBottom: 8,
                  display: "block",
                  marginTop: 8,
                }}
              >
                体重 (kg)
              </label>
              <input
                type="number"
                placeholder="例如: 60"
                value={data.weight}
                onChange={(e) =>
                  setData({
                    ...data,
                    weight: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                style={InputStyle}
              />
            </>
          )}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>
                选择符合您日常状态的运动量：
              </p>
              {ACT.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setData({ ...data, activityLevel: a.key })}
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderRadius: 14,
                    border: `2px solid ${
                      data.activityLevel === a.key ? C.primary : C.border
                    }`,
                    background:
                      data.activityLevel === a.key ? C.primaryBg : C.white,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, color: C.text }}>
                    {a.label}
                  </div>
                  <div
                    style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}
                  >
                    {a.desc}
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 4 && (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>
                建议平稳进行，推荐热量缺口 200-300 大卡。
              </p>
              <input
                type="number"
                placeholder="推荐: 300"
                value={data.deficit}
                onChange={(e) =>
                  setData({
                    ...data,
                    deficit:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                style={InputStyle}
              />
              {data.deficit > 500 && (
                <div
                  style={{
                    color: C.danger,
                    fontSize: 12,
                    padding: "8px",
                    background: C.dangerBg,
                    borderRadius: 8,
                  }}
                >
                  缺口过大，容易引起身体疲乏，请谨慎调整！
                </div>
              )}
            </>
          )}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>
                特殊健康状态能够帮助我们制定更安全的计划。
              </p>
              <button
                onClick={() =>
                  setData({ ...data, hasHypertension: !data.hasHypertension })
                }
                style={{
                  textAlign: "left",
                  padding: "14px",
                  borderRadius: 14,
                  border: `2px solid ${
                    data.hasHypertension ? C.danger : C.border
                  }`,
                  background: data.hasHypertension ? C.dangerBg : C.white,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {data.hasHypertension ? "☑" : "☐"} 关注心血管 / 控制血压
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  开启后，看板将提醒严格限制每日钠与油脂的摄入。
                </div>
              </button>
            </div>
          )}
          {step === 6 && stepsConfig[6]?.id === "period" && (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>
                末次月经首日（用于经期热量智能调整）
              </p>
              <input
                type="date"
                value={data.lastPeriodDate}
                onChange={(e) =>
                  setData({ ...data, lastPeriodDate: e.target.value })
                }
                style={InputStyle}
              />
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "0 24px 36px", display: "flex", gap: 12 }}>
        {step > 0 && (
          <button
            onClick={() => go(step - 1)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: 16,
              background: C.border,
              fontWeight: 600,
              border: "none",
            }}
          >
            返回
          </button>
        )}
        <button
          onClick={() =>
            step >= stepsConfig.length - 1 ? onComplete(data) : go(step + 1)
          }
          disabled={!canNext}
          style={{
            flex: 2,
            padding: "14px",
            borderRadius: 16,
            background: canNext ? C.primary : C.border,
            color: canNext ? C.white : C.textMuted,
            fontWeight: 700,
            border: "none",
          }}
        >
          {step >= stepsConfig.length - 1 ? "完成设置" : "下一步"}
        </button>
      </div>
    </div>
  );
}

function CalorieRing({ actual, target }) {
  const size = 200,
    strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(actual / target, 1);
  const offset = circumference * (1 - progress);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="g1">
            <stop offset="0%" stopColor={C.primary} />
            <stop offset="100%" stopColor={C.secondary} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={C.border}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#g1)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, color: C.text }}>
          {Math.round(actual)}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted }}>
          / {Math.round(target)} kcal
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, actual, target, color }) {
  const progress = Math.min(actual / target, 1) * 100;
  return (
    <div
      style={{
        flex: 1,
        background: C.white,
        padding: "12px",
        borderRadius: 12,
        boxShadow: shadowSm,
      }}
    >
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {Math.round(actual)}
        <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>
          {" "}
          / {Math.round(target)}g
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: C.border,
          borderRadius: 2,
          marginTop: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            background: color,
            borderRadius: 2,
            width: `${progress}%`,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

function Dashboard({
  nutrition,
  intake,
  profile,
  water,
  setWater,
  exercises,
  setExercises,
}) {
  const [dailyMode, setDailyMode] = useState("normal");
  const isPeriod =
    profile.gender === "female" && checkIsPeriod(profile.lastPeriodDate);

  let tKcal = 0,
    tCarb = 0,
    tPro = 0,
    tFat = 0;
  const categories = new Set();
  const collectedBadges = new Set();

  Object.keys(intake).forEach((mealKey) => {
    if (mealKey === "supplements") {
      (intake.supplements || []).forEach((item) => {
        tKcal += item.kcal || 0;
        tCarb += item.carb || 0;
        tPro += item.pro || 0;
        tFat += item.fat || 0;
        if (item.badges) item.badges.forEach((b) => collectedBadges.add(b));
      });
    } else {
      (intake[mealKey] || []).forEach((item) => {
        const food = FOODS.find((f) => f.id === item.foodId);
        if (food) {
          tKcal += (item.grams / (food.unit === "粒" ? 1 : 100)) * food.kcal;
          tCarb += (item.grams / (food.unit === "粒" ? 1 : 100)) * food.carb;
          tPro += (item.grams / (food.unit === "粒" ? 1 : 100)) * food.pro;
          tFat += (item.grams / (food.unit === "粒" ? 1 : 100)) * food.fat;
          categories.add(food.cat);
          if (food.badges) food.badges.forEach((b) => collectedBadges.add(b));
        }
      });
    }
  });

  const dynamicBurn = exercises.reduce((sum, ex) => sum + ex.kcal, 0);

  let finalTargetKcal = nutrition.targetKcal + dynamicBurn;
  let finalTargetCarb = nutrition.targetCarb + (dynamicBurn * 0.45) / 4;
  let finalTargetPro = nutrition.targetPro + (dynamicBurn * 0.3) / 4;
  let finalTargetFat = nutrition.targetFat + (dynamicBurn * 0.25) / 9;

  if (dailyMode === "training") {
    finalTargetKcal += 300;
    finalTargetCarb += 40;
    finalTargetPro += 20;
  } else if (dailyMode === "study") {
    finalTargetFat += 10;
    finalTargetCarb -= 15;
  }

  let healthScore = 0;
  if (categories.has("谷薯类")) healthScore += 25;
  if (categories.has("蔬菜类") || categories.has("水果类")) healthScore += 25;
  if (
    categories.has("畜禽肉类") ||
    categories.has("水产类") ||
    categories.has("蛋奶类")
  )
    healthScore += 30;
  if (categories.has("大豆坚果类") || categories.has("油脂类"))
    healthScore += 20;

  const handleAddExercise = (type, mins) => {
    const kcal = mins * type.coef;
    setExercises([
      ...exercises,
      { id: Date.now(), name: type.name, duration: mins, kcal },
    ]);
  };

  const handleRemoveExercise = (exId) => {
    setExercises(exercises.filter((ex) => ex.id !== exId));
  };

  const generateMarkdown = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    const modeName =
      dailyMode === "training"
        ? "高强度训练模式"
        : dailyMode === "study"
        ? "脑力备考模式"
        : "日常均衡模式";
    const carbPercent = tKcal > 0 ? Math.round(((tCarb * 4) / tKcal) * 100) : 0;
    const proPercent = tKcal > 0 ? Math.round(((tPro * 4) / tKcal) * 100) : 0;
    const fatPercent = tKcal > 0 ? Math.round(((tFat * 9) / tKcal) * 100) : 0;

    let md = `# 📝 饮食与状态复盘 (${dateStr})\n\n`;
    md += `> **当前状态**: ${modeName} | **结构评分**: ${healthScore}分\n\n`;

    md += `## 📊 核心指标\n`;
    md += `- **摄入热量**: ${Math.round(tKcal)} / ${Math.round(
      finalTargetKcal
    )} kcal\n`;
    md += `- **碳水**: ${Math.round(
      tCarb
    )}g (${carbPercent}%) | **蛋白**: ${Math.round(
      tPro
    )}g (${proPercent}%) | **脂肪**: ${Math.round(tFat)}g (${fatPercent}%)\n\n`;

    md += `## 🏅 微量元素集邮\n`;
    md += `- **已解锁**: ${
      collectedBadges.size > 0 ? Array.from(collectedBadges).join("、") : "暂无"
    }\n\n`;

    md += `## 🥗 全天饮食记录\n`;
    MEALS_META.forEach((m) => {
      const mealItems = intake[m.key] || [];
      if (mealItems.length > 0) {
        md += `- **${m.label}**\n`;
        mealItems.forEach((item) => {
          const food = FOODS.find((f) => f.id === item.foodId);
          if (food) md += `  - ${food.name} ${item.grams}${food.unit}\n`;
        });
      }
    });

    if (intake.supplements && intake.supplements.length > 0) {
      md += `- **💊 营养补剂**\n`;
      intake.supplements.forEach((item) => {
        md += `  - ${item.name} (${item.kcal} kcal, 蛋白 ${item.pro}g)\n`;
      });
    }
    md += `\n`;

    md += `## 💧 饮水与消耗\n`;
    md += `- **饮水进度**: ${water} / 2000 ml\n`;
    if (exercises.length > 0) {
      md += `- **额外运动**:\n`;
      exercises.forEach(
        (ex) =>
          (md += `  - ${ex.name} (${ex.duration}分钟) 消耗 ${Math.round(
            ex.kcal
          )} kcal\n`)
      );
    } else {
      md += `- **额外运动**: 无\n`;
    }

    navigator.clipboard
      .writeText(md)
      .then(() => {
        alert(
          "✅ 结构化复盘 Markdown 已复制到剪贴板！可以直接粘贴到你的日记本中了。"
        );
      })
      .catch(() => {
        alert("复制失败，请重试或检查浏览器权限。");
      });
  };

  return (
    <div style={{ padding: "20px 24px 100px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>今日概览</h2>
        <button
          onClick={generateMarkdown}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: C.secondaryBg,
            color: C.secondary,
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📋 导出复盘
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        <button
          onClick={() => setDailyMode("normal")}
          style={{
            flexShrink: 0,
            padding: "8px 16px",
            borderRadius: 20,
            background: dailyMode === "normal" ? C.primary : C.white,
            color: dailyMode === "normal" ? C.white : C.text,
            border: `1px solid ${
              dailyMode === "normal" ? C.primary : C.border
            }`,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          ⚖️ 日常均衡
        </button>
        <button
          onClick={() => setDailyMode("training")}
          style={{
            flexShrink: 0,
            padding: "8px 16px",
            borderRadius: 20,
            background: dailyMode === "training" ? C.danger : C.white,
            color: dailyMode === "training" ? C.white : C.text,
            border: `1px solid ${
              dailyMode === "training" ? C.danger : C.border
            }`,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          🏋️ 高强度训练
        </button>
        <button
          onClick={() => setDailyMode("study")}
          style={{
            flexShrink: 0,
            padding: "8px 16px",
            borderRadius: 20,
            background: dailyMode === "study" ? "#5C6BC0" : C.white,
            color: dailyMode === "study" ? C.white : C.text,
            border: `1px solid ${dailyMode === "study" ? "#5C6BC0" : C.border}`,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          📚 脑力备考
        </button>
      </div>

      {isPeriod && !collectedBadges.has("铁") && (
        <div
          style={{
            margin: "0 0 16px",
            padding: "12px 16px",
            borderRadius: 12,
            background: C.dangerBg,
            fontSize: 13,
            color: C.danger,
            display: "flex",
            gap: 8,
          }}
        >
          <span>🩸</span>
          <span>
            <strong>生理期提醒</strong>：今日暂未摄入富含【铁】的食物或补剂。
          </span>
        </div>
      )}

      {profile.hasHypertension && (
        <div
          style={{
            margin: "0 0 16px",
            padding: "12px 16px",
            borderRadius: 12,
            background: C.dangerBg,
            fontSize: 13,
            color: C.danger,
            display: "flex",
            gap: 8,
          }}
        >
          <span>⚠️</span>
          <span>
            <strong>低钠保护模式</strong>：控制每日钠摄入少于 2g。
          </span>
        </div>
      )}

      <div
        style={{
          background: C.primaryBg,
          padding: "16px",
          borderRadius: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: C.primaryDark,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          透明化能量公式
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{nutrition.bmr}</div>
            <div style={{ fontSize: 10 }}>基础代谢</div>
          </div>
          <div style={{ color: C.textMuted }}>+</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {nutrition.exerciseBurn}
            </div>
            <div style={{ fontSize: 10 }}>日常活动</div>
          </div>
          <div style={{ color: C.textMuted }}>-</div>
          <div style={{ color: C.danger }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {profile.deficit}
            </div>
            <div style={{ fontSize: 10 }}>自定缺口</div>
          </div>
          <div style={{ color: C.textMuted }}>+</div>
          <div style={{ color: C.warn }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {Math.round(dynamicBurn) + (dailyMode === "training" ? 300 : 0)}
            </div>
            <div style={{ fontSize: 10 }}>浮动调整</div>
          </div>
          <div style={{ color: C.textMuted }}>=</div>
          <div style={{ color: C.primary }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {Math.round(finalTargetKcal)}
            </div>
            <div style={{ fontSize: 10 }}>目标摄入</div>
          </div>
        </div>
      </div>

      <CalorieRing actual={tKcal} target={finalTargetKcal} />

      <div
        style={{ display: "flex", gap: 10, marginTop: 24, marginBottom: 24 }}
      >
        <MacroBar
          label="碳水"
          actual={tCarb}
          target={finalTargetCarb}
          color={C.warm}
        />
        <MacroBar
          label="蛋白质"
          actual={tPro}
          target={finalTargetPro}
          color={C.secondary}
        />
        <MacroBar
          label="脂肪"
          actual={tFat}
          target={finalTargetFat}
          color={C.purple}
        />
      </div>

      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "16px",
          marginBottom: 16,
          boxShadow: shadowSm,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: C.text,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          🏅 微量元素集邮
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["铁", "钙", "维C", "Omega-3", "B族维生素", "叶酸"].map((badge) => {
            const hasBadge = collectedBadges.has(badge);
            return (
              <span
                key={badge}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: hasBadge ? C.primaryBg : C.bg,
                  color: hasBadge ? C.primaryDark : C.border,
                  border: `1px solid ${hasBadge ? C.primary : C.border}`,
                }}
              >
                {hasBadge ? "✨ " : ""}
                {badge}
              </span>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: C.white,
          padding: "16px",
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: shadowSm,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `4px solid ${healthScore >= 80 ? C.primary : C.warn}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1,
            }}
          >
            {healthScore}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            结构健康度 (膳食宝塔)
          </div>
          <div style={{ fontSize: 12, color: C.textSub }}>
            {healthScore === 100
              ? "饮食结构完美，覆盖全部核心营养大类！"
              : "尚未凑齐核心分类，建议丰富食材种类。"}
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "16px",
          marginBottom: 16,
          boxShadow: shadowSm,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 700 }}>💧 饮水追踪</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {water} / 2000 ml
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: C.border,
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#64B5F6",
              borderRadius: 4,
              width: `${Math.min((water / 2000) * 100, 100)}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <button
          onClick={() => setWater((w) => w + 200)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 10,
            background: "#E3F2FD",
            color: "#1976D2",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + 200ml (一杯水)
        </button>
      </div>

      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "16px",
          marginBottom: 16,
          boxShadow: shadowSm,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12 }}>
          🏃‍♂️ 运动热量补充记录
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                const mins = window.prompt(
                  `请输入【${type.name}】的时长 (分钟)：`,
                  type.placeholder
                );
                if (mins && !isNaN(mins)) handleAddExercise(type, Number(mins));
              }}
              style={{
                flexShrink: 0,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.bg,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              + {type.name}
            </button>
          ))}
        </div>
        {exercises.length > 0 && (
          <div
            style={{
              marginTop: 12,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}
          >
            {exercises.map((ex) => (
              <div
                key={ex.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span>
                  {ex.name} ({ex.duration}分钟)
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.warn, fontWeight: 600 }}>
                    + {Math.round(ex.kcal)} kcal
                  </span>
                  <button
                    onClick={() => handleRemoveExercise(ex.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: C.danger,
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "0 4px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupplementsTracker({ intake, setIntake }) {
  const [customValues, setCustomValues] = useState({});

  const updateCustom = (id, field, value) => {
    setCustomValues((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleCheckIn = (supp) => {
    const custom = customValues[supp.id] || {};
    const record = {
      id: Date.now() + Math.random(),
      suppId: supp.id,
      name: supp.name,
      kcal: custom.kcal !== undefined ? Number(custom.kcal) : supp.kcal,
      pro: custom.pro !== undefined ? Number(custom.pro) : supp.pro,
      carb: supp.carb,
      fat: supp.fat,
      badges: supp.badges || [],
    };
    setIntake({
      ...intake,
      supplements: [...(intake.supplements || []), record],
    });
    alert(`✅ ${supp.name} 打卡成功！宏量素已同步至看板。`);
  };

  const removeRecord = (recordId) => {
    setIntake({
      ...intake,
      supplements: (intake.supplements || []).filter((r) => r.id !== recordId),
    });
  };

  const checkedIn = intake.supplements || [];

  return (
    <div style={{ padding: "20px 24px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
          💊 营养补剂
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
          一键轻量打卡，补充特定营养缺口。打卡后热量与蛋白将自动汇入今日总看板。
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {SUPPLEMENTS.map((supp) => (
          <div
            key={supp.id}
            style={{
              background: C.white,
              borderRadius: 16,
              padding: "16px",
              boxShadow: shadowSm,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: supp.editable ? 12 : 0,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                  {supp.name}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  {supp.hint}
                </div>
                {supp.micro && (
                  <div
                    style={{
                      fontSize: 11,
                      color: C.primaryDark,
                      background: C.primaryBg,
                      padding: "2px 6px",
                      borderRadius: 4,
                      display: "inline-block",
                      marginTop: 6,
                    }}
                  >
                    {supp.micro.v}
                  </div>
                )}
              </div>
              {!supp.editable && (
                <button
                  onClick={() => handleCheckIn(supp)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: C.primary,
                    color: C.white,
                    border: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ✔️ 打卡
                </button>
              )}
            </div>

            {supp.editable && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: `1px dashed ${C.border}`,
                  paddingTop: 12,
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: C.textSub,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      蛋白质 (g)
                    </label>
                    <input
                      type="number"
                      defaultValue={supp.pro}
                      onChange={(e) =>
                        updateCustom(supp.id, "pro", e.target.value)
                      }
                      style={{
                        width: 60,
                        padding: "6px",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: C.textSub,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      热量 (kcal)
                    </label>
                    <input
                      type="number"
                      defaultValue={supp.kcal}
                      onChange={(e) =>
                        updateCustom(supp.id, "kcal", e.target.value)
                      }
                      style={{
                        width: 60,
                        padding: "6px",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleCheckIn(supp)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    background: C.primary,
                    color: C.white,
                    border: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    height: "fit-content",
                  }}
                >
                  ✔️ 确认打卡
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {checkedIn.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            今日已打卡
          </h3>
          <div
            style={{
              background: C.white,
              borderRadius: 16,
              padding: "12px 16px",
              boxShadow: shadowSm,
            }}
          >
            {checkedIn.map((record) => (
              <div
                key={record.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {record.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    {record.kcal} kcal | 蛋白 {record.pro}g
                  </div>
                </div>
                <button
                  onClick={() => removeRecord(record.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.danger,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DietTracker({
  intake,
  setIntake,
  nutrition,
  templates,
  setTemplates,
}) {
  const [planningMeal, setPlanningMeal] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [showAutoPlanOpts, setShowAutoPlanOpts] = useState(false);

  const MEALS = [
    {
      key: "breakfast",
      label: "早餐",
      time: "07:30",
      desc: "唤醒身体，补充优质蛋白",
    },
    {
      key: "lunch",
      label: "午餐",
      time: "12:30",
      desc: "充足碳水，保持全天精力",
    },
    { key: "snack", label: "加餐", time: "15:30", desc: "健康小食，稳定血糖" },
    {
      key: "dinner",
      label: "晚餐",
      time: "18:30",
      desc: "低碳低脂，减轻肠胃负担",
    },
  ];

  const getMealKcal = (mealKey) => {
    return Math.round(
      (intake[mealKey] || []).reduce((sum, item) => {
        const f = FOODS.find((x) => x.id === item.foodId);
        return (
          sum + (f ? (item.grams / (f.unit === "粒" ? 1 : 100)) * f.kcal : 0)
        );
      }, 0)
    );
  };

  const removeRecord = (mealKey, recordId) =>
    setIntake({
      ...intake,
      [mealKey]: intake[mealKey].filter((item) => item.id !== recordId),
    });

  const openEncyclopedia = (mealKey) => {
    setPlanningMeal(mealKey);
    setSelectedIds([]);
    setAllocation(null);
  };

  const handleGeneratePlan = () => {
    const selectedFoods = selectedIds.map((id) =>
      FOODS.find((f) => f.id === id)
    );
    setAllocation(allocateMeal(selectedFoods, nutrition, planningMeal));
  };

  const updateActualGrams = (idx, val) => {
    const newRecs = [...allocation.recommendations];
    newRecs[idx].actualGrams = val === "" ? "" : val;
    setAllocation({ ...allocation, recommendations: newRecs });
  };

  const confirmIntake = () => {
    const newRecords = allocation.recommendations.map((r) => ({
      id: Date.now() + Math.random(),
      foodId: r.food.id,
      grams: Number(r.actualGrams) || 0,
    }));
    setIntake({
      ...intake,
      [planningMeal]: [...(intake[planningMeal] || []), ...newRecords],
    });
    setAllocation(null);
    setPlanningMeal(null);
    setSelectedIds([]);
  };

  const autoGeneratePlan = (planType) => {
    const newIntake = {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
      supplements: intake.supplements || [],
    };
    const getSpecificFood = (name) => FOODS.find((f) => f.name === name);

    if (planType === "balanced") {
      newIntake.breakfast.push({
        id: Date.now() + 1,
        foodId: getSpecificFood("全鸡蛋")?.id || 23,
        grams: 100,
      });
      newIntake.breakfast.push({
        id: Date.now() + 2,
        foodId: getSpecificFood("燕麦片")?.id || 1,
        grams: 50,
      });
      newIntake.lunch.push({
        id: Date.now() + 3,
        foodId: getSpecificFood("糙米饭")?.id || 3,
        grams: 150,
      });
      newIntake.lunch.push({
        id: Date.now() + 4,
        foodId: getSpecificFood("瘦猪肉")?.id || 18,
        grams: 150,
      });
      newIntake.lunch.push({
        id: Date.now() + 5,
        foodId: getSpecificFood("西兰花")?.id || 9,
        grams: 200,
      });
      newIntake.dinner.push({
        id: Date.now() + 6,
        foodId: getSpecificFood("三文鱼")?.id || 19,
        grams: 150,
      });
      newIntake.dinner.push({
        id: Date.now() + 7,
        foodId: getSpecificFood("菠菜")?.id || 8,
        grams: 200,
      });
      alert("【均衡减脂】全食物一键排餐已生成！(补剂请去独立页面打卡)");
    } else if (planType === "muscle") {
      newIntake.breakfast.push({
        id: Date.now() + 1,
        foodId: getSpecificFood("全鸡蛋")?.id || 23,
        grams: 150,
      });
      newIntake.breakfast.push({
        id: Date.now() + 2,
        foodId: getSpecificFood("纯牛奶")?.id || 25,
        grams: 250,
      });
      newIntake.breakfast.push({
        id: Date.now() + 3,
        foodId: getSpecificFood("全麦面包")?.id || 2,
        grams: 100,
      });
      newIntake.lunch.push({
        id: Date.now() + 4,
        foodId: getSpecificFood("瘦牛肉")?.id || 16,
        grams: 200,
      });
      newIntake.lunch.push({
        id: Date.now() + 5,
        foodId: getSpecificFood("糙米饭")?.id || 3,
        grams: 200,
      });
      newIntake.lunch.push({
        id: Date.now() + 6,
        foodId: getSpecificFood("番茄")?.id || 11,
        grams: 150,
      });
      newIntake.dinner.push({
        id: Date.now() + 7,
        foodId: getSpecificFood("鸡胸肉")?.id || 15,
        grams: 200,
      });
      newIntake.dinner.push({
        id: Date.now() + 8,
        foodId: getSpecificFood("红薯")?.id || 4,
        grams: 150,
      });
      alert("【高蛋白增肌】全食物一键排餐已生成！(补剂请去独立页面打卡)");
    } else if (planType === "low-carb") {
      newIntake.breakfast.push({
        id: Date.now() + 1,
        foodId: getSpecificFood("全鸡蛋")?.id || 23,
        grams: 100,
      });
      newIntake.breakfast.push({
        id: Date.now() + 2,
        foodId: getSpecificFood("无糖豆浆")?.id || 32,
        grams: 250,
      });
      newIntake.lunch.push({
        id: Date.now() + 3,
        foodId: getSpecificFood("去皮鸡腿肉")?.id || 17,
        grams: 150,
      });
      newIntake.lunch.push({
        id: Date.now() + 4,
        foodId: getSpecificFood("生菜")?.id || 10,
        grams: 250,
      });
      newIntake.dinner.push({
        id: Date.now() + 5,
        foodId: getSpecificFood("鳕鱼")?.id || 20,
        grams: 200,
      });
      newIntake.dinner.push({
        id: Date.now() + 6,
        foodId: getSpecificFood("黄瓜")?.id || 12,
        grams: 200,
      });
      alert("【低碳速降】全食物一键排餐已生成！(补剂请去独立页面打卡)");
    }
    setIntake(newIntake);
    setShowAutoPlanOpts(false);
  };

  const saveAsTemplate = () => {
    const name = window.prompt("给当天的饮食组合起个名字吧：", "我的常吃搭配");
    if (name) {
      setTemplates([...templates, { id: Date.now(), name, data: intake }]);
      alert("模板保存成功！");
    }
  };

  const loadTemplate = (tpl) => {
    if (window.confirm(`确定要加载模板 "${tpl.name}" 吗？`))
      setIntake(tpl.data);
  };

  const renderWarnings = () => {
    if (!allocation) return null;
    let actPro = 0,
      actFat = 0,
      actCarb = 0;
    allocation.recommendations.forEach((r) => {
      const g = Number(r.actualGrams) || 0;
      actPro += (g / (r.food.unit === "粒" ? 1 : 100)) * r.food.pro;
      actFat += (g / (r.food.unit === "粒" ? 1 : 100)) * r.food.fat;
      actCarb += (g / (r.food.unit === "粒" ? 1 : 100)) * r.food.carb;
    });

    const warnings = [];
    if (actPro < allocation.targets.targetPro * 0.5)
      warnings.push({
        type: "danger",
        text: "全食物蛋白质偏低，可去补剂页增加蛋白粉。",
      });
    if (actFat - allocation.targets.targetFat > 10)
      warnings.push({
        type: "danger",
        text: `脂肪超出推荐值 ${(actFat - allocation.targets.targetFat).toFixed(
          1
        )}g！`,
      });
    if (actCarb > allocation.targets.targetCarb * 1.3)
      warnings.push({ type: "warn", text: "主食过多易引起餐后血糖波动。" });

    return warnings.length > 0 ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {warnings.map((w, i) => (
          <div
            key={i}
            style={{
              padding: "10px",
              borderRadius: 8,
              background: w.type === "danger" ? C.dangerBg : C.warnBg,
              color: w.type === "danger" ? C.danger : C.warn,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ⚠️ {w.text}
          </div>
        ))}
      </div>
    ) : (
      <div
        style={{
          marginBottom: 20,
          padding: "10px",
          borderRadius: 8,
          background: "#E8F5E9",
          color: "#2E7D32",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ✅ 营养配比均衡，继续保持！
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 24px 100px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          全天饮食记录
        </h2>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          {showAutoPlanOpts ? (
            <div
              style={{
                display: "flex",
                gap: 4,
                background: C.white,
                padding: "4px",
                borderRadius: 10,
                boxShadow: shadowSm,
                border: `1px solid ${C.border}`,
              }}
            >
              <button
                onClick={() => autoGeneratePlan("balanced")}
                style={{
                  padding: "4px 8px",
                  background: C.primaryBg,
                  color: C.primaryDark,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                均衡
              </button>
              <button
                onClick={() => autoGeneratePlan("muscle")}
                style={{
                  padding: "4px 8px",
                  background: C.warnBg,
                  color: C.warn,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                增肌
              </button>
              <button
                onClick={() => autoGeneratePlan("low-carb")}
                style={{
                  padding: "4px 8px",
                  background: C.secondaryBg,
                  color: C.secondary,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                低碳
              </button>
              <button
                onClick={() => setShowAutoPlanOpts(false)}
                style={{
                  padding: "4px 8px",
                  background: "transparent",
                  color: C.textMuted,
                  border: "none",
                  fontSize: 11,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAutoPlanOpts(true)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: C.warmBg,
                color: C.warm,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🪄 一键排餐
            </button>
          )}
          <button
            onClick={saveAsTemplate}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: C.secondaryBg,
              color: C.secondary,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            💾 存模板
          </button>
        </div>
      </div>

      {templates.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl)}
              style={{
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${C.primary}`,
                background: C.white,
                color: C.primary,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              🔄 {tpl.name}
            </button>
          ))}
        </div>
      )}

      {MEALS.map((meal) => (
        <div
          key={meal.key}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: "16px",
            marginBottom: 16,
            boxShadow: shadowSm,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {meal.label}{" "}
                <span
                  style={{ fontSize: 12, color: C.textMuted, fontWeight: 400 }}
                >
                  {meal.time}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.primary, marginTop: 2 }}>
                {meal.desc}
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
              {getMealKcal(meal.key)}{" "}
              <span
                style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}
              >
                kcal
              </span>
            </div>
          </div>
          {(intake[meal.key] || []).length > 0 && (
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                paddingTop: 8,
                paddingBottom: 8,
              }}
            >
              {intake[meal.key].map((item) => {
                const f = FOODS.find((x) => x.id === item.foodId);
                const k = Math.round(
                  (item.grams / (f.unit === "粒" ? 1 : 100)) * f.kcal
                );
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {item.grams} {f.unit}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {k} kcal
                      </div>
                      <button
                        onClick={() => removeRecord(meal.key, item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: C.danger,
                          fontSize: 18,
                          cursor: "pointer",
                          padding: "0 4px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => openEncyclopedia(meal.key)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              background: C.primaryBg,
              color: C.primaryDark,
              border: "none",
              fontWeight: 600,
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            + 第 1 步：从食材图鉴选择
          </button>
        </div>
      ))}

      {planningMeal && !allocation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: C.bg,
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px 20px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0 }}>
              食材图鉴 ({MEALS.find((m) => m.key === planningMeal).label})
            </h3>
            <button
              onClick={() => setPlanningMeal(null)}
              style={{
                border: "none",
                background: "none",
                color: C.textMuted,
                fontSize: 16,
              }}
            >
              关闭
            </button>
          </div>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>
            可多选。系统将在下一步智能计算推荐克重。
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FOODS.filter((f) => f.meals.includes(planningMeal)).map((f) => {
              const selected = selectedIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      prev.includes(f.id)
                        ? prev.filter((x) => x !== f.id)
                        : [...prev, f.id]
                    )
                  }
                  style={{
                    padding: "16px",
                    borderRadius: 14,
                    background: C.white,
                    border: `2px solid ${selected ? C.primary : C.border}`,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                    {f.name}{" "}
                    {f.fixed && (
                      <span
                        style={{
                          fontSize: 11,
                          background: C.warnBg,
                          color: C.warn,
                          padding: "2px 6px",
                          borderRadius: 6,
                          fontWeight: 500,
                        }}
                      >
                        推荐 {f.fixed}
                        {f.unit}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.textMuted,
                      margin: "4px 0 8px",
                    }}
                  >
                    {f.cat} | {f.kcal}kcal/{f.unit === "粒" ? "粒" : "100g"} |
                    碳:{f.carb} 蛋:{f.pro} 脂:{f.fat}
                  </div>
                  {f.hint && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textSub,
                        backgroundColor: C.secondaryBg,
                        padding: "4px 8px",
                        borderRadius: 6,
                        display: "inline-block",
                        marginBottom: 8,
                      }}
                    >
                      ⚖️ 参考：{f.hint}
                    </div>
                  )}
                  {f.badges && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.primaryDark,
                        background: C.primaryBg,
                        padding: "4px 8px",
                        borderRadius: 6,
                        display: "inline-block",
                        marginLeft: 8,
                        marginBottom: 8,
                      }}
                    >
                      ✨ 富含: {f.badges.join(", ")}
                    </div>
                  )}
                  {f.micro && (
                    <div
                      style={{
                        background: "#F5F8F8",
                        padding: "8px 12px",
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.primaryDark,
                        }}
                      >
                        🧪 {f.micro.v}
                      </div>
                      <div
                        style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}
                      >
                        {f.micro.desc}
                      </div>
                    </div>
                  )}
                  {selected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: C.primary,
                        color: C.white,
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: "20px",
              background: C.white,
              boxShadow: shadowSm,
            }}
          >
            <button
              onClick={handleGeneratePlan}
              disabled={selectedIds.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: selectedIds.length ? C.primary : C.border,
                color: C.white,
                border: "none",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              第 2 步：智能分配 ({selectedIds.length}项)
            </button>
          </div>
        </div>
      )}

      {allocation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: C.white,
            zIndex: 1001,
            overflowY: "auto",
            padding: "20px 20px 100px",
          }}
        >
          <h3 style={{ margin: "0 0 16px" }}>确认实际摄入量</h3>
          {renderWarnings()}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allocation.recommendations.map((item, idx) => (
              <div
                key={item.food.id}
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 16 }}>
                    {item.food.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.primaryDark,
                      background: C.primaryBg,
                      padding: "4px 8px",
                      borderRadius: 10,
                    }}
                  >
                    AI 推荐: {item.recGrams} {item.food.unit}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{ fontSize: 14, color: C.textMuted, flexShrink: 0 }}
                  >
                    实际食用：
                  </span>
                  <input
                    type="number"
                    value={item.actualGrams}
                    onChange={(e) => updateActualGrams(idx, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      border: `1.5px solid ${C.primary}`,
                      fontSize: 18,
                      color: C.text,
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {item.food.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: "20px",
              background: C.white,
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              onClick={() => setAllocation(null)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 12,
                background: C.border,
                border: "none",
                fontWeight: 600,
              }}
            >
              返回调整
            </button>
            <button
              onClick={confirmIntake}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 12,
                background: C.primary,
                color: C.white,
                border: "none",
                fontWeight: 700,
              }}
            >
              确认无误，保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({
  profile,
  setProfile,
  setView,
  setIntake,
  setWater,
  setExercises,
}) {
  const [editData, setEditData] = useState(profile);

  const handleSave = () => {
    setProfile(editData);
    const bmr = calcBMR(
      editData.gender,
      editData.weight,
      editData.height,
      editData.age
    );
    const exerciseBurn =
      ACT.find((a) => a.key === editData.activityLevel)?.add || 0;
    const targetKcal = Math.round(bmr + exerciseBurn - editData.deficit);
    alert(`✅ 更新成功！\n您的每日目标热量已重新计算为 ${targetKcal} kcal。`);
  };

  return (
    <div style={{ padding: "20px 24px 100px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>
        ⚙️ 系统设置
      </h2>

      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "20px",
          boxShadow: shadowSm,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, marginBottom: 16, color: C.primaryDark }}>
          快捷参数调整
        </h3>
        <label
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.textSub,
            marginBottom: 8,
            display: "block",
          }}
        >
          当前体重 (kg)
        </label>
        <input
          type="number"
          value={editData.weight}
          onChange={(e) =>
            setEditData({ ...editData, weight: Number(e.target.value) })
          }
          style={InputStyle}
        />
        <label
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.textSub,
            marginBottom: 8,
            display: "block",
          }}
        >
          日常活动量
        </label>
        <select
          value={editData.activityLevel}
          onChange={(e) =>
            setEditData({ ...editData, activityLevel: e.target.value })
          }
          style={{ ...InputStyle, appearance: "auto" }}
        >
          {ACT.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label} ({a.desc})
            </option>
          ))}
        </select>
        <label
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.textSub,
            marginBottom: 8,
            display: "block",
          }}
        >
          目标热量缺口 (kcal)
        </label>
        <input
          type="number"
          value={editData.deficit}
          onChange={(e) =>
            setEditData({ ...editData, deficit: Number(e.target.value) })
          }
          style={InputStyle}
        />
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            background: C.primary,
            color: C.white,
            border: "none",
            fontWeight: 700,
            marginTop: 8,
            cursor: "pointer",
          }}
        >
          保存并重新计算
        </button>
      </div>

      <div
        style={{
          background: C.dangerBg,
          borderRadius: 16,
          padding: "20px",
          boxShadow: shadowSm,
        }}
      >
        <h3 style={{ fontSize: 16, marginBottom: 8, color: C.danger }}>
          危险操作
        </h3>
        <p style={{ fontSize: 12, color: C.textSub, marginBottom: 16 }}>
          这将会带您回到应用初始的新手引导页，完全重新计算您的基础档案。
        </p>
        <button
          onClick={() => {
            if (
              window.confirm(
                "确定要重置所有身体档案重新开始吗？\n\n注意：这将会清空您今日的打卡流水数据（饮食、饮水和运动），但您的自定义模板将会保留。"
              )
            ) {
              setIntake({
                breakfast: [],
                lunch: [],
                snack: [],
                dinner: [],
                supplements: [],
              });
              setWater(0);
              setExercises([]);
              setView("onboarding");
            }
          }}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            background: C.white,
            border: `2px solid ${C.danger}`,
            color: C.danger,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          重置身体档案
        </button>
      </div>
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const tabs = [
    { key: "dashboard", label: "看板", icon: "📊" },
    { key: "tracker", label: "饮食", icon: "🍽️" },
    { key: "supplements", label: "补剂", icon: "💊" },
    { key: "settings", label: "设置", icon: "⚙️" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 24px",
        zIndex: 900,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            opacity: active === t.key ? 1 : 0.4,
          }}
        >
          <span style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const savedProfile = loadData("ld_profile", null);
  const [profile, setProfile] = useState(savedProfile || MOCK);

  const [view, setView] = useState(savedProfile ? "main" : "onboarding");
  const [tab, setTab] = useState("dashboard");

  const [intake, setIntake] = useState(() =>
    loadData("ld_intake", {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
      supplements: [],
    })
  );
  const [water, setWater] = useState(() => loadData("ld_water", 0));
  const [exercises, setExercises] = useState(() =>
    loadData("ld_exercises", [])
  );
  const [templates, setTemplates] = useState(() =>
    loadData("ld_templates", [])
  );

  const nutrition = useMemo(() => calcNutrition(profile), [profile]);

  useEffect(() => {
    localStorage.setItem("ld_profile", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem("ld_intake", JSON.stringify(intake));
  }, [intake]);
  useEffect(() => {
    localStorage.setItem("ld_water", JSON.stringify(water));
  }, [water]);
  useEffect(() => {
    localStorage.setItem("ld_exercises", JSON.stringify(exercises));
  }, [exercises]);
  useEffect(() => {
    localStorage.setItem("ld_templates", JSON.stringify(templates));
  }, [templates]);

  if (view === "onboarding")
    return (
      <Onboarding
        initial={profile}
        onComplete={(p) => {
          setProfile(p);
          setView("main");
          setTab("dashboard");
        }}
      />
    );

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {tab === "dashboard" && (
        <Dashboard
          nutrition={nutrition}
          intake={intake}
          profile={profile}
          water={water}
          setWater={setWater}
          exercises={exercises}
          setExercises={setExercises}
        />
      )}
      {tab === "tracker" && (
        <DietTracker
          intake={intake}
          setIntake={setIntake}
          nutrition={nutrition}
          templates={templates}
          setTemplates={setTemplates}
        />
      )}
      {tab === "supplements" && (
        <SupplementsTracker intake={intake} setIntake={setIntake} />
      )}
      {tab === "settings" && (
        <SettingsPanel
          profile={profile}
          setProfile={setProfile}
          setView={setView}
          setIntake={setIntake}
          setWater={setWater}
          setExercises={setExercises}
        />
      )}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
