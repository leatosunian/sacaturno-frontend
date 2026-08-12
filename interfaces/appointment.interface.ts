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
  // Reserva temporal mientras otro cliente paga la seña en MP
  depositHoldUntil?: string | Date | null;
  employeeID?: string | null;
  branchID?: string | null;
  // true sólo si el cliente eligió explícitamente al profesional al reservar
  employeeChosenByClient?: boolean;
  // Sello de reasignación por el negocio: habilita cancelar con reembolso
  reassignedAt?: string | Date | null;
}