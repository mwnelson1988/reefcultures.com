// lib/integrations/shipstation.ts
// ShipStation API helpers.
// We use the classic ShipStation API (ssapi.shipstation.com) with Basic Auth.

import { mustGetEnv } from "@/lib/env";

function authHeader() {
  const key = mustGetEnv("SHIPSTATION_API_KEY");
  const secret = mustGetEnv("SHIPSTATION_API_SECRET");
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

const BASE = "https://ssapi.shipstation.com";

export type ShipStationOrderItem = {
  name?: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
  options?: any;
};

export type ShipStationAddress = {
  name?: string;
  company?: string;
  street1?: string;
  street2?: string;
  street3?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  residential?: boolean;
};

export type ShipStationOrder = {
  orderId: number;
  orderNumber?: string;
  orderKey?: string;
  orderDate?: string;
  createDate?: string;
  modifyDate?: string;
  paymentDate?: string;
  shipByDate?: string;
  orderStatus?: string;
  customerUsername?: string;
  customerEmail?: string;
  billTo?: ShipStationAddress;
  shipTo?: ShipStationAddress;
  orderTotal?: number;
  amountPaid?: number;
  taxAmount?: number;
  shippingAmount?: number;
  customerNotes?: string;
  internalNotes?: string;
  gift?: boolean;
  giftMessage?: string;
  paymentMethod?: string;
  requestedShippingService?: string;
  carrierCode?: string;
  serviceCode?: string;
  packageCode?: string;
  confirmation?: string;
  advancedOptions?: {
    storeId?: number;
    source?: string;
    mergedOrSplit?: boolean;
    warehouseId?: number;
  };
  orderSource?: string;
  items?: ShipStationOrderItem[];
};

async function ssFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ShipStation API failed: ${res.status} ${txt}`);
  }

  return res.json();
}

export async function listOrders(params: {
  orderDateStart?: string;
  orderDateEnd?: string;
  modifyDateStart?: string;
  modifyDateEnd?: string;
  page?: number;
  pageSize?: number;
  orderStatus?: string;
}) {
  const q = new URLSearchParams();
  if (params.orderDateStart) q.set("orderDateStart", params.orderDateStart);
  if (params.orderDateEnd) q.set("orderDateEnd", params.orderDateEnd);
  if (params.modifyDateStart) q.set("modifyDateStart", params.modifyDateStart);
  if (params.modifyDateEnd) q.set("modifyDateEnd", params.modifyDateEnd);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.orderStatus) q.set("orderStatus", params.orderStatus);

  // Classic API: GET /orders
  const data = await ssFetch(`/orders?${q.toString()}`);
  const orders: ShipStationOrder[] = Array.isArray(data?.orders) ? data.orders : [];
  const total = Number(data?.total ?? orders.length);
  const page = Number(data?.page ?? params.page ?? 1);
  const pages = Number(data?.pages ?? 1);
  return { orders, total, page, pages };
}
