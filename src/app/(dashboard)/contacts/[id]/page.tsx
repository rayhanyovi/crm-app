import { ArrowLeft, Building2, CalendarClock, ContactRound, HandCoins } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { DetailCard } from "@/components/shared/detail-card";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/services/auth.service";
import { getContactDetail } from "@/services/contact.service";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const contact = await getContactDetail(id).catch(() => null);
  if (!contact) notFound();

  const displayName = `${contact.first_name} ${contact.last_name}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description="Contact profile, company relationship, and current commercial context."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/contacts">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <DetailLayout
        main={
          <>
            <DetailCard
              title="Contact details"
              fields={[
                { label: "Title", value: contact.title },
                { label: "Source", value: <StatusBadge value={contact.source} /> },
                { label: "Email", value: contact.email },
                { label: "Phone", value: contact.phone },
                {
                  label: "Company",
                  value:
                    contact.company_id && contact.company_name ? (
                      <Link href={`/companies/${contact.company_id}`} className="hover:underline">
                        {contact.company_name}
                      </Link>
                    ) : null,
                },
                { label: "Created", value: new Date(contact.created_at).toLocaleDateString() },
              ]}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.deals.length ? (
                  contact.deals.map((deal) => (
                    <div key={deal.id} className="rounded-md border p-3">
                      <div className="font-medium">{deal.title}</div>
                      <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                        <span>${deal.value.toLocaleString()}</span>
                        <StatusBadge value={deal.stage} />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={HandCoins} title="No deals" description="Deals linked to this contact will appear here." />
                )}
              </CardContent>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryRow icon={Building2} label="Company" value={contact.company_name ?? "None"} />
                <SummaryRow icon={HandCoins} label="Deals" value={String(contact.deal_count)} />
                <SummaryRow icon={ContactRound} label="Owner" value={contact.created_by_id.slice(0, 8)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.recent_activities.length ? (
                  contact.recent_activities.map((activity) => (
                    <div key={activity.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{activity.subject}</div>
                        <StatusBadge value={activity.type} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={CalendarClock} title="No activity" description="Activity timeline entries will appear here in Phase 4." />
                )}
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="truncate font-medium text-foreground">{value}</span>
      </div>
      <Separator className="mt-3" />
    </div>
  );
}
