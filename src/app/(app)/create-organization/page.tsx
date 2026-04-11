
import { CreateOrganizationForm } from '@/components/organizations/create-organization-form';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
       <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Start Your Organization</h1>
          <p className="text-lg text-muted-foreground">
            Create a dedicated space for your team to explore ethical dilemmas, manage content, and track progress.
            Each user can create or be part of one organization at this time.
          </p>
        </CardContent>
      </Card>
      <CreateOrganizationForm />
    </div>
  );
}
