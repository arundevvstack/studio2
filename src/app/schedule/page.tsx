
"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Briefcase, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import Link from "next/link";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function SchedulePage() {
  const db = useFirestore();
  const { user } = useUser();
  const todayDate = new Date();
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db, user]);
  const { data: projects, isLoading } = useCollection(projectsQuery);

  // Generate days for the current month
  const calendarDays = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    
    // Previous month padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, fullDate: null });
    }

    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push({ 
        day: i, 
        fullDate: new Date(currentYear, currentMonth, i).toISOString().split('T')[0] 
      });
    }
    return days;
  }, [currentMonth, currentYear]);

  const getProjectsForDate = (dateString: string | null) => {
    if (!dateString || !projects) return [];
    return projects.filter(p => p.dueDate === dateString);
  };

  const monthName = todayDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">
            Production Schedule
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">
            Visualizing delivery milestones across the strategic timeline.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-8">
            <span className="text-xs font-bold uppercase text-slate-900 tracking-widest">
              {monthName} {currentYear}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[600px] flex items-center justify-center bg-white rounded-[2rem] border border-slate-100">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-collapse">
            {calendarDays.map((dayData, index) => {
              const dateProjects = getProjectsForDate(dayData.fullDate);
              const isToday = dayData.day === todayDate.getDate();
              
              return (
                <div
                  key={index}
                  className={`relative min-h-[180px] border-r border-b border-slate-50 p-5 transition-colors hover:bg-slate-50/30 group ${
                    isToday ? "bg-primary/5" : ""
                  } ${ (index + 1) % 7 === 0 ? "border-r-0" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    {dayData.day && (
                      <span
                        className={`text-sm font-bold ${
                          isToday ? "text-primary" : "text-slate-400"
                        }`}
                      >
                        {dayData.day}
                      </span>
                    )}
                    {isToday && (
                      <Badge className="bg-primary text-white border-none text-[8px] font-bold px-3 py-0.5 rounded-lg uppercase tracking-normal">
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    {dateProjects.map(project => (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group/item">
                          <p className="text-[10px] font-bold text-slate-900 leading-tight line-clamp-2 tracking-normal">{project.name}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-normal">{project.status}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
