import Container from "./container.jsx";

export default function Projects() {
  return (
    <Container className="pb-300  min-h-screen">
      <div
        id="projects"
        className="hero-text-large font-mono text-5xl lg:text-7xl pt-[12vh]"
      >
        <p>Projects</p>
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
