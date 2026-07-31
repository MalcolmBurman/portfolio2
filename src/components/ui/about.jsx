import Container from "./container";

export default function About() {
  return (
    <Container className="pb-300  min-h-screen">
      <div
        id="about"
        className="hero-text-large font-mono text-5xl lg:text-7xl pt-[12vh]"
      >
        <span className="font-mono text-sm text-emerald-700">
          60.6747° N, 17.1417° E
        </span>
        <p>Malcolm</p>
        <p className="text-emerald-700">Burman</p>
      </div>
      <div className="hero-text-small text-lg pt-7">
        <p>
          I build maps, tools and data-driven solutions <br></br> that help us
          understand places, solve problems <br></br> and make better decisions.
        </p>
      </div>
    </Container>
  );
}
