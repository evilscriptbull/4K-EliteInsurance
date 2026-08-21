import { team } from "@/lib/config/agency";
import { Card } from "@/components/ui/Card";

function TeamMemberCard({ name, role }: { name: string; role: string }) {
  return (
    <Card className="text-center">
      <p className="font-serif text-lg font-semibold text-brand-900">{name}</p>
      <p className="mt-1 text-sm text-brand-600">{role}</p>
    </Card>
  );
}

export function TeamGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member) => (
        <TeamMemberCard key={member.name} name={member.name} role={member.role} />
      ))}
    </div>
  );
}
