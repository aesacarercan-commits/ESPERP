import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Warehouse, ChevronDown, Trash2, Edit2, CheckCircle, X,
  ChevronUp, Layers
} from 'lucide-react';
import { Product, ERPConfig } from '../types';
import { getTranslation, Language } from '../lib/translations';

interface InventoryManagerProps {
  products: Product[];
  config: ERPConfig;
  onAddProduct: (prod: Omit<Product, 'id' | 'updatedAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  triggerSupplierReorder: (productId: string, customQty?: number) => void;
}

export default function InventoryManager({
  products,
  config,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  triggerSupplierReorder
}: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'low' | 'out' | 'nominal'>('All');
  const [sortField, setSortField] = useState<'qty' | 'name' | 'salesPrice'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-state forms
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentLang = config.language || 'en';

  // New item Form Values
  const [newProd, setNewProd] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    qty: 15,
    minQty: 10,
    purchasePrice: 20,
    salesPrice: 45,
    location: 'Aisle A - Row 1'
  });

  // Edit fields placeholder
  const [editForm, setEditForm] = useState<Product | null>(null);

  // Categories helper
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => list.add(p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Handle addition
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim() || !newProd.sku.trim()) return;
    onAddProduct(newProd);
    setIsAdding(false);
    // Reset form
    setNewProd({
      sku: '',
      name: '',
      category: 'Electronics',
      qty: 15,
      minQty: 10,
      purchasePrice: 20,
      salesPrice: 45,
      location: 'Aisle A - Row 1'
    });
  };

  // Helper code to generate unique SKU automatically
  const generateSku = () => {
    const caps = newProd.name.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setNewProd(prev => ({ ...prev, sku: `SKU-${caps || 'PRD'}-${rand}` }));
  };

  // Handle edit entry
  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  // Handle edit commit
  const saveEditedProduct = () => {
    if (editForm) {
      onUpdateProduct(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  // Filtered and Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        
        let matchesStock = true;
        if (stockFilter === 'low') {
          matchesStock = p.qty > 0 && p.qty <= p.minQty;
        } else if (stockFilter === 'out') {
          matchesStock = p.qty === 0;
        } else if (stockFilter === 'nominal') {
          matchesStock = p.qty > p.minQty;
        }

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc' 
            ? fieldA.localeCompare(fieldB) 
            : fieldB.localeCompare(fieldA);
        } else {
          const numA = (fieldA as number) || 0;
          const numB = (fieldB as number) || 0;
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortField, sortOrder]);

  const toggleSort = (field: 'qty' | 'name' | 'salesPrice') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const symbol = config.currency === 'USD' ? '$' : config.currency === 'EUR' ? '€' : config.currency === 'TRY' ? '₺' : '£';

  return (
    <div className="space-y-4 pt-1 text-left" id="inventory-tab-panel">
      
      {/* Action header panel bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-sky-505 text-[#0ea5e9]" />
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getTranslation(currentLang, 'warehouse_master_directory')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getTranslation(currentLang, 'warehouse_control_descr')}
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(currentLang, 'add_new_sku')}</span>
        </button>
      </div>

      {/* Add New Stock Item form fold-out */}
      {isAdding && (
        <form onSubmit={handleAddNewSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
              {getTranslation(currentLang, 'provision_sku')}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'product_name')} *
              </label>
              <input 
                type="text" 
                placeholder="Microchip Assembly X" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.name}
                onChange={e => setNewProd(prev => ({ ...prev, name: e.target.value }))}
                onBlur={() => !newProd.sku && generateSku()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block flex justify-between">
                <span>{getTranslation(currentLang, 'sku_code')} *</span>
                <button type="button" onClick={generateSku} className="text-[10px] text-sky-500 hover:underline cursor-pointer">
                  {currentLang === 'tr' ? 'Oluştur' : 'Generate'}
                </button>
              </label>
              <input 
                type="text" 
                placeholder="SKU-XXX-01" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-mono text-slate-800 dark:text-white font-bold"
                value={newProd.sku}
                onChange={e => setNewProd(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'category')} *
              </label>
              <select 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-850 dark:text-white"
                value={newProd.category}
                onChange={e => setNewProd(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Electronics">Electronics</option>
                <option value="Structures">Structures</option>
                <option value="Cooling">Cooling</option>
                <option value="Sensors">Sensors</option>
                <option value="Motors">Motors</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'rack_location')}
              </label>
              <input 
                type="text" 
                placeholder="Aisle A - Row 4" 
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.location}
                onChange={e => setNewProd(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'initial_qty')} *
              </label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.qty}
                onChange={e => setNewProd(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'safety_buffer')} *
              </label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.minQty}
                onChange={e => setNewProd(prev => ({ ...prev, minQty: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'unit_purchase')} ({symbol}) *
              </label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.purchasePrice}
                onChange={e => setNewProd(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide block">
                {getTranslation(currentLang, 'expected_sales')} ({symbol}) *
              </label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                required
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                value={newProd.salesPrice}
                onChange={e => setNewProd(prev => ({ ...prev, salesPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 text-xs">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
            >
              {getTranslation(currentLang, 'cancel')}
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-400 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              {getTranslation(currentLang, 'publish_sku')}
            </button>
          </div>
        </form>
      )}

      {/* Directory Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 text-xs">
        
        {/* Simple Search bar */}
        <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder={getTranslation(currentLang, 'search_sku')}
            className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white w-full placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter categories dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'category')}:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">{getTranslation(currentLang, 'all')}</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">{getTranslation(currentLang, 'stock_range')}:</span>
            <select 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold px-2 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
            >
              <option value="All">{getTranslation(currentLang, 'all_ranges')}</option>
              <option value="low">{getTranslation(currentLang, 'low_safety')}</option>
              <option value="out">{getTranslation(currentLang, 'completely_depleted')}</option>
              <option value="nominal">{getTranslation(currentLang, 'nominal_healthy')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Core Inventory Directory Table rendering */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xs overflow-hidden scrollbar-thin">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-650 dark:text-slate-350 border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <span>{getTranslation(currentLang, 'product_detail')}</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />)}
                  </button>
                </th>
                <th className="py-2.5 px-3 font-semibold">{getTranslation(currentLang, 'sku_id')}</th>
                <th className="py-2.5 px-3 font-semibold">{getTranslation(currentLang, 'rack_location')}</th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => toggleSort('qty')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <span>{getTranslation(currentLang, 'stock_level')}</span>
                    {sortField === 'qty' && (sortOrder === 'asc' ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />)}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right font-semibold">{currentLang === 'tr' ? 'Alış Fiyatı' : 'Purchase'} ({symbol})</th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => toggleSort('salesPrice')} className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <span>{getTranslation(currentLang, 'expected_sales')} ({symbol})</span>
                    {sortField === 'salesPrice' && (sortOrder === 'asc' ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />)}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right font-semibold">{getTranslation(currentLang, 'expected_margin')}</th>
                <th className="py-2.5 px-3 text-center font-semibold">{getTranslation(currentLang, 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const isEditing = editingId === p.id;
                const margin = p.salesPrice - p.purchasePrice;
                const marginPercent = p.purchasePrice > 0 ? Math.round((margin / p.purchasePrice) * 100) : 0;
                
                // Status markers
                const isOut = p.qty === 0;
                const isLow = p.qty > 0 && p.qty <= p.minQty;

                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors ${
                      isOut ? 'bg-red-500/[0.02] dark:bg-red-950/[0.04]' : isLow ? 'bg-amber-500/[0.02] dark:bg-amber-950/[0.04]' : ''
                    }`}
                  >
                    
                    {/* Column 1: Product detail */}
                    <td className="py-2 px-3">
                      <div className="space-y-0.5 max-w-[240px]">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded outline-none font-bold text-slate-850 dark:text-white text-[11px]"
                            value={editForm?.name || ''}
                            onChange={e => setEditForm(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white uppercase truncate text-[11px]">{p.name}</span>
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase px-1 py-0.2 rounded">
                              {p.category}
                            </span>
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 uppercase font-medium max-w-full truncate block leading-none">
                          {currentLang === 'tr' ? 'Güncelleme: ' : 'Updated: '} {new Date(p.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Column 2: SKU */}
                    <td className="py-2 px-3 font-mono font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                      {isEditing ? (
                        <input 
                            type="text" 
                            className="w-full px-2 py-0.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded outline-none font-mono text-[10px] dark:text-white font-bold"
                            value={editForm?.sku || ''}
                            onChange={e => setEditForm(prev => prev ? ({ ...prev, sku: e.target.value }) : null)}
                        />
                      ) : p.sku}
                    </td>

                    {/* Column 3: Location rack */}
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="w-full px-2 py-0.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded outline-none text-[10px] dark:text-white font-bold"
                          value={editForm?.location || ''}
                          onChange={e => setEditForm(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                        />
                      ) : p.location || (currentLang === 'tr' ? 'Belirtilmedi' : 'Not Specified')}
                    </td>

                    {/* Column 4: Stock level Qty */}
                    <td className="py-2 px-3 text-right font-bold">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5 items-center">
                          <input 
                            type="number" 
                            className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded text-right outline-none text-[11px] dark:text-white font-bold"
                            value={editForm?.qty ?? 0}
                            onChange={e => setEditForm(prev => prev ? ({ ...prev, qty: parseInt(e.target.value) || 0 }) : null)}
                          />
                        </div>
                      ) : (
                        <div className="space-y-0.5 text-right inline-block">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className={`text-sm font-bold font-mono tracking-tight ${
                              isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-800 dark:text-white'
                            }`}>
                              {p.qty}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{currentLang === 'tr' ? 'adet' : 'units'}</span>
                          </div>
                          
                          {isOut ? (
                            <span className="text-[9px] font-black uppercase text-red-500 block">{getTranslation(currentLang, 'completely_depleted')}</span>
                          ) : isLow ? (
                            <span className="text-[9px] font-black uppercase text-amber-500 block">
                              {currentLang === 'tr' ? `Emniyet limitinin altında (${p.minQty})` : `Below Safety limit (${p.minQty})`}
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-500 uppercase font-black block">
                              {currentLang === 'tr' ? `Güvenli (${p.minQty})` : `Safety secured (${p.minQty})`}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Column 5: Purchase price */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-500 dark:text-slate-400">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded text-right outline-none text-[11px] dark:text-white font-bold"
                          value={editForm?.purchasePrice ?? 0}
                          onChange={e => setEditForm(prev => prev ? ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }) : null)}
                        />
                      ) : (
                        p.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      )}
                    </td>

                    {/* Column 6: Sales price */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-850 dark:text-white">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800 rounded text-right outline-none text-[11px] dark:text-white font-bold"
                          value={editForm?.salesPrice ?? 0}
                          onChange={e => setEditForm(prev => prev ? ({ ...prev, salesPrice: parseFloat(e.target.value) || 0 }) : null)}
                        />
                      ) : (
                        p.salesPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      )}
                    </td>

                    {/* Column 7: Margin */}
                    <td className="py-2 px-3 text-right font-mono text-[10px]">
                      <span className="text-emerald-555 text-emerald-500 font-bold block">
                        +{margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-450">({marginPercent}%)</span>
                    </td>

                    {/* Column 8: Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={saveEditedProduct}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
                              title={currentLang === 'tr' ? 'Kaydet' : 'Commit edits'}
                            >
                              <CheckCircle className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setEditForm(null); }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded border border-red-100 dark:border-red-900/40 cursor-pointer"
                              title={currentLang === 'tr' ? 'Vazgeç' : 'Discard edits'}
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(p)}
                              className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title={currentLang === 'tr' ? 'Düzenle' : 'Edit Item details'}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            
                            {(p.qty <= p.minQty) && (
                              <button 
                                onClick={() => triggerSupplierReorder(p.id)}
                                className="px-1.5 py-0.5 bg-sky-500 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider shrink-0 cursor-pointer"
                                title={currentLang === 'tr' ? 'Sipariş Ver' : 'Add 20 units via instant restock request'}
                              >
                                {getTranslation(currentLang, 'restock')}
                              </button>
                            )}
                            
                            <button 
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-3.5 sm:p-1 text-slate-400 hover:text-red-505 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title={currentLang === 'tr' ? 'Sil' : 'Decommission SKU'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/10">
                    {currentLang === 'tr' 
                      ? 'Arama kriterlerine uygun stok kaydı bulunamadı' 
                      : 'No items in stock directory matched this query'}
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
