import React, {useState} from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EditStudentGradeForm } from './EditStudentGradeForm';
const people = [
  // Year 1 - DSIA
  { nom: "Benali", prenom: "Yasmine", year: "1", speciality: "DSIA", course: "TNS" },
  { nom: "Khelifa", prenom: "Omar", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Brahimi", prenom: "Sara", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Cherif", prenom: "Adel", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Haddad", prenom: "Nadia", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Toumi", prenom: "Karim", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Saadi", prenom: "Meriem", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Belkacem", prenom: "Rachid", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Zerrouki", prenom: "Lina", year: "1", speciality: "DSIA", course: "TNS"  },
  { nom: "Hamidi", prenom: "Samir", year: "1", speciality: "DSIA", course: "TNS"  },

  // Year 1 - MI
  { nom: "Aziz", prenom: "Fatima", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Belhadj", prenom: "Riad", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Chouikh", prenom: "Leila", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Djebbar", prenom: "Nabil", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Guedj", prenom: "Samira", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Haroun", prenom: "Mourad", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Idir", prenom: "Amina", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Jabbar", prenom: "Salah", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Khellaf", prenom: "Noura", year: "1", speciality: "MI", course: "BDD"  },
  { nom: "Lounis", prenom: "Fouad", year: "1", speciality: "MI", course: "BDD"  },

  // Year 2 - DSIA
  { nom: "Meziane", prenom: "Aya", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Bensaid", prenom: "Yacine", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Djelloul", prenom: "Nour", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Ferhat", prenom: "Walid", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Mansouri", prenom: "Imane", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Boudjemaa", prenom: "Ali", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Rahmani", prenom: "Sofia", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Amrani", prenom: "Hichem", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Belaid", prenom: "Farah", year: "2", speciality: "DSIA", course: "MEHO"  },
  { nom: "Kaci", prenom: "Mohamed", year: "2", speciality: "DSIA", course: "MEHO"  },

  // Year 2 - MI
  { nom: "Mokhtar", prenom: "Selma", year: "2", speciality: "MI", course: "TI" },
  { nom: "Nacer", prenom: "Karima", year: "2", speciality: "MI", course: "TI" },
  { nom: "Othmani", prenom: "Bilal", year: "2", speciality: "MI", course: "TI" },
  { nom: "Rahou", prenom: "Souad", year: "2", speciality: "MI", course: "TI" },
  { nom: "Said", prenom: "Youssef", year: "2", speciality: "MI", course: "TI" },
  { nom: "Tahar", prenom: "Nadia", year: "2", speciality: "MI", course: "TI" },
  { nom: "Yahia", prenom: "Rania", year: "2", speciality: "MI", course: "TI" },
  { nom: "Ziani", prenom: "Amine", year: "2", speciality: "MI", course: "TI" },
  { nom: "Boukhalfa", prenom: "Lamia", year: "2", speciality: "MI", course: "TI" },
  { nom: "Kerroum", prenom: "Hassan", year: "2", speciality: "MI", course: "TI" },
];
type CourseKey = "TNS" | "BDD" | "MEHO" | "TI";

const courseEvaluations: Record<CourseKey, string[]> = {
  TNS: ["Interro", "Examen"],
  BDD: ["Interro", "Examen", "TP"],
  MEHO: ["Examen", "TP"],
  TI: ["Interro", "Examen", "Project"]
};




const handleImport = async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  await fetch("/api/import_csv/", {
    method: "POST",
    body: formData,
  });
};


const HeadProfile = () => {
const [selectedCourse, setSelectedCourse] = useState<CourseKey>("TNS");
  const [selectedYear, setSelectedYear] = useState("1");
  const [selectedSpeciality, setSelectedSpeciality] = useState("DSIA");

  const [showForm, setShowForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const filtered = people.filter(
    p => p.course === selectedCourse && p.year === selectedYear && p.speciality === selectedSpeciality
  )

  const handleExport = () => {
  // Convert filtered data to CSV
  const headers = ["Nom", "Prenom", "Email"];
  const rows = filtered.map(person => [
    person.course,
    person.nom,
    person.prenom,
  ]);

  const csvContent =
    [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

  // Create a downloadable file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `people_${selectedCourse}_${selectedYear}_${selectedSpeciality}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  const handleRowClick = (person) => {
    console.log("Clicked person object:", person.year);
    setSelectedPerson(person);
    setShowForm(true);
  }

  return (
    <div className='mt-4'>
      <h2 className='mb-4'>Your Courses are:</h2>
      <div className="flex gap-4 mb-4">
        <Input type="file" accept=".csv" onChange={handleImport} />
        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Dropdowns */}
      <div className="flex gap-4 mb-4">
        <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val as CourseKey)}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Course</SelectLabel>
              <SelectItem value="TNS">TNS</SelectItem>
              <SelectItem value="BDD">BDD</SelectItem>
              <SelectItem value="MEHO">MEHO</SelectItem>
              <SelectItem value="TI">TI</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Year</SelectItem>
              <SelectItem value="3">3 Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Speciality</SelectLabel>
              <SelectItem value="DSIA">DSIA</SelectItem>
              <SelectItem value="MI">MI</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Table className='mb-4'>
      <TableCaption>The list of {selectedYear} {selectedSpeciality}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prenom</TableHead>
          {courseEvaluations[selectedCourse].map(evalName => (
          <TableHead key={evalName}>{evalName}</TableHead>
        ))}
          <TableHead className='text-right'>Average</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((person) => (
          <TableRow key={person.course} onClick={() => handleRowClick(person)}>
            <TableCell>{person.nom}</TableCell>
            <TableCell>{person.prenom}</TableCell>
            {courseEvaluations[selectedCourse].map(evalName => (
            <TableCell key={evalName}>14</TableCell>
            ))} 
            <TableCell className='text-right'>14.5</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={courseEvaluations[selectedCourse].length + 2}>course</TableCell>
          <TableCell className="text-right">{selectedCourse}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    {showForm && (
      <div className="fixed inset-0 z-50  flex items-center justify-center overflow-y-auto">
          {/* Overlay */}
          <div
          className="fixed h-full inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
          ></div>

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg shadow-lg p-6">
          <Button
              className="mb-4 self-end"
              variant="outline"
              onClick={() => setShowForm(false)}
          >
              Close
          </Button>

          {selectedPerson && 
          <EditStudentGradeForm onClose={() => setShowForm(false)} role={selectedCourse} person={selectedPerson}/>
          }
          </div>
      </div>
      )}
    </div>
  )
}

export default HeadProfile