import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  Sparkles,
  UserCheck,
  Flame,
  Info,
  Stethoscope,
} from 'lucide-react';

export default function HealthAlerts({ healthEvaluation, userProfile, onOpenProfile }) {
  if (!healthEvaluation) return null;

  const {
    isSafeForUser,
    allergenAlerts = [],
    conditionAlerts = [],
    directAllergensCount = 0,
    traceAllergensCount = 0,
  } = healthEvaluation;

  const hasAllergens = allergenAlerts.length > 0;
  const hasConditionFlags = conditionAlerts.some(
    (c) => c.status === 'FLAGGED' || c.severity === 'CRITICAL' || c.severity === 'WARNING'
  );
  const userHasProfile =
    (userProfile?.allergies?.length || 0) > 0 || (userProfile?.conditions?.length || 0) > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                Feature 2 • Personalized Safety
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">Personalized Health, Disease & Allergy Alerts</h3>
          </div>
        </div>

        {/* Profile Status indicator */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Active Profile</span>
          <span className="font-bold text-emerald-400">
            ({userProfile?.allergies?.length || 0} Allergies, {userProfile?.conditions?.length || 0} Conditions)
          </span>
        </button>
      </div>

      {/* No Profile Warning Banner */}
      {!userHasProfile && (
        <div className="mt-4 p-3.5 bg-sky-950/30 border border-sky-500/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-sky-300">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>You haven't set your health profile yet. Showing all detected allergens and nutritional markers.</span>
          </div>
          <button
            onClick={onOpenProfile}
            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold shrink-0 transition"
          >
            Set Profile
          </button>
        </div>
      )}

      {/* 100% Safe Affirmative State */}
      {isSafeForUser && userHasProfile && !hasAllergens && !hasConditionFlags && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm">All-Clear: Safe for Your Configured Health Profile</div>
            <div className="text-xs text-emerald-400/90 mt-0.5">
              No matching allergens or contraindicated medical ingredients detected in the product.
            </div>
          </div>
        </div>
      )}

      {/* Consolidated Allergen Alerts */}
      {hasAllergens && (
        <div className="mt-4 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Triggered Allergen Flags ({allergenAlerts.length}):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allergenAlerts.map((alert, idx) => {
              const isDirect = alert.type === 'DIRECT';
              const isGroundnutPeanut =
                alert.allergen === 'peanut' &&
                (alert.triggeredBy?.toLowerCase().includes('groundnut') ||
                  alert.triggeredBy?.toLowerCase().includes('arachis'));

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition ${
                    isDirect
                      ? 'bg-rose-950/40 border-rose-500/40 shadow-lg shadow-rose-950/30'
                      : 'bg-amber-950/30 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDirect ? (
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span
                        className={`font-black text-xs uppercase tracking-wide ${
                          isDirect ? 'text-rose-300' : 'text-amber-300'
                        }`}
                      >
                        {alert.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        isDirect
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isDirect ? 'Direct Ingredient' : 'Trace / Facility'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-200">
                    <span className="text-slate-400">Detected in Label: </span>
                    <span className="font-semibold text-white font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                      "{alert.triggeredBy}"
                    </span>
                  </div>

                  {isGroundnutPeanut && (
                    <div className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded border border-amber-500/20 flex items-start space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> "Groundnut" (Mungfali) is the standard Indian term for Peanut (
                        <em>Arachis hypogaea</em>).
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 mt-1">{alert.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Conditions & Diseases Alerts */}
      {conditionAlerts.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Medical Disease & Health Threshold Checks ({conditionAlerts.length}):</span>
            <span className="text-[10px] text-slate-500 font-normal">Customized to your health profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditionAlerts.map((cond, idx) => {
              const isFlagged =
                cond.status === 'FLAGGED' || cond.severity === 'CRITICAL' || cond.severity === 'WARNING';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${
                    isFlagged
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs capitalize text-slate-200 flex items-center space-x-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cond.conditionName || cond.condition} Check</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        isFlagged
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {cond.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">{cond.metric}:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isFlagged ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {cond.value}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{cond.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
