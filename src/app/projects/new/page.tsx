
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  Image as ImageIcon, 
  SendHorizontal,
  Loader2,
  IndianRupee,
  MapPin,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod"
];

const PROJECT_TAGS = [
  "Commercial", "Film", "Music Video", "Fashion", "Editorial", "Wedding", "Social Media", "Corporate"
];

export default function AddProjectPage() {
  const router = useRouter();
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, "clients"), orderBy("name", "asc"));
  }, [db]);

  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    description: "",
    budget: "",
    location: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, clientId: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide a project name and select a client."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const projectsRef = collection(db, "projects");
      const newProjectRef = doc(projectsRef);
      const projectId = newProjectRef.id;

      const projectData = {
        id: projectId,
        name: formData.name,
        clientId: formData.clientId,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        location: formData.location,
        tags: selectedTags,
        status: "Lead",
        crew: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setDocumentNonBlocking(newProjectRef, projectData, { merge: true });
      
      toast({
        title: "Success",
        description: `${formData.name} has been initiated.`
      });

      router.push("/projects");
    } catch (error) {
      console.error("Error initiating project:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm shrink-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline text-slate-900 tracking-normal">
            Initiate Project
          </h1>
          <p className="text-slate-500 mt-1 font-medium tracking-normal">
            Deploy a new high-growth media project for your partners.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        
        <div className="p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
                Project Name
              </label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Nike Summer '24" 
                className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20 tracking-normal"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
                Strategic Client
              </label>
              <Select onValueChange={handleClientChange} value={formData.clientId}>
                <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus:ring-primary/20 tracking-normal">
                  <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Identify client..."} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {isLoadingClients ? (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="font-medium text-slate-700 tracking-normal">
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">No Clients Found</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => router.push('/clients/new')}
                        className="text-primary p-0 h-auto mt-1 tracking-normal"
                      >
                        Onboard Client First
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
                Quote Price (INR)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="e.g. 50,000" 
                  className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus-visible:ring-primary/20 tracking-normal"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
                Project Hub (Location)
              </label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                  <SelectTrigger className="pl-14 h-14 rounded-xl bg-slate-50 border-none shadow-inner text-base px-6 focus:ring-primary/20 tracking-normal">
                    <SelectValue placeholder="Select Kerala district..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
                    {KERALA_DISTRICTS.map(district => (
                      <SelectItem key={district} value={district} className="tracking-normal">{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal flex items-center gap-2">
              <Tag className="h-3 w-3" /> Project Verticals (Tags)
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map(tag => (
                <Badge 
                  key={tag} 
                  onClick={() => toggleTag(tag)}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-normal transition-all ${
                    selectedTags.includes(tag) ? "bg-primary border-none text-white shadow-md shadow-primary/20" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-normal">
              Executive Brief
            </label>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Outline the core creative direction, target demographics, and key deliverables..."
              className="min-h-[200px] rounded-[2rem] bg-slate-50 border-none shadow-inner text-base p-8 focus-visible:ring-primary/20 resize-none placeholder:text-slate-400 tracking-normal"
            />
          </div>
        </div>

        <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-end gap-10">
          <Button 
            type="button"
            variant="ghost" 
            className="text-slate-900 font-bold text-sm hover:bg-transparent tracking-normal"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !formData.clientId}
            className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 gap-3 group tracking-normal"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Initiate Project
                <SendHorizontal className="h-5 w-5 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
