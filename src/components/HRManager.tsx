import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Users, Shield, DollarSign, Mail, Phone, Calendar, Trash2, Edit2, 
  X, Check, AlertCircle, Briefcase, Award, TrendingUp, HandCoins, UserPlus, Fingerprint
} from 'lucide-react';
import { Employee, ERPConfig } from '../types';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Human Resources & Payroll Office</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit workforce directories, specify technical base wages, and reconcile month-by-month salary distributions.
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Staff directory metrics banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Registered Personnel</p>
          <p className="text-lg font-bold text-slate-850 dark:text-slate-100">{payrollMetrics.totalStaff} Headcount</p>
          <span className="text-[9px] font-bold text-slate-400">{payrollMetrics.activeStaff} Active schedule shifts</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Active Base Payroll</p>
          <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
            {currencySymbol}{payrollMetrics.grossPayrollAmount.toLocaleString()} / mo
          </p>
          <span className="text-[9px] font-bold text-slate-400">Recurring Monthly Liability</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-medium">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Disbursed Salaries ({activeMonth})</p>
          <p className="text-lg font-mono font-bold text-emerald-600">
            {currencySymbol}{payrollMetrics.totalPaidAmountThisMonth.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">{payrollMetrics.paidRecordsThisMonth} / {payrollMetrics.activeStaff} employees settled</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Active Session Actions</p>
          <button 
            type="button" 
            onClick={() => { if(confirm("Bulk settle active payroll for eligible employees?")) onPayAllSalaries(activeMonth); }}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[10px] uppercase tracking-wide flex items-center gap-1 mt-1 transition-transform"
          >
            <HandCoins className="w-3.5 h-3.5" />
            Clear Bulk Payroll
          </button>
        </div>
      </div>

      {/* Slideout Onboarding Form */}
      {isAdding && (
        <form onSubmit={handleAddNewSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4" />
              <span>Provision Employee File & Tax Card</span>
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-450 hover:text-slate-650 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Employee Name *</label>
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
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Corporate Email *</label>
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
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Internal Phone</label>
              <input 
                type="text" 
                placeholder="+1 (555) 012-3456" 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.phone}
                onChange={e => setNewEmp(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Job Title / Role *</label>
              <input 
                type="text" 
                placeholder="Operations Slicing Engineer" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.role}
                onChange={e => setNewEmp(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Department Group *</label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-800 dark:text-white"
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
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Monthly Gross Salary Rate *</label>
              <input 
                type="number" 
                min="100"
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newEmp.salary}
                onChange={e => setNewEmp(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Join Date *</label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-mono font-bold"
                value={newEmp.joinDate}
                onChange={e => setNewEmp(prev => ({ ...prev, joinDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Shift Status *</label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-850 dark:text-white"
                value={newEmp.status}
                onChange={e => setNewEmp(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="Active">On Floor (Active)</option>
                <option value="On_Leave">Temporary On Leave</option>
                <option value="Inactive">Decommissioned (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Sign Contract & Code
            </button>
          </div>
        </form>
      )}

      {/* Directory Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-xs">
        
        {/* Simple Search bar */}
        <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search roster directories by employee name, desk role or corporate email..." 
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter categories dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">Department:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Operations">Operations Floor</option>
              <option value="Sales">Sales Office</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Billing & Accounting</option>
              <option value="Engineering">R&D / Systems Design</option>
              <option value="Quality_Control">Quality Control</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">Schedule:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Shifts</option>
              <option value="Active">Active Floor Schedule</option>
              <option value="On_Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Employee Directory Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xs overflow-hidden scrollbar-thin text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50/70 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3">Personnel Card</th>
                <th className="py-2 px-3">Department Area</th>
                <th className="py-2 px-3">Direct Link Specs</th>
                <th className="py-2 px-3">Hired Range</th>
                <th className="py-2 px-3 text-right">Base Wage Rate</th>
                <th className="py-2 px-3 text-center">Payroll State ({activeMonth})</th>
                <th className="py-2 px-3 text-center">Roster Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {filteredEmployees.map((emp) => {
                const paidThisMonth = emp.paymentHistory.some(pay => pay.month === activeMonth);
                
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    
                    {/* Employee Card Info */}
                    <td className="py-1.5 px-3">
                      <div className="space-y-0.5 max-w-[200px] text-left">
                        <p className="font-bold text-slate-900 dark:text-white uppercase truncate text-[11px]">{emp.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-tight">{emp.role}</p>
                      </div>
                    </td>

                    {/* Department block */}
                    <td className="py-1.5 px-3 text-left">
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        {emp.department.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Quick Contacts */}
                    <td className="py-1.5 px-3 font-mono text-[9px] text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Join date */}
                    <td className="py-1.5 px-3 font-mono font-bold text-left text-slate-500 text-[10px]">
                      {new Date(emp.joinDate).toLocaleDateString()}
                    </td>

                    {/* Base salary */}
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {currencySymbol}{emp.salary.toLocaleString()}/mo
                    </td>

                    {/* Settlement stamp indicator */}
                    <td className="py-1.5 px-3 text-center">
                      {emp.status !== 'Active' ? (
                        <span className="text-[8px] text-slate-450 uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Roster Suspended
                        </span>
                      ) : paidThisMonth ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider rounded border border-emerald-100 dark:border-emerald-900/35 text-[9px]">
                          <Check className="w-3 h-3 text-emerald-500" /> Settled
                        </span>
                      ) : (
                        <button 
                          onClick={() => onPaySalary(emp.id, activeMonth)}
                          className="px-1.5 py-0.5 bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold uppercase tracking-wider rounded text-[9px]"
                        >
                          Disburse
                        </button>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-1.5 px-3 text-center">
                      <button 
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Decommission Staff card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-450 font-bold uppercase tracking-widest bg-slate-50/10">
                    No active employees matching this directory query
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
