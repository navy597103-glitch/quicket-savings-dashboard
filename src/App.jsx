import React, { useMemo, useState } from 'react'
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Cloud,
  DollarSign,
  Grid,
  Info,
  Leaf,
  Lightbulb,
  LineChart,
  Settings2,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const nf = new Intl.NumberFormat('zh-TW')
const formatNumber = (value, digits = 0) => new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0)
const formatNTD = (value) => `NT$${nf.format(Math.round(Number.isFinite(value) ? value : 0))}`
const compactNtd = (value) => {
  const safe = Number.isFinite(value) ? value : 0
  if (Math.abs(safe) >= 1_000_000) return `NT$${(safe / 1_000_000).toFixed(2)}M`
  return formatNTD(safe)
}
const formatM = (value) => (Math.abs(value) >= 1_000_000 ? `${formatNumber(value / 1_000_000, 1)}M` : formatNumber(value))

const formatKpiCount = (value, locale = 'zh') => {
  const safe = Math.max(0, Math.round(Number.isFinite(value) ? value : 0))
  if (locale === 'zh') {
    if (safe >= 10_000) {
      const digits = safe >= 100_000 ? 0 : 1
      return `${(safe / 10_000).toFixed(digits).replace(/\.0$/, '')}萬`
    }
    return nf.format(safe)
  }
  if (safe >= 1_000) {
    const digits = safe >= 10_000 ? 0 : 1
    return `${(safe / 1_000).toFixed(digits).replace(/\.0$/, '')}k`
  }
  return new Intl.NumberFormat('en-US').format(safe)
}

// 可後續依最新市場或正式報價替換的參考值
const EU_EUA_NTD_PER_TON = 2600
const TAIWAN_CARBON_FEE_NTD_PER_TON = 300
const EST_RECYCLED_MATERIAL_VALUE_PER_SET = 900
const EST_LABOR_DAY_COST = 3000
const TREE_ABSORPTION_KG_PER_YEAR = 22


const scenarioPresetKeys = ['industrialBay', 'warehouseLong', 'officeDay', 'publicCylinder', 'outdoorStreet']

const translations = {
  zh: {
    reportTitle: 'QUICKET 導入效益報告',
    reportSubtitle: '快速比較現有照明方案與 QUICKET 導入後的節能、維護與長期成本效益。',
    quickEstimate: '快速估算條件',
    advanced: '進階參數',
    advancedSub: '查看與調整更多假設條件',
    resetContext: (n) => `目前有 ${n} 項自訂參數，點此恢復此場域預設值`,
    customScene: '自訂場景',
    sceneName: '場景名稱',
    scenePlaceholder: '例如：A 廠 3F 倉儲區',
    siteType: '場域類型', luminaireType: '燈具類型', quantity: '燈具數量', years: '計算年限',
    currentWatt: '現有瓦數', quicketWatt: 'QUICKET 瓦數', dailyHours: '每日使用', annualDays: '每年使用',
    electricityPrice: '電價', carbonFactor: '碳排係數', maintenanceBasis: '維護成本基準',
    maintenanceBasisNote: '以「整燈更換」與「模組更換」作為比較基準，可依實際安裝高度、施工難度、工資、設備租用與停機需求調整。',
    currentPlan: '現有方案', quicket: 'QUICKET', maintenanceCycle: '維護週期', carbonPrice: '碳價估算',
    overallAnalysis: '整體效益分析',
    electricityCompare: '累積電費比較', maintenanceCompare: '累積維護成本比較', carbonCompare: '累積節能減碳比較',
    elecSub: '現有方案 vs QUICKET', maintSub: '整燈更換 vs QUICKET 模組更換', carbonSub: '用電量與碳排累積差異',
    yearGap: (y) => `${y} 年差額`, annualCarbon: '年度減碳',
    insight: '專案洞察',
    caseCond: '本案例條件：', annualBenefit: '年度效益：', longBenefit: '長期效益：',
    totalBenefitLine: (y,v) => `${y} 年估算總效益：${v}`,
    costSaving: '成本節約', carbonValue: '碳排價值', recycling: '永續回收',
    note: '註：所有數值為估算結果，實際效益可能因場域條件、電價與維護策略而異。維護成本以整燈更換與模組更換為比較基準，實際費用仍可能受安裝高度、施工難度、工資、設備租用與停機需求影響。碳排價值中的 EU / 台灣價格為暫用參考值，可依正式價格更新。',
    totalKpi: ()=> '總效益', annualElecSave: '電費節約', maintKpi: ()=> '維護節約', annualEnergy: '節電量', annualCarbonKpi: '減碳量',
    totalCaption: (n)=> `約可抵 ${n} 盞整燈更換`, elecCaption: (n)=> `相當於 ${n} 次維護`, maintCaption: (n)=> `約可抵 ${n} 盞整燈更換`, energyCaption:(n)=> `約等於 ${n} 戶家庭年用電`, carbonCaption:(n)=> `約等於 ${n} 棵樹年吸碳`,
    insightLine1: (label,q,y)=> `${label}，共 ${q} 盞，評估期間 ${y} 年。`,
    insightLine2: (kwh,ntd)=> `每年可節電 ${kwh} kWh，並節省電費約 ${ntd}。`,
    insightLine3: (y,ms,ts)=> `${y} 年維護節約約 ${ms}，總效益約 ${ts}。`,
    costComment:(repl,days)=> `可抵約 ${repl} 盞整燈更換，亦相當於約 ${days} 個人日施工預算。`,
    carbonCommentHeader:'以現行參考價格估算：',
    carbonCommentEU:(v)=> `歐洲 EUA：約 ${v}`,
    carbonCommentTW:(v)=> `台灣碳費：約 ${v}`,
    recycleComment:(v)=> `歷次模組與電源更換物料暫估回收價值約 ${v}。`,
    customTag: '已自訂',
    wholeReplacementNote: '整燈拆換、重新安裝與相關施工成本。',
    moduleReplacementNote: '模組更換、較少拆裝與較低施工干擾。',
    chartNames: { currentElectricity:'現有方案電費', quicketElectricity:'QUICKET 電費', currentMaintenance:'整燈更換維護成本', quicketMaintenance:'QUICKET 模組維護成本', currentCarbon:'現有方案碳排', quicketCarbon:'QUICKET 碳排' },
    kpiExplain: {
      totalTitle: (y)=> `${y} 年總效益如何計算`,
      totalDesc: (y)=> `${y} 年總效益整合電費節約、維護成本節約與碳效益估算，用來快速評估 QUICKET 導入後在整個使用週期內可能帶來的總體財務改善。`,
      totalFormula: (y)=> `${y} 年總效益 = ${y} 年累積電費節約 + ${y} 年維護成本節約 + ${y} 年碳效益估算`,
      totalLines: (f,r)=> [`${f.years} 年累積電費節約 = ${formatNTD(r.annualElectricitySaved)} × ${f.years} = ${formatNTD(r.totalElectricitySaved)}`, `${f.years} 年維護成本節約 = 現有方案維護 ${formatNTD(r.currentMaintenanceTotal)} - QUICKET 維護 ${formatNTD(r.quicketMaintenanceTotal)} = ${formatNTD(r.maintenanceSaved)}`, `${f.years} 年碳效益估算 = ${formatNumber(r.annualCarbonSaved / 1000, 1)} tCO₂e × ${f.years} × ${formatNTD(f.carbonPrice)} ≈ ${formatNTD(r.carbonValue)}`, `合計 ≈ ${compactNtd(r.totalSaved)}`],
      electricityTitle: '年度電費節約如何計算',
      electricityDesc: '年度電費節約是比較現有照明方案與 QUICKET 在相同使用條件下，因瓦數降低而產生的年度電費差額。',
      electricityFormula: '年度電費節約 = 燈具數量 × (現有瓦數 - QUICKET 瓦數) ÷ 1000 × 每日使用小時 × 每年使用天數 × 電價',
      electricityLines: (f,r)=> [`年度節電量 = ${formatNumber(f.quantity)} × (${f.currentWatt}W - ${f.quicketWatt}W) ÷ 1000 × ${f.dailyHours} × ${f.annualDays} = ${formatNumber(r.annualKwhSaved)} kWh`, `年度電費節約 = ${formatNumber(r.annualKwhSaved)} × ${formatNTD(f.electricityPrice)} = ${formatNTD(r.annualElectricitySaved)}`],
      maintenanceTitle: (y)=> `${y} 年維護節約如何計算`,
      maintenanceDesc: '本指標比較現有照明方案與 QUICKET 在維護方式上的成本差異。現有方案以整燈更換為基準，QUICKET 以模組更換為基準；材料、工時、施工難度與營運干擾都可反映在單次維護成本中。',
      maintenanceFormula: '維護節約 = 現有方案維護總成本 - QUICKET 維護總成本；維護總成本 = 燈具數量 × 單次維護成本 × 維護次數',
      maintenanceLines: (f,r)=> [`維護次數 = floor(計算年限 ÷ 維護週期)：現有方案 ${r.currentMaintenanceCount} 次；QUICKET ${r.quicketMaintenanceCount} 次`, `現有方案：以整燈拆換、重新安裝與相關施工成本估算 = ${formatNumber(f.quantity)} × ${formatNTD(f.currentMaintenanceCost)} × ${r.currentMaintenanceCount} = ${formatNTD(r.currentMaintenanceTotal)}`, `QUICKET：以模組更換、較少拆裝與較低施工干擾估算 = ${formatNumber(f.quantity)} × ${formatNTD(f.quicketMaintenanceCost)} × ${r.quicketMaintenanceCount} = ${formatNTD(r.quicketMaintenanceTotal)}`, `維護節約 = ${formatNTD(r.maintenanceSaved)}`],
      energyTitle: '年度節電量如何計算',
      energyDesc: '年度節電量是比較現有照明與 QUICKET 在相同使用時間下，每年可減少的用電量，也是電費節約與減碳量計算的基礎。',
      energyFormula: '年度節電量 = 燈具數量 × 單盞瓦數差 ÷ 1000 × 每日使用小時 × 每年使用天數',
      energyLines: (f,r)=> [`單盞瓦數差 = ${f.currentWatt}W - ${f.quicketWatt}W = ${f.currentWatt - f.quicketWatt}W`, `年度節電量 = ${formatNumber(f.quantity)} × ${f.currentWatt - f.quicketWatt} ÷ 1000 × ${f.dailyHours} × ${f.annualDays} = ${formatNumber(r.annualKwhSaved)} kWh`],
      carbonTitle: '年度減碳量如何計算',
      carbonDesc: '年度減碳量是將年度節電量換算為對應的碳排放減少量，用來評估 QUICKET 在 ESG、永續報告或碳管理上的潛在貢獻。',
      carbonFormula: '年度減碳量 = 年度節電量 × 碳排係數 ÷ 1000',
      carbonLines: (f,r)=> [`年度減碳量 = ${formatNumber(r.annualKwhSaved)} × ${f.carbonFactor} ÷ 1000 = ${formatNumber(r.annualCarbonSaved / 1000, 1)} tCO₂e`, '若用於正式 ESG 報告、碳盤查或碳權申請，應依制度採認的係數與方法學重新確認。'],
      explainerNote: '本指標依左側估算條件與進階參數自動計算；使用者可調整參數以反映實際場域條件。',
      sectionDesc: '指標說明', sectionFormula:'計算公式', sectionCase:'本案例代入', close:'關閉 KPI 說明'
    },
    units: { pcs:'盞', years:'年', w:'W', hr:'小時', day:'天', ntdPerKwh:'NTD/kWh', kgPerKwh:'kg/kWh', ntdPerTime:'NTD/次', ntdPerTon:'NTD/ton' },
    siteLabels: { factory:'工廠', warehouse:'倉儲', office:'商辦', public:'公共空間', outdoor:'戶外場域' },
    luminaireLabels: { downlight:'崁燈', cylinder:'筒燈', 'bay-light':'天井燈', 'flood-light':'投射燈', 'street-light':'路燈', custom:'客製型（瓦數自訂）' },
    presetLabels: { industrialBay:'工業天井燈', warehouseLong:'長時倉儲', officeDay:'商辦崁燈', publicCylinder:'公共筒燈', outdoorStreet:'戶外路燈' },
  },
  en: {
    reportTitle: 'QUICKET Deployment Benefit Report',
    reportSubtitle: 'Quickly compare energy, maintenance, and lifecycle cost benefits between the existing lighting plan and QUICKET.',
    quickEstimate: 'Quick Estimate',
    advanced: 'Advanced Parameters',
    advancedSub: 'View and adjust more assumptions',
    resetContext: (n) => `${n} customized inputs. Click to restore this context preset.`,
    customScene: 'Custom Scenario',
    sceneName: 'Scenario Name',
    scenePlaceholder: 'e.g. Plant A 3F Warehouse Zone',
    siteType: 'Site Type', luminaireType: 'Luminaire Type', quantity: 'Quantity', years: 'Analysis Period',
    currentWatt: 'Current Wattage', quicketWatt: 'QUICKET Wattage', dailyHours: 'Daily Use', annualDays: 'Annual Days',
    electricityPrice: 'Electricity Price', carbonFactor: 'Carbon Factor', maintenanceBasis: 'Maintenance Cost Basis',
    maintenanceBasisNote: 'Uses whole-luminaire replacement versus module replacement as the comparison basis; values can be adjusted by installation height, labor difficulty, equipment rental, and downtime needs.',
    currentPlan: 'Current Plan', quicket: 'QUICKET', maintenanceCycle: 'Maintenance Cycle', carbonPrice: 'Carbon Price',
    overallAnalysis: 'Overall Benefit Analysis',
    electricityCompare: 'Cumulative Electricity Cost', maintenanceCompare: 'Cumulative Maintenance Cost', carbonCompare: 'Cumulative Carbon Reduction',
    elecSub: 'Current plan vs QUICKET', maintSub: 'Whole luminaire replacement vs QUICKET module replacement', carbonSub: 'Accumulated electricity and carbon gap',
    yearGap: (y) => `${y}-Year Gap`, annualCarbon: 'Annual Carbon Cut',
    insight: 'Project Insight',
    caseCond: 'Project Scope:', annualBenefit: 'Annual Benefit:', longBenefit: 'Long-Term Benefit:',
    totalBenefitLine: (y,v) => `${y}-Year Estimated Total Benefit: ${v}`,
    costSaving: 'Cost Saving', carbonValue: 'Carbon Value', recycling: 'Circular Recovery',
    note: 'Note: All figures are estimates. Actual benefits may vary with site conditions, electricity prices, and maintenance strategies. Maintenance cost uses whole-luminaire replacement versus module replacement as the comparison basis. EU and Taiwan carbon values are provisional references and can be updated later.',
    totalKpi: ()=> 'Total Benefit', annualElecSave: 'Bill Saving', maintKpi: ()=> 'Maintenance Saving', annualEnergy: 'Energy Saving', annualCarbonKpi: 'Carbon Cut',
    totalCaption: (n)=> `≈ ${n} fixture replacements`, elecCaption: (n)=> `Covers ≈ ${n} service events`, maintCaption: (n)=> `≈ ${n} fixture replacements`, energyCaption:(n)=> `≈ ${n} households’ annual use`, carbonCaption:(n)=> `≈ ${n} trees’ annual absorption`,
    insightLine1: (label,q,y)=> `${label}, ${q} fixtures in scope, evaluated over ${y} years.`,
    insightLine2: (kwh,ntd)=> `Estimated annual saving of ${kwh} kWh and ${ntd} in electricity cost.`,
    insightLine3: (y,ms,ts)=> `Estimated ${y}-year maintenance saving of ${ms}, with total benefit around ${ts}.`,
    costComment:(repl,days)=> `Equivalent to about ${repl} full luminaire replacements, or roughly ${days} labor-days of field work.`,
    carbonCommentHeader:'Estimated using current reference prices:',
    carbonCommentEU:(v)=> `EU EUA: ${v}`,
    carbonCommentTW:(v)=> `Taiwan carbon fee: ${v}`,
    recycleComment:(v)=> `Estimated recovery value from replaced modules and drivers: ${v}.`,
    customTag: 'Customized',
    wholeReplacementNote: 'Whole luminaire removal, re-installation, and related field work.',
    moduleReplacementNote: 'Module replacement with less disassembly and lower field disruption.',
    chartNames: { currentElectricity:'Current electricity cost', quicketElectricity:'QUICKET electricity cost', currentMaintenance:'Whole replacement maintenance cost', quicketMaintenance:'QUICKET module maintenance cost', currentCarbon:'Current carbon emissions', quicketCarbon:'QUICKET carbon emissions' },
    kpiExplain: {
      totalTitle: (y)=> `${y}-Year Total Benefit Calculation`,
      totalDesc: (y)=> `The ${y}-year total benefit combines electricity savings, maintenance savings, and estimated carbon value to evaluate the lifecycle financial improvement after QUICKET deployment.`,
      totalFormula: (y)=> `${y}-Year Total Benefit = cumulative electricity saving + maintenance saving + estimated carbon value`,
      totalLines: (f,r)=> [`Cumulative electricity saving = ${formatNTD(r.annualElectricitySaved)} × ${f.years} = ${formatNTD(r.totalElectricitySaved)}`, `Maintenance saving = current plan ${formatNTD(r.currentMaintenanceTotal)} - QUICKET ${formatNTD(r.quicketMaintenanceTotal)} = ${formatNTD(r.maintenanceSaved)}`, `Estimated carbon value = ${formatNumber(r.annualCarbonSaved / 1000, 1)} tCO₂e × ${f.years} × ${formatNTD(f.carbonPrice)} ≈ ${formatNTD(r.carbonValue)}`, `Total ≈ ${compactNtd(r.totalSaved)}`],
      electricityTitle: 'Annual Electricity Saving Calculation',
      electricityDesc: 'This compares the annual electricity cost difference between the current lighting plan and QUICKET under the same operating conditions.',
      electricityFormula: 'Annual saving = quantity × (current wattage - QUICKET wattage) ÷ 1000 × daily hours × annual days × electricity price',
      electricityLines: (f,r)=> [`Annual energy saving = ${formatNumber(f.quantity)} × (${f.currentWatt}W - ${f.quicketWatt}W) ÷ 1000 × ${f.dailyHours} × ${f.annualDays} = ${formatNumber(r.annualKwhSaved)} kWh`, `Annual electricity saving = ${formatNumber(r.annualKwhSaved)} × ${formatNTD(f.electricityPrice)} = ${formatNTD(r.annualElectricitySaved)}`],
      maintenanceTitle: (y)=> `${y}-Year Maintenance Saving Calculation`,
      maintenanceDesc: 'This compares maintenance cost between whole-luminaire replacement and QUICKET module replacement. Material cost, labor, work difficulty, and operational interruption can all be reflected in the per-event maintenance cost.',
      maintenanceFormula: 'Maintenance saving = current maintenance total - QUICKET maintenance total; maintenance total = quantity × per-event maintenance cost × number of events',
      maintenanceLines: (f,r)=> [`Maintenance events = floor(analysis period ÷ maintenance cycle): current plan ${r.currentMaintenanceCount}; QUICKET ${r.quicketMaintenanceCount}`, `Current plan: whole-luminaire replacement = ${formatNumber(f.quantity)} × ${formatNTD(f.currentMaintenanceCost)} × ${r.currentMaintenanceCount} = ${formatNTD(r.currentMaintenanceTotal)}`, `QUICKET: module replacement = ${formatNumber(f.quantity)} × ${formatNTD(f.quicketMaintenanceCost)} × ${r.quicketMaintenanceCount} = ${formatNTD(r.quicketMaintenanceTotal)}`, `Maintenance saving = ${formatNTD(r.maintenanceSaved)}`],
      energyTitle: 'Annual Energy Saving Calculation',
      energyDesc: 'Annual energy saving compares the energy reduction between the current lighting plan and QUICKET under the same operating schedule.',
      energyFormula: 'Annual energy saving = quantity × wattage difference ÷ 1000 × daily hours × annual days',
      energyLines: (f,r)=> [`Wattage difference = ${f.currentWatt}W - ${f.quicketWatt}W = ${f.currentWatt - f.quicketWatt}W`, `Annual energy saving = ${formatNumber(f.quantity)} × ${f.currentWatt - f.quicketWatt} ÷ 1000 × ${f.dailyHours} × ${f.annualDays} = ${formatNumber(r.annualKwhSaved)} kWh`],
      carbonTitle: 'Annual Carbon Reduction Calculation',
      carbonDesc: 'Annual carbon reduction converts saved electricity into avoided emissions, supporting ESG, sustainability reporting, or carbon management evaluation.',
      carbonFormula: 'Annual carbon reduction = annual energy saving × carbon factor ÷ 1000',
      carbonLines: (f,r)=> [`Annual carbon reduction = ${formatNumber(r.annualKwhSaved)} × ${f.carbonFactor} ÷ 1000 = ${formatNumber(r.annualCarbonSaved / 1000, 1)} tCO₂e`, 'For formal ESG reporting, carbon inventory, or carbon credit application, the accepted factor and methodology should be confirmed separately.'],
      explainerNote: 'This metric is calculated from the estimate inputs and advanced parameters; users may adjust assumptions to reflect actual site conditions.',
      sectionDesc: 'Description', sectionFormula:'Formula', sectionCase:'Applied Case', close:'Close KPI details'
    },
    units: { pcs:'pcs', years:'yrs', w:'W', hr:'hrs', day:'days', ntdPerKwh:'NTD/kWh', kgPerKwh:'kg/kWh', ntdPerTime:'NTD/ea', ntdPerTon:'NTD/ton' },
    siteLabels: { factory:'Factory', warehouse:'Warehouse', office:'Office', public:'Public Space', outdoor:'Outdoor' },
    luminaireLabels: { downlight:'Downlight', cylinder:'Cylinder Light', 'bay-light':'High Bay', 'flood-light':'Flood Light', 'street-light':'Street Light', custom:'Custom (Editable Wattage)' },
    presetLabels: { industrialBay:'Industrial High Bay', warehouseLong:'Long-Hour Warehouse', officeDay:'Office Downlight', publicCylinder:'Public Cylinder', outdoorStreet:'Outdoor Street Light' },
  }
}

const siteOptions = {
  factory: 'factory',
  warehouse: 'warehouse',
  office: 'office',
  public: 'public',
  outdoor: 'outdoor',
}

const luminaireOptions = {
  downlight: 'downlight',
  cylinder: 'cylinder',
  'bay-light': 'bay-light',
  'flood-light': 'flood-light',
  'street-light': 'street-light',
  custom: 'custom',
}

const quicketWattOptions = {
  downlight: [10, 15, 20, 30],
  cylinder: [30, 50, 75],
  'bay-light': [50, 100, 150, 200],
  'flood-light': [50, 100, 150, 200],
  'street-light': [30, 50, 75, 100],
}

const siteDefaults = {
  factory: { quantity: 620, dailyHours: 12, annualDays: 250, electricityPrice: 4.27, carbonFactor: 0.494, years: 15, carbonPrice: 2500, maintenanceFactor: 1 },
  warehouse: { quantity: 400, dailyHours: 18, annualDays: 330, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 1.08 },
  office: { quantity: 200, dailyHours: 10, annualDays: 240, electricityPrice: 4.27, carbonFactor: 0.494, years: 10, carbonPrice: 2500, maintenanceFactor: 0.55 },
  public: { quantity: 300, dailyHours: 14, annualDays: 300, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 0.85 },
  outdoor: { quantity: 180, dailyHours: 11, annualDays: 365, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 1.15 },
}

const luminaireDefaults = {
  downlight: { currentWatt: 40, quicketWatt: 20, currentMaintenanceCost: 3000, quicketMaintenanceCost: 1000, currentMaintenanceCycle: 5, quicketMaintenanceCycle: 4 },
  cylinder: { currentWatt: 70, quicketWatt: 50, currentMaintenanceCost: 4200, quicketMaintenanceCost: 1300, currentMaintenanceCycle: 4, quicketMaintenanceCycle: 4 },
  'bay-light': { currentWatt: 200, quicketWatt: 150, currentMaintenanceCost: 6500, quicketMaintenanceCost: 2000, currentMaintenanceCycle: 3, quicketMaintenanceCycle: 3 },
  'flood-light': { currentWatt: 150, quicketWatt: 100, currentMaintenanceCost: 6200, quicketMaintenanceCost: 1900, currentMaintenanceCycle: 3, quicketMaintenanceCycle: 3 },
  'street-light': { currentWatt: 100, quicketWatt: 75, currentMaintenanceCost: 5800, quicketMaintenanceCost: 1800, currentMaintenanceCycle: 4, quicketMaintenanceCycle: 4 },
  custom: { currentWatt: 100, quicketWatt: 75, currentMaintenanceCost: 5000, quicketMaintenanceCost: 1600, currentMaintenanceCycle: 4, quicketMaintenanceCycle: 4 },
}

function buildDefaultParams(siteType = 'factory', luminaireType = 'bay-light') {
  const site = siteDefaults[siteType] || siteDefaults.factory
  const luminaire = luminaireDefaults[luminaireType] || luminaireDefaults['bay-light']
  const standardWatts = quicketWattOptions[luminaireType]
  const defaultQuicketWatt = standardWatts?.includes(luminaire.quicketWatt) ? luminaire.quicketWatt : (standardWatts?.[0] ?? luminaire.quicketWatt)
  const maintenanceFactor = site.maintenanceFactor || 1

  return {
    siteType,
    luminaireType,
    quantity: site.quantity,
    currentWatt: luminaire.currentWatt,
    quicketWatt: defaultQuicketWatt,
    dailyHours: site.dailyHours,
    annualDays: site.annualDays,
    electricityPrice: site.electricityPrice,
    carbonFactor: site.carbonFactor,
    currentMaintenanceCost: Math.round((luminaire.currentMaintenanceCost * maintenanceFactor) / 100) * 100,
    quicketMaintenanceCost: Math.round((luminaire.quicketMaintenanceCost * maintenanceFactor) / 100) * 100,
    currentMaintenanceCycle: luminaire.currentMaintenanceCycle,
    quicketMaintenanceCycle: luminaire.quicketMaintenanceCycle,
    years: site.years,
    carbonPrice: site.carbonPrice,
  }
}

const scenarioPresets = {
  industrialBay: buildDefaultParams('factory', 'bay-light'),
  warehouseLong: buildDefaultParams('warehouse', 'bay-light'),
  officeDay: buildDefaultParams('office', 'downlight'),
  publicCylinder: buildDefaultParams('public', 'cylinder'),
  outdoorStreet: buildDefaultParams('outdoor', 'street-light'),
}

function getChangedFields(form) {
  const base = buildDefaultParams(form.siteType, form.luminaireType)
  return Object.keys(base).filter((key) => form[key] !== base[key])
}

function Field({ label, suffix, customized, customLabel = translations.zh.customTag, children }) {
  return (
    <label className="block space-y-1.5">
      <div className="flex min-h-[1.35rem] flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="break-keep leading-4">{label}</span>
        {suffix && <span className="whitespace-nowrap leading-4 text-slate-500">{suffix}</span>}
        {customized && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{customLabel}</span>}
      </div>
      {children}
    </label>
  )
}

function NumberField({ label, suffix, value, onChange, min = 0, step = 1, customized = false, customLabel }) {
  return (
    <Field label={label} suffix={suffix} customized={customized} customLabel={customLabel}>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value
          onChange(nextValue === '' ? '' : Number(nextValue))
        }}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${customized ? 'border-amber-200' : 'border-slate-300'}`}
      />
    </Field>
  )
}

function SelectField({ label, value, onChange, options, customized = false, labels = {}, customLabel }) {
  return (
    <Field label={label} customized={customized} customLabel={customLabel}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${customized ? 'border-amber-200' : 'border-slate-300'}`}
      >
        {Object.entries(options).map(([key, labelText]) => (
          <option key={key} value={key}>{labels[key] || labelText}</option>
        ))}
      </select>
    </Field>
  )
}

function QuicketWattField({ luminaireType, value, onChange, customized = false, label, unit, customLabel }) {
  if (luminaireType === 'custom') {
    return <NumberField label={label} suffix={unit} value={value} customized={customized} customLabel={customLabel} onChange={onChange} />
  }
  const options = quicketWattOptions[luminaireType] || []
  return (
    <Field label={label} suffix={unit} customized={customized} customLabel={customLabel}>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${customized ? 'border-amber-200' : 'border-slate-300'}`}
      >
        {options.map((watt) => <option key={watt} value={watt}>{watt} W</option>)}
      </select>
    </Field>
  )
}

function KpiCard({ kpi, active, onClick }) {
  const Icon = kpi.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-[190px] w-full flex-col rounded-3xl border bg-white p-4 text-left shadow-md transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md lg:h-[178px] lg:p-3 xl:h-[190px] xl:p-4 2xl:h-[205px] ${active ? 'border-blue-600 shadow-lg shadow-blue-100/70' : 'border-slate-300'}`}
    >
      {active && <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-blue-600" />}
      <div className={`mx-auto mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition lg:h-9 lg:w-9 xl:h-11 xl:w-11 ${active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-blue-700 group-hover:bg-blue-50'}`}>
        <Icon size={22} strokeWidth={2.2} className="xl:h-6 xl:w-6" />
      </div>
      <div className={`flex h-[34px] shrink-0 items-center justify-center text-center text-[13px] font-semibold leading-4 xl:h-[40px] xl:text-sm xl:leading-5 ${active ? 'text-blue-950' : 'text-slate-900'}`}>{kpi.title}</div>
      <div className="flex h-[36px] shrink-0 items-center justify-center whitespace-nowrap text-center text-lg font-bold tracking-tight text-blue-900 xl:h-[38px] xl:text-xl">{kpi.value}</div>
      <div className="flex flex-1 items-center justify-center break-keep text-center text-[11px] leading-4 text-slate-500 xl:text-xs xl:leading-5">{kpi.caption}</div>
    </button>
  )
}

function getKpiExplanation(activeKpi, result, form, t) {
  if (!activeKpi) return null
  const e = t.kpiExplain
  return {
    total: { title: e.totalTitle(form.years), description: e.totalDesc(form.years), formula: e.totalFormula(form.years), lines: e.totalLines(form, result) },
    electricityCost: { title: e.electricityTitle, description: e.electricityDesc, formula: e.electricityFormula, lines: e.electricityLines(form, result) },
    maintenance: { title: e.maintenanceTitle(form.years), description: e.maintenanceDesc, formula: e.maintenanceFormula, lines: e.maintenanceLines(form, result) },
    energy: { title: e.energyTitle, description: e.energyDesc, formula: e.energyFormula, lines: e.energyLines(form, result) },
    carbon: { title: e.carbonTitle, description: e.carbonDesc, formula: e.carbonFormula, lines: e.carbonLines(form, result) },
  }[activeKpi]
}

function KpiOverlay({ activeKpi, result, form, onClose, t }) {
  const data = getKpiExplanation(activeKpi, result, form, t)
  if (!data) return null
  return (
    <div className="rounded-3xl bg-white p-5 shadow-2xl shadow-slate-300/60 ring-1 ring-blue-100 min-[1200px]:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"><Info size={18} /></div>
          <div>
            <h2 className="text-lg font-bold text-blue-950">{data.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{t.kpiExplain.explainerNote}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" aria-label={t.kpiExplain.close}><X size={18} /></button>
      </div>
      <div className="grid gap-4 min-[900px]:grid-cols-[1fr_1fr_1.7fr]">
        <div className="rounded-2xl border border-slate-300 bg-white p-4"><h3 className="mb-2 text-sm font-bold text-blue-950">{t.kpiExplain.sectionDesc}</h3><p className="text-sm leading-7 text-slate-600">{data.description}</p></div>
        <div className="rounded-2xl border border-slate-300 bg-white p-4"><h3 className="mb-2 text-sm font-bold text-blue-950">{t.kpiExplain.sectionFormula}</h3><p className="text-sm leading-7 text-slate-700">{data.formula}</p></div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
          <h3 className="mb-2 text-sm font-bold text-blue-950">{t.kpiExplain.sectionCase}</h3>
          <div className="space-y-2 text-sm leading-6 text-slate-700">
            {data.lines.map((line, index) => <div key={line} className={index === data.lines.length - 1 ? 'font-bold text-blue-700' : ''}>{line}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBlock({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl bg-white/75 p-4 shadow-sm ring-1 ring-blue-100">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700"><Icon size={22} /></div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
      </div>
      <div className="text-sm leading-7 text-slate-600">{children}</div>
    </div>
  )
}

function ChartBadge({ label, value }) {
  return (
    <div className="shrink-0 rounded-2xl border border-blue-200 bg-white px-2.5 py-2 text-right shadow-sm">
      <div className="text-[11px] font-semibold text-slate-600">{label}</div>
      <div className="text-sm font-bold text-blue-700">{value}</div>
    </div>
  )
}

function ElectricityChart({ result, t }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-300 bg-white p-4 shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950">{t.electricityCompare}</h3>
          <p className="text-xs text-slate-600">{t.elecSub}</p>
        </div>
        <ChartBadge label={t.yearGap(result.years)} value={compactNtd(result.totalElectricitySaved)} />
      </div>
      <div className="h-44 w-full min-w-0 overflow-hidden sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.yearlyRows} margin={{ top: 4, right: 8, bottom: 0, left: -4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ee" />
            <XAxis dataKey="year" stroke="#475569" />
            <YAxis stroke="#475569" tickFormatter={formatM} />
            <Tooltip formatter={(value, name) => [formatNTD(value), name]} contentStyle={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="currentElectricity" name={t.chartNames.currentElectricity} fill="#8a9bb0" radius={[7, 7, 0, 0]} />
            <Bar dataKey="quicketElectricity" name={t.chartNames.quicketElectricity} fill="#2563eb" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MaintenanceChart({ result, t }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-300 bg-white p-4 shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950">{t.maintenanceCompare}</h3>
          <p className="text-xs text-slate-600">{t.maintSub}</p>
        </div>
        <ChartBadge label={t.yearGap(result.years)} value={compactNtd(result.maintenanceSaved)} />
      </div>
      <div className="h-44 w-full min-w-0 overflow-hidden sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.yearlyRows} margin={{ top: 4, right: 8, bottom: 0, left: -4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ee" />
            <XAxis dataKey="year" stroke="#475569" />
            <YAxis stroke="#475569" tickFormatter={formatM} />
            <Tooltip formatter={(value, name) => [formatNTD(value), name]} contentStyle={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="currentMaintenance" name={t.chartNames.currentMaintenance} fill="#8a9bb0" radius={[7, 7, 0, 0]} />
            <Bar dataKey="quicketMaintenance" name={t.chartNames.quicketMaintenance} fill="#2563eb" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CarbonMiniChart({ result, t }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-300 bg-white p-4 shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950">{t.carbonCompare}</h3>
          <p className="text-xs text-slate-600">{t.carbonSub}</p>
        </div>
        <ChartBadge label={t.annualCarbon} value={`${formatNumber(result.annualCarbonSaved / 1000, 1)} tCO₂e`} />
      </div>
      <div className="h-44 w-full min-w-0 overflow-hidden sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.yearlyRows} margin={{ top: 4, right: 8, bottom: 0, left: -4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ee" />
            <XAxis dataKey="year" stroke="#475569" />
            <YAxis stroke="#475569" tickFormatter={(value) => `${formatNumber(value / 1000, 0)}t`} />
            <Tooltip formatter={(value, name) => [`${formatNumber(value / 1000, 1)} tCO₂e`, name]} contentStyle={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="currentCarbon" name={t.chartNames.currentCarbon} fill="#8a9bb0" radius={[7, 7, 0, 0]} />
            <Bar dataKey="quicketCarbon" name={t.chartNames.quicketCarbon} fill="#2563eb" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState(scenarioPresets.industrialBay)
  const [activeKpi, setActiveKpi] = useState(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [customSceneOpen, setCustomSceneOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [locale, setLocale] = useState('zh')
  const [mobileChart, setMobileChart] = useState('electricity')

  const defaultForCurrentContext = useMemo(() => buildDefaultParams(form.siteType, form.luminaireType), [form.siteType, form.luminaireType])
  const changedFields = useMemo(() => getChangedFields(form), [form])
  const customizedSet = useMemo(() => new Set(changedFields), [changedFields])
  const hasCustomFields = changedFields.length > 0
  const t = translations[locale]

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const applyScenario = (name) => { setForm(scenarioPresets[name]); setActiveKpi(null); setCustomSceneOpen(false); setProjectName('') }
  const applyContextTemplate = (key, value) => {
    const nextSiteType = key === 'siteType' ? value : form.siteType
    const nextLuminaireType = key === 'luminaireType' ? value : form.luminaireType
    setForm(buildDefaultParams(nextSiteType, nextLuminaireType))
    setActiveKpi(null)
  }
  const resetToContextDefault = () => { setForm(defaultForCurrentContext); setActiveKpi(null) }

  const result = useMemo(() => {
    const quantity = Math.max(Number(form.quantity) || 0, 0)
    const years = Math.max(Number(form.years) || 1, 1)
    const dailyHours = Math.max(Number(form.dailyHours) || 0, 0)
    const annualDays = Math.max(Number(form.annualDays) || 0, 0)
    const currentWatt = Number(form.currentWatt) || 0
    const quicketWatt = Number(form.quicketWatt) || 0
    const electricityPrice = Number(form.electricityPrice) || 0
    const carbonFactor = Number(form.carbonFactor) || 0
    const currentMaintenanceCost = Number(form.currentMaintenanceCost) || 0
    const quicketMaintenanceCost = Number(form.quicketMaintenanceCost) || 0
    const currentMaintenanceCycle = Math.max(Number(form.currentMaintenanceCycle) || 1, 1)
    const quicketMaintenanceCycle = Math.max(Number(form.quicketMaintenanceCycle) || 1, 1)
    const carbonPrice = Number(form.carbonPrice) || 0

    const currentAnnualKwh = quantity * (currentWatt / 1000) * dailyHours * annualDays
    const quicketAnnualKwh = quantity * (quicketWatt / 1000) * dailyHours * annualDays
    const annualKwhSaved = currentAnnualKwh - quicketAnnualKwh
    const currentAnnualElectricityCost = currentAnnualKwh * electricityPrice
    const quicketAnnualElectricityCost = quicketAnnualKwh * electricityPrice
    const annualElectricitySaved = annualKwhSaved * electricityPrice
    const currentAnnualCarbon = currentAnnualKwh * carbonFactor
    const quicketAnnualCarbon = quicketAnnualKwh * carbonFactor
    const annualCarbonSaved = annualKwhSaved * carbonFactor
    const currentMaintenanceCount = Math.floor(years / currentMaintenanceCycle)
    const quicketMaintenanceCount = Math.floor(years / quicketMaintenanceCycle)
    const currentMaintenanceTotal = quantity * currentMaintenanceCost * currentMaintenanceCount
    const quicketMaintenanceTotal = quantity * quicketMaintenanceCost * quicketMaintenanceCount
    const maintenanceSaved = currentMaintenanceTotal - quicketMaintenanceTotal
    const totalElectricitySaved = annualElectricitySaved * years
    const totalCarbonSaved = annualCarbonSaved * years
    const carbonValue = (totalCarbonSaved / 1000) * carbonPrice
    const totalSaved = totalElectricitySaved + maintenanceSaved + carbonValue
    const maintenanceReplacementEquivalent = Math.max(0, Math.round(maintenanceSaved / Math.max(currentMaintenanceCost, 1)))
    const annualModuleEquivalent = Math.max(0, Math.round(annualElectricitySaved / Math.max(quicketMaintenanceCost, 1)))
    const totalReplacementEquivalent = Math.max(0, Math.round(totalSaved / Math.max(currentMaintenanceCost, 1)))
    const estimatedLaborDays = Math.max(0, Math.round(maintenanceSaved / EST_LABOR_DAY_COST))
    const euCarbonValue = (totalCarbonSaved / 1000) * EU_EUA_NTD_PER_TON
    const taiwanCarbonValue = (totalCarbonSaved / 1000) * TAIWAN_CARBON_FEE_NTD_PER_TON
    const recycledMaterialValue = quantity * quicketMaintenanceCount * EST_RECYCLED_MATERIAL_VALUE_PER_SET

    const yearlyRows = Array.from({ length: years + 1 }, (_, index) => {
      const year = index
      const currentMaintenanceEvents = Math.floor(year / currentMaintenanceCycle)
      const quicketMaintenanceEvents = Math.floor(year / quicketMaintenanceCycle)
      return {
        year: `Y${year}`,
        currentElectricity: Math.round(currentAnnualElectricityCost * year),
        quicketElectricity: Math.round(quicketAnnualElectricityCost * year),
        currentMaintenance: Math.round(quantity * currentMaintenanceCost * currentMaintenanceEvents),
        quicketMaintenance: Math.round(quantity * quicketMaintenanceCost * quicketMaintenanceEvents),
        currentCarbon: Math.round(currentAnnualCarbon * year),
        quicketCarbon: Math.round(quicketAnnualCarbon * year),
      }
    })

    return {
      years, currentAnnualKwh, quicketAnnualKwh, annualKwhSaved, annualElectricitySaved, annualCarbonSaved,
      currentMaintenanceCount, quicketMaintenanceCount, currentMaintenanceTotal, quicketMaintenanceTotal,
      maintenanceSaved, totalElectricitySaved, totalCarbonSaved, carbonValue, totalSaved, yearlyRows,
      maintenanceReplacementEquivalent, annualModuleEquivalent, totalReplacementEquivalent, estimatedLaborDays, euCarbonValue, taiwanCarbonValue, recycledMaterialValue,
    }
  }, [form])

  const householdEquivalent = Math.max(1, Math.round(result.annualKwhSaved / 3720))
  const treeEquivalent = Math.max(1, Math.round(result.annualCarbonSaved / TREE_ABSORPTION_KG_PER_YEAR))
  const projectLabel = projectName.trim() || `${t.siteLabels[form.siteType]} ${t.luminaireLabels[form.luminaireType]}`

  const kpis = [
    { key: 'total', icon: TrendingUp, title: t.totalKpi(form.years), value: compactNtd(result.totalSaved), caption: t.totalCaption(formatKpiCount(result.totalReplacementEquivalent, locale)) },
    { key: 'electricityCost', icon: Zap, title: t.annualElecSave, value: formatNTD(result.annualElectricitySaved), caption: t.elecCaption(formatKpiCount(result.annualModuleEquivalent, locale)) },
    { key: 'maintenance', icon: Wrench, title: t.maintKpi(form.years), value: compactNtd(result.maintenanceSaved), caption: t.maintCaption(formatKpiCount(result.maintenanceReplacementEquivalent, locale)) },
    { key: 'energy', icon: Leaf, title: t.annualEnergy, value: `${formatNumber(result.annualKwhSaved)} kWh`, caption: t.energyCaption(formatKpiCount(householdEquivalent, locale)) },
    { key: 'carbon', icon: Cloud, title: t.annualCarbonKpi, value: `${formatNumber(result.annualCarbonSaved / 1000, 1)} tCO₂e`, caption: t.carbonCaption(formatKpiCount(treeEquivalent, locale)) },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-[1600px] overflow-x-hidden px-4 py-4 lg:px-8">
        <header className="mb-4 rounded-[28px] border border-slate-300 bg-white px-6 py-4 shadow-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <img src="/assets/quicket-logo.png" alt="QUICKET" className="h-9 w-auto shrink-0 object-contain md:h-10" />
              <div className="md:ml-5">
                <h1 className="text-2xl font-bold tracking-[0.06em] text-blue-950 md:text-[1.7rem]">{t.reportTitle}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600">{t.reportSubtitle}</p>
              </div>
            </div>
            <button type="button" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')} className="self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50">{locale === 'zh' ? 'EN' : '中'}</button>
          </div>
        </header>

        <main className="grid min-w-0 gap-5 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-300 bg-white p-5 shadow-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-2 text-blue-700"><Settings2 size={22} /></div>
              <div><h2 className="text-lg font-bold text-blue-950">{t.quickEstimate}</h2><p className="text-xs text-slate-500">Quick Estimate</p></div>
            </div>


            <div className="mb-4 flex flex-wrap gap-2">
              {scenarioPresetKeys.map((name) => (
                <button key={name} onClick={() => applyScenario(name)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{t.presetLabels[name]}</button>
              ))}
              <button
                type="button"
                onClick={() => setCustomSceneOpen(true)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${customSceneOpen ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`}
              >
                {t.customScene}
              </button>
            </div>

            {customSceneOpen && (
              <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
                <Field label={t.sceneName}>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder={t.scenePlaceholder}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
              </div>
            )}

            {hasCustomFields && <button type="button" onClick={resetToContextDefault} className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100">{t.resetContext(changedFields.length)}</button>}

            <div className="space-y-4">
              <SelectField label={t.siteType} value={form.siteType} onChange={(value) => applyContextTemplate('siteType', value)} options={siteOptions} labels={t.siteLabels} />
              <SelectField label={t.luminaireType} value={form.luminaireType} onChange={(value) => applyContextTemplate('luminaireType', value)} options={luminaireOptions} labels={t.luminaireLabels} />
              <NumberField label={t.quantity} suffix={t.units.pcs} value={form.quantity} customLabel={t.customTag} customized={customizedSet.has('quantity')} onChange={(value) => set('quantity', value)} />
              <NumberField label={t.years} suffix={t.units.years} value={form.years} customLabel={t.customTag} customized={customizedSet.has('years')} onChange={(value) => set('years', value)} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={t.currentWatt} suffix={t.units.w} value={form.currentWatt} customLabel={t.customTag} customized={customizedSet.has('currentWatt')} onChange={(value) => set('currentWatt', value)} />
                <QuicketWattField luminaireType={form.luminaireType} value={form.quicketWatt} customLabel={t.customTag} customized={customizedSet.has('quicketWatt')} onChange={(value) => set('quicketWatt', value)} label={t.quicketWatt} unit={t.units.w} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={t.dailyHours} suffix={t.units.hr} value={form.dailyHours} customLabel={t.customTag} customized={customizedSet.has('dailyHours')} onChange={(value) => set('dailyHours', value)} />
                <NumberField label={t.annualDays} suffix={t.units.day} value={form.annualDays} customLabel={t.customTag} customized={customizedSet.has('annualDays')} onChange={(value) => set('annualDays', value)} />
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/40">
                <button type="button" onClick={() => setAdvancedOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm"><Calculator size={18} /></div><div><div className="text-sm font-bold text-blue-950">{t.advanced}</div><div className="text-xs text-slate-500">{t.advancedSub}</div></div></div>
                  {advancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {advancedOpen && (
                  <div className="space-y-5 border-t border-blue-200 px-4 py-4">
                    <div className="space-y-4">
                      <NumberField label={t.electricityPrice} suffix={t.units.ntdPerKwh} value={form.electricityPrice} step={0.01} customLabel={t.customTag} customized={customizedSet.has('electricityPrice')} onChange={(value) => set('electricityPrice', value)} />
                      <NumberField label={t.carbonFactor} suffix={t.units.kgPerKwh} value={form.carbonFactor} step={0.001} customLabel={t.customTag} customized={customizedSet.has('carbonFactor')} onChange={(value) => set('carbonFactor', value)} />
                    </div>

                    <div className="rounded-2xl border border-slate-300 bg-white p-3">
                      <div className="mb-1 text-sm font-bold text-blue-950">{t.maintenanceBasis}</div>
                      <p className="mb-3 text-xs leading-5 text-slate-500">{t.maintenanceBasisNote}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <NumberField label={t.currentPlan} suffix={t.units.ntdPerTime} value={form.currentMaintenanceCost} customLabel={t.customTag} customized={customizedSet.has('currentMaintenanceCost')} onChange={(value) => set('currentMaintenanceCost', value)} />
                        <NumberField label={t.quicket} suffix={t.units.ntdPerTime} value={form.quicketMaintenanceCost} customLabel={t.customTag} customized={customizedSet.has('quicketMaintenanceCost')} onChange={(value) => set('quicketMaintenanceCost', value)} />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] leading-4 text-slate-500"><div>{t.wholeReplacementNote}</div><div>{t.moduleReplacementNote}</div></div>
                    </div>

                    <div className="rounded-2xl border border-slate-300 bg-white p-3">
                      <div className="mb-3 text-sm font-bold text-blue-950">{t.maintenanceCycle}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <NumberField label={t.currentPlan} suffix={t.units.years} value={form.currentMaintenanceCycle} customLabel={t.customTag} customized={customizedSet.has('currentMaintenanceCycle')} onChange={(value) => set('currentMaintenanceCycle', value)} />
                        <NumberField label={t.quicket} suffix={t.units.years} value={form.quicketMaintenanceCycle} customLabel={t.customTag} customized={customizedSet.has('quicketMaintenanceCycle')} onChange={(value) => set('quicketMaintenanceCycle', value)} />
                      </div>
                    </div>

                    <NumberField label={t.carbonPrice} suffix={t.units.ntdPerTon} value={form.carbonPrice} customLabel={t.customTag} customized={customizedSet.has('carbonPrice')} onChange={(value) => set('carbonPrice', value)} />
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div>
              {activeKpi ? <KpiOverlay activeKpi={activeKpi} result={result} form={form} t={t} onClose={() => setActiveKpi(null)} /> : (
                <div className="flex w-full max-w-full min-w-0 gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pb-0 xl:gap-4">
                  {kpis.map((kpi) => <div key={kpi.key} className="min-w-[210px] lg:min-w-0"><KpiCard kpi={kpi} active={false} onClick={() => setActiveKpi(kpi.key)} /></div>)}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-300 px-5 py-4 text-blue-800">
                <Grid size={18} />
                <h2 className="text-lg font-bold">{t.overallAnalysis}</h2>
              </div>
              <div className="p-4 lg:p-5">
                <div className="mb-4 flex max-w-full gap-2 overflow-x-auto md:hidden">
                  {[
                    ['electricity', t.electricityCompare],
                    ['maintenance', t.maintenanceCompare],
                    ['carbon', t.carbonCompare],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMobileChart(key)}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${mobileChart === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-w-0 overflow-hidden md:hidden">
                  {mobileChart === 'electricity' && <ElectricityChart result={result} t={t} />}
                  {mobileChart === 'maintenance' && <MaintenanceChart result={result} t={t} />}
                  {mobileChart === 'carbon' && <CarbonMiniChart result={result} t={t} />}
                </div>
                <div className="hidden min-w-0 gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                  <ElectricityChart result={result} t={t} />
                  <MaintenanceChart result={result} t={t} />
                  <div className="md:col-span-2 xl:col-span-1">
                    <CarbonMiniChart result={result} t={t} />
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 max-w-full overflow-hidden rounded-[28px] border border-blue-200 bg-blue-50/60 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white"><Lightbulb size={28} /></div>
                <div className="min-w-0 max-w-full flex-1">
                  <h3 className="text-xl font-bold text-blue-950">{t.insight}</h3>
                  <div className="mt-2 max-w-full space-y-2 break-words text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                    <p><span className="font-bold text-slate-900">{t.caseCond}</span>{t.insightLine1(projectLabel, formatNumber(form.quantity), form.years)}</p>
                    <p><span className="font-bold text-slate-900">{t.annualBenefit}</span>{t.insightLine2(formatNumber(result.annualKwhSaved), formatNTD(result.annualElectricitySaved))}</p>
                    <p><span className="font-bold text-slate-900">{t.longBenefit}</span>{t.insightLine3(form.years, compactNtd(result.maintenanceSaved), compactNtd(result.totalSaved))}</p>
                  </div>
                  <div className="mt-3 max-w-full break-words rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800">
                    {t.totalBenefitLine(form.years, compactNtd(result.totalSaved))}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MetricBlock icon={DollarSign} title={t.costSaving}>
                  {t.costComment(formatNumber(result.maintenanceReplacementEquivalent), formatNumber(result.estimatedLaborDays))}
                </MetricBlock>
                <MetricBlock icon={Leaf} title={t.carbonValue}>
                  <div><div>{t.carbonCommentHeader}</div><div className="mt-1">{t.carbonCommentEU(formatNTD(result.euCarbonValue))}</div><div>{t.carbonCommentTW(formatNTD(result.taiwanCarbonValue))}</div></div>
                </MetricBlock>
                <MetricBlock icon={LineChart} title={t.recycling}>
                  {t.recycleComment(formatNTD(result.recycledMaterialValue))}
                </MetricBlock>
              </div>
            </div>

            <p className="pb-3 text-xs leading-5 text-slate-500">{t.note}</p>
          </section>
        </main>
      </div>
    </div>
  )
}
