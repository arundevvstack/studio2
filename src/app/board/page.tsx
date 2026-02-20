"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const COLUMNS = [
  { id: "Planned", title: "PITCH" },
  { id: "Discussion", title: "DISCUSSION" },
  { id: "Pre Production", title: "PRE PRODUCTION" },
  { id: "In Progress", title: "PRODUCTION" },
  { id: "Post Production", title: "POST PRODUCTION" },
  { id: "Completed", title: "RELEASE" }
];

export default function BoardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const [boardData, setBoardData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    // Note: userId check is removed to show all projects for this prototype session
    // If you want user-specific projects, restore: where("userId", "==", user.uid)
    return query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: projects, isLoading } = useCollection(projectsQuery);

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"));
  }, [db]);

  const { data: clients } = useCollection(clientsQuery);

  useEffect(() => {
    if (!projects) return;

    const clientMap = new Map((clients || []).map((c: any) => [c.id, c.name]));

    const newBoardData = COLUMNS.map(col => ({
      ...col,
      cards: projects
        .filter((p: any) => (p.status || "Planned") === col.id)
        .map((p: any) => ({
          id: p.id,
          title: p.name,
          criticality: p.priority || "MEDIUM",
          client: clientMap.get(p.clientId) || "Unknown",
          progress: p.progress || 0,
          deadline: p.dueDate || "TBD",
          team: p.teamMemberIds || []
        }))
    }));

    setBoardData(newBoardData);
  }, [projects, clients]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = useCallback((id: UniqueIdentifier) => {
    if (boardData.some((col) => col.id === id)) return id;
    const container = boardData.find((col) =>
      col.cards.some((c: any) => c.id === id)
    );
    return container ? container.id : null;
  }, [boardData]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      const projectRef = doc(db, "projects", active.id as string);
      updateDocumentNonBlocking(projectRef, { status: overContainer });
    }
  }

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Kanban Board</h1>
          <p className="text-sm text-slate-500 font-medium">Manage project throughput across strategic phases.</p>
        </div>
        <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
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
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <ScrollArea className="flex-1 pb-10">
            <div className="flex gap-6 min-h-[600px]">
              {boardData.map((column) => (
                <div key={column.id} className="w-[320px] shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase">{column.title}</h3>
                    <Badge variant="outline" className="text-[10px] font-bold rounded-md bg-white border-slate-100">
                      {column.cards.length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 bg-slate-50/50 rounded-3xl p-3 border border-slate-100/50 space-y-3">
                    {column.cards.map((card: any) => (
                      <Card key={card.id} className="p-5 bg-white border-slate-100 shadow-sm rounded-2xl group hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-primary uppercase mb-1">{card.client}</p>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{card.title}</h4>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                              <span>Due {card.deadline === 'TBD' ? 'NO DATE' : card.deadline}</span>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-100">
                              <Link href={`/projects/${card.id}`}>Details</Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {column.cards.length === 0 && (
                      <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase">No Active Items</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DndContext>
      )}
    </div>
  );
}

// Minimal Card component for local use to avoid dependency issues
function Card({ children, className, ...props }: any) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
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
