import { Product, Invoice, WorkOrder, Employee, ERPConfig } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'SKU-QPC-02',
    name: 'Quantum Process Chip S2',
    category: 'Electronics',
    qty: 4, // 4 units (under minQty of 10)
    minQty: 10,
    purchasePrice: 120,
    salesPrice: 249,
    location: 'Aisle A - Tier 3',
    updatedAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'prod-2',
    sku: 'SKU-ACF-10',
    name: 'Aluminum Chassis Frame 10U',
    category: 'Structures',
    qty: 45,
    minQty: 15,
    purchasePrice: 45,
    salesPrice: 95,
    location: 'Aisle F - Row 2',
    updatedAt: '2026-05-15T14:22:00Z',
  },
  {
    id: 'prod-3',
    sku: 'SKU-CHP-09',
    name: 'Copper Heat Pipe Assembly',
    category: 'Cooling',
    qty: 12,
    minQty: 20, // Low stock
    purchasePrice: 18,
    salesPrice: 42,
    location: 'Aisle C - Tier 1',
    updatedAt: '2026-05-19T08:15:00Z',
  },
  {
    id: 'prod-4',
    sku: 'SKU-OCM-88',
    name: 'Optoelectronic Coupler Module',
    category: 'Electronics',
    qty: 0, // Out of stock
    minQty: 5,
    purchasePrice: 75,
    salesPrice: 145,
    location: 'Aisle A - Tier 4',
    updatedAt: '2026-05-10T11:45:00Z',
  },
  {
    id: 'prod-5',
    sku: 'SKU-PPS-FX',
    name: 'Pneumatic Pressure Sensor FX',
    category: 'Sensors',
    qty: 85,
    minQty: 25,
    purchasePrice: 32,
    salesPrice: 79,
    location: 'Aisle D - Row 4',
    updatedAt: '2026-05-20T04:10:00Z',
  },
  {
    id: 'prod-6',
    sku: 'SKU-SRM-42',
    name: 'Servo Rotational Motor SR-42',
    category: 'Motors',
    qty: 18,
    minQty: 10,
    purchasePrice: 110,
    salesPrice: 220,
    location: 'Aisle E - Tier 2',
    updatedAt: '2026-05-19T16:50:00Z',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-001',
    customerName: 'AeroSpace Dynamic Systems',
    items: [
      { productId: 'prod-1', name: 'Quantum Process Chip S2', qty: 20, price: 235 },
      { productId: 'prod-2', name: 'Aluminum Chassis Frame 10U', qty: 10, price: 90 }
    ],
    date: '2026-05-02',
    deadline: '2026-06-02',
    status: 'Paid',
    totalAmount: 5600,
    taxRate: 20,
    notes: 'Electronic delivery signed. 2-year enterprise support warranty active.'
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV-2026-002',
    customerName: 'Stellar Tech Laboratories',
    items: [
      { productId: 'prod-5', name: 'Pneumatic Pressure Sensor FX', qty: 15, price: 79 },
      { productId: 'prod-3', name: 'Copper Heat Pipe Assembly', qty: 30, price: 40 }
    ],
    date: '2026-05-12',
    deadline: '2026-06-12',
    status: 'Pending',
    totalAmount: 2385,
    taxRate: 20,
    notes: 'Half pre-paid. Final release subject to delivery compliance testing.'
  },
  {
    id: 'inv-1003',
    invoiceNumber: 'INV-2026-003',
    customerName: 'Apex Medical Systems Corp',
    items: [
      { productId: 'prod-6', name: 'Servo Rotational Motor SR-42', qty: 5, price: 220 }
    ],
    date: '2026-05-16',
    deadline: '2026-05-30',
    status: 'Shipped',
    totalAmount: 1100,
    taxRate: 20,
    notes: 'Shipped via DHL. Tracking Ref: #DHL-99482-SYS.'
  },
  {
    id: 'inv-1004',
    invoiceNumber: 'INV-2026-004',
    customerName: 'Vanguard Robotic Solutions',
    items: [
      { productId: 'prod-1', name: 'Quantum Process Chip S2', qty: 2, price: 249 }
    ],
    date: '2026-05-19',
    deadline: '2026-06-19',
    status: 'Draft',
    totalAmount: 498,
    taxRate: 20,
    notes: 'Awaiting client technical spec signoff before final invoicing.'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-101',
    orderNumber: 'MFR-2026-101',
    productName: 'Chamber Assembly Level C',
    qty: 5,
    targetDate: '2026-05-28',
    priority: 'High',
    status: 'In_Progress',
    steps: [
      { id: 'step-1', name: 'Material Prep & Cutting', status: 'Completed', completedAt: '2026-05-19T09:00:00Z', completedBy: 'Marcus Sterling' },
      { id: 'step-2', name: 'Precision CNC Mill', status: 'Completed', completedAt: '2026-05-19T14:30:00Z', completedBy: 'Marcus Sterling' },
      { id: 'step-3', name: 'TIG Welding & Fusion', status: 'In_Progress' },
      { id: 'step-4', name: 'X-Ray Alignment & QC', status: 'Pending' },
      { id: 'step-5', name: 'ESD Protective Coating', status: 'Pending' }
    ],
    notes: 'Chassis material is high-alloy aerospace aluminum. Weld with care.'
  },
  {
    id: 'wo-102',
    orderNumber: 'MFR-2026-102',
    productName: 'Optoelectronic Driver Hub',
    qty: 12,
    targetDate: '2026-05-24',
    priority: 'Medium',
    status: 'Scheduled',
    steps: [
      { id: 'step-1', name: 'Material Prep & Cutting', status: 'Completed', completedAt: '2026-05-20T03:00:00Z', completedBy: 'Leah Vance' },
      { id: 'step-2', name: 'Precision CNC Mill', status: 'Pending' },
      { id: 'step-3', name: 'TIG Welding & Fusion', status: 'Pending' },
      { id: 'step-4', name: 'X-Ray Alignment & QC', status: 'Pending' },
      { id: 'step-5', name: 'ESD Protective Coating', status: 'Pending' }
    ]
  },
  {
    id: 'wo-103',
    orderNumber: 'MFR-2026-103',
    productName: 'Pneumatic Sensor Matrix Core',
    qty: 50,
    targetDate: '2026-05-15', // Overdue!
    priority: 'High',
    status: 'On_Hold',
    steps: [
      { id: 'step-1', name: 'Material Prep & Cutting', status: 'Completed', completedAt: '2026-05-12T08:00:00Z', completedBy: 'Leah Vance' },
      { id: 'step-2', name: 'Precision CNC Mill', status: 'Completed', completedAt: '2026-05-14T11:00:00Z', completedBy: 'Marcus Sterling' },
      { id: 'step-3', name: 'TIG Welding & Fusion', status: 'In_Progress' },
      { id: 'step-4', name: 'X-Ray Alignment & QC', status: 'Pending' },
      { id: 'step-5', name: 'ESD Protective Coating', status: 'Pending' }
    ],
    notes: 'On hold waiting for copper pipeline courier confirmation from supplier.'
  },
  {
    id: 'wo-104',
    orderNumber: 'MFR-2026-104',
    productName: 'Modular Rotational Mount R1',
    qty: 25,
    targetDate: '2026-06-10',
    priority: 'Low',
    status: 'Draft',
    steps: [
      { id: 'step-1', name: 'Material Prep & Cutting', status: 'Pending' },
      { id: 'step-2', name: 'Precision CNC Mill', status: 'Pending' },
      { id: 'step-3', name: 'TIG Welding & Fusion', status: 'Pending' },
      { id: 'step-4', name: 'X-Ray Alignment & QC', status: 'Pending' },
      { id: 'step-5', name: 'ESD Protective Coating', status: 'Pending' }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Marcus Sterling',
    email: 'm.sterling@enterprise-erp.com',
    phone: '+1 (555) 382-9901',
    role: 'Lead Machining Specialist',
    department: 'Operations',
    salary: 4950,
    joinDate: '2023-04-12',
    status: 'Active',
    paymentHistory: [
      { month: '2026-04', amount: 4950, paidAt: '2026-04-28' },
      { month: '2026-03', amount: 4950, paidAt: '2026-03-29' }
    ]
  },
  {
    id: 'emp-2',
    name: 'Leah Vance',
    email: 'l.vance@enterprise-erp.com',
    phone: '+1 (555) 472-8855',
    role: 'Operations & Slicing Supervisor',
    department: 'Operations',
    salary: 5200,
    joinDate: '2022-09-01',
    status: 'Active',
    paymentHistory: [
      { month: '2026-04', amount: 5200, paidAt: '2026-04-28' },
      { month: '2026-03', amount: 5200, paidAt: '2026-03-29' }
    ]
  },
  {
    id: 'emp-3',
    name: 'Dr. Evelyn Moss',
    email: 'e.moss@enterprise-erp.com',
    phone: '+1 (555) 102-2290',
    role: 'Senior QA Analyst',
    department: 'Quality_Control',
    salary: 5800,
    joinDate: '2024-01-15',
    status: 'Active',
    paymentHistory: [
      { month: '2026-04', amount: 5800, paidAt: '2026-04-28' }
    ]
  },
  {
    id: 'emp-4',
    name: 'Thomas Drake',
    email: 't.drake@enterprise-erp.com',
    phone: '+1 (555) 998-3112',
    role: 'Director of B2B Sales',
    department: 'Sales',
    salary: 6400,
    joinDate: '2021-02-10',
    status: 'Active',
    paymentHistory: [
      { month: '2026-04', amount: 6400, paidAt: '2026-04-28' },
      { month: '2026-03', amount: 6400, paidAt: '2026-03-29' }
    ]
  },
  {
    id: 'emp-5',
    name: 'Sarah Kim',
    email: 's.kim@enterprise-erp.com',
    phone: '+1 (555) 604-0012',
    role: 'VP Human Resources',
    department: 'HR',
    salary: 6200,
    joinDate: '2023-11-20',
    status: 'On_Leave',
    paymentHistory: [
      { month: '2026-04', amount: 6200, paidAt: '2026-04-28' }
    ]
  }
];

export const INITIAL_CONFIG: ERPConfig = {
  companyName: 'Nova Forge Technologies Inc.',
  taxNumber: 'TX-995-102-AQ',
  currency: 'USD',
  taxRate: 20
};
