export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-muted-foreground text-sm">
        All notifications are sent automatically. Client-facing notifications cannot be disabled —
        they protect both you and your clients.
      </p>
      <div className="rounded-lg border border-border divide-y divide-border">
        {[
          { label: "Booking created", desc: "Client receives deposit reminder email", alwaysOn: true },
          { label: "Deposit paid", desc: "Client receives confirmation + prep instructions", alwaysOn: true },
          { label: "New booking (you)", desc: "You receive an email when a deposit is paid", alwaysOn: true },
          { label: "48h reminder", desc: "Client receives consent form + prep reminder", alwaysOn: true },
          { label: "24h SMS", desc: "Client receives day-before SMS reminder", alwaysOn: true },
          { label: "3h SMS", desc: "Client receives same-day SMS nudge", alwaysOn: true },
          { label: "Aftercare", desc: "Client receives aftercare instructions after session", alwaysOn: true },
          { label: "Healed photo request", desc: "Client receives email 8 weeks post-session", alwaysOn: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-xs text-emerald-500 font-medium">Always on</span>
          </div>
        ))}
      </div>
    </div>
  );
}
