import { Html, Head, Body, Container, Heading, Text, Section, Hr, Link } from "@react-email/components";

interface Props {
  clientName: string;
  artistName: string;
}

export function AftercareEmail({ clientName, artistName }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            Your aftercare guide 🩹
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {clientName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            Thank you for your session with {artistName}. Here&apos;s how to take care of your new tattoo:
          </Text>

          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px", margin: "16px 0" }}>
            <Text style={{ color: "#c9a84c", fontWeight: "600", margin: "0 0 8px" }}>First 24 hours</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Leave the wrap on for 2–4 hours (or as instructed)</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Gently wash with lukewarm water and unscented soap</Text>
            <Text style={{ color: "#a1a1aa", margin: "0" }}>• Pat dry — never rub</Text>
          </Section>

          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px", margin: "16px 0" }}>
            <Text style={{ color: "#c9a84c", fontWeight: "600", margin: "0 0 8px" }}>Days 2–14</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Apply a thin layer of unscented moisturiser 2–3 times daily</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Some peeling and itching is normal — do NOT scratch or pick</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Keep out of direct sun and avoid swimming, saunas, and soaking</Text>
            <Text style={{ color: "#a1a1aa", margin: "0" }}>• Wear loose clothing over the area</Text>
          </Section>

          <Text style={{ color: "#a1a1aa" }}>
            If you notice excessive redness, swelling, or signs of infection, contact a medical professional.
          </Text>

          <Hr style={{ borderColor: "#2a2a2a", margin: "24px 0" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            Aftercare info from {artistName} via <Link href="https://inkbook.io" style={{ color: "#c9a84c" }}>InkBook</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
