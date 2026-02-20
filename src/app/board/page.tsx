"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Loader2
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
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const COLUMNS = [
  { id: "Planned", title: "PITCH" },
  { id: "Discussion", title: "DISCUSSION" },
  { id: "Pre Production", title: "PRE PRODUCTION" },
  { id: "In Progress", title: "PRODUCTION" },
  { id: "Post Production", title: "POST PRODUCTION" },
  { id: "Completed", title: "RELEASE" }
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

interface ColumnProps {
  id: string;
  title: string;
  cards: CardProps[];
}

function KanbanCard({ card, isOverlay }: { card: CardProps; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id, 
    data: { 
      type: 'card', 
      card 
    } 
  });

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
        <h4 className="text-xl font-bold text-slate-900 leading-tight">
          {card.title}
        </h4>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={`border-none text-[8px] font-bold px-3 py-0.5 rounded-lg ${
            card.criticality === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
          }`}>
            {card.criticality || 'MEDIUM'}
          </Badge>
          <Badge className="bg-blue-50 text-blue-500 border-none text-[8px] font-bold px-3 py-0.5 rounded-lg">
            {card.client}
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            {card.progress}% COMPLETE
          </p>
          <Progress value={card.progress} className="h-1.5 bg-slate-50" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 text-red-400">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase opacity-50">{card.deadline}</span>
          </div>
          <div className="flex -space-x-2">
            {(card.team || []).map((u, i) => (
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

function KanbanColumn({ column, children }: { column: ColumnProps; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="w-[320px] shrink-0 flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase">
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

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-4 min-h-[500px] pb-10">
        <SortableContext
          id={column.id}
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white/30 py-20">
              <div className="h-12 w-12 rounded-full border-2 border-slate-100 flex items-center justify-center mb-4 p-2.5">
                <Plus className="h-full w-full text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-200 uppercase">Drop Here</p>
            </div>
          ) : (
            column.cards.map((card) => (
              <KanbanCard key={card.id} card={card} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const [boardData, setBoardData] = useState<ColumnProps[]>([]);
  const [activeCard, setActiveCard] = useState<CardProps | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Projects
  const projectsQuery = useMemoFirebase(() => {
    return query(collection(db, "projects"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: projects, isLoading } = useCollection(projectsQuery);

  // Fetch Clients for mapping names
  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"));
  }, [db]);
  const { data: clients } = useCollection(clientsQuery);

  // Synchronize board data with Firestore projects
  useEffect(() => {
    if (!projects) return;

    const clientMap = new Map((clients || []).map(c => [c.id, c.name]));

    const newBoardData = COLUMNS.map(col => ({
      ...col,
      cards: projects
        .filter(p => (p.status || "Planned") === col.id)
        .map(p => ({
          id: p.id,
          title: p.name,
          criticality: p.priority || "MEDIUM",
          client: clientMap.get(p.clientId) || "Unknown Client",
          progress: p.progress || 0,
          deadline: p.dueDate || "TBD",
          team: p.teamMemberIds || []
        }))
    }));

    setBoardData(newBoardData);
  }, [projects, clients]);

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

  const findContainer = useCallback((id: UniqueIdentifier) => {
    if (boardData.some((col) => col.id === id)) return id;
    const container = boardData.find((col) => col.cards.some((c) => c.id === id));
    return container ? container.id : null;
  }, [boardData]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = active.data.current?.card as CardProps;
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setBoardData((prev) => {
      const activeItems = prev.find((c) => c.id === activeContainer)?.cards || [];
      const overItems = prev.find((c) => c.id === overContainer)?.cards || [];
      
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === over.id);

      let newIndex: number;
      if (prev.some((c) => c.id === over.id)) {
        newIndex = overItems.length;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      const updatedData = prev.map((col) => {
        if (col.id === activeContainer) {
          return { ...col, cards: activeItems.filter((i) => i.id !== active.id) };
        }
        if (col.id === overContainer) {
          const newCards = [...overItems];
          newCards.splice(newIndex, 0, activeItems[activeIndex]);
          return { ...col, cards: newCards };
        }
        return col;
      });

      return updatedData;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer && overContainer) {
      // Update Firestore status if moved to a different column
      if (activeContainer !== overContainer) {
        const projectRef = doc(db, "projects", active.id as string);
        updateDocumentNonBlocking(projectRef, { status: overContainer });
      }

      if (activeContainer === overContainer) {
        const activeIndex = boardData.find((c) => c.id === activeContainer)?.cards.findIndex((i) => i.id === active.id) ?? -1;
        const overIndex = boardData.find((c) => c.id === overContainer)?.cards.findIndex((i) => i.id === over.id) ?? -1;

        if (activeIndex !== overIndex) {
          setBoardData((prev) => prev.map((col) => {
            if (col.id === activeContainer) {
              return { ...col, cards: arrayMove(col.cards, activeIndex, overIndex) };
            }
            return col;
          }));
        }
      }
    }

    setActiveCard(null);
  }

  if (!mounted) return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-slate-400 font-bold text-sm uppercase">Loading Board...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-slate-900">
            Board
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visualize and manage your production pipeline.
          </p>
        </div>
        <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            Add Project
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold text-sm uppercase">Synchronizing Board...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="flex-1 w-full pb-6">
            <div className="flex gap-6 min-h-[800px]">
              {boardData.map((column) => (
                <KanbanColumn key={column.id} column={column}>
                  {/* Cards are handled inside KanbanColumn via SortableContext */}
                </KanbanColumn>
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
      )}
    </div>
  );
}