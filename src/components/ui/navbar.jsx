import Container from "./container";

export default function Navbar() {
  return (
    <Container>
      <nav className="navbar pt-4">
        <div className="navbar-logo  text-2xl">
          <a href="#"></a>
          <p>Malcolm Burman</p>
          <p className=" text-base text-emerald-700">
            GIS & Software developer
          </p>
        </div>
      </nav>
    </Container>
  );
}
