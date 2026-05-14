import { ArrowLeft, Building2, ContactRound, HandCoins, ListChecks } from "lucide-react";
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
import { getCompanyDetail } from "@/services/company.service";
import { getCurrentUser } from "@/services/auth.service";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const company = await getCompanyDetail(id).catch(() => null);
  if (!company) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        description="Company record, linked contacts, leads, and deals."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/companies">
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
              title="Company details"
              fields={[
                { label: "Industry", value: <StatusBadge value={company.industry} /> },
                { label: "Website", value: company.website },
                { label: "Email", value: company.email },
                { label: "Phone", value: company.phone },
                { label: "Address", value: company.address },
                { label: "Notes", value: company.notes },
              ]}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linked contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.contacts.length ? (
                  company.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                          {contact.first_name} {contact.last_name}
                        </Link>
                        <div className="text-sm text-muted-foreground">{contact.email ?? contact.phone}</div>
                      </div>
                      <ContactRound className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <EmptyState icon={ContactRound} title="No contacts" description="Contacts linked to this company will appear here." />
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
                <SummaryRow icon={ContactRound} label="Contacts" value={company.contact_count} />
                <SummaryRow icon={HandCoins} label="Deals" value={company.deal_count} />
                <SummaryRow icon={ListChecks} label="Leads" value={company.leads.length} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.deals.length ? (
                  company.deals.map((deal) => (
                    <div key={deal.id} className="rounded-md border p-3">
                      <div className="font-medium">{deal.title}</div>
                      <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                        <span>${deal.value.toLocaleString()}</span>
                        <StatusBadge value={deal.stage} />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Building2} title="No deals" description="Deals linked to this company will appear here." />
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
  icon: typeof ContactRound;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <Separator className="mt-3" />
    </div>
  );
}
