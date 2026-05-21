import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Users, Shield, DollarSign, Mail, Phone, Calendar, Trash2, Edit2, 
  X, Check, Briefcase, Award, TrendingUp, HandCoins, UserPlus, Fingerprint
} from 'lucide-react';
import { Employee, ERPConfig } from '../types';
import { getTranslation, Language } from '../lib/translations';

interface HRManagerProps {
  employees: Employee[];
  config: ERPConfig;
  onAddEmployee: (emp: Omit<Employee, 'id' | 'paymentHistory'>) => void;
  onPaySalary: (empId: string, month: string) => void;
  onPayAllSalaries: (month: string) => void;
  onDeleteEmployee: (empId: string) => void;
}

export default function HRManager({
  employees,
  config,
  onAddEmployee,
  onPaySalary,
  onPayAllSalaries,
  onDeleteEmployee
}: HRManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);

  const currentLang = config.language || 'en';

  // Form parameters
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Operations' as Employee['department'],
    salary: 3000,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active' as Employee['status']
  });

  const activeMonth = '2026-05'; // ERP current system month

  // Submit action
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.email.trim()) return;
    onAddEmployee(newEmp);
    setIsAdding(false);
    
    // Reset values
    setNewEmp({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: 'Operations',
      salary: 3000,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  // Staff analysis
  const payrollMetrics = useMemo(() => {
    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.status === 'Active').length;
    const grossPayrollAmount = employees.reduce((acc, e) => acc + (e.status === 'Active' ? e.salary : 0), 0);
    
    const paidRecordsThisMonth = employees.filter(e => 
      e.paymentHistory.some(pay => pay.month === activeMonth)
    ).length;

    const totalPaidAmountThisMonth = employees.reduce((acc, e) => {
      const payRecord = e.paymentHistory.find(pay => pay.month === activeMonth);
      return acc + (payRecord ? payRecord.amount : 0);
    }, 0);

    return { totalStaff, activeStaff, grossPayrollAmount, paidRecordsThisMonth, totalPaidAmountThisMonth };
  }, [employees, activeMonth]);

  // Filter lists
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || e.department === selectedDept;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const currencySymbol = config.currency === 'USD' ? '$' : config.currency === 'EUR' ? '€' : config.currency === 'TRY' ? '₺' : '£';

  return (
    <div className="space-y-6 pt-2 text-left" id="hr-tab-panel">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs animate-in fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getTranslation(currentLang, 'hr_payroll_office')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getTranslation(currentLang, 'hr_payroll_descr')}
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{getTranslation(currentLang, 'onboard_employee')}</span>
        </button>
      </div>

      {/* Staff directory metrics banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
            {getTranslation(currentLang, 'registered_personnel')}
          </p>
          <p className="text-lg font-bold text-slate-850 dark:text-slate-100">{payrollMetrics.totalStaff} {currentLang === 'tr' ? 'Kişi' : 'Headcount'}</p>
          <span className="text-[9px] font-bold text-slate-400">{payrollMetrics.activeStaff} {currentLang === 'tr' ? 'Aktif Vardiya' : 'Active schedule shifts'}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
            {getTranslation(currentLang, 'active_base_payroll')}
          </p>
          <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
            {currencySymbol}{payrollMetrics.grossPayrollAmount.toLocaleString()} / mo
          </p>
          <span className="text-[9px] font-bold text-slate-400">{currentLang === 'tr' ? 'Tekrarlayan Aylık Maaş Yükü' : 'Recurring Monthly Liability'}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-medium">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
            {currentLang === 'tr' ? 'Ödenen Maaşlar' : 'Disbursed Salaries'} ({activeMonth})
          </p>
          <p className="text-lg font-mono font-bold text-emerald-600">
            {currencySymbol}{payrollMetrics.totalPaidAmountThisMonth.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">
            {currentLang === 'tr' ? `${payrollMetrics.paidRecordsThisMonth} / ${payrollMetrics.activeStaff} çalışan ödendi` : `${payrollMetrics.paidRecordsThisMonth} / ${payrollMetrics.activeStaff} employees settled`}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'actions')}</p>
          <button 
            type="button" 
            onClick={() => { if(confirm(currentLang === 'tr' ? "Tüm aktif çalışanlar için maaş ödemelerini toplu olarak gerçekleştirmek istiyor musunuz?" : "Bulk settle active payroll for eligible employees?")) onPayAllSalaries(activeMonth); }}
            className="px-2.5 py-1.5 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wide flex items-center gap-1 mt-1 transition-transform cursor-pointer"
          >
            <HandCoins className="w-3.5 h-3.5" />
            {currentLang === 'tr' ? 'Maaşları Toplu Öde' : 'Clear Bulk Payroll'}
          </button>
        </div>
      </div>

      {/* Slideout Onboarding Form */}
      {isAdding && (
        <form onSubmit={handleAddNewSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'provision_tax_card')}</span>
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-450 hover:text-slate-650 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Çalışan Adı Soyadı' : 'Employee Name'} *
              </label>
              <input 
                type="text" 
                placeholder="Charlotte Winters" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={newEmp.name}
                onChange={e => setNewEmp(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Kurumsal E-posta' : 'Corporate Email'} *
              </label>
              <input 
                type="email" 
                placeholder="c.winters@enterprise-erp.com" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.email}
                onChange={e => setNewEmp(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Dahili Telefon' : 'Internal Phone'}
              </label>
              <input 
                type="text" 
                placeholder="+1 (555) 012-3456" 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.phone}
                onChange={e => setNewEmp(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Görev / Unvan' : 'Job Title / Role'} *
              </label>
              <input 
                type="text" 
                placeholder="Operations Slicing Engineer" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.role}
                onChange={e => setNewEmp(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Departman' : 'Department Group'} *
              </label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-800 dark:text-white"
                value={newEmp.department}
                onChange={e => setNewEmp(prev => ({ ...prev, department: e.target.value as any }))}
              >
                <option value="Operations">Operations Floor</option>
                <option value="Sales">Sales Office</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Billing & Accounting</option>
                <option value="Engineering">R&D / Systems Design</option>
                <option value="Quality_Control">Quality Control</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Net Maaş (Aylık)' : 'Monthly Gross Salary Rate'} *
              </label>
              <input 
                type="number" 
                min="100"
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.salary}
                onChange={e => setNewEmp(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Giriş Tarihi' : 'Join Date'} *
              </label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-707 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-mono font-bold"
                value={newEmp.joinDate}
                onChange={e => setNewEmp(prev => ({ ...prev, joinDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs font-semibold">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              {getTranslation(currentLang, 'cancel')}
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 rounded-xl cursor-pointer"
            >
              {getTranslation(currentLang, 'publish_sku')}
            </button>
          </div>
        </form>
      )}

      {/* Directory Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-xs animate-in fade-in">
        
        {/* Simple Search bar */}
        <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder={currentLang === 'tr' ? 'Personel dosyalarında arama yapın (isim, unvan)...' : 'Search directory by name, office email, or role...'}
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter categories dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">{currentLang === 'tr' ? 'Departman' : 'Dept Group'}:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="All">{getTranslation(currentLang, 'all')}</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Engineering">Engineering</option>
              <option value="Quality_Control">Quality Control</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">{currentLang === 'tr' ? 'Statü' : 'Status'}:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">{getTranslation(currentLang, 'all_ranges')}</option>
              <option value="Active">{currentLang === 'tr' ? 'Aktif' : 'Active'}</option>
              <option value="On_Leave">{currentLang === 'tr' ? 'İzinli' : 'On Leave'}</option>
              <option value="Inactive">{currentLang === 'tr' ? 'Pasif' : 'Inactive'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* HR Directory Cards List (Robust, responsive multi-column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isPaidThisMonth = emp.paymentHistory.some(p => p.month === activeMonth);

          return (
            <div 
              key={emp.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-4.5 text-left relative overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              
              <div className="space-y-3.5">
                {/* Header credentials */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase">{emp.name}</h4>
                    <p className="text-[10px] text-slate-450 uppercase font-extrabold flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-sky-500" />
                      <span>{emp.role}</span>
                    </p>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    emp.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : emp.status === 'On_Leave'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-slate-55 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {emp.status === 'Active' ? (currentLang === 'tr' ? 'Aktif' : 'Active') : emp.status === 'On_Leave' ? (currentLang === 'tr' ? 'İzinli' : 'On Leave') : (currentLang === 'tr' ? 'Pasif' : 'Inactive')}
                  </span>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 gap-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3 text-[#0ea5e9]" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#0ea5e9]" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#0ea5e9]" />
                    <span>{currentLang === 'tr' ? 'Katılım: ' : 'Join: '}{emp.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 mt-1 font-bold text-slate-700 dark:text-slate-350">
                    <Award className="w-3 h-3 text-indigo-400" />
                    <span>Dept: {emp.department}</span>
                  </div>
                </div>
              </div>

              {/* Salary Actions Footer Section */}
              <div className="pt-3 border-t border-slate-150 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold gap-3">
                <div className="text-left">
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold leading-none">{currentLang === 'tr' ? 'MAAŞ ORANI' : 'BASE WAGE RATE'}</p>
                  <p className="text-sm font-mono font-extrabold text-slate-850 dark:text-white mt-0.5">
                    {currencySymbol}{emp.salary.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {emp.status === 'Active' && (
                    <button 
                      type="button" 
                      disabled={isPaidThisMonth}
                      onClick={() => onPaySalary(emp.id, activeMonth)}
                      className={`px-3 py-1.5 rounded-lg text-[9.5px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        isPaidThisMonth 
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' 
                          : 'bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 hover:shadow-xs'
                      }`}
                    >
                      {isPaidThisMonth ? <Check className="w-3 h-3 text-emerald-500" /> : <DollarSign className="w-3 h-3" />}
                      <span>{isPaidThisMonth ? (currentLang === 'tr' ? 'Ödendi' : 'Disbursed') : (currentLang === 'tr' ? 'Maaşı Öde' : 'Pay Salary')}</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onDeleteEmployee(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    title={currentLang === 'tr' ? "İlişiğini Kes" : "Terminate Contract"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            {currentLang === 'tr' ? 'Belirtilen departmanda veya kriterde çalışan bulunamadı' : 'No employee files match this search query'}
          </div>
        )}
      </div>

    </div>
  );
}
