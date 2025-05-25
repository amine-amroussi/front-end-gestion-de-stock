import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useBox } from "@/store/boxStore";

const AddBoxSheet = ({ open, setOpen }) => {
  const createBox = useBox((state) => state.createBox);

  const [boxInfo, setBoxInfo] = useState({
    designation: "",
    type: "",
    inStock: 0,
    empty: 0,
    capacity: 0
  });


  const handleClick = (e) => {
    e.preventDefault();
    createBox(boxInfo);
    setOpen(false);
    // clear the form
    setBoxInfo({
      designation: "",
      type: "",
      inStock: 0,
      empty: 0,
      capacity:0
    })
  };

  const handleChange = e => {
    setBoxInfo({
      ...boxInfo,
      [e.target.name]: e.target.value
    })
}

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Ajouter Un Crate</SheetTitle>
          <SheetDescription>
            La Vous peuvez ajouter un crate en remplissant le formulaire.
          </SheetDescription>
        </SheetHeader>
        <form className=" text-sm" onSubmit={handleClick}>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Designation">Designation</Label>
            <Input
              id="Designation"
              type="text"
              palaceholder="Designation de crate"
              name="designation"
              value={boxInfo.designation}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Type">Type</Label>
            <Input
              id="Type"
              type="text"
              palaceholder="Type de crate"
              name="type"
              value={boxInfo.type}
              onChange={handleChange}
            />
          </div>
          {/* <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="qqtInStock">Quantite En Stock</Label>
            <Input
              id="qqtInStock"
              type="number"
              name="inStock"
              value={boxInfo.inStock}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="qqtEmpty">Quantite Vide</Label>
            <Input
              id="qttEmpty"
              type="number"
              name="empty"
              value={boxInfo.empty}
              onChange={handleChange}
            />
          </div> */}
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="qqtEmpty">La capacity de crate</Label>
            <Input
              id="capacity"
              type="number"
              name="capacity"
              value={boxInfo.capacity}
              onChange={handleChange}
            />
          </div>
          <SheetFooter>
            <Button>Ajouter</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddBoxSheet;
