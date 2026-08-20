import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable directly

const formatDataForExport = (generatedData, activeTab) => {
  if (!generatedData) return [];

  const rows = [];
  const categories =
    activeTab && generatedData[activeTab]
      ? { [activeTab]: generatedData[activeTab] }
      : generatedData;

  Object.entries(categories).forEach(([testType, testCases]) => {
    if (Array.isArray(testCases)) {
      testCases.forEach((tc, index) => {
        rows.push({
          "Test Type": testType,
          "ID": `#${index + 1}`,
          "Title": tc.title || "",
          "Priority": tc.priority || "Medium",
          "Steps": Array.isArray(tc.steps)
            ? tc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
            : tc.steps || "",
          "Expected Result": tc.expectedResult || "",
        });
      });
    }
  });

  return rows;
};

export const exportToExcel = (generatedData, activeTab) => {
  try {
    const exportRows = formatDataForExport(generatedData, activeTab);
    if (exportRows.length === 0) return false;

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Suite");

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 8 },
      { wch: 35 },
      { wch: 12 },
      { wch: 50 },
      { wch: 40 },
    ];

    const fileName = `TestSuite_${activeTab || "All"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error("Excel Export Error:", error);
    return false;
  }
};

export const exportToPDF = (generatedData, activeTab) => {
  try {
    const exportRows = formatDataForExport(generatedData, activeTab);
    if (exportRows.length === 0) return false;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text(`Test Suite Export (${activeTab || "All Types"})`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumns = ["Type", "ID", "Title", "Priority", "Steps", "Expected Result"];
    const tableRows = exportRows.map((row) => [
      row["Test Type"],
      row["ID"],
      row["Title"],
      row["Priority"],
      row["Steps"],
      row["Expected Result"],
    ]);

    // Use autoTable(doc, options) or fall back to doc.autoTable(options)
    if (typeof autoTable === "function") {
      autoTable(doc, {
        startY: 28,
        head: [tableColumns],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 12 },
          2: { cellWidth: 55 },
          3: { cellWidth: 20 },
          4: { cellWidth: 85 },
          5: { cellWidth: 65 },
        },
      });
    } else if (typeof doc.autoTable === "function") {
      doc.autoTable({
        startY: 28,
        head: [tableColumns],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 12 },
          2: { cellWidth: 55 },
          3: { cellWidth: 20 },
          4: { cellWidth: 85 },
          5: { cellWidth: 65 },
        },
      });
    } else {
      throw new Error("autoTable plugin is not attached properly.");
    }

    const fileName = `TestSuite_${activeTab || "All"}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error("PDF Export Error:", error);
    return false;
  }
};