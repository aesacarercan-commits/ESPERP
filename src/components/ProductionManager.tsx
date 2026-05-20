import React, { useState } from 'react';
import { 
  Plus, Search, Cpu, Kanban, AlertTriangle, CheckCircle2, Trash2, Clock, 
  X, Check, ChevronDown, ListTodo, Wrench, User, CalendarDays, Inbox
} from 'lucide-react';
import { WorkOrder, Employee, WorkStep } from '../types';

interface ProductionManagerProps {
  workOrders: WorkOrder[];
  employees: Employee[];
  onAddWorkOrder: (order: Omit<WorkOrder, 'id'>) => void;
  onUpdateStepStatus: (orderId: string, stepId: string, status: WorkStep['status'], completedBy?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: WorkOrder['status']) => void;
  onDeleteWorkOrder: (orderId: string) => void;
}

export default function ProductionManager({
  workOrders,
  employees,
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

  const defaultSteps: Omit<WorkStep, 'completedAt'>[] = [
    { id: 'step-1', name: 'Material Prep & Cutting', status: 'Pending' },
    { id: 'step-2', name: 'Precision CNC Mill', status: 'Pending' },
    { id: 'step-3', name: 'TIG Welding & Fusion', status: 'Pending' },
    { id: 'step-4', name: 'X-Ray Alignment & QC', status: 'Pending' },
    { id: 'step-5', name: 'ESD Protective Coating', status: 'Pending' }
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

  return (
    <div className="space-y-6 pt-2 text-left" id="production-tab-panel">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Assembly Floors & Manufacturing</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish production runs, track quality assurance (QA) steps, and log specialized technical technicians.
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manufacturing Run</span>
        </button>
      </div>

      {/* Slideout Workorder Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              <span>Provision Manufacturing Process</span>
            </h4>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-450 hover:text-slate-650 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-medium">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Product Name *</label>
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
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Quantity (Pcs) *</label>
              <input 
                type="number" 
                min="1" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-bold"
                value={newOrder.qty}
                onChange={e => setNewOrder(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Target Completion *</label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-855 dark:text-white font-mono font-bold"
                value={newOrder.targetDate}
                onChange={e => setNewOrder(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Priority Level *</label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-800 dark:text-white"
                value={newOrder.priority}
                onChange={e => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Production Instructions Memo</label>
            <textarea 
              rows={2}
              placeholder="Specify requirements, raw material sources, and precision specs here..." 
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold text-xs"
              value={newOrder.notes}
              onChange={e => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Release Order Code
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
            placeholder="Search active orders catalog by ID or product target item..." 
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Priority dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">Priority:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Levels</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">Status:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All States</option>
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
                    ? 'ring-1 ring-sky-500 border-sky-400 dark:border-sky-800' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-350'
                }`}
              >
                
                {/* Header info */}
                <div className="flex items-start justify-between">
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
                        {order.priority}
                      </span>

                      {isOverdue && (
                        <span className="text-[8px] text-rose-500 bg-rose-50/50 dark:bg-rose-955/15 font-bold uppercase tracking-wider border border-rose-100 dark:border-rose-900/30 px-1 py-0.2 rounded flex items-center gap-0.5 animate-pulse">
                          Overdue Range
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {order.productName}
                    </h4>
                  </div>

                  {/* Main order status dropdown */}
                  <div onClick={e => e.stopPropagation()}>
                    <select 
                      className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded outline-none border ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200'
                          : order.status === 'In_Progress'
                          ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-500 border-sky-300 animate-pulse'
                          : order.status === 'On_Hold'
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-705'
                      }`}
                      value={order.status}
                      onChange={e => onUpdateOrderStatus(order.id, e.target.value as any)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In_Progress">In Progress</option>
                      <option value="On_Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Technical stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 border-y border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 my-2.5 font-bold">
                  <div>
                    <span className="text-slate-400 block text-[8px] uppercase tracking-widest leading-none mb-0.5">Run Quantity</span>
                    <span className="text-slate-900 dark:text-white font-bold">{order.qty} units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] uppercase tracking-widest leading-none mb-0.5">Target delivery</span>
                    <span className="text-slate-900 dark:text-white font-mono">{new Date(order.targetDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] uppercase tracking-widest leading-none mb-0.5">Process Phase</span>
                    <span className="text-slate-900 dark:text-white">{completedCount} / {order.steps.length} Steps Done</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] uppercase tracking-widest leading-none mb-0.5">Current Operation</span>
                    <span className="text-sky-505 truncate block text-[10px]">
                      {order.steps.find(s => s.status !== 'Completed')?.name || 'None Active'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-455 font-bold uppercase tracking-widest text-[8px]">Process Assembly Run Limit Progress:</span>
                    <span className="font-mono font-bold text-sky-500">{progress}%</span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              No manufacturing work orders in process logs
            </div>
          )}
        </div>

        {/* Selected Order Detailed Actions & Operator logs (1-Span Panel) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 text-xs">
          {selectedOrderId && workOrders.find(w => w.id === selectedOrderId) ? (() => {
            const orderObj = workOrders.find(w => w.id === selectedOrderId)!;
            
            return (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Upper Details title info */}
                <div className="flex items-start justify-between border-b border-indigo-50/50 dark:border-slate-800 pb-3 text-left">
                  <div className="space-y-0.5">
                    <span className="font-mono text-slate-400 font-bold uppercase text-[9px]">Production Hub</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{orderObj.orderNumber}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Target: {new Date(orderObj.targetDate).toLocaleDateString()}</p>
                  </div>

                  <button 
                    onClick={() => setSelectedOrderId(null)}
                    className="p-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Operator selector */}
                <div className="bg-slate-50/70 dark:bg-slate-950/25 p-3.5 rounded-xl border border-slate-150 dark:border-slate-820 text-left space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide">Select Specialized Operator</span>
                  </div>
                  
                  <select 
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold outline-none text-slate-850 dark:text-white"
                    value={activeOperator}
                    onChange={e => setActiveOperator(e.target.value)}
                  >
                    {employees.filter(e => e.status === 'Active').map(e => (
                      <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                {/* Steps logs */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Step Routing & Quality Gates</span>
                  
                  <div className="space-y-2.5">
                    {orderObj.steps.map((step, idx) => (
                      <div 
                        key={step.id}
                        className={`p-3 border rounded-xl flex flex-col gap-1.5 text-xs transition-all ${
                          step.status === 'Completed'
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                            : step.status === 'In_Progress'
                            ? 'bg-indigo-50/35 dark:bg-indigo-950/10 border-indigo-150 dark:border-indigo-900/30 ring-2 ring-indigo-500/10'
                            : 'bg-slate-50/30 dark:bg-slate-950/20 border-slate-150 dark:border-slate-820'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-850 dark:text-slate-200">{idx + 1}. {step.name}</span>
                          
                          <button 
                            type="button"
                            onClick={() => handleToggleStep(orderObj, step)}
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              step.status === 'Completed'
                                ? 'bg-emerald-500 text-white'
                                : step.status === 'In_Progress'
                                ? 'bg-indigo-505 bg-indigo-600 text-white animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            {step.status === 'Completed' ? 'Done' : step.status === 'In_Progress' ? 'Pending' : 'To Do'}
                          </button>
                        </div>

                        {step.status === 'Completed' && (
                          <div className="text-[10px] text-slate-450 font-medium flex items-center justify-between border-t border-emerald-100/40 dark:border-emerald-900/20 pt-1.5 font-mono">
                            <span className="truncate">Sign: {step.completedBy || 'System Root'}</span>
                            <span>{step.completedAt ? new Date(step.completedAt).toLocaleTimeString() : 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>

                {/* Additional instructions / Notes */}
                {orderObj.notes && (
                  <div className="p-3 bg-red-50/20 dark:bg-amber-950/15 border border-slate-100 dark:border-slate-800 rounded-xl text-left">
                    <span className="text-[8px] font-bold uppercase text-slate-400">Technical Instructions</span>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 leading-relaxed">{orderObj.notes}</p>
                  </div>
                )}

                <button 
                  onClick={() => { if(confirm("Decommission this work order?")) onDeleteWorkOrder(orderObj.id); setSelectedOrderId(null); }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/10 dark:hover:bg-red-955/20 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-100 dark:border-red-950"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Terminate Manufacturing Run</span>
                </button>

              </div>
            );
          })() : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto opacity-40" />
              <p className="font-bold uppercase tracking-wider text-[10px]">No active route selected</p>
              <p className="text-[10px] text-slate-500 font-medium font-bold">Highlight any active manufacturing order to sign work processes or select executing shop operators.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
