export default interface ISubscriptionDisplay {
  businessID: string | undefined;
  ownerID: string | undefined;
  subscriptionType: "SC_FREE" | "SC_BASIC" | "SC_PRO" | "SC_FULL" | "SC_EXPIRED";
  paymentDate: string;
  expiracyDate: string;
}
