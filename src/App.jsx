import React, { useMemo, useState } from 'react'
import { Calculator, Factory, Leaf, Lightbulb, LineChart, Settings, Zap } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const formatNTD = (value) =>
  new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)

function Field({ label, suffix, children }) {
  return (
    <label className="space-y-1.5 block">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        {suffix && <span className="text-slate-500">{suffix}</span>}
      </div>
      {children}
    </label>
  )
}

function NumberField({ label, suffix, value, onChange, min = 0, step = 1 }) {
  return (
    <Field label={label} suffix={suffix}>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => {
          const v = event.target.value
          onChange(v === '' ? '' : Number(v))
        }}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
      />
    </Field>
  )
}

function KpiCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="rounded-2xl bg-gray-100 p-2 text-slate-700">
            <Icon size={20} />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">QUICKET</span>
        </div>
        <div className="text-lg font-medium text-slate-900">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
        <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState({
    siteType: 'factory',
    luminaireType: 'bay-light',
    quantity: 620,
    currentWatt: 200,
    quicketWatt: 150,
    dailyHours: 12,
    annualDays: 250,
    electricityPrice: 4.27,
    carbonFactor: 0.494,
    currentMaintenanceCost: 6500,
    quicketMaintenanceCost: 2000,
    currentMaintenanceCycle: 3,
    quicketMaintenanceCycle: 3,
    years: 15,
    carbonPrice: 2500,
  })

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const presets = {
    'Industrial Bay (default)': {
      siteType: 'factory',
      luminaireType: 'bay-light',
      quantity: 620,
      currentWatt: 200,
      quicketWatt: 150,
      dailyHours: 12,
      annualDays: 250,
      electricityPrice: 4.27,
      carbonFactor: 0.494,
      currentMaintenanceCost: 6500,
      quicketMaintenanceCost: 2000,
      currentMaintenanceCycle: 3,
      quicketMaintenanceCycle: 3,
      years: 15,
      carbonPrice: 2500,
    },
    'Warehouse (long hours)': {
      siteType: 'warehouse',
      luminaireType: 'bay-light',
      quantity: 400,
      currentWatt: 250,
      quicketWatt: 160,
      dailyHours: 18,
      annualDays: 330,
      electricityPrice: 4.27,
      carbonFactor: 0.494,
      currentMaintenanceCost: 7000,
      quicketMaintenanceCost: 2200,
      currentMaintenanceCycle: 4,
      quicketMaintenanceCycle: 3,
      years: 10,
      carbonPrice: 2500,
    },
    'Office (day use)': {
      siteType: 'office',
      luminaireType: 'downlight',
      quantity: 200,
      currentWatt: 40,
      quicketWatt: 28,
      dailyHours: 10,
      annualDays: 240,
      electricityPrice: 4.27,
      carbonFactor: 0.494,
      currentMaintenanceCost: 3000,
      quicketMaintenanceCost: 1000,
      currentMaintenanceCycle: 5,
      quicketMaintenanceCycle: 4,
      years: 8,
      carbonPrice: 2500,
    },
  }

  const applyPreset = (name) => {
    const p = presets[name]
    if (p) setForm((prev) => ({ ...prev, ...p }))
  }

  const result = useMemo(() => {
    const quantity = Math.max(form.quantity || 0, 0)
    const years = Math.max(form.years || 1, 1)

    const currentAnnualKwh = quantity * (form.currentWatt / 1000) * form.dailyHours * form.annualDays
    const quicketAnnualKwh = quantity * (form.quicketWatt / 1000) * form.dailyHours * form.annualDays
    const annualKwhSaved = currentAnnualKwh - quicketAnnualKwh

    const currentAnnualElectricityCost = currentAnnualKwh * form.electricityPrice
    const quicketAnnualElectricityCost = quicketAnnualKwh * form.electricityPrice
    const annualElectricitySaved = currentAnnualElectricityCost - quicketAnnualElectricityCost

    const currentAnnualCarbon = currentAnnualKwh * form.carbonFactor
    const quicketAnnualCarbon = quicketAnnualKwh * form.carbonFactor
    const annualCarbonSaved = currentAnnualCarbon - quicketAnnualCarbon

    const currentMaintenanceCount = Math.floor(years / Math.max(form.currentMaintenanceCycle, 1))
    const quicketMaintenanceCount = Math.floor(years / Math.max(form.quicketMaintenanceCycle, 1))
    const currentMaintenanceTotal = quantity * form.currentMaintenanceCost * currentMaintenanceCount
    const quicketMaintenanceTotal = quantity * form.quicketMaintenanceCost * quicketMaintenanceCount
    const maintenanceSaved = currentMaintenanceTotal - quicketMaintenanceTotal

    const totalElectricitySaved = annualElectricitySaved * years
    const totalCarbonSaved = annualCarbonSaved * years
    const carbonValue = (totalCarbonSaved / 1000) * form.carbonPrice
    const totalSaved = totalElectricitySaved + maintenanceSaved + carbonValue

    const yearlyRows = Array.from({ length: years }, (_, index) => {
      const year = index + 1
      const currentMaintenanceEvents = Math.floor(year / Math.max(form.currentMaintenanceCycle, 1))
      const quicketMaintenanceEvents = Math.floor(year / Math.max(form.quicketMaintenanceCycle, 1))
      const currentMaintenance = quantity * form.currentMaintenanceCost * currentMaintenanceEvents
      const quicketMaintenance = quantity * form.quicketMaintenanceCost * quicketMaintenanceEvents

      return {
        year: `Y${year}`,
        年度:年,
        現有方案電費: Math.round(currentAnnualElectricityCost * year),
        QUICKET電費: Math.round(quicketAnnualElectricityCost * year),
        現有方案維護: Math.round(currentMaintenance),
        QUICKET維護: Math.round(quicketMaintenance),
        現有方案碳排: Math.round(currentAnnualCarbon * year),
        QUICKET碳排: Math.round(quicketAnnualCarbon * year),
      }
    })

    return {
      currentAnnualKwh,
      quicketAnnualKwh,
      annualKwhSaved,
      annualElectricitySaved,
      annualCarbonSaved,
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

  const [tab, setTab] = useState('cost')

  // accordion state for mobile inputs
  const [openSections, setOpenSections] = useState({
    basics: true,
    comparison: false,
    usage: false,
    esg: false,
  })

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <img src="/assets/quicket-logo.png" alt="QUICKET" className="h-12 w-auto object-contain" />
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-slate-700">
                <Lightbulb size={14} /> Lifecycle Savings Dashboard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">QUICKET 生命週期節約儀表板</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                比較一體式 LED 與 QUICKET 模組系統在用電、維護、碳排與長期總效益上的差異。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm lg:w-80">
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="text-slate-500">Scenario</div>
              <div className="font-medium text-slate-900">Industrial Bay Light</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="text-slate-500">Period</div>
              <div className="font-medium text-slate-900">{form.years} Years</div>
            </div>
          </div>
        </header>

        {/* Mobile KPI (visible only on mobile) */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:hidden">
          <KpiCard icon={Zap} title="年度節電量" value={`${formatNumber(result.annualKwhSaved)} kWh`} subtitle="Annual Energy Saving" />
          <KpiCard icon={Calculator} title="年度電費節約" value={formatNTD(result.annualElectricitySaved)} subtitle="Annual Electricity Cost Saving" />
          <KpiCard icon={Leaf} title="年度節碳量" value={`${formatNumber(result.annualCarbonSaved / 1000, 1)} t`} subtitle="Annual Carbon Reduction" />
          <KpiCard icon={Factory} title={`${form.years} 年維護節約`} value={formatNTD(result.maintenanceSaved)} subtitle="Maintenance Cost Saving" />
        </div>

        <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Left: Inputs - on mobile this will appear after KPI because DOM order is below mobile KPI block */}
          <aside className="order-2 lg:order-1 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gray-100 p-2 text-slate-700">
                  <Settings size={18} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">專案輸入參數</h2>
                  <p className="text-xs text-slate-500">在此設定專案的基礎條件與假設</p>
                </div>
              </div>
            </div>

            {/* Section 1: 專案基本資料 */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white">
              <button
                className="w-full flex items-center justify-between px-4 py-3 lg:py-4"
                onClick={() => toggleSection('basics')}
                aria-expanded={openSections.basics}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">專案基本資料</div>
                  <div className="text-xs text-slate-500">定義案場規模與試算期間</div>
                </div>
                <div className="text-slate-400 lg:hidden">{openSections.basics ? '收合' : '展開'}</div>
              </button>

              <div className={`${openSections.basics ? 'block' : 'hidden'} px-4 pb-4 lg:block`}> 
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-slate-500">案例預設</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(presets).map((name) => (
                      <button
                        key={name}
                        onClick={() => applyPreset(name)}
                        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-gray-50"
                      >
                        {name}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <Field label="場域類型">
                      <select value={form.siteType} onChange={(e) => set('siteType', e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-slate-900">
                        <option value="factory">工廠</option>
                        <option value="warehouse">倉儲</option>
                        <option value="office">商辦</option>
                        <option value="public">公共空間</option>
                        <option value="outdoor">戶外場域</option>
                      </select>
                    </Field>

                    <Field label="燈具類型">
                      <select value={form.luminaireType} onChange={(e) => set('luminaireType', e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-slate-900">
                        <option value="downlight">崁燈</option>
                        <option value="cylinder">筒燈</option>
                        <option value="bay-light">天井燈</option>
                        <option value="flood-light">投射燈</option>
                        <option value="street-light">路燈</option>
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="燈具數量" suffix="pcs" value={form.quantity} onChange={(value) => set('quantity', value)} />
                      <NumberField label="試算年限" suffix="years" value={form.years} onChange={(value) => set('years', value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 燈具方案比較 */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white">
              <button
                className="w-full flex items-center justify-between px-4 py-3 lg:py-4"
                onClick={() => toggleSection('comparison')}
                aria-expanded={openSections.comparison}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">燈具方案比較</div>
                  <div className="text-xs text-slate-500">比較現有燈具與 QUICKET 模組方案</div>
                </div>
                <div className="text-slate-400 lg:hidden">{openSections.comparison ? '收合' : '展開'}</div>
              </button>

              <div className={`${openSections.comparison ? 'block' : 'hidden'} px-4 pb-4 lg:block`}> 
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="現有瓦數" suffix="W" value={form.currentWatt} onChange={(value) => set('currentWatt', value)} />
                    <NumberField label="QUICKET 瓦數" suffix="W" value={form.quicketWatt} onChange={(value) => set('quicketWatt', value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="現有維護成本" suffix="NTD/次" value={form.currentMaintenanceCost} onChange={(value) => set('currentMaintenanceCost', value)} />
                    <NumberField label="QUICKET 模組成本" suffix="NTD/次" value={form.quicketMaintenanceCost} onChange={(value) => set('quicketMaintenanceCost', value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="現有維護週期" suffix="years" value={form.currentMaintenanceCycle} onChange={(value) => set('currentMaintenanceCycle', value)} />
                    <NumberField label="QUICKET 維護週期" suffix="years" value={form.quicketMaintenanceCycle} onChange={(value) => set('quicketMaintenanceCycle', value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: 使用條件 */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white">
              <button
                className="w-full flex items-center justify-between px-4 py-3 lg:py-4"
                onClick={() => toggleSection('usage')}
                aria-expanded={openSections.usage}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">使用條件</div>
                  <div className="text-xs text-slate-500">設定案場用電與運作條件</div>
                </div>
                <div className="text-slate-400 lg:hidden">{openSections.usage ? '收合' : '展開'}</div>
              </button>

              <div className={`${openSections.usage ? 'block' : 'hidden'} px-4 pb-4 lg:block`}> 
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="每日使用" suffix="hours" value={form.dailyHours} onChange={(value) => set('dailyHours', value)} />
                    <NumberField label="每年使用" suffix="days" value={form.annualDays} onChange={(value) => set('annualDays', value)} />
                  </div>
                  <NumberField label="電價" suffix="NTD/kWh" value={form.electricityPrice} step={0.01} onChange={(value) => set('electricityPrice', value)} />
                </div>
              </div>
            </div>

            {/* Section 4: ESG / 碳排假設 */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white">
              <button
                className="w-full flex items-center justify-between px-4 py-3 lg:py-4"
                onClick={() => toggleSection('esg')}
                aria-expanded={openSections.esg}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">ESG / 碳排假設</div>
                  <div className="text-xs text-slate-500">用於估算碳排與碳價效益</div>
                </div>
                <div className="text-slate-400 lg:hidden">{openSections.esg ? '收合' : '展開'}</div>
              </button>

              <div className={`${openSections.esg ? 'block' : 'hidden'} px-4 pb-4 lg:block`}> 
                <div className="space-y-3 pt-2">
                  <NumberField label="電力碳排係數" suffix="kg/kWh" value={form.carbonFactor} step={0.001} onChange={(value) => set('carbonFactor', value)} />
                  <NumberField label="碳價估算" suffix="NTD / ton" value={form.carbonPrice} onChange={(value) => set('carbonPrice', value)} />
                </div>
              </div>
            </div>

          </aside>

          {/* Right: KPI + Charts */}
          <section className="order-3 lg:order-2 space-y-6">
            {/* Desktop KPI (visible only on lg+) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard icon={Zap} title="年度節電量" value={`${formatNumber(result.annualKwhSaved)} kWh`} subtitle="Annual Energy Saving" />
              <KpiCard icon={Calculator} title="年度電費節約" value={formatNTD(result.annualElectricitySaved)} subtitle="Annual Electricity Cost Saving" />
              <KpiCard icon={Leaf} title="年度節碳量" value={`${formatNumber(result.annualCarbonSaved / 1000, 1)} t`} subtitle="Annual Carbon Reduction" />
              <KpiCard icon={Factory} title={`${form.years} 年維護節約`} value={formatNTD(result.maintenanceSaved)} subtitle="Maintenance Cost Saving" />
              <KpiCard icon={LineChart} title={`${form.years} 年總效益`} value={formatNTD(result.totalSaved)} subtitle="Electricity + Maintenance + Carbon" />
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-4 bg-gray-50 rounded-xl p-1">
                <button onClick={() => setTab('cost')} className={`col-span-1 rounded-lg px-3 py-2 text-sm ${tab === 'cost' ? 'bg-white text-slate-900 border' : 'text-slate-500'}`}>成本比較</button>
                <button onClick={() => setTab('carbon')} className={`col-span-1 rounded-lg px-3 py-2 text-sm ${tab === 'carbon' ? 'bg-white text-slate-900 border' : 'text-slate-500'}`}>節能節碳</button>
                <button onClick={() => setTab('summary')} className={`col-span-1 rounded-lg px-3 py-2 text-sm ${tab === 'summary' ? 'bg-white text-slate-900 border' : 'text-slate-500'}`}>專案摘要</button>
                <button onClick={() => setTab('formula')} className={`col-span-1 rounded-lg px-3 py-2 text-sm ${tab === 'formula' ? 'bg-white text-slate-900 border' : 'text-slate-500'}`}>公式說明</button>
              </div>

              <div className="mt-5 space-y-5">
                {tab === 'cost' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-slate-900">累積電費比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Current LED vs QUICKET</p>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
                              <XAxis dataKey="year" stroke="#64748b" />
                              <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                              <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#ffffff', border: '1px solid #e6edf2', borderRadius: 8 }} />
                              <Legend />
                              <Area type="monotone" dataKey="現有方案電費" stroke="#64748b" fill="#64748b" fillOpacity={0.08} />
                              <Area type="monotone" dataKey="QUICKET電費" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.08} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-slate-900">累積維護成本比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Whole Luminaire Replacement vs Module Replacement</p>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
                              <XAxis dataKey="year" stroke="#64748b" />
                              <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                              <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#ffffff', border: '1px solid #e6edf2', borderRadius: 8 }} />
                              <Legend />
                              <Bar dataKey="現有方案維護" fill="#64748b" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="QUICKET維護" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'carbon' && (
                  <div>
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-slate-900">累積碳排比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Electricity-related carbon emission estimation</p>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf2" />
                              <XAxis dataKey="year" stroke="#64748b" />
                              <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}t`} />
                              <Tooltip formatter={(value) => `${formatNumber(value / 1000, 1)} t CO₂e`} contentStyle={{ background: '#ffffff', border: '1px solid #e6edf2', borderRadius: 8 }} />
                              <Legend />
                              <Area type="monotone" dataKey="現有方案碳排" stroke="#64748b" fill="#64748b" fillOpacity={0.08} />
                              <Area type="monotone" dataKey="QUICKET碳排" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.08} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'summary' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="p-5">
                        <h3 className="mb-4 font-semibold text-slate-900">試算結果摘要</h3>
                        <div className="space-y-3 text-sm text-slate-700">
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-slate-500">現有方案年度用電</span><span>{formatNumber(result.currentAnnualKwh)} kWh</span></div>
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-slate-500">QUICKET 年度用電</span><span>{formatNumber(result.quicketAnnualKwh)} kWh</span></div>
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-slate-500">年度節電</span><span className="text-cyan-700">{formatNumber(result.annualKwhSaved)} kWh</span></div>
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-slate-500">年度電費節約</span><span className="text-cyan-700">{formatNTD(result.annualElectricitySaved)}</span></div>
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-slate-500">{form.years} 年維護節約</span><span className="text-cyan-700">{formatNTD(result.maintenanceSaved)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">估算碳價價值</span><span>{formatNTD(result.carbonValue)}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-100 bg-cyan-50">
                      <div className="p-5">
                        <h3 className="mb-4 font-semibold text-slate-900">客戶溝通重點</h3>
                        <div className="space-y-4 text-sm leading-6 text-slate-700">
                          <p>
                            在相同場域條件下，QUICKET 的價值不只來自節電，而是來自「低瓦數運作、模組化維護、減少整燈更換」所形成的長期效益。
                          </p>
                          <p>
                            對業主而言，這代表更低的年度營運費用；對工程商而言，這代表更容易維護與升級的標準化介面；對 ESG 或財務單位而言，這代表可追蹤、可量化的節碳成果。
                          </p>
                          <div className="rounded-2xl border border-cyan-100 bg-white p-4 text-cyan-700">
                            {form.years} 年估算總效益：<span className="font-semibold">{formatNTD(result.totalSaved)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'formula' && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="mb-3 font-semibold text-slate-900">公式說明 (Formulas)</h3>
                    <div className="text-sm text-slate-700 space-y-2">
                      <div>
                        <strong>年度用電 (kWh)</strong>: 現有方案 = 燈具數量 × 瓦數/1000 × 每日使用 × 每年使用天數
                      </div>
                      <div>
                        <strong>年度節電 (kWh)</strong>: 現有方案年度用電 - QUICKET 年度用電
                      </div>
                      <div>
                        <strong>年度電費節約 (NTD)</strong>: 年度用電差 × 電價
                      </div>
                      <div>
                        <strong>年度碳排 (kg)</strong>: 年度用電 × 碳排係數
                      </div>
                      <div>
                        <strong>維護成本</strong>: 維護次數 = floor(年數 / 維護週期); 維護總成本 = 燈具數量 × 每次維護成本 × 維護次數
                      </div>
                      <div>
                        <strong>估算碳價價值 (NTD)</strong>: (總節碳量(kg) / 1000) × 碳價(NTD/ton)
                      </div>
                      <div>
                        <strong>總效益 (NTD)</strong>: 電費節約累計 + 維護節約 + 估算碳價價值
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
