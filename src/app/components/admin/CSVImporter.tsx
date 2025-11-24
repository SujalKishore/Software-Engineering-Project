import React, { useRef, useState } from "react";
import Papa from "papaparse";

interface CSVImporterProps {
    templateHeaders: string[];
    onImport: (data: any[]) => Promise<void>;
    buttonLabel?: string;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ templateHeaders, onImport, buttonLabel = "Import CSV" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleDownloadTemplate = () => {
        const csvContent = templateHeaders.join(",") + "\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // Basic validation: Check if all template headers exist in the parsed data
                    const fileHeaders = results.meta.fields || [];
                    const missingHeaders = templateHeaders.filter(h => !fileHeaders.includes(h));

                    if (missingHeaders.length > 0) {
                        alert(`Invalid CSV format. Missing columns: ${missingHeaders.join(", ")}`);
                        setUploading(false);
                        return;
                    }

                    await onImport(results.data);
                    alert("Import successful!");
                } catch (error) {
                    console.error("Import failed", error);
                    alert("Import failed. Please check the console for details.");
                } finally {
                    setUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }
            },
            error: (error) => {
                console.error("CSV Parse Error", error);
                alert("Failed to parse CSV file.");
                setUploading(false);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={handleDownloadTemplate}
                className="text-slate-400 hover:text-slate-200 text-xs underline decoration-slate-600 hover:decoration-slate-400 transition"
                title="Download CSV Template"
            >
                Template
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-slate-700 flex items-center gap-2"
            >
                {uploading ? (
                    <>
                        <span className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                        Importing...
                    </>
                ) : (
                    <>
                        <span>📂</span> {buttonLabel}
                    </>
                )}
            </button>
        </div>
    );
};

export default CSVImporter;
