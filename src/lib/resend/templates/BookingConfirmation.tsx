import { Html, Head, Body, Container, Heading, Text, Section, Hr, Link } from "@react-email/components";

interface Props {
  clientName: string;
  artistName: string;
  sessionType: string;
  date: string;
  time: string;
  depositAmount: string;
}

export function BookingConfirmationEmail({
  clientName,
  artistName,
  sessionType,
  date,
  time,
  depositAmount,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600" }}>
            Your appointment is confirmed ✓
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {clientName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            Your deposit of <strong style={{ color: "#ffffff" }}>{depositAmount}</strong> has been received.
            Your {sessionType} session with {artistName} is confirmed.
          </Text>

          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Date</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 16px" }}>{date}</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Time</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 16px" }}>{time}</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Artist</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0" }}>{artistName}</Text>
          </Section>

          <Heading style={{ color: "#ffffff", fontSize: "16px" }}>Before your appointment</Heading>
          <Text style={{ color: "#a1a1aa" }}>💧 Stay hydrated in the days leading up to your session</Text>
          <Text style={{ color: "#a1a1aa" }}>🍽️ Eat a good meal beforehand — low blood sugar makes tattooing harder</Text>
          <Text style={{ color: "#a1a1aa" }}>👕 Wear loose clothing that gives access to the area being tattooed</Text>
          <Text style={{ color: "#a1a1aa" }}>🚫 No alcohol 24 hours before your session</Text>

          <Hr style={{ borderColor: "#2a2a2a", margin: "24px 0" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            Booking managed by <Link href="https://inkbook.io" style={{ color: "#c9a84c" }}>InkBook</Link>.
            Deposits are non-refundable if cancelled within 48 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
