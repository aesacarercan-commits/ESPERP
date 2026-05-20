import React, { useState } from 'react';
import { 
  Settings, Save, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, Building, DollarSign
} from 'lucide-react';
import { ERPConfig } from '../types';

interface SettingsManagerProps {
  config: ERPConfig;
  onUpdateConfig: (config: ERPConfig) => void;
  onFactoryReset: () => void;
}

export default function SettingsManager({
  config,
  onUpdateConfig,
  onFactoryReset
}: SettingsManagerProps) {
  const [formData, setFormData] = useState<ERPConfig>({ ...config });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 text-left animate-in fade-in" id="settings-tab-panel">
      
      {/* Title block */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ERP System Administration</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reconfigure administrative rules, active bookkeeping values tax thresholds, or wipe system state catalogs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Administrative Form (Left/Center 2-Span Column) */}
        <form onSubmit={handleSettingsSubmit} className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4" />
            <span>Corporate Identity Specs</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Enterprise Profile Name *</label>
              <input 
                type="text" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={formData.companyName}
                onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Tax Registry / Account Code *</label>
              <input 
                type="text" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-mono font-bold"
                value={formData.taxNumber}
                onChange={e => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Global Bookkeeping Currency *</label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-800 dark:text-white"
                value={formData.currency}
                onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
              >
                <option value="USD">USD ($) -- United States Dollar</option>
                <option value="EUR">EUR (€) -- Euro Area</option>
                <option value="TRY">TRY (₺) -- Turkish Lira</option>
                <option value="GBP">GBP (£) -- Great Britain Pound</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Estimated Corporate Invoice VAT Tax (%) *</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-mono font-bold"
                value={formData.taxRate}
                onChange={e => setFormData(prev => ({ ...prev, taxRate: parseInt(e.target.value) || 0 }))}
              />
            </div>

          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs border-t border-slate-100 dark:border-slate-820">
            {isSavedNotice && (
              <span className="text-emerald-600 font-bold self-center mr-2 animate-pulse">
                ✓ Parameters locked successfully
              </span>
            )}
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/10 flex items-center gap-1.5 transition-transform"
            >
              <Save className="w-4 h-4" />
              <span>Lock Configurations</span>
            </button>
          </div>
        </form>

        {/* Administrative Actions & Data Wipe operations (Right 1-Span Column) */}
        <div className="space-y-6">
          
          {/* Data controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Admin Data Wipe Out</span>
            </h4>
            
            <p className="text-slate-400 leading-relaxed font-bold">
              Factory Wipe resets active warehouse stock levels, commerce receipt invoices, floor rosters, and operational paths back to initial preloaded demo defaults.
            </p>

            <button 
              type="button" 
              onClick={() => { if(confirm("Discard all active database parameters and reset demo templates?")) onFactoryReset(); }}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/15 dark:hover:bg-red-955/20 font-black border border-red-100 dark:border-red-950 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Wipe out and Reload Demo Data</span>
            </button>
          </div>

          {/* Secure status card */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-850 space-y-3 relative overflow-hidden text-xs">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-505 bg-indigo-600/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Security Audit Logs</span>
            </div>

            <div className="space-y-1 text-left leading-relaxed">
              <p className="font-bold">Cryptographic Active State: SSL/TLS</p>
              <p className="text-slate-400">Database Engine: Synchronized Local Storage Stasis Cache</p>
              <p className="text-emerald-400 font-bold mt-1 inline-block">● Production System Secured</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
