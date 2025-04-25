export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your application settings and content
        </p>
      </div>

      <div className="grid gap-6">
        {/* Admin content will go here */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="cursor-pointer rounded-lg border p-4 hover:bg-accent">
              <h3 className="font-medium">Questões</h3>
              <p className="text-sm text-muted-foreground">
                Manage questions and answers
              </p>
            </div>
            {/* Add more quick action cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
