import React from "react";

const tables = [
  {
    name: "Production",
    description: "Shift-wise production data for brake shoes & brake pads.",
    fields: [
      "date",
      "shift",
      "line",
      "product_code",
      "product_type",
      "quantity_produced",
      "machine_id",
    ],
  },
  {
    name: "Scrap",
    description: "Defect and scrap information recorded during production.",
    fields: [
      "date",
      "shift",
      "line",
      "product_code",
      "defect_code",
      "defect_description",
      "scrap_quantity",
    ],
  },
  {
    name: "CustomerOrders",
    description: "Customer orders from booking to dispatch.",
    fields: [
      "order_id",
      "customer_name",
      "region",
      "order_date",
      "due_date",
      "product_code",
      "order_quantity",
      "status",
    ],
  },
  {
    name: "Inventory",
    description: "Stock levels for raw material, WIP, and finished goods.",
    fields: [
      "material_code",
      "material_type",
      "location",
      "stock_quantity",
      "uom",
      "last_updated",
    ],
  },
  {
    name: "Dispatch",
    description: "Dispatch and logistics tracking data.",
    fields: [
      "dispatch_id",
      "order_id",
      "customer_name",
      "dispatch_date",
      "vehicle_no",
      "transporter",
      "destination_region",
      "dispatched_quantity",
      "delivery_status",
    ],
  },
];

const DataModelSection: React.FC = () => {
  return (
    <section
      id="data-model"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header>
          <h2 className="text-2xl font-semibold md:text-3xl">Data Model</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            The data model is centered around five main fact-like tables:
            Production, Scrap, Customer Orders, Inventory, and Dispatch. These
            can be linked using common keys such as{" "}
            <span className="font-semibold text-orange-300">
              date, line, product_code, and order_id
            </span>
            .
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {tables.map((table) => (
            <div
              key={table.name}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-50">
                {table.name}
              </h3>
              <p className="mt-1 text-xs text-slate-300">{table.description}</p>
              <p className="mt-3 text-[11px] font-medium text-slate-400">
                Fields:
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {table.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-slate-400">
          Note: In tools like Power BI or Tableau, relationships are created
          between these tables using keys (e.g., Production.date ↔ Scrap.date,
          CustomerOrders.order_id ↔ Dispatch.order_id).
        </p>
      </div>
    </section>
  );
};

export default DataModelSection;
