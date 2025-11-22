export interface InventoryItem {
    id: string;
    code: string;
    name: string;
    type: string;
    category: string;
    location: string;
    stockQty: number;
    uom: string;
    safetyStock: number;
    reorderLevel: number;
}

export interface Order {
    id: string;
    orderId: string;
    customer: string;
    region: string;
    product: string;
    orderQty: number;
    bookedOn: string;
    dueDate: string;
    status: string;
    dispatchStatus: string;
}

export interface DispatchRecord {
    id: string;
    lrNo: string;
    date: string;
    customer: string;
    region: string;
    transporter: string;
    truckNo: string;
    route: string;
    cartons: number;
    status: string;
}

const initialInventory: InventoryItem[] = [
    {
        id: "1",
        code: "RM-STEEL-01",
        name: "Steel Coil - Grade A",
        type: "Raw Material",
        category: "Raw",
        location: "Stores - A",
        stockQty: 18.5,
        uom: "MT",
        safetyStock: 12,
        reorderLevel: 10,
    },
    {
        id: "2",
        code: "RM-FRICTION-02",
        name: "Friction Powder - Type X",
        type: "Raw Material",
        category: "Raw",
        location: "Stores - B",
        stockQty: 8.0,
        uom: "MT",
        safetyStock: 10,
        reorderLevel: 8,
    },
    {
        id: "3",
        code: "FG-PAD-FR",
        name: "Brake Pad - Front FG",
        type: "Finished Goods",
        category: "FG",
        location: "FG Warehouse 1",
        stockQty: 3.3,
        uom: "k pcs",
        safetyStock: 2,
        reorderLevel: 1.5,
    },
];

const initialOrders: Order[] = [
    {
        id: "1",
        orderId: "ORD-2025-0012",
        customer: "AutoParts India Ltd.",
        region: "North",
        product: "Brake Pad - Front",
        orderQty: 1200,
        bookedOn: "2025-11-10",
        dueDate: "2025-11-20",
        status: "Open",
        dispatchStatus: "Partially Dispatched",
    },
    {
        id: "2",
        orderId: "ORD-2025-0013",
        customer: "Global Brakes Corp.",
        region: "Export",
        product: "Brake Shoe - Rear",
        orderQty: 800,
        bookedOn: "2025-11-05",
        dueDate: "2025-11-18",
        status: "Completed",
        dispatchStatus: "Dispatched",
    },
];

const initialDispatch: DispatchRecord[] = [
    {
        id: "1",
        lrNo: "LR-2025-0101",
        date: "2025-11-18",
        customer: "AutoParts India Ltd.",
        region: "North",
        transporter: "FastTrans Logistics",
        truckNo: "MH12 AB 4321",
        route: "Plant → Delhi DC",
        cartons: 210,
        status: "Delivered",
    },
];

// Helper to get data from localStorage or return initial
export const getData = <T>(key: string, initial: T[]): T[] => {
    if (typeof window === "undefined") return initial;
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }
    return initial;
};

// Helper to save data to localStorage
export const saveData = <T>(key: string, data: T[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
};

export const mockData = {
    inventory: initialInventory,
    orders: initialOrders,
    dispatch: initialDispatch,
};
