import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, DollarSign, FileText, CheckCircle2, Truck, AlertCircle, Trash2, Clock, 
  X, Check, Receipt, ChevronDown, Calendar, CreditCard, ExternalLink, RefreshCw
} from 'lucide-react';
import { Invoice, Product, ERPConfig } from '../types';
import { getTranslation, Language } from '../lib/translations';

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

  const currentLang = config.language || 'en';

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
      alert(currentLang === 'tr' ? "Lütfen en az 1 adet geçerli kalem ürünü belirtin." : "Please specify at least 1 valid product line item.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs animate-in fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getTranslation(currentLang, 'commerce_ledger_invoicing')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getTranslation(currentLang, 'commerce_ledger_descr')}
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(currentLang, 'add_invoice')}</span>
        </button>
      </div>

      {/* Mini Financial Health Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'receipts_booked')}</p>
          <p className="text-lg font-mono font-bold text-emerald-600">
            {currencySymbol}{financeMetrics.totalPaid.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">{currentLang === 'tr' ? 'Tahsil Edilen Tutar' : 'Cleared Cash Receipts'}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-semibold">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'outstanding_receivables')}</p>
          <p className="text-lg font-mono font-bold text-[#0ea5e9]">
            {currencySymbol}{financeMetrics.totalPending.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">{currentLang === 'tr' ? 'Tahsilat Bekleyen Senet' : 'Under Active Invoicing'}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-250 dark:border-slate-800 space-y-1 text-xs relative overflow-hidden font-medium">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'overdue_exposure')}</p>
          <p className="text-lg font-mono font-bold text-red-600">
            {currencySymbol}{financeMetrics.totalOverdue.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-red-500">{currentLang === 'tr' ? 'Vadesi Geçmiş Tutar' : 'Exceeded Payment Rules'}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-semibold font-mono">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'draft_estimates')}</p>
          <p className="text-lg font-mono font-bold text-slate-500">
            {currencySymbol}{financeMetrics.totalDraft.toLocaleString()}
          </p>
          <span className="text-[9px] font-bold text-slate-400">{currentLang === 'tr' ? 'Teklif Aşamasında' : 'In Quotation Status'}</span>
        </div>
      </div>

      {/* Slide down Invoice Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-5 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              <span>{currentLang === 'tr' ? `Dinamik Fatura Profili Oluştur (${generatedInvoiceNumber})` : `Create Dynamic Invoice Profile (${generatedInvoiceNumber})`}</span>
            </h4>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-450 hover:text-slate-650 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Müşteri / Cari Ünvanı' : 'Client / Account Name'} *
              </label>
              <input 
                type="text" 
                placeholder="ACME Heavy Machinery Ltd" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Ödeme Vade Tarihi' : 'Payment Due Deadline'} *
              </label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-mono font-bold"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {currentLang === 'tr' ? 'Fatura Notları' : 'Invoicing Memo / Notes'}
              </label>
              <input 
                type="text" 
                placeholder="Purchase Order: #PO-991, Delivery terms: CIP" 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-850 dark:text-white font-bold"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Itemized Lines */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 px-3.5 py-2 rounded-lg border border-slate-150 dark:border-slate-800">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{currentLang === 'tr' ? 'Fatura Kalemleri' : 'Line Items List'}</span>
              <button 
                type="button" 
                onClick={handleAddItemLine}
                className="text-[10px] text-sky-500 font-extrabold hover:underline uppercase cursor-pointer"
              >
                + {currentLang === 'tr' ? 'Kalem Satırı Ekle' : 'Add Itemized Line'}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/30 dark:bg-slate-950/10 p-3 rounded-xl border border-dashed border-slate-100 dark:border-slate-800 text-xs text-left animate-in fade-in">
                  
                  {/* Product select picker */}
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight">{currentLang === 'tr' ? 'Ürün Seçiniz' : 'Active SKU Catalog'}</label>
                    <select 
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl font-bold text-slate-900 dark:text-white"
                      value={item.productId}
                      onChange={e => handleProductChange(index, e.target.value)}
                    >
                      <option value="">-- {currentLang === 'tr' ? 'Seçiniz' : 'Choose Product SKU'} --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku}) -- Price: {currencySymbol}{p.salesPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 space-y-0.5">
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight text-right block">{currentLang === 'tr' ? 'Adet' : 'Quantity'}</label>
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
                    <label className="text-[9px] text-slate-450 uppercase font-bold tracking-tight text-right block">{currentLang === 'tr' ? 'Anlaşmalı Fiyat' : 'Negotiated Price'}</label>
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
                    <p className="text-[9px] text-slate-400 font-bold">{currentLang === 'tr' ? 'Ara Toplam' : 'Line Subtotal'}</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white">
                      {currencySymbol}{(item.qty * item.price).toLocaleString()}
                    </p>
                  </div>

                  {formItems.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItemLine(index)} 
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/10 rounded-lg self-end mb-1 cursor-pointer"
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
              className="px-4 py-2 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
            >
              {getTranslation(currentLang, 'cancel')}
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              {currentLang === 'tr' ? 'Teklif / Taslak Oluştur' : 'Publish Estimate / Draft'}
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
            placeholder={currentLang === 'tr' ? 'Faturaları numara veya müşteri adına göre arayın...' : 'Search commerce by invoice prefix or client name...'}
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter categories dropdown */}
        <div className="flex items-center gap-2 mt-1 md:mt-0 flex-wrap">
          <span className="text-slate-450 uppercase tracking-widest text-[9px] font-bold">{currentLang === 'tr' ? 'Fatura Statüsü' : 'Invoiced Status'}:</span>
          {['All', 'Paid', 'Pending', 'Shipped', 'Draft'].map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)} 
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                statusFilter === f 
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold' 
                  : 'bg-slate-55 dark:bg-slate-950 dark:text-slate-400 hover:text-sky-500 border border-slate-205 dark:border-slate-850'
              }`}
            >
              {f === 'All' ? getTranslation(currentLang, 'all') : f}
            </button>
          ))}
        </div>
      </div>

      {/* Main invoices grid and directory layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ledger Invoices listing table (2-Span Column) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xs overflow-hidden text-xs">
          <div className="overflow-x-auto font-medium">
            <table className="w-full text-left border-collapse text-[11px] text-slate-650 dark:text-slate-350">
              <thead className="bg-slate-50/70 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  <th className="py-2.5 px-3">{currentLang === 'tr' ? 'Fatura ID' : 'Invoice ID'}</th>
                  <th className="py-2.5 px-3">{currentLang === 'tr' ? 'Müşteri / Cari Ünvanı' : 'Client / Company Name'}</th>
                  <th className="py-2.5 px-3">{currentLang === 'tr' ? 'Vade Tarihi' : 'Termin Date'}</th>
                  <th className="py-2.5 px-3 text-right">{currentLang === 'tr' ? 'Genel Toplam' : 'Value Amount'}</th>
                  <th className="py-2.5 px-3 text-center">{currentLang === 'tr' ? 'Statü' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{currentLang === 'tr' ? 'İşlemler' : 'Operations'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-2 px-3">
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="font-bold text-slate-900 dark:text-white uppercase truncate text-[11px]">{inv.customerName}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold">{inv.items.length} {currentLang === 'tr' ? 'kalem tanımlı' : 'item lines defined'}</p>
                        </div>
                      </td>

                      {/* Deadline & Warning block */}
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-bold">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[10px]">{new Date(inv.deadline).toLocaleDateString()}</p>
                          {isOverdue && (
                            <span className="text-[8px] text-rose-500 uppercase font-bold flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 shrink-0 animate-pulse" /> {currentLang === 'tr' ? 'Vadesi Geçmiş' : 'Out of Rules'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Value Count */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {currencySymbol}{inv.totalAmount.toLocaleString()}
                      </td>

                      {/* Invoice phase */}
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                            : inv.status === 'Pending'
                            ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30'
                            : inv.status === 'Shipped'
                            ? 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-150 dark:border-cyan-900/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-505'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Quick updates */}
                      <td className="py-2 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {inv.status === 'Draft' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Pending')}
                              className="px-1.5 py-0.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider cursor-pointer"
                              title={currentLang === 'tr' ? 'Ledgera Gönder' : 'Commit estimate to ledger'}
                            >
                              {currentLang === 'tr' ? 'Yayınla' : 'Publish'}
                            </button>
                          )}

                          {inv.status === 'Pending' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Paid')}
                              className="px-1.5 py-0.5 bg-emerald-500 hover:bg-emerald-450 text-white font-extrabold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                              title={currentLang === 'tr' ? 'Tahsil Edildi' : 'Declare fully paid'}
                            >
                              {currentLang === 'tr' ? 'Kapat' : 'Settle'}
                            </button>
                          )}

                          {inv.status === 'Paid' && (
                            <button 
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Shipped')}
                              className="px-1.5 py-0.5 bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                              title={currentLang === 'tr' ? 'Kargoya Verildi' : 'Declare dispatched'}
                            >
                              {currentLang === 'tr' ? 'Gönder' : 'Ship'}
                            </button>
                          )}

                          <button 
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                            title={currentLang === 'tr' ? 'Faturayı İptal Et' : 'Discard order record'}
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
                      {currentLang === 'tr' ? 'Arama kriterlerine uygun fatura bulunamadı' : 'No invoices identified as matching this query'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice details sheet drawer pane (1-Span) */}
        <div>
          {selectedInvoice ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-sky-500 font-bold text-[10px] block leading-none">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    {currentLang === 'tr' ? 'BİLGİ YAPRAĞI' : 'LEDGER ACCOUNT'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status block info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8.5px] uppercase tracking-widest font-black text-slate-400">{currentLang === 'tr' ? 'CARİ HESAP' : 'CLIENT CARD'}</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-white uppercase leading-tight mt-0.5">{selectedInvoice.customerName}</p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-black tracking-wider uppercase ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedInvoice.status === 'Pending' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' :
                    selectedInvoice.status === 'Shipped' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Deadline & Date parameters */}
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-805">
                <div>
                  <span className="block text-[8px] font-black text-slate-450 uppercase leading-normal">{currentLang === 'tr' ? 'DÜZENLEME TARİHİ' : 'ISSUED ON'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-300">{selectedInvoice.date}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-450 uppercase leading-normal">{currentLang === 'tr' ? 'VADE TARİHİ' : 'DUE DEADLINE'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-300">{selectedInvoice.deadline}</span>
                </div>
              </div>

              {/* Itemized product lists table */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block">{currentLang === 'tr' ? 'DETAYLI KALEM DÖKÜMÜ' : 'ITEMIZED BREAKDOWN'}</span>
                
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-955/25 p-2 rounded-lg border border-slate-150/40 dark:border-slate-800 text-[10.5px]">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="block font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{it.name}</span>
                        <span className="text-[9px] text-slate-400 block leading-none">{it.qty} pcs x {currencySymbol}{it.price}</span>
                      </div>
                      <span className="font-mono font-black text-slate-800 dark:text-slate-200 shrink-0 ml-2">
                        {currencySymbol}{(it.qty * it.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sequential summary ledger math */}
              {(() => {
                const subTotal = selectedInvoice.items.reduce((acc, it) => acc + (it.qty * it.price), 0);
                const taxVal = Math.round(subTotal * (selectedInvoice.taxRate / 100));

                return (
                  <div className="space-y-1.5 pt-2 border-t border-slate-150 dark:border-slate-800 text-[10.5px] font-bold text-slate-650 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">{currentLang === 'tr' ? 'Ara Toplam' : 'Subtotal'}</span>
                      <span className="font-mono">{currencySymbol}{subTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">{currentLang === 'tr' ? 'KDV' : 'Sales Tax'} (%{selectedInvoice.taxRate})</span>
                      <span className="font-mono">+{currencySymbol}{taxVal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                      <span>{currentLang === 'tr' ? 'Genel Toplam' : 'Grand Total'}</span>
                      <span className="font-mono text-emerald-500 text-sm">{currencySymbol}{selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              {selectedInvoice.notes && (
                <div className="mt-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-805 text-[9.5px] italic text-slate-400 leading-relaxed">
                  <span className="block font-bold uppercase tracking-wider text-[8px] text-slate-450 not-italic mb-0.5 leading-none">{currentLang === 'tr' ? 'Fatura Notu' : 'Memo Notes'}</span>
                  "{selectedInvoice.notes}"
                </div>
              )}

              {/* Status specific footer action details */}
              <div className="pt-2 flex justify-stretch gap-2">
                {selectedInvoice.status === 'Draft' && (
                  <button 
                    onClick={() => { onUpdateInvoiceStatus(selectedInvoice.id, 'Pending'); setSelectedInvoice(null); }}
                    className="w-full bg-[#0ea5e9] text-slate-950 font-black py-2 rounded-xl text-[10.5px] uppercase tracking-wider cursor-pointer"
                  >
                    {currentLang === 'tr' ? 'Ledgera Kaydet & Yayınla' : 'Commit & Send to Client'}
                  </button>
                )}

                {selectedInvoice.status === 'Pending' && (
                  <button 
                    onClick={() => { onUpdateInvoiceStatus(selectedInvoice.id, 'Paid'); setSelectedInvoice(null); }}
                    className="w-full bg-emerald-500 text-white font-black py-2 rounded-xl text-[10.5px] uppercase tracking-wider cursor-pointer"
                  >
                    {currentLang === 'tr' ? 'Ödemeyi Tahsil Et' : 'Clear & Cash-In Receipt'}
                  </button>
                )}

                {selectedInvoice.status === 'Paid' && (
                  <button 
                    onClick={() => { onUpdateInvoiceStatus(selectedInvoice.id, 'Shipped'); setSelectedInvoice(null); }}
                    className="w-full bg-[#0ea5e9] text-slate-950 font-bold py-2 rounded-xl text-[10.5px] uppercase tracking-wider cursor-pointer"
                  >
                    {currentLang === 'tr' ? 'Sevk Et' : 'Dispatched to Transport'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-205 dark:border-slate-800 rounded-2xl py-20 text-center text-slate-450 font-semibold space-y-2">
              <Receipt className="w-10 h-10 text-slate-350 mx-auto animate-pulse" />
              <p className="uppercase tracking-widest text-[9.5px] font-bold text-slate-500">{currentLang === 'tr' ? 'Fatura Seçilmedi' : 'No Invoice Chosen'}</p>
              <p className="text-[10px] max-w-[200px] mx-auto text-slate-400">{currentLang === 'tr' ? 'KDV rasyolarını, kalem detaylarını ve ödeme geçmişini görüntülemek için soldan bir fatura seçin.' : 'Select any active invoice from the left register to verify details, print records or reconcile pay.'}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
