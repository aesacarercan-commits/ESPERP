import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Box, Layers, Cpu, Users, Settings, Activity, ArrowUpRight, 
  HelpCircle, Moon, Sun, Monitor, DollarSign, Calendar, SlidersHorizontal, LayoutDashboard,
  Sparkles, ShieldCheck, Clock
} from 'lucide-react';

// Domain imports
import { Product, Invoice, WorkOrder, Employee, ERPConfig, WorkStep } from './types';
import { 
  INITIAL_PRODUCTS, INITIAL_INVOICES, INITIAL_WORK_ORDERS, INITIAL_EMPLOYEES, INITIAL_CONFIG 
} from './data';

// Component imports
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import SalesManager from './components/SalesManager';
import ProductionManager from './components/ProductionManager';
import HRManager from './components/HRManager';
import SettingsManager from './components/SettingsManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('erp_dark_theme');
      return saved === 'true';
    }
    return false;
  });

  // Global ERP Core state values
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('erp_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('erp_work_orders');
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('erp_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [config, setConfig] = useState<ERPConfig>(() => {
    const saved = localStorage.getItem('erp_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  // Safe synchronization loops to persist entries
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('erp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('erp_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('erp_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('erp_config', JSON.stringify(config));
  }, [config]);

  // Handle Dark mode layout attributes
  useEffect(() => {
    localStorage.setItem('erp_dark_theme', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ==========================================
  // CORE DIRECT STATE HANDLERS / MUTATIONS
  // ==========================================

  // 1. Warehouse Stock modifications
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'updatedAt'>) => {
    const item: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [item, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    const withTimestamp = { ...updatedProd, updatedAt: new Date().toISOString() };
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? withTimestamp : p));
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Decommission this inventory SKU? This action is irreversible.")) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const triggerSupplierReorder = (productId: string, customQty: number = 20) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          qty: p.qty + customQty,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // 2. Sales Ledger Invoicing modifications
  const handleAddInvoice = (newInvoice: Omit<Invoice, 'id'>) => {
    const item: Invoice = {
      ...newInvoice,
      id: `inv-${Date.now()}`
    };
    setInvoices(prev => [item, ...prev]);
    
    // Deduct stock levels for corresponding inventory items included inside published invoice
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const itemInInvoice = newInvoice.items.find(itemLine => itemLine.productId === prod.id);
        if (itemInInvoice) {
          return {
            ...prod,
            qty: Math.max(0, prod.qty - itemInInvoice.qty),
            updatedAt: new Date().toISOString()
          };
        }
        return prod;
      });
    });
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm("Delete this invoice record from the system ledger?")) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }
  };

  // 3. Manufacturing Processes modifications
  const handleAddWorkOrder = (newOrder: Omit<WorkOrder, 'id'>) => {
    const item: WorkOrder = {
      ...newOrder,
      id: `wo-${Date.now()}`
    };
    setWorkOrders(prev => [item, ...prev]);
  };

  const handleUpdateStepStatus = (
    orderId: string, 
    stepId: string, 
    status: WorkStep['status'], 
    completedBy?: string
  ) => {
    setWorkOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedSteps = order.steps.map(step => {
            if (step.id === stepId) {
              return {
                ...step,
                status,
                completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
                completedBy: status === 'Completed' ? completedBy : undefined
              };
            }
            return step;
          });

          // Compute automatically overall status if all steps are complete
          const allDone = updatedSteps.every(s => s.status === 'Completed');
          const statusOverride = allDone ? 'Completed' : 'In_Progress';

          return {
            ...order,
            steps: updatedSteps,
            status: order.status === 'Draft' || order.status === 'Scheduled' ? order.status : statusOverride
          };
        }
        return order;
      });
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(w => w.id === orderId ? { ...w, status } : w));
  };

  const handleDeleteWorkOrder = (orderId: string) => {
    setWorkOrders(prev => prev.filter(w => w.id !== orderId));
  };

  // 4. HR Payroll directories modifications
  const handleAddEmployee = (newEmp: Omit<Employee, 'id' | 'paymentHistory'>) => {
    const item: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      paymentHistory: []
    };
    setEmployees(prev => [item, ...prev]);
  };

  const handlePaySalary = (empId: string, month: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setEmployees(prev => prev.map(e => {
        if (e.id === empId) {
          const alreadyPaid = e.paymentHistory.some(p => p.month === month);
          if (alreadyPaid) return e;
          
          return {
            ...e,
            paymentHistory: [
              ...e.paymentHistory,
              {
                month,
                amount: e.salary,
                paidAt: new Date().toISOString().split('T')[0]
              }
            ]
          };
        }
        return e;
      }));
    }
  };

  const handlePayAllSalaries = (month: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.status !== 'Active') return e;
      const alreadyPaid = e.paymentHistory.some(p => p.month === month);
      if (alreadyPaid) return e;

      return {
        ...e,
        paymentHistory: [
          ...e.paymentHistory,
          {
            month,
            amount: e.salary,
            paidAt: new Date().toISOString().split('T')[0]
          }
        ]
      };
    }));
  };

  const handleDeleteEmployee = (empId: string) => {
    if (confirm("Terminate employee contract and archive personnel file?")) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
    }
  };

  // 5. Config controls & factories
  const handleUpdateConfig = (newConfig: ERPConfig) => {
    setConfig(newConfig);
  };

  const handleFactoryReset = () => {
    setProducts(INITIAL_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setEmployees(INITIAL_EMPLOYEES);
    setConfig(INITIAL_CONFIG);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      
      {/* 1. Left Core Nav Sidebar rail */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-[#0f172a] border-r border-[#1e293b] text-slate-400 shrink-0 sticky top-0 h-screen select-none z-20">
        
        {/* Core Top Title Info */}
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[24px] h-[24px] bg-[#38bdf8] rounded flex items-center justify-center text-[11px] text-slate-950 font-black">
              NE
            </div>
            <div className="text-left font-bold tracking-wider text-slate-200 uppercase text-[11px] leading-tight">
              NEXUS ERP v2.4
              <span className="text-[9px] text-sky-400 block font-medium capitalize tracking-wide">Enterprise Command</span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Rails */}
        <nav className="flex-1 px-0 py-4 space-y-0.5 text-left text-xs font-semibold">
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'dashboard' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'inventory' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 shrink-0" />
            <span>Inventory & SKU</span>
          </button>

          <button 
            onClick={() => setActiveTab('sales')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'sales' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span>Finance Control</span>
          </button>

          <button 
            onClick={() => setActiveTab('manufacturing')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'manufacturing' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>Manufacturing</span>
          </button>

          <button 
            onClick={() => setActiveTab('hr')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'hr' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>HR & Employees</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left text-[11px] uppercase tracking-wider ${
              activeTab === 'settings' 
                ? 'bg-[#334155] text-[#38bdf8] border-l-[3px] border-[#38bdf8]' 
                : 'hover:bg-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Settings</span>
          </button>

        </nav>

        {/* Sidebar Footer details */}
        <div className="p-4 border-t border-[#1e293b] space-y-3">
          <div className="flex items-center gap-2.5 bg-[#0b0f19] p-3 rounded-lg border border-[#1e293b] text-left text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-200 leading-none">Security System</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Session Secured</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Nova Forge Tech v2.4</p>
        </div>

      </aside>

      {/* 2. Main content container view */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header banner */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-xs backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
          
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-[#38bdf8] p-1.5 rounded text-slate-950">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left font-bold tracking-wider text-slate-900 dark:text-white uppercase text-[11px] leading-none">
              NEXUS ERP v2.4
            </div>
          </div>

          {/* Active section log identifier */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
            <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
            <span className="uppercase text-[9px] tracking-wider text-slate-400">Environment Location</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 dark:text-slate-200 uppercase tracking-tight font-extrabold font-mono">{activeTab}</span>
          </div>

          {/* Header Action widgets (Dark mode toggle, compact mobile nav) */}
          <div className="flex items-center gap-2">
            
            {/* Standard Mobile Navigation tabs slider */}
            <div className="flex lg:hidden items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded scrollbar-none overflow-x-auto max-w-[200px] sm:max-w-none text-[9px] font-bold uppercase">
              {['dashboard', 'inventory', 'sales', 'manufacturing', 'hr'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-1.5 py-1 rounded transition-all ${
                    activeTab === tab 
                      ? 'bg-sky-500 text-slate-950 font-black' 
                      : 'text-slate-550 text-slate-500'
                  }`}
                >
                  {tab.slice(0, 4)}
                </button>
              ))}
            </div>

            {/* Dark theme toggle button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-500 hover:border-sky-400 border border-slate-200/35 dark:border-slate-700/35 transition-all shadow-xs"
              title="Toggle application style theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

          </div>
        </header>

        {/* Render active tabs views with smooth entrance padding */}
        <main className="flex-1 p-3.5 md:p-5 space-y-4 max-w-[1366px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              invoices={invoices}
              workOrders={workOrders}
              employees={employees}
              config={config}
              setActiveTab={setActiveTab}
              triggerSupplierReorder={triggerSupplierReorder}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager 
              products={products}
              config={config}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              triggerSupplierReorder={triggerSupplierReorder}
            />
          )}

          {activeTab === 'sales' && (
            <SalesManager 
              invoices={invoices}
              products={products}
              config={config}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {activeTab === 'manufacturing' && (
            <ProductionManager 
              workOrders={workOrders}
              employees={employees}
              onAddWorkOrder={handleAddWorkOrder}
              onUpdateStepStatus={handleUpdateStepStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteWorkOrder={handleDeleteWorkOrder}
            />
          )}

          {activeTab === 'hr' && (
            <HRManager 
              employees={employees}
              config={config}
              onAddEmployee={handleAddEmployee}
              onPaySalary={handlePaySalary}
              onPayAllSalaries={handlePayAllSalaries}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager 
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onFactoryReset={handleFactoryReset}
            />
          )}
        </main>

      </div>

    </div>
  );
}
