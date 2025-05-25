"use client";
import { useCamion } from "@/store/camionStore";
import { Edit, Trash, Truck } from "lucide-react";
import React, { useEffect } from "react";

const ListeDesCamions = () => {
  const fetchAllCamions = useCamion((state) => state.fetchAllCamions);
  const camions = useCamion((state) => state.camionState.camions);


  useEffect(() => {
    fetchAllCamions();
  }, [camions.length]);

  return (
    <main className="flex flex-wrap gap-10 items-center">
      {camions.map((camion) => {
        return (
          <div className="w-52 p-5 flex items-center gap-2 bg-gray-100 rounded transition-all ease-in delay-75 border border-gray-300 hover:bg-gray-200 hover:border-black">
            <div className="w-15 h-15 flex items-center justify-center bg-gray-300 rounded-full">
              <Truck className="text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{camion.matricule}</h3>
              <button>
                <Trash className="w-5 h-5" />
              </button>
              <button>
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </main>
  );
};

export default ListeDesCamions;
