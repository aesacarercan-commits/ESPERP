import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, DollarSign, FileText, CheckCircle2, Truck, AlertCircle, Trash2, Clock, 
  X, Check, Receipt, ChevronDown, Calendar, CreditCard, ExternalLink, RefreshCw
} from 'lucide-react';
import { Invoice, Product, ERPConfig } from '../types';

interface SalesManagerProps {
  invoices: Invoice[];
  products: Product[];
  config: ERPConfig;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export default function SalesManager({
  invoices,
  products,
  config,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice
}: SalesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Invoice Form State
  const [customerName, setCustomerName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [formItems, setFormItems] = useState<{ productId: string; qty: number; price: number }[]>([
    { productId: '', qty: 1, price: 0 }
  ]);

  // Sequential code builder
  const generatedInvoiceNumber = useMemo(() => {
    const d = new Date().getFullYear();
    const count = invoices.length + 1;
    const padded = String(count).padStart(3, '0');
    return `INV-${d}-${padded}`;
  }, [invoices]);

  const handleAddItemLine = () => {
    setFormItems(prev => [...prev, { productId: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItemLine = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index: number, prodId: string) => {
    const selectedProd = products.find(p => p.id === prodId);
    if (selectedProd) {
      setFormItems(prev => {
        const copy = [...prev];
        copy[index].productId = prodId;
        copy[index].price = selectedProd.salesPrice;
        return copy;
      });
    }
  };

  const handleLineQtyChange = (index: number, qtyVal: number) => {
    setFormItems(prev => {
      const copy = [...prev];
      copy[index].qty = qtyVal;
      return copy;
    });
  };

  const handleLinePriceChange = (index: number, pirceVal: number) => {
    setFormItems(prev => {
      const copy = [...prev];
      copy[index].price = pirceVal;
      return copy;
    });
  };

  // Form submit handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    // Filter valid lines
    const finalItems = formItems
      .filter(item => item.productId && item.qty > 0)
      .map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return {
          productId: item.productId,
          name: p ? p.name : 'Unknown Product',
          qty: item.qty,
          price: item.price
        };
      });

    if (finalItems.length === 0) {
      alert("Please specify at least 1 valid product line item.");
      return;
    }

    const subTotal = finalItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const taxAmt = Math.round(subTotal * (config.taxRate / 100));
    const totalAmount = subTotal + taxAmt;

    const invoicePayload: Omit<Invoice, 'id'> = {
      invoiceNumber: generatedInvoiceNumber,
      customerName: customerName.trim(),
      items: finalItems,
      date: new Date().toISOString().split('T')[0],
      deadline: deadline || new Date(Date.now() + 30 * 24 * 365 * 1000).toISOString().split('T')[0],
      status: 'Draft',
      totalAmount,
      taxRate: config.taxRate,
      notes: notes.trim()
    };

    onAddInvoice(invoicePayload);
    setIsCreating(false);

    // Reset fields
    setCustomerName('');
    setDeadline('');
    setNotes('');
    setFormItems([{ productId: '', qty: 1, price: 0 }]);
  };

  // Metrics overview
  const financeMetrics = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalDraft = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    invoices.forEach(inv => {
      if (inv.status === 'Paid') {
        totalPaid += inv.totalAmount;
      } else if (inv.status === 'Pending' || inv.status === 'Shipped') {
        totalPending += inv.totalAmount;
        if (inv.deadline < todayStr) {
          totalOverdue += inv.totalAmount;
        }
      } else {
        totalDraft += inv.totalAmount;
      }
    });

    return { totalPaid, totalPending, totalOverdue, totalDraft };
  }, [invoices]);

  // Filter list
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const currencySymbol = config.currency === 'USD' ? '$' : config.currency === 'EUR' ? '€' : config.currency === 'TRY' ? '₺' : '£';

  return (
    <div className="space-y-6 pt-2 text-left" id="sales-tab-panel">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Commerce Ledger & Invoicing</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish client accounts invoices, track outstanding receivables, and record completed cash events.
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Invoice Wizard</span>
        </button>
      </div>

      {/* Mini Financial Health Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Receipts Booked</p>
          <p className="text-lg font-mono font-bold text-emerald-600">
            {currencySymbol}{financeMetrics.totalPaid.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">Cleared Cash Receipts</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Outstanding Receivables</p>
          <p className="text-lg font-mono font-bold text-indigo-500">
            {currencySymbol}{financeMetrics.totalPending.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">Under Active Invoicing</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-250 dark:border-slate-800 space-y-1 text-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Overdue Exposure</p>
          <p className="text-lg font-mono font-bold text-red-600">
            {currencySymbol}{financeMetrics.totalOverdue.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-red-500">Exceeded Payment Rules</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Draft Estimates</p>
          <p className="text-lg font-mono font-bold text-slate-500">
            {currencySymbol}{financeMetrics.totalDraft.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">In Quotation Status</span>
        </div>
      </div>

      {/* Slide down Invoice Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              <span>Create Dynamic Invoice Profile ({generatedInvoiceNumber})</span>
            </h4>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-450 hover:text-slate-650 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Client / Account Name *</label>
              <input 
                type="text" 
                placeholder="ACME Heavy Machinery Ltd" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Payment Due Deadline *</label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-mono font-bold"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">Invoicing Memo / Notes</label>
              <input 
                type="text" 
                placeholder="Purchase Order: #PO-991, Delivery terms: CIP" 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Itemized Lines */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 px-3.5 py-2 rounded-lg border border-slate-150 dark:border-slate-800">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Line Items List</span>
              <button 
                type="button" 
                onClick={handleAddItemLine}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline uppercase"
              >
                + Add Itemized Line
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/30 dark:bg-slate-950/10 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-left">
                  
                  {/* Product select picker */}
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight">Active SKU Catalog</label>
                    <select 
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl font-bold text-slate-900 dark:text-white"
                      value={item.productId}
                      onChange={e => handleProductChange(index, e.target.value)}
                    >
                      <option value="">-- Choose Product SKU --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku}) -- Price: {currencySymbol}{p.salesPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 space-y-0.5">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight text-right block">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl text-right font-mono font-bold dark:text-white"
                      value={item.qty}
                      onChange={e => handleLineQtyChange(index, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Sales unit cost override */}
                  <div className="w-32 space-y-0.5">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight text-right block">Negotiated Price</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-slate-400 font-bold">{currencySymbol}</span>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-755 rounded-xl text-right font-mono font-bold dark:text-white"
                        value={item.price}
                        onChange={e => handleLinePriceChange(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Calculated Line Value */}
                  <div className="w-28 text-right self-end pb-2">
                    <p className="text-[9px] text-slate-400 font-bold">Line Subtotal</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white">
                      {currencySymbol}{(item.qty * item.price).toLocaleString()}
                    </p>
                  </div>

                  {formItems.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItemLine(index)} 
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg self-end mb-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              Publish Estimate / Draft
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
            placeholder="Search commerce by invoice prefix or client name..." 
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter categories dropdown */}
        <div className="flex items-center gap-2 mt-1 md:mt-0">
          <span className="text-slate-450 uppercase tracking-widest text-[9px] font-bold">Invoiced Status:</span>
          {['All', 'Paid', 'Pending', 'Shipped', 'Draft'].map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)} 
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                statusFilter === f 
                  ? 'bg-indigo-600 text-white shadow-md font-extrabold' 
                  : 'bg-slate-50 dark:bg-slate-950 dark:text-slate-400 hover:text-indigo-600 border border-slate-205 dark:border-slate-850'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main invoices grid and directory layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ledger Invoices listing table (2-Span Column) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50/70 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3">Invoice ID</th>
                  <th className="py-2 px-3">Client / Company Name</th>
                  <th className="py-2 px-3">Termin Date</th>
                  <th className="py-2 px-3 text-right">Value Amount</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-350">
                {filteredInvoices.map((inv) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = (inv.status === 'Pending' || inv.status === 'Shipped') && inv.deadline < todayStr;

                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-950/25 cursor-pointer transition-colors ${
                        selectedInvoice?.id === inv.id ? 'bg-sky-500/[0.04] dark:bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Invoice # */}
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-1.5 px-3">
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="font-bold text-slate-900 dark:text-white uppercase truncate text-[11px]">{inv.customerName}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold">{inv.items.length} item lines defined</p>
                        </div>
                      </td>

                      {/* Deadline & Warning block */}
                      <td className="py-1.5 px-3 text-slate-500 dark:text-slate-400 font-bold">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px]">{new Date(inv.deadline).toLocaleDateString()}</p>
                          {isOverdue && (
                            <span className="text-[8px] text-rose-500 uppercase font-bold flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 shrink-0" /> Out of Rules
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Value Count */}
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {currencySymbol}{inv.totalAmount.toLocaleString()}
                      </td>

                      {/* Invoice phase */}
                      <td className="py-1.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                            : inv.status === 'Pending'
                            ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30'
                            : inv.status === 'Shipped'
                            ? 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-150 dark:border-cyan-900/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Quick updates */}
                      <td className="py-1.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {inv.status === 'Draft' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Pending')}
                              className="px-1.5 py-0.5 bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold rounded text-[9px] uppercase tracking-wider"
                              title="Commit estimate to ledger"
                            >
                              Publish
                            </button>
                          )}

                          {inv.status === 'Pending' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Paid')}
                              className="px-1.5 py-0.5 bg-emerald-500 text-white hover:bg-emerald-400 font-bold rounded text-[9px] uppercase tracking-wider"
                              title="Declare fully paid"
                            >
                              Settle
                            </button>
                          )}

                          {inv.status === 'Paid' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Shipped')}
                              className="px-1.5 py-0.5 bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold rounded text-[9px] uppercase tracking-wider"
                              title="Declare dispatched"
                            >
                              Ship
                            </button>
                          )}

                          <button 
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            title="Discard order record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-450 font-bold uppercase tracking-widest bg-slate-50/10">
                      No invoices identified as matching this query
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Invoice Drilldown Receipt Card Panel (1-Span column) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-5 text-xs">
          {selectedInvoice ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Receipt Header info */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5 text-left">
                  <span className="font-mono text-slate-400 font-bold uppercase text-[9px]">Receipt Sheet</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">{selectedInvoice.invoiceNumber}</h4>
                  <p className="text-[10px] text-slate-500">Issued On: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Client detailed address */}
              <div className="space-y-2 text-left bg-slate-50/70 dark:bg-slate-950/25 p-3.5 rounded-xl border border-slate-150 dark:border-slate-820">
                <p className="text-[9px] uppercase font-black text-indigo-600">Client Recipient</p>
                <h5 className="font-black text-slate-850 dark:text-white text-[13px]">{selectedInvoice.customerName}</h5>
                <p className="text-[10px] text-slate-400 font-medium">Payment Deadline Range: {selectedInvoice.deadline}</p>
              </div>

              {/* Product list */}
              <div className="space-y-2 text-left">
                <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Bill Breakdown</p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
                  {selectedInvoice.items.map((line, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200 uppercase truncate max-w-[150px]">{line.name}</p>
                        <p className="text-[10px] text-slate-500">{line.qty} units × {currencySymbol}{line.price}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {currencySymbol}{(line.qty * line.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated dynamic math block */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800 text-left space-y-2 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Amount:</span>
                  <span>{currencySymbol}{Math.round(selectedInvoice.totalAmount / (1 + selectedInvoice.taxRate / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Sales Tax Rate ({selectedInvoice.taxRate}%):</span>
                  <span>{currencySymbol}{Math.round(selectedInvoice.totalAmount - (selectedInvoice.totalAmount / (1 + selectedInvoice.taxRate / 100))).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 dark:text-white pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span>Ledger Value:</span>
                  <span>{currencySymbol}{selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Outstanding Notes block */}
              {selectedInvoice.notes && (
                <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl text-left border border-slate-150 dark:border-slate-800 mt-2">
                  <span className="text-[8px] font-black uppercase text-indigo-500">Ledger Memo</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 italic mt-0.5">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Quick printing mock block */}
              <button 
                onClick={() => window.print()} 
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform"
              >
                <Receipt className="w-4 h-4" />
                <span>Compile PDF Printout</span>
              </button>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto opacity-40 animate-pulse" />
              <p className="font-bold uppercase tracking-wider text-[10px]">No invoice selected for inspection</p>
              <p className="text-[10px] text-slate-500 font-medium">Highlight any ledger line to inspect receipt summaries or generate PDF prints.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
