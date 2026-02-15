import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, ArrowUpDown, TrendingUp, Calendar, Activity } from "lucide-react";

interface Patient {
  patient_id: string;
  probability: number;
  risk_level: 'High' | 'Medium' | 'Low';
  last_seen: string;
  drivers: Array<{
    feature: string;
    contrib: number;
  }>;
}

interface PatientListTabProps {
  results: Patient[];
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

type SortField = 'patient_id' | 'probability' | 'risk_level' | 'last_seen';
type SortDirection = 'asc' | 'desc';

export function PatientListTab({ results, onPatientSelect, selectedPatient }: PatientListTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('probability');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.filter(patient => {
      const matchesSearch = patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === "all" || patient.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'last_seen') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortField === 'risk_level') {
        const riskOrder = { High: 3, Medium: 2, Low: 1 };
        aVal = riskOrder[aVal as keyof typeof riskOrder];
        bVal = riskOrder[bVal as keyof typeof riskOrder];
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, searchTerm, riskFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'outline';
    }
  };

  const formatLastSeen = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters and Search */}
      <div className="flex-shrink-0 p-3 md:p-6 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by Patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by risk level" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="High">High Risk Only</SelectItem>
              <SelectItem value="Medium">Medium Risk Only</SelectItem>
              <SelectItem value="Low">Low Risk Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedResults.length} of {results.length} patients
          {riskFilter !== "all" && ` • Filtered by: ${riskFilter} risk`}
          {searchTerm && ` • Search: "${searchTerm}"`}
        </div>
      </div>

      {/* Patient Table */}
      <div className="flex-1 px-3 md:px-6 pb-3 md:pb-6 overflow-hidden">
        <div className="h-full border rounded-lg bg-background overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
                <TableRow className="border-b">
                  <TableHead className="w-24 md:w-32 bg-muted/50 p-2 md:p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('patient_id')}
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                    >
                      Patient ID
                      <ArrowUpDown className="ml-1 md:ml-2 h-2 w-2 md:h-3 md:w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-28 md:w-32 bg-muted/50 p-2 md:p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('probability')}
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                    >
                      Risk Score
                      <ArrowUpDown className="ml-1 md:ml-2 h-2 w-2 md:h-3 md:w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-20 md:w-28 bg-muted/50 p-2 md:p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('risk_level')}
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                    >
                      <span className="hidden sm:inline">Risk Level</span>
                      <span className="sm:hidden">Risk</span>
                      <ArrowUpDown className="ml-1 md:ml-2 h-2 w-2 md:h-3 md:w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-24 md:w-32 bg-muted/50 p-2 md:p-4 hidden sm:table-cell">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('last_seen')}
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                    >
                      Last Seen
                      <ArrowUpDown className="ml-1 md:ml-2 h-2 w-2 md:h-3 md:w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="bg-muted/50 p-2 md:p-4 hidden md:table-cell">
                    <span className="text-xs font-medium">Top Risk Drivers</span>
                  </TableHead>
                  <TableHead className="w-16 md:w-24 text-center bg-muted/50 p-2 md:p-4">
                    <span className="text-xs font-medium">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedResults.map((patient) => (
                  <TableRow 
                    key={patient.patient_id}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                      selectedPatient?.patient_id === patient.patient_id ? 'bg-primary/5 border-primary/50' : ''
                    }`}
                    onClick={() => onPatientSelect(patient)}
                  >
                    <TableCell className="font-mono text-xs md:text-sm font-medium p-2 md:p-4">
                      <span className="block truncate">{patient.patient_id}</span>
                    </TableCell>
                    <TableCell className="p-2 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-xs md:text-sm min-w-10">
                          {(patient.probability * 100).toFixed(1)}%
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-1.5 md:h-2 min-w-8 sm:min-w-16">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              patient.risk_level === 'High' ? 'bg-destructive' :
                              patient.risk_level === 'Medium' ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${patient.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 md:p-4">
                      <Badge variant={getRiskBadgeVariant(patient.risk_level)} className="text-[10px] md:text-xs px-1 md:px-2">
                        <span className="hidden sm:inline">{patient.risk_level}</span>
                        <span className="sm:hidden">{patient.risk_level.charAt(0)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-muted-foreground p-2 md:p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="truncate">{formatLastSeen(patient.last_seen)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 md:p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {patient.drivers.slice(0, 2).map((driver, idx) => (
                          <div key={idx} className="text-xs flex items-center gap-2">
                            <span className="capitalize font-medium truncate">
                              {driver.feature.replace(/_/g, ' ')}
                            </span>
                            <span className={`font-medium ${
                              driver.contrib > 0 ? 'text-destructive' : 'text-success'
                            }`}>
                              {driver.contrib > 0 ? '+' : ''}{(driver.contrib * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 md:p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-6 md:h-7 px-1 md:px-2 text-[10px] md:text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatientSelect(patient);
                        }}
                      >
                        <Eye className="w-2 h-2 md:w-3 md:h-3 mr-0 md:mr-1" />
                        <span className="hidden md:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Selected Patient Quick Card */}
      {selectedPatient && (
        <div className="flex-shrink-0 p-3 md:p-6 pt-0">
          <Card className="p-3 md:p-4 bg-primary/5 border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <h4 className="font-semibold flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  Patient {selectedPatient.patient_id} - Quick Summary
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-muted-foreground">Risk Assessment</p>
                    <p className="font-medium">
                      {(selectedPatient.probability * 100).toFixed(1)}% probability ({selectedPatient.risk_level} Risk)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Primary Driver</p>
                    <p className="font-medium capitalize">
                      {selectedPatient.drivers[0]?.feature.replace(/_/g, ' ')} 
                      <span className={selectedPatient.drivers[0]?.contrib > 0 ? 'text-destructive' : 'text-success'}>
                        {' '}({selectedPatient.drivers[0]?.contrib > 0 ? '+' : ''}{(selectedPatient.drivers[0]?.contrib * 100).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recommended Action</p>
                    <p className="font-medium">
                      {selectedPatient.risk_level === 'High' ? 'Immediate clinical review' :
                       selectedPatient.risk_level === 'Medium' ? 'Enhanced monitoring' : 'Continue routine care'}
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant={getRiskBadgeVariant(selectedPatient.risk_level)} className="self-start sm:mt-1 sm:ml-4">
                {selectedPatient.risk_level} Risk
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}