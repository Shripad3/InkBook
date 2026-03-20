import { Html, Head, Body, Container, Heading, Text, Section, Hr, Link } from "@react-email/components";

interface Props {
  artistName: string;
  clientName: string;
  sessionType: string;
  date: string;
  time: string;
  depositAmount: string;
  dashboardUrl: string;
}

export function ArtistNewBookingEmail({
  artistName,
  clientName,
  sessionType,
  date,
  time,
  depositAmount,
  dashboardUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            New booking confirmed 🎉
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {artistName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            You have a new confirmed booking. The deposit has been received.
          </Text>

          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px", margin: "16px 0" }}>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Client</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 16px" }}>{clientName}</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Session type</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 16px" }}>{sessionType}</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Date & time</Text>
            <Text style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 16px" }}>{date} at {time}</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 4px" }}>Deposit received</Text>
            <Text style={{ color: "#c9a84c", fontWeight: "600", margin: "0" }}>{depositAmount}</Text>
          </Section>

          <Link
            href={dashboardUrl}
            style={{
              backgroundColor: "#c9a84c",
              color: "#000000",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            View Booking Details
          </Link>

          <Hr style={{ borderColor: "#2a2a2a", margin: "24px 0" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>InkBook notification</Text>
        </Container>
      </Body>
    </Html>
  );
}
