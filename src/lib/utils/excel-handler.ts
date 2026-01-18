import ExcelJS from "exceljs";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const generateExcelTemplate = async (commodity: string, year: number) =>
{
    const workbook = new ExcelJS.Workbook();

    // Instructions Sheet
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.columns = [
        { header: "Step", key: "step", width: 10 },
        { header: "Instruction", key: "instruction", width: 80 }
    ];

    instructionsSheet.addRows([
        { step: 1, instruction: `You are filling data for ${commodity} in the year ${year}.` },
        { step: 2, instruction: "Go to the 'Data Entry' sheet." },
        { step: 3, instruction: "Enter the price for each month in the 'Price' column." },
        { step: 4, instruction: "Only numeric values are allowed in the 'Price' column." },
        { step: 5, instruction: "Leave the cell empty for months with no data." },
        { step: 6, instruction: "After filling, save this file and upload it on the website." }
    ]);

    instructionsSheet.getRow(1).font = { bold: true };

    // Data Entry Sheet
    const dataSheet = workbook.addWorksheet("Data Entry");
    dataSheet.columns = [
        { header: "Month", key: "month", width: 20 },
        { header: "Price", key: "price", width: 20 }
    ];

    MONTHS.forEach((month, index) =>
    {
        const row = dataSheet.addRow({ month, price: "" });
        // Protect Month column (A)
        const cellA = row.getCell(1);
        cellA.protection = { locked: true };
    });

    dataSheet.getRow(1).font = { bold: true };

    // Data Validation for Price column (B)
    for (let i = 2; i <= 13; i++) {
        dataSheet.getCell(`B${i}`).dataValidation = {
            type: "decimal",
            operator: "greaterThanOrEqual",
            formulae: [ "0" ],
            showErrorMessage: true,
            errorTitle: "Invalid Price",
            error: "Please enter a valid numeric price (e.g., 1250.50).",
            promptTitle: "Enter Price",
            prompt: "Enter the price for this month."
        };
    }

    // Protection (optional, depends on if we want to lock the month column strictly)
    // await dataSheet.protect('password', { selectLockedCells: true, selectUnlockedCells: true });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([ buffer ], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${commodity}_${year}_Price_Template.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
};

export const parseExcelTemplate = async (file: File): Promise<Record<number, string>> =>
{
    return new Promise((resolve, reject) =>
    {
        const reader = new FileReader();
        reader.onload = async (e) =>
        {
            try {
                const buffer = e.target?.result as ArrayBuffer;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);

                const dataSheet = workbook.getWorksheet("Data Entry");
                if (!dataSheet) {
                    throw new Error("Invalid template: 'Data Entry' sheet not found.");
                }

                const bulkPrices: Record<number, string> = {};

                for (let i = 2; i <= 13; i++) {
                    const monthCell = dataSheet.getCell(`A${i}`);
                    const priceCell = dataSheet.getCell(`B${i}`);

                    const monthName = monthCell.value?.toString();
                    const monthIndex = MONTHS.indexOf(monthName || "");

                    if (monthIndex !== -1 && priceCell.value !== null && priceCell.value !== undefined && priceCell.value !== "") {
                        bulkPrices[ monthIndex ] = priceCell.value.toString();
                    }
                }

                resolve(bulkPrices);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
