export interface AdminPayment {
  id: number;
  user: {
    id: number;
    name: string;
  };
  amount: number;
  paymentMethod: string;
  reference: string;
  paymentDate: string;
  cedula: string;
  phone: string;
  email: string;
  paymentDetails: string;
  status: 'PENDIENTE' | 'PAGADO';
}

export interface PaymentDetails {
  cedula?: string;
  telefono?: string;
  banco?: string;
  cuentaBancaria?: string;
  nombreTitular?: string;
  email?: string;
}