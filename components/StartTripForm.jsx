"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X, Plus } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import { toast } from "sonner";
import PrintInvoice from "./PrintInvoice"; // Adjust the path based on your project structure

const steps = ["Vehicle and Personnel", "Date and Zone", "Products", "Boxes", "Révision"];

const StartTripForm = ({ open, onOpenChange, onTripStarted }) => {
  const [formData, setFormData] = useState({
    truck_matricule: "",
    driver_id: "",
    seller_id: "",
    assistant_id: "",
    date: new Date().toISOString().split("T")[0],
    zone: "",
    tripProducts: [],
    tripBoxes: [],
  });
  const [trucks, setTrucks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksRes, employeesRes, productsRes, boxesRes] = await Promise.all([
          axiosInstance.get("/truck"),
          axiosInstance.get("/employee"),
          axiosInstance.get("/product"),
          axiosInstance.get("/box"),
        ]);
        setTrucks(trucksRes.data.trucks || []);
        setEmployees(employeesRes.data.data?.employees || []);
        setProducts(productsRes.data.data?.products || []);
        setBoxes(boxesRes.data.boxes || []);

        console.log("formData:", formData);
        console.log("employees:", employeesRes.data?.data?.employees || []);
        console.log("driver_id match:", employeesRes.data?.data?.employees.some(emp => emp.cin === formData.driver_id));
        console.log("seller_id match:", employeesRes.data?.data?.employees.some(emp => emp.cin === formData.seller_id));
        console.log("assistant_id match:", employeesRes.data?.data?.employees.some(emp => emp.cin === formData.assistant_id));
      } catch (error) {
        setFormErrors({ fetch: "Erreur lors de la récupération des données pour le formulaire." });
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value === "none" ? "" : value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.tripProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: field === "product_id" ? value : parseInt(value) || 0 };
    setFormData({ ...formData, tripProducts: updatedProducts });
    setFormErrors({ ...formErrors, [`product_${index}_${field}`]: "" });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      tripProducts: [
        ...formData.tripProducts,
        { product_id: "", qttOut: 0, qttOutUnite: 0 },
      ],
    });
  };

  const removeProduct = (index) => {
    setFormData({
      ...formData,
      tripProducts: formData.tripProducts.filter((_, i) => i !== index),
    });
  };

  const handleBoxChange = (index, field, value) => {
    const updatedBoxes = [...formData.tripBoxes];
    updatedBoxes[index] = { ...updatedBoxes[index], [field]: field === "box_id" ? value : parseInt(value) || 0 };
    setFormData({ ...formData, tripBoxes: updatedBoxes });
    setFormErrors({ ...formErrors, [`box_${index}_${field}`]: "" });
  };

  const addBox = () => {
    setFormData({
      ...formData,
      tripBoxes: [...formData.tripBoxes, { box_id: "", qttOut: 0 }],
    });
  };

  const removeBox = (index) => {
    setFormData({
      ...formData,
      tripBoxes: formData.tripBoxes.filter((_, i) => i !== index),
    });
  };

  const cancel = () => {
    onOpenChange(false);
    setActiveStep(1);
    setFormData({
      truck_matricule: "",
      driver_id: "",
      seller_id: "",
      assistant_id: "",
      date: new Date().toISOString().split("T")[0],
      zone: "",
      tripProducts: [],
      tripBoxes: [],
    });
    setFormErrors({});
  };

  const handleSubmit = async () => {
    console.log("Submitting form data:", formData);
    setLoading(true);
    try {
      await onTripStarted(formData);
      toast.success("Tournée démarrée avec succès !");
      cancel();
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du démarrage de la tournée.";
      setFormErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const errors = {};
    if (activeStep === 1) {
      if (!formData.truck_matricule) errors.truck_matricule = "Camion requis";
      if (!formData.driver_id) errors.driver_id = "Conducteur requis";
      if (!formData.seller_id) errors.seller_id = "Vendeur requis";
    } else if (activeStep === 2) {
      if (!formData.date) errors.date = "Date requise";
      if (!formData.zone) errors.zone = "Zone requise";
    } else if (activeStep === 3) {
      if (formData.tripProducts.length === 0) {
        errors.products = "Au moins un produit requis";
      } else {
        formData.tripProducts.forEach((p, i) => {
          if (!p.product_id) errors[`product_${i}_product_id`] = "Produit requis";
          if (p.qttOut < 0) errors[`product_${i}_qttOut`] = "Quantité non négative requise";
          if (p.qttOutUnite < 0) errors[`product_${i}_qttOutUnite`] = "Quantité non négative requise";
        });
      }
    } else if (activeStep === 4) {
      if (formData.tripBoxes.length === 0) {
        errors.boxes = "Au moins une boîte requise";
      } else {
        formData.tripBoxes.forEach((b, i) => {
          if (!b.box_id) errors[`box_${i}_box_id`] = "Boîte requise";
          if (b.qttOut <= 0) errors[`box_${i}_qttOut`] = "Quantité positive requise";
        });
      }
    }
    setFormErrors(errors);
    console.log("Validation errors:", errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setActiveStep(activeStep + 1);
  };

  const prevStep = () => setActiveStep(activeStep - 1);

  const drivers = employees.filter(emp => emp.role === "Driver");
  const sellers = employees.filter(emp => emp.role === "Seller");
  const assistants = employees.filter(emp => emp.role === "Assistent");

  const calculateTotalAmount = () => {
    let total = 0;
    formData.tripProducts.forEach((product) => {
      const productData = products.find(p => p.id === parseInt(product.product_id));
      if (productData && productData.priceUnite) {
        const capacityByBox = productData.capacityByBox || 0;
        const totalUnits = product.qttOut * capacityByBox + (product.qttOutUnite || 0);
        total += totalUnits * productData.priceUnite;
      }
    });
    return total;
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Démarrer une Nouvelle Tournée</h2>
          <Button variant="ghost" onClick={cancel} disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    activeStep > index + 1
                      ? "bg-blue-600 text-white"
                      : activeStep === index + 1
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-center">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 mt-2">
            <div
              className="h-1 bg-blue-600 transition-all"
              style={{ width: `${(activeStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {formErrors.fetch && <p className="text-red-500 text-sm mb-2">{formErrors.fetch}</p>}
        {formErrors.submit && <p className="text-red-500 text-sm mb-2">{formErrors.submit}</p>}

        {activeStep === 1 && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="truck_matricule" className="text-sm font-medium">Camion</Label>
              <select
                id="truck_matricule"
                name="truck_matricule"
                value={formData.truck_matricule}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.truck_matricule ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un camion</option>
                {trucks.map((truck) => (
                  <option key={truck.matricule} value={truck.matricule}>
                    {truck.matricule}
                  </option>
                ))}
              </select>
              {formErrors.truck_matricule && (
                <p className="text-red-500 text-xs mt-1">{formErrors.truck_matricule}</p>
              )}
            </div>
            <div>
              <Label htmlFor="driver_id" className="text-sm font-medium">Conducteur</Label>
              <select
                id="driver_id"
                name="driver_id"
                value={formData.driver_id}
                onChange={(e) => handleSelectChange("driver_id", e.target.value)}
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.driver_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un conducteur</option>
                {drivers.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {formErrors.driver_id && (
                <p className="text-red-500 text-xs mt-1">{formErrors.driver_id}</p>
              )}
            </div>
            <div>
              <Label htmlFor="seller_id" className="text-sm font-medium">Vendeur</Label>
              <select
                id="seller_id"
                name="seller_id"
                value={formData.seller_id}
                onChange={(e) => handleSelectChange("seller_id", e.target.value)}
                className={`w-full border rounded p-2 text-sm ${
                  formErrors.seller_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un vendeur</option>
                {sellers.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {formErrors.seller_id && (
                <p className="text-red-500 text-xs mt-1">{formErrors.seller_id}</p>
              )}
            </div>
            <div>
              <Label htmlFor="assistant_id" className="text-sm font-medium">Assistant</Label>
              <select
                id="assistant_id"
                name="assistant_id"
                value={formData.assistant_id || "none"}
                onChange={(e) => handleSelectChange("assistant_id", e.target.value)}
                className="w-full border rounded p-2 text-sm border-gray-300"
                disabled={loading}
              >
                <option value="none">Aucun</option>
                {assistants.map((employee) => (
                  <option key={employee.cin} value={employee.cin}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full text-sm ${
                  formErrors.date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zone" className="text-sm font-medium">Zone</Label>
              <Input
                id="zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className={`w-full text-sm ${
                  formErrors.zone ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {formErrors.zone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.zone}</p>
              )}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Produits</h3>
            {formErrors.products && (
              <p className="text-red-500 text-sm">{formErrors.products}</p>
            )}
            {formData.tripProducts.map((product, index) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <div>
                  <Label className="text-sm font-medium">Produit</Label>
                  <select
                    value={product.product_id}
                    onChange={(e) => handleProductChange(index, "product_id", e.target.value)}
                    className={`w-full border rounded p-2 text-sm ${
                      formErrors[`product_${index}_product_id`] ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  >
                    <option value="">Sélectionnez un produit</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.designation}
                      </option>
                    ))}
                  </select>
                  {formErrors[`product_${index}_product_id`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`product_${index}_product_id`]}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Qté Sortie</Label>
                    <Input
                      type="number"
                      value={product.qttOut}
                      onChange={(e) => handleProductChange(index, "qttOut", e.target.value)}
                      min="0"
                      className={`text-sm ${
                        formErrors[`product_${index}_qttOut`] ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                    {formErrors[`product_${index}_qttOut`] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[`product_${index}_qttOut`]}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Qté Unité Sortie</Label>
                    <Input
                      type="number"
                      value={product.qttOutUnite}
                      onChange={(e) => handleProductChange(index, "qttOutUnite", e.target.value)}
                      min="0"
                      className="text-sm"
                      disabled={loading}
                    />
                    {formErrors[`product_${index}_qttOutUnite`] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[`product_${index}_qttOutUnite`]}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addProduct}
              disabled={loading || products.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Produit
            </Button>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Boîtes</h3>
            {formErrors.boxes && (
              <p className="text-red-500 text-sm">{formErrors.boxes}</p>
            )}
            {formData.tripBoxes.map((box, index) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <div>
                  <Label className="text-sm font-medium">Boîte</Label>
                  <select
                    value={box.box_id}
                    onChange={(e) => handleBoxChange(index, "box_id", e.target.value)}
                    className={`w-full border rounded p-2 text-sm ${
                      formErrors[`box_${index}_box_id`] ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  >
                    <option value="">Sélectionnez une boîte</option>
                    {boxes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.designation}
                      </option>
                    ))}
                  </select>
                  {formErrors[`box_${index}_box_id`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`box_${index}_box_id`]}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Qté Sortie</Label>
                  <Input
                    type="number"
                    value={box.qttOut}
                    onChange={(e) => handleBoxChange(index, "qttOut", e.target.value)}
                    min="0"
                    className={`text-sm ${
                      formErrors[`box_${index}_qttOut`] ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  />
                  {formErrors[`box_${index}_qttOut`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`box_${index}_qttOut`]}</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBox(index)}
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addBox}
              disabled={loading || boxes.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Boîte
            </Button>
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-3 text-sm">
            <h3 className="text-base font-semibold">Révision de la Tournée</h3>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Camion:</strong></p>
              <p>{formData.truck_matricule || "N/A"}</p>
              <p><strong>Conducteur:</strong></p>
              <p>{employees.find(emp => emp.cin === formData.driver_id)?.name || "N/A"}</p>
              <p><strong>Vendeur:</strong></p>
              <p>{employees.find(emp => emp.cin === formData.seller_id)?.name || "N/A"}</p>
              <p><strong>Assistant:</strong></p>
              <p>{employees.find(emp => emp.cin === formData.assistant_id)?.name || "N/A"}</p>
              <p><strong>Date:</strong></p>
              <p>{new Date(formData.date).toLocaleDateString()}</p>
              <p><strong>Zone:</strong></p>
              <p>{formData.zone}</p>
            </div>
            {formData.tripProducts && formData.tripProducts.length > 0 && (
              <div className="mt-2">
                <h4 className="text-md font-medium">Produits:</h4>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Caisses</th>
                      <th className="text-left p-1">Qté Unités</th>
                      <th className="text-left p-1">Prix Unitaire</th>
                      <th className="text-left p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.tripProducts.map((product, index) => {
                      const productData = products.find(p => p.id === parseInt(product.product_id));
                      if (productData && productData.priceUnite) {
                        const capacityByBox = productData.capacityByBox || 0;
                        const totalUnits = product.qttOut * capacityByBox + (product.qttOutUnite || 0);
                        const itemTotal = totalUnits * productData.priceUnite;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-1">{productData.designation || "N/A"}</td>
                            <td className="p-1">{product.qttOut}</td>
                            <td className="p-1">{product.qttOutUnite || 0}</td>
                            <td className="p-1">{productData.priceUnite} MAD</td>
                            <td className="p-1">{itemTotal} MAD</td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {formData.tripBoxes && formData.tripBoxes.length > 0 && (
              <div className="mt-2">
                <h4 className="text-md font-medium">Boîtes:</h4>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Désignation</th>
                      <th className="text-left p-1">Qté Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.tripBoxes.map((box, index) => {
                      const boxData = boxes.find(b => b.id === parseInt(box.box_id));
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-1">{boxData?.designation || "N/A"}</td>
                          <td className="p-1">{box.qttOut}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-2">
              <p className="text-md font-medium">
                Montant Total: <span className="font-bold">{calculateTotalAmount()} MAD</span>
              </p>
            </div>
            <div className="mt-2">
              <PrintInvoice
                formData={formData}
                products={products}
                boxes={boxes}
                employees={employees}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4 gap-2">
          <Button
            variant="outline"
            onClick={cancel}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          {activeStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={loading}
              className="flex-1"
            >
              Précédent
            </Button>
          )}
          {activeStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={loading}
              className="flex-1"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white"
            >
              {loading ? "Démarrage..." : "Confirmer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartTripForm;
