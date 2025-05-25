
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
import { useCamion } from "@/store/camionStore";

const AddCamionSheet = ({ open, setOpen, onCamionAdded }) => {
  const { createCamion } = useCamion();

  const [camionInfo, setCamionInfo] = useState({
    matricule: "",
    capacity : 10,
  });

  const handleClick = async (e) => {
    e.preventDefault();
    await createCamion(camionInfo);
    setOpen(false);
    setCamionInfo({
      matricule: "",
      marque: "",
      capacite: 0,
    });
    if (onCamionAdded) onCamionAdded();
  };

  const handleChange = (e) => {
    setCamionInfo({
      ...camionInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Ajouter un Camion</SheetTitle>
          <SheetDescription>
            Remplissez le formulaire pour ajouter un nouveau camion.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm flex flex-col gap-4" onSubmit={handleClick}>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              type="text"
              placeholder="Matricule du camion (ex. ABC-123-A)"
              name="matricule"
              value={camionInfo.matricule}
              onChange={handleChange}
            />
          </div>
          
          <SheetFooter className="px-4">
            <Button type="submit">Ajouter</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddCamionSheet;
