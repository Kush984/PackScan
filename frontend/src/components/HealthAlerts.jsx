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
    <div className="bg-white border border-[#e7e0d6] rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e7e0d6]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c]">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#be123c]">
                Personalized Safety Dossier
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2a2622] font-['Space_Grotesk']">
              Personalized Health, Disease & Allergy Alerts
            </h3>
          </div>
        </div>

        {/* Profile Status indicator */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#f7f4ee] border border-[#e7e0d6] text-xs text-[#2a2622] transition cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#b8532f]" />
          <span className="hidden sm:inline">Active Profile</span>
          <span className="font-bold text-[#b8532f]">
            ({userProfile?.allergies?.length || 0} Allergies, {userProfile?.conditions?.length || 0} Conditions)
          </span>
        </button>
      </div>

      {/* No Profile Warning Banner */}
      {!userHasProfile && (
        <div className="mt-4 p-3.5 bg-[#fef3c7] border border-[#fde68a] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[#92400e]">
            <Info className="w-4 h-4 text-[#c99a3e] shrink-0" />
            <span>You haven't set your health profile yet. Showing all detected allergens and nutritional markers.</span>
          </div>
          <button
            onClick={onOpenProfile}
            className="px-3 py-1 bg-[#c99a3e] hover:bg-[#b58830] text-white rounded-lg font-semibold shrink-0 transition cursor-pointer"
          >
            Set Profile
          </button>
        </div>
      )}

      {/* 100% Safe Affirmative State */}
      {isSafeForUser && userHasProfile && !hasAllergens && !hasConditionFlags && (
        <div className="mt-4 p-4 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] flex items-center space-x-3 text-[#2a2622]">
          <CheckCircle2 className="w-6 h-6 text-[#c99a3e] shrink-0" />
          <div>
            <div className="font-bold text-sm text-[#2a2622] font-['Space_Grotesk']">
              All-Clear: Safe for Your Configured Health Profile
            </div>
            <div className="text-xs text-[#57534e] mt-0.5">
              No matching allergens or contraindicated medical ingredients detected in the product.
            </div>
          </div>
        </div>
      )}

      {/* Consolidated Allergen Alerts */}
      {hasAllergens && (
        <div className="mt-4 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
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
                      ? 'bg-[#fff1f2] border-[#fecdd3]'
                      : 'bg-[#fef3c7] border-[#fde68a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDirect ? (
                        <AlertOctagon className="w-4 h-4 text-[#be123c] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#c99a3e] shrink-0" />
                      )}
                      <span
                        className={`font-bold text-xs uppercase tracking-wide ${
                          isDirect ? 'text-[#9f1239]' : 'text-[#92400e]'
                        }`}
                      >
                        {alert.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        isDirect
                          ? 'bg-white text-[#be123c] border border-[#fecdd3]'
                          : 'bg-white text-[#c99a3e] border border-[#fde68a]'
                      }`}
                    >
                      {isDirect ? 'Direct Ingredient' : 'Trace / Facility'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-[#2a2622]">
                    <span className="text-[#78716c]">Detected in Label: </span>
                    <span className="font-semibold text-[#2a2622] font-mono bg-white px-1.5 py-0.5 rounded border border-[#e7e0d6]">
                      "{alert.triggeredBy}"
                    </span>
                  </div>

                  {isGroundnutPeanut && (
                    <div className="mt-1.5 text-[11px] text-[#92400e] bg-white p-1.5 rounded border border-[#fde68a] flex items-start space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-[#c99a3e] shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> "Groundnut" (Mungfali) is the standard Indian term for Peanut (
                        <em>Arachis hypogaea</em>).
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-[#57534e] mt-1">{alert.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Conditions & Diseases Alerts */}
      {conditionAlerts.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#78716c] flex items-center justify-between">
            <span>Medical Disease & Health Threshold Checks ({conditionAlerts.length}):</span>
            <span className="text-[10px] text-[#a8a29e] font-normal">Customized to your health profile</span>
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
                      ? 'bg-[#fff1f2] border-[#fecdd3]'
                      : 'bg-[#faf7f2] border-[#e7e0d6] text-[#2a2622]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs capitalize text-[#2a2622] flex items-center space-x-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#b8532f]" />
                      <span>{cond.conditionName || cond.condition} Check</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        isFlagged
                          ? 'bg-white text-[#be123c] border border-[#fecdd3]'
                          : 'bg-white text-[#c99a3e] border border-[#e7e0d6]'
                      }`}
                    >
                      {cond.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between bg-white p-2 rounded-lg border border-[#e7e0d6]">
                    <span className="text-[11px] text-[#78716c]">{cond.metric}:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isFlagged ? 'text-[#be123c]' : 'text-[#c99a3e]'
                      }`}
                    >
                      {cond.value}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#57534e] mt-2 leading-relaxed">{cond.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
