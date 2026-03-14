// lib/dashboard/mock.ts
export async function getMockDashboardData() {
  return {
    user: {
      firstName: "Reefer",
      email: "customer@example.com",
    },
    stats: {
      totalOrders: 3,
      lastOrderLabel: "Feb 18",
      savingsLabel: "$12.40",
      savingsHint: "Bundle savings + promos",
    },
    subscription: {
      statusLabel: "Active",
      statusHint: "Your plan is running normally.",
      planLabel: "Premium Live Phytoplankton — Monthly",
      nextShipLabel: "Mar 01",
      nextShipHint: "Ships 1–2 business days after processing.",
    },
    orders: [
      {
        id: "#RC-1042",
        dateLabel: "Feb 18",
        itemsLabel: "32oz Phyto",
        totalLabel: "$27.99",
        status: "Delivered" as const,
        tracking: "9400-1234-5678",
      },
      {
        id: "#RC-1033",
        dateLabel: "Feb 05",
        itemsLabel: "16oz Phyto",
        totalLabel: "$19.99",
        status: "Delivered" as const,
        tracking: "9400-9876-5432",
      },
      {
        id: "#RC-1019",
        dateLabel: "Jan 21",
        itemsLabel: "32oz + 16oz",
        totalLabel: "$47.98",
        status: "Shipped" as const,
        tracking: "9400-0000-1111",
      },
    ],
  };
}