export interface IService {
  _id?: string;
  businessID: string | undefined;
  name: string | undefined;
  ownerID?: string | undefined;
  price: number | undefined;
  description: string | undefined;
}
