
export interface IAppointment {
    businessID: string | undefined;
    clientID?: string | '';
    status?: 'booked' | 'unbooked';
    start: Date;
    end: Date;
    title?: string;
    _id?: string;
}