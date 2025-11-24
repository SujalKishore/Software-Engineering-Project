"use client";
import React, { useState } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { motion } from "framer-motion";
import { Table, Key, Link as LinkIcon } from "lucide-react";

const tables = [
  {
    name: "Production",
    fields: ["id (PK)", "date", "shift_id", "line_id", "product_id", "actual_qty", "target_qty"],
    color: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    connections: ["Products", "Lines", "Shifts"],
  },
  {
    name: "Scrap",
    fields: ["id (PK)", "production_id (FK)", "scrap_reason_id", "qty_rejected"],
    color: "border-red-500/50 bg-red-500/10 text-red-400",
    connections: ["Production", "ScrapReasons"],
  },
  {
    name: "Inventory",
    fields: ["id (PK)", "item_id", "current_stock", "min_level", "location_id"],
    color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    connections: ["Items", "Locations"],
  },
  {
    name: "Orders",
    fields: ["id (PK)", "customer_id", "order_date", "due_date", "status"],
    color: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    connections: ["Customers", "OrderDetails"],
  },
];

const DataModelSection: React.FC = () => {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  return (
    <section className="bg-slate-950 px-4 py-24">
      <AnimatedSection className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-50">Data Model Schema</h2>
          <p className="mt-2 text-slate-400">Star Schema Design for Analytics</p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {tables.map((table) => (
            <motion.div
              key={table.name}
              onMouseEnter={() => setHoveredTable(table.name)}
              onMouseLeave={() => setHoveredTable(null)}
              whileHover={{ scale: 1.05 }}
              className={`relative z-10 rounded-2xl border-2 p-6 backdrop-blur-sm transition-all duration-300 ${table.color
                } ${hoveredTable && hoveredTable !== table.name && !table.connections.includes(hoveredTable)
                  ? "opacity-30 grayscale"
                  : "opacity-100"
                }`}
            >
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <Table size={18} />
                <h3 className="font-bold">{table.name}</h3>
              </div>
              <ul className="space-y-2 text-xs opacity-80">
                {table.fields.map((field, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {field.includes("PK") ? (
                      <Key size={10} className="text-yellow-500" />
                    ) : field.includes("FK") ? (
                      <LinkIcon size={10} className="text-slate-400" />
                    ) : (
                      <div className="h-1 w-1 rounded-full bg-current" />
                    )}
                    <span className={field.includes("PK") ? "font-semibold text-white" : ""}>
                      {field}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Decorative Connection Lines (Abstract) */}
          <svg className="absolute inset-0 -z-0 h-full w-full opacity-20 pointer-events-none">
            <path d="M200,100 C300,100 300,300 500,300" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M800,100 C700,100 700,300 500,300" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          </svg>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default DataModelSection;
