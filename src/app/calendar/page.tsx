import { PlanningCalendar } from '@/components/calendar/planning-calendar';

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-foreground">Outfit Calendar</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Plan your looks in advance and never have a "what to wear" moment again.
        </p>
      </header>
      <div className="flex-1">
        <PlanningCalendar />
      </div>
    </div>
  );
}
