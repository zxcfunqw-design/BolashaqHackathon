import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { PortfolioDocument } from "./PortfolioDocument";
import type { PortfolioDraft } from "../types";

type PortfolioPdfDownloadProps = {
  fileName: string;
  portfolio: PortfolioDraft;
};

export function PortfolioPdfDownload({
  fileName,
  portfolio
}: PortfolioPdfDownloadProps) {
  return (
    <PDFDownloadLink
      className="inline-flex"
      document={<PortfolioDocument portfolio={portfolio} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <span className={downloadButtonClassName(loading)}>
          <FileDown size={16} />
          {loading ? "Preparing PDF..." : "Download PDF"}
        </span>
      )}
    </PDFDownloadLink>
  );
}

function downloadButtonClassName(loading: boolean) {
  return `inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
    loading
      ? "pointer-events-none cursor-not-allowed bg-qadam-primary/60 text-qadam-primaryContrast"
      : "bg-qadam-primary text-qadam-primaryContrast shadow-soft hover:bg-qadam-primaryDark"
  }`;
}
