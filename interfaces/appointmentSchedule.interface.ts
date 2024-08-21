import { IDaySchedule } from "./daySchedule.interface";

export interface IAppointmentSchedule {
  businessID: string;
  ownerID: string;
  day: string; // 'LUN'
  start: Date; // GET APPOINTMENT TIME
  end: Date; // GET APPOINTMENT TIME
  service: string;
  price: number;
  description: string;
  dayScheduleID: IDaySchedule | string;
  _id?: string;
  title?: string;
  dayNumber: number;
}

