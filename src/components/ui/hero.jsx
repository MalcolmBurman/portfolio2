import Container from "./container";
import HeroScene from "../../scenes/heroScene.jsx";
import { Button } from "./button";
import { MapPin, CodeXml, Globe, Layers, Leaf, FolderGit2 } from "lucide-react";
import TypeWriter from "../kokonutui/type-writer.jsx";

export default function Hero() {
  return (
    <Container className="pointer-events-none relative h-full min-h-screen overflow-hidden">
      {/* className="py-16 md:py-24" */}
      <div id="home" className="hero-text lg:px-5 pt-35 lg:pt-[25vh] ">
        <div className="hero-text-large  font-mono text-5xl lg:text-7xl ">
          <p>
            Turning Spatial <br></br> Data Into
          </p>
          <div className="w-full text-left">
            <TypeWriter
              sequences={[
                { text: "Real-World Impact.", deleteAfter: true },
                { text: "Interactive Maps.", deleteAfter: true },
                { text: "Geospatial Intelligence.", deleteAfter: true },
                { text: "Smarter Decisions.", deleteAfter: true },
                { text: "An Earth Sandwich?", deleteAfter: true },
                { text: "Digital Landscapes.", deleteAfter: true },
                { text: "Environmental Insights.", deleteAfter: true },
                { text: "3D Experiences.", deleteAfter: true },
                { text: "Insights From Above.", deleteAfter: true },
                { text: "Something New.", deleteAfter: true },
              ]}
              typingSpeed={60}
              loopDelay={0}
            />
          </div>
        </div>
        <div className="hero-text-small text-lg pt-7">
          <p>
            I build maps, tools and data-driven solutions <br></br> that help us
            understand places, solve problems <br></br> and make better
            decisions.
          </p>
        </div>

        <div className="pt-7 pointer-events-auto w-fit">
          <Button
            variant="default"
            className="px-4 py-6 bg-linear-[150deg] from-emerald-700 to-emerald-500 hover:to-emerald-600  mr-3 sm:mb-3"
          >
            <a className="flex" href="#projects">
              <MapPin className="size-6" />
              <p className="text-base px-2">EXPLORE PROJECTS</p>
            </a>
          </Button>
          <Button
            variant="outline"
            className="px-4 py-6  border-2 border-emerald-700"
          >
            <FolderGit2 className="size-6 text-emerald-700" />
            <p className="text-base text-emerald-700 px-2">VIEW MY CODE</p>
          </Button>
        </div>

        <div className=" pt-[5vh] lg:pt-25 grid lg:flex grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-15">
          <div className="max-w-xs">
            <Globe
              strokeWidth={1}
              className="size-15 lg:size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold text-lg">GEOSPATIAL ANALYSIS</p>
            <p className="text-stone-600">
              Working with spatial data, <br></br> remote sensing and <br></br>
              geoprocessing to solve <br></br> real-world problems
            </p>
          </div>
          <div className="max-w-xs">
            <Layers
              strokeWidth={1}
              className="size-15 lg:size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold text-lg">MAPS & VISUALIZATION</p>
            <p className="text-stone-600">
              Creating interactive maps <br></br> and visual experiences
              <br></br> that make complex data <br></br> easy to understand
            </p>
          </div>
          <div className="max-w-xs">
            <CodeXml
              strokeWidth={1}
              className="size-15 lg:size-20 text-emerald-700 mb-2"
            />
            <p className="font-bold text-lg">SOFTWARE DEVELOPMENT</p>
            <p className="text-stone-600">
              Building web applications, <br></br> geospatial tools and
              <br></br> workflows that improve <br></br> efficiency and insight.
            </p>
          </div>
          <div className="max-w-xs">
            <Leaf
              strokeWidth={1}
              className="size-15 lg:size-20 text-emerald-700 mb-2 "
            />
            <p className="font-bold text-lg">SUSTAINABLE FUTURE</p>
            <p className="text-stone-600 ">
              Using geospatial insights <br></br> to support sustainable
              <br></br> planning and informed <br></br> decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:absolute inset-0 -z-10 overflow-auto">
        <HeroScene />
      </div>
    </Container>
  );
}
