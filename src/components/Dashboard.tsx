import React, { useMemo } from 'react';
import { 
  TrendingUp, Box, Layers, Cpu, AlertTriangle, CheckCircle2, DollarSign, Users, Clock, 
  ArrowRight, MessageSquare, Award, ArrowUpRight, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';
import { Product, Invoice, WorkOrder, Employee, ERPConfig } from '../types';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
  workOrders: WorkOrder[];
  employees: Employee[];
  config: ERPConfig;
  setActiveTab: (tab: string) => void;
  triggerSupplierReorder: (productId: string) => void;
}

export default function Dashboard({
  products,
  invoices,
  workOrders,
  employees,
  config,
  setActiveTab,
  triggerSupplierReorder
}: DashboardProps) {

  // Financial Metrics
  const financials = useMemo(() => {
    let salesTotal = 0;
    let pendingInvoices = 0;
    let unpaidTotal = 0;

    invoices.forEach(inv => {
      if (inv.status === 'Paid') {
        salesTotal += inv.totalAmount;
      } else if (inv.status === 'Pending' || inv.status === 'Shipped') {
        unpaidTotal += inv.totalAmount;
        pendingInvoices++;
      }
    });

    const stockAssetValue = products.reduce((acc, p) => acc + (p.qty * p.purchasePrice), 0);
    const stockPotentValue = products.reduce((acc, p) => acc + (p.qty * p.salesPrice), 0);

    return {
      salesTotal,
      pendingInvoices,
      unpaidTotal,
      stockAssetValue,
      stockPotentValue
    };
  }, [invoices, products]);

  // Inventory Alerts
  const stockAlerts = useMemo(() => {
    const lowStock = products.filter(p => p.qty > 0 && p.qty <= p.minQty);
    const outOfStock = products.filter(p => p.qty === 0);
    return { lowStock, outOfStock };
  }, [products]);

  // Work order schedules
  const manufacturingStats = useMemo(() => {
    const total = workOrders.length;
    const completed = workOrders.filter(w => w.status === 'Completed').length;
    const inProgress = workOrders.filter(w => w.status === 'In_Progress').length;
    const scheduled = workOrders.filter(w => w.status === 'Scheduled').length;
    const onHold = workOrders.filter(w => w.status === 'On_Hold').length;
    
    // Calculate overall work order completion percentages
    const totalStepsPossible = workOrders.reduce((acc, w) => acc + w.steps.length, 0);
    const completedSteps = workOrders.reduce((acc, w) => {
      return acc + w.steps.filter(s => s.status === 'Completed').length;
    }, 0);
    const stepCompletionPercentage = totalStepsPossible > 0 ? Math.round((completedSteps / totalStepsPossible) * 100) : 0;

    // Overdue work orders (targetDate < today & status !== Completed)
    const today = new Date().toISOString().split('T')[0];
    const overdueOrders = workOrders.filter(w => w.targetDate < today && w.status !== 'Completed');

    return {
      total,
      completed,
      inProgress,
      scheduled,
      onHold,
      stepCompletionPercentage,
      overdueOrders
    };
  }, [workOrders]);

  // HR Statistics
  const hrStats = useMemo(() => {
    const activeStaff = employees.filter(e => e.status === 'Active').length;
    const totalPayroll = employees.reduce((acc, e) => acc + (e.status === 'Active' ? e.salary : 0), 0);
    return { activeStaff, totalPayroll };
  }, [employees]);

  // Quick Action Notices Stream
  const notices = useMemo(() => {
    const list: { id: string; type: 'danger' | 'warning' | 'info' | 'success'; text: string; actionText: string; actionTab: string; metadata?: any }[] = [];

    // 1. Stock notice
    if (stockAlerts.outOfStock.length > 0) {
      list.push({
        id: 'notice-out',
        type: 'danger',
        text: `${stockAlerts.outOfStock.length} critical raw materials are currently completely Out of Stock!`,
        actionText: 'Restock Items',
        actionTab: 'inventory'
      });
    }

    // 2. Overdue manufacturing jobs
    if (manufacturingStats.overdueOrders.length > 0) {
      list.push({
        id: 'notice-mfr-overdue',
        type: 'danger',
        text: `${manufacturingStats.overdueOrders.length} active work orders missed their planned completion target and are overdue.`,
        actionText: 'Reschedule Work',
        actionTab: 'manufacturing'
      });
    }

    // 3. Low stock alerts
    if (stockAlerts.lowStock.length > 0) {
      list.push({
        id: 'notice-low',
        type: 'warning',
        text: `${stockAlerts.lowStock.length} items have fallen below safety inventory threshholds.`,
        actionText: 'Review Stock',
        actionTab: 'inventory'
      });
    }

    // 4. Invoices pending action
    if (financials.pendingInvoices > 0) {
      list.push({
        id: 'notice-fin-pending',
        type: 'info',
        text: `${financials.pendingInvoices} client invoices are awaiting full payment validation (${config.currency} ${financials.unpaidTotal.toLocaleString()}).`,
        actionText: 'Invoicing Ledger',
        actionTab: 'sales'
      });
    }

    // Default positive backup
    if (list.length === 0) {
      list.push({
        id: 'notice-all-clear',
        type: 'success',
        text: 'All operational lines are reporting normal status logs. Active sync state secured.',
        actionText: 'View Work Orders',
        actionTab: 'manufacturing'
      });
    }

    return list;
  }, [stockAlerts, manufacturingStats, financials, config]);

  // Currency utility
  const formatCur = (amount: number) => {
    const symbol = config.currency === 'USD' ? '$' : config.currency === 'EUR' ? '€' : config.currency === 'TRY' ? '₺' : '£';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-4 pt-1 text-left" id="dashboard-tab-panel">
      {/* High Density System Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0f172a] border border-[#1e293b] p-3.5 rounded-lg text-slate-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-1.5 bg-sky-500/10 w-fit px-2 py-0.5 rounded text-[#38bdf8] border border-sky-500/20 text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Operational Center Active</span>
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">{config.companyName}</h2>
          <p className="text-slate-400 text-[11px] max-w-2xl leading-relaxed">
            NEXUS Core Integration Engine. Consolidated high-density status feeds for precision manufacturing, physical inventory routing, and active ledger databases.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded text-[11px] z-10 self-start md:self-auto font-mono">
          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">System Clock</p>
            <p className="font-bold text-slate-350">2026-05-20 05:29 UTC</p>
            <p className="text-[9px] text-emerald-400 font-bold">● CLOUD PIPELINE ONLINE</p>
          </div>
        </div>
      </div>

      {/* Modern High Density KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Realized Sales */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold tracking-wider uppercase">Realized Revenue</span>
            <span className="text-[10px] font-bold text-emerald-500">↑ 12.4%</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white font-mono leading-none">{formatCur(financials.salesTotal)}</h3>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            Paid Ledger Cleared
          </span>
        </div>

        {/* KPI 2: Inventory Value */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold tracking-wider uppercase">Stored Assets Value</span>
            <span className="text-[10px] font-bold text-sky-400">8.4x turn</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white font-mono leading-none">{formatCur(financials.stockAssetValue)}</h3>
          <span className="text-[9px] text-slate-400 font-medium">
            Potent. sale: <b className="font-mono text-indigo-500">{formatCur(financials.stockPotentValue)}</b>
          </span>
        </div>

        {/* KPI 3: Manufacturing Loading */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold tracking-wider uppercase">Assembly Progress</span>
            <span className="text-[10px] font-bold text-sky-400">98.4% rate</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white font-mono leading-none">{manufacturingStats.stepCompletionPercentage}%</h3>
          <span className="text-[9px] text-slate-450 font-medium truncate">
            {manufacturingStats.inProgress} Active • {manufacturingStats.completed} Completed
          </span>
        </div>

        {/* KPI 4: Operations Directory & Payroll */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold tracking-wider uppercase">Monthly Payroll</span>
            <span className="text-[10px] font-bold text-amber-500">Active</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white font-mono leading-none">{formatCur(hrStats.totalPayroll)}</h3>
          <span className="text-[9px] font-medium text-amber-600 dark:text-amber-450">
            {hrStats.activeStaff} Staff on scheduled roster
          </span>
        </div>
      </div>

      {/* Interactive Mid Layout: Stock Alerts and Quick Actions Stream & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (2-Span): Action Stream & Analytics Charts */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Action Stream / Alerts Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-sky-500" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-white">Active Core Alerts & Feeds</h4>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                {notices.filter(n => n.type === 'danger' || n.type === 'warning').length} active reports
              </span>
            </div>
 
            <div className="space-y-2">
              {notices.map((notice) => (
                <div 
                  key={notice.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border gap-3 text-xs transition-colors duration-200 ${
                    notice.type === 'danger' 
                      ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30' 
                      : notice.type === 'warning'
                      ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
                      : notice.type === 'success'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                      : 'bg-[#e0f2fe]/50 dark:bg-[#075985]/10 border-sky-100 dark:border-sky-900/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notice.type === 'danger' && <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                    {notice.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
                    {notice.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                    {notice.type === 'info' && <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />}
                    
                    <span className="text-slate-700 dark:text-slate-300 font-medium leading-normal text-[11px]">{notice.text}</span>
                  </div>
                  
                  {notice.actionTab && (
                    <button 
                      onClick={() => setActiveTab(notice.actionTab)} 
                      className="px-2.5 py-1 shrink-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold border border-slate-200 dark:border-slate-700 rounded shadow-xs flex items-center gap-1 text-[10px] uppercase tracking-wider self-end sm:self-auto hover:text-sky-500 transition-colors"
                    >
                      <span>{notice.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
 
          {/* Graphical Analytics (Interactive Custom SVGs for Robust Render) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sales Volume / Outstanding Ledger Visualizer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Ledger Balance</h5>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Paid vs Unpaid Volume</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    Total: {formatCur(financials.salesTotal + financials.unpaidTotal)}
                  </p>
                </div>
              </div>

              {/* Robust Interactive Vector Graphic - Stacked Sales Volume */}
              <div className="h-44 flex items-end justify-center px-2 py-4 border border-slate-100 dark:border-slate-800 rounded-md bg-slate-50/50 dark:bg-slate-950/20 relative">
                {financials.salesTotal === 0 && financials.unpaidTotal === 0 ? (
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">No Sales Registered</p>
                ) : (
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-end gap-16 justify-center">
                      {/* Bar 1: Paid sales */}
                      <div className="flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 hover:scale-105 transition-transform">
                          {formatCur(financials.salesTotal)}
                        </span>
                        <div 
                          className="w-14 bg-emerald-500 rounded-t hover:bg-emerald-400 transition-all duration-300 shadow-xs"
                          style={{ height: `${Math.max(20, Math.min(100, (financials.salesTotal / (financials.salesTotal + financials.unpaidTotal)) * 110))}px` }}
                        ></div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Paid Ledger</span>
                      </div>

                      {/* Bar 2: Outstanding invoice pending */}
                      <div className="flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[10px] font-mono font-bold text-sky-500 hover:scale-105 transition-transform font-bold">
                          {formatCur(financials.unpaidTotal)}
                        </span>
                        <div 
                          className="w-14 bg-sky-500 rounded-t hover:bg-sky-400 transition-all duration-300 shadow-xs"
                          style={{ height: `${Math.max(20, Math.min(100, (financials.unpaidTotal / (financials.salesTotal + financials.unpaidTotal)) * 110))}px` }}
                        ></div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Receivable</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse Category Volume */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse Distribution</h5>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Categories Allocation</h4>
                </div>
              </div>

              {/* Custom Vector Donut list representing product counts per category in stock */}
              <div className="h-44 flex flex-col justify-center p-3 border border-slate-100 dark:border-slate-800 rounded-md bg-slate-50/50 dark:bg-slate-950/20 relative space-y-2">
                {products.length === 0 ? (
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-center tracking-widest">Warehouse Empty</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-full scrollbar-thin">
                    {Object.entries(
                      products.reduce((acc, p) => {
                        acc[p.category] = (acc[p.category] || 0) + p.qty;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([cat, count], idx) => {
                      const colors = [
                        'bg-sky-500', 
                        'bg-blue-500', 
                        'bg-emerald-500', 
                        'bg-amber-500', 
                        'bg-rose-500'
                      ];
                      const color = colors[idx % colors.length];
                      const totalQty = products.reduce((sum, p) => sum + p.qty, 0);
                      const percent = totalQty > 0 ? Math.round((count / totalQty) * 100) : 0;

                      return (
                        <div key={cat} className="flex items-center justify-between text-[11px] font-medium">
                          <div className="flex items-center gap-1.5 w-24">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${color}`}></span>
                            <span className="text-slate-705 dark:text-slate-300 uppercase truncate text-[10px] font-semibold">{cat}</span>
                          </div>
                          
                          <div className="flex-1 mx-2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono">
                            <span className="font-bold text-slate-800 dark:text-white">{count} u</span>
                            <span className="text-slate-450">({percent}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (1-Span): High Priority Job & Stock Reorders */}
        <div className="space-y-4">
          
          {/* Overdue and Urgent Assembly Runs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority Shop Works</h4>
            
            <div className="space-y-2">
              {workOrders.filter(w => w.status !== 'Completed').slice(0, 3).map((order) => {
                const completedStepsCount = order.steps.filter(s => s.status === 'Completed').length;
                const totalSteps = order.steps.length;
                const progressLevel = Math.round((completedStepsCount / totalSteps) * 100);

                return (
                  <div 
                    key={order.id} 
                    className="p-2.5 border border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-900 rounded-md transition-all space-y-2 text-xs text-left cursor-pointer group"
                    onClick={() => setActiveTab('manufacturing')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-[10px]">{order.orderNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        order.priority === 'High' 
                          ? 'bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40'
                          : order.priority === 'Medium'
                          ? 'bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {order.priority}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-sky-500 transition-colors line-clamp-1 text-[11px]">
                        {order.productName}
                      </h5>
                      <p className="text-[9px] text-slate-450 mt-0.5">Qty: {order.qty} pcs • Target: {order.targetDate}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                        <span>Phase progress</span>
                        <span className="font-mono text-sky-500">{progressLevel}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full" 
                          style={{ width: `${progressLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button 
                onClick={() => setActiveTab('manufacturing')}
                className="w-full py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-350 hover:text-sky-500 transition-all uppercase tracking-wider font-bold"
              >
                <span>Enter Assembly floor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Resupply Operations - Directly interactive! */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Critical Material Supply</h4>
            
            <div className="space-y-2">
              {[...stockAlerts.outOfStock, ...stockAlerts.lowStock].slice(0, 3).map((prod) => (
                <div key={prod.id} className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-md flex items-center justify-between gap-2 text-xs text-left">
                  <div className="space-y-0.5 max-w-[130px]">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate text-[11px]">{prod.name}</h5>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Stock: <span className={prod.qty === 0 ? 'text-red-500 font-bold font-mono' : 'text-amber-500 font-bold font-mono'}>{prod.qty} u</span> / safety: {prod.minQty}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => triggerSupplierReorder(prod.id)}
                    className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer shadow-xs transition-transform hover:scale-105"
                  >
                    Restock
                  </button>
                </div>
              ))}
              
              {stockAlerts.outOfStock.length === 0 && stockAlerts.lowStock.length === 0 && (
                <div className="p-6 text-center text-[11px] text-slate-450 font-semibold border border-dashed border-slate-150 dark:border-slate-800 rounded-md space-y-1.5">
                  <CheckCircle2 className="w-6.5 h-6.5 text-emerald-400 mx-auto" />
                  <p className="uppercase tracking-widest text-[9px] font-bold">Inventory Secured</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
