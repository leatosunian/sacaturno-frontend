export interface IAppointment {
  businessID?: string | undefined;
  clientID?: string | "";
  status?: "booked" | "unbooked";
  start: Date;
  end: Date;
  phone?: number;
  email?: string;
  title?: string;
  name?: string;
  _id?: string;
  service: string | undefined;
  price?: number | undefined
  description?: string | undefined;
  depositStatus?: "none" | "pending" | "paid" | "failed";
  mpPaymentID?: string | null;
  mpPreferenceID?: string | null;
  employeeID?: string | null;
  branchID?: string | null;
}