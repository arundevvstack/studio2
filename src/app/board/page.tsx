"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const COLUMNS = [
  { id: "Pitch", title: "PITCH" },
  { id: "Discussion", title: "DISCUSSION" },
  { id: "Pre Production", title: "PRE PRODUCTION" },
  { id: "In Progress", title: "PRODUCTION" },
  { id: "Post Production", title: "POST PRODUCTION" },
  { id: "Released", title: "RELEASE" }
];

interface ProjectCardData {
  id: string;
  title: string;
  client: string;
  deadline: string;
  status: string;
}

export default function BoardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: projects, isLoading } = useCollection(projectsQuery);

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "clients"));
  }, [db, user]);

  const { data: clients } = useCollection(clientsQuery);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const clientMap = React.useMemo(() => {
    const map = new Map();
    clients?.forEach(c => map.set(c.id, c.name));
    return map;
  }, [clients]);

  const getProjectsByStatus = useCallback((status: string): ProjectCardData[] => {
    return (projects || [])
      .filter((p: any) => (p.status || "Pitch") === status)
      .map((p: any) => ({
        id: p.id,
        title: p.name,
        client: clientMap.get(p.clientId) || "Unknown",
        deadline: p.dueDate || "TBD",
        status: p.status || "Pitch"
      }));
  }, [projects, clientMap]);

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we dropped over a column ID directly
    const columnMatch = COLUMNS.find(col => col.id === overId);
    let newStatus = columnMatch ? columnMatch.id : null;

    // If not a column, check if we dropped over a card
    if (!newStatus) {
      const overCard = projects?.find(p => p.id === overId);
      if (overCard) {
        newStatus = overCard.status || "Pitch";
      }
    }

    if (newStatus) {
      const activeProject = projects?.find(p => p.id === activeId);
      if (activeProject && activeProject.status !== newStatus) {
        const projectRef = doc(db, "projects", activeId);
        updateDocumentNonBlocking(projectRef, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const activeProject = activeId ? projects?.find(p => p.id === activeId) : null;

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900 tracking-normal">Kanban Board</h1>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Manage project throughput across strategic phases.</p>
        </div>
        <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20 tracking-normal">
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="w-full flex-1 pb-10">
            <div className="flex gap-6 min-h-[600px] w-max pr-8">
              {COLUMNS.map((column) => (
                <BoardColumn 
                  key={column.id} 
                  id={column.id} 
                  title={column.title} 
                  cards={getProjectsByStatus(column.id)} 
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="mt-4" />
          </ScrollArea>
          
          <DragOverlay>
            {activeId && activeProject ? (
              <BoardCard 
                id={activeProject.id}
                title={activeProject.name}
                client={clientMap.get(activeProject.clientId) || "Unknown"}
                deadline={activeProject.dueDate || "TBD"}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function BoardColumn({ id, title, cards }: { id: string, title: string, cards: ProjectCardData[] }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="w-[320px] shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{title}</h3>
        <Badge variant="outline" className="text-[10px] font-bold rounded-md bg-white border-slate-100 tracking-normal">
          {cards.length}
        </Badge>
      </div>
      
      <SortableContext id={id} items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef}
          className="flex-1 bg-slate-50/50 rounded-3xl p-3 border border-slate-100/50 space-y-3 min-h-[200px] transition-colors"
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
          {cards.length === 0 && (
            <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">Drop items here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({ card }: { card: ProjectCardData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoardCard 
        id={card.id}
        title={card.title}
        client={card.client}
        deadline={card.deadline}
      />
    </div>
  );
}

function BoardCard({ id, title, client, deadline, isOverlay = false }: any) {
  return (
    <div className={`p-5 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-xl rotate-3 scale-105' : ''}`}>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase mb-1 tracking-normal">{client}</p>
          <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-normal">{title}</h4>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-normal">
            <span>Due {deadline === 'TBD' ? 'NO DATE' : deadline}</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-normal hover:bg-slate-100" onPointerDown={(e) => e.stopPropagation()}>
            <Link href={`/projects/${id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "text-foreground border border-input bg-background"
  };
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
