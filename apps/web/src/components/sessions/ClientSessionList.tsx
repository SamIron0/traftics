import { Session } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, ArrowUp, ArrowDown, RefreshCw, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import getCountryFlag from "country-flag-icons/unicode"
import StepIndicator from "@/components/ui/StepIndicator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortField = 'started_at' | 'duration' | 'location' | 'browser' | 'os' | 'relevanceScore' | 'frustrationScore' | 'engagementScore';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface Props {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  statusFilter: 'all' | 'played' | 'not_played';
  onSort: (sortedSessions: Session[]) => void;
}

function getBrowserIcon(browserName: string) {
  const normalizedName = browserName.toLowerCase();
  const browserPatterns = [
    { pattern: /chrome/i, icon: '/browsers/chrome.svg' },
    { pattern: /firefox/i, icon: '/browsers/firefox.svg' },
    { pattern: /safari/i, icon: '/browsers/safari.svg' },
    { pattern: /edge/i, icon: '/browsers/edge.svg' },
    { pattern: /opera/i, icon: '/browsers/opera.svg' }
  ];

  const match = browserPatterns.find(({ pattern }) => pattern.test(normalizedName));

  if (!match) {
    return null;
  }

  return (
    <Image
      src={match.icon}
      alt={`${browserName} icon`}
      width={16}
      height={16}
    />
  );
}

function getOSIcon(osName: string) {
  const normalizedName = osName.toLowerCase();
  const osPatterns = [
    { pattern: /windows/i, icon: '/os/windows.svg' },
    { pattern: /mac|ios/i, icon: '/os/apple.svg' },
    { pattern: /android/i, icon: '/os/android.svg' },
  ];

  const match = osPatterns.find(({ pattern }) => pattern.test(normalizedName));

  if (!match) {
    return null;
  }

  return (
    <Image
      src={match.icon}
      alt={`${osName} icon`}
      width={16}
      height={16}
    />
  );
}

function getRelevanceDescription(score: number | undefined): string {
  switch (score) {
    case 0:
      return "Very Low";
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "Very High";
    default:
      return "Unknown";
  }
}

function SortHeader({
  field,
  label,
  sortState,
  onSort
}: {
  field: SortField;
  label: string;
  sortState: SortState;
  onSort: (field: SortField) => void;
}) {
  return (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        <span className="text-muted-foreground">
          {sortState.field === field && (
            sortState.direction === 'asc'
              ? <ArrowUp className="h-4 w-4" />
              : <ArrowDown className="h-4 w-4" />
          )}
        </span>
      </div>
    </TableHead>
  );
}

export function ClientSessionList({ sessions, onSelectSession, dateRange, statusFilter, onSort }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const itemsPerPage = 20;
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'desc'
  });

  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply date filter
    if (dateRange) {
      filtered = filtered.filter((session) => {
        if (!session.started_at) return false;
        const sessionDate = new Date(session.started_at);
        return sessionDate >= dateRange.startDate && sessionDate <= dateRange.endDate;
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((session) => {
        if (statusFilter === 'played') {
          return session.is_played === true;
        } else {
          return session.is_played === false;
        }
      });
    }

    return filtered;
  }, [sessions, dateRange, statusFilter]);

  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const sortedAndFilteredSessions = useMemo(() => {
    const sortSessions = (sessions: Session[]) => {
      if (!sortState.field) return sessions;
  
      const sorted = [...sessions].sort((a, b) => {
        let compareA, compareB;
  
        switch (sortState.field) {
          case 'started_at':
            compareA = new Date(a.started_at || 0).getTime();
            compareB = new Date(b.started_at || 0).getTime();
            break;
          case 'duration':
            compareA = a.duration || 0;
            compareB = b.duration || 0;
            break;
          case 'location':
            compareA = (a.location?.country || '');
            compareB = (b.location?.country || '');
            break;
          case 'browser':
            compareA = a.browser;
            compareB = b.browser; 
            break;
          case 'os':
            compareA = a.os;
            compareB = b.os;
            break;
          case 'relevanceScore':
            compareA = a.relevance_score;
            compareB = b.relevance_score;
            break;
          case 'frustrationScore':
            compareA = a.frustration_score ?? 0;
            compareB = b.frustration_score ?? 0;
            break;
          case 'engagementScore':
            compareA = a.engagement_score ?? 0;
            compareB = b.engagement_score ?? 0;
            break;
          default:
            return 0;
        }
  
        if (sortState.direction === 'asc') {
          return (compareA ?? 0) > (compareB ?? 0) ? 1 : -1;
        }
        return (compareA ?? 0) < (compareB ?? 0) ? 1 : -1;
      });
      
      return sorted;
    };
  
    return sortSessions(filteredSessions);
  }, [filteredSessions, sortState]);

  useEffect(() => {
    onSort(sortedAndFilteredSessions);
  }, [sortedAndFilteredSessions, onSort]);

  const handleSessionClick = (sessionId: string) => {
    onSelectSession(sessionId);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(sortedAndFilteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = sortedAndFilteredSessions.slice(startIndex, endIndex);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDeleteSessions = async () => {
    try {
      await Promise.all(
        selectedSessions.map(sessionId =>
          fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
        )
      );
      setSelectedSessions([]);
      // Refresh the sessions list (you might want to implement this through a callback)
      window.location.reload();
    } catch (error) {
      console.error('Error deleting sessions:', error);
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleAllSessions = () => {
    if (selectedSessions.length === currentSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(currentSessions.map(session => session.id));
    }
  };

  return (
    <div className="relative">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox
                  checked={selectedSessions.length === currentSessions.length && currentSessions.length > 0}
                  onCheckedChange={toggleAllSessions}
                  aria-label="Select all sessions"
                />
              </TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <SortHeader
                field="relevanceScore"
                label="Relevance"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="frustrationScore"
                label="Frustration"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="engagementScore"
                label="Engagement"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="started_at"
                label="Started"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="duration"
                label="Duration"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="location"
                label="Country"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="browser"
                label="Browser"
                sortState={sortState}
                onSort={handleSort}
              />
              <SortHeader
                field="os"
                label="OS"
                sortState={sortState}
                onSort={handleSort}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => toggleSessionSelection(session.id)}
                    aria-label={`Select session ${session.id}`}
                  />
                </TableCell>
                <TableCell>
                  <Button className="px-3" variant="outline" onClick={() => handleSessionClick(session.id)}>
                    {session.is_played ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Replay
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </TableCell>
                <TableCell>{getRelevanceDescription(session.relevance_score)}</TableCell>
                <TableCell>
                  <StepIndicator score={session.frustration_score} type="frustration" />
                </TableCell>
                <TableCell>
                  <StepIndicator score={session.engagement_score} type="engagement" />
                </TableCell>
                <TableCell>
                  {session.started_at ? formatDistanceToNow(new Date(session.started_at), {
                    addSuffix: true,
                  }) : "N/A"}
                </TableCell>
                <TableCell>{session.duration ? formatTime(session.duration) : "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img" aria-label={`${(session.location?.country || "")} flag`}>
                      {session.location ? getCountryFlag(session.location.country.toUpperCase()) : '🏳️'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(session.location?.country || "")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {getBrowserIcon(session.browser?.name || '')}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {session.browser?.name} {session.browser?.version}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {getOSIcon(session.os?.name?.split(' ')[0] || '')}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {session.os?.name} {session.os?.version}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredSessions.length)} of {sortedAndFilteredSessions.length} sessions
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {selectedSessions.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 p-4 rounded-lg border shadow-lg flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedSessions.length} session{selectedSessions.length > 1 ? 's' : ''} selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {selectedSessions.length} selected session{selectedSessions.length > 1 ? 's' : ''}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSessions}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}