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
    <label className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-300">
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
        className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 placeholder:text-slate-600"
      />
    </Field>
  )
}

function KpiCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/20">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300">
            <Icon size={20} />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">QUICKET</span>
        </div>
        <div className="text-sm text-slate-400">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
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
        年度: year,
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 p-6 shadow-2xl shadow-slate-950/40 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <img src="/assets/quicket-logo.png" alt="QUICKET" className="h-12 w-auto rounded-md object-contain shadow-md" />
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Lightbulb size={14} /> Lifecycle Savings Dashboard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">QUICKET 生命週期節約儀表板</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                比較一體式 LED 與 QUICKET 模組系統在用電、維護、碳排與長期總效益上的差異。預設值使用工業場域案例，適合業主、工程商與 ESG 顧問快速評估。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm lg:w-80">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
              <div className="text-slate-500">Scenario</div>
              <div className="font-medium text-slate-100">Industrial Bay Light</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
              <div className="text-slate-500">Period</div>
              <div className="font-medium text-slate-100">{form.years} Years</div>
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
            <div className="mb-5 flex items-center gap-2">
              <div className="rounded-2xl bg-slate-800 p-2 text-cyan-300">
                <Settings size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-white">專案輸入條件</h2>
                <p className="text-xs text-slate-500">Project Parameters</p>
              </div>
            </div>

            <div className="grid gap-4">
              <Field label="場域類型">
                <select value={form.siteType} onChange={(e) => set('siteType', e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100">
                  <option value="factory">工廠</option>
                  <option value="warehouse">倉儲</option>
                  <option value="office">商辦</option>
                  <option value="public">公共空間</option>
                  <option value="outdoor">戶外場域</option>
                </select>
              </Field>

              <Field label="燈具類型">
                <select value={form.luminaireType} onChange={(e) => set('luminaireType', e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100">
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

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="現有瓦數" suffix="W" value={form.currentWatt} onChange={(value) => set('currentWatt', value)} />
                <NumberField label="QUICKET 瓦數" suffix="W" value={form.quicketWatt} onChange={(value) => set('quicketWatt', value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="每日使用" suffix="hours" value={form.dailyHours} onChange={(value) => set('dailyHours', value)} />
                <NumberField label="每年使用" suffix="days" value={form.annualDays} onChange={(value) => set('annualDays', value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="電價" suffix="NTD/kWh" value={form.electricityPrice} step={0.01} onChange={(value) => set('electricityPrice', value)} />
                <NumberField label="碳排係數" suffix="kg/kWh" value={form.carbonFactor} step={0.001} onChange={(value) => set('carbonFactor', value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="現有維護成本" suffix="NTD/次" value={form.currentMaintenanceCost} onChange={(value) => set('currentMaintenanceCost', value)} />
                <NumberField label="QUICKET 模組成本" suffix="NTD/次" value={form.quicketMaintenanceCost} onChange={(value) => set('quicketMaintenanceCost', value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="現有維護週期" suffix="years" value={form.currentMaintenanceCycle} onChange={(value) => set('currentMaintenanceCycle', value)} />
                <NumberField label="QUICKET 維護週期" suffix="years" value={form.quicketMaintenanceCycle} onChange={(value) => set('quicketMaintenanceCycle', value)} />
              </div>

              <NumberField label="碳價估算" suffix="NTD / ton" value={form.carbonPrice} onChange={(value) => set('carbonPrice', value)} />

              <button className="mt-2 w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400">產生專案摘要</button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                icon={Zap}
                title="年度節電量"
                value={`${formatNumber(result.annualKwhSaved)} kWh`}
                subtitle="Annual Energy Saving"
              />
              <KpiCard
                icon={Calculator}
                title="年度電費節約"
                value={formatNTD(result.annualElectricitySaved)}
                subtitle="Annual Electricity Cost Saving"
              />
              <KpiCard
                icon={Leaf}
                title="年度節碳量"
                value={`${formatNumber(result.annualCarbonSaved / 1000, 1)} t`}
                subtitle="Annual Carbon Reduction"
              />
              <KpiCard
                icon={Factory}
                title={`${form.years} 年維護節約`}
                value={formatNTD(result.maintenanceSaved)}
                subtitle="Maintenance Cost Saving"
              />
              <KpiCard
                icon={LineChart}
                title={`${form.years} 年總效益`}
                value={formatNTD(result.totalSaved)}
                subtitle="Electricity + Maintenance + Carbon"
              />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30">
              <div className="grid grid-cols-3 bg-slate-950/80 rounded-xl p-1">
                <button onClick={() => setTab('cost')} className={`rounded-lg px-3 py-2 text-sm ${tab === 'cost' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}>成本比較</button>
                <button onClick={() => setTab('carbon')} className={`rounded-lg px-3 py-2 text-sm ${tab === 'carbon' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}>節能節碳</button>
                <button onClick={() => setTab('summary')} className={`rounded-lg px-3 py-2 text-sm ${tab === 'summary' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}>專案摘要</button>
              </div>

              <div className="mt-5 space-y-5">
                {tab === 'cost' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-white">累積電費比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Current LED vs QUICKET</p>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="year" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                              <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 12 }} />
                              <Legend />
                              <Area type="monotone" dataKey="現有方案電費" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.16} />
                              <Area type="monotone" dataKey="QUICKET電費" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.16} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-white">累積維護成本比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Whole Luminaire Replacement vs Module Replacement</p>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="year" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                              <Tooltip formatter={(value) => formatNTD(value)} contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 12 }} />
                              <Legend />
                              <Bar dataKey="現有方案維護" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="QUICKET維護" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'carbon' && (
                  <div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="p-5">
                        <h3 className="mb-1 font-semibold text-white">累積碳排比較</h3>
                        <p className="mb-4 text-xs text-slate-500">Electricity-related carbon emission estimation</p>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.yearlyRows}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="year" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(value / 1000)}t`} />
                              <Tooltip formatter={(value) => `${formatNumber(value / 1000, 1)} t CO₂e`} contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 12 }} />
                              <Legend />
                              <Area type="monotone" dataKey="現有方案碳排" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.16} />
                              <Area type="monotone" dataKey="QUICKET碳排" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.16} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'summary' && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="p-5">
                        <h3 className="mb-4 font-semibold text-white">試算結果摘要</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">現有方案年度用電</span><span>{formatNumber(result.currentAn...</div>
                          <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">QUICKET 年度用電</span><span>{formatNumber(result.quicketAnnual...}</div>
                          <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">年度節電</span><span className="text-cyan-300">{formatNumber(re...}</div>
                          <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">年度電費節約</span><span className="text-cyan-300">{formatNTD(...}</div>
                          <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">{form.years} 年維護節約</span><span className="text-cyan-300">{formatNTD(...}</div>
                          <div className="flex justify-between"><span className="text-slate-400">估算碳價價值</span><span>{formatNTD(result.carbonValue)}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20">
                      <div className="p-5">
                        <h3 className="mb-4 font-semibold text-white">客戶溝通重點</h3>
                        <div className="space-y-4 text-sm leading-6 text-slate-300">
                          <p>
                            在相同場域條件下，QUICKET 的價值不只來自節電，而是來自「低瓦數運作、模組化維護、減少整燈更換」所形成的長期效益。
                          </p>
                          <p>
                            對業主而言，這代表更低的年度營運費用；對工程商而言，這代表更容易維護與升級的標準化介面；對 ESG 或財務單位而言，這[...]
                          </p>
                          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-4 text-cyan-100">
                            {form.years} 年估算總效益：<span className="font-semibold">{formatNTD(result.totalSaved)}</span>
                          </div>
                        </div>
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
