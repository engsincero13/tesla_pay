
export enum WorkspaceType {
  PF = 'PF',
  PJ = 'PJ',
  BOTH = 'AMBOS'
}

export enum AccountStatus {
  PENDING = 'Pendente',
  SCHEDULED = 'Programado',
  PAID = 'Pago',
  OVERDUE = 'Atrasado',
  CANCELLED = 'Cancelado'
}

export enum PaymentMethod {
  PIX = 'Pix',
  BOLETO = 'Boleto',
  TRANSFER = 'Transferência',
  CARD = 'Cartão',
  CASH = 'Dinheiro'
}

export interface Supplier {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  document?: string;
  email?: string;
  pixKey?: string;
  pixType?: string;
  bankInfo?: string;
  usualCategory?: string;
}

export interface AccountPayable {
  id: string;
  workspace: 'PF' | 'PJ';
  supplierId: string;
  supplierName: string;
  amount: number;
  amountPaid?: number;
  dueDate: string;
  paymentDate?: string;
  status: AccountStatus;
  method: PaymentMethod;
  category: string;
  description?: string;
  isFixed: boolean;
  isEssential: boolean;
  installments?: number;
  currentInstallment?: number;
  tags: string[];
  attachments: string[];
  pixKey?: string;
  cardClosingDay?: number;
  createdAt: string;
}

export interface DashboardStats {
  today: { pf: number; pj: number; total: number };
  upcoming7Days: number;
  upcoming30Days: number;
  overdue: number;
  pendingCount: number;
}

export interface PlatformBalanceItem {
  platformKey: string;
  platformLabel: string;
  fieldKey: string;
  fieldLabel: string;
  balanceCategory: 'available' | 'receivable';
  amount: number;
  displayOrder: number;
}

export interface PlatformBalanceSnapshot {
  snapshotDate: string | null;
  lastUpdatedAt?: string | null;
  total: number;
  availableTotal: number;
  receivableTotal: number;
  grandTotal: number;
  items: PlatformBalanceItem[];
}
