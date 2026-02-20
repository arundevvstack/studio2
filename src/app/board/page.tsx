"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const INITIAL_BOARD_DATA = [
  {
    id: "col-1",
    title: "PITCH",
    cards: []
  },
  {
    id: "col-2",
    title: "DISCUSSION",
    cards: []
  },
  {
    id: "col-3",
    title: "PRE PRODUCTION",
    cards: [
      {
        id: "p-1",
        title: "Podcast",
        criticality: "MEDIUM",
        client: "GG",
        progress: 35,
        deadline: "N/A",
        team: ["u1", "u2"]
      }
    ]
  },
  {
    id: "col-4",
    title: "PRODUCTION",
    cards: [
      {
        id: "p-2",
        title: "TVC",
        criticality: "MEDIUM",
        client: "GG",
        progress: 65,
        deadline: "N/A",
        team: ["u3", "u4"]
      },
      {
        id: "p-3",
        title: "TVC",
        criticality: "MEDIUM",
        client: "Amaze Homes",
        progress: 65,
        deadline: "N/A",
        team: ["u1", "u5"]
      }
    ]
  },
  {
    id: "col-5",
    title: "POST PRODUCTION",
    cards: [
      {
        id: "p-4",
        title: "Ai Video production",
        criticality: "HIGH",
        client: "Kumbaya Kombucha",
        progress: 85,
        deadline: "N/A",
        team: ["u2", "u3"]
      }
    ]
  },
  {
    id: "col-6",
    title: "RELEASE",
    cards: []
  }
];

interface CardProps {
  id: string;
  title: string;
  criticality: string;
  client: string;
  progress: number;
  deadline: string;
  team: string[];
}

function KanbanCard({ card, isOverlay }: { card: CardProps; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-xl rotate-2 scale-105' : ''}`}
    >
      <div className="space-y-6 pointer-events-none">
        <h4 className="text-xl font-bold font-headline text-slate-900 leading-tight">
          {card.title}
        </h4>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={`border-none text-[8px] font-bold px-3 py-0.5 rounded-lg ${
            card.criticality === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
          }`}>
            {card.criticality}
          </Badge>
          <Badge className="bg-blue-50 text-blue-500 border-none text-[8px] font-bold px-3 py-0.5 rounded-lg">
            {card.client}
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {card.progress}% COMPLETE
          </p>
          <Progress value={card.progress} className="h-1.5 bg-slate-50" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 text-red-400">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">{card.deadline}</span>
          </div>
          <div className="flex -space-x-2">
            {card.team.map((u, i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-white grayscale hover:grayscale-0 transition-all">
                <AvatarImage src={`https://picsum.photos/seed/${u}/100/100`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const [boardData, setBoardData] = useState(INITIAL_BOARD_DATA);
  const [activeCard, setActiveCard] = useState<CardProps | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findContainer(id: string) {
    if (boardData.find((col) => col.id === id)) return id;
    const col = boardData.find((col) => col.cards.find((c) => c.id === id));
    return col ? col.id : null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = active.data.current?.card;
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const overId = over?.id as string;
    if (!overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setBoardData((prev) => {
      const activeItems = prev.find((c) => c.id === activeContainer)?.cards || [];
      const overItems = prev.find((c) => c.id === overContainer)?.cards || [];
      
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      let newIndex: number;
      if (prev.find((c) => c.id === overId)) {
        newIndex = overItems.length;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      return prev.map((col) => {
        if (col.id === activeContainer) {
          return { ...col, cards: activeItems.filter((i) => i.id !== active.id) };
        }
        if (col.id === overContainer) {
          return {
            ...col,
            cards: [
              ...overItems.slice(0, newIndex),
              activeItems[activeIndex],
              ...overItems.slice(newIndex)
            ]
          };
        }
        return col;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const overId = over?.id as string;

    if (!overId) {
      setActiveCard(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = boardData.find((c) => c.id === activeContainer)?.cards.findIndex((i) => i.id === active.id) ?? -1;
      const overIndex = boardData.find((c) => c.id === overContainer)?.cards.findIndex((i) => i.id === overId) ?? -1;

      if (activeIndex !== overIndex) {
        setBoardData((prev) => prev.map((col) => {
          if (col.id === activeContainer) {
            return { ...col, cards: arrayMove(col.cards, activeIndex, overIndex) };
          }
          return col;
        }));
      }
    }

    setActiveCard(null);
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">
            Board
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visualize and manage your production pipeline.
          </p>
        </div>
        <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white text-slate-400 border-none shadow-sm opacity-50 cursor-not-allowed">
          + Quick Add
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1 w-full pb-6">
          <div className="flex gap-6 min-h-[700px]">
            {boardData.map((column) => (
              <div key={column.id} className="w-[320px] shrink-0 flex flex-col space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {column.title}
                    </h3>
                    <Badge className="bg-slate-100 text-slate-500 border-none h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px] font-bold">
                      {column.cards.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <SortableContext
                  id={column.id}
                  items={column.cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 flex flex-col gap-4 min-h-[200px]">
                    {column.cards.map((card) => (
                      <KanbanCard key={card.id} card={card} />
                    ))}

                    <Button variant="ghost" className="h-14 w-full rounded-[2rem] border-none bg-slate-50/50 hover:bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest gap-2 mt-auto">
                      <Plus className="h-4 w-4" />
                      New Entry
                    </Button>
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
