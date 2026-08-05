export type RefundStatus = "none" | "pending" | "refunded" | "failed";
export type CancelledBy = "client" | "owner" | "employee";

export interface ICancelledAppointment {
  _id: string;
  businessID: string;
  appointmentID: string;
  start: string;
  end: string;
  service: string;
  price: number;
  name: string;
  email: string;
  phone: number;
  employeeID?: string | null;
  branchID?: string | null;
  employeeName?: string | null;
  branchName?: string | null;
  hadDeposit: boolean;
  depositAmount: number;
  mpPaymentID?: string | null;
  refundStatus: RefundStatus;
  refundID?: string | null;
  refundAmount?: number;
  cancelledBy: CancelledBy;
  cancelledAt: string;
  reason?: string;
}
