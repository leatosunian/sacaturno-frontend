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
}
