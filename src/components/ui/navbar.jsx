import Container from "./container";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 ">
      <Container className=" pt-7 absolute inset-0 h-40 bg-gradient-to-b from-[#fffff3] via-[#fffff3]/95 to-transparent -z-10">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-xl font-bold">MALCOLM BURMAN</h1>
            <p className="text-base text-emerald-700">
              GIS & SOFTWARE DEVELOPER
            </p>
          </div>

          <div className="flex items-center gap-15 text-lg pointer-events-auto">
            <a
              href="#projects"
              className="hover:text-emerald-600 transition-colors"
            >
              Projects
            </a>
            <a
              href="#about"
              className="hover:text-emerald-600 transition-colors"
            >
              About
            </a>
            <a
              href="#hobbies"
              className="hover:text-emerald-600 transition-colors"
            >
              Hobbies
            </a>
            <a
              href="#contact"
              className="hover:text-emerald-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </Container>
    </nav>
  );
}
