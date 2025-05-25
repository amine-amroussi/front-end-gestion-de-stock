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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProduct } from "@/store/productStore";
import { axiosInstance } from "@/utils/axiosInstance";

const EditProductSheet = ({ open, setOpen, productId }) => {
  const editProduct = useProduct((state) => state.editProduct);
  const fetchAllBoxes = useBox((state) => state.fetchAllBoxes);
  const boxes = useBox((state) => state.boxState.boxes);

  useEffect(() => {
    fetchAllBoxes();

    const getProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}`);
        if (response.status === 200) {
          const data = await response.data;
          console.log(data);
          setProductInfo(data.data.product);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getProduct();
  }, [productId]);

  const [productInfo, setProductInfo] = useState({
    designation: "",
    genre: "",
    priceUnite: 0,
    box: "", // Initialize as empty string or a valid box.id
    capacityByBox: 0,
  });

  const handleClick = (e) => {
    e.preventDefault();
    editProduct(productInfo, productId);
    setOpen(false);
    setProductInfo({
      designation: "",
      genre: "",
      priceUnite: 0,
      box: "",
      capacityByBox: 0,
    });
  };

  const handleChange = (e) => {
    setProductInfo({
      ...productInfo,
      [e.target.name]: e.target.value,
    });
  };

  const changeBox = (value) => {
    console.log("Selected box:", value); // Debug to confirm value
    setProductInfo({ ...productInfo, box: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier Un Produit</SheetTitle>
          <SheetDescription>
            La Vous peuvez modifier un produit en changement des informations du
            formulaire.
          </SheetDescription>
        </SheetHeader>
        <form className="text-sm" onSubmit={handleClick}>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Designation">Designation</Label>
            <Input
              id="Designation"
              type="text"
              placeholder="Designation de crate"
              name="designation"
              value={productInfo.designation}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="Genre">Genre</Label>
            <Input
              id="Genre"
              type="text"
              placeholder="Genre de crate"
              name="genre"
              value={productInfo.genre}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="prixUnite">Le Prix Unitaire</Label>
            <Input
              id="prixUnite"
              type="number"
              name="priceUnite"
              value={productInfo.priceUnite}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="capacityByBox">La Capacite par Crate</Label>
            <Input
              id="capacityByBox"
              type="number"
              name="capacityByBox"
              value={productInfo.capacityByBox}
              onChange={handleChange}
            />
          </div>
          <div className="my-2 flex flex-col gap-2 px-4">
            <Label htmlFor="box">Choisir le crate</Label>
            <Select
              value={productInfo.box}
              onValueChange={changeBox}
              name="box"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un crate" value={productInfo.box} />
              </SelectTrigger>
              <SelectContent>
                {boxes.length > 0 ? (
                  boxes.map((box) => (
                    <SelectItem key={box.id} value={box.id.toString()}>
                      {box.designation}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun crate disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <SheetFooter>
            <Button type="submit">Modifier</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProductSheet;
