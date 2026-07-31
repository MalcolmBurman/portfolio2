import { useState } from "react";
import { Menu, X } from "lucide-react";
import Container from "./container";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#hobbies", label: "Hobbies" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50">
      <Container className="pt-7 absolute inset-0 h-40 bg-gradient-to-b from-[#fffff3] via-[#fffff3]/95 to-transparent -z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">MALCOLM BURMAN</h1>
            <p className="text-base text-emerald-700">
              GIS & SOFTWARE DEVELOPER
            </p>
          </div>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-15 text-lg pointer-events-auto">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="hover:text-emerald-600 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* mobile toggle */}
          <button
            className="md:hidden pointer-events-auto"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </Container>

      {/* mobile menu panel */}
      {isOpen && (
        <div className="md:hidden pointer-events-auto bg-[#fffff3] border-b border-emerald-100">
          <Container className="flex flex-col gap-1 py-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-1"
              >
                <X className="mt-5 ml-10" size={28} />
              </button>
            </div>

            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="py-2 text-lg hover:text-emerald-600 transition-colors"
              >
                {label}
              </a>
            ))}
          </Container>
        </div>
      )}
    </nav>
  );
}
