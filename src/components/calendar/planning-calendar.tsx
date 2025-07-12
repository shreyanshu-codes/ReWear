'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Badge } from '@/components/ui/badge';

export function PlanningCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { plannedOutfits } = useWardrobe();

  // For demonstration, let's create some dummy planned outfits.
  // In a real app, this would come from the useWardrobe hook.
  const demoOutfits = [
    { id: '1', date: new Date(), outfit: { suggestion: 'Casual look with White Tee and Blue Jeans.', reasoning: 'Perfect for a relaxed day.'} },
    { id: '2', date: addDays(new Date(), 3), outfit: { suggestion: 'Smart casual with Black Blazer and Jeans.', reasoning: 'Great for a work meeting.'} },
  ];
  
  const allPlans = [...plannedOutfits, ...demoOutfits];

  const selectedDayPlans = date ? allPlans.filter(p => format(p.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) : [];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
            <CardContent className="p-2">
                <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                components={{
                    DayContent: ({ date }) => {
                    const isPlanned = allPlans.some(p => format(p.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                    if (isPlanned) {
                        return <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />;
                    }
                    return null;
                    },
                }}
                />
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDayPlans.length > 0 ? `You have ${selectedDayPlans.length} outfit(s) planned.` : 'No outfits planned for this day.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayPlans.length > 0 ? (
                <div className="space-y-4">
                {selectedDayPlans.map(plan => (
                    <div key={plan.id} className="p-4 bg-muted rounded-lg">
                        <p className="font-semibold">{plan.outfit.suggestion}</p>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>Click a day on the calendar to view or plan an outfit.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
