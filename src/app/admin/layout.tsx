import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-orange-500/30">
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
