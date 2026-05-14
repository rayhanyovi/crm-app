import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DetailField = {
  label: string;
  value: ReactNode;
};

export function DetailCard({
  title,
  fields,
}: {
  title: string;
  fields: DetailField[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <div className="text-xs font-medium uppercase text-muted-foreground">
              {field.label}
            </div>
            <div className="mt-1 text-sm">{field.value || "—"}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
