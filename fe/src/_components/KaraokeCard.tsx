import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Star } from "lucide-react";

export const KaraokeCard = () => {
  return (
    <div>
      <Card className="p-0 w-120 h-100">
        <img
          src={"./karaoke.jpg"}
          alt="Karaoke"
          className="w-full h-60 object-cover rounded-t-lg"
        />

        <CardContent className="flex flex-col gap-3">
          <CardTitle className="text-[#c51383] font-bold text-[20px]">
            Karaoke Name
          </CardTitle>
          <p className="flex gap-2 items-center text-black text-sm">
            {" "}
            <MapPin /> Karaoke location
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between ">
          <p className="flex gap-2 items-center text-black">
            <Star /> 4.5/10
          </p>
          <Button variant={"ghost"} className="text-white bg-[#c51383] ">
            Захиалах <ArrowRight />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
