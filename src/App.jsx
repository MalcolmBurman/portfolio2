import { useState } from "react";
import "./App.css";
import Navbar from "./components/ui/navbar";
import Hero from "./components/ui/hero";
import About from "./components/ui/about";
import Projects from "./components/ui/projects";
import SdrSection from "./components/ui/sdrSection";
import Skills from "./components/ui/skills";
import Certificates from "./components/ui/certificates";
import Contact from "./components/ui/contact";
import Footer from "./components/ui/footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <SdrSection />
      <Certificates />
      <Contact />
      <Footer />
    </>
  );
}

export default App;
