import { ProjectsTable } from './_ui/components/projects-table';

export default function Home() {
  return (
    <div>
      <h3 className="mb-4">Featured Projects</h3>
      <p className="mb-20">
        A Polkadot-native token launch platform, by and for the community
      </p>
      <ProjectsTable />
    </div>
  );
}
