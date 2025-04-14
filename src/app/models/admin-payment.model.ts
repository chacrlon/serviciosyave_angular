export interface AdminPayment {
    id: number;
    sellerName: string;
    serviceName: string;
    paymentMethod: string;
    paymentDetails: string;
    amount: number;
    commissionPercentage: number;
    commissionAmount: number;
    netAmount: number;
    transactionDate: Date;
    status: string;
    // Agrega otros campos necesarios
  }