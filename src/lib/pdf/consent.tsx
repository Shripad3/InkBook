import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111111",
  },
  header: {
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: "#c9a84c",
    paddingBottom: 12,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#c9a84c",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#111111",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 140,
    color: "#555555",
  },
  value: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  clauseText: {
    marginBottom: 8,
    color: "#333333",
  },
  signatureBox: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 16,
  },
  signatureName: {
    fontSize: 18,
    fontFamily: "Helvetica-Oblique",
    color: "#111111",
    marginBottom: 4,
  },
  signatureMeta: {
    fontSize: 9,
    color: "#777777",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 8,
    fontSize: 9,
    color: "#aaaaaa",
  },
});

interface ConsentPDFProps {
  clientName: string;
  clientEmail: string;
  artistName: string;
  sessionType: string;
  date: string;
  time: string;
  placement: string | null;
  sizeEstimate: string | null;
  medicalNotes: string | null;
  signedAt: string;
  ipAddress?: string;
}

const CLAUSES = [
  "I confirm that I am over 18 years of age and have provided accurate personal information.",
  "I understand that tattooing is a permanent body modification. I accept full responsibility for my decision to proceed.",
  "I acknowledge that individual results may vary and that the final appearance depends on skin type, placement, and aftercare.",
  "I confirm that I am not pregnant, breastfeeding, or under the influence of alcohol or drugs.",
  "I disclose any known allergies, skin conditions, blood disorders, immune deficiencies, or medications that may affect healing.",
  "I understand that deposits are non-refundable if I cancel within 48 hours of my appointment.",
  "I agree to follow all aftercare instructions provided by my artist. Failure to do so may affect the outcome.",
  "I grant permission for the artist to photograph the completed tattoo for their portfolio unless otherwise requested in writing.",
  "I release the artist and studio from liability for any complications arising from undisclosed medical conditions or failure to follow aftercare advice.",
  "By signing below, I confirm I have read and understood all of the above, and consent freely to proceed.",
];

export function ConsentFormPDF({
  clientName,
  clientEmail,
  artistName,
  sessionType,
  date,
  time,
  placement,
  sizeEstimate,
  medicalNotes,
  signedAt,
  ipAddress,
}: ConsentPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>InkBook</Text>
          <Text style={styles.title}>Tattoo Consent Form</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{clientEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Artist</Text>
            <Text style={styles.value}>{artistName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Session type</Text>
            <Text style={styles.value}>{sessionType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date &amp; time</Text>
            <Text style={styles.value}>{date} at {time}</Text>
          </View>
          {placement && (
            <View style={styles.row}>
              <Text style={styles.label}>Placement</Text>
              <Text style={styles.value}>{placement}</Text>
            </View>
          )}
          {sizeEstimate && (
            <View style={styles.row}>
              <Text style={styles.label}>Size estimate</Text>
              <Text style={styles.value}>{sizeEstimate}</Text>
            </View>
          )}
        </View>

        {medicalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclosed Medical Information</Text>
            <Text style={styles.clauseText}>{medicalNotes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent &amp; Declaration</Text>
          {CLAUSES.map((clause, i) => (
            <Text key={i} style={styles.clauseText}>
              {i + 1}. {clause}
            </Text>
          ))}
        </View>

        <View style={styles.signatureBox}>
          <Text style={styles.sectionTitle}>Electronic Signature</Text>
          <Text style={styles.signatureName}>{clientName}</Text>
          <Text style={styles.signatureMeta}>Signed on {signedAt}</Text>
          {ipAddress && (
            <Text style={styles.signatureMeta}>IP address: {ipAddress}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text>This document was generated by InkBook (inkbook.io) and constitutes a legally binding consent record.</Text>
        </View>
      </Page>
    </Document>
  );
}
