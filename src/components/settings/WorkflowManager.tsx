
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  NodeProps,
  Edge,
  Connection,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  GitBranch, 
  Plus, 
  Settings2, 
  Save, 
  Trash2, 
  Database, 
  LayoutGrid, 
  Zap, 
  ShieldCheck,
  Briefcase,
  Play,
  Film,
  Globe,
  Star,
  Users,
  IndianRupee,
  FileText,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

// --- Node Definitions ---

const FEATURE_BLOCKS = [
  { type: 'Sales Phase', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  { type: 'Production Phase', icon: Film, color: 'text-blue-500', bg: 'bg-blue-50' },
  { type: 'Release Phase', icon: Play, color: 'text-green-500', bg: 'bg-green-50' },
  { type: 'Social Media', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50' },
  { type: 'Influencer Library', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
  { type: 'Project Management', icon: LayoutGrid, color: 'text-slate-500', bg: 'bg-slate-50' },
  { type: 'Finance', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { type: 'Reports', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { type: 'Approvals', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const PHASES = ['Sales', 'Pre-Production', 'Production', 'Post-Production', 'Release', 'Marketing'];

// --- Custom Node Component ---

const WorkflowNode = ({ data, selected }: NodeProps) => {
  const block = FEATURE_BLOCKS.find(b => b.type === data.moduleType) || FEATURE_BLOCKS[0];
  const Icon = block.icon;

  return (
    <div className={`p-4 rounded-2xl bg-white border-2 transition-all min-w-[200px] shadow-lg ${selected ? 'border-primary' : 'border-slate-100'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-300 border-2 border-white" />
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl ${block.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${block.color}`} />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{data.moduleType}</p>
          <p className="text-sm font-bold text-slate-900 truncate">{data.label || 'New Node'}</p>
        </div>
      </div>
      {data.stage && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-100">{data.stage}</Badge>
          <div className="flex -space-x-1">
            {data.allowedRoles?.slice(0, 3).map((r: string, i: number) => (
              <div key={i} className="h-4 w-4 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[6px] font-bold text-slate-400 uppercase">
                {r[0]}
              </div>
            ))}
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-300 border-2 border-white" />
    </div>
  );
};

const nodeTypes = {
  workflowNode: WorkflowNode,
};

// --- Main Component ---

export default function WorkflowManager() {
  const db = useFirestore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Roles
  const rolesQuery = useMemoFirebase(() => query(collection(db, "roles"), orderBy("name", "asc")), [db]);
  const { data: roles } = useCollection(rolesQuery);

  // Fetch Workflow
  const workflowRef = useMemoFirebase(() => doc(db, "workflowSettings", "defaultWorkflow"), [db]);
  const { data: workflowData, isLoading: isWorkflowLoading } = useDoc(workflowRef);

  useEffect(() => {
    if (workflowData && nodes.length === 0) {
      setNodes(workflowData.nodes || []);
      setEdges(workflowData.edges || []);
    }
  }, [workflowData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const addNode = (moduleType: string) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: `${moduleType} Step`,
        moduleType,
        phase: PHASES[0],
        stage: 'Initial',
        allowedRoles: ['Super Admin'],
        permissions: {
          view: true,
          edit: false,
          approve: false,
          delete: false,
          moveStage: true
        },
        autoTransition: false,
        requiredApprovalRoleId: null
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  };

  const updateSelectedNode = (newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowRef) return;
    setIsSaving(true);
    try {
      await setDoc(workflowRef, {
        nodes,
        edges,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "System Workflow Deployed", description: "All module access and stage transitions updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deployment Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (isWorkflowLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-250px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline tracking-tight">System Workflow Engine</h2>
          <p className="text-sm text-slate-500 font-medium tracking-normal">Visualize and configure strategic feature access and stage transitions.</p>
        </div>
        <Button onClick={handleSaveWorkflow} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 tracking-normal transition-all active:scale-95">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Deploy Strategy
        </Button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Feature Library */}
        <div className="w-64 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Feature Library</p>
          {FEATURE_BLOCKS.map((block) => (
            <Card 
              key={block.type} 
              className="border border-slate-100 shadow-sm rounded-2xl cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => addNode(block.type)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${block.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <block.icon className={`h-5 w-5 ${block.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-normal">{block.type}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#cbd5e1" variant={'dots' as any} />
            <Controls className="!bg-white !border-slate-100 !shadow-lg !rounded-xl overflow-hidden" />
            <MiniMap className="!bg-white !border-slate-100 !shadow-lg !rounded-xl overflow-hidden" zoomable pannable />
            <Panel position="top-right">
              <Badge className="bg-white/80 backdrop-blur-md text-slate-500 border border-slate-100 px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-sm">
                <GitBranch className="h-3 w-3 mr-2" /> Live Canvas
              </Badge>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right: Configuration */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white h-full flex flex-col overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-bold font-headline tracking-normal flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {selectedNode ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Identity</Label>
                      <Input 
                        value={selectedNode.data.label as string} 
                        onChange={(e) => updateSelectedNode({ label: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Phase</Label>
                      <Select 
                        value={selectedNode.data.phase as string} 
                        onValueChange={(val) => updateSelectedNode({ phase: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl">
                          {PHASES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage Identifier</Label>
                      <Input 
                        value={selectedNode.data.stage as string} 
                        onChange={(e) => updateSelectedNode({ stage: e.target.value })}
                        placeholder="e.g. Lead, In-Review"
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-50 pt-6">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allowed Strategic Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {roles?.map((role) => {
                        const isAllowed = (selectedNode.data.allowedRoles as string[] || []).includes(role.name);
                        return (
                          <Badge 
                            key={role.id}
                            onClick={() => {
                              const current = (selectedNode.data.allowedRoles as string[] || []);
                              const updated = isAllowed ? current.filter(r => r !== role.name) : [...current, role.name];
                              updateSelectedNode({ allowedRoles: updated });
                            }}
                            className={`cursor-pointer px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                              isAllowed ? "bg-primary text-white border-none" : "bg-slate-50 text-slate-400 border-none hover:bg-slate-100"
                            }`}
                          >
                            {role.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-50 pt-6">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Permissions</Label>
                    <div className="space-y-3">
                      {Object.keys(selectedNode.data.permissions as any).map((key) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-normal">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <Switch 
                            checked={(selectedNode.data.permissions as any)[key]} 
                            onCheckedChange={(val) => {
                              const p = { ...(selectedNode.data.permissions as any), [key]: val };
                              updateSelectedNode({ permissions: p });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-50 pt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto Transition</Label>
                      <Switch 
                        checked={selectedNode.data.autoTransition as boolean} 
                        onCheckedChange={(val) => updateSelectedNode({ autoTransition: val })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approval Authority</Label>
                      <Select 
                        value={selectedNode.data.requiredApprovalRoleId as string || "none"} 
                        onValueChange={(val) => updateSelectedNode({ requiredApprovalRoleId: val === 'none' ? null : val })}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none font-bold text-[10px]">
                          <SelectValue placeholder="No Approval Needed" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl">
                          <SelectItem value="none">No Approval Needed</SelectItem>
                          {roles?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="ghost" onClick={deleteSelectedNode} className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/5 font-bold text-xs uppercase tracking-widest gap-2">
                    <Trash2 className="h-4 w-4" /> Purge Node
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                    <GitBranch className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select a strategic node to configure access policy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
