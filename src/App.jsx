import React, { useMemo, useState } from 'react'
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Cloud,
  DollarSign,
  FileText,
  Grid,
  Info,
  Leaf,
  Lightbulb,
  LineChart,
  Settings2,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
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
const compactNtd = (value) => {
  const safe = Number.isFinite(value) ? value : 0
  if (Math.abs(safe) >= 1_000_000) return `NT$${(safe / 1_000_000).toFixed(2)}M`
  return `NT$${nf.format(Math.round(safe))}`
}

const formatNTD = (value) => `NT$${nf.format(Math.round(Number.isFinite(value) ? value : 0))}`
const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0)
const formatM = (value) => (Math.abs(value) >= 1_000_000 ? `${formatNumber(value / 1_000_000, 1)}M` : formatNumber(value))

const siteOptions = {
  factory: '工廠',
  warehouse: '倉儲',
  office: '商辦',
  public: '公共空間',
  outdoor: '戶外場域',
}

const luminaireOptions = {
  downlight: '崁燈',
  cylinder: '筒燈',
  'bay-light': '天井燈',
  'flood-light': '投射燈',
  'street-light': '路燈',
}

const siteDefaults = {
  factory: { quantity: 620, dailyHours: 12, annualDays: 250, electricityPrice: 4.27, carbonFactor: 0.494, years: 15, carbonPrice: 2500, maintenanceFactor: 1.0 },
  warehouse: { quantity: 400, dailyHours: 18, annualDays: 330, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 1.08 },
  office: { quantity: 200, dailyHours: 10, annualDays: 240, electricityPrice: 4.27, carbonFactor: 0.494, years: 10, carbonPrice: 2500, maintenanceFactor: 0.55 },
  public: { quantity: 300, dailyHours: 14, annualDays: 300, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 0.85 },
  outdoor: { quantity: 180, dailyHours: 11, annualDays: 365, electricityPrice: 4.27, carbonFactor: 0.494, years: 12, carbonPrice: 2500, maintenanceFactor: 1.15 },
}

const luminaireDefaults = {
  downlight: { currentWatt: 40, quicketWatt: 28, currentMaintenanceCost: 3000, quicketMaintenanceCost: 1000, currentMaintenanceCycle: 5, quicketMaintenanceCycle: 4 },
  cylinder: { currentWatt: 70, quicketWatt: 50, currentMaintenanceCost: 4200, quicketMaintenanceCost: 1300, currentMaintenanceCycle: 4, quicketMaintenanceCycle: 4 },
  'bay-light': { currentWatt: 200, quicketWatt: 150, currentMaintenanceCost: 6500, quicketMaintenanceCost: 2000, currentMaintenanceCycle: 3, quicketMaintenanceCycle: 3 },
  'flood-light': { currentWatt: 150, quicketWatt: 110, currentMaintenanceCost: 6200, quicketMaintenanceCost: 1900, currentMaintenanceCycle: 3, quicketMaintenanceCycle: 3 },
  'street-light': { currentWatt: 100, quicketWatt: 75, currentMaintenanceCost: 5800, quicketMaintenanceCost: 1800, currentMaintenanceCycle: 4, quicketMaintenanceCycle: 4 },
}

function buildDefaultParams(siteType = 'factory', luminaireType = 'bay-light') {
  const site = siteDefaults[siteType] || siteDefaults.factory
  const luminaire = luminaireDefaults[luminaireType] || luminaireDefaults['bay-light']
  const maintenanceFactor = site.maintenanceFactor || 1

  return {
    siteType,
    luminaireType,
    quantity: site.quantity,
    currentWatt: luminaire.currentWatt,
    quicketWatt: luminaire.quicketWatt,
    dailyHours: site.dailyHours,
    annualDays: site.annualDays,
    electricityPrice: site.electricityPrice,
    carbonFactor: site.carbonFactor,
    currentMaintenanceCost: Math.round(luminaire.currentMaintenanceCost * maintenanceFactor / 100) * 100,
    quicketMaintenanceCost: Math.round(luminaire.quicketMaintenanceCost * maintenanceFactor / 100) * 100,
    currentMaintenanceCycle: luminaire.currentMaintenanceCycle,
    quicketMaintenanceCycle: luminaire.quicketMaintenanceCycle,
    years: site.years,
    carbonPrice: site.carbonPrice,
  }
}

const scenarioPresets = {
  '工業天井燈': buildDefaultParams('factory', 'bay-light'),
  '長時倉儲': buildDefaultParams('warehouse', 'bay-light'),
  '商辦崁燈': buildDefaultParams('office', 'downlight'),
  '公共筒燈': buildDefaultParams('public', 'cylinder'),
  '戶外路燈': buildDefaultParams('outdoor', 'street-light'),
}

function getChangedFields(form) {
  const base = buildDefaultParams(form.siteType, form.luminaireType)
  return Object.keys(base).filter((key) => form[key] !== base[key])
}

function Field({ label, suffix, customized, children }) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-2">
          {label}
          {customized && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">已自訂</span>}
        </span>
        {suffix && <span>{suffix}</span>}
      </div>
      {children}
    </label>
  )
}

function NumberField({ label, suffix, value, onChange, min = 0, step = 1, customized = false }) {
  return (
    <Field label={label} suffix={suffix} customized={customized}>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value
          onChange(nextValue === '' ? '' : Number(nextValue))
        }}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${customized ? 'border-amber-200' : 'border-slate-200'}`}
      />
    </Field>
  )
}

function SelectField({ label, value, onChange, options, customized = false }) {
  return (
    <Field label={label} customized={customized}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 ${customized ? 'border-amber-200' : 'border-slate-200'}`}
      >
        {Object.entries(options).map(([key, labelText]) => (
          <option key={key} value={key}>
            {labelText}
          </option>
        ))}
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
      className={`group relative min-h-[142px] rounded-3xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
        active ? 'border-blue-500 shadow-lg shadow-blue-100/70' : 'border-slate-200'
      }`}
    >
      {active && <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-blue-600" />}
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition ${
          active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-blue-700 group-hover:bg-blue-50'
        }`}
      >
        <Icon size={26} strokeWidth={2.2} />
      </div>
      <div className={`text-center text-base font-semibold ${active ? 'text-blue-950' : 'text-slate-900'}`}>{kpi.title}</div>
      <div className="mt-2 text-center text-xl font-bold tracking-tight text-blue-900">{kpi.value}</div>
      <div className="mt-2 text-center text-xs leading-5 text-slate-500">{kpi.caption}</div>
    </button>
  )
}

function MetricBlock({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700">
        <Icon size={22} />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{text}</div>
      </div>
    </div>
  )
}

function KpiExplanation({ activeKpi, result, form }) {
  if (!activeKpi) return null

  const data = {
    total: {
      title: `${form.years} 年總效益如何計算`,
      description:
        `${form.years} 年總效益整合電費節約、維護成本節約與碳效益估算，用來快速評估 QUICKET 導入後在整個使用週期內可能帶來的總體財務改善。`,
      formula: `${form.years} 年總效益 = ${form.years} 年累積電費節約 + ${form.years} 年維護成本節約 + ${form.years} 年碳效益估算`,
      lines: [
        `${form.years} 年累積電費節約 = ${formatNTD(result.annualElectricitySaved)} × ${form.years} = ${formatNTD(result.totalElectricitySaved)}`,
        `${form.years} 年維護成本節約 = 現有方案維護 ${formatNTD(result.currentMaintenanceTotal)} - QUICKET 維護 ${formatNTD(result.quicketMaintenanceTotal)} = ${formatNTD(result.maintenanceSaved)}`,
        `${form.years} 年碳效益估算 = ${formatNumber(result.annualCarbonSaved / 1000, 1)} tCO₂e × ${form.years} × ${formatNTD(form.carbonPrice)} ≈ ${formatNTD(result.carbonValue)}`,
        `合計 ≈ ${compactNtd(result.totalSaved)}`,
      ],
    },
    electricityCost: {
      title: '年度電費節約如何計算',
      description: '年度電費節約是比較現有照明方案與 QUICKET 在相同使用條件下，因瓦數降低而產生的年度電費差額。',
      formula: '年度電費節約 = 燈具數量 × (現有瓦數 - QUICKET 瓦數) ÷ 1000 × 每日使用小時 × 每年使用天數 × 電價',
      lines: [
        `年度節電量 = ${formatNumber(form.quantity)} × (${form.currentWatt}W - ${form.quicketWatt}W) ÷ 1000 × ${form.dailyHours} × ${form.annualDays} = ${formatNumber(result.annualKwhSaved)} kWh`,
        `年度電費節約 = ${formatNumber(result.annualKwhSaved)} × ${formatNTD(form.electricityPrice)} = ${formatNTD(result.annualElectricitySaved)}`,
      ],
    },
    maintenance: {
      title: `${form.years} 年維護節約如何計算`,
      description: `${form.years} 年維護節約是比較傳統整燈更換與 QUICKET 模組更換在維護成本上的差異。QUICKET 維護時可更換模組，不必反覆更換整組燈具。`,
      formula: `${form.years} 年維護節約 = 燈具數量 × (現有維護成本 - QUICKET 維護成本) × 維護次數`,
      lines: [
        `維護次數 = floor(${form.years} ÷ ${Math.max(form.currentMaintenanceCycle || 1, 1)}) = ${result.currentMaintenanceCount} 次；QUICKET = ${result.quicketMaintenanceCount} 次`,
        `現有方案維護成本 = ${formatNumber(form.quantity)} × ${formatNTD(form.currentMaintenanceCost)} × ${result.currentMaintenanceCount} = ${formatNTD(result.currentMaintenanceTotal)}`,
        `QUICKET 維護成本 = ${formatNumber(form.quantity)} × ${formatNTD(form.quicketMaintenanceCost)} × ${result.quicketMaintenanceCount} = ${formatNTD(result.quicketMaintenanceTotal)}`,
        `維護節約 = ${formatNTD(result.maintenanceSaved)}`,
      ],
    },
    energy: {
      title: '年度節電量如何計算',
      description: '年度節電量是比較現有照明與 QUICKET 在相同使用時間下，每年可減少的用電量，也是電費節約與減碳量計算的基礎。',
      formula: '年度節電量 = 燈具數量 × 單盞瓦數差 ÷ 1000 × 每日使用小時 × 每年使用天數',
      lines: [
        `單盞瓦數差 = ${form.currentWatt}W - ${form.quicketWatt}W = ${form.currentWatt - form.quicketWatt}W`,
        `年度節電量 = ${formatNumber(form.quantity)} × ${form.currentWatt - form.quicketWatt} ÷ 1000 × ${form.dailyHours} × ${form.annualDays} = ${formatNumber(result.annualKwhSaved)} kWh`,
      ],
    },
    carbon: {
      title: '年度減碳量如何計算',
      description: '年度減碳量是將年度節電量換算為對應的碳排放減少量，用來評估 QUICKET 在 ESG、永續報告或碳管理上的潛在貢獻。',
      formula: '年度減碳量 = 年度節電量 × 碳排係數 ÷ 1000',
      lines: [
        `年度減碳量 = ${formatNumber(result.annualKwhSaved)} × ${form.carbonFactor} ÷ 1000 = ${formatNumber(result.annualCarbonSaved / 1000, 1)} tCO₂e`,
        '若用於正式 ESG 報告、碳盤查或碳權申請，應依制度採認的係數與方法學重新確認。',
      ],
    },
  }[activeKpi]

  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <Info size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-950">{data.title}</h2>
            <p className="mt-1 text-sm text-slate-500">本指標依左側估算條件與進階參數自動計算；使用者可調整參數以反映實際場域條件。</p>
          </div>
        </div>
        <button className="rounded-full border border-blue-100 p-2 text-blue-700" aria-label="收合說明">
          <ChevronUp size={18} />
        </button>
      </div>

      <div className="grid gap-4 min-[900px]:grid-cols-[1fr_1fr_1.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-blue-950">指標說明</h3>
          <p className="text-sm leading-7 text-slate-600">{data.description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-blue-950">計算公式</h3>
          <p className="text-sm leading-7 text-slate-700">{data.formula}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <h3 className="mb-2 text-sm font-bold text-blue-950">本案例代入</h3>
          <div className="space-y-2 text-sm leading-6 text-slate-700">
            {data.lines.map((line, index) => (
              <div key={line} className={index === data.lines.length - 1 ? 'font-bold text-blue-700' : ''}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${
        active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

function ElectricityChart({ result }) {
  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-blue-950">累積電費比較</h3>
        <p className="text-sm text-slate-500">現有方案 vs QUICKET</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={result.yearlyRows} margin={{ top: 18, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={formatM} />
            <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12 }} />
            <Legend />
            <Area type="monotone" dataKey="現有方案電費" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.12} strokeWidth={3} />
            <Area type="monotone" dataKey="QUICKET電費" name="QUICKET 電費" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute right-5 top-[46%] rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 text-center text-sm shadow-sm">
        <div className="font-semibold text-slate-700">{result.years} 年累積</div>
        <div className="font-semibold text-slate-700">電費差額</div>
        <div className="mt-1 text-lg font-bold text-blue-700">{compactNtd(result.totalElectricitySaved)}</div>
      </div>
    </div>
  )
}

function MaintenanceChart({ result }) {
  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-blue-950">累積維護成本比較</h3>
        <p className="text-sm text-slate-500">整燈更換 vs QUICKET 模組更換</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.yearlyRows} margin={{ top: 18, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={formatM} />
            <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12 }} />
            <Legend />
            <Bar dataKey="現有方案維護" name="整燈更換維護成本" fill="#94a3b8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="QUICKET維護" name="QUICKET 模組維護成本" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute right-5 top-[46%] rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 text-center text-sm shadow-sm">
        <div className="font-semibold text-slate-700">{result.years} 年維護差額</div>
        <div className="mt-1 text-lg font-bold text-blue-700">{compactNtd(result.maintenanceSaved)}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState(scenarioPresets['工業天井燈'])
  const [tab, setTab] = useState('overview')
  const [activeKpi, setActiveKpi] = useState(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const defaultForCurrentContext = useMemo(() => buildDefaultParams(form.siteType, form.luminaireType), [form.siteType, form.luminaireType])
  const changedFields = useMemo(() => getChangedFields(form), [form])
  const customizedSet = useMemo(() => new Set(changedFields), [changedFields])
  const hasCustomFields = changedFields.length > 0

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const applyScenario = (name) => {
    setForm(scenarioPresets[name])
    setActiveKpi(null)
  }
  const applyContextTemplate = (key, value) => {
    const nextSiteType = key === 'siteType' ? value : form.siteType
    const nextLuminaireType = key === 'luminaireType' ? value : form.luminaireType
    setForm(buildDefaultParams(nextSiteType, nextLuminaireType))
    setActiveKpi(null)
  }
  const resetToContextDefault = () => {
    setForm(defaultForCurrentContext)
    setActiveKpi(null)
  }

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
    const sharedMaintenanceCount = Math.floor(years / Math.max(currentMaintenanceCycle, 1))
    const currentMaintenanceTotal = quantity * currentMaintenanceCost * currentMaintenanceCount
    const quicketMaintenanceTotal = quantity * quicketMaintenanceCost * quicketMaintenanceCount
    const maintenanceSaved = currentMaintenanceTotal - quicketMaintenanceTotal
    const totalElectricitySaved = annualElectricitySaved * years
    const totalCarbonSaved = annualCarbonSaved * years
    const carbonValue = (totalCarbonSaved / 1000) * carbonPrice
    const totalSaved = totalElectricitySaved + maintenanceSaved + carbonValue

    const yearlyRows = Array.from({ length: years + 1 }, (_, index) => {
      const year = index
      const currentMaintenanceEvents = Math.floor(year / currentMaintenanceCycle)
      const quicketMaintenanceEvents = Math.floor(year / quicketMaintenanceCycle)
      return {
        year: `Y${year}`,
        現有方案電費: Math.round(currentAnnualElectricityCost * year),
        QUICKET電費: Math.round(quicketAnnualElectricityCost * year),
        現有方案維護: Math.round(quantity * currentMaintenanceCost * currentMaintenanceEvents),
        QUICKET維護: Math.round(quantity * quicketMaintenanceCost * quicketMaintenanceEvents),
        現有方案碳排: Math.round(currentAnnualCarbon * year),
        QUICKET碳排: Math.round(quicketAnnualCarbon * year),
      }
    })

    return {
      years,
      currentAnnualKwh,
      quicketAnnualKwh,
      annualKwhSaved,
      annualElectricitySaved,
      annualCarbonSaved,
      currentMaintenanceCount,
      quicketMaintenanceCount,
      sharedMaintenanceCount,
      currentMaintenanceTotal,
      quicketMaintenanceTotal,
      maintenanceSaved,
      totalElectricitySaved,
      totalCarbonSaved,
      carbonValue,
      totalSaved,
      yearlyRows,
    }
  }, [form])

  const kpis = [
    { key: 'total', icon: TrendingUp, title: `${form.years} 年總效益`, value: compactNtd(result.totalSaved), caption: '電費 + 維護 + 碳效益' },
    { key: 'electricityCost', icon: Zap, title: '年度電費節約', value: formatNTD(result.annualElectricitySaved), caption: '每年節省電費' },
    { key: 'maintenance', icon: Wrench, title: `${form.years} 年維護節約`, value: compactNtd(result.maintenanceSaved), caption: '降低維護成本' },
    { key: 'energy', icon: Leaf, title: '年度節電量', value: `${formatNumber(result.annualKwhSaved)} kWh`, caption: '相當於 25 戶家庭用電' },
    { key: 'carbon', icon: Cloud, title: '年度減碳量', value: `${formatNumber(result.annualCarbonSaved / 1000, 1)} tCO₂e`, caption: '減少碳排放' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-8">
        <header className="mb-5 rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <img src="/assets/quicket-logo.png" alt="QUICKET" className="h-12 w-auto shrink-0 object-contain md:h-14" />
            <div className="md:ml-4">
              <h1 className="text-3xl font-bold tracking-[0.08em] text-blue-950 md:text-4xl">QUICKET 導入效益儀表板</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                快速比較現有照明方案與 QUICKET 導入後的節能、維護與長期成本效益。
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-5 min-[900px]:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">
                <Settings2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-950">快速估算條件</h2>
                <p className="text-xs text-slate-500">Quick Estimate</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-5 text-slate-600">
              <div className="font-bold text-blue-900">案例預設值，可依實際場域調整</div>
              <div>選擇場域與燈具類型會自動帶入預設參數；手動修改後，欄位會標示為「已自訂」。</div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {Object.keys(scenarioPresets).map((name) => (
                <button
                  key={name}
                  onClick={() => applyScenario(name)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {name}
                </button>
              ))}
            </div>

            {hasCustomFields && (
              <button
                type="button"
                onClick={resetToContextDefault}
                className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
              >
                目前有 {changedFields.length} 項自訂參數，點此恢復此場域預設值
              </button>
            )}

            <div className="space-y-4">
              <SelectField label="場域類型" value={form.siteType} onChange={(value) => applyContextTemplate('siteType', value)} options={siteOptions} />
              <SelectField label="燈具類型" value={form.luminaireType} onChange={(value) => applyContextTemplate('luminaireType', value)} options={luminaireOptions} />
              <NumberField label="燈具數量" suffix="盞" value={form.quantity} customized={customizedSet.has('quantity')} onChange={(value) => set('quantity', value)} />
              <NumberField label="計算年限" suffix="年" value={form.years} customized={customizedSet.has('years')} onChange={(value) => set('years', value)} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="現有瓦數" suffix="W" value={form.currentWatt} customized={customizedSet.has('currentWatt')} onChange={(value) => set('currentWatt', value)} />
                <NumberField label="QUICKET 瓦數" suffix="W" value={form.quicketWatt} customized={customizedSet.has('quicketWatt')} onChange={(value) => set('quicketWatt', value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="每日使用" suffix="小時" value={form.dailyHours} customized={customizedSet.has('dailyHours')} onChange={(value) => set('dailyHours', value)} />
                <NumberField label="每年使用" suffix="天" value={form.annualDays} customized={customizedSet.has('annualDays')} onChange={(value) => set('annualDays', value)} />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((value) => !value)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-blue-950">進階參數</div>
                      <div className="text-xs text-slate-500">查看與調整更多假設條件</div>
                    </div>
                  </div>
                  {advancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {advancedOpen && (
                  <div className="space-y-4 border-t border-blue-100 px-4 py-4">
                    <NumberField label="電價" suffix="NTD/kWh" value={form.electricityPrice} step={0.01} customized={customizedSet.has('electricityPrice')} onChange={(value) => set('electricityPrice', value)} />
                    <NumberField label="碳排係數" suffix="kg/kWh" value={form.carbonFactor} step={0.001} customized={customizedSet.has('carbonFactor')} onChange={(value) => set('carbonFactor', value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="現有維護成本" suffix="NTD/次" value={form.currentMaintenanceCost} customized={customizedSet.has('currentMaintenanceCost')} onChange={(value) => set('currentMaintenanceCost', value)} />
                      <NumberField label="QUICKET 模組成本" suffix="NTD/次" value={form.quicketMaintenanceCost} customized={customizedSet.has('quicketMaintenanceCost')} onChange={(value) => set('quicketMaintenanceCost', value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="現有維護週期" suffix="年" value={form.currentMaintenanceCycle} customized={customizedSet.has('currentMaintenanceCycle')} onChange={(value) => set('currentMaintenanceCycle', value)} />
                      <NumberField label="QUICKET 維護週期" suffix="年" value={form.quicketMaintenanceCycle} customized={customizedSet.has('quicketMaintenanceCycle')} onChange={(value) => set('quicketMaintenanceCycle', value)} />
                    </div>
                    <NumberField label="碳價估算" suffix="NTD/ton" value={form.carbonPrice} customized={customizedSet.has('carbonPrice')} onChange={(value) => set('carbonPrice', value)} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setTab('summary')}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 px-4 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
              >
                <FileText size={22} />
                產生專案摘要
              </button>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="grid gap-4 min-[900px]:grid-cols-5">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.key} kpi={kpi} active={activeKpi === kpi.key} onClick={() => setActiveKpi((prev) => (prev === kpi.key ? null : kpi.key))} />
              ))}
            </div>

            <KpiExplanation activeKpi={activeKpi} result={result} form={form} />

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-2 border-b border-slate-200 bg-white min-[900px]:grid-cols-5">
                <TabButton active={tab === 'overview'} icon={Grid} label="總覽" onClick={() => setTab('overview')} />
                <TabButton active={tab === 'cost'} icon={DollarSign} label="成本比較" onClick={() => setTab('cost')} />
                <TabButton active={tab === 'carbon'} icon={Leaf} label="節能減碳" onClick={() => setTab('carbon')} />
                <TabButton active={tab === 'summary'} icon={ClipboardList} label="專案摘要" onClick={() => setTab('summary')} />
                <TabButton active={tab === 'formula'} icon={Calculator} label="公式與假設" onClick={() => setTab('formula')} />
              </div>

              <div className="p-4 lg:p-5">
                {(tab === 'overview' || tab === 'cost') && (
                  <div className="grid gap-5 min-[900px]:grid-cols-2">
                    <ElectricityChart result={result} />
                    <MaintenanceChart result={result} />
                  </div>
                )}

                {tab === 'carbon' && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-blue-950">累積碳排比較</h3>
                      <p className="text-sm text-slate-500">用電相關碳排估算</p>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.yearlyRows} margin={{ top: 18, right: 18, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
                          <XAxis dataKey="year" stroke="#64748b" />
                          <YAxis stroke="#64748b" tickFormatter={(value) => `${formatNumber(value / 1000, 0)}t`} />
                          <Tooltip formatter={(value) => `${formatNumber(value / 1000, 1)} tCO₂e`} contentStyle={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12 }} />
                          <Legend />
                          <Area type="monotone" dataKey="現有方案碳排" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.12} strokeWidth={3} />
                          <Area type="monotone" dataKey="QUICKET碳排" name="QUICKET 碳排" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {tab === 'summary' && (
                  <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-lg font-bold text-blue-950">試算結果摘要</h3>
                      <div className="space-y-3 text-sm text-slate-700">
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">現有方案年度用電</span><span>{formatNumber(result.currentAnnualKwh)} kWh</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">QUICKET 年度用電</span><span>{formatNumber(result.quicketAnnualKwh)} kWh</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">年度節電</span><span className="font-semibold text-blue-700">{formatNumber(result.annualKwhSaved)} kWh</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">年度電費節約</span><span className="font-semibold text-blue-700">{formatNTD(result.annualElectricitySaved)}</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">{form.years} 年維護節約</span><span className="font-semibold text-blue-700">{formatNTD(result.maintenanceSaved)}</span></div>
                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">估算碳價價值</span><span>{formatNTD(result.carbonValue)}</span></div>
                        <div className="flex justify-between text-base font-bold"><span>{form.years} 年總效益</span><span className="text-blue-700">{compactNtd(result.totalSaved)}</span></div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
                      <h3 className="mb-4 text-lg font-bold text-blue-950">客戶溝通重點</h3>
                      <div className="space-y-4 text-sm leading-7 text-slate-700">
                        <p>
                          本案例以 {formatNumber(form.quantity)} 盞{siteOptions[form.siteType]}{luminaireOptions[form.luminaireType]}、{form.years} 年使用情境估算，QUICKET 可在節能、維護與碳效益上帶來顯著改善。
                        </p>
                        <p>
                          對業主而言，價值不只來自低瓦數運作，也來自模組化維護與減少整燈更換所形成的長期營運成本下降。
                        </p>
                        <div className="rounded-2xl border border-blue-100 bg-white p-4 text-blue-800">
                          {form.years} 年估算總效益：<span className="font-bold">{compactNtd(result.totalSaved)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'formula' && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-blue-950">公式與假設</h3>
                    <div className="grid gap-4 text-sm leading-7 text-slate-700 lg:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4"><strong>年度用電</strong><br />燈具數量 × 瓦數 ÷ 1000 × 每日使用 × 每年使用天數</div>
                      <div className="rounded-2xl bg-slate-50 p-4"><strong>年度電費節約</strong><br />年度節電量 × 電價</div>
                      <div className="rounded-2xl bg-slate-50 p-4"><strong>維護成本</strong><br />維護次數 = floor(年數 ÷ 維護週期)；總成本 = 燈具數量 × 每次維護成本 × 維護次數</div>
                      <div className="rounded-2xl bg-slate-50 p-4"><strong>碳效益估算</strong><br />年度節電量 × 碳排係數 ÷ 1000 × 年數 × 碳價估算</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
              <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-center">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                    <Lightbulb size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-950">專案洞察</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      本案例以 {formatNumber(form.quantity)} 盞{siteOptions[form.siteType]}{luminaireOptions[form.luminaireType]}、{form.years} 年使用情境估算，QUICKET 可在節能、維護與碳效益上帶來顯著改善，有效降低營運成本並提升永續競爭力。
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
                  <MetricBlock icon={DollarSign} title="顯著降低" text="營運成本" />
                  <MetricBlock icon={Leaf} title="提升能源效率" text="與永續表現" />
                  <MetricBlock icon={LineChart} title="長期穩定" text="投資報酬" />
                </div>
              </div>
            </div>

            <p className="pb-3 text-xs text-slate-500">註：所有數值為估算結果，實際效益可能因場域條件、電價與維護策略而異。</p>
          </section>
        </main>
      </div>
    </div>
  )
}
