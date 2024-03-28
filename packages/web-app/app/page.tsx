import { ProjectsTable } from './_ui/components/projects-table';

export default function Home() {
  return (
    <div>
      <h1 className="mx-6 mb-1 md:mx-0 md:mb-4">Featured Projects</h1>
      <p className="mx-6 mb-14 text-white md:mx-0 md:mb-20">
        The community-curated token launch platform of web3.
      </p>
      <ProjectsTable />
    </div>
  );
}
