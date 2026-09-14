import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaynowService } from '../../services/paynowService';
import { PaynowConfig } from '../../types';

interface PaynowConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: PaynowConfig) => void;
}

export const PaynowConfigModal: React.FC<PaynowConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const currentConfig = PaynowService.getConfig();
  const [integrationId, setIntegrationId] = useState(currentConfig.integrationId || '');
  const [merchantEmail, setMerchantEmail] = useState(currentConfig.merchantEmail || 'gatewaychurchzim@gmail.com');
  const [serverResult, setServerResult] = useState<{ configured: boolean; integrationId?: string; merchantEmail?: string; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIntegrationId(PaynowService.getConfig().integrationId || '');
    setMerchantEmail(PaynowService.getConfig().merchantEmail || 'gatewaychurchzim@gmail.com');
    setServerResult(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestServer = async () => {
    setIsTesting(true);
    setServerResult(null);
    const result = await PaynowService.checkServerConfig();
    setServerResult(result);
    setIsTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = PaynowService.saveConfig({
      integrationId: integrationId.trim(),
      merchantEmail: merchantEmail.trim(),
      isLive: true
    });
    setSaveSuccess(true);
    confetti({ particleCount: 20, spread: 50 });
    onSaved?.(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001122]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#001F3F] border border-[#D4AF37]/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-4 text-white">
        <div className="bg-[#001122] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#001F3F] flex items-center justify-center shadow-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Paynow Zimbabwe Integration</h3>
              <p className="text-xs text-[#D4AF37]/80 mt-0.5">Secure server-side configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#001122]/80 border border-[#D4AF37]/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4" />
              Your Integration Key is protected
            </div>
            <p className="text-white/70 text-[11px] leading-relaxed">
              The Paynow Integration Key must be stored in Vercel Environment Variables. It is no longer saved in the browser or sent from the client, which prevents the secret from being exposed in DevTools.
            </p>
            <a href="https://www.paynow.co.zw" target="_blank" rel="noreferrer" className="text-[11px] text-[#D4AF37] hover:underline inline-flex items-center gap-1 font-semibold">
              Open Paynow <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-white/90 mb-1">Paynow Integration ID</label>
              <input
                type="text"
                value={integrationId}
                onChange={e => setIntegrationId(e.target.value)}
                placeholder="e.g. 18342"
                className="w-full bg-[#001122] border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37] font-mono text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-white/90 mb-1">Merchant Notification Email</label>
              <input
                type="email"
                value={merchantEmail}
                onChange={e => setMerchantEmail(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full bg-[#001122] border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {serverResult && (
            <div className={`p-3 rounded-xl border ${serverResult.configured ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'}`}>
              <div className="flex items-start gap-2">
                {serverResult.configured ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                <div>
                  <p className="font-semibold text-xs">{serverResult.configured ? 'Paynow server credentials are configured.' : 'Paynow server credentials are not configured.'}</p>
                  {serverResult.configured && <p className="text-[10px] opacity-80 mt-1">Integration ID: {serverResult.integrationId}</p>}
                  {serverResult.error && <p className="text-[10px] opacity-80 mt-1">{serverResult.error}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button type="button" onClick={handleTestServer} disabled={isTesting} className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#001122] border border-white/20 hover:border-[#D4AF37] text-white font-semibold flex items-center justify-center gap-1.5">
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5 text-[#D4AF37]" />}
              Test Server Configuration
            </button>
            <button type="submit" disabled={saveSuccess} className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b89428] text-[#001F3F] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              {saveSuccess ? 'Saved' : 'Save Display Settings'}
            </button>
          </div>

          <div className="text-center pt-1 flex items-center justify-center gap-1 text-[10px] text-white/40">
            <ShieldCheck className="w-3 h-3" />
            Integration keys stay server-side.
          </div>
        </form>
      </div>
    </div>
  );
};
