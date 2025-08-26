import { FileText, StickyNote, Paperclip, BarChart } from "lucide-react";

export default function FeatureSection() {
  return (
    <>
      {/* Features Section */}
      <section id="features" className="bg-background text-foreground py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-primary">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage applications
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              Bewerbungsmanager helps you stay organized during your job hunt with all essential
              tools in one place.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-2">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Application Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Add and update your job applications easily.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <StickyNote className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Notes</h3>
                <p className="mt-2 text-muted-foreground">
                  Attach notes to each application to stay organized.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <Paperclip className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Attachments</h3>
                <p className="mt-2 text-muted-foreground">
                  Keep CVs, cover letters, and files in one place.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4">
              <BarChart className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">Overview</h3>
                <p className="mt-2 text-muted-foreground">
                  Track your progress and stay motivated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
