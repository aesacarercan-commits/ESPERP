import React, { useState } from 'react';
import { 
  Plus, Search, Kanban, AlertTriangle, CheckCircle2, Trash2, Clock, 
  X, Check, ChevronDown, ListTodo, Wrench, User, CalendarDays, Inbox
} from 'lucide-react';
import { WorkOrder, Employee, WorkStep } from '../types';
import { getTranslation, Language } from '../lib/translations';

interface ProductionManagerProps {
  workOrders: WorkOrder[];
  employees: Employee[];
  config: { language?: 'en' | 'tr'; currency?: string };
  onAddWorkOrder: (order: Omit<WorkOrder, 'id'>) => void;
  onUpdateStepStatus: (orderId: string, stepId: string, status: WorkStep['status'], completedBy?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: WorkOrder['status']) => void;
  onDeleteWorkOrder: (orderId: string) => void;
}

export default function ProductionManager({
  workOrders,
  employees,
  config,
  onAddWorkOrder,
  onUpdateStepStatus,
  onUpdateOrderStatus,
  onDeleteWorkOrder
}: ProductionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'list'>('planner');

  const currentLang = config.language || 'en';

  // New Work order form fields
  const [newOrder, setNewOrder] = useState({
    productName: '',
    qty: 10,
    targetDate: '',
    priority: 'Medium' as WorkOrder['priority'],
    notes: ''
  });

  const [activeOperator, setActiveOperator] = useState<string>(
    employees.length > 0 ? employees[0].name : ''
  );

  const defaultSteps: WorkStep[] = [
    // Kapak&Gövde
    { id: 'kg-kesim', name: 'Kapak&Gövde - kesim', baseStepName: 'kesim', category: 'Kapak&Gövde', columns: [1], status: 'Pending' },
    { id: 'kg-bukum', name: 'Kapak&Gövde - büküm', baseStepName: 'büküm', category: 'Kapak&Gövde', columns: [2, 3], status: 'Pending' },
    { id: 'kg-catim', name: 'Kapak&Gövde - çatım', baseStepName: 'çatım', category: 'Kapak&Gövde', columns: [3, 4], status: 'Pending' },
    { id: 'kg-tas1', name: 'Kapak&Gövde - taş (Temizlik)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [4, 5], status: 'Pending' },
    { id: 'kg-kaynak', name: 'Kapak&Gövde - kaynak', baseStepName: 'kaynak', category: 'Kapak&Gövde', columns: [5, 6], status: 'Pending' },
    { id: 'kg-tas2', name: 'Kapak&Gövde - taş (Son Kontrol)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [6, 7], status: 'Pending' },
    { id: 'kg-saplama', name: 'Kapak&Gövde - saplama', baseStepName: 'saplama', category: 'Kapak&Gövde', columns: [7, 8], status: 'Pending' },
    { id: 'kg-boyahazir', name: 'Kapak&Gövde - boya hazırlık', baseStepName: 'boya hazırlık', category: 'Kapak&Gövde', columns: [8, 9], status: 'Pending' },
    { id: 'kg-boya', name: 'Kapak&Gövde - boya', baseStepName: 'boya', category: 'Kapak&Gövde', columns: [9, 10], status: 'Pending' },
    { id: 'kg-montaj', name: 'Kapak&Gövde - montaj', baseStepName: 'montaj', category: 'Kapak&Gövde', columns: [10, 11], status: 'Pending' },
    { id: 'kg-paket', name: 'Kapak&Gövde - paket', baseStepName: 'paket', category: 'Kapak&Gövde', columns: [15], status: 'Pending' },

    // Raylar
    { id: 'ry-kesim', name: 'Raylar - kesim', baseStepName: 'kesim', category: 'Raylar', columns: [1], status: 'Pending' },
    { id: 'ry-bukum', name: 'Raylar - büküm', baseStepName: 'büküm', category: 'Raylar', columns: [2, 3], status: 'Pending' },
    { id: 'ry-punta', name: 'Raylar - punta', baseStepName: 'punta', category: 'Raylar', columns: [3, 4], status: 'Pending' },
    { id: 'ry-catim', name: 'Raylar - çatım', baseStepName: 'çatım', category: 'Raylar', columns: [4, 5], status: 'Pending' },

    // elektrik
    { id: 'el-delik', name: 'elektrik - delik delme', baseStepName: 'delik delme', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
    { id: 'el-panosaci', name: 'elektrik - pano sacı', baseStepName: 'pano sacı', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
    { id: 'el-kablolama', name: 'elektrik - kablolama', baseStepName: 'kablolama', category: 'elektrik', columns: [11, 12], status: 'Pending' },
    { id: 'el-test', name: 'elektrik - test', baseStepName: 'test', category: 'elektrik', columns: [13], status: 'Pending' },
    { id: 'el-etiket', name: 'elektrik - etiket', baseStepName: 'etiket', category: 'elektrik', columns: [12, 13, 14], status: 'Pending' }
  ];

  // Submit action
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.productName.trim()) return;

    const formattedOrderNumber = `MFR-2026-${100 + workOrders.length + 1}`;

    const orderPayload: Omit<WorkOrder, 'id'> = {
      orderNumber: formattedOrderNumber,
      productName: newOrder.productName.trim(),
      qty: newOrder.qty,
      targetDate: newOrder.targetDate || new Date(Date.now() + 15 * 24 * 365 * 1000).toISOString().split('T')[0],
      priority: newOrder.priority,
      status: 'Draft',
      steps: defaultSteps.map(step => ({ ...step } as WorkStep)),
      notes: newOrder.notes.trim()
    };

    onAddWorkOrder(orderPayload);
    setIsCreating(false);

    // Reset fields
    setNewOrder({
      productName: '',
      qty: 10,
      targetDate: '',
      priority: 'Medium',
      notes: ''
    });
  };

  // Step click handler
  const handleToggleStep = (order: WorkOrder, step: WorkStep) => {
    let nextStatus: WorkStep['status'] = 'Pending';
    if (step.status === 'Pending') {
      nextStatus = 'In_Progress';
    } else if (step.status === 'In_Progress') {
      nextStatus = 'Completed';
    } else {
      nextStatus = 'Pending';
    }

    onUpdateStepStatus(order.id, step.id, nextStatus, nextStatus === 'Completed' ? activeOperator : undefined);
  };

  // Filters mapping
  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || order.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Active selection fallback
  const activeOrderId = selectedOrderId || (filteredOrders.length > 0 ? filteredOrders[0].id : (workOrders.length > 0 ? workOrders[0].id : null));
  const activeOrder = workOrders.find(o => o.id === activeOrderId);

  const renderPlannerRow = (step: WorkStep) => {
    if (!activeOrder) return null;
    return (
      <tr key={step.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors border-b border-slate-100 dark:border-slate-800/60">
        <td className="border border-slate-200 dark:border-slate-800 p-2 font-bold text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between gap-1.5 leading-tight">
            <span className="capitalize">{step.baseStepName || (step.name.includes(' - ') ? step.name.split(' - ')[1] : step.name)}</span>
            {step.completedBy && (
              <span className="text-[8px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-1 py-0.2 rounded-sm font-bold" title={`Onaylayan: ${step.completedBy}`}>
                ✓ {step.completedBy.split(' ')[0]}
              </span>
            )}
          </div>
        </td>

        {Array.from({ length: 16 }, (_, i) => i + 1).map((colNum) => {
          const isPlanned = step.columns && step.columns.includes(colNum);
          if (isPlanned) {
            let cellClass = "";
            let label = "";

            if (step.status === 'Completed') {
              cellClass = "bg-[#e76f51] hover:bg-[#d65f41] text-white border-y border-[#c54e33] flex items-center justify-center font-black shadow-inner";
              label = "✓";
            } else if (step.status === 'In_Progress') {
              cellClass = "bg-[#e76f51]/40 hover:bg-[#e76f51]/55 text-slate-900 dark:text-orange-200 border border-[#e76f51] animate-pulse flex items-center justify-center font-extrabold";
              label = "»";
            } else {
              cellClass = "bg-[#e76f51]/10 hover:bg-[#e76f51]/20 text-orange-600/60 dark:text-orange-400/50 border border-dashed border-[#e76f51]/30 flex items-center justify-center font-bold";
              label = "";
            }

            return (
              <td 
                key={colNum}
                onClick={() => handleToggleStep(activeOrder, step)}
                title={`Aşama: [${step.category}] ${step.baseStepName} | Durum: ${step.status} | Tıkla ve Durumu Güncelle`}
                className="border border-slate-200 dark:border-slate-800 p-0 h-10 w-[45px]"
              >
                <div className={`w-full h-full transition-all duration-150 cursor-pointer select-none ${cellClass}`}>
                  <span className="text-[10px] tracking-tight">{label}</span>
                </div>
              </td>
            );
          } else {
            return (
              <td 
                key={colNum}
                className="border border-slate-100 dark:border-slate-800/40 h-10 w-[45px] bg-transparent"
              ></td>
            );
          }
        })}
      </tr>
    );
  };

  return (
    <div className="space-y-6 pt-2 text-left" id="production-tab-panel">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getTranslation(currentLang, 'assembly_floors_mfg')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getTranslation(currentLang, 'assembly_floors_descr')}
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(currentLang, 'add_mfg_run')}</span>
        </button>
      </div>

      {/* Slideout Workorder Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'provision_mfg')}</span>
            </h4>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-medium">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'product_name')} *
              </label>
              <input 
                type="text" 
                placeholder="Pressure Assembly System V2" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={newOrder.productName}
                onChange={e => setNewOrder(prev => ({ ...prev, productName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'qty')} (Pcs) *
              </label>
              <input 
                type="number" 
                min="1" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newOrder.qty}
                onChange={e => setNewOrder(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Hedef Bitiş Tarihi' : 'Target Completion'} *
              </label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-mono font-bold"
                value={newOrder.targetDate}
                onChange={e => setNewOrder(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Öncelik Derecesi' : 'Priority Level'} *
              </label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-800 dark:text-white"
                value={newOrder.priority}
                onChange={e => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <option value="Low">{getTranslation(currentLang, 'low')}</option>
                <option value="Medium">{getTranslation(currentLang, 'medium')}</option>
                <option value="High">{getTranslation(currentLang, 'high')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
              {currentLang === 'tr' ? 'Üretim Talimatları Notu' : 'Production Instructions Memo'}
            </label>
            <textarea 
              rows={2}
              placeholder="Specify requirements, raw material sources, and precision specs here..." 
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold text-xs"
              value={newOrder.notes}
              onChange={e => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
            >
              {getTranslation(currentLang, 'cancel')}
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              {currentLang === 'tr' ? 'Emri Yayınla' : 'Release Order Code'}
            </button>
          </div>
        </form>
      )}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 self-start gap-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('planner')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'planner'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Kanban className="w-3.5 h-3.5 text-[#e76f51]" />
          <span>📊 Proje Planlayıcısı (Sıralama Görünümü)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('list')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'list'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-sky-500" />
          <span>🗂️ İş Emri Listesi ve Detaylar</span>
        </button>
      </div>

      {activeSubTab === 'list' ? (
        <>
          {/* Directory Filter Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-xs">
            
            {/* Simple Search bar */}
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder={currentLang === 'tr' ? 'Aktif işleri emre veya ürüne göre ara...' : 'Search active orders catalog by ID or product target item...'}
                className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Priority dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'priority')}:</span>
                <select 
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                >
                  <option value="All">{getTranslation(currentLang, 'all_ranges')}</option>
                  <option value="High">{getTranslation(currentLang, 'high')}</option>
                  <option value="Medium">{getTranslation(currentLang, 'medium')}</option>
                  <option value="Low">{getTranslation(currentLang, 'low')}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9px]">{currentLang === 'tr' ? 'Statü' : 'Status'}:</span>
                <select 
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">{currentLang === 'tr' ? 'Tüm Durumlar' : 'All States'}</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="On_Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid of Work Orders with detail cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Work Orders List (2-Span Column) */}
            <div className="lg:col-span-2 space-y-4">
              {filteredOrders.map((order) => {
                const completedCount = order.steps.filter(s => s.status === 'Completed').length;
                const progress = Math.round((completedCount / order.steps.length) * 100);
                
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = order.status !== 'Completed' && order.targetDate < todayStr;

                return (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-white dark:bg-slate-900 border p-3.5 rounded shadow-xs cursor-pointer text-left transition-all ${
                      selectedOrderId === order.id 
                        ? 'ring-1 ring-sky-505 border-[#0ea5e9] dark:border-sky-800' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350'
                    }`}
                  >
                    
                    {/* Header info */}
                    <div className="flex items-start justify-between animate-in fade-in">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-slate-500 font-bold text-[10px]">{order.orderNumber}</span>
                          
                          {/* Priority Tag */}
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                            order.priority === 'High' 
                              ? 'bg-rose-50 dark:bg-rose-955/20 text-rose-500 border border-rose-150 dark:border-rose-900' 
                              : order.priority === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-155 dark:border-amber-900'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {order.priority === 'High' ? getTranslation(currentLang, 'high') : order.priority === 'Medium' ? getTranslation(currentLang, 'medium') : getTranslation(currentLang, 'low')}
                          </span>

                          {isOverdue && (
                            <span className="text-[8px] text-rose-500 bg-rose-50/50 dark:bg-rose-955/15 font-bold uppercase tracking-wider border border-rose-100 dark:border-rose-900/30 px-1 py-0.2 rounded flex items-center gap-0.5 animate-pulse">
                              {currentLang === 'tr' ? 'Gecikmiş İş' : 'Overdue Range'}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                          {order.productName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide font-mono ${
                          order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          order.status === 'In_Progress' ? 'bg-sky-500/10 text-sky-500' :
                          order.status === 'On_Hold' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar info */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <span>{getTranslation(currentLang, 'phase_progress')}</span>
                        <span className="font-mono text-slate-800 dark:text-white">{progress}% ({completedCount}/{order.steps.length} {currentLang === 'tr' ? 'Aşama' : 'Steps'})</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#e76f51] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    {/* Footer specs details block */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-[10px] text-slate-500 dark:text-slate-450 font-medium">
                      <div>
                        {currentLang === 'tr' ? 'Hedef: ' : 'Target: '} <span className="font-mono font-bold text-slate-805 dark:text-slate-300">{order.targetDate}</span>
                      </div>
                      <div>
                        {currentLang === 'tr' ? 'Miktar: ' : 'Qty: '} <span className="font-bold text-slate-800 dark:text-slate-300">{order.qty} pcs</span>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="mt-2 text-[9.5px] italic text-slate-400 line-clamp-1 border-l-2 border-slate-200 dark:border-slate-800 pl-1.5">
                        "{order.notes}"
                      </p>
                    )}

                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-20 border-slate-200 dark:border-slate-800 rounded-xl py-12 px-6 text-center text-slate-400 font-bold uppercase tracking-widest">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>{currentLang === 'tr' ? 'Statü filtresiyle uyuşan iş emri bulunamadı' : 'No custom manufacturing orders match this category'}</span>
                </div>
              )}
            </div>

            {/* Action Panel Detail (Right 1-Span Card to process work stages) */}
            <div>
              {selectedOrderId ? (() => {
                const curOrder = workOrders.find(w => w.id === selectedOrderId);
                if (!curOrder) return null;

                const isCompletedAll = curOrder.steps.every(s => s.status === 'Completed');

                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-left text-xs space-y-4 animate-in fade-in duration-300 w-full">
                    
                    {/* Active operator banner select */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        <User className="w-3.5 h-3.5 text-sky-500" />
                        <span>{currentLang === 'tr' ? 'Yetkili Teknisyen Girişi' : 'Authorized Floor Operator'}</span>
                      </div>
                      <select 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg font-bold text-slate-800 dark:text-slate-200 outline-none text-[11px]"
                        value={activeOperator}
                        onChange={(e) => setActiveOperator(e.target.value)}
                      >
                        {employees.map(e => (
                          <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                        ))}
                      </select>
                    </div>

                    {/* Job Title details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sky-500 font-bold text-[10px] uppercase">{curOrder.orderNumber}</span>
                        <button 
                          onClick={() => onDeleteWorkOrder(curOrder.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          title="Decommission Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{curOrder.productName}</h3>
                      <p className="text-[10px] text-slate-455 font-bold flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        <span>{getTranslation(currentLang, 'target_completion')}: {curOrder.targetDate}</span>
                      </p>
                    </div>

                    {/* Flow Order Status Select widget */}
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase tracking-widest text-[9px] font-bold block">{currentLang === 'tr' ? 'Emir Durumu' : 'Release Status'}</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-white font-black"
                        value={curOrder.status}
                        onChange={(e) => onUpdateOrderStatus(curOrder.id, e.target.value as any)}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In_Progress">In Progress</option>
                        <option value="On_Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Work steps checklist */}
                    <div className="space-y-2 pt-1">
                      <h5 className="font-bold uppercase tracking-widest text-slate-400 text-[9px] flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-sky-500" />
                        <span>{currentLang === 'tr' ? 'Aşama Kalite Güvence (QA) Kapısı' : 'Routing Step QA Controls'}</span>
                      </h5>

                      <p className="text-[10.5px] text-slate-450 leading-relaxed">
                        {currentLang === 'tr' 
                          ? 'Durumu ilerletmek için aşamaya tıklayın. "Tamamlandı" işaretlendiğinde aktif operatör ismine mühürlenir.' 
                          : 'Click step to transition status. "Completed" stamps operator log.'}
                      </p>

                      <div className="space-y-1.5 pt-1.5 max-h-[280px] overflow-y-auto pr-1">
                        {curOrder.steps.map((step) => {
                          return (
                            <div 
                              key={step.id}
                              onClick={() => handleToggleStep(curOrder, step)}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all select-none flex items-center justify-between gap-2 text-[10.5px] font-bold ${
                                step.status === 'Completed' 
                                  ? 'bg-[#e76f51]/10 border-[#e76f51]/30 text-slate-800 dark:text-orange-200 animate-fade' 
                                  : step.status === 'In_Progress'
                                  ? 'bg-sky-50 dark:bg-sky-950/10 border-sky-200 dark:border-sky-900/30 text-sky-500'
                                  : 'bg-slate-50/45 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/60 text-slate-600'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className={`block truncate ${step.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{step.name}</span>
                                {step.completedBy && (
                                  <span className="text-[8.5px] text-emerald-600 dark:text-emerald-450 block leading-none font-bold">
                                    ✓ Sealed by {step.completedBy}
                                  </span>
                                )}
                              </div>

                              <div className="shrink-0">
                                {step.status === 'Completed' ? (
                                  <span className="bg-[#e76f51] text-white p-0.5 rounded-full block">
                                    <Check className="w-3 h-3 font-semibold" />
                                  </span>
                                ) : step.status === 'In_Progress' ? (
                                  <span className="text-sky-505 text-[8px] font-mono border border-sky-400 p-0.5 rounded animate-pulse">RUN</span>
                                ) : (
                                  <span className="text-slate-400 text-[8px] font-mono border border-slate-300 p-0.5 rounded">PEND</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {isCompletedAll && curOrder.status !== 'Completed' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 rounded-xl p-3 text-center space-y-2 text-[11px] font-bold animate-in zoom-in duration-100">
                        <p>✓ {currentLang === 'tr' ? 'Tüm adımlar başarıyla tamamlandı!' : 'All Quality assurance gates passed!'}</p>
                        <button 
                          onClick={() => onUpdateOrderStatus(curOrder.id, 'Completed')}
                          className="w-full bg-[#10b981] text-slate-950 font-black py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          {currentLang === 'tr' ? 'Emri Kapat' : 'Approve & Close Run'}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })() : (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-805 rounded-2xl py-16 text-center text-slate-450 font-semibold space-y-2">
                  <ListTodo className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                  <p className="uppercase tracking-widest text-[9.5px] font-bold text-slate-500">{currentLang === 'tr' ? 'Aşama Seçilmedi' : 'No Order Selected'}</p>
                  <p className="text-[10px] max-w-[200px] mx-auto text-slate-400">{currentLang === 'tr' ? 'Detayları ve kalite kontrol aşamalarını görmek için soldan bir üretim emri seçin.' : 'Select any active manufacturing run from the left list block to edit QA details.'}</p>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        /* Render full width interactive project planner Gantt twin of the Excel graphic sheet input */
        activeOrder ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Header section with selections */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
                    <span>PROJE PLANLAYICISI (TÜRLER VE SIRALAMA)</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{activeOrder.orderNumber} - {activeOrder.productName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      activeOrder.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'
                    }`}>
                      {activeOrder.status}
                    </span>
                  </h3>
                </div>

                {/* Switcher details */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Takip Edilecek Proje / İş:</label>
                    <select
                      value={activeOrderId || ''}
                      onChange={(e) => {
                        setSelectedOrderId(e.target.value);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-white outline-none min-w-[200px]"
                    >
                      {workOrders.map(wo => (
                        <option key={wo.id} value={wo.id}>
                          {wo.orderNumber} - {wo.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-left row-auto">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Aktif İmzacı Operatör:</label>
                    <select
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-white outline-none"
                      value={activeOperator}
                      onChange={(e) => setActiveOperator(e.target.value)}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Color annotations legend */}
                  <div className="hidden lg:flex items-center gap-2.5 text-[9.5px] bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 self-end">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e76f51] inline-block"></span>
                      <span className="text-slate-500 dark:text-slate-400">Tamamlandı</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="w-2.5 h-2.5 rounded bg-[#e76f51]/40 border border-[#e76f51] inline-block animate-pulse"></span>
                      <span className="text-slate-500 dark:text-slate-400">Aktif İş</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="w-2.5 h-2.5 rounded border border-dashed border-[#e76f51]/40 bg-[#e76f51]/10 inline-block"></span>
                      <span className="text-slate-500 dark:text-slate-400">Beklemede</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat rows summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 dark:border-slate-800 text-xs font-medium bg-slate-50/20 dark:bg-slate-950/10">
                <div className="p-3 border-r border-slate-200 dark:border-slate-800 text-left">
                  <span className="text-slate-400 text-[9px] uppercase tracking-widest block font-bold mb-0.5">Miktar</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{activeOrder.qty} Adet (Poli)</span>
                </div>
                <div className="p-3 border-r border-slate-200 dark:border-slate-800 text-left">
                  <span className="text-slate-400 text-[9px] uppercase tracking-widest block font-bold mb-0.5">Planlanan Hedef</span>
                  <span className="text-xs font-extrabold text-[#e76f51]">{activeOrder.priority === 'High' ? 'YÜKSEK ÖNCELİK' : 'ORTA ÖNCELİK'}</span>
                </div>
                <div className="p-3 border-r border-slate-200 dark:border-slate-800 text-left">
                  <span className="text-slate-400 text-[9px] uppercase tracking-widest block font-bold mb-0.5">Bitiş Tarihi</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{activeOrder.targetDate}</span>
                </div>
                <div className="p-3 text-left">
                  <span className="text-slate-400 text-[9px] uppercase tracking-widest block font-bold mb-0.5">Toplam İlerleme</span>
                  <span className="text-sm font-black text-sky-500 dark:text-sky-450 font-mono">
                    {Math.round((activeOrder.steps.filter(s => s.status === 'Completed').length / activeOrder.steps.length) * 100)}% ({activeOrder.steps.filter(s => s.status === 'Completed').length} / {activeOrder.steps.length} Biten)
                  </span>
                </div>
              </div>

              {/* The Interactive planning matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs min-w-[950px] font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                      <th className="border border-slate-200 dark:border-slate-800 p-3 font-extrabold w-[250px] uppercase tracking-wider text-[11px] text-slate-800 dark:text-white">
                        ETKİNLİK
                      </th>
                      <th colSpan={16} className="border border-slate-200 dark:border-slate-800 p-2 font-black text-center text-slate-800 dark:text-white tracking-widest text-[11px] uppercase">
                        sıralama
                      </th>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-center">
                      <th className="border border-slate-200 dark:border-slate-800 p-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] text-left">
                        İŞ TÜRÜ RAPORLARI
                      </th>
                      {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                        <th key={num} className="border border-slate-200 dark:border-slate-800 p-1.5 text-center font-mono font-black text-slate-650 dark:text-slate-350 w-[45px]">
                          {num}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Light blue headers exactly like Cover & Body Section */}
                    <tr className="bg-[#bda682]/15 dark:bg-[#1d3557]/20 border-y border-slate-200 dark:border-slate-800/80">
                      <td colSpan={17} className="p-3 font-black text-slate-800 dark:text-sky-100 tracking-wide uppercase text-xs">
                        Kapak&Gövde
                      </td>
                    </tr>
                    {activeOrder.steps.filter(s => s.category === 'Kapak&Gövde').map((step) => renderPlannerRow(step))}

                    {/* Light blue headers exactly like Rails Section */}
                    <tr className="bg-[#bda682]/15 dark:bg-[#1d3557]/20 border-y border-slate-200 dark:border-slate-800/80">
                      <td colSpan={17} className="p-3 font-black text-slate-800 dark:text-sky-100 tracking-wide uppercase text-xs">
                        Raylar
                      </td>
                    </tr>
                    {activeOrder.steps.filter(s => s.category === 'Raylar').map((step) => renderPlannerRow(step))}

                    {/* Light blue headers exactly like Electrical Section */}
                    <tr className="bg-[#bda682]/15 dark:bg-[#1d3557]/20 border-y border-slate-200 dark:border-slate-800/80">
                      <td colSpan={17} className="p-3 font-black text-slate-800 dark:text-sky-100 tracking-wide uppercase text-xs">
                        elektrik
                      </td>
                    </tr>
                    {activeOrder.steps.filter(s => s.category === 'elektrik').map((step) => renderPlannerRow(step))}
                  </tbody>
                </table>
              </div>

              {/* Helpers footer inside planner view */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 font-bold flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#e76f51] rounded-full inline-block animate-pulse"></span>
                  <span><strong>Bilgi:</strong> Planlama hücrelerine her tıkladığınızda durum sıralı olarak (Beklemede ➔ Devam Ediyor ➔ Tamamlandı) değişir ve aktif operatörün mührü basılır.</span>
                </div>
                <div>
                  <span>Aktif Teknisyen: <strong className="text-indigo-600 dark:text-indigo-400 underline">{activeOperator}</strong></span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-12 px-6 text-center text-slate-400 font-bold uppercase tracking-widest">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>Hiç aktif iş emri bulunamadı.</span>
          </div>
        )
      )}

    </div>
  );
}
