import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      env: env.nodeEnv,
    },
    `🚀 API server started on http://localhost:${env.port}`
  );
  logger.info(`📚 Swagger docs available at http://localhost:${env.port}/api-docs`);
});
