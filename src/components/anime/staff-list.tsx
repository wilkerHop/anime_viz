import { AnimeStaff } from "@/lib/api/jikan-types";
import Image from "next/image";

interface StaffListProps {
  staff: AnimeStaff[];
}

export function StaffList({ staff }: StaffListProps) {
  // Take top 12 staff members
  const topStaff = staff.slice(0, 12);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black uppercase border-l-8 border-brutal-cyan pl-3">
        Staff
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topStaff.map((person) => (
          <div 
            key={`${person.person.id}-${person.role}`}
            className="flex items-center gap-3 bg-white border-3 border-brutal-black p-2 shadow-brutal-sm hover:shadow-brutal transition-all"
          >
            <div className="relative w-12 h-12 shrink-0 border-2 border-brutal-black">
              <Image
                src={person.person.image || "/placeholder.jpg"}
                alt={person.person.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{person.person.name}</div>
              <div className="text-xs text-brutal-black/60 truncate">
                {person.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
