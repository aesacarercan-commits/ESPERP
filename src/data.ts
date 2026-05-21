import { Product, Invoice, WorkOrder, Employee, ERPConfig, CRMContact, CRMOpportunity, CRMInteraction } from './types';

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
      { id: 'kg-kesim', name: 'Kapak&Gövde - kesim', baseStepName: 'kesim', category: 'Kapak&Gövde', columns: [1], status: 'Completed', completedAt: '2026-05-19T09:00:00Z', completedBy: 'Marcus Sterling' },
      { id: 'kg-bukum', name: 'Kapak&Gövde - büküm', baseStepName: 'büküm', category: 'Kapak&Gövde', columns: [2, 3], status: 'Completed', completedAt: '2026-05-19T14:30:00Z', completedBy: 'Marcus Sterling' },
      { id: 'kg-catim', name: 'Kapak&Gövde - çatım', baseStepName: 'çatım', category: 'Kapak&Gövde', columns: [3, 4], status: 'In_Progress' },
      { id: 'kg-tas1', name: 'Kapak&Gövde - taş (Temizlik)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [4, 5], status: 'Pending' },
      { id: 'kg-kaynak', name: 'Kapak&Gövde - kaynak', baseStepName: 'kaynak', category: 'Kapak&Gövde', columns: [5, 6], status: 'Pending' },
      { id: 'kg-tas2', name: 'Kapak&Gövde - taş (Son Kontrol)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [6, 7], status: 'Pending' },
      { id: 'kg-saplama', name: 'Kapak&Gövde - saplama', baseStepName: 'saplama', category: 'Kapak&Gövde', columns: [7, 8], status: 'Pending' },
      { id: 'kg-boyahazir', name: 'Kapak&Gövde - boya hazırlık', baseStepName: 'boya hazırlık', category: 'Kapak&Gövde', columns: [8, 9], status: 'Pending' },
      { id: 'kg-boya', name: 'Kapak&Gövde - boya', baseStepName: 'boya', category: 'Kapak&Gövde', columns: [9, 10], status: 'Pending' },
      { id: 'kg-montaj', name: 'Kapak&Gövde - montaj', baseStepName: 'montaj', category: 'Kapak&Gövde', columns: [10, 11], status: 'Pending' },
      { id: 'kg-paket', name: 'Kapak&Gövde - paket', baseStepName: 'paket', category: 'Kapak&Gövde', columns: [15], status: 'Pending' },

      { id: 'ry-kesim', name: 'Raylar - kesim', baseStepName: 'kesim', category: 'Raylar', columns: [1], status: 'Completed', completedAt: '2026-05-19T10:15:00Z', completedBy: 'Leah Vance' },
      { id: 'ry-bukum', name: 'Raylar - büküm', baseStepName: 'büküm', category: 'Raylar', columns: [2, 3], status: 'Completed', completedAt: '2026-05-19T16:00:00Z', completedBy: 'Leah Vance' },
      { id: 'ry-punta', name: 'Raylar - punta', baseStepName: 'punta', category: 'Raylar', columns: [3, 4], status: 'Pending' },
      { id: 'ry-catim', name: 'Raylar - çatım', baseStepName: 'çatım', category: 'Raylar', columns: [4, 5], status: 'Pending' },

      { id: 'el-delik', name: 'elektrik - delik delme', baseStepName: 'delik delme', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'In_Progress' },
      { id: 'el-panosaci', name: 'elektrik - pano sacı', baseStepName: 'pano sacı', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'In_Progress' },
      { id: 'el-kablolama', name: 'elektrik - kablolama', baseStepName: 'kablolama', category: 'elektrik', columns: [11, 12], status: 'Pending' },
      { id: 'el-test', name: 'elektrik - test', baseStepName: 'test', category: 'elektrik', columns: [13], status: 'Pending' },
      { id: 'el-etiket', name: 'elektrik - etiket', baseStepName: 'etiket', category: 'elektrik', columns: [12, 13, 14], status: 'Pending' }
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

      { id: 'ry-kesim', name: 'Raylar - kesim', baseStepName: 'kesim', category: 'Raylar', columns: [1], status: 'Pending' },
      { id: 'ry-bukum', name: 'Raylar - büküm', baseStepName: 'büküm', category: 'Raylar', columns: [2, 3], status: 'Pending' },
      { id: 'ry-punta', name: 'Raylar - punta', baseStepName: 'punta', category: 'Raylar', columns: [3, 4], status: 'Pending' },
      { id: 'ry-catim', name: 'Raylar - çatım', baseStepName: 'çatım', category: 'Raylar', columns: [4, 5], status: 'Pending' },

      { id: 'el-delik', name: 'elektrik - delik delme', baseStepName: 'delik delme', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-panosaci', name: 'elektrik - pano sacı', baseStepName: 'pano sacı', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-kablolama', name: 'elektrik - kablolama', baseStepName: 'kablolama', category: 'elektrik', columns: [11, 12], status: 'Pending' },
      { id: 'el-test', name: 'elektrik - test', baseStepName: 'test', category: 'elektrik', columns: [13], status: 'Pending' },
      { id: 'el-etiket', name: 'elektrik - etiket', baseStepName: 'etiket', category: 'elektrik', columns: [12, 13, 14], status: 'Pending' }
    ],
    notes: 'Prioritized high-speed core unit fabrication.'
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
      { id: 'kg-kesim', name: 'Kapak&Gövde - kesim', baseStepName: 'kesim', category: 'Kapak&Gövde', columns: [1], status: 'Completed', completedAt: '2026-05-12T08:00:00Z', completedBy: 'Leah Vance' },
      { id: 'kg-bukum', name: 'Kapak&Gövde - büküm', baseStepName: 'büküm', category: 'Kapak&Gövde', columns: [2, 3], status: 'Completed', completedAt: '2026-05-14T11:00:00Z', completedBy: 'Marcus Sterling' },
      { id: 'kg-catim', name: 'Kapak&Gövde - çatım', baseStepName: 'çatım', category: 'Kapak&Gövde', columns: [3, 4], status: 'In_Progress' },
      { id: 'kg-tas1', name: 'Kapak&Gövde - taş (Temizlik)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [4, 5], status: 'Pending' },
      { id: 'kg-kaynak', name: 'Kapak&Gövde - kaynak', baseStepName: 'kaynak', category: 'Kapak&Gövde', columns: [5, 6], status: 'Pending' },
      { id: 'kg-tas2', name: 'Kapak&Gövde - taş (Son Kontrol)', baseStepName: 'taş', category: 'Kapak&Gövde', columns: [6, 7], status: 'Pending' },
      { id: 'kg-saplama', name: 'Kapak&Gövde - saplama', baseStepName: 'saplama', category: 'Kapak&Gövde', columns: [7, 8], status: 'Pending' },
      { id: 'kg-boyahazir', name: 'Kapak&Gövde - boya hazırlık', baseStepName: 'boya hazırlık', category: 'Kapak&Gövde', columns: [8, 9], status: 'Pending' },
      { id: 'kg-boya', name: 'Kapak&Gövde - boya', baseStepName: 'boya', category: 'Kapak&Gövde', columns: [9, 10], status: 'Pending' },
      { id: 'kg-montaj', name: 'Kapak&Gövde - montaj', baseStepName: 'montaj', category: 'Kapak&Gövde', columns: [10, 11], status: 'Pending' },
      { id: 'kg-paket', name: 'Kapak&Gövde - paket', baseStepName: 'paket', category: 'Kapak&Gövde', columns: [15], status: 'Pending' },

      { id: 'ry-kesim', name: 'Raylar - kesim', baseStepName: 'kesim', category: 'Raylar', columns: [1], status: 'Completed', completedAt: '2026-05-12T08:30:00Z', completedBy: 'Leah Vance' },
      { id: 'ry-bukum', name: 'Raylar - büküm', baseStepName: 'büküm', category: 'Raylar', columns: [2, 3], status: 'Pending' },
      { id: 'ry-punta', name: 'Raylar - punta', baseStepName: 'punta', category: 'Raylar', columns: [3, 4], status: 'Pending' },
      { id: 'ry-catim', name: 'Raylar - çatım', baseStepName: 'çatım', category: 'Raylar', columns: [4, 5], status: 'Pending' },

      { id: 'el-delik', name: 'elektrik - delik delme', baseStepName: 'delik delme', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-panosaci', name: 'elektrik - pano sacı', baseStepName: 'pano sacı', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-kablolama', name: 'elektrik - kablolama', baseStepName: 'kablolama', category: 'elektrik', columns: [11, 12], status: 'Pending' },
      { id: 'el-test', name: 'elektrik - test', baseStepName: 'test', category: 'elektrik', columns: [13], status: 'Pending' },
      { id: 'el-etiket', name: 'elektrik - etiket', baseStepName: 'etiket', category: 'elektrik', columns: [12, 13, 14], status: 'Pending' }
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

      { id: 'ry-kesim', name: 'Raylar - kesim', baseStepName: 'kesim', category: 'Raylar', columns: [1], status: 'Pending' },
      { id: 'ry-bukum', name: 'Raylar - büküm', baseStepName: 'büküm', category: 'Raylar', columns: [2, 3], status: 'Pending' },
      { id: 'ry-punta', name: 'Raylar - punta', baseStepName: 'punta', category: 'Raylar', columns: [3, 4], status: 'Pending' },
      { id: 'ry-catim', name: 'Raylar - çatım', baseStepName: 'çatım', category: 'Raylar', columns: [4, 5], status: 'Pending' },

      { id: 'el-delik', name: 'elektrik - delik delme', baseStepName: 'delik delme', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-panosaci', name: 'elektrik - pano sacı', baseStepName: 'pano sacı', category: 'elektrik', columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], status: 'Pending' },
      { id: 'el-kablolama', name: 'elektrik - kablolama', baseStepName: 'kablolama', category: 'elektrik', columns: [11, 12], status: 'Pending' },
      { id: 'el-test', name: 'elektrik - test', baseStepName: 'test', category: 'elektrik', columns: [13], status: 'Pending' },
      { id: 'el-etiket', name: 'elektrik - etiket', baseStepName: 'etiket', category: 'elektrik', columns: [12, 13, 14], status: 'Pending' }
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
  taxRate: 20,
  language: 'en'
};

export const INITIAL_CRM_CONTACTS: CRMContact[] = [
  {
    id: 'c-1',
    name: 'Sarah Connor',
    companyName: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.io',
    phone: '+1 (555) 720-1984',
    role: 'Procurement Specialist',
    status: 'Customer',
    notes: 'Primary contact for next-gen hydraulic alloy frameworks.',
    createdAt: '2026-04-10T12:00:00Z',
  },
  {
    id: 'c-2',
    name: 'Miles Dyson',
    companyName: 'Cyberdyne Systems',
    email: 'm.dyson@cyberdyne.io',
    phone: '+1 (555) 300-1991',
    role: 'Director of Advanced Research',
    status: 'Lead',
    notes: 'Interested in acquiring Quantum Process Chip S2 micro-architecture.',
    createdAt: '2026-05-01T09:12:00Z',
  },
  {
    id: 'c-3',
    name: 'Ellie Sattler',
    companyName: 'InGen Biotech Corp',
    email: 'e.sattler@ingen.org',
    phone: '+1 (555) 933-2001',
    role: 'Operations Consultant',
    status: 'Support_Required',
    notes: 'Requires technical support for sensor payload calibration errors on pneumatic pressure systems.',
    createdAt: '2026-05-15T15:30:00Z',
  },
  {
    id: 'c-4',
    name: 'Bruce Wayne',
    companyName: 'Wayne Enterprises',
    email: 'bwayne@waynecorp.com',
    phone: '+1 (555) 911-3000',
    role: 'CEO & Principal Shareholder',
    status: 'Customer',
    notes: 'Sourcing titanium chassis frames and aerospace rotational mounts. Custom defense projects.',
    createdAt: '2026-05-18T18:45:00Z',
  }
];

export const INITIAL_CRM_OPPORTUNITIES: CRMOpportunity[] = [
  {
    id: 'o-1',
    title: 'Cyberdyne Chip Supply Deal',
    contactId: 'c-2',
    stage: 'Proposal_Sent',
    value: 24900,
    estCloseDate: '2026-06-15',
    assignedTo: 'emp-4',
    notes: 'Sent pricing proposal for 100 units of Quantum Process Chip S2.'
  },
  {
    id: 'o-2',
    title: 'Titanium Chassis Framing Procurement',
    contactId: 'c-4',
    stage: 'Negotiation',
    value: 85000,
    estCloseDate: '2026-06-30',
    assignedTo: 'emp-4',
    notes: 'Negotiating volume discount tier parameters.'
  },
  {
    id: 'o-3',
    title: 'Biotech Sensor Pilot Project',
    contactId: 'c-3',
    stage: 'Contacted',
    value: 4500,
    estCloseDate: '2026-07-10',
    assignedTo: 'emp-4',
    notes: 'Evaluating physical site calibration layout specifications.'
  }
];

export const INITIAL_CRM_INTERACTIONS: CRMInteraction[] = [
  {
    id: 'i-1',
    contactId: 'c-2',
    type: 'Email',
    title: 'Technical Specification Discussion',
    notes: 'Sent technical data sheet for Quantum S2 processor chips indicating thermal tolerances.',
    date: '2026-05-02'
  },
  {
    id: 'i-2',
    contactId: 'c-4',
    type: 'Meeting',
    title: 'High-volume Framing Evaluation',
    notes: 'Discussed physical custom measurements for aerospace alloy chassis frames at local Wayne Labs.',
    date: '2026-05-19'
  },
  {
    id: 'i-3',
    contactId: 'c-3',
    type: 'Support_Ticket',
    title: 'Pneumatic calibration payload feedback issue',
    notes: 'Drift error of -0.05psi detected during stress analysis. Requesting diagnostic debug code files.',
    date: '2026-05-20',
    supportStatus: 'In_Progress'
  }
];
