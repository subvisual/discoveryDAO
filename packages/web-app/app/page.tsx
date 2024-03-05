import { Providers } from '@/app/_providers';
import { Footer, Info, Topbar, Button } from './_ui/components';

export default function Home() {
  return (
    <div>
      <Providers>
        <Topbar />
        <div className="bg-slate-200 bg-background-pattern-overlay bg-cover py-20">
          <main className="px-31 gap-x-17 mx-auto grid max-w-7xl grid-cols-1 gap-y-9 lg:grid-cols-2">
            <div className="max-w-2xl max-w-prose">
              <h3>Citizend Communiy Sale</h3>
              <p className="pt-2">
                A Polkadot-native token launch platform, by and for the
                community
              </p>
              <div className="mb-9 mt-12 border-t border-grey" />
              <p>
                Citizend brings top projects and contributors together to
                equitably catalyze growth in the Polkadot ecosystem. Get pitched
                by pre-screened projects before they list their tokens and
                vote—one vote per member—for the most promising one.
              </p>
              <br />
              <p>
                No matter if you have $2M $CTND tokens or $200 you get an equal
                vote in what projects launch. Have your voice heard and rally
                community support for projects you love.
              </p>
              <br />
              <p>
                If you vote for winning projects, you get an early stake in the
                project. Setting the standard for a more fair, safe, and
                transparent contribution.
              </p>
              <br />
              <p>
                Citizend is a Polkadot-native token launch platform backed by a
                status-free community that leads the curation of projects to
                ensure fairness, transparency, and true project value.
              </p>
              <br />
              <p>
                Citizend offers projects access to community support as well as
                liquidity, setting token-launching projects up for success
                within the Polkadot ecosystem.
              </p>
            </div>
            <div>
              <Info />
            </div>
          </main>
        </div>
      </Providers>
      <Footer />
    </div>
  );
}
