import { TUNABLES, resetConfig, isDefault } from '../lib/config'

// The live calibration surface. Every slider writes straight through to the
// config (persisted in localStorage), so Warren can tune between students and
// re-run immediately — no code, no reload needed.
export default function CalibrationPanel({ config, onChange }) {
  const set = (key, value) => onChange({ ...config, [key]: value })

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-gray-800">🔧 Calibrate</h3>
        <button
          onClick={() => onChange(resetConfig())}
          disabled={isDefault(config)}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Tune how the check-up adapts, then start. Changes are saved on this device.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {TUNABLES.map((t) => (
          <div key={t.key}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">{t.label}</label>
              <span className="text-xs font-bold text-cyan-600">{t.fmt(config[t.key])}</span>
            </div>
            <input
              type="range"
              min={t.min}
              max={t.max}
              step={t.step}
              value={config[t.key]}
              onChange={(e) => set(t.key, Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-gray-400 leading-tight">{t.help}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
