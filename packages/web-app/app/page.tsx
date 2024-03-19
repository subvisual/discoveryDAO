import { ProjectsTable } from './_ui/components/projects-table';

export default function Home() {
  return (
    <div>
      <h1 className="mx-6 mb-1 md:mx-0 md:mb-4">Featured Projects</h1>
      <p className="mx-6 mb-14 md:mx-0 md:mb-20">
        A Polkadot-native token launch platform, by and for the community
      </p>
      <ProjectsTable />
    </div>
  );
}
