export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Register",
      description: "Create your free account and get started quickly.",
    },
    {
      number: "2",
      title: "Add Applications",
      description: "Enter job details, upload documents, and add personal notes.",
    },
    {
      number: "3",
      title: "Stay in Control",
      description: "Track your progress and manage all applications in one place.",
    },
  ];

  return (
    <section className="bg-background text-foreground py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-base font-semibold text-primary">How it works</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Get started in three simple steps
        </p>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Bewerbungsmanager is designed to make job hunting easier than ever.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                {step.number}
              </span>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
