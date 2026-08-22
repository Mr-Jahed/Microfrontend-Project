interface RemoteAuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
}

declare module "customer_mf/CustomerApp" {
  import type { ComponentType } from "react";
  const CustomerApp: ComponentType<{ user?: RemoteAuthUser | null }>;
  export default CustomerApp;
}

declare module "order_mf/OrderApp" {
  import type { ComponentType } from "react";
  const OrderApp: ComponentType<{ user?: RemoteAuthUser | null }>;
  export default OrderApp;
}

declare module "report_mf/ReportApp" {
  import type { ComponentType } from "react";
  const ReportApp: ComponentType<{ user?: RemoteAuthUser | null }>;
  export default ReportApp;
}
