import Navbar from "@/_components/navbar"
import { CarouselSec } from "@/_components/CarouselSec";
import { KaraokeSection } from "@/_components/KaraokeSection";


export default function Page() {
return (
<main>
<Navbar />
<CarouselSec />
<div className="p-6">
Home page
</div>
<KaraokeSection/>
</main>
)
};