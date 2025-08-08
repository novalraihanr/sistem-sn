"use client";

export default function InvProSummary() {
  return (
    <div className="flex-[2] flex flex-col gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-5 text-[#383E49]">Inventory Summary</h2>
        {/* Inventory Summary */}
        <div className="grid grid-cols-3 place-items-stretch">
          <div className="barang flex flex-col items-center text-center">
            <img src="/icons/Dashboard/Invent.svg" className="w-8 h-8" />
            <p className="inventory-num text-[#5D6679] text-sm font-bold mt-2">
              868
            </p>
            <p className="text-xs text-[#5D6679]">Barang Tersedia</p>
          </div>

          <div className="stock-in flex flex-col items-center text-center">
            <img src="/icons/Dashboard/In.svg" className="w-8 h-8" />
            <p className="stockin-num text-[#5D6679] text-sm font-bold mt-2">
              868
            </p>
            <p className="text-xs text-[#5D6679]">Stock In</p>
          </div>

          <div className="stock-out flex flex-col items-center text-center">
            <img src="/icons/Dashboard/Out.svg" className="w-8 h-8" />
            <p className="stockout-num text-[#5D6679] text-sm font-bold mt-2">
              868
            </p>
            <p className="text-xs text-[#5D6679]">Stock Out</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-5 text-[#383E49]">Product Summary</h2>
        {/* Product Summary */}
        <div className="grid grid-cols-2 place-items-stretch">
          <div className="supplier flex flex-col items-center text-center border-r-1 border-[#F0F1F3]">
            <img src="/icons/Dashboard/Suppliers.svg" className="w-8 h-8" />
            <p className="supplier-num text-[#5D6679] text-sm font-bold mt-2">
              31
            </p>
            <p className="text-xs text-[#5D6679]">Jumlah Supplier</p>
          </div>
          <div className="unit flex flex-col items-center text-center">
            <img src="/icons/Dashboard/Unit.svg" className="w-8 h-8" />
            <p className="unit-num text-[#5D6679] text-sm font-bold mt-2">
              31
            </p>
            <p className="text-xs text-[#5D6679]">Jumlah Unit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
