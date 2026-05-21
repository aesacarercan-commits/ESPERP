import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, AlertTriangle, ShieldCheck, Building
} from 'lucide-react';
import { ERPConfig } from '../types';
import { getTranslation, Language } from '../lib/translations';

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

  // Sync state if language or other properties change from parent header selector
  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const currentLang = config.language || 'en';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 text-left animate-in fade-in" id="settings-tab-panel">
      
      {/* Title block */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-500" />
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getTranslation(currentLang, 'erp_system_admin')}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {getTranslation(currentLang, 'reconfigure_rules')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Administrative Form (Left/Center 2-Span Column) */}
        <form onSubmit={handleSettingsSubmit} className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow shadow-xs space-y-5">
          <h4 className="text-xs font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4" />
            <span>{getTranslation(currentLang, 'corporate_identity_specs')}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'enterprise_name')}
              </label>
              <input 
                type="text" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={formData.companyName}
                onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'tax_registry_code')}
              </label>
              <input 
                type="text" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-mono font-bold"
                value={formData.taxNumber}
                onChange={e => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'global_currency')}
              </label>
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
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'invoice_vat')}
              </label>
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

            {/* Language Preference selection input row */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'language_selection')}
              </label>
              <select
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-[#0ea5e9]"
                value={formData.language || 'en'}
                onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as Language }))}
              >
                <option value="en">{getTranslation(currentLang, 'english')}</option>
                <option value="tr">{getTranslation(currentLang, 'turkish')}</option>
              </select>
            </div>

          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
            {isSavedNotice && (
              <span className="text-emerald-600 font-bold self-center mr-2 animate-pulse">
                ✓ {getTranslation(currentLang, 'parameters_locked')}
              </span>
            )}
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/10 flex items-center gap-1.5 transition-transform cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'lock_configurations')}</span>
            </button>
          </div>
        </form>

        {/* Administrative Actions & Data Wipe operations (Right 1-Span Column) */}
        <div className="space-y-6">
          
          {/* Data controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'admin_data_wipe')}</span>
            </h4>
            
            <p className="text-slate-400 leading-relaxed font-bold">
              {getTranslation(currentLang, 'factory_wipe_warning')}
            </p>

            <button 
              type="button" 
              onClick={() => { if(confirm(getTranslation(currentLang, 'confirm_wipe'))) onFactoryReset(); }}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/15 dark:hover:bg-red-955/20 font-black border border-red-100 dark:border-red-950 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{getTranslation(currentLang, 'wipe_and_reload')}</span>
            </button>
          </div>

          {/* Secure status card */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-850 space-y-3 relative overflow-hidden text-xs">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400">
                {getTranslation(currentLang, 'security_audit_logs')}
              </span>
            </div>

            <div className="space-y-1 text-left leading-relaxed">
              <p className="font-bold">{getTranslation(currentLang, 'cryptographic_state')}</p>
              <p className="text-slate-400">{getTranslation(currentLang, 'db_engine')}</p>
              <p className="text-emerald-400 font-bold mt-1 inline-block">● {getTranslation(currentLang, 'production_secured')}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
