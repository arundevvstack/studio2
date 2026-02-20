"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CALENDAR_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export default function SchedulePage() {
  const today = 20;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline text-slate-900">
            Production Schedule
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visualizing delivery milestones across the timeline.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-6">
            <span className="text-xs font-bold uppercase text-slate-900">
              February 2026
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-6 text-center text-[10px] font-bold text-slate-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-collapse">
          {CALENDAR_DAYS.map((day) => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`relative min-h-[160px] border-r border-b border-slate-50 p-4 transition-colors hover:bg-slate-50/30 group ${
                  isToday ? "ring-2 ring-primary ring-inset z-10" : ""
                } ${day % 7 === 0 ? "border-r-0" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-primary" : "text-slate-400"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <Badge className="bg-primary text-white border-none text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase">
                      Today
                    </Badge>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}