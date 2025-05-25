'use client'
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
import { useEffect, useState } from "react";
import { useBox } from "@/store/boxStore";
import { axiosInstance } from "@/utils/axiosInstance";

const EditBoxSheet = ({ open, setOpen, id }) => {
  const editBox = useBox((state) => state.editBox);
  const [boxInfo, setBoxInfo] = useState({
    designation: "1",
    type: "1",
    inStock: 0,
    empty: 0,
  });

  useEffect(() => {
    const getBox = async () => {
      try {
        const response = await axiosInstance.get(`/box/${id}`);
        if (response.status === 200) {
          const data = await response.data;
          console.log(data);
          setBoxInfo(data.box);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getBox();
  }, [open, id]);

  

  const handleClick = (e) => {
    e.preventDefault();
    editBox(boxInfo, id);
    setOpen(false);
    // clear the form
    setBoxInfo({
      designation: "",
      type: "",
      inStock: 0,
      empty: 0,
    });
  };

  const handleChange = (e) => {
    setBoxInfo({
      ...boxInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier Un Crate</SheetTitle>
          <SheetDescription>
            La Vous peuvez modifier un crate en changment des valeurs de le formulaire.
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
              value={boxInfo?.designation}
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
              value={boxInfo?.type}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="qqtInStock">Quantite En Stock</Label>
            <Input
              id="qqtInStock"
              type="number"
              name="inStock"
              value={boxInfo?.inStock}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="qqtEmpty">Quantite Vide</Label>
            <Input
              id="qttEmpty"
              type="number"
              name="empty"
              value={boxInfo?.empty}
              onChange={handleChange}
            />
          </div>
         
          <SheetFooter>
            <Button>Modifier</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditBoxSheet;
