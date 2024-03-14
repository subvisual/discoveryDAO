import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "../web-app/wagmi.generated.ts",
  plugins: [
    foundry({
      project: "./",
      exclude: ["MockERC20.sol"],
      deployments: {
        Project: {
          31337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        },
      },
    }),
    react(),
  ],
});
