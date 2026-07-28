import Container from "./container";
import { Button } from "./button";
import { MapPin } from "lucide-react";
import { CodeXml } from "lucide-react";
import { Globe } from "lucide-react";
import { Layers } from "lucide-react";
import { PencilRuler } from "lucide-react";
import { Leaf } from "lucide-react";

export default function Hero() {
  return (
    <Container>
      {/* className="py-16 md:py-24" */}
      <div className="px-5 pt-30">
        <div className="hero-text-large text-6xl font-bold">
          <p>
            Turning Spatial <br></br> Data Into
          </p>
          <p className="text-emerald-700">Real-World Impact.</p>
        </div>
        <div className="hero-text-small text-lg pt-5">
          <p>
            I build maps, tools and data-driven solutions <br></br> that help us
            understand places, solve problems <br></br> and make better
            decisions.
          </p>
        </div>

        <div className="pt-5">
          <Button
            variant="default"
            className="px-4 py-6 bg-emerald-700 hover:bg-emerald-600 mr-3"
          >
            <MapPin className="size-6" />
            <p className="text-base px-2">EXPLORE PROJECTS</p>
          </Button>
          <Button
            variant="outline"
            className="px-4 py-6  border-2 border-emerald-700"
          >
            <CodeXml className="size-6 text-emerald-700" />
            <p className="text-base text-emerald-700 px-2">VIEW MY CODE</p>
          </Button>
        </div>

        <div className=" pt-10 flex flex-row gap-15">
          <div className="max-w-xs">
            <Globe
              strokeWidth={1.3}
              className="size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold">GEOSPATIAL ANALYSIS</p>
            <p className="text-sm">
              Working with spatial data, <br></br> remote sensing and <br></br>
              geoprocessing to solve <br></br> real-world problems
            </p>
          </div>
          <div className="max-w-xs">
            <Layers
              strokeWidth={1.3}
              className="size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold">MAPS & VISUALIZATION</p>
            <p className="text-sm">
              Creating interactive maps <br></br> and visual experiences
              <br></br> that make complex data <br></br> easy to understand
            </p>
          </div>
          <div className="max-w-xs">
            <PencilRuler
              strokeWidth={1.3}
              className="size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold">SOFTWARE DEVELOPMENT</p>
            <p className="text-sm">
              Building web applications, <br></br> geospatial tools and
              <br></br> workflows that improve <br></br> efficiency and insight.
            </p>
          </div>
          <div className="max-w-xs">
            <Leaf strokeWidth={1.3} className="size-20 text-emerald-700 mb-2" />
            <p className="font-bold">SUSTAINABLE FUTURE</p>
            <p className="text-sm">
              Using geospatial insights <br></br> to support sustainable
              <br></br> planning and informed <br></br> decisions.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
