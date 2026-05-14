import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ROLE_LABELS } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth.service";

const emptyMetrics = [
  ["Open deals", "0"],
  ["Pipeline value", "$0"],
  ["Recent activities", "0"],
  ["Unread notifications", "0"],
] as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const showTeamView = can(user, "view_team_dashboard", "dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your Phase 0 shell is ready for the seeded CRM data."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {emptyMetrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-normal">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Welcome to UnifiedCRM</CardTitle>
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <div className="rounded-md border bg-background p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              Signed in as
            </div>
            <div className="mt-1 text-base font-medium text-foreground">
              {user.first_name} {user.last_name}
            </div>
            <div>{user.email}</div>
          </div>
          <div className="rounded-md border bg-background p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              Dashboard mode
            </div>
            <div className="mt-1 text-base font-medium text-foreground">
              {showTeamView ? "Team oversight" : "Personal workspace"}
            </div>
            <div>
              Seed data and Phase 1 entities will populate this surface next.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
