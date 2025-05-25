
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useEmployee } from "@/store/employeeStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddEmployeeSheet = ({ open, setOpen, onEmployeeAdded }) => {
  const { createEmployee, employeeState: { loadingEmployee, error } } = useEmployee();

  const [employeeInfo, setEmployeeInfo] = useState({
    cin: "",
    role: "",
    name: "",
    address: "",
    tel: "",
    salary_fix: 0,
  });

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(employeeInfo);
      setOpen(false);
      setEmployeeInfo({
        cin: "",
        role: "",
        name: "",
        address: "",
        tel: "",
        salary_fix: 0,
      });
      if (onEmployeeAdded) onEmployeeAdded();
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  const handleChange = (e) => {
    setEmployeeInfo({
      ...employeeInfo,
      [e.target.name]: e.target.value,
    });
  };

  const changeRole = (value) => {
    console.log("Selected role:", value);
    setEmployeeInfo({ ...employeeInfo, role: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Employé</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouvel employé.
          </SheetDescription>
        </SheetHeader>
        {error && <p className="text-red-500 px-4">{error}</p>}
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="cin">CIN</Label>
            <Input
              id="cin"
              type="text"
              placeholder="Numéro CIN"
              name="cin"
              value={employeeInfo.cin}
              onChange={handleChange}
              disabled={loadingEmployee}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nom de l'employé"
              name="name"
              value={employeeInfo.name}
              onChange={handleChange}
              disabled={loadingEmployee}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={employeeInfo.role}
              onValueChange={changeRole}
              name="role"
              disabled={loadingEmployee}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assistent">Assistent</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Seller">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              type="text"
              placeholder="Adresse"
              name="address"
              value={employeeInfo.address}
              onChange={handleChange}
              disabled={loadingEmployee}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="tel">Téléphone</Label>
            <Input
              id="tel"
              type="text"
              placeholder="Numéro de téléphone"
              name="tel"
              value={employeeInfo.tel}
              onChange={handleChange}
              disabled={loadingEmployee}
            />
          </div>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="salary_fix">Salaire Fixe</Label>
            <Input
              id="salary_fix"
              type="number"
              placeholder="Salaire fixe"
              name="salary_fix"
              value={employeeInfo.salary_fix}
              onChange={handleChange}
              disabled={loadingEmployee}
            />
          </div>
          <SheetFooter className="px-4">
            <Button type="submit" disabled={loadingEmployee}>
              {loadingEmployee ? "Ajout..." : "Ajouter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddEmployeeSheet;
