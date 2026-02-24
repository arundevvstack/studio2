"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, User, Star, IndianRupee, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TalentCardProps {
  talent: any;
}

export function TalentCard({ talent }: TalentCardProps) {
  const primaryFollowers = Math.max(
    talent.platforms?.instagram?.followers || 0,
    talent.platforms?.youtube?.subscribers || 0
  );

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm rounded-3xl bg-white group hover:shadow-md transition-all h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img 
          src={talent.profileImage || `https://picsum.photos/seed/${talent.id}/400/400`}
          alt={talent.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {talent.verified && (
            <Badge className="bg-white/90 text-primary border-none shadow-sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          {talent.availableForFreeCollab && (
            <Badge className="bg-green-500/90 text-white border-none shadow-sm">
              Ready to Collab
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-slate-900/80 text-white border-none backdrop-blur-sm">
            {talent.type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 flex-grow space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{talent.name}</h3>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {talent.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {talent.category?.slice(0, 3).map((cat: string) => (
            <Badge key={cat} variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-slate-100">
              {cat}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              {formatFollowers(primaryFollowers)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Cost</p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3 text-slate-400" />
              {talent.estimatedCost?.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full rounded-xl font-bold text-slate-600 border-slate-100 hover:bg-slate-50">
          <Link href={`/talent-library/${talent.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
