import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import robotoCyrillicBold from "@fontsource/roboto/files/roboto-cyrillic-700-normal.woff";
import robotoCyrillicRegular from "@fontsource/roboto/files/roboto-cyrillic-400-normal.woff";
import robotoCyrillicExtBold from "@fontsource/roboto/files/roboto-cyrillic-ext-700-normal.woff";
import robotoCyrillicExtRegular from "@fontsource/roboto/files/roboto-cyrillic-ext-400-normal.woff";
import robotoLatinBold from "@fontsource/roboto/files/roboto-latin-700-normal.woff";
import robotoLatinRegular from "@fontsource/roboto/files/roboto-latin-400-normal.woff";
import type { PortfolioDraft } from "../types";

let pdfFontsRegistered = false;

ensurePdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    backgroundColor: "#FFFFFF",
    color: "#1F2933",
    fontFamily: "QadamPdf",
    fontSize: 11,
    lineHeight: 1.5
  },
  header: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE7E1"
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F766E"
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B"
  },
  section: {
    marginTop: 18
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#0F766E",
    textTransform: "uppercase"
  },
  highlightBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAF7",
    borderWidth: 1,
    borderColor: "#DDE7E1"
  },
  label: {
    fontWeight: 700,
    color: "#0F766E"
  },
  paragraph: {
    marginBottom: 8
  },
  markdownHeading: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#1F2933"
  },
  linkRow: {
    marginBottom: 6
  },
  link: {
    color: "#2563EB",
    textDecoration: "none"
  },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDE7E1",
    fontSize: 10,
    color: "#64748B"
  }
});

type PortfolioDocumentProps = {
  portfolio: PortfolioDraft;
};

export function PortfolioDocument({ portfolio }: PortfolioDocumentProps) {
  const { fields } = portfolio;
  const paragraphs = splitIntoParagraphs(portfolio.output);
  const links = extractLinks([
    fields.evidence,
    fields.activities,
    fields.did,
    fields.participated,
    portfolio.output
  ]);

  return (
    <Document
      author="QadamGraph"
      creator="QadamGraph"
      title={`${fields.studentName || "Student"} Portfolio`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{fields.studentName || "Student Portfolio"}</Text>
          <Text style={styles.subtitle}>
            {[fields.grade, fields.school].filter(Boolean).join(" · ") || "Student profile"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Program</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.paragraph}>
              <Text style={styles.label}>University: </Text>
              {fields.targetUniversity || "Not specified"}
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.label}>Program: </Text>
              {fields.targetProgram || "Not specified"}
            </Text>
            <Text>
              <Text style={styles.label}>Academic base: </Text>
              {fields.academicStrengths || "Not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio Narrative</Text>
          {paragraphs.map((paragraph, index) =>
            paragraph.startsWith("## ") ? (
              <Text key={`${paragraph}-${index}`} style={styles.markdownHeading}>
                {paragraph.replace(/^##\s*/, "")}
              </Text>
            ) : (
              <Text key={`${paragraph}-${index}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            )
          )}
        </View>

        {links.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence Links</Text>
            <View>
              {links.map((url) => (
                <Text key={url} style={styles.linkRow}>
                  <Link src={url} style={styles.link}>
                    {url}
                  </Link>
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Generated in QadamGraph on {formatDate(portfolio.updatedAt)}. Review factual details before sending.
        </Text>
      </Page>
    </Document>
  );
}

function ensurePdfFonts() {
  if (pdfFontsRegistered || typeof window === "undefined") return;

  const stylesheet = `
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoLatinRegular}") format("woff");
      font-style: normal;
      font-weight: 400;
      unicode-range: U+0000-00FF;
    }
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoCyrillicRegular}") format("woff");
      font-style: normal;
      font-weight: 400;
      unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+04D8-04D9, U+04E8-04E9, U+04AE-04AF, U+04A2-04A3, U+04BA-04BB, U+0406-0456;
    }
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoCyrillicExtRegular}") format("woff");
      font-style: normal;
      font-weight: 400;
      unicode-range: U+0460-052F, U+1C80-1C88, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoLatinBold}") format("woff");
      font-style: normal;
      font-weight: 700;
      unicode-range: U+0000-00FF;
    }
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoCyrillicBold}") format("woff");
      font-style: normal;
      font-weight: 700;
      unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+04D8-04D9, U+04E8-04E9, U+04AE-04AF, U+04A2-04A3, U+04BA-04BB, U+0406-0456;
    }
    @font-face {
      font-family: "QadamPdf";
      src: url("${robotoCyrillicExtBold}") format("woff");
      font-style: normal;
      font-weight: 700;
      unicode-range: U+0460-052F, U+1C80-1C88, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
  `;

  const stylesheetUrl = URL.createObjectURL(new Blob([stylesheet], { type: "text/css" }));
  Font.register({
    family: "QadamPdf",
    src: stylesheetUrl
  });

  pdfFontsRegistered = true;
}

function splitIntoParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function extractLinks(parts: string[]) {
  const matches = parts
    .flatMap((part) => part.match(/https?:\/\/[^\s)]+/gi) ?? [])
    .map((url) => url.replace(/[.,;]+$/, ""));

  return Array.from(new Set(matches)).slice(0, 6);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
